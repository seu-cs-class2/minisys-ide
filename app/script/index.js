'use strict'

const { app, BrowserWindow } = require('electron')
const path = require('path')

// 禁用安全性警告
// FIXME: 暂时注释，避免隐藏调试时的错误
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

app.on('ready', () => {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      worldSafeExecuteJavaScript: true,
    },
    icon: path.join(__dirname, '../../asset/favicon.ico')
  })
  win.loadFile('./app/view/index.html')
  // win.webContents.openDevTools()
})

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
