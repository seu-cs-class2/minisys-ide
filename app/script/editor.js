const { app, Menu, dialog, BrowserWindow } = require('electron').remote
const { setProperty } = require('./utils')
const { updateSideBarLow, initSideBar } = require('./sidebar')
const child_process = require('child_process')

// 在 #editor 上新建 ace editor 实例
const editor = ace.edit('editor')
const EditorMode = {
  CCppMode: 'ace/mode/c_cpp',
  MipsMode: 'ace/mode/mips',
}
const fs = require('fs')
const path = require('path')

let curFilePath

/**
 * 打开文件
 */
const openFile = () => {
  dialog
    .showOpenDialog({
      title: '打开文件..',
    })
    .then(res => {
      curFilePath = res.filePaths[0]
      if (curFilePath) {
        fs.readFile(curFilePath, 'utf8', (err, data) => {
          editor.setValue(data)
          editor.moveCursorTo(0)
        })
        switch (path.extname(curFilePath)) {
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

/**
 * 保存至打开的文件
 */
const saveFile = () => {
  if (curFilePath) {
    fs.writeFile(curFilePath, editor.getValue(), 'utf8', err => {
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

/**
 * 新建文件并保存
 */
const newFile = () => {
  dialog
    .showSaveDialog({
      title: '另存为..',
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
                curFilePath = res.filePath
              })
          }
        })
      }
    })
}

const menuTemplate = [
  {
    label: '文件',
    submenu: [
      {
        label: '新建文件',
        accelerator: 'ctrl+n',
        click: newFile,
      },
      {
        label: '打开文件',
        accelerator: 'ctrl+o',
        click: openFile,
      },
      {
        label: '打开文件夹',
        click: async () => {
          const path = (await dialog.showOpenDialog({ properties: ['openFile', 'openDirectory'] })).filePaths[0]
          if (path) {
            setProperty('currentPath', path)
            updateSideBarLow()
          }
        },
      },
      {
        label: '保存',
        accelerator: 'ctrl+s',
        click: () => {
          curFilePath === undefined ? newFile() : saveFile()
        },
      },
      {
        label: '另存为',
        accelerator: '',
        click: newFile,
      },
      {
        label: '退出',
        accelerator: 'alt+f4',
        click: () => {
          app.quit()
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
      {
        label: '全选',
        accelerator: 'ctrl+a',
        role: 'selectall',
      },
      {
        label: '剪切',
        accelerator: 'ctrl+x',
        role: 'cut',
      },
      {
        label: '复制',
        accelerator: 'ctrl+c',
        role: 'copy',
      },
      {
        label: '粘贴',
        accelerator: 'ctrl+v',
        role: 'paste',
      },
      {
        label: '查找',
        accelerator: 'ctrl+f',
        role: 'paste',
      },
      {
        label: '替换',
        accelerator: 'ctrl+h',
        role: 'paste',
      },
    ],
  },
  {
    label: '运行',
    submenu: [
      {
        label: '一键执行',
        accelerator: 'f5',
      },
      {
        label: '编译',
        accelerator: 'f6',
      },
      {
        label: '汇编',
        accelerator: 'f7',
      },
      {
        label: '串口烧写',
        accelerator: 'f8',
      },
    ],
  },
  {
    label: '设置',
    submenu: [
      {
        label: '编辑器设置',
        // FIXME:
        click: () => {
          window.open('./EditorSettings.html', '_blank', 'width=400,height=300,left=25%,frame=false,resizable=false')
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
        label: '文档',
        click: () => {
          child_process.exec(`start https://github.com/seu-cs-class2/minisys-ide/blob/master/README.md`)
        },
      },
      {
        label: '关于',
      },
    ],
  },
]
Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))

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

initSideBar()

window.editor = editor
