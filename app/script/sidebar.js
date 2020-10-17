'use strict'

const { app, dialog } = require('electron').remote
const { getProperty, $ } = require('./utils')
const fs = require('fs')
const path = require('path')
const dree = require('dree')

module.exports.updateSideBar = function () {
  const currentPath = getProperty('currentPath')
  const dreeTree = dree.scan(currentPath)
  $('#current-path').innerHTML = currentPath

  function getIcon(filename) {
    const ext = filename.split('.')
    const extToIcon = {
      asm: 'asm_icon.png',
      c: 'c_icon.png',
      folder: 'folder_icon.png'
    }
    const defaultIcon = '?'
    const  iconUrl = '../../asset/' + (extToIcon[ext] || defaultIcon)
    // TODO: 
  }

  function printTree(tree) {
    let res = ''
    if (tree) {
      res += '<ul>'
      if (tree.children)
        for (let children of tree.children)
          if (children.type == 'directory') res += `<li>${children.name}${printTree(children)}</li>`
          else res += `<li>${children.name}</li>`
      res += '<ul>'
    }
    return res
  }

  $('#tree-view').innerHTML = printTree(dreeTree)
}
