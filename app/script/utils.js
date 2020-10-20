module.exports.getProperty = function (key) {
  return window.minisys_ide[key]
}
module.exports.setProperty = function (key, val) {
  window.minisys_ide = window.minisys_ide || {}
  window.minisys_ide[key] = val
}
/**
 * not jquery
 */
module.exports.$ = document.querySelector.bind(document)