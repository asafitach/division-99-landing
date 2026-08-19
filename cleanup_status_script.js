/**
 * Division 99 — STATUS Sheet Deduplication Script
 *
 * The "STATUS" sheet has columns where each column represents a stage in the
 * recruitment process. Column A is the most advanced stage (end of process),
 * and columns to the right are earlier stages.
 *
 * Row 1 = Header (status/stage name)
 * Row 2+ = IDs of candidates in that stage
 *
 * This script ensures each ID appears only ONCE, in the most advanced column
 * (leftmost) it was found in. Duplicates in less advanced columns (to the right)
 * are removed.
 *
 * Setup:
 *   1. Open the target Google Sheet ("Division 99 Recruitment Database").
 *   2. Click "Extensions" -> "Apps Script".
 *   3. Create a new script file (click + -> Script) and paste this code.
 *   4. To run manually: select "cleanupStatusDuplicates" and click Run.
 *   5. To run daily: select "setupDailyTrigger" and click Run (once).
 */

// ==================== CONFIGURATION ====================
var STATUS_SHEET_NAME = "STATUS"; // Name of the status sheet tab
// =======================================================

/**
 * Main function: Removes duplicate IDs across columns in the STATUS sheet.
 *
 * For each column (left to right), every ID found in that column is removed
 * from ALL columns to the right. This guarantees each ID only appears under
 * its most advanced (leftmost) status.
 *
 * After cleanup, columns are compacted — empty gaps are removed and values
 * shift up to fill them.
 */
function cleanupStatusDuplicates() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(STATUS_SHEET_NAME);

  if (!sheet) {
    Logger.log("ERROR: Sheet '" + STATUS_SHEET_NAME + "' not found.");
    return;
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  if (lastRow < 2 || lastCol < 2) {
    Logger.log("Nothing to clean — sheet has less than 2 data rows or columns.");
    return;
  }

  // --- Read all data into memory (row 1 = headers, row 2+ = IDs) ---
  var allData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = allData[0]; // Row 1: status names

  // Build an array of columns, each containing its list of IDs (strings, cleaned)
  // columns[colIndex] = array of { original: rawValue, cleaned: digitsOnly }
  var columns = [];
  for (var c = 0; c < lastCol; c++) {
    var colIds = [];
    for (var r = 1; r < allData.length; r++) { // Skip header row
      var raw = allData[r][c];
      if (raw !== null && raw !== "") {
        var cleaned = String(raw).replace(/\D/g, "").trim();
        if (cleaned.length > 0) {
          colIds.push({ original: raw, cleaned: cleaned });
        }
      }
    }
    columns.push(colIds);
  }

  // --- Deduplicate: for each column, remove its IDs from all columns to the right ---
  var totalRemoved = 0;

  for (var c = 0; c < columns.length - 1; c++) {
    // Build a Set of cleaned IDs in the current column for fast lookup
    var currentIds = {};
    for (var i = 0; i < columns[c].length; i++) {
      currentIds[columns[c][i].cleaned] = true;
    }

    // Scan all columns to the right and remove matches
    for (var r = c + 1; r < columns.length; r++) {
      var filtered = [];
      for (var j = 0; j < columns[r].length; j++) {
        if (currentIds[columns[r][j].cleaned]) {
          // This ID exists in a more advanced column — remove it
          totalRemoved++;
          Logger.log(
            "Removed ID " + columns[r][j].original +
            " from column '" + headers[r] +
            "' (already in '" + headers[c] + "')"
          );
        } else {
          filtered.push(columns[r][j]);
        }
      }
      columns[r] = filtered;
    }
  }

  if (totalRemoved === 0) {
    Logger.log("No duplicates found — STATUS sheet is already clean.");
    return;
  }

  // --- Write cleaned data back to the sheet ---
  // Clear all data below the header row
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
  }

  // Write each column's remaining IDs back (compacted, no gaps)
  for (var c = 0; c < columns.length; c++) {
    if (columns[c].length > 0) {
      var writeValues = [];
      for (var i = 0; i < columns[c].length; i++) {
        writeValues.push([columns[c][i].original]);
      }
      sheet.getRange(2, c + 1, writeValues.length, 1).setValues(writeValues);
    }
  }

  SpreadsheetApp.flush();
  Logger.log("Cleanup complete: " + totalRemoved + " duplicate(s) removed.");
}

/**
 * Sets up a daily trigger to run cleanupStatusDuplicates automatically.
 * Run this function ONCE from the Apps Script editor.
 * It will schedule the cleanup to run every day between 2:00–3:00 AM.
 *
 * To change the time, modify the atHour() value below (0-23).
 */
function setupDailyTrigger() {
  // First, remove any existing triggers for this function to avoid duplicates
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "cleanupStatusDuplicates") {
      ScriptApp.deleteTrigger(triggers[i]);
      Logger.log("Removed existing daily trigger.");
    }
  }

  // Create a new daily trigger
  ScriptApp.newTrigger("cleanupStatusDuplicates")
    .timeBased()
    .everyDays(1)
    .atHour(2) // Runs between 2:00-3:00 AM
    .create();

  Logger.log("Daily trigger created: cleanupStatusDuplicates will run every day around 2:00 AM.");
}

/**
 * Removes the daily trigger if you no longer want it to run.
 * Run this function from the Apps Script editor.
 */
function removeDailyTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  var removed = 0;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "cleanupStatusDuplicates") {
      ScriptApp.deleteTrigger(triggers[i]);
      removed++;
    }
  }
  Logger.log("Removed " + removed + " trigger(s) for cleanupStatusDuplicates.");
}

// ==================== TEST FUNCTION ====================
/**
 * Run this manually to do a dry run — logs what WOULD be removed without
 * actually modifying the sheet.
 */
function dryRunCleanup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(STATUS_SHEET_NAME);

  if (!sheet) {
    Logger.log("ERROR: Sheet '" + STATUS_SHEET_NAME + "' not found.");
    return;
  }

  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  if (lastRow < 2 || lastCol < 2) {
    Logger.log("Nothing to clean.");
    return;
  }

  var allData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = allData[0];

  var columns = [];
  for (var c = 0; c < lastCol; c++) {
    var colIds = [];
    for (var r = 1; r < allData.length; r++) {
      var raw = allData[r][c];
      if (raw !== null && raw !== "") {
        var cleaned = String(raw).replace(/\D/g, "").trim();
        if (cleaned.length > 0) {
          colIds.push({ original: raw, cleaned: cleaned });
        }
      }
    }
    columns.push(colIds);
  }

  var totalWouldRemove = 0;

  for (var c = 0; c < columns.length - 1; c++) {
    var currentIds = {};
    for (var i = 0; i < columns[c].length; i++) {
      currentIds[columns[c][i].cleaned] = true;
    }

    for (var r = c + 1; r < columns.length; r++) {
      var filtered = [];
      for (var j = 0; j < columns[r].length; j++) {
        if (currentIds[columns[r][j].cleaned]) {
          totalWouldRemove++;
          Logger.log(
            "[DRY RUN] Would remove ID " + columns[r][j].original +
            " from column '" + headers[r] +
            "' (already in '" + headers[c] + "')"
          );
        } else {
          filtered.push(columns[r][j]);
        }
      }
      columns[r] = filtered;
    }
  }

  Logger.log("=== DRY RUN COMPLETE: " + totalWouldRemove + " duplicate(s) would be removed ===");
}
