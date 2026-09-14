import { apiClient } from './apiClient';

export interface AiMemoryHistoryItem {
  timestamp: string;
  score: number;
  feedback: string;
}

export interface AiMemoryItem {
  memoryId: number;
  memoryType: 'STRENGTH' | 'WEAKNESS' | 'BEHAVIOR' | 'SKILL' | 'EXPERIENCE' | 'EDUCATION';
  category: 'DSA' | 'APTITUDE' | 'TECHNICAL' | 'SQL' | 'SYSTEM_DESIGN' | 'BEHAVIORAL' | 'RESUME';
  memoryKey: string;
  memoryValue: string; // JSON string of AiMemoryHistoryItem[]
}

export const aiMemoryService = {
  getMemoryGraph: () => {
    return apiClient.get<AiMemoryItem[]>('/api/memory');
  }
};
