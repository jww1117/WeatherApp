import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import icon from '../../resources/icon.png?asset'

// ------------------ Create Window ------------------
function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load dev URL or local file
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// ------------------ AutoUpdater ------------------
function setupAutoUpdater() {
  autoUpdater.autoDownload = false // manual download

  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox({
      type: 'info',
      buttons: ['Download', 'Later'],
      title: 'Update Available',
      message: `Version ${info.version} is available.`,
      detail: 'Do you want to download it now?'
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.downloadUpdate()
      }
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    dialog.showMessageBox({
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Update Ready',
      message: `Version ${info.version} downloaded.`,
      detail: 'Restart to install.'
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
  })
}

// ------------------ App Ready ------------------
app.whenReady().then(() => {
  // Windows app model ID
  electronApp.setAppUserModelId('com.desktop.weatherapp')

  // Dev shortcuts
  app.on('browser-window-created', (_, window) => optimizer.watchWindowShortcuts(window))

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Create main window
  createWindow()

  // Auto-updater only in production
  if (!is.dev) {
    setupAutoUpdater()
    autoUpdater.checkForUpdates()
  }

  // macOS re-activate
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit app when all windows closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})