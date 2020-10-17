const { Menu, dialog } = require('electron').remote
const { setProperty } = require('./utils')
const { updateSideBar } = require('./sidebar')

// 在 #editor 上新建 ace editor 实例
const editor = ace.edit('editor')
const CCppMode = 'ace/mode/c_cpp'

const menuTemplate = [
  {
    label: '文件',
    submenu: [
      {
        label: '打开文件',
      },
      {
        label: '保存文件',
      },
      {
        label: '打开文件夹',
        click: async () => {
          const path = (await dialog.showOpenDialog({ properties: ['openFile', 'openDirectory'] })).filePaths[0]
          setProperty('currentPath', path)
          updateSideBar()
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
        role: 'redo',
      },
      {
        label: '保存文件',
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

window.editor = editor
