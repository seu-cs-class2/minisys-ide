const { newFileDialog, saveFileDialog } = require('./fsOperator')
const { $, getProperty } = require('./utils')

function func() {
  alert('该功能尚未开发完毕，请期待后续版本更新，或打赏我们支持我们的工作！')
}

const handlers = {
  'new-file': newFileDialog('新建文件'),
  save: () => {
    !getProperty('curFilePath') ? newFileDialog('保存为')() : saveFileDialog()
  },
  'save-as': newFileDialog('另存为'),
}

function initToolBar() {
  $('#toolbar').addEventListener('click', function (ev) {
    try {
      ;(handlers[ev.target.id] || func)()
    } catch (ex) {
      console.error(ex)
    }
  })
}
module.exports.initToolBar = initToolBar
