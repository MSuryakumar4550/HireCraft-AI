import { create } from 'zustand'

interface UIState {
  sidebarCollapsed: boolean
  sidebarOpen: boolean
  commandPaletteOpen: boolean
  notificationOpen: boolean
  aiAssistantOpen: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebarCollapsed: () => void
  setSidebarOpen: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
  setNotificationOpen: (open: boolean) => void
  setAiAssistantOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  sidebarOpen: false,
  commandPaletteOpen: false,
  notificationOpen: false,
  aiAssistantOpen: false,
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  setNotificationOpen: (notificationOpen) => set({ notificationOpen }),
  setAiAssistantOpen: (aiAssistantOpen) => set({ aiAssistantOpen }),
}))
