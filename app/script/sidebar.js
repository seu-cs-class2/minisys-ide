// 侧边栏相关逻辑

'use strict'

const dree = require('dree')
const path = require('path')
const fs = require('fs')
const prompt = require('electron-prompt')
const { dialog } = require('electron').remote

const { getProperty, setProperty, $, getHighlightMode, getIcon } = require('./utils')
const { saveSessionToFile, newFileDialog } = require('./fileOperation')

/**
 * 初始化侧边栏
 */
function initSideBar() {
  setProperty('openedDocs', [])

  // 刷新按钮按下时重新渲染下部文件树
  $('#refresh').addEventListener('click', () => {
    initSideBarLow(getProperty('currentPath'), $('#tree-view'), true)
  })

  // 下部的新建文件按钮响应
  $('#newFile').addEventListener('click', async () => {
    await newFileDialog('新建文件')
    initSideBarLow(getProperty('currentPath'), $('#tree-view'), true)
  })

  // 下部的新建文件夹按钮响应
  $('#newFolder').addEventListener('click', async () => {
    if (getProperty('currentPath')) {
      let folderName = await prompt({
        title: '请输入...',
        label: '文件夹名：',
        value: '新建文件夹',
      })
      // 如有重复文件夹，则弹出提示框
      if (folderName)
        fs.mkdir(`${getProperty('currentPath')}/${folderName}`, err => {
          err && dialog.showErrorBox('错误', '文件夹重复，请检查！')
        })
      // 刷新
      initSideBarLow(getProperty('currentPath'), $('#tree-view'), true)
    }
  })

  // 设置下半部分（目录树）监听
  $('#tree-view').addEventListener('click', e => {
    e.stopPropagation()

    const target = e.target
    const dataset = target.dataset
    const editor = window.editor
    const openedDocs = getProperty('openedDocs')

    // 如果文件已被打开到上部，则跳过
    if (openedDocs.some(v => v.path == dataset.path)) return

    // 类型是文件
    if (dataset.type == 'file') {
      // 更新文件开关状态
      const docToAdd = {
        path: dataset.path,
        name: dataset.name,
        modified: false,
        session: undefined,
      }
      setProperty('currentFilePath', dataset.path)
      if (getProperty('currentFilePath')) {
        fs.readFile(getProperty('currentFilePath'), 'utf8', (err, data) => {
          err && dialog.showErrorBox('错误', String(err))
          // 为新打开的文件新建一个Session
          docToAdd.session = new ace.EditSession(data)
          // 为了实现文件被修改的检测功能，监听Session的change事件
          docToAdd.session.on('change', e => {
            if (openedDocs.find(v => v.path == dataset.path).modified == false) {
              openedDocs.find(v => v.path == dataset.path).modified = true
              updateSideBarHigh(getProperty('currentFilePath'), true)
            }
          })
          // 设置高亮模式
          docToAdd.session.setMode(getHighlightMode(path.extname(getProperty('currentFilePath'))))
          // 加入全局属性，统一管理
          openedDocs.push(docToAdd)
          // 更新侧边栏上部
          updateSideBarHigh(dataset.path, true)
          // 更新editor状态
          editor.setSession(openedDocs.slice(-1)[0].session)
          editor.moveCursorTo(0)
        })
      }
    } else if (dataset.type == 'directory') {
      // 更新文件夹开关状态（主要是图标和展开逻辑的不同）
      /**
       * 寻找最近的兄弟姐妹结点
       */
      function findClosestSibling(dom, label, mustAfter) {
        let on = !mustAfter
        let res = void 0
        dom.parentNode.childNodes.forEach(node => {
          if (node == dom) on = true
          if (on && node.nodeType == 1 && node.tagName.toLowerCase() == label.toLowerCase()) {
            res = node
            return
          }
        })
        return res
      }
      // 用来渲染这个目录下面的孩子的ul
      const closestUL = findClosestSibling(target, 'ul', true)
      // 渲染孩子
      initSideBarLow(target.dataset['path'], closestUL)
      // 更新文件夹开闭图标
      const closestImg = findClosestSibling(target, 'img', false)
      closestImg.src = getIcon('directory', '', ['on', 'off'][Number(!!closestImg.src.includes('folderon'))])
    }
  })

  // 设置上半部分（工作区）监听
  $('#opened-view').addEventListener('click', e => {
    e.stopPropagation()

    const target = e.target
    const editor = window.editor
    let doc

    function removeSessionHandler(doc) {
      let openedDocs = getProperty('openedDocs')
      // 不是取消，则从已打开的doc列表中去掉它
      setProperty(
        'openedDocs',
        openedDocs.filter(v => v.path != doc.path)
      )
      openedDocs = getProperty('openedDocs')
      // 如果关的刚好是当前正在看的，则要换一个文件来显示
      if (getProperty('currentFilePath') == doc.path) {
        if (openedDocs.length >= 1) {
          // 取第一个文件来显示
          updateSideBarHigh(openedDocs[0].path, true)
          editor.setSession(openedDocs[0].session)
          setProperty('currentFilePath', openedDocs[0].path)
        } else {
          // 实在没文件可以显示，就恢复初始状态
          updateSideBarHigh('', false)
          editor.setValue('')
          setProperty('currentFilePath', '')
        }
      } else {
        // 关的不是当前正在看的，就直接关
        updateSideBarHigh(getProperty('currentFilePath'), true)
      }
    }

    switch (target.className) {
      // 如果点到的是关闭图标
      case 'close-icon':
        const openedDocs = getProperty('openedDocs')
        // lastChild是文件名span
        doc = openedDocs.find(v => v.path == target.parentNode.lastChild.dataset.path)
        // 如果被改过，关闭前要提示
        if (doc.modified) {
          dialog
            .showMessageBox({
              type: 'info',
              title: '提示',
              message: '你有尚未保存的改动，确定要退出吗？',
              buttons: ['不保存并退出', '保存并退出', '取消'], // response = 0, 1, 2
              noLink: true,
            })
            .then(res => {
              if (res.response == 1) {
                // 保存并退出
                saveSessionToFile(doc.session, doc.path)
              }
              if (res.response != 2) {
                removeSessionHandler(doc)
              }
            })
        }
        // 如果没被改过就不用考虑提示了，直接走后续的逻辑
        else {
          removeSessionHandler(doc)
        }
        break
      // 如果点到其他部位，就处理换文件的逻辑
      default:
        // 取当前要换的文件的doc
        doc = getProperty('openedDocs').find(v => v.path == target.dataset.path)
        if (!doc) throw new Error('点到了奇怪的东西')
        // 换session
        editor.setSession(doc.session)
        // 重新渲染上部
        const ul = $('#opened-view > ul') // 上部的整棵树
        const children = Array.from(ul.childNodes) // 树里的节点（打开的文件）
        // 老文件的span，把背景色去掉
        console.log(children)
        const origin = children.find(v => v.lastChild.dataset.path == getProperty('currentFilePath')).lastChild
        origin.style.backgroundColor = ''
        // 更新属性
        setProperty('currentFilePath', target.dataset.path)
        // 给新文件上色
        target.style.backgroundColor = '#039BE5'
        break
    }
  })
}
module.exports.initSideBar = initSideBar

