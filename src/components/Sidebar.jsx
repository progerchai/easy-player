import React from 'react';
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
import './Sidebar.css';

function Sidebar({
  currentView,
  onViewChange,
  videos,
  recentPlayed,
  onPlayVideo,
  onClearData,
}) {
  return (
    <div className='sidebar'>
      {/* Logo */}
      <div className='sidebar-header'>
        <div className='logo'>
          <div className='logo-icon'>🎬</div>
          <h1>EasyPlayer</h1>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className='nav-menu'>
        <button
          className={`nav-btn ${currentView === 'player' ? 'active' : ''}`}
          onClick={() => onViewChange('player')}
        >
          <MonitorPlay size={20} />
          <span>播放器</span>
        </button>
        <button
          className={`nav-btn ${currentView === 'recent' ? 'active' : ''}`}
          onClick={() => onViewChange('recent')}
        >
          <Clock size={20} />
          <span>最近播放</span>
        </button>
        <button
          className={`nav-btn ${currentView === 'folder' ? 'active' : ''}`}
          onClick={() => onViewChange('folder')}
        >
          <FolderOpen size={20} />
          <span>文件夹</span>
        </button>
      </nav>

      {/* 视频列表 */}
      <div className='video-list-section'>
        <div className='section-header'>
          <Film size={18} />
          <span>{currentView === 'recent' ? '最近播放' : '播放列表'}</span>
          <span className='count'>
            {currentView === 'recent' ? recentPlayed.length : videos.length}
          </span>
        </div>

        <div className='video-list'>
          {currentView === 'recent' ? (
            recentPlayed.length === 0 ? (
              <div className='empty-state'>
                <Clock size={48} strokeWidth={1.5} />
                <p>暂无播放记录</p>
                <span>观看视频后会显示在这里</span>
              </div>
            ) : (
              recentPlayed.map((video, index) => (
                <div
                  key={`recent-${index}`}
                  className='video-item'
                  onClick={() => onPlayVideo(video)}
                >
                  <div className='video-icon'>
                    <Film size={20} />
                  </div>
                  <div className='video-info'>
                    <div className='video-name'>{video.name}</div>
                    <div className='video-time'>
                      {new Date(video.lastPlayed).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </div>
              ))
            )
          ) : videos.length === 0 ? (
            <div className='empty-state'>
              <Film size={48} strokeWidth={1.5} />
              <p>暂无视频</p>
              <span>拖拽视频或文件夹到此处</span>
            </div>
          ) : (
            videos.map((video, index) => (
              <div
                key={`video-${index}`}
                className='video-item'
                onClick={() => onPlayVideo(video)}
              >
                <div className='video-icon'>
                  <Film size={20} />
                </div>
                <div className='video-info'>
                  <div className='video-name'>{video.name}</div>
                  <div className='video-size'>{formatSize(video.size)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 底部操作区 */}
      <div className='sidebar-footer'>
        <button className='action-btn' title='视频信息'>
          <Info size={20} />
        </button>
        <button className='action-btn' title='画中画'>
          <PictureInPicture2 size={20} />
        </button>
        <button className='action-btn' title='设置'>
          <Settings size={20} />
        </button>
        <button
          className='action-btn danger'
          title='清除数据'
          onClick={onClearData}
        >
          <Trash2 size={20} />
        </button>
      </div>
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

export default Sidebar;
