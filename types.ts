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
