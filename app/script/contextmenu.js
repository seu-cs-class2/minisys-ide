const { app, Menu } = require('electron').remote
const editorContextmenu = document.getElementById('editor')
const editor = window.editor

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

var m = Menu.buildFromTemplate(contextMenu)

editorContextmenu.addEventListener('contextmenu', e => {
  e.preventDefault()
  m.popup({ window: remote.getCurrentWindow() })
})
