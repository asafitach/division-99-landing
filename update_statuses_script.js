/**
 * Updates candidate statuses in the database sheet by matching ID numbers.
 *
 * @param {string[]} idList - Array of Israeli ID numbers (Teudat Zehut) to update.
 * @param {string} newStatus - The new status string to apply to matching candidates.
 * @returns {string[]} Array of IDs that were NOT found in the database.
 *
 * Example usage:
 *   var notFound = updateCandidateStatuses(["123456789", "987654321"], "עבר שלב ב'");
 *   Logger.log("IDs not found: " + notFound);
 */

// ==================== CONFIGURATION ====================
var DB_SHEET_NAME = "DB";      // Name of the database sheet tab
var ID_COLUMN = 2;              // Column B = 2 (contains Teudat Zehut)
var STATUS_COLUMN = 5;          // Column E = 5 (contains Status)
// =======================================================

function updateCandidateStatuses(idList, newStatus) {
  // --- Input validation ---
  if (!idList || !Array.isArray(idList) || idList.length === 0) {
    Logger.log("updateCandidateStatuses: idList is empty or invalid.");
    return [];
  }
  if (newStatus === undefined || newStatus === null) {
    Logger.log("updateCandidateStatuses: newStatus is missing.");
    return idList; // Nothing to update, return all as "not processed"
  }

  // --- Open the database sheet ---
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(DB_SHEET_NAME);
  if (!sheet) {
    throw new Error("Sheet '" + DB_SHEET_NAME + "' not found in the spreadsheet.");
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    // Sheet has only a header row or is empty — all IDs are "not found"
    Logger.log("updateCandidateStatuses: Sheet is empty (no data rows).");
    return idList.slice(); // Return a copy of the full list
  }

  // --- Read all data into memory for performance ---
  // Read the ID column (B) — from row 2 (skip header) to lastRow
  var dataRows = lastRow - 1; // Number of data rows (excluding header)
  var idRange = sheet.getRange(2, ID_COLUMN, dataRows, 1);
  var idValues = idRange.getValues(); // 2D array: [[id1], [id2], ...]

  // Read the Status column (E) — same range
  var statusRange = sheet.getRange(2, STATUS_COLUMN, dataRows, 1);
  var statusValues = statusRange.getValues(); // 2D array: [[status1], [status2], ...]

  // --- Build a lookup map: cleaned ID -> row index (0-based within data) ---
  // This gives O(1) lookups instead of O(n) per ID
  var idToRowIndex = {};
  for (var i = 0; i < idValues.length; i++) {
    var cleanedSheetId = String(idValues[i][0]).replace(/\D/g, "").trim();
    if (cleanedSheetId.length > 0) {
      // If duplicate IDs exist, the last occurrence wins (unlikely but safe)
      idToRowIndex[cleanedSheetId] = i;
    }
  }

  // --- Process each ID in the input list ---
  var notFoundIds = [];
  var updatedCount = 0;

  for (var j = 0; j < idList.length; j++) {
    var inputId = String(idList[j]).replace(/\D/g, "").trim();

    if (inputId.length === 0) {
      // Skip empty/invalid entries
      continue;
    }

    if (idToRowIndex.hasOwnProperty(inputId)) {
      // Found — update the status in the in-memory array
      var rowIndex = idToRowIndex[inputId];
      statusValues[rowIndex][0] = newStatus;
      updatedCount++;
    } else {
      // Not found — track it
      notFoundIds.push(idList[j]); // Return the original (uncleaned) value
    }
  }

  // --- Batch write the updated status column back to the sheet ---
  if (updatedCount > 0) {
    statusRange.setValues(statusValues);
    SpreadsheetApp.flush(); // Force the write to complete
  }

  Logger.log(
    "updateCandidateStatuses complete: " +
    updatedCount + " updated, " +
    notFoundIds.length + " not found."
  );

  return notFoundIds;
}

// ==================== TEST FUNCTION ====================
/**
 * Run this manually from the Apps Script editor to test.
 * Modify the test IDs to match real data in your sheet.
 */
function testUpdateStatuses() {
  var testIds = ["123456789", "987654321", "111111111"];
  var testStatus = "עבר שלב ב'";

  var missing = updateCandidateStatuses(testIds, testStatus);

  Logger.log("=== Test Results ===");
  Logger.log("IDs not found in DB: " + JSON.stringify(missing));
  Logger.log("====================");
}
