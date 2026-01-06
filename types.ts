
export interface ModelConfig {
  model: 'glm-4.5-flash' | 'glm-4-plus' | 'glm-4-air';
  temperature: number;
  topP: number;
}

export interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  content: string[];
  notes?: string;
  customIcons?: string[];
  type: 'title' | 'content' | 'feature' | 'summary';
  visualType?: 'chart' | 'pie-chart' | 'icon-grid' | 'flow-chart' | 'radar' | 'radial-bar' | 'area-chart' | 'none';
  backgroundGradient?: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bgGradient: string;
  textColor: string;
  fontFamily: string;
  headingFont: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
