import { apiClient } from './apiClient'

export interface InterviewSession {
  id: string
  candidateId: string
  candidateName: string
  jobRole: string
  experienceLevel: string
  interviewType: string
  status: string
  questions: InterviewQuestion[]
  createdAt?: string
  updatedAt?: string
}

export interface InterviewQuestion {
  id: string
  sessionId: string
  questionText: string
  sequenceOrder: number
  candidateAnswer?: CandidateAnswer
  createdAt?: string
}

export interface CandidateAnswer {
  id: string
  questionId: string
  transcript: string
  audioFileUrl?: string
  createdAt?: string
}

export interface EvaluationResponse {
  evaluationId: string
  answerId: string
  score: number
  technicalScore: number
  relevanceScore: number
  completenessScore: number
  communicationScore: number
  feedback: string
  strengths: string[]
  weaknesses: string[]
  createdAt?: string
}

export interface InterviewSummaryResponse {
  sessionId: string
  candidateId: string
  candidateName: string
  jobRole: string
  experienceLevel: string
  interviewType: string
  status: string
  overallScore: number
  summaryFeedback: string
  overallStrengths: string[]
  areasForImprovement: string[]
  questionEvaluations: EvaluationResponse[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateInterviewPayload {
  candidateId: string
  jobRole: string
  experienceLevel: string
  interviewType: string
  subject?: string
  difficultyLevel?: string
  useQuestionBank?: boolean
}

export const voiceInterviewService = {
  async getSubjects(): Promise<string[]> {
    try {
      const res = await apiClient.get<{ data: string[] }>('/api/v1/interviews/subjects')
      return res.data.data || ['DBMS', 'OPERATING_SYSTEMS', 'COMPUTER_NETWORKS', 'OOPS_DATA_STRUCTURES']
    } catch {
      return ['DBMS', 'OPERATING_SYSTEMS', 'COMPUTER_NETWORKS', 'OOPS_DATA_STRUCTURES']
    }
  },

  async createSession(payload: CreateInterviewPayload): Promise<InterviewSession> {
    const res = await apiClient.post<{ data: InterviewSession }>('/api/v1/interviews', payload)
    return res.data.data
  },

  async startInterview(sessionId: string): Promise<InterviewSession> {
    const res = await apiClient.post<{ data: InterviewSession }>(`/api/v1/interviews/${sessionId}/start`)
    return res.data.data
  },

  async getCurrentQuestion(sessionId: string): Promise<InterviewQuestion> {
    const res = await apiClient.get<{ data: InterviewQuestion }>(`/api/v1/interviews/${sessionId}/current-question`)
    return res.data.data
  },

  async submitAnswer(sessionId: string, questionId: string, transcript: string): Promise<CandidateAnswer> {
    const res = await apiClient.post<{ data: CandidateAnswer }>(`/api/v1/interviews/${sessionId}/answer`, {
      questionId,
      transcript,
    })
    return res.data.data
  },

  async submitVoiceAnswer(sessionId: string, questionId: string, audioBlob: Blob): Promise<CandidateAnswer> {
    const formData = new FormData()
    formData.append('questionId', questionId)
    formData.append('audioFile', audioBlob, 'voice-answer.webm')
    formData.append('mimeType', audioBlob.type || 'audio/webm')

    const response = await fetch(`${apiClient.baseUrl}/api/v1/interviews/${sessionId}/voice-answer`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Failed to submit voice answer')
    }

    const res = await response.json()
    return res.data
  },

  async completeInterview(sessionId: string): Promise<InterviewSession> {
    const res = await apiClient.post<{ data: InterviewSession }>(`/api/v1/interviews/${sessionId}/complete`)
    return res.data.data
  },

  async getSummary(sessionId: string): Promise<InterviewSummaryResponse> {
    const res = await apiClient.get<{ data: InterviewSummaryResponse }>(`/api/v1/interviews/${sessionId}/summary`)
    return res.data.data
  },
}
