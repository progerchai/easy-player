import React, { useState, useEffect } from 'react';
import type { VideoItem } from './types/video';
import Sidebar from './components/Sidebar';
import VideoPlayer from './components/VideoPlayer';

const prefix = 'app';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<
    'player' | 'recent' | 'folder'
  >('player');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [recentPlayed, setRecentPlayed] = useState<VideoItem[]>([]);

  // 加载最近播放记录
  useEffect(() => {
    const saved = localStorage.getItem('ep_recentPlayed');
    if (saved) {
      try {
        setRecentPlayed(JSON.parse(saved));
      } catch (error) {
        console.error('加载最近播放记录失败:', error);
      }
    }
  }, []);

  // 处理文件拖拽
  const handleFilesDrop = async (files: FileList | File[]) => {
    const filesArray = Array.from(files);
    const videoFiles = filesArray.filter(
      (file) =>
        file.type.startsWith('video/') ||
        /\.(mp4|mkv|avi|mov|wmv|flv|webm|m4v)$/i.test(file.name)
    );

    if (videoFiles.length > 0) {
      const videoList: VideoItem[] = videoFiles.map((file) => ({
        name: file.name,
        path: (file as any).path || URL.createObjectURL(file),
        size: file.size,
      }));

      setVideos(videoList);
      if (videoList.length > 0) {
        playVideo(videoList[0]);
      }
    }
  };

  // 播放视频
  const playVideo = (video: VideoItem) => {
    setCurrentVideo(video);
    setCurrentView('player');

    // 添加到最近播放
    const updated = [
      video,
      ...recentPlayed.filter((v) => v.path !== video.path),
    ].slice(0, 20);
    setRecentPlayed(updated);
    localStorage.setItem('ep_recentPlayed', JSON.stringify(updated));
  };

  // 清除数据
  const handleClearData = () => {
    if (confirm('确定要清除所有播放记录和设置吗？')) {
      localStorage.clear();
      setRecentPlayed([]);
      // @ts-ignore - Electron API
      window.electronAPI?.clearAllData();
    }
  };

  return (
    <div className={prefix}>
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        videos={videos}
        recentPlayed={recentPlayed}
        onPlayVideo={playVideo}
        onClearData={handleClearData}
      />
      <VideoPlayer
        currentView={currentView}
        currentVideo={currentVideo}
        videos={videos}
        onFilesDrop={handleFilesDrop}
        onPlayVideo={playVideo}
      />
    </div>
  );
};

export default AppContent;
