const { ipcRenderer, shell, contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  open(url) {
    shell.openExternal(url)
  },
  saveToken(id, token) {
    token = JSON.parse(token)
    // token.isAutoLogin = true
    token = JSON.stringify(token)

    ipcRenderer.sendSync('app', {
      data: JSON.stringify({ id, token }),
      type: 'saveToken'
    })
  },
  readToken() {
    return ipcRenderer.sendSync('app', { type: 'readToken' })
  },

  restoreCookie() {
    return ipcRenderer.sendSync('app', { type: 'restoreCookie' })
  },

  saveCookie() {
    return ipcRenderer.sendSync('app', { type: 'saveCookie' })
  }
})
