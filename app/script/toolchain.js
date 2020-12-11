const child_process = require('child_process')
const fs = require('fs')
const path = require('path')
const jsonPath = path.join(__dirname, '../../config/ToolchainSettings.json')
const dialog = require('electron').remote.dialog
const { $ } = require('./utils')

/**
 * 触发minisys-minicc-ts,生成asm文件
 * @param {*} sourceFilePath 待编译的文件的绝对路径
 * @param {*} outputPath 生成的asm文件的绝对路径
 */
module.exports.invokeCompiler = function (sourceFilePath, outputPath) {
  sourceFilePath = sourceFilePath.replace(/\\/g, '/')
  outputPath = outputPath.replace(/\\/g, '/')

  if (sourceFilePath) {
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
        $('#console').style.display = 'flex'
        toolchainSettings = JSON.parse(data)
        if (path.extname(sourceFilePath) == '.c') {
          let emiter = child_process.exec(
            `node ${toolchainSettings.compiler_path} ${sourceFilePath} -v -i -o ${outputPath}`,
            () => {
              $('#output').value += '\n'
            }
          )
          emiter.stdout.on('data', data => {
            $('#output').value += String(data)
            $('#output').scrollTop = $('#output').scrollHeight
          })
          emiter.stderr.on('data', data => {
            $('#output').value += String(data)
            $('#output').scrollTop = $('#output').scrollHeight
          })
        } else {
          dialog.showMessageBox({
            type: 'error',
            title: '错误',
            message: '当前打开的不是.c文件，请检查文件类型后重试！',
            button: ['确定'],
          })
        }
      }
    })
  } else {
    console.error('没有找到待编译的文件！')
  }
}

/**
 * 触发minsys-asm,生成一堆文件,包括两个coe和一个txt
 * @param {*} sourceFilePath 待汇编的文件的绝对路径
 * @param {*} outputPath 生成的文件们的绝对路径
 */
module.exports.invokeAssembler = function (sourceFilePath, outputPath) {
  sourceFilePath = sourceFilePath.replace(/\\/g, '/')
  outputPath = outputPath.replace(/\\/g, '/')

  if (sourceFilePath) {
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
        $('#console').style.display = 'flex'
        toolchainSettings = JSON.parse(data)
        if (path.extname(sourceFilePath) == '.asm') {
          let emiter = child_process.exec(
            `node ${toolchainSettings.assembler_path} ${sourceFilePath} ${outputPath}`,
            () => {
              $('#output').value += '\n'
            }
          )
          emiter.stdout.on('data', data => {
            $('#output').value += String(data)
            $('#output').scrollTop = $('#output').scrollHeight
          })
          emiter.stderr.on('data', data => {
            $('#output').value += String(data)
            $('#output').scrollTop = $('#output').scrollHeight
          })
        } else {
          dialog.showMessageBox({
            type: 'error',
            title: '错误',
            message: '当前打开的不是.asm文件，请检查文件类型后重试！',
            button: ['确定'],
          })
        }
      }
    })
  } else {
    console.error('没有找到待汇编的文件！')
  }
}
