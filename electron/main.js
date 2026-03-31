const { app, BrowserWindow, ipcMain, dialog, protocol } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
    frame: false,
    backgroundColor: '#f0f2f5',
    titleBarStyle: 'hidden',
    show: true,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('open-folder-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  return result;
});

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      {
        name: '视频文件',
        extensions: ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', 'm4v'],
      },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true, files: [] };
  }

  const files = result.filePaths.map((filePath) => {
    const stats = fs.statSync(filePath);
    return {
      name: path.basename(filePath),
      path: filePath,
      size: stats.size,
    };
  });

  return { canceled: false, files };
});

ipcMain.handle('read-folder-videos', async (_event, folderPath) => {
  try {
    const files = fs.readdirSync(folderPath);
    const videoExtensions = [
      '.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v',
    ];

    const videos = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return videoExtensions.includes(ext);
      })
      .map((file) => ({
        name: file,
        path: path.join(folderPath, file),
        size: fs.statSync(path.join(folderPath, file)).size,
      }));

    return videos;
  } catch (error) {
    console.error('读取文件夹失败:', error);
    return [];
  }
});

ipcMain.handle('save-progress', async (_event, data) => {
  const progressFile = path.join(app.getPath('userData'), 'progress.json');
  let progressData = {};

  try {
    if (fs.existsSync(progressFile)) {
      const content = fs.readFileSync(progressFile, 'utf8');
      progressData = JSON.parse(content);
    }
  } catch (error) {
    console.error('读取进度文件失败:', error);
  }

  progressData[data.videoPath] = {
    currentTime: data.currentTime,
    duration: data.duration,
    lastPlayed: Date.now(),
  };

  try {
    fs.writeFileSync(progressFile, JSON.stringify(progressData, null, 2));
    return { success: true };
  } catch (error) {
    console.error('保存进度失败:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-progress', async (_event, videoPath) => {
  const progressFile = path.join(app.getPath('userData'), 'progress.json');

  try {
    if (fs.existsSync(progressFile)) {
      const content = fs.readFileSync(progressFile, 'utf8');
      const progressData = JSON.parse(content);
      return progressData[videoPath] || null;
    }
  } catch (error) {
    console.error('读取进度失败:', error);
  }

  return null;
});

ipcMain.handle('get-video-metadata', async (_event, videoPath) => {
  try {
    const stats = fs.statSync(videoPath);
    return {
      name: path.basename(videoPath),
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
    };
  } catch (error) {
    console.error('获取元数据失败:', error);
    return null;
  }
});

ipcMain.handle('clear-all-data', async () => {
  try {
    const progressFile = path.join(app.getPath('userData'), 'progress.json');
    if (fs.existsSync(progressFile)) {
      fs.unlinkSync(progressFile);
    }
    return { success: true };
  } catch (error) {
    console.error('清除数据失败:', error);
    return { success: false, error: error.message };
  }
});

// 窗口控制
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});
