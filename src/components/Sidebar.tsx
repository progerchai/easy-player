import React from 'react';
import { Button } from 'antd';
import {
  MonitorPlay,
  Clock,
  FolderOpen,
  Film,
  Trash2,
  Settings,
  Info,
  PictureInPicture2,
} from 'lucide-react';
import type { VideoItem, ViewType } from '../types/video';
import './Sidebar.scss';

const prefix = 'ep-sidebar';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  videos: VideoItem[];
  recentPlayed: VideoItem[];
  onPlayVideo: (video: VideoItem) => void;
  onClearData: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  videos,
  recentPlayed,
  onPlayVideo,
  onClearData,
}) => {
  const formatSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={prefix}>
      <div className={`${prefix}-header`}>
        <div className={`${prefix}-logo`}>
          <span className={`${prefix}-logo-icon`}>🎬</span>
          <h1 className={`${prefix}-logo-text`}>EasyPlayer</h1>
        </div>
      </div>

      <nav className={`${prefix}-nav`}>
        <Button
          type={currentView === 'player' ? 'primary' : 'text'}
          icon={<MonitorPlay size={20} />}
          onClick={() => onViewChange('player')}
          block
        >
          播放器
        </Button>
        <Button
          type={currentView === 'recent' ? 'primary' : 'text'}
          icon={<Clock size={20} />}
          onClick={() => onViewChange('recent')}
          block
        >
          最近播放
        </Button>
        <Button
          type={currentView === 'folder' ? 'primary' : 'text'}
          icon={<FolderOpen size={20} />}
          onClick={() => onViewChange('folder')}
          block
        >
          文件夹
        </Button>
      </nav>

      <div className={`${prefix}-content`}>
        <div className={`${prefix}-section-header`}>
          <Film size={18} />
          <span>{currentView === 'recent' ? '最近播放' : '播放列表'}</span>
          <span className={`${prefix}-count`}>
            {currentView === 'recent' ? recentPlayed.length : videos.length}
          </span>
        </div>

        <div className={`${prefix}-list`}>
          {currentView === 'recent' ? (
            recentPlayed.length === 0 ? (
              <div className={`${prefix}-empty`}>
                <Clock size={48} strokeWidth={1.5} />
                <p>暂无播放记录</p>
              </div>
            ) : (
              recentPlayed.map((video, index) => (
                <div
                  key={`recent-${index}`}
                  className={`${prefix}-item`}
                  onClick={() => onPlayVideo(video)}
                >
                  <div className={`${prefix}-item-icon`}>
                    <Film size={20} />
                  </div>
                  <div className={`${prefix}-item-info`}>
                    <div className={`${prefix}-item-name`}>{video.name}</div>
                    <div className={`${prefix}-item-time`}>
                      {new Date(video.lastPlayed || 0).toLocaleDateString(
                        'zh-CN',
                      )}
                    </div>
                  </div>
                </div>
              ))
            )
          ) : videos.length === 0 ? (
            <div className={`${prefix}-empty`}>
              <Film size={48} strokeWidth={1.5} />
              <p>暂无视频</p>
            </div>
          ) : (
            videos.map((video, index) => (
              <div
                key={`video-${index}`}
                className={`${prefix}-item`}
                onClick={() => onPlayVideo(video)}
              >
                <div className={`${prefix}-item-icon`}>
                  <Film size={20} />
                </div>
                <div className={`${prefix}-item-info`}>
                  <div className={`${prefix}-item-name`}>{video.name}</div>
                  <div className={`${prefix}-item-size`}>
                    {formatSize(video.size)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`${prefix}-footer`}>
        <Button icon={<Info size={20} />} type='text' />
        <Button icon={<PictureInPicture2 size={20} />} type='text' />
        <Button icon={<Settings size={20} />} type='text' />
        <Button
          icon={<Trash2 size={20} />}
          type='text'
          danger
          onClick={onClearData}
        />
      </div>
    </div>
  );
};

export default Sidebar;
