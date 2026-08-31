import { create } from 'zustand'

interface ExamState {
  isExamActive: boolean
  setExamActive: (active: boolean) => void
}

export const useExamStore = create<ExamState>((set) => ({
  isExamActive: false,
  setExamActive: (active) => set({ isExamActive: active }),
}))
