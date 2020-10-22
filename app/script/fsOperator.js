const { setProperty, getProperty } = require('./utils')
const fs = require('fs')
const { dialog } = require('electron').remote
const path = require('path')

const EditorMode = {
  CCppMode: 'ace/mode/c_cpp',
  MipsMode: 'ace/mode/mips',
}

/**
 * 打开文件
 */
const openFile = () => {
  dialog
    .showOpenDialog({
      title: '打开文件..',
    })
    .then(res => {
      setProperty('curFilePath', res.filePaths[0])
      if (getProperty('curFilePath')) {
        fs.readFile(getProperty('curFilePath'), 'utf8', (err, data) => {
          editor.setValue(data)
          editor.moveCursorTo(0)
        })
        switch (path.extname(getProperty('curFilePath'))) {
          case '.c':
          case '.cpp':
          case '.h':
            editor.session.setMode(EditorMode.CCppMode)
            break
          case '.asm':
            editor.session.setMode(EditorMode.MipsMode)
            break
          default:
            editor.session.setMode(EditorMode.CCppMode) // FIXME: 应为无高亮模式
            break
        }
      }
    })
}
module.exports.openFileDialog = openFile

/**
 * 保存至打开的文件
 */
const saveFile = () => {
  if (getProperty('curFilePath')) {
    fs.writeFile(getProperty('curFilePath'), editor.getValue(), 'utf8', err => {
      if (err) {
        console.log(err)
      } else {
        dialog.showMessageBox({
          type: 'info',
          title: '提示',
          message: '保存成功！',
          button: ['确定'],
        })
      }
    })
  } else {
  }
}
module.exports.saveFileDialog = saveFile

/**
 * 新建文件并保存
 */
const newFile = title => {
  return function () {
    dialog
      .showSaveDialog({
        title,
      })
      .then(res => {
        if (res.filePath) {
          fs.writeFile(res.filePath, editor.getValue(), 'utf8', err => {
            if (err) {
              console.log(err)
            } else {
              dialog
                .showMessageBox({
                  type: 'info',
                  title: '提示',
                  message: '保存成功！',
                  button: ['确定'],
                })
                .then(res1 => {
                  // TODO: ?
                  setProperty('curFilePath', res.filePath)
                })
            }
          })
        }
      })
  }
}
module.exports.newFileDialog = newFile
