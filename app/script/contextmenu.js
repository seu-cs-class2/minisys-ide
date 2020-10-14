const { app, Menu } = require('electron').remote
const remote = require('electron').remote
var editorContextmenu = document.getElementById('editor')
const editor = window.editor

// copy-paste
// fs
// 

const contextMenuMenu = [
  {
    label: 'haha',
    accelerator: 'ctrl+x',
  },
  {
    label: '复制',
    accelerator: 'ctrl+c',
  },
  {
    label: '粘贴',
    accelerator: 'ctrl+v',
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

console.log(editor);
var m = Menu.buildFromTemplate(contextMenuMenu)

editorContextmenu.addEventListener('contextmenu', e => {
  e.preventDefault()
  m.popup({ window: remote.getCurrentWindow() })
})
