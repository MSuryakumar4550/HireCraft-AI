import { apiClient } from './apiClient';

export interface AptitudeQuestion {
  id: number;
  topic: string;
  questionText: string;
  options: string[];
}

export interface AptitudeAssessment {
  aptitudeAssessmentId: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  totalQuestions: number;
  score: number;
  accuracy: number;
}

export const aptitudeService = {
  getQuestions: () => {
    return apiClient.get<AptitudeQuestion[]>('/api/aptitude/questions');
  },
  
  createAssessment: () => {
    return apiClient.post<AptitudeAssessment>('/api/aptitude/assessments');
  },
  
  submitAnswer: (assessmentId: number, questionNo: number, selectedOption: string, timeTakenSeconds: number) => {
    return apiClient.post(`/api/aptitude/assessments/${assessmentId}/answers`, {
      questionNo,
      selectedOption,
      timeTakenSeconds
    });
  },
  
  completeAssessment: (assessmentId: number) => {
    return apiClient.post<AptitudeAssessment>(`/api/aptitude/assessments/${assessmentId}/complete`);
  },
  
  saveScore: (score: number, totalQuestions: number, accuracy: number) => {
    return apiClient.post<AptitudeAssessment>(`/api/aptitude/assessments/save-score`, {
      score,
      totalQuestions,
      accuracy
    });
  }
};
