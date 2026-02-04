"use client"

import * as React from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AccountSwitcher } from "./account-switcher"
import { Nav } from "./nav"
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { 
  Menu,
  Inbox,
  File,
  Send,
  ArchiveX,
  Trash2,
  Archive,
  PenBox,
  ArrowLeft,
  AlertCircle,
  MessagesSquare,
  Search,
  ShoppingCart,
  Users2,
} from "lucide-react"
import { cn } from "@/lib/tiptap-utils"

interface MailLayoutProps {
  accounts: {
    label: string
    email: string
    icon: React.ReactNode
  }[]
  defaultLayout: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize: number
  folder?: 'inbox' | 'sent' | 'drafts' | 'junk' | 'trash' | 'archive' | 'compose'
  children: React.ReactNode
  layoutCookieName?: string
  isMobile?: boolean
}

export function MailLayout({
  accounts,
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize,
  folder = 'inbox',
  children,
  layoutCookieName = "react-resizable-panels:layout:mail",
  isMobile
}: MailLayoutProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  const isMobileHook = useIsBreakpoint("max", 768)
  const mobile = isMobile ?? isMobileHook

  if (mobile) {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="flex h-full flex-col">
          <div className="flex items-center p-4 border-b">
            <Sheet>
               <SheetTrigger asChild>
                 <Button variant="ghost" size="icon" className="md:hidden">
                   <Menu className="h-5 w-5" />
                   <span className="sr-only">Toggle Menu</span>
                 </Button>
               </SheetTrigger>
               <SheetContent side="left" className="w-[80vw] sm:w-[350px] p-0">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex flex-col h-full py-4">
                     <div className="px-4 pb-4">
                      <AccountSwitcher isCollapsed={false} accounts={accounts} />
                     </div>
                     <Separator />
                     <Nav
                        isCollapsed={false}
                        links={[
                          {
                            title: "Inbox",
                            label: "",
                            icon: Inbox,
                            variant: folder === 'inbox' ? "default" : "ghost",
                            href: "/mails/inbox"
                          },
                          {
                            title: "Drafts",
                            label: "",
                            icon: File,
                            variant: folder === 'drafts' ? "default" : "ghost",
                            href: "/mails/drafts"
                          },
                          {
                            title: "Sent",
                            label: "",
                            icon: Send,
                            variant: folder === 'sent' ? "default" : "ghost",
                            href: "/mails/sent"
                          },
                          {
                            title: "Junk",
                            label: "",
                            icon: ArchiveX,
                            variant: folder === 'junk' ? "default" : "ghost",
                            href: "/mails/junk"
                          },
                          {
                            title: "Trash",
                            label: "",
                            icon: Trash2,
                            variant: folder === 'trash' ? "default" : "ghost",
                            href: "/mails/trash"
                          },
                          {
                            title: "Archive",
                            label: "",
                            icon: Archive,
                            variant: folder === 'archive' ? "default" : "ghost",
                            href: "/mails/archive"
                          },
                        ]}
                      />
                      <Separator />
                      <Nav
                        isCollapsed={false}
                        links={[
                          {
                            title: "Compose",
                            label: "",
                            icon: PenBox,
                            variant: folder === 'compose' ? "default" : "ghost",
                            href: "/mails/compose"
                          },
                           {
                            title: "Dashboard",
                            label: "",
                            icon: ArrowLeft,
                            variant: folder !== 'compose' ? "default" : "ghost",
                            href: "/dashboard"
                          },
                        ]}
                      />
                  </div>
               </SheetContent>
            </Sheet>
            <div className="ml-4 font-semibold text-lg capitalize">{folder}</div>
          </div>
          <div className="flex-1 overflow-hidden">
             {children}
          </div>
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `${layoutCookieName}=${JSON.stringify(sizes)}`
        }}
        className="h-full max-h-[800px] items-stretch bg-background text-primary"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={20}
          onCollapse={() => {
            setIsCollapsed(true)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              true
            )}`
          }}
          onResize={() => {
            setIsCollapsed(false)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
              false
            )}`
          }}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out"
          )}
        >
          <div
            className={cn(
              "flex h-[52px] items-center justify-center",
              isCollapsed ? "h-[52px]" : "px-2"
            )}
          >
            <AccountSwitcher isCollapsed={isCollapsed} accounts={accounts} />
          </div>
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Inbox",
                label: "", 
                icon: Inbox,
                variant: folder === 'inbox' ? "default" : "ghost",
                href: "/mails/inbox"
              },
              {
                title: "Drafts",
                label: "",
                icon: File,
                variant: folder === 'drafts' ? "default" : "ghost",
                href: "/mails/drafts"
              },
              {
                title: "Sent",
                label: "",
                icon: Send,
                variant: folder === 'sent' ? "default" : "ghost",
                href: "/mails/sent"
              },
              {
                title: "Junk",
                label: "",
                icon: ArchiveX,
                variant: folder === 'junk' ? "default" : "ghost",
                href: "/mails/junk"
              },
              {
                title: "Trash",
                label: "",
                icon: Trash2,
                variant: folder === 'trash' ? "default" : "ghost",
                href: "/mails/trash"
              },
              {
                title: "Archive",
                label: "",
                icon: Archive,
                variant: folder === 'archive' ? "default" : "ghost",
                href: "/mails/archive"
              },
            ]}
          />
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Compose",
                label: "",
                icon: PenBox,
                variant: folder === 'compose' ? "default" : "ghost",
                href: "/mails/compose"
              },
              {
                title: "Dashboard",
                label: "",
                icon: ArrowLeft,
                variant: folder !== 'compose' ? "default" : "ghost",
                href: "/dashboard"
              },
            ]}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        {children}
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}
