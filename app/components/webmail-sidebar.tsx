import React from "react";
import { Archive, FileText, Inbox, Mail, PenSquare, Plus, Send, Settings, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

interface SidebarProps {
  setIsMobileMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  getLinkClass: (href: string) => string;
  isCollapsed?: boolean;
}

const SidebarContent: React.FC<SidebarProps> = ({ setIsMobileMenuOpen, getLinkClass, isCollapsed = false }) => {
  const handleLinkClick = () => {
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const NavLink = ({ href, icon: Icon, title, label, variant = "ghost", countColor }: { href: string, icon: any, title: string, label?: string, variant?: "default" | "ghost", countColor?: string }) => {
    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              href={href}
              className={cn(
                buttonVariants({ variant: variant, size: "icon" }),
                "h-9 w-9",
                variant === "default" &&
                  "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="sr-only">{title}</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            {title}
            {label && (
              <span className="ml-auto text-muted-foreground">
                {label}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link onClick={handleLinkClick} className={getLinkClass(href)} href={href}>
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        {label && (
          <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded min-w-[20px] text-center", countColor ? countColor : "text-white/40")}>
              {label}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col h-full data-[collapsed=true]:py-2"
    >
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center gap-3 px-2 py-2 border-b border-white/10 mb-2">
            <div className="bg-white/10 p-2 rounded-lg flex items-center justify-center">
              <Mail className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight leading-none text-white">Inverx</h1>
              <p className="text-[10px] text-white/50 font-medium">Pro Workspace</p>
            </div>
        </Link>
        )}
        
      <div className={cn("flex flex-col gap-2", isCollapsed ? "items-center" : "pr-1 overflow-y-auto")}>
        {isCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
                <Link href="/mails/compose" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90")}>
                    <PenSquare className="h-4 w-4" />
                    <span className="sr-only">Compose</span>
                </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Compose</TooltipContent>
          </Tooltip>
        ) : (
        <Link href="/mails/compose"
            onClick={handleLinkClick}
            className="flex items-center gap-3 py-3 px-2 mt-1 w-full bg-muted/80 text-webmail-primary hover:bg-muted transition-all font-bold rounded-lg shadow-sm group mb-4">
            <PenSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Compose</span>
          </Link>
        )}


        <nav className={cn("flex flex-col gap-1", isCollapsed ? "items-center justify-center" : "")}>
          <NavLink href="/mails/inbox" icon={Inbox} title="Inbox" label="12" countColor="bg-white text-webmail-primary" />
          <NavLink href="/mails/starred" icon={Star} title="Starred" />
          <NavLink href="/mails/sent" icon={Send} title="Sent" />
          <NavLink href="/mails/drafts" icon={FileText} title="Drafts" label="2" />
          <NavLink href="/mails/archive" icon={Archive} title="Archive" />
          <NavLink href="/mails/trash" icon={Trash2} title="Trash" />
        </nav>

        {!isCollapsed && (
          <div className="mt-4">
            <div className="flex items-center justify-between px-3 mb-2 group cursor-pointer">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Labels</h3>
            <Plus className="text-white/20 w-4 h-4 group-hover:text-white/60 transition-colors" />
          </div>
          <nav className="flex flex-col gap-0.5">
            <Link onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors group" href="#">
              <span className="w-2 h-2 rounded-full border-2 border-blue-400"></span>
              <span className="text-sm font-medium">Personal</span>
            </Link>
            <Link onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors group" href="#">
              <span className="w-2 h-2 rounded-full border-2 border-purple-400"></span>
              <span className="text-sm font-medium">Work</span>
            </Link>
            <Link onClick={handleLinkClick} className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors group" href="#">
              <span className="w-2 h-2 rounded-full border-2 border-green-400"></span>
              <span className="text-sm font-medium">Finance</span>
            </Link>
          </nav>
        </div>
        )}
        
        <div className={cn("mt-auto pt-4", isCollapsed ? "" : "border-t border-white/10")}>
            {isCollapsed ? (
              <NavLink href="/mails/settings" icon={Settings} title="Settings" />
            ) : (
              <Link onClick={handleLinkClick} href="/mails/settings" className="flex items-center gap-3 px-3 py-2 w-full text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                  <Settings className="w-5 h-5" />
                  <span className="text-sm font-medium">Settings</span>
              </Link>
            )}
        </div>
      </div>
    </div>
  );
};

export default SidebarContent;
