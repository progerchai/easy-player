import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Camera,
  Settings,
  Info,
  PictureInPicture2,
  Upload,
  FolderOpen,
  Film,
} from 'lucide-react';
import './VideoPlayer.css';

function VideoPlayer({
  currentView,
  currentVideo,
  videos,
  onFilesDrop,
  onPlayVideo,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const controlTimeoutRef = useRef(null);

  // 处理文件拖拽
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFilesDrop(files);
    }
  };

  // 播放控制
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);

      // 保存进度
      if (!videoRef.current.paused && videoRef.current.currentTime % 5 < 1) {
        window.electronAPI?.saveProgress({
          videoPath: currentVideo?.path,
          currentTime: videoRef.current.currentTime,
          duration: videoRef.current.duration,
        });
      }
    }
  };

  const handleLoadedMetadata = async () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);

      // 恢复播放进度
      if (currentVideo?.path) {
        const progress = await window.electronAPI?.getProgress(
          currentVideo.path
        );
        if (progress?.currentTime) {
          videoRef.current.currentTime = progress.currentTime;
        }
      }
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = pos * duration;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted) {
        setVolume(0);
      } else {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };

  const handleSpeedChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSettings(false);
  };

  const handleBrightnessChange = (e) => {
    const value = parseInt(e.target.value);
    setBrightness(value);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const takeScreenshot = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);

      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `screenshot_${Date.now()}.png`;
      link.href = dataURL;
      link.click();
    }
  };

  const togglePiP = async () => {
    try {
      if (videoRef.current) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      }
    } catch (error) {
      console.error('画中画失败:', error);
    }
  };

  const showVideoInfo = async () => {
    if (currentVideo?.path) {
      const metadata = await window.electronAPI?.getVideoMetadata(
        currentVideo.path
      );
      setVideoInfo(metadata);
      setShowInfo(true);
    }
  };

  // 鼠标移动显示控制栏
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlTimeoutRef.current) {
      clearTimeout(controlTimeoutRef.current);
    }
    controlTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlTimeoutRef.current) {
        clearTimeout(controlTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // 渲染视图
  if (currentView === 'recent' || currentView === 'folder') {
    return (
      <div className='video-player-container view-mode'>
        <div className='view-placeholder'>
          <FolderOpen size={64} strokeWidth={1.5} />
          <h2>{currentView === 'recent' ? '最近播放' : '文件夹浏览'}</h2>
          <p>在左侧选择视频进行播放</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className='video-player-container'
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseMove={handleMouseMove}
    >
      {!currentVideo ? (
        <div className='drop-zone'>
          <Upload size={64} strokeWidth={1.5} />
          <h2>拖拽视频文件到此处</h2>
          <p>支持 MP4, MKV, AVI, MOV, WMV, FLV, WebM 等格式</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            src={currentVideo.path}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            style={{ filter: `brightness(${brightness}%)` }}
          />

          {/* 控制栏 */}
          <div className={`controls ${showControls ? 'show' : ''}`}>
            {/* 进度条 */}
            <div className='progress-bar' onClick={handleSeek}>
              <div
                className='progress'
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            {/* 控制按钮 */}
            <div className='control-buttons'>
              <div className='left-controls'>
                <button className='control-btn' onClick={togglePlay}>
                  {isPlaying ? (
                    <Pause size={24} fill='white' />
                  ) : (
                    <Play size={24} fill='white' />
                  )}
                </button>

                <button
                  className='control-btn'
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime -= 10;
                  }}
                >
                  <SkipBack size={20} />
                </button>

                <button
                  className='control-btn'
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime += 10;
                  }}
                >
                  <SkipForward size={20} />
                </button>

                <div className='time-display'>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className='right-controls'>
                <div className='volume-control'>
                  <button className='control-btn' onClick={toggleMute}>
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input
                    type='range'
                    className='volume-slider'
                    min='0'
                    max='1'
                    step='0.01'
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                  />
                </div>

                <div className='setting-group'>
                  <button
                    className='control-btn'
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings size={20} />
                  </button>
                  {showSettings && (
                    <div className='settings-dropdown'>
                      <div className='setting-item'>
                        <label>亮度</label>
                        <input
                          type='range'
                          min='0'
                          max='200'
                          value={brightness}
                          onChange={handleBrightnessChange}
                        />
                      </div>
                      <div className='setting-item'>
                        <label>倍速</label>
                        <select
                          value={playbackRate}
                          onChange={(e) =>
                            handleSpeedChange(parseFloat(e.target.value))
                          }
                        >
                          <option value='0.5'>0.5x</option>
                          <option value='0.75'>0.75x</option>
                          <option value='1'>1.0x</option>
                          <option value='1.25'>1.25x</option>
                          <option value='1.5'>1.5x</option>
                          <option value='2'>2.0x</option>
                          <option value='3'>3.0x</option>
                          <option value='4'>4.0x</option>
                          <option value='5'>5.0x</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <button className='control-btn' onClick={takeScreenshot}>
                  <Camera size={20} />
                </button>

                <button className='control-btn' onClick={togglePiP}>
                  <PictureInPicture2 size={20} />
                </button>

                <button className='control-btn' onClick={showVideoInfo}>
                  <Info size={20} />
                </button>

                <button className='control-btn' onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <Minimize size={20} />
                  ) : (
                    <Maximize size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 视频信息弹窗 */}
          {showInfo && videoInfo && (
            <div className='modal-overlay' onClick={() => setShowInfo(false)}>
              <div
                className='modal-content'
                onClick={(e) => e.stopPropagation()}
              >
                <div className='modal-header'>
                  <h3>📊 视频信息</h3>
                  <button onClick={() => setShowInfo(false)}>×</button>
                </div>
                <div className='modal-body'>
                  <div className='info-grid'>
                    <div className='info-item'>
                      <span className='label'>文件名</span>
                      <span className='value'>{videoInfo.name}</span>
                    </div>
                    <div className='info-item'>
                      <span className='label'>文件大小</span>
                      <span className='value'>
                        {formatSize(videoInfo.size)}
                      </span>
                    </div>
                    <div className='info-item'>
                      <span className='label'>创建时间</span>
                      <span className='value'>
                        {new Date(videoInfo.created).toLocaleString()}
                      </span>
                    </div>
                    <div className='info-item'>
                      <span className='label'>修改时间</span>
                      <span className='value'>
                        {new Date(videoInfo.modified).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export default VideoPlayer;
