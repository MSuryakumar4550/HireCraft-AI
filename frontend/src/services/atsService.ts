import { apiClient } from './apiClient'

export interface PythonAtsResponse {
  final_ats_score: number
  breakdown: {
    keyword_match: {
      score: number
      matched: string[]
      missing: string[]
    }
    semantic_score: number
    format_score: number
    TEXT_THE_AI_READ: string
    recommendations: string[]
  }
}

export const atsService = {
  analyzeResume: async (
    file: File,
    jobDescription: string,
    requiredSkills: string,
    userId: number
  ) => {
    return apiClient.uploadFile<PythonAtsResponse>(
      '/api/ats/python-score',
      file,
      'resume_file',
      {
        job_description: jobDescription,
        required_skills: requiredSkills,
        user_id: userId.toString(),
      }
    )
  },
}
