const { app, Menu, dialog, BrowserWindow } = require('electron').remote
const { setProperty, getProperty } = require('./utils')
const { updateSideBarLow, initSideBar } = require('./sidebar')
const child_process = require('child_process')

// 在 #editor 上新建 ace editor 实例
const editor = ace.edit('editor')
const fs = require('fs')
const path = require('path')
const { newFileDialog, openFileDialog, saveFileDialog } = require('./fsOperator')
const { initToolBar } = require('./toolbar')
const { initMainMenu } = require('./mainMenu')

// 加载配置文件
let appSettings
const jsonPath = path.join(__dirname, '../../appSettings.json')
fs.readFile(jsonPath, 'utf8', (err, data) => {
  if (err) {
    console.log(err)
  } else {
    appSettings = JSON.parse(data)
    editor.setTheme('ace/theme/' + appSettings.theme)
    // 设置语法高亮模式
    editor.session.setMode('ace/mode/' + appSettings.hightlight_mode)
    editor.setFontSize(appSettings.font_size)
    // 设置选中行高亮
    editor.setHighlightActiveLine(true)
    // 设置代码补全
    editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
    })
  }
})

// 自定义代码联想内容 meta为联想注释 caption为联想下拉框显示的值
// value为联想替换的结果 score为优先级，数值越大越靠前
const completerList = [
  { meta: '#include1<>', caption: 'include', value: 'include1', score: 1 },
  { meta: '#include<>', caption: 'include1', value: 'include123', score: 2 },
]
const langTools = ace.require('ace/ext/language_tools')
const setCompleterData = function (completerList) {
  langTools.addCompleter({
    getCompletions: function (editor, session, pos, prefix, callback) {
      if (prefix.length === 0) {
        return callback(null, [])
      } else {
        return callback(null, completerList)
      }
    },
  })
}
setCompleterData(completerList)
window.editor = editor
