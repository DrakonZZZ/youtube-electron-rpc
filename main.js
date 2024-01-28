const { app, BrowserWindow, Menu, session } = require('electron/main');
const { Client } = require('discord-rpc');
const ytData = require('./scripts/yt-data');

const rpc = new Client({ transport: 'ipc' });
//change this to your discord clientId to have your own RPC
const clientId = '623558135994384437';

const winSettings = {
  width: 1280,
  height: 720,
  useContentSize: false,
  backgroundColor: '#2e2c29',
  title: 'Youtube RPC',
  icon: __dirname + '/assets/yt.png',
  webPreferences: {
    nodeIntegration: true,
    plugins: true,
  },
};

const winModalSetting = {
  width: 500,
  height: 600,
};

let win, winModal;

const connectorRPC = (attempt = 0) => {
  if (attempt >= 5) {
    win?.webContents.executeJavaScript(connectionStatus);
    return;
  }
  attempt += 1;
  rpc
    .login({ clientId })
    .catch(() => setTimeout(() => connectorRPC(attempt), 10e4));
};

const checkYtData = async () => {
  if (!rpc || !win) return;
  const data = await ytData(win);
  console.log(data);
  rpc.setActivity(data);
};

const createWindow = () => {
  win = new BrowserWindow(winSettings);
  winModal = new BrowserWindow(winModalSetting);
  winModal.hide();

  win.webContents.openDevTools();

  win.webContents.on('will-navigate', (e, url) => {
    const uri = new URL(url).host;
    if (uri === 'accounts.google.com') {
      e.preventDefault();
      winModal.show();
      winModal.loadURL(url);
    }
  });

  win.on('closed', () => {
    app.quit();
  });

  winModal.on('closed', () => {
    app.quit();
  });

  // win.openDevTools();
  
  Menu.setApplicationMenu(null);
  win.loadURL('https://www.youtube.com');
  connectorRPC();
};

rpc.on('ready', () => {
  checkYtData();
  // have it set at 5s to update on discord status 
  setInterval(checkYtData, 5e3);
});

app.on('ready', () => {
createWindow();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) {
      win.restore();
      return;
    }
    win.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.requestSingleInstanceLock();
