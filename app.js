// Minisys IDE 运行入口

// 加载热重载插件
try {
  require('electron-reloader')(module, {
    ignore:[
      './appSettings.json'
    ]
  })
} catch (_) {}

// 加载首页
require('./app/script/index')