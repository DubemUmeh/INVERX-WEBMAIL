import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";

interface DashboardActivityPanelProps {
  logs: any[];
}

export function DashboardActivityPanel({ logs }: DashboardActivityPanelProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Card className="rounded-3xl border border-[#dbdbdb] dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
        <CardHeader className="px-0 pb-0">
          <CardTitle className="text-lg font-semibold text-primary dark:text-white">
            Recent activity
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pt-5">
          <ActivityFeed logs={logs} />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <DashboardQuickActions />

        <Card className="rounded-3xl border border-dashed border-[#dbdbdb] dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-6 shadow-sm">
          <CardHeader className="px-0 pb-0">
            <CardTitle className="text-lg font-semibold text-primary dark:text-white">
              Need help?
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-5">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
              Need help setting up DKIM, DNS, or inbox routing?
            </p>
            <Link
              href="https://docs.inverx.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary dark:text-white text-sm font-bold underline decoration-neutral-300 underline-offset-4 hover:decoration-primary transition-all"
            >
              Read documentation
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
