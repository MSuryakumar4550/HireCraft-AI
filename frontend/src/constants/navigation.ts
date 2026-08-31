import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Building2,
  Calendar,
  Code2,
  FileText,
  HelpCircle,
  Home,
  Info,
  LayoutDashboard,
  MessageSquare,
  Mic,
  Settings,
  Target,
  TrendingUp,
  User,
  Users,
  type LucideProps
} from 'lucide-react'
import { ROUTES } from './routes'
import type { NavItem } from '@/types/navigation'

export const NAV_GROUPS = {
  MAIN: 'Main',
  PREPARATION: 'Preparation',
  INTERVIEWS: 'Interviews',
  ANALYTICS: 'Analytics',
  PLANNING: 'Planning',
  ACCOUNT: 'Account',
} as const

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
    group: NAV_GROUPS.MAIN,
    showInNav: true,
    showBreadcrumb: true,
  },
  {
    id: 'resume-analyzer',
    label: 'Resume Analyzer',
    path: ROUTES.RESUME_ANALYZER,
    icon: FileText,
    group: NAV_GROUPS.MAIN,
    showInNav: true,
    showBreadcrumb: true,
  },
  {
    id: 'ai-memory',
    label: 'AI Memory',
    path: ROUTES.AI_MEMORY,
    icon: Brain,
    group: NAV_GROUPS.MAIN,
    showInNav: true,
    showBreadcrumb: true,
  },
  {
    id: 'coding-practice',
    label: 'Coding Practice',
    path: ROUTES.CODING_PRACTICE,
    icon: Code2,
    group: NAV_GROUPS.PREPARATION,
    showInNav: true,
    showBreadcrumb: true,
    subItems: [
      {
        id: 'coding-practice-difficulty',
        label: 'Difficulty Wise',
        path: `${ROUTES.CODING_PRACTICE}?tab=difficulty`,
      },
      {
        id: 'coding-practice-company',
        label: 'Company Wise',
        path: `${ROUTES.CODING_PRACTICE}?tab=company`,
      },
    ],
  },
  {
    id: 'aptitude',
    label: 'Aptitude',
    path: ROUTES.APTITUDE,
    icon: Target,
    group: NAV_GROUPS.PREPARATION,
    showInNav: true,
    showBreadcrumb: true,
  },
  {
    id: 'technical-interview',
    label: 'Technical Interview',
    path: ROUTES.TECHNICAL_INTERVIEW,
    icon: MessageSquare,
    group: NAV_GROUPS.INTERVIEWS,
    showInNav: true,
    showBreadcrumb: true,
  },
  {
    id: 'behavioral-interview',
    label: 'Behavioral Interview',
    path: ROUTES.BEHAVIORAL_INTERVIEW,
    icon: Users,
    group: NAV_GROUPS.INTERVIEWS,
    showInNav: true,
    showBreadcrumb: true,
  },
  {
    id: 'ai-voice-interview',
    label: 'AI Voice Interview',
    path: ROUTES.AI_VOICE_INTERVIEW,
    icon: Mic,
    group: NAV_GROUPS.INTERVIEWS,
    showInNav: true,
    showBreadcrumb: true,
  },
  {
    id: 'reports',
    label: 'Reports',
    path: ROUTES.REPORTS,
    icon: BarChart3,
    group: NAV_GROUPS.ANALYTICS,
    showInNav: true,
    showBreadcrumb: true,
  },
  {
    id: 'progress',
    label: 'Progress',
    path: ROUTES.PROGRESS,
    icon: TrendingUp,
    group: NAV_GROUPS.ANALYTICS,
    showInNav: true,
    showBreadcrumb: true,
  },
  {
    id: 'achievements',
    label: 'Achievements',
    path: ROUTES.ACHIEVEMENTS,
    icon: Award,
    group: NAV_GROUPS.ANALYTICS,
    showInNav: true,
    showBreadcrumb: true,
  },
  {
    id: 'company-readiness',
    label: 'Company Readiness',
    path: ROUTES.COMPANY_READINESS,
    icon: Building2,
    group: NAV_GROUPS.ANALYTICS,
    showInNav: true,
    showBreadcrumb: true,
  },
  {
    id: 'study-planner',
    label: 'Study Planner',
    path: ROUTES.STUDY_PLANNER,
    icon: Calendar,
    group: NAV_GROUPS.PLANNING,
    showInNav: true,
    showBreadcrumb: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    path: ROUTES.SETTINGS,
    icon: Settings,
    group: NAV_GROUPS.ACCOUNT,
    showInNav: true,
    showBreadcrumb: true,
  },
  {
    id: 'profile',
    label: 'Profile',
    path: ROUTES.PROFILE,
    icon: User,
    group: NAV_GROUPS.ACCOUNT,
    showInNav: false,
    showBreadcrumb: true,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    path: ROUTES.NOTIFICATIONS,
    icon: Bell,
    group: NAV_GROUPS.ACCOUNT,
    showInNav: false,
    showBreadcrumb: true,
  },
  {
    id: 'help',
    label: 'Help Center',
    path: ROUTES.HELP,
    icon: HelpCircle,
    group: NAV_GROUPS.ACCOUNT,
    showInNav: false,
    showBreadcrumb: true,
  },
  {
    id: 'about',
    label: 'About',
    path: ROUTES.ABOUT,
    icon: Info,
    group: NAV_GROUPS.ACCOUNT,
    showInNav: false,
    showBreadcrumb: true,
  },
]

export const QUICK_ACTIONS = [
  { label: 'Resume Analyzer', path: ROUTES.RESUME_ANALYZER, icon: FileText },
  { label: 'Coding Practice', path: ROUTES.CODING_PRACTICE, icon: Code2 },
  { label: 'Study Planner', path: ROUTES.STUDY_PLANNER, icon: BookOpen },
  { label: 'AI Voice Interview', path: ROUTES.AI_VOICE_INTERVIEW, icon: Mic },
]

export function getNavItemByPath(path: string): NavItem | undefined {
  return NAV_ITEMS.find((item) => item.path === path)
}

export function getGroupedNavItems(): Record<string, NavItem[]> {
  return NAV_ITEMS.filter((item) => item.showInNav).reduce<Record<string, NavItem[]>>(
    (acc, item) => {
      const group = item.group ?? 'Other'
      if (!acc[group]) acc[group] = []
      acc[group].push(item)
      return acc
    },
    {},
  )
}


import React from 'react'

const CustomLogo = (props: LucideProps) => (
  React.createElement('img', { 
    src: '/Transparent_logo.png', 
    alt: 'Logo', 
    className: props.className, 
    style: { objectFit: 'contain' } 
  })
)

export const BRAND_ICON = CustomLogo
export const HOME_ICON = Home
