// 侧边栏相关逻辑

'use strict'

const { getProperty, setProperty, $ } = require('./utils')
const dree = require('dree')
const path = require('path')
const fs = require('fs')

const EditorMode = {
  CCppMode: 'ace/mode/c_cpp',
  MipsMode: 'ace/mode/mips',
}

/**
 * 初始化侧边栏
 */
function initSideBar() {
  setProperty('openedDocs', [])

  setProperty('currentUpPartFiles', [])
  $('#refresh').addEventListener('click', () => {
    initSideBarLow(getProperty('currentPath'), $('#tree-view'), true)
  })

  // 设置下半部分（目录树）监听
  $('#tree-view').addEventListener('click', e => {
    e.stopPropagation()
    const target = e.target
    const dataset = target.dataset
    const currentUpPartFiles = getProperty('currentUpPartFiles')
    if (currentUpPartFiles.some(v => v.path == dataset.path)) return
    if (dataset.type == 'file') {
      // 更新文件开关状态
      currentUpPartFiles.push({
        path: dataset.path,
        name: dataset.name,
      })
      setProperty('curFilePath', dataset.path)
      if (getProperty('curFilePath')) {
        fs.readFile(getProperty('curFilePath'), 'utf8', (err, data) => {
          let curOpenedDocs = getProperty('openedDocs')
          curOpenedDocs.push({
            path: dataset.path,
            session: new ace.EditSession(data),
          })
          editor.setSession(curOpenedDocs.slice(-1)[0].session)
          editor.moveCursorTo(0)
          switch (path.extname(getProperty('curFilePath'))) {
            case '.c':
            case '.cpp':
            case '.h':
              editor.session.setMode(EditorMode.CCppMode)
              break
            case '.asm':
              editor.session.setMode(EditorMode.MipsMode)
              break
            default:
              editor.session.setMode(null)
              break
          }
        })
        updateSideBarHigh(dataset.path, true)
      }
    } else if (dataset.type == 'directory') {
      // 更新文件夹开关状态
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
      const closestUL = findClosestSibling(target, 'ul', true) // 这个目录下面文件的ul
      // 渲染孩子
      initSideBarLow(target.dataset['path'], closestUL)

      // 更新文件夹开闭图标
      const closestImg = findClosestSibling(target, 'img', false) // 这个目录的开闭图标
      closestImg.src = getIcon('directory', '', ['on', 'off'][Number(!!closestImg.src.match(/folderon/))])
    }
  })
  // 设置上半部分（工作区）监听
  $('#opened-view').addEventListener('click', e => {
    e.stopPropagation()
    const target = e.target
    const editor = window.editor
    console.log(target)
    const doc = getProperty('openedDocs').find(v => v.path == target.dataset.path)
    if (!doc) throw 'wtf'
    console.log(doc)
    window.debug = doc
    editor.setSession(doc.session)

    const ul = $('#opened-view > ul')
    let child = ul.firstChild
    const childs = [child]
    while (child != ul.lastChild) {
      child = child.nextSibling
      childs.push(child)
    }
    let origin = childs.find(v => v.firstChild.nextSibling.dataset.path == getProperty('curFilePath')).firstChild
      .nextSibling
    origin.style.backgroundColor = ''
    setProperty('curFilePath', target.dataset.path)
    target.style.backgroundColor = '#4169e1'
    switch (path.extname(getProperty('curFilePath'))) {
      case '.c':
      case '.cpp':
      case '.h':
        editor.session.setMode(EditorMode.CCppMode)
        break
      case '.asm':
        editor.session.setMode(EditorMode.MipsMode)
        break
      default:
        editor.session.setMode(null)
        break
    }
  })
}
module.exports.initSideBar = initSideBar

/**
 * 获取文件图标
 * @param {'file' | 'directory'} type
 * @param {string} filename
 * @param {'on' | 'off'} status
 */
function getIcon(type, filename, status) {
  let icon = ''
  if (type == 'directory') icon = `folder${status}_icon.png`
  else {
    const ext = path.extname(filename).substring(1)
    const extToIcon = {
      asm: 'asm_icon.png',
      c: 'c_icon.png',
    }
    const defaultIcon = 'default_icon.png'
    icon = extToIcon[ext] || defaultIcon
  }
  const iconUrl = '../../asset/' + icon
  return iconUrl
}

/**
 * 更新侧边栏上半部分（已打开的文件）
 */
function updateSideBarHigh(_path, defaultOpen) {
  $('#opened-view').innerHTML = ''
  const currentUpPartFiles = getProperty('currentUpPartFiles')
  let res = '<ul>'
  currentUpPartFiles.forEach(file => {
    res += `<li><img class="file-icon" src="${getIcon('file', `${file.name}`)}"></img><span data-path=${file.path} style="background-color: ${file.path == _path && defaultOpen ? '#4169e1' : ''}">${
      file.name
    }</span></li>`
  })
  res += '</ul>'
  $('#opened-view').innerHTML = res
}
module.exports.updateSideBarHigh = updateSideBarHigh

/**
 * 更新侧边栏下半部分（目录树）
 */
function initSideBarLow(clickedPath, dom, refresh) {
  const dreeTree = dree.scan(clickedPath, { depth: 1 })
  $('#current-path').innerHTML = getProperty('currentPath')

  if (dom.innerHTML.trim() == '' || refresh) {
    function printTree(tree) {
      let res = ''
      if (tree) {
        if (tree.children)
          for (let children of tree.children)
            if (children.type == 'directory')
              res += `<li>
            <img src="${getIcon('directory', '', 'off')}" class="file-icon"></img>
            <span data-path="${children.path}" data-type="directory" data-name="${children.name}">
             ${children.name}
            </span>
            <ul></ul>
            </li>`
            else
              res += `<li>
            <img src="${getIcon('file', children.name)}" class="file-icon"></img>
            <span data-path="${children.path}" data-type="file" data-name="${children.name}">
              ${children.name}
            </span>  
            </li>`
      }
      return res
    }
    dom.innerHTML = printTree(dreeTree)
  } else {
    let child = dom.firstChild
    console.log(dom)
    const childs = [child]
    while (child != dom.lastChild) {
      child = child.nextSibling
      childs.push(child)
    }
    childs
      .filter(node => node.nodeType == 1)
      .forEach(v => {
        console.log(v)
        // prettier-ignore
        v.style.display = ({ 'none': 'block', 'block': 'none' })[v.style.display.trim() || 'block']
      })
  }
}
module.exports.initSideBarLow = initSideBarLow
