import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ACCENT_COLORS, DENSITY_OPTIONS, THEME_MODES } from '@/constants/theme'
import { useThemeStore } from '@/stores/themeStore'
import { Check, Monitor, Moon, Palette, Sun, Zap } from 'lucide-react'
import { transitionTheme } from '@/utils/themeTransition'

export function ThemeSwitcher() {
  const { mode, accent, density, reducedMotion, setMode, setAccent, setDensity, setReducedMotion } =
    useThemeStore()

  const modeIcons = { light: Sun, dark: Moon, system: Monitor, amoled: Zap }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Theme settings">
          <Palette className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {THEME_MODES.map(({ value, label }) => {
          const Icon = modeIcons[value]
          return (
            <DropdownMenuItem key={value} onClick={() => transitionTheme(() => setMode(value), reducedMotion)}>
              <Icon className="size-4" />
              {label}
              {mode === value && <Check className="ml-auto size-4" />}
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Accent</DropdownMenuLabel>
        {ACCENT_COLORS.map(({ value, label, className }) => (
          <DropdownMenuItem key={value} onClick={() => transitionTheme(() => setAccent(value), reducedMotion)}>
            <span className={`size-3 rounded-full ${className}`} />
            {label}
            {accent === value && <Check className="ml-auto size-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Density</DropdownMenuLabel>
        {DENSITY_OPTIONS.map(({ value, label }) => (
          <DropdownMenuItem key={value} onClick={() => setDensity(value)}>
            {label}
            {density === value && <Check className="ml-auto size-4" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setReducedMotion(!reducedMotion)}>
          Reduced motion
          {reducedMotion && <Check className="ml-auto size-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
