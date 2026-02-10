import Link from "next/link";
import { 
  LayoutDashboard, 
  Mail, 
  Settings, 
  Activity, 
  Globe, 
  Server, 
  Shield, 
  User, 
  CreditCard, 
  Bell, 
  FileText, 
  Home,
  Inbox,
  Send,
  FileEdit,
  Trash2,
  Archive,
  AlertOctagon,
  LogOut,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const routes = [
    {
      category: "Main",
      links: [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Overview & Analytics" },
        { href: "/mails", label: "Mails", icon: Mail, desc: "Your Inbox" },
        { href: "/domains", label: "Domains", icon: Globe, desc: "Manage Domains" },
        { href: "/activity", label: "Activity", icon: Activity, desc: "System Logs" },
      ]
    },
    {
      category: "Mails",
      links: [
        { href: "/mails/compose", label: "Compose", icon: FileEdit, desc: "Write New Email" },
        { href: "/mails/inbox", label: "Inbox", icon: Inbox, desc: "Incoming Messages" },
        { href: "/mails/sent", label: "Sent", icon: Send, desc: "Sent Messages" },
        { href: "/mails/drafts", label: "Drafts", icon: FileText, desc: "Saved Drafts" },
      ]
    },
    {
      category: "Settings",
      links: [
        { href: "/settings/profile", label: "Profile", icon: User, desc: "Account Details" },
        { href: "/settings/security", label: "Security", icon: Shield, desc: "Password & 2FA" },
        { href: "/settings/billing", label: "Billing", icon: CreditCard, desc: "Plans & Invoices" },
        { href: "/settings/notifications", label: "Notifications", icon: Bell, desc: "Alert Preferences" },
      ]
    },
    {
      category: "System",
      links: [
        { href: "/status", label: "Status", icon: Server, desc: "System Health" },
        { href: "/smtp", label: "Config", icon: Settings, desc: "Global Settings" },
        { href: "/access-control", label: "Access", icon: Shield, desc: "Permissions" },
        { href: "/", label: "Home", icon: Home, desc: "Landing Page" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 md:p-12">
      <div className="w-full max-w-5xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-4">
            <AlertOctagon className="w-12 h-12 text-red-500 dark:text-red-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            404 - Page Not Found
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Oops! The page you're looking for doesn't exist. likely moved or deleted.
            Here are some quick links to get you back on track.
          </p>
          <div className="flex justify-center pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 text-base h-12 px-8">
                <ArrowLeft className="w-4 h-4" />
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {routes.map((group) => (
            <div key={group.category} className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">
                {group.category}
              </h3>
              <div className="grid gap-2">
                {group.links.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className="group flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-all duration-200"
                  >
                    <div className="p-2 rounded-md bg-muted group-hover:bg-background group-hover:shadow-sm transition-colors">
                      <link.icon className="w-5 h-5 text-foreground/70 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {link.label}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {link.desc}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
