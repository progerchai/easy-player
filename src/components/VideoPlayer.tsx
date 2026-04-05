import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button, Modal, Slider, Popover } from 'antd';
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
  Info,
  PictureInPicture2,
  Upload as UploadIcon,
  FolderOpen,
  Sun,
  Gauge,
} from 'lucide-react';
import type { VideoItem, ViewType, VideoMetadata } from '@/types/video';
import './VideoPlayer.scss';

const prefix = 'ep-videoplayer';

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.7, 1.8, 2, 2.2, 2.4, 3];
const PROGRESS_SAVE_INTERVAL = 5;

interface VideoPlayerProps {
  currentView: ViewType;
  currentVideo: VideoItem | null;
  videos: VideoItem[];
  onFilesDrop: (files: FileList | File[]) => void;
  onPlayVideo: (video: VideoItem) => void;
  onOpenFile: () => void;
}

const formatTime = (seconds: number): string => {
  if (!seconds || !isFinite(seconds)) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

const formatSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  currentView,
  currentVideo,
  videos,
  onFilesDrop,
  onPlayVideo,
  onOpenFile,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSaveTimeRef = useRef(0);
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoMetadata | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const savedRate = localStorage.getItem('ep_playbackRate');
    if (savedRate) {
      const rate = parseFloat(savedRate);
      if (SPEED_OPTIONS.includes(rate)) {
        setPlaybackRate(rate);
      }
    }
  }, []);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setBrightness(100);
  }, [currentVideo?.path]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentVideo || !videoRef.current) return;
      const v = videoRef.current;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          v.currentTime = Math.max(0, v.currentTime - 5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          v.currentTime = Math.min(v.duration, v.currentTime + 5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          v.volume = Math.min(1, v.volume + 0.1);
          setVolume(v.volume);
          setIsMuted(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          v.volume = Math.max(0, v.volume - 0.1);
          setVolume(v.volume);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    hideControlsTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, 3000);
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(true);
      setIsPlaying(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);

    if (
      currentVideo?.path &&
      !v.paused &&
      v.currentTime - lastSaveTimeRef.current >= PROGRESS_SAVE_INTERVAL
    ) {
      lastSaveTimeRef.current = v.currentTime;
      window.electronAPI?.saveProgress({
        videoPath: currentVideo.path,
        currentTime: v.currentTime,
        duration: v.duration,
      });
    }
  }, [currentVideo?.path]);

  const handleLoadedMetadata = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration);

    if (currentVideo?.path) {
      const progress = await window.electronAPI?.getProgress(currentVideo.path);
      if (progress?.currentTime && progress.currentTime < v.duration - 5) {
        v.currentTime = progress.currentTime;
      }
    }
  }, [currentVideo?.path]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      if (videoRef.current && duration > 0) {
        videoRef.current.currentTime = ratio * duration;
      }
    },
    [duration],
  );

  const handleVolumeChange = useCallback((value: number) => {
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
      setIsMuted(value === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const next = !isMuted;
    v.muted = next;
    setIsMuted(next);
    if (next) {
      setVolume(0);
    } else {
      const restored = 0.5;
      v.volume = restored;
      setVolume(restored);
    }
  }, [isMuted]);

  const handleSpeedChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
    localStorage.setItem('ep_playbackRate', String(rate));
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const takeScreenshot = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(v, 0, 0);
    const link = document.createElement('a');
    link.download = `screenshot_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  const togglePiP = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await v.requestPictureInPicture();
      }
    } catch (err) {
      console.error('画中画切换失败:', err);
    }
  }, []);

  const showVideoInfo = useCallback(async () => {
    if (!currentVideo?.path) return;
    const metadata = await window.electronAPI?.getVideoMetadata(
      currentVideo.path,
    );
    if (metadata) {
      setVideoInfo(metadata);
      setShowInfoModal(true);
    }
  }, [currentVideo?.path]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        onFilesDrop(e.dataTransfer.files);
      }
    },
    [onFilesDrop],
  );

  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
    const idx = videos.findIndex((v) => v.path === currentVideo?.path);
    if (idx >= 0 && idx < videos.length - 1) {
      onPlayVideo(videos[idx + 1]);
    }
  }, [videos, currentVideo?.path, onPlayVideo]);

  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);

  const speedMenuContent = (
    <div className={`${prefix}-speed-menu`}>
      {SPEED_OPTIONS.map((rate) => (
        <div
          key={rate}
          className={`${prefix}-speed-item ${playbackRate === rate ? `${prefix}-speed-item--active` : ''}`}
          onClick={() => {
            handleSpeedChange(rate);
            setSpeedMenuOpen(false);
          }}
        >
          {rate}x
        </div>
      ))}
    </div>
  );

  if (currentView === 'recent' || currentView === 'folder') {
    return (
      <div className={`${prefix}-container ${prefix}-view-mode`}>
        <div className={`${prefix}-placeholder`}>
          <FolderOpen size={64} strokeWidth={1} />
          <h2>{currentView === 'recent' ? '最近播放' : '文件夹浏览'}</h2>
          <p>在左侧选择视频进行播放</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${prefix}-container`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseMove={resetHideTimer}
    >
      {!currentVideo ? (
        <div
          className={`${prefix}-drop-zone ${isDragging ? `${prefix}-drop-zone--active` : ''}`}
          onClick={onOpenFile}
        >
          <UploadIcon size={64} strokeWidth={1} />
          <h2>拖拽视频文件到此处</h2>
          <p>支持 MP4, MKV, AVI, MOV, WMV, FLV, WebM 等格式</p>
          <span className={`${prefix}-drop-zone-click`}>
            <FolderOpen size={16} />
            点击打开本地视频文件
          </span>
        </div>
      ) : (
        <>
          <div className={`${prefix}-video-wrapper`}>
            <video
              ref={videoRef}
              src={currentVideo.path}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={handleVideoEnded}
              onClick={togglePlay}
              style={{ filter: `brightness(${brightness}%)` }}
            />
            <div className={`${prefix}-video-overlay ${showControls ? `${prefix}-video-overlay--visible` : ''}`}>
              <span className={`${prefix}-video-title`}>
                {currentVideo.name}
              </span>
            </div>
          </div>

          {isDragging && (
            <div className={`${prefix}-drag-overlay`}>
              <UploadIcon size={48} strokeWidth={1.5} />
              <span>释放以替换当前视频</span>
            </div>
          )}

          <div
            className={`${prefix}-controls ${showControls ? `${prefix}-controls--visible` : ''}`}
          >
            <div className={`${prefix}-progress-bar`} onClick={handleSeek}>
              <div
                className={`${prefix}-progress`}
                style={{
                  width:
                    duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                }}
              />
            </div>

            <div className={`${prefix}-buttons`}>
              <div className={`${prefix}-left`}>
                <Button
                  type='text'
                  icon={
                    isPlaying ? (
                      <Pause size={22} fill='#fff' />
                    ) : (
                      <Play size={22} fill='#fff' />
                    )
                  }
                  onClick={togglePlay}
                  className={`${prefix}-ctrl-btn`}
                />
                <Button
                  type='text'
                  icon={<SkipBack size={18} />}
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime -= 10;
                  }}
                  className={`${prefix}-ctrl-btn`}
                />
                <Button
                  type='text'
                  icon={<SkipForward size={18} />}
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime += 10;
                  }}
                  className={`${prefix}-ctrl-btn`}
                />
                <span className={`${prefix}-time`}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className={`${prefix}-right`}>
                <div className={`${prefix}-volume`}>
                  <Button
                    type='text'
                    icon={
                      isMuted || volume === 0 ? (
                        <VolumeX size={18} />
                      ) : (
                        <Volume2 size={18} />
                      )
                    }
                    onClick={toggleMute}
                    className={`${prefix}-ctrl-btn`}
                  />
                  <Slider
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className={`${prefix}-volume-slider`}
                    tooltip={{ open: false }}
                  />
                </div>

                <div className={`${prefix}-brightness`}>
                  <Sun size={16} />
                  <Slider
                    min={20}
                    max={200}
                    value={brightness}
                    onChange={(val) => setBrightness(val)}
                    className={`${prefix}-brightness-slider`}
                    tooltip={{ formatter: (val) => `${val}%` }}
                  />
                </div>

                <Popover
                  content={speedMenuContent}
                  open={speedMenuOpen}
                  onOpenChange={setSpeedMenuOpen}
                  trigger={['click']}
                  getPopupContainer={() => document.body}
                  rootClassName={`${prefix}-speed-popover`}
                >
                  <Button
                    type='text'
                    className={`${prefix}-ctrl-btn ${prefix}-speed-btn`}
                    title='播放速度'
                  >
                    <Gauge size={16} />
                    <span>{playbackRate}x</span>
                  </Button>
                </Popover>

                <Button
                  type='text'
                  icon={<Camera size={18} />}
                  onClick={takeScreenshot}
                  className={`${prefix}-ctrl-btn`}
                />
                <Button
                  type='text'
                  icon={<PictureInPicture2 size={18} />}
                  onClick={togglePiP}
                  className={`${prefix}-ctrl-btn`}
                />
                <Button
                  type='text'
                  icon={<Info size={18} />}
                  onClick={showVideoInfo}
                  className={`${prefix}-ctrl-btn`}
                />
                <Button
                  type='text'
                  icon={
                    isFullscreen ? (
                      <Minimize size={18} />
                    ) : (
                      <Maximize size={18} />
                    )
                  }
                  onClick={toggleFullscreen}
                  className={`${prefix}-ctrl-btn`}
                />
              </div>
            </div>
          </div>

          <Modal
            title='视频信息'
            open={showInfoModal}
            onCancel={() => setShowInfoModal(false)}
            footer={null}
            width={480}
          >
            {videoInfo && (
              <div className={`${prefix}-info-grid`}>
                <div className={`${prefix}-info-row`}>
                  <span className={`${prefix}-info-label`}>文件名</span>
                  <span className={`${prefix}-info-value`}>
                    {videoInfo.name}
                  </span>
                </div>
                <div className={`${prefix}-info-row`}>
                  <span className={`${prefix}-info-label`}>文件大小</span>
                  <span className={`${prefix}-info-value`}>
                    {formatSize(videoInfo.size)}
                  </span>
                </div>
                <div className={`${prefix}-info-row`}>
                  <span className={`${prefix}-info-label`}>创建时间</span>
                  <span className={`${prefix}-info-value`}>
                    {new Date(videoInfo.created).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className={`${prefix}-info-row`}>
                  <span className={`${prefix}-info-label`}>修改时间</span>
                  <span className={`${prefix}-info-value`}>
                    {new Date(videoInfo.modified).toLocaleString('zh-CN')}
                  </span>
                </div>
                <div className={`${prefix}-info-row`}>
                  <span className={`${prefix}-info-label`}>时长</span>
                  <span className={`${prefix}-info-value`}>
                    {formatTime(duration)}
                  </span>
                </div>
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
