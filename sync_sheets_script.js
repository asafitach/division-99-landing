/**
 * Google Apps Script to synchronize new rows between two Google Sheets.
 * 
 * Targets:
 * 1. Copies new row's Column E to "גליון 3" at the end of Column M.
 * 2. Copies new row's:
 *    - Column E to "גיליון1" Column A
 *    - Column C to "גיליון1" Column B
 *    - Column D to "גיליון1" Column G
 * 
 * Setup Instructions:
 * 1. Open your source Google Sheet: "אוגדה 99 - הרשמה לשלב ב' (גברים) (תגובות)".
 * 2. Click "Extensions" -> "Apps Script".
 * 3. Delete any code in the editor and paste this script.
 * 4. Replace the `TARGET_SPREADSHEET_ID` value below with the ID of your target sheet.
 *    (The ID is the long string in the URL of "Division 99 Recruitment Database": 
 *     https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID_HERE]/edit)
 * 5. Save the project (click the floppy disk icon).
 * 6. Set up the Trigger:
 *    - Click the clock icon (Triggers) on the left sidebar.
 *    - Click "+ Add Trigger" at the bottom right.
 *    - Choose which function to run: "onFormSubmitTrigger"
 *    - Choose which deployment should run: "Head"
 *    - Select event source: "From spreadsheet"
 *    - Select event type: "On form submit" (or "On change" if you manually paste rows)
 *    - Click "Save" and authorize the required permissions.
 */

// ==================== CONFIGURATION ====================
// Replace this with the actual Spreadsheet ID of "Division 99 Recruitment Database"
var TARGET_SPREADSHEET_ID = "YOUR_TARGET_SPREADSHEET_ID_HERE";
var STATUS_SHEET = "STATUS";
var DB_SHEET = "DB"; // Can be changed to "גיליון 1" if there is a space

var COL_C = 3; // Source Column C (שם/טלפון וכד')
var COL_D = 4; // Source Column D (סטטוס/שלב וכד')
var COL_E = 5; // Source Column E

var TARGET_COL_L = 12; // Column L for status sheet - new registration

var SOURCE_SHEET_NAME = "תגובות לטופס 1"; // Name of the source sheet (form responses tab)
// =======================================================

/**
 * Triggered automatically on form submission.
 */
function onFormSubmitTrigger(e) {
  try {
    var valC = "";
    var valD = "";
    var valE = "";

    if (e && e.values) {
      // e.values is a 0-indexed array containing the row values
      valC = e.values[COL_C - 1];
      valD = e.values[COL_D - 1];
      valE = e.values[COL_E - 1];
    } else {
      // Fallback: If run manually, read the last row of the source sheet
      var sourceSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SOURCE_SHEET_NAME);
      if (!sourceSheet) {
        Logger.log("Source sheet '" + SOURCE_SHEET_NAME + "' not found.");
        return;
      }
      var lastRow = sourceSheet.getLastRow();
      valC = sourceSheet.getRange(lastRow, COL_C).getValue();
      valD = sourceSheet.getRange(lastRow, COL_D).getValue();
      valE = sourceSheet.getRange(lastRow, COL_E).getValue();
    }

    syncData(valC, valD, valE);

  } catch (error) {
    Logger.log("Error in onFormSubmitTrigger: " + error.toString());
  }
}

/**
 * Triggered automatically on any structural change (like manually inserting a row).
 * To use this, create an installable trigger for "onChange" pointing to this function.
 */
function onChangeTrigger(e) {
  try {
    if (e && e.changeType === "INSERT_ROW") {
      var sourceSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SOURCE_SHEET_NAME);
      if (!sourceSheet) {
        Logger.log("Source sheet '" + SOURCE_SHEET_NAME + "' not found.");
        return;
      }
      var lastRow = sourceSheet.getLastRow();

      var valC = sourceSheet.getRange(lastRow, COL_C).getValue();
      var valD = sourceSheet.getRange(lastRow, COL_D).getValue();
      var valE = sourceSheet.getRange(lastRow, COL_E).getValue();

      syncData(valC, valD, valE);
    }
  } catch (error) {
    Logger.log("Error in onChangeTrigger: " + error.toString());
  }
}

/**
 * Directs synchronization to the target sheets.
 */
function syncData(valC, valD, valE) {
  if (TARGET_SPREADSHEET_ID === "YOUR_TARGET_SPREADSHEET_ID_HERE") {
    Logger.log("Please update TARGET_SPREADSHEET_ID with your actual Spreadsheet ID.");
    return;
  }

  // Open target spreadsheet
  var targetSpreadsheet = SpreadsheetApp.openById(TARGET_SPREADSHEET_ID);

  // 1. Copy E column to "גליון 3" at the end of M column
  if (valE) {
    copyToSheet3(targetSpreadsheet, valE);
  }

  // 2. Copy to "גיליון1": E -> A, C -> B, D -> G
  copyToSheet1(targetSpreadsheet, valC, valD, valE);
}

/**
 * Helper to copy E value to "גליון 3" Column M
 */
function copyToSheet3(targetSpreadsheet, valE) {
  var sheet3 = targetSpreadsheet.getSheetByName(STATUS_SHEET);
  if (!sheet3) {
    Logger.log("Target sheet '" + STATUS_SHEET + "' not found.");
    return;
  }

  var lastRowInM = getLastRowInColumn(sheet3, TARGET_COL_L);
  var targetRow = lastRowInM + 1;

  sheet3.getRange(targetRow, TARGET_COL_L).setValue(valE);
  Logger.log("Copied to " + STATUS_SHEET + " Column M: " + valE);
}

/**
 * Helper to copy values to "גיליון1": E -> A, C -> B, D -> G
 */
function copyToSheet1(targetSpreadsheet, valC, valD, valE) {
  var sheet1 = targetSpreadsheet.getSheetByName(DB_SHEET);
  if (!sheet1) {
    Logger.log("Target sheet '" + DB_SHEET + "' not found. Trying space: 'גיליון 1'...");
    sheet1 = targetSpreadsheet.getSheetByName("גיליון 1");
  }

  if (!sheet1) {
    Logger.log("Target sheet '" + DB_SHEET + "' or 'גיליון 1' not found.");
    return;
  }

  var nextRow = sheet1.getLastRow() + 1;

  // Column A (1) = Source Column E
  if (valE) sheet1.getRange(nextRow, 1).setValue(valE);

  // Column B (2) = Source Column C
  if (valC) sheet1.getRange(nextRow, 2).setValue(valC);

  // Column G (7) = Source Column D
  if (valD) sheet1.getRange(nextRow, 7).setValue(valD);

  Logger.log("Copied to " + sheet1.getName() + " Row " + nextRow + ": A=" + valE + ", B=" + valC + ", G=" + valD);
}

/**
 * Finds the last row containing data specifically within a given column.
 */
function getLastRowInColumn(sheet, columnNumber) {
  var lastRow = sheet.getLastRow();
  if (lastRow === 0) return 0;

  var range = sheet.getRange(1, columnNumber, lastRow, 1);
  var values = range.getValues();

  for (var i = values.length - 1; i >= 0; i--) {
    if (values[i][0] !== null && values[i][0] !== "") {
      return i + 1;
    }
  }
  return 0;
}

/**
 * Run this function manually in the Apps Script editor to test.
 */
function testSync() {
  Logger.log("Running test sync...");
  syncData("Test Value C", "Test Value D", "Test Value E");
}
