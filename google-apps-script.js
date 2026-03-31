// Google Apps Script - Paste this in Extensions > Apps Script
// Deploy as Web App: Execute as Me, Anyone can access

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Add header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Email', 'Timestamp', 'Source']);
    }

    const email = e.parameter.email || '';
    const source = e.parameter.source || 'Landing Page';
    const timestamp = e.parameter.timestamp || new Date().toISOString();

    if (email) {
      sheet.appendRow([email, timestamp, source]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, email: email }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  return doGet(e);
}
