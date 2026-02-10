import { cookies } from "next/headers"
import { constructMetadata } from "@/lib/seo"
import { Mail } from "../components/mail"
import { accounts } from "../data"

export const metadata = constructMetadata({
  title: "Drafts",
  description: "Continue working on your saved email drafts.",
})

export default async function MailDraftsPage() {

  const layout = (await cookies()).get("react-resizable-panels:layout:mail")
  const collapsed = (await cookies()).get("react-resizable-panels:collapsed")

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined

  return (
    <div className="flex flex-col h-screen no-scrollbar">
        <Mail
          accounts={accounts}
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={4}
          folder="drafts"
        />
    </div>
  )
}
