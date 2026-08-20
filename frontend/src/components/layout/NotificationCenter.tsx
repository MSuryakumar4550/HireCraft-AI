import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { EmptyState } from '@/components/common/EmptyState'
import { useUIStore } from '@/stores/uiStore'

export function NotificationCenter() {
  const { notificationOpen, setNotificationOpen } = useUIStore()

  return (
    <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-medium">Notifications</h3>
        </div>
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="When you receive updates about your placement journey, they will appear here."
          className="border-0 bg-transparent py-8"
        />
      </PopoverContent>
    </Popover>
  )
}
