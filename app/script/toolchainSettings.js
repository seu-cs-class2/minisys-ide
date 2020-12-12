// 工具链配置逻辑

'use strict'

const fs = require('fs')
const { setPriority } = require('os')
const path = require('path')
const { dialog } = require('electron').remote
const jsonPath = path.join(__dirname, '../../config/ToolchainSettings.json')
// 注意，这里是个新窗口，拿不到 ./utils，因此自己做work-around
const $ = document.querySelector.bind(document)

let toolchainSettings
const compilerPathDOM = $('[name="compiler-path"]')
const assemblerPathDOM = $('[name="assembler-path"]')

// 读取配置，初始化菜单选项
fs.readFile(jsonPath, 'utf8', (err, data) => {
  if (err) {
    console.error(err)
    dialog.showMessageBox({
      type: 'error',
      title: '错误',
      message: '读取配置文件失败',
      button: ['确定'],
    })
  } else {
    toolchainSettings = JSON.parse(data)
    compilerPathDOM.innerHTML = toolchainSettings.compiler_path
    assemblerPathDOM.innerHTML = toolchainSettings.assembler_path
  }
})

document.querySelectorAll('.btn-path').forEach(
  v =>
    (v.onclick = function () {
      dialog
        .showOpenDialog({
          title: '选择文件...',
          filters: [
            {
              name: 'js文件',
              extensions: ['js'],
            },
          ],
        })
        .then(res => {
          if (res.filePaths[0]) {
            if (v.id == 'btn-compiler-path') {
              compilerPathDOM.innerHTML = res.filePaths[0]
            } else if (v.id == 'btn-assembler-path') {
              assemblerPathDOM.innerHTML = res.filePaths[0]
            }
          }
        })
    })
)

$('#btn-confirm').onclick = function () {
  toolchainSettings.compiler_path = compilerPathDOM.innerHTML
  toolchainSettings.assembler_path = assemblerPathDOM.innerHTML
  fs.writeFile(jsonPath, JSON.stringify(toolchainSettings, null, 2), async err => {
    if (err) {
      console.error(err)
      dialog.showMessageBox({
        type: 'error',
        title: '错误',
        message: '保存配置文件失败',
        button: ['确定'],
      })
    } else {
      // 实时预览
      await dialog.showMessageBox({
        type: 'info',
        title: '提示',
        message: '保存成功！',
        button: ['确定'],
      })
      window.close()
    }
  })
}

$('#btn-quit').onclick = function () {
  window.close()
}
