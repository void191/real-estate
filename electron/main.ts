import { app, BrowserWindow, Menu, shell } from 'electron';
import path from 'path';
import { startAppServer, RunningServer } from './server-runner';

let mainWindow: BrowserWindow | null = null;
let serverInstance: RunningServer | null = null;

// Enforce single application instance
const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  console.log('Another instance is already running. Exiting...');
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

async function createWindow(serverPort: number) {
  const isDev = !app.isPackaged;
  const appPath = app.getAppPath();
  const iconPath = path.join(appPath, 'resources', 'icon.ico');

  mainWindow = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 980,
    minHeight: 640,
    title: 'Real Estate Viewing Coordinator',
    icon: iconPath,
    backgroundColor: '#FCFAF8',
    show: false, // Show once ready to avoid white flash
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  const appUrl = `http://127.0.0.1:${serverPort}`;

  // Custom Application Menu
  const menuTemplate: any[] = [
    {
      label: 'Navigation',
      submenu: [
        {
          label: 'Property Feed (Customer)',
          accelerator: 'CmdOrCtrl+1',
          click: () => mainWindow?.loadURL(appUrl),
        },
        {
          label: 'My Viewings',
          accelerator: 'CmdOrCtrl+2',
          click: () => mainWindow?.loadURL(`${appUrl}/viewings`),
        },
        {
          label: 'Saved Residences',
          accelerator: 'CmdOrCtrl+3',
          click: () => mainWindow?.loadURL(`${appUrl}/favorites`),
        },
        { type: 'separator' },
        {
          label: 'Agent Queue',
          accelerator: 'CmdOrCtrl+4',
          click: () => mainWindow?.loadURL(`${appUrl}/agent/queue`),
        },
        {
          label: 'Admin Operations',
          accelerator: 'CmdOrCtrl+5',
          click: () => mainWindow?.loadURL(`${appUrl}/admin`),
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload', accelerator: 'CmdOrCtrl+R' },
        { role: 'forceReload', accelerator: 'CmdOrCtrl+Shift+R' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => mainWindow?.webContents.toggleDevTools(),
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Real Estate Coordinator Documentation',
          click: async () => {
            await shell.openExternal('https://github.com/void191/real-estate');
          },
        },
        {
          label: 'About Real Estate Viewing Coordinator',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'Real Estate Viewing Coordinator',
              message: 'Real Estate Viewing Coordinator Desktop v1.0.0',
              detail:
                'Luxury Property Feed, Real-time GPS Location Radar, 4-Column Agent Queue, and Agency Governance.\n\nCrafted with Next.js 14, Electron, Socket.io, Leaflet, and Prisma.',
              buttons: ['OK'],
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Open external web links in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  await mainWindow.loadURL(appUrl);

  if (isDev && process.env.OPEN_DEVTOOLS === 'true') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function startApplication() {
  const isDev = !app.isPackaged;
  const projectDir = app.getAppPath();

  console.log('Initializing embedded Next.js & Socket.io server in Electron...');
  try {
    serverInstance = await startAppServer(3000, isDev, projectDir);
    await createWindow(serverInstance.port);
  } catch (err) {
    console.error('Failed to initialize desktop application server:', err);
    app.quit();
  }
}

app.whenReady().then(startApplication);

app.on('window-all-closed', async () => {
  if (serverInstance) {
    await serverInstance.stop();
    serverInstance = null;
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  if (serverInstance) {
    await serverInstance.stop();
    serverInstance = null;
  }
});
