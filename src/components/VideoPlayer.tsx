import React, { useState, useRef } from 'react';
import { Button, Upload } from 'antd';
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
  Upload as UploadIcon,
  FolderOpen,
} from 'lucide-react';
import type { VideoItem, ViewType } from '../types/video';
import './VideoPlayer.scss';

const prefix = 'ep-videoplayer';

interface VideoPlayerProps {
  currentView: ViewType;
  currentVideo: VideoItem | null;
  videos: VideoItem[];
  onFilesDrop: (files: FileList | File[]) => void;
  onPlayVideo: (video: VideoItem) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  currentView,
  currentVideo,
  onFilesDrop,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFilesDrop(files);
    }
  };

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
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = pos * duration;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentView === 'recent' || currentView === 'folder') {
    return (
      <div className={`${prefix}-container ${prefix}-view-mode`}>
        <div className={`${prefix}-placeholder`}>
          <FolderOpen size={64} strokeWidth={1.5} />
          <h2>{currentView === 'recent' ? '最近播放' : '文件夹浏览'}</h2>
          <p>在左侧选择视频进行播放</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${prefix}-container`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {!currentVideo ? (
        <div className={`${prefix}-drop-zone`}>
          <UploadIcon size={64} strokeWidth={1.5} />
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
          />

          <div className={`${prefix}-controls`}>
            <div className={`${prefix}-progress-bar`} onClick={handleSeek}>
              <div
                className={`${prefix}-progress`}
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            <div className={`${prefix}-buttons`}>
              <div className={`${prefix}-left`}>
                <Button
                  type='text'
                  icon={
                    isPlaying ? (
                      <Pause size={24} fill='white' />
                    ) : (
                      <Play size={24} fill='white' />
                    )
                  }
                  onClick={togglePlay}
                />
                <Button
                  type='text'
                  icon={<SkipBack size={20} />}
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime -= 10;
                  }}
                />
                <Button
                  type='text'
                  icon={<SkipForward size={20} />}
                  onClick={() => {
                    if (videoRef.current) videoRef.current.currentTime += 10;
                  }}
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
                      isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />
                    }
                    onClick={toggleMute}
                  />
                  <input
                    type='range'
                    min='0'
                    max='1'
                    step='0.01'
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className={`${prefix}-volume-slider`}
                  />
                </div>
                <Button type='text' icon={<Settings size={20} />} />
                <Button type='text' icon={<Camera size={20} />} />
                <Button type='text' icon={<PictureInPicture2 size={20} />} />
                <Button type='text' icon={<Info size={20} />} />
                <Button type='text' icon={<Maximize size={20} />} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoPlayer;
