import { app, BrowserWindow, Menu, shell, dialog } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

// Enforce single application instance
const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  console.log('Another instance is already active. Exiting...');
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

async function createWindow() {
  const isDev = !app.isPackaged;
  const appPath = app.getAppPath();
  const iconPath = path.join(appPath, 'resources', 'icon.ico');

  mainWindow = new BrowserWindow({
    width: 1340,
    height: 890,
    minWidth: 980,
    minHeight: 640,
    title: 'Real Estate Viewing Coordinator',
    icon: iconPath,
    backgroundColor: '#FCFAF8',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Native Menu
  const menuTemplate: any[] = [
    {
      label: 'Application',
      submenu: [
        { role: 'reload', accelerator: 'CmdOrCtrl+R' },
        { role: 'forceReload', accelerator: 'CmdOrCtrl+Shift+R' },
        { type: 'separator' },
        { role: 'zoomIn', accelerator: 'CmdOrCtrl+=' },
        { role: 'zoomOut', accelerator: 'CmdOrCtrl+-' },
        { role: 'resetZoom', accelerator: 'CmdOrCtrl+0' },
        { type: 'separator' },
        { role: 'togglefullscreen', accelerator: 'F11' },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => mainWindow?.webContents.toggleDevTools(),
        },
        { type: 'separator' },
        { role: 'quit', accelerator: 'CmdOrCtrl+Q' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Online Project Repository',
          click: async () => {
            await shell.openExternal('https://github.com/void191/real-estate');
          },
        },
        {
          label: 'About Real Estate Viewing Coordinator',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'Real Estate Viewing Coordinator',
              message: 'Real Estate Viewing Coordinator Desktop v1.0.0',
              detail:
                'Luxury Real Estate Portfolio, Live GPS Radar, 4-Column Agent Queue, and Agency Governance.\n\nErbil & London Residences.',
              buttons: ['OK'],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Intercept external links (WhatsApp, Telegram, web, tel:, mailto:) to open in native handler
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('whatsapp:') ||
      url.startsWith('tg:') ||
      url.startsWith('mailto:') ||
      url.startsWith('tel:')
    ) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Guard in-page navigations from leaving the local application
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Load the compiled static Vite bundle directly from disk
  const indexPath = path.join(appPath, 'dist', 'index.html');
  console.log('Loading desktop bundle from:', indexPath);
  await mainWindow.loadFile(indexPath);

  if (isDev && process.env.OPEN_DEVTOOLS === 'true') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
