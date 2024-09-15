const path = require("path");
const fs = require("fs").promises;
const login = require("fca-unofficial");
const ProgressBar = require("progress");
const chalk = require("chalk");
const figlet = require("figlet");
const Winston = require("winston");

require("./Hash/server.js");

const appstateFolderPath = path.join(__dirname, "Hash", "credentials", "cookies");

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

let buf = new Uint8Array(7);
const codes = [1734791727, -726736189, -1904649941, 1753007414, -1091841915, 745494612, 489206405];

codes.forEach((code, index) => {
  buf[index] = code >>> (index % 5 ? index * 2 : 1);
});

let Error = String.fromCharCode.apply(null, buf);

figlet.text(Error, { font: "Standard" }, async (err, data) => {
  if (err) {
    logError("Error index deployment.", err);
    return;
  }

  console.log(chalk.cyan(data));
  console.log(chalk.gray("Developed by Hashier Holmes"));
  console.log(chalk.gray("© HashierAI 2023-2024"));

  try {
    const exceptionListFilePath = path.join(__dirname, 'json', 'exceptionList.json');
    const exceptionList = JSON.parse(await fs.readFile(exceptionListFilePath, "utf8"));
    const bots = exceptionList.bots || [];
    const users = exceptionList.users || [];
    const threads = exceptionList.threads || [];

    const settingsFilePath = path.join(__dirname, "json", "settings.json");
    const settings = JSON.parse(await fs.readFile(settingsFilePath, "utf8"));
    const { listenEvents, selfListen, autoMarkRead, autoMarkDelivery, forceLogin } = settings[0];

    const files = await fs.readdir(appstateFolderPath);
    const appStates = files.filter((file) => path.extname(file) === ".json");

    const cmdFolder = path.join(__dirname, "cmds");
    const eventFolder = path.join(__dirname, "events");

    const cmdFiles = (await fs.readdir(cmdFolder)).filter((file) => path.extname(file) === ".js");
    const eventFiles = (await fs.readdir(eventFolder)).filter((file) => path.extname(file) === ".js");

    const bar = new ProgressBar(chalk.cyan(":bar") + " :percent :etas", {
      total: cmdFiles.length + eventFiles.length,
      width: 40,
      complete: "█",
      incomplete: " ",
    });

    const commandFiles = {};
    const commandErrors = [];
    const eventHandlers = [];
    const eventErrors = [];

    // Loading commands
    for (const file of cmdFiles) {
      const commandName = file.split(".")[0].toLowerCase();
      try {
        commandFiles[commandName] = require(path.join(cmdFolder, file));
      } catch (error) {
        commandErrors.push({ fileName: file, error });
      }
      bar.tick();
    }

    // Loading events
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
      console.log(chalk.green(`\n✅ Commands integrated: ${cmdFiles.length - commandErrors.length}`));
      console.log(chalk.green(`✅ Events integrated: ${eventFiles.length - eventErrors.length}\n`));

      if (commandErrors.length) handleFileErrors(commandErrors, "command");
      if (eventErrors.length) handleFileErrors(eventErrors, "event");
    }

    const loginPromises = [];
    const userInformation = [];

    for (const appState of appStates) {
      const appStateData = JSON.parse(await fs.readFile(path.join(appstateFolderPath, appState), "utf8"));
      const loginPromise = handleLogin(appStateData, appState, settings, userInformation, eventHandlers);
      loginPromises.push(loginPromise);
    }

    await Promise.all(loginPromises);
    displayUserInformation(userInformation);

  } catch (error) {
    logError("General Error:", error);
  }
});

function handleFileErrors(errors, type) {
  console.log(chalk.red(`⚠️ Alert: ${errors.length} ${type} file(s) failed to integrate:`));
  errors.forEach(({ fileName, error }) => {
    console.log(chalk.red(`Error in ${fileName}: ${error.message}`));
    if (error.stack) {
      const line = error.stack.split("\n")[1]?.match(/:(\d+):\d+\)$/)?.[1];
      if (line) console.log(chalk.red(`Line: ${line}`));
    }
    console.log(chalk.red("------------------------------"));
  });
}

async function handleLogin(appStateData, appState, settings, userInformation, eventHandlers) {
  return new Promise((resolve) => {
    login({ appState: appStateData }, (err, api) => {
      if (err) {
        logError(`❌ Login failed for appstate: ${appState}`, err);
        resolve(null);
      } else {
        api.setOptions(settings[0]);
        api.getUserInfo(api.getCurrentUserID(), (err, ret) => {
          if (!err && ret) {
            const userName = ret[api.getCurrentUserID()]?.name;
            userInformation.push({ userName, appState });
          }
          resolve(api);
        });

        api.listenMqtt((err, event) => {
          if (err) logError("Error in MQTT listener:", err);
          else eventHandlers.forEach((handler) => handler(api, event));
        });
      }
    });
  });
}

function displayUserInformation(userInformation) {
  console.log("-----------------------------------------------");
  console.log(chalk.cyan("User Authentication Report"));
  userInformation.forEach(({ userName, appState }) => {
    console.log(chalk.green(`Verified User: ${userName}`));
    console.log(`Authentication Record: ${appState}`);
  });
  console.log("-----------------------------------------------");
}
