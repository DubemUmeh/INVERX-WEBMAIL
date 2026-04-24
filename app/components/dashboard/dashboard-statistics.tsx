import Link from "next/link";
import { AlertTriangle, CheckCircle, Mail, ShoppingBag, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStatisticsProps {
  verifiedDomainsCount: number;
  totalDomains: number;
  addressCount: number;
  messagesSent: number;
  deliveryHealth: number;
  unverifiedDomain?: { name: string } | null;
}

const stats = [
  {
    label: "Verified domains",
    description: "Verified / total",
    icon: <ShieldCheck className="h-4 w-4 text-primary" />, 
  },
  {
    label: "Addresses",
    description: "Active addresses",
    icon: <Mail className="h-4 w-4 text-primary" />,
  },
  {
    label: "Messages sent",
    description: "This month",
    icon: <ShoppingBag className="h-4 w-4 text-primary" />,
  },
  {
    label: "Delivery health",
    description: "Current deliverability",
    icon: <CheckCircle className="h-4 w-4 text-primary" />,
  },
];

export function DashboardStatistics({
  verifiedDomainsCount,
  totalDomains,
  addressCount,
  messagesSent,
  deliveryHealth,
  unverifiedDomain,
}: DashboardStatisticsProps) {
  const values = [
    `${verifiedDomainsCount}/${totalDomains}`,
    `${addressCount}`,
    `${messagesSent}`,
    `${deliveryHealth}%`,
  ];

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-4">
        {stats.map((metric, index) => (
          <Card
            key={metric.label}
            className="rounded-3xl border border-[#dbdbdb] dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm"
          >
            <CardHeader className="px-0 pb-0">
              <div className="flex items-center justify-between gap-1">
                <CardTitle className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                  {metric.label}
                </CardTitle>
                <span className="rounded-2xl bg-primary/10 p-2 text-primary">{metric.icon}</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-4xl font-semibold text-primary dark:text-white">
                {values[index]}
              </p>
              <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="rounded-3xl border border-[#dbdbdb] dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
          <CardHeader className="px-0 pb-0">
            <CardTitle className="text-lg font-semibold text-primary dark:text-white">
              Delivery performance
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pt-3 space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Delivery score
                </p>
                <p className="text-4xl font-semibold text-primary dark:text-white">
                  {deliveryHealth}%
                </p>
              </div>
              <div className="rounded-3xl bg-primary/5 px-4 py-3 text-primary font-semibold">
                {deliveryHealth}%
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-3 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className="h-3 rounded-full bg-emerald-500"
                  style={{ width: `${deliveryHealth}%` }}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total domains</p>
                  <p className="text-base font-medium text-primary dark:text-white">
                    {totalDomains}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active addresses</p>
                  <p className="text-base font-medium text-primary dark:text-white">
                    {addressCount}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Verified ratio</p>
                  <p className="text-base font-medium text-primary dark:text-white">
                    {totalDomains > 0 ? Math.round((verifiedDomainsCount / totalDomains) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {unverifiedDomain ? (
          <Card className="rounded-3xl border border-primary/20 bg-primary/10 dark:bg-neutral-800 p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-3xl bg-primary text-white">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <p className="text-lg font-semibold text-primary dark:text-white">
                    Action required
                  </p>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                    Verify domain '{unverifiedDomain.name}' to keep delivery healthy.
                  </p>
                </div>
              </div>
              <Button asChild className="w-full md:w-auto px-6">
                <Link href={`/domains/${unverifiedDomain.name}`}>Verify now</Link>
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="rounded-3xl border border-[#dbdbdb] dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
            <CardHeader className="px-0 pb-0">
              <CardTitle className="text-lg font-semibold text-primary dark:text-white">
                Verified and healthy
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pt-5">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                All configured domains are verified and ready for reliable delivery.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
