import React, { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import type { VideoItem, ViewType } from './types/video';
import Sidebar from './components/Sidebar';
import VideoPlayer from './components/VideoPlayer';
import './AppContent.scss';

const prefix = 'ep-app';
const STORAGE_KEY = 'ep_recentPlayed';

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

  // useEffect(() => {
  //   // 设置 Electron 窗口的可拖拽区域
  //   if (window.electronAPI?.setDragRegion) {
  //     window.electronAPI.setDragRegion('.ep-sidebar-header');
  //   }
  // }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRecentPlayed(JSON.parse(saved));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    [recentPlayed],
  );

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
  }, []);

  const handleClearData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentPlayed([]);
    window.electronAPI?.clearAllData();
    message.success('已清除所有播放记录');
  }, []);

  return (
    <div className={prefix}>
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        videos={videos}
        recentPlayed={recentPlayed}
        onPlayVideo={playVideo}
        onClearData={handleClearData}
        onOpenFolder={handleOpenFolder}
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
