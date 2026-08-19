import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'
import { ThemeProvider } from './hooks/useTheme'
import { JoyrideProvider } from './contexts/JoyrideProvider'
import { queryClient } from './lib/queryClient'
import { Toaster } from './components/ui/sonner'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <JoyrideProvider>
          <App />
          <Toaster richColors closeButton />
        </JoyrideProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
)
