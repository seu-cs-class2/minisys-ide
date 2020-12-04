// 菜单栏逻辑

'use strict'

const { app, Menu, dialog } = require('electron').remote
const { setProperty, getProperty, $ } = require('./utils')
const { initSideBarLow } = require('./sidebar')
const child_process = require('child_process')
const { newFileDialog, openFileDialog, saveFileDialog } = require('./fileOperation')

const menuTemplate = [
  {
    label: '文件',
    submenu: [
      {
        label: '新建文件',
        accelerator: 'ctrl+n',
        click: newFileDialog('新建文件'),
      },
      {
        label: '打开文件',
        accelerator: 'ctrl+o',
        click: openFileDialog,
      },
      {
        label: '打开文件夹',
        click: async () => {
          const path = (await dialog.showOpenDialog({ properties: ['openFile', 'openDirectory'] })).filePaths[0]
          if (path) {
            setProperty('currentPath', path)
            initSideBarLow(path, $('#tree-view'), true)
          }
        },
      },
      {
        type: 'separator',
      },
      {
        label: '保存',
        accelerator: 'ctrl+s',
        click: () => {
          !getProperty('curFilePath') ? newFileDialog('保存为')() : saveFileDialog()
        },
      },
      {
        label: '另存为',
        accelerator: '',
        click: newFileDialog('另存为'),
      },
      {
        type: 'separator',
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
        type: 'separator',
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
        type: 'separator',
      },
      {
        label: '查找',
        accelerator: 'ctrl+f',
        click: () => {
          editor.execCommand('find')
        },
      },
      {
        label: '替换',
        accelerator: 'ctrl+h',
        click: () => {
          editor.execCommand('replace')
        },
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
        click: () => {
          window.open('./EditorSettings.html', '_blank', 'width=400,height=300,left=25%,frame=false,resizable=false')
        },
      },
      {
        label: '工具链设置',
        click: () => {
          window.open('./ToolchainSettings.html', '_blank', 'width=600,height=400,left=25%,frame=true,resizable=false')
        },
      },
      {
        type: 'separator',
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

function initMainMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
}
module.exports.initMainMenu = initMainMenu
