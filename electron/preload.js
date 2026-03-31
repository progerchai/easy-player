const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    readFolderVideos: (folderPath) => ipcRenderer.invoke('read-folder-videos', folderPath),
    saveProgress: (data) => ipcRenderer.invoke('save-progress', data),
    getProgress: (videoPath) => ipcRenderer.invoke('get-progress', videoPath),
    getVideoMetadata: (videoPath) => ipcRenderer.invoke('get-video-metadata', videoPath),
    clearAllData: () => ipcRenderer.invoke('clear-all-data'),
    // 窗口控制
    minimizeWindow: () => ipcRenderer.send('window-minimize'),
    maximizeWindow: () => ipcRenderer.send('window-maximize'),
    closeWindow: () => ipcRenderer.send('window-close'),
});
