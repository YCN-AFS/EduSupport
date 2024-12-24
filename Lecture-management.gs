function doGet(e) {
  Logger.log("doGet called with parameters: " + JSON.stringify(e.parameter));
  return handleResponse(e);
}

function doPost(e) {
  Logger.log("doPost called with parameters: " + JSON.stringify(e.parameter));
  if (e.postData) {
    Logger.log("Post data contents: " + e.postData.contents);
  }
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

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Lecture-management');
    if (!sheet) {
      Logger.log('Sheet not found');
      throw new Error('Không tìm thấy sheet "Lecture-management"');
    }
    
    // Lấy tất cả bài giảng
    if (e.parameter.action === 'getLectures') {
      Logger.log('Getting lectures');
      const data = sheet.getDataRange().getValues();
      Logger.log('Raw data: ' + JSON.stringify(data));
      
      const lectures = data.slice(1).map(row => ({
        id: row[0],
        name: row[1],
        content: row[2],
        qr: row[3]
      }));
      
      Logger.log('Processed lectures: ' + JSON.stringify(lectures));
      
      const response = {lectures: lectures};
      Logger.log('Sending response: ' + JSON.stringify(response));
      
      return ContentService.createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }
    
    // Thêm bài giảng mới
    if (e.parameter.action === 'addLecture') {
      Logger.log('Adding new lecture');
      const data = JSON.parse(e.postData.contents);
      Logger.log('Lecture data: ' + JSON.stringify(data));
      
      const lastRow = sheet.getLastRow();
      const newId = lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() + 1 : 1;
      
      sheet.appendRow([
        newId,
        data.name,
        data.content,
        ''
      ]);
      
      const response = {success: true, id: newId};
      Logger.log('Add lecture response: ' + JSON.stringify(response));
      
      return ContentService.createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(headers);
    }
    
    // Xóa bài giảng
    if (e.parameter.action === 'deleteLecture') {
      Logger.log('Deleting lecture with ID: ' + e.parameter.id);
      const id = parseInt(e.parameter.id);
      const data = sheet.getDataRange().getValues();
      
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === id) {
          sheet.deleteRow(i + 1);
          const response = {success: true};
          Logger.log('Delete lecture response: ' + JSON.stringify(response));
          
          return ContentService.createTextOutput(JSON.stringify(response))
            .setMimeType(ContentService.MimeType.JSON)
            .setHeaders(headers);
        }
      }
      
      throw new Error('Không tìm thấy bài giảng');
    }
    
    Logger.log('No matching action found');
    throw new Error('Invalid action');
    
  } catch (error) {
    Logger.log('Error occurred: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}
