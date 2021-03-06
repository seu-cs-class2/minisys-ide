// Ace Editor逻辑

'use strict'

const fs = require('fs')
const path = require('path')
const { dialog } = require('electron').remote
// 在 #editor 上新建 ace editor 实例
const editor = ace.edit('editor')

// 加载配置文件
let appSettings
const jsonPath = path.join(__dirname, '../../config/AppSettings.json')
fs.readFile(jsonPath, 'utf8', (err, data) => {
  if (err) {
    console.error(err)
    dialog.showMessageBox({
      type: 'error',
      title: '错误',
      message: '读取配置文件失败',
      button: ['确定'],
    })
  } else {
    appSettings = JSON.parse(data)
    editor.setTheme('ace/theme/' + appSettings.theme)
    // 设置语法高亮模式
    editor.session.setMode(null)
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

// 自定义代码联想内容。meta为联想注释、caption为联想下拉框显示的值
// value为联想替换的结果、score为优先级（数值越大越靠前）
let completerListJson
const completerDatabasePath = path.join(__dirname, '../../config/CompleterDatabase.json')
fs.readFile(completerDatabasePath, 'utf8', (err, data) => {
  if (err) {
    console.error(err)
    dialog.showMessageBox({
      type: 'error',
      title: '错误',
      message: '读取自定义代码联想文件失败',
      button: ['确定'],
    })
  } else {
    completerListJson = JSON.parse(data)['db']
  }
})
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
setCompleterData(completerListJson)

// 挂载Ace Editor对象到window
window.editor = editor

/**
 * 编辑器搜索功能
 */
const find = needle => {
  return function () {
    editor.find(needle, {
      backwards: false,
      warp: false,
      caseSensitive: false,
      wholeWord: false,
      regExp: false,
    })
  }
}
module.exports.find = find
