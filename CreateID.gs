function generateUniqueID() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var lastRow = sheet.getLastRow();
  
  // Nếu A2 trống, tạo ID đầu tiên
  if (lastRow < 2 || sheet.getRange("A2").getValue() === "") {
    sheet.getRange("A2").setValue("AA0001");
    return;
  }
  
  // Lấy ID cuối cùng
  var lastID = sheet.getRange(lastRow, 1).getValue();
  
  // Tách phần chữ và số
  var letters = lastID.match(/[A-Z]+/)[0];
  var numbers = parseInt(lastID.match(/\d+/)[0]);
  
  // Tăng số
  numbers++;
  
  // Nếu số vượt quá 9999, tăng chữ cái
  if (numbers > 9999) {
    numbers = 1;
    // Tăng chữ cái
    var lastChar = letters.charAt(1);
    var firstChar = letters.charAt(0);
    
    if (lastChar === 'Z') {
      firstChar = String.fromCharCode(firstChar.charCodeAt(0) + 1);
      lastChar = 'A';
    } else {
      lastChar = String.fromCharCode(lastChar.charCodeAt(0) + 1);
    }
    
    letters = firstChar + lastChar;
  }
  
  // Tạo ID mới với định dạng: AA0001
  var newID = letters + numbers.toString().padStart(4, '0');
  
  // Thêm ID mới vào dòng tiếp theo
  sheet.getRange(lastRow + 1, 1).setValue(newID);
}

// Tạo menu để chạy script
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Tạo ID')
    .addItem('Tạo ID mới', 'generateUniqueID')
    .addToUi();
}

function doPost(e) {
  // Thêm headers cho CORS - cập nhật origin cụ thể
  var headers = {
    'Access-Control-Allow-Origin': 'https://ycn-afs.github.io',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };

  // Xử lý OPTIONS request (preflight)
  if (e.method == 'OPTIONS') {
    return ContentService.createTextOutput('')
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeaders(headers);
  }

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trang tính 1');
    const data = JSON.parse(e.postData.contents);
    
    // Tạo ID mới
    const newID = generateUniqueID();
    
    // Lưu dữ liệu với ID mới
    sheet.appendRow([
      newID,           // Cột A: ID
      data.name,       // Cột B: Tên bài học
      data.content,    // Cột C: Nội dung
      data.qrcode      // Cột D: URL của QR code
    ]);
    
    // Trả về ID mới cho client với headers CORS
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      id: newID
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
  }
}