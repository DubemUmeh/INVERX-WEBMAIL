import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  { label: "Send new message", href: "/mails/compose" },
  { label: "Add domain", href: "/domains" },
  { label: "Account settings", href: "/settings" },
  { label: "View activity", href: "/activity" },
  { label: "System status", href: "/status" },
];

export function DashboardQuickActions() {
  return (
    <Card className="rounded-3xl border border-[#dbdbdb] dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
      <CardHeader className="px-0 pb-0">
        <CardTitle className="text-lg font-semibold text-primary dark:text-white">
          Quick actions
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pt-5 space-y-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group flex items-center justify-between rounded-3xl border border-[#dbdbdb] dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-4 text-primary dark:text-white transition hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <span className="font-semibold">{action.label}</span>
            <ChevronRight className="text-neutral-400 transition-transform group-hover:translate-x-1" size={20} />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