/**
 * 更新侧边栏上半部分（已打开的文件）
 */
function updateSideBarHigh(_path, defaultOpen) {
  $('#opened-view').innerHTML = ''
  const openedDocs = getProperty('openedDocs')
  let res = '<ul>'
  openedDocs.forEach(file => {
    res += `<li>
    <img src="../../asset/close_icon.png" class="close-icon"/>
    <img class="file-icon" src="${getIcon('file', `${file.name}`)}"></img><span data-path="${
      file.path
    }" style="background-color: ${file.path == _path && defaultOpen ? '#039BE5' : ''}">${
      (file.modified ? '* ' : '') + file.name
    }</span></li>`
  })
  res += '</ul>'
  $('#opened-view').innerHTML = res
}
module.exports.updateSideBarHigh = updateSideBarHigh

/**
 * 更新侧边栏下半部分（目录树）
 * dom是要更新的文件夹的根的dom（ul）
 */
function initSideBarLow(clickedPath, dom, refresh) {
  console.log(dom)
  // 一层一层打开
  const dreeTree = dree.scan(clickedPath, { depth: 1 })
  // 更新当前打开目录的显示
  $('#current-path').innerHTML = getProperty('currentPath')
  // 该层级初始化渲染或者刷新时，重渲整个树结构
  if (dom.innerHTML.trim() == '' || refresh) {
    dom.innerHTML = (function (tree) {
      let res = ''
      if (tree && tree.children) {
        for (let children of tree.children)
          if (children.type == 'directory')
            res += `<li>
            <img src="${getIcon('directory', '', 'off')}" class="file-icon"></img>
            <span data-path="${children.path}" data-type="directory" data-name="${children.name}">
             ${children.name}
            </span>
            <ul></ul>
            </li>`
        for (let children of tree.children)
          if (children.type == 'file')
            res += `<li>
            <img src="${getIcon('file', children.name)}" class="file-icon"></img>
            <span data-path="${children.path}" data-type="file" data-name="${children.name}">
              ${children.name}
            </span>
            </li>`
      }
      return res
    })(dreeTree)
  }
  // 如果已经探索过该层级，则只要更新显隐状态即可
  else {
    const children = Array.from(dom.childNodes)
    children
      .filter(node => node.nodeType == 1) // 非#text节点
      .forEach(v => {
        // prettier-ignore
        v.style.display = ({ 'none': 'block', 'block': 'none' })[v.style.display.trim() || 'block']
      })
  }
}
module.exports.initSideBarLow = initSideBarLow
