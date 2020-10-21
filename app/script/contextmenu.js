// 右键菜单逻辑

'use strict'

const { $ } = require('./utils')
const remote = require('electron').remote
const { Menu } = remote
const editorContextmenu = $('#editor')

const contextMenu = [
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
    label: '帮助',
    submenu: [
      {
        label: '关于',
      },
    ],
  },
]

const menu = Menu.buildFromTemplate(contextMenu)

editorContextmenu.addEventListener('contextmenu', e => {
  e.preventDefault()
  menu.popup({ window: remote.getCurrentWindow() })
})
