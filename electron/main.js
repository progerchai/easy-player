const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

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
        },
        frame: true,
        backgroundColor: '#0f0f0f',
        titleBarStyle: 'default',
    });

    // 开发模式加载 Vite 服务器
    if (process.argv.includes('--dev')) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        // 生产模式加载构建文件
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

// 处理文件夹选择
ipcMain.handle('open-folder-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
    });
    return result;
});

// 读取文件夹中的视频文件
ipcMain.handle('read-folder-videos', async (event, folderPath) => {
    try {
        const files = fs.readdirSync(folderPath);
        const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v'];

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

// 保存播放进度
ipcMain.handle('save-progress', async (event, data) => {
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

// 获取播放进度
ipcMain.handle('get-progress', async (event, videoPath) => {
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

// 获取视频的元数据
ipcMain.handle('get-video-metadata', async (event, videoPath) => {
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

// 清除所有数据
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
