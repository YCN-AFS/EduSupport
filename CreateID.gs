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

function doGet(e) {
  return handleResponse(e);
}

function doPost(e) {
  return handleResponse(e);
}

function handleResponse(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'Access-Control-Max-Age': '3600',
    'Content-Type': 'application/json'
  };

  try {
    if (e.method === 'OPTIONS') {
      return ContentService.createTextOutput('')
        .setMimeType(ContentService.MimeType.TEXT)
        .setHeaders(headers);
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('QR-management');
    if (!sheet) {
      throw new Error('Không tìm thấy sheet "QR-management"');
    }
    
    if (e.parameter.action === 'getLatestID') {
      const lastRow = sheet.getLastRow();
      const latestID = sheet.getRange(lastRow, 1).getValue();
      return ContentService.createTextOutput(JSON.stringify({id: latestID}))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }
    
    if (e.postData) {
      const data = JSON.parse(e.postData.contents);
      
      // Tạo ID mới
      const lastRow = sheet.getLastRow();
      const newID = generateNextID(lastRow, sheet);
      
      // Tạo công thức QR cho Google Sheet
      const qrFormula = `=IMAGE("http://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(newID)}&size=100x100";3)`;
      
      // Lưu dữ liệu
      sheet.appendRow([
        newID,
        data.name,
        data.content,
        qrFormula
      ]);
      
      SpreadsheetApp.flush();
      
      return ContentService.createTextOutput(JSON.stringify({success: true, id: newID}))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }
    
  } catch (error) {
    console.error('Error:', error);
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

// Hàm hỗ trợ tạo ID mới
function generateNextID(lastRow, sheet) {
  if (lastRow < 2) return "AA0001";
  
  const lastID = sheet.getRange(lastRow, 1).getValue();
  const letters = lastID.match(/[A-Z]+/)[0];
  const numbers = parseInt(lastID.match(/\d+/)[0]);
  
  let nextNumber = numbers + 1;
  let nextLetters = letters;
  
  if (nextNumber > 9999) {
    nextNumber = 1;
    let lastChar = letters.charAt(1);
    let firstChar = letters.charAt(0);
    
    if (lastChar === 'Z') {
      firstChar = String.fromCharCode(firstChar.charCodeAt(0) + 1);
      lastChar = 'A';
    } else {
      lastChar = String.fromCharCode(lastChar.charCodeAt(0) + 1);
    }
    nextLetters = firstChar + lastChar;
  }
  
  return nextLetters + nextNumber.toString().padStart(4, '0');
}