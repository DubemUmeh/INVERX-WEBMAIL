"use client"

import * as React from "react"
import {
  AlertCircle,
  Archive,
  ArchiveX,
  File,
  Inbox,
  MessagesSquare,
  Search,
  Send,
  ShoppingCart,
  Trash2,
  Users2,
  Loader2,
  PenBox
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { MailDisplay } from "./mail-display"
import { MailList } from "./mail-list"
import { MailLayout } from "./mail-layout"
import { useMail } from "../use-mail"
import { mailApi } from "@/lib/api"
import { Message } from "@/types"
import { toast } from "sonner"
import { useRouter, usePathname } from "next/navigation"
import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"

interface MailProps {
  accounts: {
    label: string
    email: string
    icon: React.ReactNode
  }[]
  defaultLayout: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize: number
  folder?: 'inbox' | 'sent' | 'drafts' | 'junk' | 'trash' | 'archive'
}

export function Mail({
  accounts,
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize,
  folder = 'inbox'
}: MailProps) {
  const [mail, setMail] = useMail()
  const [messages, setMessages] = React.useState<Message[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const pathname = usePathname()

  React.useEffect(() => {
    async function loadMessages() {
        setIsLoading(true);
        try {
            let response;
            switch (folder) {
                case 'inbox':
                    response = await mailApi.getInbox();
                    console.log('inbox messsage response: ', response);
                    break;
                case 'sent':
                    response = await mailApi.getSent();
                    break;
                case 'drafts':
                    response = await mailApi.getDrafts();
                    console.log('draft messsage response: ', response);
                    break;
                case 'junk':
                    response = await mailApi.getSpam();
                    console.log('junk messsage response: ', response);
                    break;
                case 'trash':
                    response = await mailApi.getInbox({ folder: 'trash' }); 
                    console.log('trash messsage response: ', response);
                    break;
                case 'archive':
                    response = await mailApi.getArchive();
                    console.log('archive messsage response: ', response);
                    break;
                default:
                    response = await mailApi.getMessages();
                    console.log('messsage response: ', response);
            }
            
            const data = Array.isArray(response) ? response : (response?.data || []);
            setMessages(Array.isArray(data) ? data : []);
            console.log('mail data: ', data)
            
            // Clear selection when folder changes
            setMail({ ...mail, selected: null });

        } catch (error) {
            console.error("Failed to load messages", error);
            toast.error("Failed to load messages");
        } finally {
            setIsLoading(false);
        }
    }
    loadMessages();
  }, [folder]); 

  const selectedMessage = messages.find((item) => item.id === mail.selected) || null;
  const isMobile = useIsBreakpoint("max", 768);

  return (
    <MailLayout
      accounts={accounts}
      defaultLayout={defaultLayout}
      defaultCollapsed={defaultCollapsed}
      navCollapsedSize={navCollapsedSize}
      folder={folder}
      isMobile={isMobile}
    >
      {isMobile ? (
         !selectedMessage ? (
            <Tabs defaultValue="all">
              <div className="flex items-center px-4 py-2">
                <h1 className="text-xl font-bold capitalize">{folder}</h1>
                <TabsList className="ml-auto">
                  <TabsTrigger
                    value="all"
                    className="text-zinc-600 dark:text-zinc-200"
                  >
                    All mail
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="text-zinc-600 dark:text-zinc-200"
                  >
                    Unread
                  </TabsTrigger>
                </TabsList>
              </div>
              <Separator />
              <div className="bg-background/95 p-4 backdrop-blur supports-backdrop-filter:bg-background/60">
                <form>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search" className="pl-8" />
                  </div>
                </form>
              </div>
              {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
              ) : (
                  <>
                      <TabsContent value="all" className="m-0">
                      <MailList items={messages} />
                      </TabsContent>
                      <TabsContent value="unread" className="m-0">
                      <MailList items={messages.filter((item) => !item.isRead)} />
                      </TabsContent>
                  </>
              )}
            </Tabs>
         ) : (
            <MailDisplay mail={selectedMessage} />
         )
      ) : (
        <>
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold capitalize">{folder}</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="all"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  All mail
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Unread
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-backdrop-filter:bg-background/60">
              <form>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search" className="pl-8" />
                </div>
              </form>
            </div>
            {isLoading ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                    <TabsContent value="all" className="m-0">
                    <MailList items={messages} />
                    </TabsContent>
                    <TabsContent value="unread" className="m-0">
                    <MailList items={messages.filter((item) => !item.isRead)} />
                    </TabsContent>
                </>
            )}
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          <MailDisplay
            mail={selectedMessage}
          />
        </ResizablePanel>
        </>
      )}
    </MailLayout>
  )
}
