/**
 * 托盘
 */

const { app, Tray, Menu } = require('electron')
const path = require('path')
const ROOT = __dirname

// 托盘 icon
const TRAY_ICO = path.join(ROOT, '../icons/trayx16.png')
// const TRAY_ICO = path.join(ROOT, '../icons/trayx32.png')
// const TRAY_ICO = path.join(ROOT, '../icons/tray.png')
const TRAY_ICO_A = path.join(ROOT, '../icons/tray_a.png')

module.exports = function (win) {
  let dTray = new Tray(TRAY_ICO)
  let menuList = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click() {
        win.show()
      }
    },
    {
      type: 'separator'
    },
    {
      label: '退出',
      click() {
        win.destroy()
      }
    }
  ]);
  let unreadCache = false;
  dTray.on('click', _ => {
    win.show()
  });
  dTray.setContextMenu(menuList);
  return function (unread) {
    // 缓存状态, 避免频繁修改tray图标
    if (unreadCache === unread) {
      return;
    }
    unreadCache = unread;
    if (unread) {
      dTray.setImage(TRAY_ICO_A)
    } else {
      dTray.setImage(TRAY_ICO)
    }
  }
}
