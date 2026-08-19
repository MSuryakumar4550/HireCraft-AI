import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/uiStore'

interface GlobalSearchProps {
  className?: string
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen)

  return (
    <Button
      variant="outline"
      className={
        'relative hidden h-8 w-full max-w-sm justify-start gap-2 text-muted-foreground md:flex ' +
        (className ?? '')
      }
      onClick={() => setCommandPaletteOpen(true)}
      aria-label="Open search"
    >
      <Search className="size-4 shrink-0" />
      <span className="text-sm">Search...</span>
      <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium lg:inline-flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  )
}
