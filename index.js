const path = require("path");
const fs = require("fs").promises;
const login = require("fca-unofficial");
const ProgressBar = require("progress");
const chalk = require("chalk");
const figlet = require("figlet");
const axios = require("axios");
//import fetch from "node-fetch";
const Winston = require("winston");
require("./Hash/server.js");

const appstateFolderPath = path.join(
  __dirname,
  "Hash",
  "credentials",
  "cookies"
);

const logger = Winston.createLogger({
  level: "info",
  format: Winston.format.combine(
    Winston.format.timestamp(),
    Winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    new Winston.transports.Console(),
    new Winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

function logError(message, error) {
  const errorMessage = `${message}\n${error.stack || error}`;
  logger.error(errorMessage);
}

const mutedUsersReminded = new Set();
const mutedUsers = new Map();
const userCommandHistory = new Map();
const MUTE_DURATION = 15 * 1000;
const COMMAND_LIMIT = 50;
const TIME_LIMIT = 10 * 1000;

let WaitzkinDevz;
let buf = new Uint8Array(7);

WaitzkinDevz = 1734791727;
buf[0] = WaitzkinDevz >>> 6;
WaitzkinDevz = -726736189;
buf[1] = WaitzkinDevz >>> 1;
WaitzkinDevz = -1904649941;
buf[2] = WaitzkinDevz >>> 21;
WaitzkinDevz = 1753007414;
buf[3] = WaitzkinDevz >>> 24;
WaitzkinDevz = -1091841915;
buf[4] = WaitzkinDevz >>> 1;
WaitzkinDevz = 745494612;
buf[5] = WaitzkinDevz >>> 16;
WaitzkinDevz = 489206405;
buf[6] = WaitzkinDevz >>> 22;

let Error = String.fromCharCode.apply(null, buf);

figlet.text(
  `${Error}`,
  {
    font: "Standard",
    horizontalLayout: "default",
    verticalLayout: "default",
  },
  async (err, data) => {
    if (err) {
      logError("Error index deployment.", err);
      return;
    }

    console.log(chalk.cyan(data));
    console.log(chalk.gray("Developed by Hashier Holmes"));
    console.log(chalk.gray("© HashierAI 2023-2024"));

    try {
      const exceptionListFilePath = path.join(__dirname, '.', 'json', 'exceptionList.json');
const exceptionList = JSON.parse(await fs.readFile(exceptionListFilePath, "utf8"));
const bots = exceptionList.bots || [];  
const users = exceptionList.users || [];  
const threads = exceptionList.threads || [];  
      
      const settingsFilePath = path.join(__dirname, ".", "json", "settings.json");
      const settings = JSON.parse(await fs.readFile(settingsFilePath, "utf8"));

      const listenEvents = settings[0].listenEvents;
      const selfListen = settings[0].selfListen;
      const autoMarkRead = settings[0].autoMarkRead;
      const autoMarkDelivery = settings[0].autoMarkDelivery;
      const forceLogin = settings[0].forceLogin;

      const files = await fs.readdir(appstateFolderPath);
      const appStates = files.filter((file) => path.extname(file) === ".json");

      const cmdFolder = path.join(__dirname, "cmds");
      const cmdFiles = (await fs.readdir(cmdFolder)).filter((file) => path.extname(file) === ".js");

      const eventFolder = path.join(__dirname, "events");
      const eventFiles = (await fs.readdir(eventFolder)).filter((file) => path.extname(file) === ".js");

      const bar = new ProgressBar(chalk.cyan(":bar") + " :percent :etas", {
        total: cmdFiles.length + eventFiles.length,
        width: 40,
        complete: "█",
        incomplete: " ",
        renderThrottle: 1,
      });

      const commandFiles = {};
      const commandErrors = [];
      const eventHandlers = [];
      const eventErrors = [];

      for (const file of cmdFiles) {
        const commandName = file.split(".")[0].toLowerCase();

        try {
          commandFiles[commandName] = require(path.join(cmdFolder, file));
        } catch (error) {
          commandErrors.push({ fileName: file, error });
        }

        bar.tick();
      }

      for (const file of eventFiles) {
        try {
          const eventHandler = require(path.join(eventFolder, file));
          eventHandlers.push(eventHandler);
        } catch (error) {
          eventErrors.push({ fileName: file, error });
        }

        bar.tick();
      }

      if (bar.complete) {
        console.log(chalk.green(`\n✅ Commands successfully integrated: ${cmdFiles.length - commandErrors.length}`));
        console.log(chalk.green(`✅ Events successfully integrated: ${eventFiles.length - eventErrors.length}\n`));

        if (commandErrors.length > 0) {
          console.log(chalk.red(`⚠️ Alert: ${commandErrors.length} file${commandErrors.length === 1 ? '' : 's'} could not be integrated:`));

          for (const { fileName, error } of commandErrors) {
            console.log(chalk.red(`Error detected in file: ${fileName}`));
            console.log(chalk.red(`Reason: ${error}`));
            if (error.stack) {
              const stackLines = error.stack.split('\n');
              const lineNumber = stackLines[1].match(/:(\d+):\d+\)$/)[1];
              console.log(chalk.red(`Line: ${lineNumber}`));
            }
            console.log(chalk.red(`------------------------------`));
          }
          console.log();
        }

        if (eventErrors.length > 0) {
          console.log(chalk.red(`⚠️ Alert: ${eventErrors.length} event${eventErrors.length === 1 ? '' : 's'} could not be integrated:`));

          for (const { fileName, error } of eventErrors) {
            console.log(chalk.red(`Error detected in file: ${fileName}`));
            console.log(chalk.red(`Reason: ${error}`));
            if (error.stack) {
              const stackLines = error.stack.split('\n');
              const lineNumber = stackLines[1].match(/:(\d+):\d+\)$/)[1];
              console.log(chalk.red(`Line: ${lineNumber}`));
            }
            console.log(chalk.red(`------------------------------`));
          }
          console.log();
        }
      }

      const userInformation = [];

      function displayUserInformation() {
        console.log("-----------------------------------------------");
        console.log(chalk.cyan("User Authentication Report"));
        console.log("-----------------------------------------------");
        for (const { userName, appState } of userInformation) {
          console.log(chalk.green(`Verified User: ${userName}`));
          console.log(`Authentication Record: ${appState}`);
        }
        console.log("-----------------------------------------------");
      }

      let completedLogins = 0;
      const loginPromises = [];

      for (const appState of appStates) {
        const appStateData = JSON.parse(
          await fs.readFile(path.join(appstateFolderPath, appState), "utf8")
        );

        const loginPromise = new Promise((resolve) => {
          login({ appState: appStateData }, async (err, api) => {
            if (err) {
              logError(
                `❌ Login failed. \nAuthentication record: ${appState}`,
                err
              );
              resolve(null);
              return;
            }

            api.setOptions({
              listenEvents: listenEvents,
              selfListen: selfListen,
              autoMarkRead: autoMarkRead,
              autoMarkDelivery: autoMarkDelivery,
              forceLogin: forceLogin
            });

            api.getUserInfo(api.getCurrentUserID(), (err, ret) => {
              if (err) {
                logError(
                  `❌ Failed to retrieve user information. \nAuthentication record: ${appState}`,
                  err,
                  api
                );
                return;
              }

              if (ret && ret[api.getCurrentUserID()]) {
                const userName = ret[api.getCurrentUserID()].name;
                userInformation.push({ userName, appState });
              }

              completedLogins++;
              if (completedLogins === appStates.length) {
                displayUserInformation();
              }
            });

            resolve(api);
          });
        });

        loginPromises.push(loginPromise);
      }

      const apis = await Promise.all(loginPromises);

      for (let i = 0; i < apis.length; i++) {
        const api = apis[i];
        if (!api) {
          const appStateToDelete = appStates[i];
          console.log(chalk.yellow(`Initiating secure deletion of appstate file: ${appStateToDelete}`));

          setTimeout(async () => {
            try {
              await fs.unlink(path.join(appstateFolderPath, appStateToDelete));
              console.log(chalk.green(`✅ Appstate file successfully deleted: ${appStateToDelete}`));
            } catch (deleteError) {
              console.error(chalk.red(`❌ Error during appstate file deletion: ${appStateToDelete}`, deleteError));
            }
          }, 5000);
          continue;
        }

        api.listenMqtt(async (err, event) => {
          if (err) {
            logError("Error in MQTT listener:", err, api);
            return;
          }

          if ((bots.includes(event.senderID) || users.includes(event.senderID) || threads.includes(event.threadID)) && (users.length > 0 || threads.length > 0)) {
           /* console.log(`Blocked ${users.includes(event.senderID) ? 'User' : 'Thread'} ${users.includes(event.senderID) ? event.senderID : event.threadID}. Skipping actions.`);*/
            return;
          }
          const userId = event.senderID;
          const userMuteInfo = mutedUsers.get(userId);

          if (userMuteInfo) {
            const { timestamp } = userMuteInfo;

            if (Date.now() - timestamp >= MUTE_DURATION) {
              mutedUsers.delete(userId);
              mutedUsersReminded.delete(userId);
              console.log(`User ${userId} has been unmuted.`);
            } else {
              if (!mutedUsersReminded.has(userId)) {
                api.getUserInfo(userId, async (err, ret) => {
                  if (!err && ret && ret[userId] && ret[userId].name) {
                    const userName = ret[userId].name;
                    api.sendMessage(`Hello ${userName}, you are currently muted. Please patiently wait for approximately ${(MUTE_DURATION - (Date.now() - timestamp)) / 1000} seconds to regain access. \n\nPlease note that this message is a one-time notification and will not be sent again to avoid any inconvenience.`, event.threadID, event.messageID);
                    mutedUsersReminded.add(userId);
                  }
                });
              }
              return;
            }
          }

          for (const eventHandler of eventHandlers) {
            try {
              if (!userMuteInfo) {
                eventHandler(api, event);
              }
            } catch (error) {
              logError("Error executing event handler:", error, api);
            }
          }

          try {
            if (event.type === "message" || event.type === "message_reply") {
              const configFilePath = path.join(__dirname, ".", "json", "config.json");
              const config = JSON.parse(await fs.readFile(configFilePath, "utf8"));
              const prefix = config.prefix;

              function isAuthorizedUser(userId, config) {
                const vipList = config.vips || [];
                const adminList = config.admin || [];
                return vipList.includes(userId) || adminList.includes(userId);
              }

              let input = event.body.toLowerCase().trim();

              if (!input.startsWith(prefix) && prefix !== false) {
                return;
              }

              if (prefix !== false) {
                input = input.substring(prefix.length).trim();
              }

              try {
                const matchingCommand = Object.keys(commandFiles).find((commandName) => {
                  const commandPattern = new RegExp(`^${commandName}(\\s+.*|$)`);
                  return commandPattern.test(input);
                });

                if (matchingCommand) {
                  const commandHistory = userCommandHistory.get(userId) || [];
                  const now = Date.now();
                  const recentCommands = commandHistory.filter((timestamp) => now - timestamp <= TIME_LIMIT);

                  recentCommands.push(now);
                  userCommandHistory.set(userId, recentCommands);
                  const isNotAuthorized = !isAuthorizedUser(userId, config);

                  if (recentCommands.length > COMMAND_LIMIT && isNotAuthorized) {
                    if (!mutedUsers.has(userId)) {
                      mutedUsers.set(userId, { timestamp: now, commandCount: recentCommands.length });
                      api.sendMessage(`Ohh no, you're going too fast. You have been muted for ${MUTE_DURATION / 1000} seconds for excessive command usage.`, event.threadID, event.messageID);
                    }
                  } else {
                    api.sendTypingIndicator(event.threadID);
                    const cmd = commandFiles[matchingCommand];
                    if (cmd) {
                      if (cmd.config && cmd.run) {
                        cmd.run({ api, event });
                      } else if (typeof cmd === "function") {
                        cmd(event, api);
                      } else if (cmd.onStart) {
                        cmd.onStart(event, api);
                      }
                    }
                  }
                } else {
                  const isPrivateThread = event.threadID == event.senderID;
                  const isGroupChat = !isPrivateThread;

                  if (!userMuteInfo) {
                    if (isPrivateThread) {
                      api.sendTypingIndicator(event.threadID);
                    } else if
  (isGroupChat ) {
                      api.sendTypingIndicator(event.threadID);
                    }
                  }
                }
              } catch (error) {
                console.error("Error handling the command:", error);
              }
            }
          } catch (error) {
            logError(
              "An error occurred in the listenMqtt function:",
              error,
              api
            );
          }
        });
      }
    } catch (error) {
      logError("Error reading directory:", error);
    }
  }
);
