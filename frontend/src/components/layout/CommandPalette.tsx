import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, LayoutDashboard, Search, Settings } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { NAV_ITEMS } from '@/constants/navigation'
import { ROUTES } from '@/constants/routes'
import { useUIStore } from '@/stores/uiStore'

export function CommandPalette() {
  const navigate = useNavigate()
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [setCommandPaletteOpen])

  const runCommand = (path: string) => {
    setCommandPaletteOpen(false)
    navigate(path)
  }

  const navItems = NAV_ITEMS.filter((item) => item.showInNav)

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput placeholder="Search pages and actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(ROUTES.DASHBOARD)}>
            <LayoutDashboard className="size-4" />
            Dashboard
          </CommandItem>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <CommandItem key={item.id} onSelect={() => runCommand(item.path)}>
                <Icon className="size-4" />
                {item.label}
              </CommandItem>
            )
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(ROUTES.RESUME_ANALYZER)}>
            <FileText className="size-4" />
            Analyze Resume
          </CommandItem>
          <CommandItem onSelect={() => runCommand(ROUTES.SETTINGS)}>
            <Settings className="size-4" />
            Settings
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Search">
          <CommandItem disabled>
            <Search className="size-4" />
            Global search coming soon
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
