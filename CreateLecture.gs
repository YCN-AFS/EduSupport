function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Lecture-management');
    
    if (e.parameter.action === 'addLecture') {
      const lastRow = sheet.getLastRow() + 1;
      
      // Thêm dữ liệu mới vào sheet
      sheet.getRange(lastRow, 1).setValue(e.parameter.id);
      sheet.getRange(lastRow, 2).setValue(e.parameter.name);
      sheet.getRange(lastRow, 3).setValue(e.parameter.content);
      sheet.getRange(lastRow, 4).setValue(''); // QR code để trống
      
      // Trả về trang HTML với script
      return HtmlService.createHtmlOutput(
        '<script>window.top.location.reload();</script>'
      );
    }
    
  } catch (error) {
    return HtmlService.createHtmlOutput(
      `<script>alert("Error: ${error.toString()}"); window.top.location.reload();</script>`
    );
  }
} 