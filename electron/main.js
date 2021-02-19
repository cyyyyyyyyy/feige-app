const path = require('path');
const fs = require('fs');
const { app, ipcMain } = require('electron');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const createAppWindow = require('./create-app-window');
const contextMenu = require('./context-menu');
const AppDb = require('./app-db');

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

ipcMain.handle('load-name', async (event, value) => {
  try {
    db.updateApp(value.id, { name: value.name });
    return { status: 0 };
  } catch (e) {
    return { status: -1 };
  }
});
