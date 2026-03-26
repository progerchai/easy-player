export interface VideoItem {
  name: string;
  path: string;
  size?: number;
  lastPlayed?: number;
}

export interface VideoProgress {
  currentTime: number;
  duration: number;
  lastPlayed: number;
}

export interface VideoMetadata {
  name: string;
  size: number;
  created: string;
  modified: string;
}

export type ViewType = 'player' | 'recent' | 'folder';

export interface ElectronAPI {
  openFolderDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;
  openFileDialog: () => Promise<{ canceled: boolean; files: VideoItem[] }>;
  readFolderVideos: (folderPath: string) => Promise<VideoItem[]>;
  saveProgress: (data: {
    videoPath: string;
    currentTime: number;
    duration: number;
  }) => Promise<{ success: boolean; error?: string }>;
  getProgress: (videoPath: string) => Promise<VideoProgress | null>;
  getVideoMetadata: (videoPath: string) => Promise<VideoMetadata | null>;
  clearAllData: () => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
