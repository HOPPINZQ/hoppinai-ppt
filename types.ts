
export interface Slide {
  id: string;
  title: string;
  subtitle?: string;
  content: string[];
  notes?: string;
  customIcons?: string[]; // Array of icon keys matching the content index
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

export interface Presentation {
  title: string;
  slides: Slide[];
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
