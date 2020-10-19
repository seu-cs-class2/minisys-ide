const fs = require('fs')
const path = require('path')
const { dialog } = require('electron').remote
const jsonPath = path.join(__dirname, '../../appSettings.json')
// console.log(jsonPath)
let appSettings
let fontSize = document.getElementById('fontSize')
let theme = document.getElementById('theme')
const themeTable = ['ambiance', 'chaos', 'chrome', 'xcode', 'vibrant_ink', 'terminal', 'sqlserver', 'github']

fs.readFile(jsonPath, 'utf-8', (err, data) => {
  if (err) {
    console.log(err)
  } else {
    appSettings = JSON.parse(data)
    fontSize.value = appSettings.font_size
    theme.selectedIndex = themeTable.map(item => item).indexOf(appSettings.theme)
  }
  // console.log('appSettings')
  // console.log(appSettings.theme)
})

function confirmChange() {
  appSettings.font_size = parseInt(fontSize.value)
  //console.log(theme.options[theme.selectedIndex].value)
  appSettings.theme = theme.options[theme.selectedIndex].value
  fs.writeFile(jsonPath, JSON.stringify(appSettings), async (err) => {
    if (err) {
      console.log(err)
    } else {
    //   await dialog.showMessageBox({
    //     type: 'info',
    //     title: '保存成功！',
    //     message: '保存成功！',
    //     button: ['确定'],
    //   })
      window.opener.eval(`window.editor.setFontSize(${appSettings.font_size});window.editor.setTheme('ace/theme/${appSettings.theme}')`)
    }
  })
}
