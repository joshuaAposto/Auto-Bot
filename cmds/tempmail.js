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

async function tempmail(event, api) {
  try {
    const command = event.body.split(' ');
    const email = command[1];

    if (email === 'inbox') {
      if (!email) return await api.sendMessage('Please provide a temporary email.', event.threadID);

      const response = await axios.get(`https://all-api-qlu1.onrender.com/get/${email}`);
      const messages = response.data;

      if (messages && messages.length > 0) {
        let messageText = '📬 Inbox Messages: 📬\n\n';
        for (const message of messages) {
          messageText += `📩 :「 Sender 」: ${message.from}\n`;
          messageText += `🌷 :「 Subject 」: ${message.subject}\n`;
          messageText += `🌷 :「 Body 」: ${message.body}\n`;
          messageText += `🌷 :「 Date 」: ${message.date}\n✎……………………………………………………\n`;
        }
        return api.sendMessage(messageText, event.threadID);
      } else {
        return api.sendMessage(`No messages found for ${email}.`, event.threadID);
      }
    } else if (email === 'gen') {
      const response = await axios.get('https://all-api-1.onrender.com/get');
      const generatedEmail = response.data.email;

      if (!generatedEmail) return await api.sendMessage('Failed to generate temporary email.', event.threadID);

      return api.sendMessage(`☑ ❲ Here's your temporary email: ❳\n\n${generatedEmail}`, event.threadID);
    } else {
      return api.sendMessage(`Invalid command. Please enter 'Tempmail gen' or 'Tempmail inbox <tempmail>'.`, event.threadID);
    }
  } catch (error) {
    console.error('Error:', error);
    return api.sendMessage('An error occurred while processing your request.', event.threadID);
  }
}

module.exports = tempmail;
