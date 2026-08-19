import { Outlet } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { TopNavigation } from '@/components/layout/TopNavigation'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { AIAssistantFab } from '@/components/layout/AIAssistantFab'
import { useUIStore } from '@/stores/uiStore'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { pageTransition } from '@/utils/motion'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const location = useLocation()
  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotion()
  const { sidebarCollapsed, sidebarOpen, setSidebarOpen } = useUIStore()

  return (
    <TooltipProvider delayDuration={0}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <div className="flex min-h-screen bg-background">
        {!isMobile && <AppSidebar collapsed={sidebarCollapsed} />}

        <Sheet open={sidebarOpen && isMobile} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[var(--sidebar-width)] p-0">
            <AppSidebar onNavigate={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavigation />
          <CommandPalette />

          <main id="main-content" className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={reducedMotion ? false : 'initial'}
                animate="animate"
                exit={reducedMotion ? undefined : 'exit'}
                variants={pageTransition}
                className={cn('page-container mx-auto w-full max-w-7xl')}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <AIAssistantFab />
      </div>
    </TooltipProvider>
  )
}
