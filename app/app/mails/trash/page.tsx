import { cookies } from "next/headers"
import { constructMetadata } from "@/lib/seo"

export const metadata = constructMetadata({
  title: "Trash",
  description: "View and manage your deleted emails.",
})

export default async function MailTrashPage() {

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
          folder="trash"
        />
    </div>
  )
}
