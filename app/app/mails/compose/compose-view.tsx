"use client"

import { ResizablePanel } from "@/components/ui/resizable"
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"
import { MailLayout } from "../components/mail-layout"
import { ComposeForm } from "./compose-form"

interface ComposeViewProps {
  accounts: {
    label: string
    email: string
    icon: React.ReactNode
  }[]
  defaultLayout: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize: number
}

export function ComposeView({ 
  accounts, 
  defaultLayout = [20, 80], 
  defaultCollapsed, 
  navCollapsedSize 
}: ComposeViewProps) {
  const isMobile = useIsBreakpoint("max", 768)

  return (
    <MailLayout
      accounts={accounts}
      defaultLayout={defaultLayout}
      defaultCollapsed={defaultCollapsed}
      navCollapsedSize={navCollapsedSize}
      folder="compose"
      layoutCookieName="react-resizable-panels:layout:mail-compose"
      isMobile={isMobile}
    >
      {isMobile ? (
        <ComposeForm />
      ) : (
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <ComposeForm />
        </ResizablePanel>
      )}
    </MailLayout>
  )
}
