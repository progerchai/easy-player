const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    readFolderVideos: (folderPath) => ipcRenderer.invoke('read-folder-videos', folderPath),
    saveProgress: (data) => ipcRenderer.invoke('save-progress', data),
    getProgress: (videoPath) => ipcRenderer.invoke('get-progress', videoPath),
    getVideoMetadata: (videoPath) => ipcRenderer.invoke('get-video-metadata', videoPath),
    clearAllData: () => ipcRenderer.invoke('clear-all-data'),
    // 暴露设置拖拽区域的方法给渲染进程
    setDragRegion: (selector) => {
        const element = document.querySelector(selector);
        if (element) {
            element.setAttribute('-webkit-app-region', 'drag');
            const buttons = element.querySelectorAll('button, a, input, [role="button"]');
            buttons.forEach(btn => {
                btn.setAttribute('-webkit-app-region', 'no-drag');
            });
        }
    }
});
