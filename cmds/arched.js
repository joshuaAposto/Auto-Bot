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

async function arc(event, api) {
  const cmd = event.body.split(' ')[1];
  if (!cmd) {
    api.sendMessage(`Please enter a question\n\nExample .ask what is the capital of Paris?`, event.threadID, event.messageID);
    return;
  } else {
    const text = event.body.substring(5);
    const query = text.trim();
    api.setMessageReaction("❤️", event.messageID, (err) => {}, true);
    
    try {
        const response = await axios.get(`https://lianeapi.onrender.com/ask/arched?query=${encodeURIComponent(target)}`);
        const reply = response.data.message;
        api.sendMessage(reply, event.threadID, event.messageID);
    } catch (error) {
      console.error('Error during axios.post:', error.message);
      api.sendMessage('An error occurred while fetching the response.', event.threadID, event.messageID);
    }
  }
}

module.exports = arc;
