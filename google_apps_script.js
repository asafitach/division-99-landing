/**
 * Division 99 Recruitment Management Backend (Google Apps Script)
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Click "Extensions" -> "Apps Script".
 * 3. Delete any default code and paste this script.
 * 4. Change the ADMIN_PASSWORD value below to your preferred password.
 * 5. Click "Deploy" (top right) -> "New deployment".
 * 6. Select type: "Web app".
 * 7. Set Description: "Division 99 API".
 * 8. Set Execute as: "Me (your email)".
 * 9. Set Who has access: "Anyone".
 * 10. Click "Deploy", authorize permissions, and copy the "Web app URL".
 * 11. Paste that URL in 'app-personal.js'.
 */

// CHANGE THIS PASSWORD FOR YOUR ADMIN DASHBOARD
var ADMIN_PASSWORD = "99_admin_secure_pass"; 

// Column configuration (1-indexed for Sheets)
var COL_ID = 1;          // Column A: ID Number (תעודת זהות)
var COL_NAME = 2;        // Column B: Full Name (שם מלא)
var COL_STATUS = 3;      // Column C: Status (סטטוס)
var COL_STEP = 4;        // Column D: Timeline Step (שלב בציר הזמן 1-7)
var COL_COMMENTS = 5;    // Column E: Admin Comments (הערות מנהל)
var COL_LAST_UPDATED = 6; // Column F: Last Updated (עדכון אחרון)
var COL_PHONE = 7;       // Column G: Phone (טלפון)
var COL_PERSONAL_STATUS = 8; // Column H: Personal Status (סטטוס אישי)

// Handle GET requests (Public candidate status lookup)
function doGet(e) {
  var idParam = e.parameter.id;
  
  if (!idParam) {
    return createJsonResponse({ success: false, error: "Missing ID parameter" });
  }
  
  // Clean ID (keep only digits)
  var cleanId = idParam.toString().replace(/\D/g, '');
  if (cleanId.length === 0) {
    return createJsonResponse({ success: false, error: "Invalid ID format" });
  }
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  // Skip header row
  for (var i = 1; i < data.length; i++) {
    var sheetId = data[i][COL_ID - 1].toString().replace(/\D/g, '');
    if (sheetId === cleanId) {
      // Return status, step, and personal status (COL_PERSONAL_STATUS) for candidate privacy
      return createJsonResponse({
        success: true,
        status: data[i][COL_STATUS - 1] || "נרשם במערכת",
        step: parseInt(data[i][COL_STEP - 1]) || 1,
        personalStatus: data[i][COL_PERSONAL_STATUS - 1] || ""
      });
    }
  }
  
  return createJsonResponse({ success: false, error: "ID not found" });
}

// Handle POST requests (Authorized Admin Operations)
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var password = payload.password;
    var action = payload.action;
    
    // Authenticate password
    if (password !== ADMIN_PASSWORD) {
      return createJsonResponse({ success: false, error: "Unauthorized: Invalid password" });
    }
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Action 1: Admin Login Verification
    if (action === "login") {
      return createJsonResponse({ success: true, message: "Authenticated successfully" });
    }
    
    // Action 2: Get entire candidate roster
    if (action === "get_all") {
      var data = sheet.getDataRange().getValues();
      var roster = [];
      
      // Skip header row
      for (var i = 1; i < data.length; i++) {
        roster.push({
          id: data[i][COL_ID - 1],
          name: data[i][COL_NAME - 1],
          status: data[i][COL_STATUS - 1],
          step: parseInt(data[i][COL_STEP - 1]) || 1,
          comments: data[i][COL_COMMENTS - 1] || "",
          lastUpdated: data[i][COL_LAST_UPDATED - 1] ? formatDate(data[i][COL_LAST_UPDATED - 1]) : "",
          phone: data[i][COL_PHONE - 1] || "",
          personalStatus: data[i][COL_PERSONAL_STATUS - 1] || ""
        });
      }
      return createJsonResponse({ success: true, roster: roster });
    }
    
    // Action 3: Add or update candidate record
    if (action === "update") {
      var id = payload.id ? payload.id.toString().replace(/\D/g, '') : "";
      var name = payload.name || "";
      var status = payload.status || "נרשם ראשונית";
      var step = parseInt(payload.step) || 1;
      var comments = payload.comments || "";
      var phone = payload.phone || "";
      var personalStatus = payload.personalStatus || "";
      
      if (!id || id.length !== 9) {
        return createJsonResponse({ success: false, error: "Invalid ID: Must be exactly 9 digits" });
      }
      
      var data = sheet.getDataRange().getValues();
      var foundRowIndex = -1;
      
      // Check if candidate already exists
      for (var i = 1; i < data.length; i++) {
        var sheetId = data[i][COL_ID - 1].toString().replace(/\D/g, '');
        if (sheetId === id) {
          foundRowIndex = i + 1; // 1-indexed row number
          break;
        }
      }
      
      var nowString = formatDate(new Date());
      
      if (foundRowIndex !== -1) {
        // Update existing row
        sheet.getRange(foundRowIndex, COL_NAME).setValue(name);
        sheet.getRange(foundRowIndex, COL_STATUS).setValue(status);
        sheet.getRange(foundRowIndex, COL_STEP).setValue(step);
        sheet.getRange(foundRowIndex, COL_COMMENTS).setValue(comments);
        sheet.getRange(foundRowIndex, COL_LAST_UPDATED).setValue(nowString);
        
        // Ensure columns G and H exist
        var maxCols = sheet.getLastColumn();
        if (maxCols < COL_PERSONAL_STATUS) {
          sheet.insertColumnsAfter(maxCols, COL_PERSONAL_STATUS - maxCols);
        }
        
        sheet.getRange(foundRowIndex, COL_PHONE).setValue(phone);
        sheet.getRange(foundRowIndex, COL_PERSONAL_STATUS).setValue(personalStatus);
        
        return createJsonResponse({ success: true, message: "Record updated successfully" });
      } else {
        // Check if headers exist, if sheet is empty write headers first
        if (data.length === 0 || (data.length === 1 && data[0][0] === "")) {
          sheet.appendRow(["תעודת זהות", "שם מלא", "סטטוס גיוס", "שלב בציר הזמן (1-7)", "הערות מנהל", "עדכון אחרון", "טלפון", "סטטוס אישי"]);
        }
        // Append new row
        sheet.appendRow([id, name, status, step, comments, nowString, phone, personalStatus]);
        return createJsonResponse({ success: true, message: "New candidate added successfully" });
      }
    }
    
    return createJsonResponse({ success: false, error: "Unknown action" });
    
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

// Helper: Format date as DD/MM/YYYY HH:mm
function formatDate(dateVal) {
  try {
    var date = new Date(dateVal);
    if (isNaN(date.getTime())) return dateVal.toString();
    
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0');
    var yyyy = date.getFullYear();
    var hh = String(date.getHours()).padStart(2, '0');
    var min = String(date.getMinutes()).padStart(2, '0');
    
    return dd + '/' + mm + '/' + yyyy + ' ' + hh + ':' + min;
  } catch (e) {
    return dateVal.toString();
  }
}

// Helper: Create JSON HTTP Response (handles CORS)
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
