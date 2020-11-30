// 工具栏逻辑

'use strict'

const { newFileDialog, saveFileDialog } = require('./fileOperation')
const { $, getProperty } = require('./utils')

function defaultFunc() {
  alert('该功能尚未开发完毕，请期待后续版本更新，或打赏我们支持我们的工作！')
}

const handlers = {
  'new-file': newFileDialog('新建文件'),
  // prettier-ignore
  'save': () => {
    !getProperty('curFilePath') ? newFileDialog('保存为')() : saveFileDialog()
  },
  'save-as': newFileDialog('另存为'),
  toolbar: () => {},
}

function initToolBar() {
  $('#toolbar').addEventListener('click', function (ev) {
    if (ev.target.tagName.toLowerCase() != 'img') return
    try {
      ;(handlers[ev.target.id] || defaultFunc)()
    } catch (ex) {
      console.error(ex)
    }
  })
}
module.exports.initToolBar = initToolBar
