// runs before webpage loaded into window, has access to DOM and Node.js APIs
// exposes privileged APIs to renderer via contextBridge
// used for IPC (inter-process communication)

const{ contextBridge, ipcRenderer, nativeTheme } = require('electron')

async function _readFile(path) {
  return await ipcRenderer.invoke('read-file', path);
}

// contextBridge.exposeInMainWorld('api', {
//   // getAccounts: () => ipcRenderer.invoke('get-accounts'),
//   addAccount: (account) => ipcRenderer.invoke('add-account', account),
// });

contextBridge.exposeInMainWorld('api', {
  // getChaptersProgress: (userId) => ipcRenderer.invoke('get-chapters-progress', userId),
  // updateChapterProgress: (userId, chapterId, progress) => 
  //   ipcRenderer.invoke('update-chapter-progress', userId, chapterId, progress),
  getAccount: (userId) => ipcRenderer.invoke('get-account', userId),
  getAccounts: () => ipcRenderer.invoke('get-accounts'),
  addAccount: (account) => ipcRenderer.invoke('add-account', account),
  getChapters: () => ipcRenderer.invoke('get-chapters'),
  getChapterProgress: (userId) => ipcRenderer.invoke('get-chapter-progress', userId)
});

// contextBridge.exposeInMainWorld('versions', {
//     // exposes app's versions of node, chrome, electron into app's renderer
//     node: () => process.versions.node,
//     chrome: () => process.versions.chrome,
//     electron: () => process.versions.electron,
//     ping: () => ipcRenderer.invoke('ping'), // sender of ping
//     // use helper function for ping, don't directly expose via context bridge for security
//     // otherwise renderer can send arbitrary IPC msgs to the main process => attack risk
//     // can also expose variables, not just functions
// })

// // for themeService dark mode implementation
// console.log('weeee')
// contextBridge.exposeInMainWorld('electronAPI', {
//   theme: {
//     setThemeSource: (mode) => { nativeTheme.themeSource = mode; },
//     shouldUseDarkColors: () => nativeTheme.shouldUseDarkColors
//   }
// });

// // api for darkMode, exposes two IPC channels ('dark-mode:x') to renderer
// // also assigns two methods to pass messages from renderer to main process
// // allows renderer to communicate with main process, mutate nativeTheme
// contextBridge.exposeInMainWorld('darkMode', {
//     toggle: () => ipcRenderer.invoke('dark-mode:toggle'),
//     system: () => ipcRenderer.invoke('dark-mode:system')
// })

// to force css to work in electron
// const path = require('path');
// window.addEventListener('DOMContentLoaded', async () => {
//   // loads css file contents as a string
//   const cssFilePath = path.join('.','css','styles.css');
//   const cssContent = await _readFile(cssFilePath);

//   // creates <style> element and adds from file
//   const style = document.createElement('style');
//   style.innerHTML = cssContent;

//   // add <style> to <head> of index
//   document.head.appendChild(style);
// });