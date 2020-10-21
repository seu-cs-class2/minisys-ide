// 工具方法

'use strict'

/**
 * 获取暂存配置
 */
module.exports.getProperty = function (key) {
  return window.minisys_ide[key]
}

/**
 * 配置暂存
 */
module.exports.setProperty = function (key, val) {
  window.minisys_ide = window.minisys_ide || {}
  window.minisys_ide[key] = val
}

/**
 * 方便DOM元素选取
 */
module.exports.$ = document.querySelector.bind(document)
