import { redirect } from "next/navigation"

export default function MailPage() {
  redirect("/mails/sent")
}
