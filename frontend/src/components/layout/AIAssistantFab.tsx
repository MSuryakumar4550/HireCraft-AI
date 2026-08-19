import { Bot, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/common/EmptyState'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

export function AIAssistantFab() {
  const { aiAssistantOpen, setAiAssistantOpen } = useUIStore()

  return (
    <>
      <Button
        size="icon-lg"
        className={cn(
          'fixed bottom-6 right-6 z-50 size-12 rounded-full shadow-lg',
          'transition-transform hover:scale-105',
        )}
        onClick={() => setAiAssistantOpen(true)}
        aria-label="Open AI assistant"
      >
        <Bot className="size-5" />
      </Button>

      <Drawer open={aiAssistantOpen} onOpenChange={setAiAssistantOpen}>
        <DrawerContent className="mx-auto max-h-[85vh] max-w-lg">
          <DrawerHeader className="text-left">
            <div className="flex items-center justify-between">
              <DrawerTitle className="flex items-center gap-2">
                <Bot className="size-5 text-primary" />
                AI Assistant
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Close assistant">
                  <X className="size-4" />
                </Button>
              </DrawerClose>
            </div>
            <DrawerDescription>
              Your placement mentor will be available here once AI services are connected.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4">
            <EmptyState
              icon={Bot}
              title="AI Assistant coming soon"
              description="Ask questions about your preparation, get personalized guidance, and receive instant feedback."
              className="border-0 bg-transparent"
            />
          </div>
          <DrawerFooter className="border-t pt-4">
            <div className="flex w-full gap-2">
              <Input placeholder="Type a message..." disabled aria-label="Message input" />
              <Button size="icon" disabled aria-label="Send message">
                <Send className="size-4" />
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
