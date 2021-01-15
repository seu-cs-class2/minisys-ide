// 工具栏逻辑

'use strict'

const { newFileDialog, saveFileDialog } = require('./fileOperation')
const { invokeCompiler, invokeAssembler, invokeSerialPort } = require('./toolchain')
const { $, getProperty } = require('./utils')
const { initSideBarLow } = require('./sidebar')
const path = require('path')
const dialog = require('electron').remote.dialog
const fs = require('fs')

function defaultFunc() {
  alert('该功能尚未开发完毕，请期待后续版本更新，或打赏我们支持我们的工作！')
}

const handlers = {
  'new-file': async () => {
    await newFileDialog('新建文件')()
    initSideBarLow(getProperty('currentPath'), $('#tree-view'), true)
  },
  // prettier-ignore
  'save': () => {
    !getProperty('currentFilePath') ? newFileDialog('保存为') : saveFileDialog()
  },
  'save-as': () => {
    newFileDialog('另存为')
  },
  // prettier-ignore
  'compile': () => {
    const currentPath = getProperty('currentPath')
    const currentFilePath = getProperty('currentFilePath')
    if (currentFilePath && currentPath) {
      const realOutputPath = path.join(currentPath, './out', path.basename(currentFilePath), './')
      fs.mkdirSync(realOutputPath, {recursive: true})
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
  // prettier-ignore
  'assembly': () => {
    const currentPath = getProperty('currentPath')
    const currentFilePath = getProperty('currentFilePath')
    if (currentFilePath && currentPath) {
      const realOutputPath = path.join(currentPath, './out', path.basename(currentFilePath), './')
      fs.mkdirSync(realOutputPath, {recursive: true})
      invokeAssembler(currentFilePath, realOutputPath,0)
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
  'assembly-and-link': () => {
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
  serial: () => {
    const currentFilePath = getProperty('currentFilePath')
    if (currentFilePath) {
      invokeSerialPort(currentFilePath)
    } else {
      dialog.showMessageBox({
        type: 'error',
        title: '错误',
        message: !getProperty('currentFilePath')
          ? '当前没有打开的文件，请打开一个.txt文件后再尝试串口烧录。'
          : '当前没有打开的工作区，请打开一个工作区后再尝试串口烧录。',
        button: ['确定'],
      })
    }
  },
  'magic-click': () => {
    if (getProperty('currentFilePath') && getProperty('currentPath')) {
      const currentPath = getProperty('currentPath')
      const currentFilePath = getProperty('currentFilePath')
      // call compiler
      const compilerOutputPath = path.join(currentPath, './out', path.basename(currentFilePath), './')
      fs.mkdirSync(compilerOutputPath, { recursive: true })
      invokeCompiler(currentFilePath, compilerOutputPath)
      // call assembler
      const asmOutputFile = path.join(compilerOutputPath, path.basename(currentFilePath, '.c') + '.asm')
      const assemblerOutputPath = path.join(currentPath, './out', path.basename(currentFilePath, '.c') + '.asm', './')
      fs.mkdirSync(assemblerOutputPath, { recursive: true })
      invokeAssembler(asmOutputFile, assemblerOutputPath,1)
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
}

/**
 * 初始化上部工具栏
 */
function initToolBar() {
  $('#toolbar').addEventListener('click', ev => {
    // 点的不是图标就不处理
    if (ev.target.tagName.toLowerCase() != 'img') return
    try {
      ;(handlers[ev.target.id] || defaultFunc)()
    } catch (ex) {
      console.error(ex)
    }
  })
}
module.exports.initToolBar = initToolBar
