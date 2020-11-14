// 侧边栏相关逻辑

'use strict'

const { getProperty, setProperty, $ } = require('./utils')
const dree = require('dree')
const path = require('path')

/**
 * 初始化侧边栏
 */
function initSideBar() {
  setProperty('currentOpenedFiles', [])
  $('#tree-view').addEventListener('click', e => {
    e.stopPropagation()
    const target = e.target
    const dataset = target.dataset
    const currentOpenedFiles = getProperty('currentOpenedFiles')
    if (currentOpenedFiles.some(v => v.path == dataset.path)) return
    if (dataset.type == 'file') {
      // 更新文件开关状态
      currentOpenedFiles.push({
        path: dataset.path,
        name: dataset.name,
      })
      updateSideBarHigh()
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
      const closestUL = findClosestSibling(target, 'ul', true)
      let child = closestUL.firstChild
      const childs = [child]
      while (child != closestUL.lastChild) {
        child = child.nextSibling
        childs.push(child)
      }
      childs
        .filter(node => node.nodeType == 1)
        .forEach(v => {
          // prettier-ignore
          v.style.display = ({ 'none': 'block', 'block': 'none' })[v.style.display.trim() || 'block']
        })
      // 更新文件夹开闭图标
      const closestImg = findClosestSibling(target, 'img', false)
      closestImg.src = getIcon('directory', '', ['on', 'off'][Number(!!closestImg.src.match(/folderon/))])
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
function updateSideBarHigh() {
  $('#opened-view').innerHTML = ''
  const currentOpenedFiles = getProperty('currentOpenedFiles')
  let res = '<ul>'
  currentOpenedFiles.forEach(file => {
    res += `<li><img class="file-icon" src="${getIcon('file', `${file.name}`)}"></img><span>${file.name}</span></li>`
  })
  res += '</ul>'
  $('#opened-view').innerHTML = res
}
module.exports.updateSideBarHigh = updateSideBarHigh

/**
 * 更新侧边栏下半部分（目录树）
 */
function updateSideBarLow() {
  const currentPath = getProperty('currentPath')
  const dreeTree = dree.scan(currentPath)
  $('#current-path').innerHTML = currentPath

  function printTree(tree) {
    let res = ''
    if (tree) {
      res += '<ul>'
      if (tree.children)
        for (let children of tree.children)
          if (children.type == 'directory')
            res += `<li>
            <img src="${getIcon('directory', '', 'on')}" class="file-icon"></img>
            <span data-path="${children.path}" data-type="directory" data-name="${children.name}">
             ${children.name}
            </span>
            ${printTree(children)}
            </li>`
          else
            res += `<li>
            <img src="${getIcon('file', children.name)}" class="file-icon"></img>
            <span data-path="${children.path}" data-type="file" data-name="${children.name}">
              ${children.name}
            </span>
            </li>`
      res += '</ul>'
    }
    return res
  }

  $('#tree-view').innerHTML = printTree(dreeTree)
}
module.exports.updateSideBarLow = updateSideBarLow
