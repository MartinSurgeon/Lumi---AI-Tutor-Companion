
export interface StudentProfile {
  name: string;
  grade: string;
  favoriteSubject: string;
  struggleTopic: string;
  learningStyle: 'visual' | 'auditory' | 'hands-on';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
  image?: string; // Base64 data URL for generated images
  isFavorite?: boolean;
  isFlagged?: boolean;
}

export type ImageResolution = '1K' | '2K' | '4K';

export interface LearningStats {
  understandingScore: number; // 0-100
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  lastUpdateReason?: string;
}

export interface AudioStreamConfig {
  sampleRate: number;
}

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}
export interface Window {
  aistudio?: {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  };
}