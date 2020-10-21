// Minisys IDE 运行入口

// 加载热重载插件
if (process.env.NODE_ENV.trim() != 'production') {
  try {
    require('electron-reloader')(module, {
      ignore: ['./appSettings.json'],
    })
  } catch (_) {}
}

console.log(process.env.NODE_ENV);

// 加载首页
require('./app/script/index')
