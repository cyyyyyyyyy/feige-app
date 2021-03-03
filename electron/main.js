const path = require('path');
const fs = require('fs');
const { app, ipcMain } = require('electron');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const HttpSpider = require('./utils/http-spider');
const Ws = require('./utils/ws');

const createAppWindow = require('./modules/create-app-window');
const contextMenu = require('./modules/context-menu');
const AppDb = require('./modules/app-db');

const STORE_PATH = app.getPath('userData');

if (!fs.existsSync(STORE_PATH)) {
  fs.mkdirSync(STORE_PATH);
}

const dbPath = path.join(STORE_PATH, `/lowdb.json`);
const adapter = new FileSync(dbPath);
const db = new AppDb(low(adapter));

app.on('ready', () => {
  createAppWindow();
});

app.on('web-contents-created', (e, contents) => {
  contextMenu(contents);
  contents.on('new-window', (n, val) => {
    contents.loadURL(val);
  });
});

ipcMain.handle('get-apps', async () => {
  try {
    const data = db.getApps();
    return { status: 0, data };
  } catch (e) {
    return { status: -1 };
  }
});

ipcMain.handle('add-app', async () => {
  try {
    db.addApp();
    return { status: 0 };
  } catch (e) {
    return { status: -1 };
  }
});

ipcMain.handle('delete-app', async (event, id) => {
  try {
    db.removeApp(id);
    return { status: 0 };
  } catch (e) {
    return { status: -1 };
  }
});

ipcMain.handle('send-cookie', async (event, value) => {
  if (value) {
    const { data } = value;
    let cookieString = '';
    const keys = Object.keys(data);
    keys.forEach(key => {
      cookieString += `${key}=${data[key]};`;
    });
    const spider = new HttpSpider(cookieString);

    // 获取当前对话列表
    const convUserIds = [];
    let shopId;
    let customerId;
    let users;
    let wsToken; // ws连接token

    // 获取token信息
    try {
      const tokenData = await spider.get({
        url: 'https://pigeon.jinritemai.com/backstage/token?'
      });
      wsToken = tokenData.data;
    } catch (e) {
      console.error(e);
    }

    // 获取店铺信息
    try {
      const customerData = await spider.get({
        url: 'https://pigeon.jinritemai.com/backstage/currentuser?'
      });
      customerId = customerData.data.CustomerServiceInfo.id;
      shopId = customerData.data.ShopId;
    } catch (e) {
      console.error(e);
    }

    // 获取当前对话列表
    try {
      const convs = await spider.get({
        url:
          'https://pigeon.jinritemai.com/backstage/getCurrentConversation?page_no=0&page_size=200'
      });
      const convsData = convs.data;
      if (convsData && convsData.length > 0) {
        convsData.forEach(conv => {
          convUserIds.push(conv.userId);
        });
      }
    } catch (e) {
      console.error(e);
    }

    // 通过对话列表获取用户信息
    try {
      const userInfo = await spider.post({
        url: 'https://pigeon.jinritemai.com/backstage/getuserinfo?',
        body: {
          uids: convUserIds.toString()
        }
      });
      if (userInfo.code === 0) {
        users = userInfo.data;
      }
    } catch (e) {
      console.error(e);
    }

    // 创建ws连接, 并且尝试发送一条消息
    if (wsToken) {
      const userId = users[0].id;
      const wsClient = new Ws(wsToken, customerId, shopId);
      wsClient.connect();
      wsClient.onMessage();
      setTimeout(() => {
        wsClient.sendMessage({ userId });
      }, 2000);
    }
  }
});
