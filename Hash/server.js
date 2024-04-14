const fs = require("fs").promises;
const Koa = require('koa');
const Router = require('koa-router');
const ejs = require('ejs');
const path = require('path');
const moment = require('moment-timezone');
const chalk = require('chalk');
const markdownIt = require('markdown-it')(); 

const appstateHandler = require('./fbstateApi.js');

const app = new Koa();
const router = new Router();

const appPort = process.env.APP_PORT || 3000;

const startServer = (port) => {
  router.get('/', async (ctx) => {
    const html = await ejs.renderFile(path.join(__dirname, 'index.ejs'), {});
    ctx.body = html;
  });

  router.get('/docs', async (ctx) => {
    const html = await ejs.renderFile(path.join(__dirname, 'docs.html'), {});
    ctx.body = html;
  });

  router.get('/getfbstate', async (ctx) => {
    const html = await ejs.renderFile(path.join(__dirname, 'appstateget.ejs'), {});
    ctx.body = html;
  });

  router.get('/api/appstate', appstateHandler);

  moment.tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');

  router.get('/json-file-count', async (ctx) => {
    const appstateFolderPath = path.join(
      __dirname,
      "credentials",
      "cookies"
    );

      try {
          const files = await fs.readdir(appstateFolderPath);
          const jsonFileCount = files.filter((file) => path.extname(file) === '.json').length;
          ctx.body = { count: jsonFileCount };
      } catch (error) {
          console.error('Error reading directory:', error);
          ctx.status = 500;
          ctx.body = { error: 'Internal Server Error' };
      }
  });


  router.get('/ping', async (ctx) => {
    // Simulate a delay to represent ping time
    const delay = Math.floor(Math.random() * 100);
    await new Promise(resolve => setTimeout(resolve, delay));

    ctx.body = { ping: delay };
  });

  app.use(router.routes()).use(router.allowedMethods());

  app.listen(port, () => {
    const formattedTime = moment.tz('Asia/Manila').format('MM/DD/YY hh:mm A');
    console.log(chalk.cyan(`[SYSTEM] Status: ONLINE\n[NETWORK] Running on PORT: ${port}`));
    console.log(chalk.green(`[TIME] Server initiated at: ${formattedTime}`));
  });
};

const findAvailablePort = (port) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      server.close();
      resolve(port);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(port + 1));
      } else {
        reject(err);
      }
    });
  });
};

findAvailablePort(appPort)
  .then((availablePort) => {
    startServer(availablePort);
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
  });
