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
  created: Date;
  modified: Date;
}

export type ViewType = 'player' | 'recent' | 'folder';
