const { app, Menu, dialog } = require('electron').remote

// 在 #editor 上新建 ace editor 实例
const editor = ace.edit('editor')
const CCppMode = 'ace/mode/c_cpp'
const MipsMode = 'ace/mode/mips'
const fs = require('fs')
const path = require('path')

let curFilePath
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
              // if(res.filePaths.size()>1){
              //   console.log('不能选择超过一个文件')
              // }
              curFilePath = res.filePaths[0]
              if (curFilePath) {
                fs.readFile(curFilePath, 'utf8', (err, data) => {
                  if (err) {
                    console.log(err)
                  }
                  //console.log(data)
                  editor.setValue(data)
                })
                editor.moveCursorTo(0)
                console.log(path.extname(curFilePath))
                console.log(curFilePath)
                switch (path.extname(curFilePath)) {
                  case '.c':
                  case '.cpp':
                  case '.h':
                    editor.session.setMode(CCppMode)
                    console.log('change to cppmode')
                    break
                  case '.asm':
                    editor.session.setMode(MipsMode)
                    console.log('change to mipsmode')
                    break
                  default:
                    editor.session.setMode(CCppMode)
                    console.log('unknown filetype,change to cppmode')
                    break
                }
              }
            })
        },
      },
      {
        label: '保存',
        accelerator: 'ctrl+s',
        click: () => {
          console.log(curFilePath)
          if (curFilePath) {
            fs.writeFile(curFilePath, editor.getValue(), 'utf8', err => {
              console.log(editor.getValue())
              if (err) {
                console.log(err)
              } else {
                dialog
                  .showMessageBox({
                    type: 'info',
                    title: '保存成功！',
                    message: '保存成功！',
                    button: ['确定'],
                  })
                  .then(res => {
                    console.log(res)
                  })
              }
            })
          }
        },
      },
      {
        label: '另存为',
        accelerator: '',
        click: () => {
          dialog
            .showSaveDialog({
              title: '另存为..',
            })
            .then(res => {
              //console.log(editor.getValue())
              //console.log(res.filePath)
              if (res.filePath) {
                fs.writeFile(res.filePath, editor.getValue(), 'utf8', err => {
                  console.log(editor.getValue())
                  if (err) {
                    console.log(err)
                  } else {
                    dialog
                      .showMessageBox({
                        type: 'info',
                        title: '保存成功！',
                        message: '保存成功！',
                        button: ['确定'],
                      })
                      .then(res => {
                        console.log(res)
                      })
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
        click: () => {
          window.open('./app/view/editorSettings.html')
        },
      },
      {
        label: '工具链设置',
        click: () => {
          window.open('./app/view/toolbarSettings.html')
        },
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
//editor.setTheme('../../lib/mode-c_cpp.js')
//设置语法高亮模式
editor.session.setMode(CCppMode)
// TODO: 支持设置字体大小
editor.setFontSize(16)
//设置选中行高亮
editor.setHighlightActiveLine(true)
//设置代码补全
const completerList = [{ meta: '#include<>', caption: 'include', value: 'include1', score: 1 }]
let langTools = ace.require('ace/ext/language_tools')

var setCompleterData = function (completerList) {
  
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
