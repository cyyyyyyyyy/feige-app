const path = require('path');
const fs = require('fs');
const { app, ipcMain } = require('electron');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const HttpSpider = require('./modules/http-spider');
const AppDb = require('./modules/app-db');
const WsSpider = require('./modules/ws-spider');
const createAppWindow = require('./modules/create-app-window');
const contextMenu = require('./modules/context-menu');

const STORE_PATH = app.getPath('userData');

if (!fs.existsSync(STORE_PATH)) {
  fs.mkdirSync(STORE_PATH);
}

// const dbPath = path.join(STORE_PATH, `/lowdb.json`);
const dbPath = path.join('./db.json');
const adapter = new FileSync(dbPath);
const db = new AppDb(low(adapter));
const httpSpider = new HttpSpider();
const wsSpider = new WsSpider(db);

app.on('ready', () => {
  createAppWindow();
});

app.on('web-contents-created', (e, contents) => {
  contextMenu(contents);
  contents.on('new-window', (n, val) => {
    contents.loadURL(val);
  });
});

ipcMain.handle('get-shopes', async () => {
  try {
    const data = db.getShopes();

    if (data && data.length > 0) {
      data.forEach(shop => {
        httpSpider.setCookie(shop.shopUid, shop.cookies);
      });
    }

    return { code: 0, data };
  } catch (e) {
    return { code: -1 };
  }
});

ipcMain.handle('get-history-messages', async (event, payload) => {
  const { shopUid, user_id, cursor } = payload;

  try {
    const historyMessages = await httpSpider.get({
      shopUid,
      url: `https://pigeon.jinritemai.com/backstage/gethistorymsg?cursor=${cursor}&user_id=${user_id}&direction=0`
    });

    return { code: 0, data: historyMessages.data };
  } catch (e) {
    return { code: -1, message: '' };
  }
});

ipcMain.handle('get-shop-conv', async (event, payload) => {
  const { shopUid } = payload;
  try {
    const convUserIds = [];
    let convsData = [];
    let convs = {};
    let userInfo = {};
    convs = await httpSpider.get({
      shopUid,
      url:
        'https://pigeon.jinritemai.com/backstage/getCurrentConversation?page_no=0&page_size=200'
    });
    convsData = convs.data;

    if (convsData && convsData.length > 0) {
      convsData.forEach(conv => {
        convUserIds.push(conv.userId);
      });
    }

    if (convUserIds.length > 0) {
      userInfo = await httpSpider.post({
        shopUid,
        url: 'https://pigeon.jinritemai.com/backstage/getuserinfo',
        body: {
          uids: convUserIds.toString()
        }
      });
      return { code: 0, data: userInfo.data };
    }
  } catch (e) {
    return { code: -1, message: '' };
  }
  return { code: -1, message: '' };
});

ipcMain.handle('add-shop', async (event, payload) => {
  const { cookies, shopUid } = payload;
  httpSpider.setCookie(shopUid, cookies);

  try {
    const entInfo = await httpSpider.get({
      shopUid,
      url: 'https://pigeon.jinritemai.com/backstage/currentuser'
    });

    const tokenData = await httpSpider.get({
      shopUid,
      url: 'https://pigeon.jinritemai.com/backstage/token'
    });

    const {
      CustomerServiceInfo,
      ShopId,
      ShopName,
      ShopLogo,
      SubToutiaoId
    } = entInfo.data;

    db.addShop({
      subToutiaoId: SubToutiaoId,
      shopUid,
      shopName: ShopName,
      shopLog: ShopLogo,
      customerInfo: CustomerServiceInfo,
      shopId: ShopId,
      cookies,
      token: tokenData.data
    });
  } catch (e) {
    return { code: -1, message: '添加失败' };
  }
  return { code: 0, message: '添加成功' };
});

ipcMain.handle('shop-ws-connect', async (event, payload) => {
  const { shopUid } = payload;

  wsSpider.connect({
    shopUid,
    success: () => {
      return { code: 0, message: '连接成功' };
    },
    onMessage: () => {
      // 发送新消息
      ipcMain.handleOnce('new-message', {});

      // 结束对话
      ipcMain.handleOnce('end-conv', {});
    }
  });
});

ipcMain.handle('shop-send-message', async (event, payload) => {
  wsSpider.sendMessage(payload);
});
