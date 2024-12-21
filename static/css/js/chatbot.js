(function () {
    // ===== CẤU HÌNH CHÍNH =====
    const CONFIG = {
        // API Key Gemini - Thay thế key của bạn vào đây
        GEMINI_API_KEY: 'API-KEY-GEMINI-HERE',
        
        // Cấu hình AI
        AI_CONFIG: {
            temperature: 0.7,        // Độ sáng tạo (0.0 - 1.0)
            maxOutputTokens: 200,    // Độ dài tối đa của câu trả lời
            topP: 0.8,              // Đa dạng từ ngữ
            topK: 40                 // Đa dạng chủ đề
        },
        
        // System prompt - Hướng dẫn cách AI trả lời
        SYSTEM_PROMPT: "Bạn là một trợ lý học tập của EduSupport và là một người bạn tốt của học sinh. Hãy trả lời ngắn gọn, rõ ràng và thân thiện. Nếu người dùng hỏi bằng tiếng Việt, hãy trả lời bằng tiếng Việt."
    };

    // ===== THEME GIAO DIỆN =====
    const THEME = {
        // Màu sắc chính
        primaryColor: '#0083b0',
        primaryGradient: 'linear-gradient(135deg, #00b4db, #0083b0)',
        backgroundColor: '#f5f5f5',
        
        // Chat window
        windowWidth: '350px',
        windowHeight: '500px',
        windowRadius: '15px',
        
        // Chat bubble (icon)
        bubbleSize: '60px',
        bubbleImage: 'https://friendsofanimals.org/wp-content/uploads/2023/12/foxactualweb.png',
        
        // Messages
        userMessageColor: '#0083b0',
        botMessageColor: '#e9ecef',
        userTextColor: 'white',
        botTextColor: '#333',
        
        // Avatars
        avatarSize: '30px',
        userAvatar: 'https://t3.ftcdn.net/jpg/06/77/68/40/360_F_677684059_skndNiKKdoa1JuJDBdpBP1prZv1ZvNz7.jpg',
        botAvatar: 'https://i.pinimg.com/originals/d5/2e/95/d52e95a9f226c53c92058d83fb86118a.jpg',
        
        // Font
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        fontSize: '14px',
        
        // Animation
        animationDuration: '0.3s'
    };

    // Tạo style chung
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .chat-message {
            display: flex;
            margin-bottom: 15px;
            animation: fadeIn ${THEME.animationDuration} ease;
        }
        
        .chat-avatar {
            width: ${THEME.avatarSize};
            height: ${THEME.avatarSize};
            border-radius: 50%;
            background-size: cover;
            flex-shrink: 0;
        }
        
        .chat-bubble {
            max-width: 70%;
            padding: 12px 15px;
            font-size: ${THEME.fontSize};
            line-height: 1.4;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
    `;
    document.head.appendChild(style);

    // Tạo chat bubble
    const chatBubble = document.createElement("div");
    chatBubble.id = "chat-bubble";
    chatBubble.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: ${THEME.bubbleSize};
        height: ${THEME.bubbleSize};
        background-image: url(${THEME.bubbleImage});
        background-size: cover;
        background-position: center;
        border-radius: 50%;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    `;

    // Tạo chat window
    const chatWindow = document.createElement("div");
    chatWindow.id = "chat-window";
    chatWindow.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: ${THEME.windowWidth};
        height: ${THEME.windowHeight};
        background-color: ${THEME.backgroundColor};
        border-radius: ${THEME.windowRadius};
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        display: none;
        flex-direction: column;
        overflow: hidden;
        z-index: 1000;
        font-family: ${THEME.fontFamily};
    `;

    chatWindow.innerHTML = `
        <div style="background: ${THEME.primaryGradient}; color: white; padding: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>AI Assistant</span>
                <span id="close-chat" style="cursor: pointer; font-size: 20px;">×</span>
            </div>
        </div>
        <div id="chat-messages" style="flex: 1; padding: 15px; overflow-y: auto; background-color: #fff;"></div>
        <div style="display: flex; padding: 10px; background-color: #f8f9fa; border-top: 1px solid #eee;">
            <textarea id="chat-text" 
                style="flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 20px; outline: none; resize: none; margin-right: 10px; font-size: ${THEME.fontSize};" 
                rows="1" 
                placeholder="Type your message..."
            ></textarea>
            <button id="send-btn" 
                style="padding: 8px 20px; background: ${THEME.primaryGradient}; color: white; border: none; border-radius: 20px; cursor: pointer; font-weight: 500; transition: all 0.3s ease;">
                Send
            </button>
        </div>
    `;

    // Hàm tạo tin nhắn
    function appendMessage(sender, message) {
        const messageElement = document.createElement("div");
        const isUser = sender === "You";
        
        messageElement.className = 'chat-message';
        messageElement.style.flexDirection = isUser ? 'row-reverse' : 'row';

        const avatar = document.createElement("div");
        avatar.className = 'chat-avatar';
        avatar.style.backgroundImage = `url(${isUser ? THEME.userAvatar : THEME.botAvatar})`;
        avatar.style.margin = isUser ? '0 0 0 10px' : '0 10px 0 0';

        const bubble = document.createElement("div");
        bubble.className = 'chat-bubble';
        bubble.style.borderRadius = isUser ? '20px 20px 0 20px' : '20px 20px 20px 0';
        bubble.style.backgroundColor = isUser ? THEME.userMessageColor : THEME.botMessageColor;
        bubble.style.color = isUser ? THEME.userTextColor : THEME.botTextColor;
        bubble.textContent = message;

        messageElement.appendChild(avatar);
        messageElement.appendChild(bubble);
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Hàm gọi API Gemini
    async function fetchGeminiResponse(userMessage) {
        try {
            const fullPrompt = `${CONFIG.SYSTEM_PROMPT}\n\nUser: ${userMessage}\nAssistant:`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: fullPrompt
                        }]
                    }],
                    generationConfig: CONFIG.AI_CONFIG
                }),
            });

            const data = await response.json();
            if (data.candidates && data.candidates[0].content.parts[0]) {
                return data.candidates[0].content.parts[0].text;
            }
            return "Xin lỗi, tôi không thể trả lời lúc này.";
        } catch (error) {
            console.error("Error fetching Gemini response:", error);
            return "Đã xảy ra lỗi khi xử lý yêu cầu của bạn.";
        }
    }

    // Thêm các elements vào document
    document.body.appendChild(chatBubble);
    document.body.appendChild(chatWindow);

    // Thêm event listeners
    chatBubble.addEventListener('click', () => {
        chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
    });

    document.getElementById('close-chat').addEventListener('click', () => {
        chatWindow.style.display = 'none';
    });

    const chatText = document.getElementById('chat-text');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');

    // Gửi tin nhắn khi click nút Send
    sendBtn.addEventListener('click', async () => {
        const message = chatText.value.trim();
        if (message) {
            appendMessage('You', message);
            chatText.value = '';
            
            // Gọi API và hiển thị response
            const response = await fetchGeminiResponse(message);
            appendMessage('Bot', response);
        }
    });

    // Gửi tin nhắn khi nhấn Enter (không phải Shift + Enter)
    chatText.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendBtn.click();
        }
    });

    // Auto-resize textarea
    chatText.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
})();
  