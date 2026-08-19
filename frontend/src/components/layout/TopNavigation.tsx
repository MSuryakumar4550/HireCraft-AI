import { Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlobalSearch } from './GlobalSearch'
import { NotificationCenter } from './NotificationCenter'
import { ProfileDropdown } from './ProfileDropdown'
import { ThemeSwitcher } from './ThemeSwitcher'
import { useUIStore } from '@/stores/uiStore'
import { useIsMobile } from '@/hooks/useMediaQuery'

export function TopNavigation() {
  const isMobile = useIsMobile()
  const { setSidebarOpen, setCommandPaletteOpen } = useUIStore()

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-card/95 shadow-xs backdrop-blur supports-[backdrop-filter]:bg-card/85">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-1 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="size-4" />
            </Button>
          )}

          <GlobalSearch className="flex-1 max-w-xl" />
        </div>

        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setCommandPaletteOpen(true)}
              aria-label="Open search"
            >
              <Search className="size-4" />
            </Button>
          )}
          <ThemeSwitcher />
          <NotificationCenter />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  )
}
