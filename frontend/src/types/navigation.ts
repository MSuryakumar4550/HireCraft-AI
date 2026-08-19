import type { LucideIcon } from 'lucide-react'

export interface NavSubItem {
  id: string
  label: string
  path: string
}

export interface NavItem {
  id: string
  label: string
  path: string
  icon: LucideIcon
  group?: string
  showInNav?: boolean
  showBreadcrumb?: boolean
  badge?: string
  subItems?: NavSubItem[]
}

export interface RouteConfig {
  path: string
  label: string
  showBreadcrumb?: boolean
  layout: 'landing' | 'auth' | 'app' | 'onboarding' | 'none'
}
