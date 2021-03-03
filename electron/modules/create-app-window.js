const path = require('path');
const { BrowserWindow } = require('electron');
const contextMenu = require('./context-menu');

const createAppWindow = () => {
  const appMainWindow = new BrowserWindow({
    width: 1400,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true
    }
  });

  if (process.env.NODE_ENV === 'development') {
    appMainWindow.webContents.loadURL('http://localhost:9001');
  } else {
    appMainWindow.webContents.loadFile(
      path.join(__dirname, '../dist/index.html')
    );
  }

  contextMenu(appMainWindow);
  return appMainWindow;
};

module.exports = createAppWindow;
