# EasyPlayer

现代化的 Electron 视频播放器，基于 React 18 + TypeScript + Ant Design 构建。

## ✨ 特性

- 🎬 **拖拽播放** - 支持拖拽视频文件和文件夹
- 📁 **文件夹浏览** - 浏览和选择本地文件夹中的视频
- 💾 **播放记录** - 自动保存最近播放记录
- ⏯️ **播放控制** - 播放/暂停、进度条、音量调节
- 🚀 **倍速播放** - 支持 0.5x - 5.0x 倍速
- 🖼️ **画中画** - 支持画中画模式
- 📸 **视频截图** - 一键截取视频画面
- 🌙 **现代化 UI** - 基于 Ant Design 的简洁界面

## 🛠️ 技术栈

- **框架**: React 18 + TypeScript
- **UI 库**: Ant Design 5.x
- **样式**: SCSS
- **构建工具**: Vite 5.x
- **桌面应用**: Electron 28.x
- **图标**: Lucide React

## 📦 安装和运行

### 安装依赖

```bash
npm install --legacy-peer-deps
```

### 开发模式

```bash
npm run electron:dev
```

这会同时启动 Vite 开发服务器和 Electron 应用。

### 生产构建

```bash
npm run electron:build
```

## 📝 功能说明

### 基本操作

1. **拖拽播放**: 将视频文件拖拽到播放器窗口即可播放
2. **文件夹浏览**: 点击侧边栏"文件夹"按钮，选择包含视频的文件夹
3. **最近播放**: 自动记录最近 20 个播放过的视频

### 播放控制

- **播放/暂停**: 点击播放区域或使用空格键
- **进度控制**: 拖动进度条快速跳转
- **音量调节**: 鼠标滚轮或拖动音量滑块
- **倍速切换**: 设置菜单中调整播放速度（0.5x - 5.0x）

### 高级功能

- **画中画**: 点击画中画按钮，视频悬浮置顶播放
- **视频截图**: 点击截图按钮保存当前帧
- **全屏播放**: 双击视频或点击全屏按钮

## 🗂️ 项目结构

```
easy-player/
├── electron/              # Electron 主进程
│   ├── main.js           # 主进程入口
│   └── preload.js        # 预加载脚本
├── src/                  # React 源代码
│   ├── components/       # React 组件
│   │   ├── Sidebar.tsx   # 侧边栏组件
│   │   └── VideoPlayer.tsx # 播放器组件
│   ├── styles/           # SCSS 样式
│   ├── types/            # TypeScript 类型定义
│   ├── App.tsx           # 根组件
│   └── main.tsx          # React 入口
├── package.json          # 项目配置
└── vite.config.ts        # Vite 配置
```

## 🔧 开发指南

### Node.js 版本要求

- 推荐：Node.js 18+
- 最低：Node.js 16 (需要 polyfill)

### 代码规范

- 使用 TypeScript 严格模式
- SCSS 类名带 prefix 前缀（如 `ep-sidebar`）
- 动画定义在 SCSS 文件顶部
- 使用 Ant Design 组件库
- 使用 lucide-react 图标库

## 📄 License

MIT

## 👨‍💻 Author

ProgerChai

## 🔗 Links

- [GitHub](https://github.com/progerchai/easy-player)
- [React](https://react.dev/)
- [Ant Design](https://ant.design/)
- [Electron](https://www.electronjs.org/)
