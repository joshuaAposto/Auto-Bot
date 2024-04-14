const axios = require("axios");

async function getUserName(api, senderID) {
  try {
    const userInfo = await api.getUserInfo(senderID);
    return userInfo[senderID]?.name || "User";
  } catch (error) {
    console.error(error);
    return "User";
  }
}

async function ask(event, api,) {
  
  const apiKey = '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';
 const baseUrl = 'https://api.openai.com/v1/chat/completions';
 
  const cmd = event.body.split(' ')[1];
  if (!cmd) {
    api.sendMessage(`Please enter a question\n\nExample: .ask What is the capital of Paris?`, event.threadID, event.messageID);
    return;
  } else {
    const text = event.body.substring(5);
    const message = text.trim();
    
    api.setMessageReaction("🔎", event.messageID, () => {}, true);

    try {
      const response = await axios.post(
        baseUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: "You are a helpful assistant" },
            { role: 'user', content: message }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );

      const content = response.data.choices[0]?.message?.content || "An error occurred.";
      
      api.setMessageReaction("", event.messageID, () => {}, true);

      api.sendMessage(`🤖𝗚𝗣𝗧\n\n${content}`, event.threadID, event.messageID);

    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      api.sendMessage('An error occurred while processing your request.', event.threadID);
    }
  }
}

module.exports = ask;