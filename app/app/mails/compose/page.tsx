import { cookies } from "next/headers"
import { accounts } from "../data"
import { ComposeView } from "./compose-view"

export default async function ComposePage() {
  const layout = (await cookies()).get("react-resizable-panels:layout:mail-compose")
  const collapsed = (await cookies()).get("react-resizable-panels:collapsed")

  const defaultLayout = layout ? JSON.parse(layout.value) : [20, 80]
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined

  return (
    <div className="flex flex-col h-screen no-scrollbar">
      <ComposeView
        accounts={accounts}
        defaultLayout={defaultLayout}
        defaultCollapsed={defaultCollapsed}
        navCollapsedSize={4}
      />
    </div>
  )
}
