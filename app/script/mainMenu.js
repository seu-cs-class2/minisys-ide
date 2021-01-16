// 菜单栏逻辑

'use strict'

const { app, Menu, dialog } = require('electron').remote
const { setProperty, getProperty, $ } = require('./utils')
const { initSideBarLow } = require('./sidebar')
const child_process = require('child_process')
const { newFileDialog, openFileDialog, saveFileDialog } = require('./fileOperation')
const { invokeCompiler, invokeAssembler, invokeSerialPort } = require('./toolchain')
const path = require('path')
const fs = require('fs')

const editor = window.editor

const menuTemplate = [
  {
    label: '文件',
    submenu: [
      {
        label: '新建文件',
        accelerator: 'ctrl+n',
        click: async () => {
          await newFileDialog('新建文件')
          initSideBarLow(getProperty('currentPath'), $('#tree-view'), true)
        },
      },
      {
        label: '打开文件',
        accelerator: 'ctrl+o',
        click: openFileDialog,
      },
      {
        label: '打开工作区',
        click: async () => {
          const path = (await dialog.showOpenDialog({ properties: ['openFile', 'openDirectory'] })).filePaths[0]
          if (path) {
            setProperty('currentPath', path)
            initSideBarLow(path, $('#tree-view'), true)
            document.title = getProperty('currentPath') + ' - Minisys IDE'
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
          !getProperty('currentFilePath') ? newFileDialog('保存为') : saveFileDialog()
        },
      },
      {
        label: '另存为',
        accelerator: '',
        click: () => {
          newFileDialog('另存为')
        },
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
        click: () => {
          if (getProperty('currentFilePath') && getProperty('currentPath')) {
            const currentPath = getProperty('currentPath')
            const currentFilePath = getProperty('currentFilePath')
            // call compiler
            const compilerOutputPath = path.join(currentPath, './out', path.basename(currentFilePath), './')
            fs.mkdirSync(compilerOutputPath, { recursive: true })
            invokeCompiler(currentFilePath, compilerOutputPath)
            // call assembler
            const asmOutputFile = path.join(compilerOutputPath, path.basename(currentFilePath, '.c') + '.asm')
            const assemblerOutputPath = path.join(
              currentPath,
              './out',
              path.basename(currentFilePath, '.c') + '.asm',
              './'
            )
            fs.mkdirSync(assemblerOutputPath, { recursive: true })
            invokeAssembler(asmOutputFile, assemblerOutputPath, 1)
            // call serialport
            invokeSerialPort(path.join(assemblerOutputPath, 'serial.txt'))
          } else {
            dialog.showMessageBox({
              type: 'error',
              title: '错误',
              message: !getProperty('currentFilePath')
                ? '当前没有打开的文件，请打开一个.c文件后再尝试一键执行。'
                : '当前没有打开的工作区，请打开一个工作区后再尝试一键执行。',
              button: ['确定'],
            })
          }
        },
      },
      {
        label: '编译',
        accelerator: 'f6',
        click: () => {
          const currentPath = getProperty('currentPath')
          const currentFilePath = getProperty('currentFilePath')
          if (currentFilePath && currentPath) {
            const realOutputPath = path.join(currentPath, './out', path.basename(currentFilePath), './')
            fs.mkdirSync(realOutputPath, { recursive: true })
            invokeCompiler(currentFilePath, realOutputPath)
          } else {
            dialog.showMessageBox({
              type: 'error',
              title: '错误',
              message: !currentFilePath
                ? '当前没有打开的文件，请打开一个.c文件后再尝试编译。'
                : '当前没有打开的工作区，请打开一个工作区后再尝试编译。',
              button: ['确定'],
            })
          }
        },
      },
      {
        label: '汇编',
        accelerator: 'f7',
        click: () => {
          const currentPath = getProperty('currentPath')
          const currentFilePath = getProperty('currentFilePath')
          if (currentFilePath && currentPath) {
            const realOutputPath = path.join(currentPath, './out', path.basename(currentFilePath), './')
            fs.mkdirSync(realOutputPath, { recursive: true })
            invokeAssembler(currentFilePath, realOutputPath, 0)
          } else {
            dialog.showMessageBox({
              type: 'error',
              title: '错误',
              message: !getProperty('currentFilePath')
                ? '当前没有打开的文件，请打开一个.asm文件后再尝试汇编。'
                : '当前没有打开的工作区，请打开一个工作区后再尝试汇编。',
              button: ['确定'],
            })
          }
        },
      },
      {
        label: '汇编并链接',
        accelerator: 'f8',
        click: () => {
          const currentPath = getProperty('currentPath')
          const currentFilePath = getProperty('currentFilePath')
          if (currentFilePath && currentPath) {
            const realOutputPath = path.join(currentPath, './out', path.basename(currentFilePath), './')
            fs.mkdirSync(realOutputPath, { recursive: true })
            invokeAssembler(currentFilePath, realOutputPath, 1)
          } else {
            dialog.showMessageBox({
              type: 'error',
              title: '错误',
              message: !getProperty('currentFilePath')
                ? '当前没有打开的文件，请打开一个.asm文件后再尝试汇编。'
                : '当前没有打开的工作区，请打开一个工作区后再尝试汇编。',
              button: ['确定'],
            })
          }
        },
      },
      {
        label: '串口烧写',
        accelerator: 'f9',
        click: () => {
          invokeSerialPort('x.txt') // FIXME 暂时写法
        }
      },
    ],
  },
  {
    label: '设置',
    submenu: [
      {
        label: '编辑器设置',
        click: () => {
          window.open('./EditorSettings.html', '_blank', 'width=400,height=290,left=25%,frame=false,resizable=false')
        },
      },
      {
        label: '工具链设置',
        click: () => {
          window.open('./ToolchainSettings.html', '_blank', 'width=600,height=290,left=25%,frame=false,resizable=false')
        },
      },
      {
        type: 'separator',
      },
      {
        label: '显示终端',
        accelerator: 'f10',
        click: () => {
          $('#console').style.display = 'flex'
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
        label: '文档与关于',
        click: () => {
          child_process.exec(`start https://github.com/seu-cs-class2/minisys-ide/blob/master/README.md`)
        },
      },
    ],
  },
]

/**
 * 初始化上部菜单栏
 */
function initMainMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
}
module.exports.initMainMenu = initMainMenu
