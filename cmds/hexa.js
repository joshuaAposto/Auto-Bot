const axios = require("axios");
const { DateTime } = require("luxon");

async function getUserName(api, senderID) {
  try {
    const userInfo = await api.getUserInfo(senderID);
    return userInfo[senderID]?.name || "User";
  } catch (error) {
    console.error(error);
    return "User";
  }
}

async function hexa(event, api) {
  const apiKey = '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';
  const baseUrl = 'https://api.openai.com/v1/chat/completions';

  const cmd = event.body.split(' ');
  const manilaTime = DateTime.now().setZone("Asia/Manila").toFormat("yyyy-MM-dd hh:mm:ss a");

  if (cmd.length <= 1) { // Check if the command length is less than or equal to 1
    api.sendMessage(`🤖𝗛𝗲𝘅𝗮\n\nHello!!👋 Please provide a Question or Query.\n\nExample:\n\nHexa what is love?`, event.threadID, event.messageID);
    return;
  }

  try {
    const { threadID, messageID } = event;
    const message = event.body.substring(5).trim();

    api.setMessageReaction("🔍", event.messageID, () => {}, true);

    const prompt = `you're now HEXA AI created and developed by YenzyJS, you're an AI that talks to AI powered by LLMA. You're a friendly AI that answers questions and queries, if you may ask for Time&Date this is the time&date ${manilaTime}. My ask: ${message}`;

    try {
      const response = await axios.get(`https://all-api-qlu1.onrender.com/ai/ask?q=${encodeURIComponent(prompt)}&apiKey=${apiKey}`);
      const res = response.data.message;

      const reply = `🤖𝗛𝗲𝘅𝗮\n\n${res}`;

      api.setMessageReaction("", event.messageID, () => {}, true);
      api.sendMessage(reply, event.threadID, event.messageID);
    } catch (error) {
      console.error("Error while fetching AI response:", error);
      api.sendMessage("An error occurred while fetching AI response. Please try again later.", threadID, messageID);
    }
  } catch (error) {
    console.error("Error in hexa command:", error);
    api.sendMessage("An error occurred. Please try again later.", threadID, messageID);
  }
}

module.exports = hexa;