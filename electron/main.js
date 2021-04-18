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

const dbPath = path.join(STORE_PATH, `/lowdb.json`);
// const dbPath = path.join('./db.json');
const adapter = new FileSync(dbPath);
const db = new AppDb(low(adapter));
const httpSpider = new HttpSpider();
const wsSpider = new WsSpider(db);
let mainWindow;

app.on('ready', () => {
  mainWindow = createAppWindow();
});

app.on('web-contents-created', (e, contents) => {
  contextMenu(contents);
  contents.on('new-window', (n, val) => {
    contents.loadURL(val);
  });
});

ipcMain.handle('get-quick-reply', async () => {
  try {
    const data = db.getQuickReply();
    return { code: 0, data };
  } catch (e) {
    return { code: -1 };
  }
});

ipcMain.handle('update-quick-reply', async (event, payload) => {
  try {
    const data = db.updateQuickReply(payload);
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

ipcMain.handle('delete-shope', async (event, shopUid) => {
  try {
    db.deleteShop({ shopUid });
    wsSpider.closeWs({ shopUid });
    return { code: 0 };
  } catch (e) {
    return { code: -1 };
  }
});

ipcMain.handle('update-shop', async (event, payload) => {
  const { cookies, shopUid, shopUidStatus } = payload;
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

    const shopData = {
      subToutiaoId: SubToutiaoId,
      shopUid,
      shopName: ShopName,
      shopLog: ShopLogo,
      customerInfo: CustomerServiceInfo,
      shopId: ShopId,
      cookies,
      token: tokenData.data
    };
    if (shopUidStatus === 'create') {
      db.addShop(shopData);
      return { code: 0, message: '新建成功' };
    }
    if (shopUidStatus === 'update') {
      db.updateShop(shopData);
      return { code: 0, message: '更新成功' };
    }
  } catch (e) {
    return { code: -1, message: '操作失败' };
  }
  return { code: -1, message: '操作失败' };
});

ipcMain.handle('shop-ws-connect', async (event, payload) => {
  const { shopUid } = payload;
  const handleWsConnet = () =>
    new Promise(resolve => {
      wsSpider.connect({
        shopUid,
        success: () => {
          resolve({ code: 0, message: '连接成功', shopUid });
        },
        onMessage: data => {
          // 发送新消息
          mainWindow.webContents.send('new-message', data);
        },
        onClose: data => {
          mainWindow.webContents.send('socket-close', data);
        },
        onError: data => {
          mainWindow.webContents.send('socket-error', data);
        }
      });
    });
  const data = await handleWsConnet();
  return data;
});

ipcMain.handle('shop-send-message', async (event, payload) => {
  wsSpider.sendMessage(payload);
});

ipcMain.handle('check-shopes', async () => {
  const shopes = db.getShopes();
  try {
    if (shopes.length > 0) {
      const res = await Promise.all(
        shopes.map(shop => {
          return httpSpider.get({
            shopUid: shop.shopUid,
            url: 'https://pigeon.jinritemai.com/backstage/currentuser'
          });
        })
      );
      // 判断检测状态
      const successShopes = [];
      shopes.forEach((shop, index) => {
        if (res[index].data) {
          successShopes.push(shop);
        }
      });
      return { code: 0, data: successShopes };
    }
  } catch (e) {
    return { code: -1, message: '检测失败' };
  }
  return { code: -1, message: '检测失败' };
});

ipcMain.handle('get-ws-connect-shop', async () => {
  const data = wsSpider.getClientShop();
  const arr = Object.keys(data);
  return { code: 0, data: arr };
});

ipcMain.handle('show-app', () => {
  mainWindow.show();
  return null;
});
