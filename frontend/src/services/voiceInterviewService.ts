import { apiClient } from './apiClient'

export interface InterviewSession {
  interviewSessionId: number
  id?: string
  candidateId?: string
  interviewType: string
  subject?: string
  status: string
  sessionIdentifier?: string
  totalQuestions?: number
  totalScore?: number
  currentTopic?: string
  remainingTopics?: string[]
  createdAt?: string
}

export interface InterviewQuestion {
  id: string
  question: string
  questionText?: string
  subject: string
  topic: string
  difficulty: string
  concepts: string[]
  criteria: string[]
}

export interface CandidateAnswer {
  questionNo: number
  questionId: string
  answerText?: string
  transcript?: string
  evaluationScore?: number
}

export interface QuestionEvaluationSummary {
  answerId: number
  questionNo: number
  questionId: string
  questionText: string
  topic: string
  difficultyLevel: string
  transcript: string
  score: number
  feedback: string
}

export interface InterviewSummaryResponse {
  sessionId: number
  candidateId: number
  candidateName: string
  interviewType: string
  subject?: string
  status: string
  overallScore: number
  summaryFeedback: string
  overallStrengths: string[]
  areasForImprovement: string[]
  questionEvaluations: QuestionEvaluationSummary[]
  createdAt?: string
}

export interface CreateInterviewPayload {
  interviewType?: string
  subject?: string
  experienceLevel?: string
  difficultyLevel?: string
  jobRole?: string
  useQuestionBank?: boolean
  candidateId?: string
}

export interface SubmitAnswerPayload {
  questionNo: number
  questionId: string
  answerText?: string
  transcript?: string
  responseDurationSeconds?: number
  responseLatencySeconds?: number
}

export const voiceInterviewService = {
  async getSubjects(): Promise<string[]> {
    return ['DBMS', 'OPERATING_SYSTEMS', 'COMPUTER_NETWORKS', 'OOPS_DATA_STRUCTURES']
  },

  async createSession(payload: CreateInterviewPayload): Promise<InterviewSession> {
    const res = await apiClient.post<InterviewSession>('/api/interviews/sessions', {
      interviewType: payload.interviewType?.toUpperCase() === 'TECHNICAL' ? 'TECHNICAL' : 'TECHNICAL',
      subject: payload.subject || 'Operating Systems',
      experienceLevel: payload.experienceLevel,
      difficultyLevel: payload.difficultyLevel,
    })
    const session = res.data
    return {
      ...session,
      id: String(session.interviewSessionId),
    }
  },

  async startInterview(sessionId: string | number): Promise<InterviewSession> {
    const res = await apiClient.post<InterviewSession>(`/api/interviews/sessions/${sessionId}/start`)
    const session = res.data
    return {
      ...session,
      id: String(session.interviewSessionId),
    }
  },

  async getCurrentQuestion(sessionId: string | number): Promise<InterviewQuestion | null> {
    const res = await apiClient.get<InterviewQuestion>(`/api/interviews/sessions/${sessionId}/current-question`)
    const q = res.data
    if (!q) return null
    return {
      ...q,
      questionText: q.question || (q as any).questionText,
    }
  },

  async submitAnswer(
    sessionId: string | number,
    payloadOrQuestionId: SubmitAnswerPayload | string,
    maybeAnswerText?: string,
    questionNo?: number
  ): Promise<InterviewQuestion | null> {
    let payload: SubmitAnswerPayload
    if (typeof payloadOrQuestionId === 'string') {
      payload = {
        questionNo: questionNo || 1,
        questionId: payloadOrQuestionId,
        answerText: maybeAnswerText || '',
        transcript: maybeAnswerText || '',
        responseDurationSeconds: 60,
      }
    } else {
      payload = {
        ...payloadOrQuestionId,
        questionNo: payloadOrQuestionId.questionNo || 1,
        transcript: payloadOrQuestionId.transcript || payloadOrQuestionId.answerText || '',
      }
    }

    try {
      const res = await apiClient.post<InterviewQuestion>(`/api/interviews/sessions/${sessionId}/answers`, payload)
      if (res.status === 204 || !res.data) {
        return null // Interview complete
      }
      const nextQ = res.data
      return {
        ...nextQ,
        questionText: nextQ.question || (nextQ as any).questionText,
      }
    } catch (err: any) {
      if (err.status === 204) return null
      throw err
    }
  },

  async completeInterview(sessionId: string | number): Promise<InterviewSession> {
    const res = await apiClient.post<InterviewSession>(`/api/interviews/sessions/${sessionId}/complete`)
    const session = res.data
    return {
      ...session,
      id: String(session.interviewSessionId),
    }
  },

  async getSummary(sessionId: string | number): Promise<InterviewSummaryResponse> {
    const res = await apiClient.get<InterviewSummaryResponse>(`/api/interviews/sessions/${sessionId}/summary`)
    return res.data
  },
}
