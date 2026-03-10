export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export interface CompanyData {
  name: string;
  context: string;
  lastUpdated: number;
}

export type ViewState = 'chat' | 'knowledge-base';

export interface TuningExample {
  instruction: string;
  context: string;
  response: string;
  source: string;
}

export interface LogicFile {
  meta: {
    version: string;
    generatedAt: string;
    totalExamples: number;
  };
  examples: TuningExample[];
}