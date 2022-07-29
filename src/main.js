// electron
const { app, session, Menu, ipcMain } = require('electron')

// node.js
const { join } = require('path')
const fs = require('fs')

// tools
const { createMainWindow } = require('./tools/windows')
const createTray = require('./tools/tray')

const ROOT = __dirname;

const APP_DIR = join(app.getPath('appData'), './dtalk')
const sessionFile = join(APP_DIR, './login_session.json')
const cookieFile = join(APP_DIR, './login_cookie.json')

//
app.commandLine.appendSwitch('lang', 'zh-CN')
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required')

//
Menu.setApplicationMenu(null);

//  初始化应用
app.once('ready', () => {
  // 修改app的UA
  session.defaultSession.setUserAgent(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36'
  )
  // console.log('ROOT =', ROOT);
  // ROOT = /Users/xgqfrms-mbp/Documents/GitHub/dtalk-app/src
  let win = createMainWindow(join(ROOT, './icons/app.png'))
  // console.log('process', process);
  if (process.platform === 'darwin') {
    app.dock.setIcon(join(ROOT, './icons/app.png'));
  }
  app.toggleTray = createTray(win)
})

ipcMain.on('app', (ev, conn) => {
  switch (conn.type) {
    case 'saveToken':
      fs.writeFile(sessionFile, conn.data, function (err) {})
      ev.returnValue = true
      break;
    case 'readToken':
      // {} 块级作用域
      {
        let cache = ''
        try {
          cache = fs.readFileSync(sessionFile).toString()
        } catch (err) {}
        ev.returnValue = cache
      }
      break;
    case 'restoreCookie':
      {
        try {
          let cache = fs.readFileSync(cookieFile).toString()
          cache = JSON.parse(cache)
          for (let it of cache) {
            it.url = 'https://im.dingtalk.com'

            session.defaultSession.cookies.set(it)
          }
        } catch (err) {}
        ev.returnValue = true
      }
      break;
    case 'saveCookie':
      {
        let cookie = session.defaultSession.cookies.get({})
        cookie.then(r => {
          fs.writeFile(cookieFile, JSON.stringify(r), function (err) {})
        })
        ev.returnValue = true
      }
      break;
    case 'toggleTray':
      {
        app.toggleTray(conn.data)
        ev.returnValue = true
      }
      break;
  }
})
