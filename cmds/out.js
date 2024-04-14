  async function out({ api, event }) {
    const cmd = event.body.split(' ')[1];

    if (!cmd) {
        return api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
    }

    if (!isNaN(cmd)) {
        return api.removeUserFromGroup(api.getCurrentUserID(), cmd);
    }
  }

  module.exports = out;