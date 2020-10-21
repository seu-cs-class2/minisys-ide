const { app, BrowserWindow } = require('electron')

//禁用安全性警告
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

app.on('ready', () => {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  })
  win.loadFile('./app/view/index.html')
  //win.webContents.openDevTools()
})

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
