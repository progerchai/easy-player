const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
    readFolderVideos: (folderPath) => ipcRenderer.invoke('read-folder-videos', folderPath),
    saveProgress: (data) => ipcRenderer.invoke('save-progress', data),
    getProgress: (videoPath) => ipcRenderer.invoke('get-progress', videoPath),
    getVideoMetadata: (videoPath) => ipcRenderer.invoke('get-video-metadata', videoPath),
    clearAllData: () => ipcRenderer.invoke('clear-all-data'),
});
