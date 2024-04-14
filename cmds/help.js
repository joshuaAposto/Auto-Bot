const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');

async function cmd(event, api) {
  const cmdFolderPath = path.join(__dirname, '.');

  fs.readdir(cmdFolderPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    const commandFiles = files.filter(file => path.extname(file).toLowerCase() === '.js');
    const commandList = commandFiles.map(file => path.parse(file).name);

    const perPage = 10;
    const totalPages = Math.ceil(commandList.length / perPage);

    const userMessage = event.body.toLowerCase().trim();
    let page = parseInt(userMessage.split(' ')[1]) || 1;
    let showAll = false;

    // Check if the user wants to see all commands
    if (userMessage.includes('-all')) {
      showAll = true;
      page = 1; // Reset the page number to 1 when showing all commands
    }

    if (showAll) {

      const output = [
        `╭────────────✦`,
          '├─𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 𝗟𝗜𝗦𝗧',
        ...commandList.map(cmd => `├✦│${cmd.charAt(0).toLowerCase() + cmd.slice(1)}`),
        '╰────────────⧕',
          '',
        `Total Commands: ${commandList.length}`,
        `│Page ${page}/${totalPages}`,
        ' ',
          '│Instructions: To see usage of a specific command, type the command followed by "-help" For example, to understand how to use the ".ask" command, type ".ask -help."',
      ];

      api.sendMessage(output.join('\n│⌗'), event.threadID);
    } else {
      page = Math.max(1, Math.min(page, totalPages));

      const startIndex = (page - 1) * perPage;
      const endIndex = Math.min(startIndex + perPage, commandList.length);

      const commandsToShow = commandList.slice(startIndex, endIndex);

      const output = [
        `╭────────────✦`,
        '├─𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 𝗟𝗜𝗦𝗧',
        ...commandsToShow.map(cmd => `├✦${cmd.charAt(0).toLowerCase() + cmd.slice(1)}`),
        '╰────────────⧕',
        '',
        `│Total Commands: ${commandList.length}`,
        `│Page ${page}/${totalPages}`,
        ' ',
        '│Instructions: To see usage of a specific command, type the command followed by "-help" For example, to understand how to use the ".ask" command, type ".ask -help."',
      ];

      api.sendMessage(output.join('\n'), event.threadID);
    }
  });
}

module.exports = cmd;
