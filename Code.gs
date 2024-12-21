function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('AI Chatbot')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function insertDataAtTop(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('QR-management');
  if (!sheet) {
    throw new Error('Không tìm thấy sheet "QR-management"');
  }

  // Tạo ID mới dựa trên dữ liệu hiện có
  const lastID = sheet.getRange("A2").getValue() || "AA0000";
  const newID = generateNextID(2, sheet); // Bắt đầu từ hàng 2

  // Tạo công thức QR
  const qrFormula = `=IMAGE("http://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(newID)}&size=100x100";3)`;

  // Di chuyển tất cả dữ liệu xuống 1 hàng
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    const range = sheet.getRange(2, 1, lastRow - 1, 4);
    range.moveTo(sheet.getRange(3, 1));
  }

  // Chèn dữ liệu mới vào hàng thứ 2
  sheet.getRange(2, 1, 1, 4).setValues([[
    newID,
    data.name,
    data.content,
    qrFormula
  ]]);

  SpreadsheetApp.flush();
  return newID;
}

function generateNextID(row, sheet) {
  const lastID = sheet.getRange("A" + row).getValue() || "AA0000";
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

function doPost(e) {
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

    const data = JSON.parse(e.postData.contents);
    const newID = insertDataAtTop(data);
    
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