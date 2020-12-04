// 文件操作逻辑

'use strict'

const { setProperty, getProperty } = require('./utils')
const { dialog } = require('electron').remote
const fs = require('fs')
const path = require('path')
const { updateSideBarHigh } = require('./sidebar')

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
          let curOpenedDocs = getProperty('openedDocs')
          curOpenedDocs.push({
            path: getProperty('curFilePath'),
            session: new ace.EditSession(data)
          })
          editor.setSession(curOpenedDocs.slice(-1)[0].session)
          editor.moveCursorTo(0)
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
              editor.session.setMode(null)
              break
          }
          getProperty('currentUpPartFiles').push({
            name: path.basename(getProperty('curFilePath')),
            path: getProperty('curFilePath')
          })
          updateSideBarHigh(getProperty('curFilePath'), true)
        })
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
        console.error(err)
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
    dialog.showMessageBox({
      type: 'info',
      title: '提示',
      message: '保存成功！',
      button: ['确定'],
    })
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
