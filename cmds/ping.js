async function systemStatus(event, api) {
  const ping = Date.now() - event.timestamp;
  api.sendMessage(`🚀 The bot current ping is: ${ping}ms.`, event.threadID, event.messageID);
}
module.exports = systemStatus;
