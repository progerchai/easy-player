import React, { useState, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('player');
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [recentPlayed, setRecentPlayed] = useState([]);

  // 加载最近播放记录
  useEffect(() => {
    const saved = localStorage.getItem('recentPlayed');
    if (saved) {
      setRecentPlayed(JSON.parse(saved));
    }
  }, []);

  // 处理文件拖拽
  const handleFilesDrop = async (files) => {
    const videoFiles = Array.from(files).filter(
      (file) =>
        file.type.startsWith('video/') ||
        /\.(mp4|mkv|avi|mov|wmv|flv|webm|m4v)$/i.test(file.name)
    );

    if (videoFiles.length > 0) {
      const videoList = videoFiles.map((file) => ({
        name: file.name,
        path: file.path || URL.createObjectURL(file),
        size: file.size,
      }));

      setVideos(videoList);
      if (videoList.length > 0) {
        playVideo(videoList[0]);
      }
    }
  };

  // 播放视频
  const playVideo = (video) => {
    setCurrentVideo(video);
    setCurrentView('player');

    // 添加到最近播放
    const updated = [
      video,
      ...recentPlayed.filter((v) => v.path !== video.path),
    ].slice(0, 20);
    setRecentPlayed(updated);
    localStorage.setItem('recentPlayed', JSON.stringify(updated));
  };

  // 清除数据
  const handleClearData = () => {
    if (confirm('确定要清除所有播放记录和设置吗？')) {
      localStorage.clear();
      setRecentPlayed([]);
      window.electronAPI?.clearAllData();
    }
  };

  return (
    <div className='app'>
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
}

export default App;
