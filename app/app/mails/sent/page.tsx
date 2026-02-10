import { cookies } from "next/headers"
import { constructMetadata } from "@/lib/seo"
import { Mail } from "../components/mail"
import { accounts } from "../data"

export const metadata = constructMetadata({
  title: "Sent Messages",
  description: "Review your sent email history and delivery status.",
})

export default async function MailSentPage() {

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
        folder="sent"
      />
    </div>
  )
}
