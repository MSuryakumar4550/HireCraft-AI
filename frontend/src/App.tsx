import { lazy, Suspense } from 'react'
import { APP_NAME } from '@/constants/theme'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { LandingLayout } from '@/layouts/LandingLayout'

const LandingPage = lazy(() => import('@/pages/LandingPage').then((module) => ({ default: module.LandingPage })))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((module) => ({ default: module.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then((module) => ({ default: module.ForgotPasswordPage })))
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage').then((module) => ({ default: module.VerifyEmailPage })))
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage').then((module) => ({ default: module.OnboardingPage })))
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const ResumeAnalyzerPage = lazy(() => import('@/pages/features/ResumeAnalyzerPage').then((module) => ({ default: module.ResumeAnalyzerPage })))
const AIMemoryPage = lazy(() => import('@/pages/features/AIMemoryPage').then((module) => ({ default: module.AIMemoryPage })))
const CodingPracticePage = lazy(() => import('@/pages/features/CodingPracticePage').then((module) => ({ default: module.CodingPracticePage })))
const AptitudePage = lazy(() => import('@/pages/features/AptitudePage').then((module) => ({ default: module.AptitudePage })))
const TechnicalInterviewPage = lazy(() => import('@/pages/features/TechnicalInterviewPage').then((module) => ({ default: module.TechnicalInterviewPage })))
const BehavioralInterviewPage = lazy(() => import('@/pages/features/BehavioralInterviewPage').then((module) => ({ default: module.BehavioralInterviewPage })))
const AIVoiceInterviewPage = lazy(() => import('@/pages/features/AIVoiceInterviewPage').then((module) => ({ default: module.AIVoiceInterviewPage })))
const ReportsPage = lazy(() => import('@/pages/progress/ReportsPage').then((module) => ({ default: module.ReportsPage })))
const ProgressPage = lazy(() => import('@/pages/progress/ProgressPage').then((module) => ({ default: module.ProgressPage })))
const AchievementsPage = lazy(() => import('@/pages/progress/AchievementsPage').then((module) => ({ default: module.AchievementsPage })))
const CompanyReadinessPage = lazy(() => import('@/pages/progress/CompanyReadinessPage').then((module) => ({ default: module.CompanyReadinessPage })))
const StudyPlannerPage = lazy(() => import('@/pages/progress/StudyPlannerPage').then((module) => ({ default: module.StudyPlannerPage })))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage').then((module) => ({ default: module.SettingsPage })))
const ProfilePage = lazy(() => import('@/pages/settings/ProfilePage').then((module) => ({ default: module.ProfilePage })))
const NotificationsPage = lazy(() => import('@/pages/settings/NotificationsPage').then((module) => ({ default: module.NotificationsPage })))
const HelpCenterPage = lazy(() => import('@/pages/misc/HelpCenterPage').then((module) => ({ default: module.HelpCenterPage })))
const AboutPage = lazy(() => import('@/pages/misc/AboutPage').then((module) => ({ default: module.AboutPage })))

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading {APP_NAME}…</div>}>
      <Routes>
        {/* Landing */}
        <Route element={<LandingLayout />}>
          <Route path={ROUTES.LANDING} element={<LandingPage />} />
        </Route>

        {/* Authentication */}
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
        </Route>
        
        {/* Onboarding - isolated layout */}
        <Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />

        {/* Dashboard & App */}
        <Route element={<AppLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.RESUME_ANALYZER} element={<ResumeAnalyzerPage />} />
          <Route path={ROUTES.AI_MEMORY} element={<AIMemoryPage />} />
          <Route path={ROUTES.CODING_PRACTICE} element={<CodingPracticePage />} />
          <Route path={ROUTES.APTITUDE} element={<AptitudePage />} />
          <Route path={ROUTES.TECHNICAL_INTERVIEW} element={<TechnicalInterviewPage />} />
          <Route path={ROUTES.BEHAVIORAL_INTERVIEW} element={<BehavioralInterviewPage />} />
          <Route path={ROUTES.AI_VOICE_INTERVIEW} element={<AIVoiceInterviewPage />} />
          <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
          <Route path={ROUTES.PROGRESS} element={<ProgressPage />} />
          <Route path={ROUTES.ACHIEVEMENTS} element={<AchievementsPage />} />
          <Route path={ROUTES.COMPANY_READINESS} element={<CompanyReadinessPage />} />
          <Route path={ROUTES.STUDY_PLANNER} element={<StudyPlannerPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<NotificationsPage />} />
          <Route path={ROUTES.HELP} element={<HelpCenterPage />} />
          <Route path={ROUTES.ABOUT} element={<AboutPage />} />
        </Route>
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
