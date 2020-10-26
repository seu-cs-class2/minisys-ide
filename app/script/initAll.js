// 初始化事件监听

'use strict'

require('./sidebar.js').initSideBar()
// FIXME: 在该时机才初始化菜单，则冷启动时会闪现默认菜单
require('./mainMenu.js').initMainMenu()
require('./toolbar.js').initToolBar()
