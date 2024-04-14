async function listbox(api, event, Threads, handleReply) {

  if (parseInt(event.senderID) !== parseInt(handleReply.author)) return;

  const [command, order] = event.body.split(" ");
  const idgr = handleReply.groupid[parseInt(order) - 1];

  switch (handleReply.type) {

    case "reply": {
      if (command.toLowerCase() === "ban") {
        const data = (await Threads.getData(idgr)).data || {};
        data.banned = 1;
        await Threads.setData(idgr, { data });
        global.data.threadBanned.set(parseInt(idgr), 1);
        api.sendMessage(`[${idgr}] It was successful!`, event.threadID, event.messageID);
        break;
      }

      if (command.toLowerCase() === "out") {
        api.removeUserFromGroup(`${api.getCurrentUserID()}`, idgr);
        api.sendMessage(`Out thread with id: ${idgr}\n${(await Threads.getData(idgr)).name}`, event.threadID, event.messageID);
        break;
      }
    }
  }
}

async function listHandler(api, event, client) {
  const inbox = await api.getThreadList(100, null, ['INBOX']);
  const list = [...inbox].filter(group => group.isSubscribed && group.isGroup);

  const listthread = await Promise.all(list.map(async (groupInfo) => {
    const data = await api.getThreadInfo(groupInfo.threadID);
    return {
      id: groupInfo.threadID,
      name: groupInfo.name,
      sotv: data.userInfo.length,
    };
  }));

  const sortedList = listthread.sort((a, b) => b.sotv - a.sotv);

  let msg = '',
    i = 1;
  const groupid = [];
  for (const group of sortedList) {
    msg += `${i++}. ${group.name}\nð§©TID: ${group.id}\nð¸Member: ${group.sotv}\n\n`;
    groupid.push(group.id);
  }

  api.sendMessage(msg + 'Reply "out" or "ban" the number of order to out or ban that thread!!', event.threadID, (e, data) =>
    global.client.handleReply.push({
      name: this.config.name,
      author: event.senderID,
      messageID: data.messageID,
      groupid,
      type: 'reply'
    })
  );
}

module.exports = { listbox, listHandler };