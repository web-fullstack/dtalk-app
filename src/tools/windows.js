/**
 * 各种窗口创建
 * @author yutent<yutent.io@gmail.com>
 * @date 2019/01/26 18:28:22
 */

const { join } = require('path')
const { BrowserWindow } = require('electron')

/**
 * 应用主窗口
 */
exports.createMainWindow = function (icon) {
  // 创建浏览器窗口
  let win = new BrowserWindow({
    title: '钉钉-electron版',
    width: 1000,
    height: 602,
    resizable: false,
    // frame: false,
    icon,
    webPreferences: {
      webSecurity: false,
      experimentalFeatures: true,
      // nodeIntegration: true,
      preload: join(__dirname, './inject.js')
    },
    show: false
  })

  win.loadURL('https://im.dingtalk.com')

  win.on('ready-to-show', _ => {
    win.show()

    // win.openDevTools()
  })

  win.webContents.on('dom-ready', ev => {
    win.webContents.executeJavaScript(
      `
      $(document).on('click', 'a[href^="http"]', function(event) {
          if(!this.hasAttribute('nwdirectory')){
            event.preventDefault();
            electron.open(this.href)
          }
      });

      localStorage.setItem("isBeepOpen", "true");
      localStorage.setItem("notification", "true");
      localStorage.setItem("newUserState", "secTip");
      localStorage.setItem("latest_lang_info", "zh_CN");
      localStorage.setItem("login_method", "autoLogin");
      
      
      let cache = electron.readToken()

      
      if(cache){
        cache = JSON.parse(cache)
        sessionStorage.setItem('wk_device_id', cache.id)
        sessionStorage.setItem('wk_token', cache.token)
        
        electron.restoreCookie()

        // 第一次进来刷新一下页面, 才会自动登录
        if(!sessionStorage.getItem('first_in')){
          sessionStorage.setItem('first_in', 1)
          setTimeout(function(){
            location.reload()
          }, 2000)
        }

        function checkUnReadMsg() {

          window.__timer = setTimeout(function() {
            var $box = document.body.querySelector('.conv-lists-box')
            var $unread = $box.querySelectorAll('.unread-num')

            electro($unread.length > 0)
            clearTimeout(window.__timer)
            checkUnReadMsg()
          }, 1500)
        }

        checkUnReadMsg()
      }

      
      `,
      true
    )
  })

  win.on('close', ev => {
    ev.preventDefault()
    win.webContents.executeJavaScript(
      `
        if(sessionStorage.getItem('wk_token')){

          electron.saveCookie()

          electron.saveToken(
            sessionStorage.getItem('wk_device_id'),
            sessionStorage.getItem('wk_token')
          )
        }
      
      `,
      true
    )
    win.hide()
  })

  win.on('page-title-updated', ev => {
    ev.preventDefault()
  })

  return win
}
