/// <reference types="vite/client" />

interface ElectronAPI {
  openFolderDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>;
  openFileDialog: () => Promise<{ canceled: boolean; files: any[] }>;
  readFolderVideos: (folderPath: string) => Promise<any[]>;
  saveProgress: (data: { videoPath: string; currentTime: number; duration: number }) => Promise<{ success: boolean }>;
  getProgress: (videoPath: string) => Promise<any>;
  getVideoMetadata: (videoPath: string) => Promise<any>;
  clearAllData: () => Promise<{ success: boolean }>;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
}

interface Window {
  electronAPI?: ElectronAPI;
}
