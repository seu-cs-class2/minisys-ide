'use strict'

const { app, BrowserWindow } = require('electron')

// 禁用安全性警告
// FIXME: 暂时注释，避免隐藏调试时的错误
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

app.on('ready', async () => {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      worldSafeExecuteJavaScript: true,
    },
  })
  await win.loadFile('./app/view/index.html')
})

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
