import React from 'react';
import { Button, Popconfirm } from 'antd';
import {
  MonitorPlay,
  Clock,
  FolderOpen,
  Film,
  Trash2,
} from 'lucide-react';
import type { VideoItem, ViewType } from '@/types/video';
import './Sidebar.scss';

const prefix = 'ep-sidebar';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  videos: VideoItem[];
  recentPlayed: VideoItem[];
  onPlayVideo: (video: VideoItem) => void;
  onClearData: () => void;
  onOpenFolder: () => void;
}

const formatSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (timestamp?: number): string => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  videos,
  recentPlayed,
  onPlayVideo,
  onClearData,
  onOpenFolder,
}) => {
  const navItems: { key: ViewType; icon: React.ReactNode; label: string }[] = [
    { key: 'player', icon: <MonitorPlay size={18} />, label: '播放器' },
    { key: 'recent', icon: <Clock size={18} />, label: '最近播放' },
    { key: 'folder', icon: <FolderOpen size={18} />, label: '文件夹' },
  ];

  const handleNavClick = (key: ViewType) => {
    onViewChange(key);
    if (key === 'folder') {
      onOpenFolder();
    }
  };

  const listData = currentView === 'recent' ? recentPlayed : videos;
  const listTitle = currentView === 'recent' ? '最近播放' : '播放列表';
  const emptyText = currentView === 'recent' ? '暂无播放记录' : '暂无视频';

  return (
    <div className={prefix}>
      <div className={`${prefix}-header`}>
        <div className={`${prefix}-logo`}>
          <Film size={28} className={`${prefix}-logo-icon`} />
          <h1 className={`${prefix}-logo-text`}>EasyPlayer</h1>
        </div>
      </div>

      <nav className={`${prefix}-nav`}>
        {navItems.map((item) => (
          <Button
            key={item.key}
            type={currentView === item.key ? 'primary' : 'text'}
            icon={item.icon}
            onClick={() => handleNavClick(item.key)}
            block
            className={`${prefix}-nav-btn`}
          >
            {item.label}
          </Button>
        ))}
      </nav>

      <div className={`${prefix}-content`}>
        <div className={`${prefix}-section-header`}>
          <Film size={16} />
          <span>{listTitle}</span>
          <span className={`${prefix}-count`}>{listData.length}</span>
        </div>

        <div className={`${prefix}-list`}>
          {listData.length === 0 ? (
            <div className={`${prefix}-empty`}>
              {currentView === 'recent' ? (
                <Clock size={48} strokeWidth={1} />
              ) : (
                <Film size={48} strokeWidth={1} />
              )}
              <p>{emptyText}</p>
            </div>
          ) : (
            listData.map((video, index) => (
              <div
                key={`${currentView}-${index}`}
                className={`${prefix}-item`}
                onClick={() => onPlayVideo(video)}
              >
                <div className={`${prefix}-item-icon`}>
                  <Film size={18} />
                </div>
                <div className={`${prefix}-item-info`}>
                  <div className={`${prefix}-item-name`}>{video.name}</div>
                  <div className={`${prefix}-item-meta`}>
                    {currentView === 'recent'
                      ? formatDate(video.lastPlayed)
                      : formatSize(video.size)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={`${prefix}-footer`}>
        <Popconfirm
          title="确定清除所有播放记录？"
          onConfirm={onClearData}
          okText="确定"
          cancelText="取消"
        >
          <Button
            icon={<Trash2 size={16} />}
            type="text"
            danger
            size="small"
          >
            清除记录
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
};

export default Sidebar;
