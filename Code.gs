function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('AI Chatbot')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  const CONFIG = {
    GEMINI_API_KEY: 'YOUR_API_KEY_HERE',
    AI_CONFIG: {
      temperature: 0.7,
      maxOutputTokens: 200,
      topP: 0.8,
      topK: 40
    },
    SYSTEM_PROMPT: "Bạn là một trợ lý Hệ Thống Hỗ Trợ Học Tập thân thiện của EduSupport dành cho học sinh Trung Học Cơ Sở. Hãy trả lời về chủ đề học tập ngắn gọn, rõ ràng và thân thiện. Nếu người dùng hỏi bằng tiếng Việt, hãy trả lời bằng tiếng Việt."
  };

  try {
    const userMessage = JSON.parse(e.postData.contents).message;
    const fullPrompt = `${CONFIG.SYSTEM_PROMPT}\n\nUser: ${userMessage}\nAssistant:`;
    
    const response = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': CONFIG.GEMINI_API_KEY
      },
      payload: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: CONFIG.AI_CONFIG
      })
    });
    
    const data = JSON.parse(response.getContentText());
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      response: aiResponse
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
} 