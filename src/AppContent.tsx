import React, { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import type { VideoItem, ViewType, FolderItem } from './types/video';
import Sidebar from './components/Sidebar';
import VideoPlayer from './components/VideoPlayer';
import './AppContent.scss';

const prefix = 'ep-app';
const STORAGE_KEY_RECENT = 'ep_recentPlayed';
const STORAGE_KEY_HISTORY = 'ep_historyFolders';

const toVideoSrc = (filePath: string): string => {
  if (filePath.startsWith('blob:') || filePath.startsWith('file://')) {
    return filePath;
  }
  return `file://${filePath}`;
};

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('player');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [recentPlayed, setRecentPlayed] = useState<VideoItem[]>([]);
  const [historyFolders, setHistoryFolders] = useState<FolderItem[]>([]);

  // useEffect(() => {
  //   // 设置 Electron 窗口的可拖拽区域
  //   if (window.electronAPI?.setDragRegion) {
  //     window.electronAPI.setDragRegion('.ep-sidebar-header');
  //   }
  // }, []);

  useEffect(() => {
    const savedRecent = localStorage.getItem(STORAGE_KEY_RECENT);
    if (savedRecent) {
      try {
        setRecentPlayed(JSON.parse(savedRecent));
      } catch {
        localStorage.removeItem(STORAGE_KEY_RECENT);
      }
    }
    const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
    if (savedHistory) {
      try {
        setHistoryFolders(JSON.parse(savedHistory));
      } catch {
        localStorage.removeItem(STORAGE_KEY_HISTORY);
      }
    }
  }, []);

  const playVideo = useCallback(
    (video: VideoItem) => {
      const updatedVideo = { ...video, lastPlayed: Date.now() };
      setCurrentVideo(updatedVideo);
      setCurrentView('player');

      const updated = [
        updatedVideo,
        ...recentPlayed.filter((v) => v.path !== video.path),
      ].slice(0, 30);
      setRecentPlayed(updated);
      localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated));
    },
    [recentPlayed],
  );

  const saveHistoryFolder = useCallback((folderPath: string) => {
    const folderName = folderPath.split(/[/\\]/).pop() || folderPath;
    const newFolder: FolderItem = {
      path: folderPath,
      name: folderName,
      lastOpened: Date.now(),
    };
    setHistoryFolders((prev) => {
      const filtered = prev.filter((f) => f.path !== folderPath);
      const updated = [newFolder, ...filtered].slice(0, 20);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleFilesDrop = useCallback(
    async (files: FileList | File[]) => {
      const filesArray = Array.from(files);
      const videoFiles = filesArray.filter(
        (file) =>
          file.type.startsWith('video/') ||
          /\.(mp4|mkv|avi|mov|wmv|flv|webm|m4v)$/i.test(file.name),
      );

      if (videoFiles.length === 0) {
        message.warning('未检测到支持的视频文件');
        return;
      }

      const videoList: VideoItem[] = videoFiles.map((file) => {
        const localPath = (file as unknown as { path: string }).path;
        return {
          name: file.name,
          path: localPath ? toVideoSrc(localPath) : URL.createObjectURL(file),
          size: file.size,
        };
      });

      setVideos(videoList);
      playVideo(videoList[0]);
    },
    [playVideo],
  );

  const handleOpenFile = useCallback(async () => {
    const api = window.electronAPI;
    if (!api) {
      message.info('文件选择仅在桌面端可用');
      return;
    }

    const result = await api.openFileDialog();
    if (result.canceled || result.files.length === 0) return;

    const videoList = result.files.map((v) => ({
      ...v,
      path: toVideoSrc(v.path),
    }));

    setVideos(videoList);
    playVideo(videoList[0]);
  }, [playVideo]);

  const handleOpenFolder = useCallback(async () => {
    const api = window.electronAPI;
    if (!api) {
      message.info('文件夹浏览仅在桌面端可用');
      return;
    }

    const result = await api.openFolderDialog();
    if (result.canceled || result.filePaths.length === 0) return;

    const folderVideos = await api.readFolderVideos(result.filePaths[0]);
    if (folderVideos.length === 0) {
      message.info('该文件夹下没有找到视频文件');
      return;
    }

    const videoList = folderVideos.map((v) => ({
      ...v,
      path: toVideoSrc(v.path),
    }));

    setVideos(videoList);
    setCurrentView('folder');
    saveHistoryFolder(result.filePaths[0]);
  }, [saveHistoryFolder]);

  const handleOpenHistoryFolder = useCallback(async (folderPath: string) => {
    const api = window.electronAPI;
    if (!api) {
      message.info('文件夹浏览仅在桌面端可用');
      return;
    }

    const folderVideos = await api.readFolderVideos(folderPath);
    if (folderVideos.length === 0) {
      message.info('该文件夹下没有找到视频文件');
      return;
    }

    const videoList = folderVideos.map((v) => ({
      ...v,
      path: toVideoSrc(v.path),
    }));

    setVideos(videoList);
    setCurrentView('folder');
    saveHistoryFolder(folderPath);
  }, [saveHistoryFolder]);

  const handleClearData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_RECENT);
    setRecentPlayed([]);
    window.electronAPI?.clearAllData();
    message.success('已清除所有播放记录');
  }, []);

  const handleClearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    setHistoryFolders([]);
    message.success('已清除历史文件夹记录');
  }, []);

  return (
    <div className={prefix}>
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        videos={videos}
        recentPlayed={recentPlayed}
        historyFolders={historyFolders}
        currentVideo={currentVideo}
        onPlayVideo={playVideo}
        onClearData={handleClearData}
        onClearHistory={handleClearHistory}
        onOpenFolder={handleOpenFolder}
        onOpenHistoryFolder={handleOpenHistoryFolder}
      />
      <VideoPlayer
        currentView={currentView}
        currentVideo={currentVideo}
        videos={videos}
        onFilesDrop={handleFilesDrop}
        onPlayVideo={playVideo}
        onOpenFile={handleOpenFile}
      />
    </div>
  );
};

export default AppContent;
