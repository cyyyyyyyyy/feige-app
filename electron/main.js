const path = require('path');
const fs = require('fs');
const { app, ipcMain } = require('electron');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const createAppWindow = require('./create-app-window');
const contextMenu = require('./context-menu');
const AppDb = require('./app-db');
const dy = require('./dycode');

const STORE_PATH = app.getPath('userData');

if (!fs.existsSync(STORE_PATH)) {
  fs.mkdirSync(STORE_PATH);
}

const dbPath = path.join(STORE_PATH, `/lowdb.json`);
const adapter = new FileSync(dbPath);
const db = new AppDb(low(adapter));

let mainWindow = null;

app.on('ready', () => {
  mainWindow = createAppWindow();
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

ipcMain.on('load-name', async (event, value) => {
  db.updateApp(value.id, { name: value.name });
  mainWindow.webContents.send('app-load-name');
});

ipcMain.on('socket-message', (event, arg) => {
  const { id, data, unreadConv } = arg;
  try {
    const res = JSON.parse(`${dy.decode(data)}`);
    if (res.payload.body && res.payload.body.has_new_message_notify) {
      mainWindow.webContents.send('app-notification', { id, unreadConv });
    }
  } catch (e) {
    console.error(e);
  }
});
