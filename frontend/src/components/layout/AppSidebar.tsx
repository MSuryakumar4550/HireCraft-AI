import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AppLogo } from './AppLogo'
import { getGroupedNavItems } from '@/constants/navigation'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

interface AppSidebarProps {
  collapsed?: boolean
  onNavigate?: () => void
}

export function AppSidebar({ collapsed, onNavigate }: AppSidebarProps) {
  const location = useLocation()
  const { toggleSidebarCollapsed } = useUIStore()
  const groupedItems = getGroupedNavItems()
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const toggleExpanded = (id: string, currentExpandedState: boolean, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setExpandedItems((prev) => ({ ...prev, [id]: !currentExpandedState }))
  }

  return (
    <aside
      aria-expanded={!collapsed}
      className={cn(
        'flex h-screen sticky top-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground overflow-hidden transition-[width] duration-200 ease-standard',
        collapsed ? 'w-[var(--sidebar-width-collapsed)]' : 'w-[var(--sidebar-width)]',
      )}
      aria-label="Main navigation"
    >
      <div className={cn('flex h-[var(--topnav-height)] items-center border-b border-sidebar-border px-3', collapsed && 'justify-center')}>
        <AppLogo collapsed={collapsed} taglineClassName="text-sidebar-foreground/75" />
      </div>

      <ScrollArea className="flex-1 min-h-0 px-2 py-3">
        <nav className="space-y-4">
          {Object.entries(groupedItems).map(([group, items]) => (
            <div key={group}>
              {!collapsed && (
                <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wider text-sidebar-muted">
                  {group}
                </p>
              )}
              <ul className="space-y-0.5" role="list">
                {items.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  const hasSubItems = item.subItems && item.subItems.length > 0
                  
                  // Check if any sub-item is active
                  let isAnySubActive = false;
                  if (hasSubItems) {
                      isAnySubActive = item.subItems!.some(subItem => {
                          const subPath = subItem.path.split('?')[0]
                          const searchParams = new URLSearchParams(subItem.path.split('?')[1] || '')
                          const currentSearchParams = new URLSearchParams(location.search)
                          
                          if (location.pathname === subPath) {
                              if (searchParams.toString() === '') return currentSearchParams.toString() === '';
                              let matches = true;
                              searchParams.forEach((value, key) => {
                                  if (currentSearchParams.get(key) !== value) matches = false;
                              });
                              return matches;
                          }
                          return false;
                      });
                  }

                  const isExpanded = expandedItems[item.id] ?? (isActive || isAnySubActive)

                  const link = (
                    <Link
                      to={item.path}
                      onClick={(e) => {
                        if (hasSubItems && !isExpanded) {
                          setExpandedItems((prev) => ({ ...prev, [item.id]: true }))
                        }
                        if (onNavigate) onNavigate()
                      }}
                      className={cn(
                        'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors group relative',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground',
                        collapsed && 'justify-center px-2',
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-[10px]">
                              {item.badge}
                            </Badge>
                          )}
                          {hasSubItems && (
                            <button
                              onClick={(e) => toggleExpanded(item.id, isExpanded, e)}
                              className="ml-auto p-1 rounded-sm hover:bg-sidebar-accent/50 text-sidebar-muted-foreground hover:text-sidebar-foreground transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="size-4" />
                              ) : (
                                <ChevronRight className="size-4" />
                              )}
                            </button>
                          )}
                        </>
                      )}
                    </Link>
                  )

                  return (
                    <li key={item.id} className="relative">
                      {collapsed ? (
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                      ) : (
                        link
                      )}
                      
                      {!collapsed && hasSubItems && isExpanded && (
                        <ul className="mt-1 space-y-0.5 pl-9 pr-2">
                          {item.subItems!.map((subItem) => {
                            const subPath = subItem.path.split('?')[0]
                            const searchParams = new URLSearchParams(subItem.path.split('?')[1] || '')
                            const currentSearchParams = new URLSearchParams(location.search)
                            
                            let isSubActive = false;
                            if (location.pathname === subPath) {
                                if (searchParams.toString() === '') {
                                    isSubActive = currentSearchParams.toString() === '';
                                } else {
                                    isSubActive = true;
                                    searchParams.forEach((value, key) => {
                                        if (currentSearchParams.get(key) !== value) {
                                            isSubActive = false;
                                        }
                                    });
                                }
                            }

                            return (
                              <li key={subItem.id}>
                                <Link
                                  to={subItem.path}
                                  onClick={onNavigate}
                                  className={cn(
                                    'flex items-center gap-3 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
                                    isSubActive
                                      ? 'text-sidebar-foreground bg-sidebar-accent'
                                      : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                                  )}
                                >
                                  <div className="size-1.5 rounded-full bg-current opacity-50" />
                                  <span className="flex-1 truncate">{subItem.label}</span>
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>

      <Separator />
      <div className={cn('hidden p-2 lg:block', collapsed && 'flex justify-center')}>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleSidebarCollapsed}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </Button>
      </div>
    </aside>
  )
}

export function AppSidebarMobile({ onNavigate }: { onNavigate?: () => void }) {
  return <AppSidebar onNavigate={onNavigate} />
}
