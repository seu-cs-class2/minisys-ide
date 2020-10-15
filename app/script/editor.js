const { app, Menu, dialog } = require('electron').remote

// 在 #editor 上新建 ace editor 实例
const editor = ace.edit('editor')
const CCppMode = 'ace/mode/c_cpp'
const fs = require('fs')
const path = require('path')
const { compileFunction } = require('vm')

const menuTemplate = [
  {
    label: '文件',
    submenu: [
      {
        label: '打开文件',
        accelerator: 'ctrl+o',
        click: () => {
          // fileSelector.click()
          dialog
            .showOpenDialog({
              title: '打开文件..',
            })
            .then(res => {
              //console.log(res.filePaths[0])
              if (res.filePaths[0]) {
                fs.readFile(res.filePaths[0], 'utf8', (err, data) => {
                  if (err) {
                    console.log(err)
                  }
                  console.log(data)
                  editor.setValue(data)
                  editor.moveCursorTo(0)
                })
              }
            })
        },
      },
      {
        label: '保存文件',
        accelerator: 'ctrl+s',
        click: () => {
          dialog
            .showSaveDialog({
              title: '保存文件..',
            })
            .then(res => {
              console.log(editor.getValue())
              console.log(res.filePath)
              if (res.filePath) {
                fs.writeFile(res.filePath, editor.getValue(), 'utf8', err => {
                  console.log(editor.getValue())
                  if (err) {
                    console.log(err)
                  } else {
                    console.log('save done!')
                  }
                })
              }
            })
        },
      },
    ],
  },
  {
    label: '编辑',
    submenu: [
      {
        label: '撤销',
        accelerator: 'ctrl+z',
        role: 'undo',
      },
      {
        label: '重做',
        accelerator: 'ctrl+y',
        role: 'redo',
      },
    ],
  },
  {
    label: '设置',
    submenu: [
      {
        label: '编辑器设置',
      },
      {
        label: '工具链设置',
      },
      {
        label: '开发者工具',
        accelerator: 'f12',
        role: 'toggledevtools',
      },
    ],
  },
  {
    label: '帮助',
    submenu: [
      {
        label: '关于',
      },
    ],
  },
]
Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))

// TODO: 支持更换主题
// editor.setTheme('ace/theme/github')
editor.session.setMode(CCppMode)
// TODO: 支持设置字体大小
editor.setFontSize(16)
editor.setHighlightActiveLine(true)
//editor.setTheme('../../lib/mode-c_cpp.js')

window.editor = editor
