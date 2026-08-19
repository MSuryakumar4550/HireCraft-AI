export enum FeatureModule {
  ResumeParser = 'resume-parser',
  AdaptiveInterview = 'adaptive-interview',
  AIMemory = 'ai-memory',
  AIProctoring = 'ai-proctoring',
  EyeTracking = 'eye-tracking',
  EmotionDetection = 'emotion-detection',
  RecruiterDashboard = 'recruiter-dashboard',
  CampusPortal = 'campus-portal',
  LearningMarketplace = 'learning-marketplace',
  MobileApp = 'mobile-app',
}

export interface FeatureFlag {
  id: FeatureModule
  label: string
  enabled: boolean
  badge?: string
}

export const FUTURE_MODULES: FeatureFlag[] = [
  { id: FeatureModule.ResumeParser, label: 'AI Resume Parser', enabled: false, badge: 'Soon' },
  { id: FeatureModule.AdaptiveInterview, label: 'Adaptive AI Interview', enabled: false, badge: 'Soon' },
  { id: FeatureModule.AIMemory, label: 'AI Memory Engine', enabled: false },
  { id: FeatureModule.AIProctoring, label: 'AI Proctoring', enabled: false, badge: 'Soon' },
  { id: FeatureModule.EyeTracking, label: 'Eye Tracking', enabled: false, badge: 'Soon' },
  { id: FeatureModule.EmotionDetection, label: 'Emotion Detection', enabled: false, badge: 'Soon' },
  { id: FeatureModule.RecruiterDashboard, label: 'Recruiter Dashboard', enabled: false, badge: 'Soon' },
  { id: FeatureModule.CampusPortal, label: 'Campus Placement Portal', enabled: false, badge: 'Soon' },
  { id: FeatureModule.LearningMarketplace, label: 'Learning Marketplace', enabled: false, badge: 'Soon' },
  { id: FeatureModule.MobileApp, label: 'Mobile App', enabled: false, badge: 'Soon' },
]
