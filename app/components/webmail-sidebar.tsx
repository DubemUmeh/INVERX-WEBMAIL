import React from "react";
import { Archive, FileText, Inbox, Mail, PenSquare, Plus, Send, Settings, Star, Trash2 } from "lucide-react";
import Link from "next/link";
interface SidebarProps {
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getLinkClass: (href: string) => string;
}

const SidebarContent: React.FC<SidebarProps> = ({ setIsMobileMenuOpen, getLinkClass }) => (
  <div className="flex flex-col h-full px-2">
    {/* Branding */}
    <Link href="/dashboard" className="flex items-center gap-3 px-2 py-2 border-b">
      <div className="bg-white/10 p-2 rounded-lg flex items-center justify-center">
        <Mail className="text-white w-6 h-6" />
      </div>
      <div>
        <h1 className="text-base font-bold tracking-tight leading-none text-white">Inverx</h1>
        <p className="text-[10px] text-white/50 font-medium">Pro Workspace</p>
      </div>
    </Link>
    <div className="flex flex-col gap-6 overflow-y-auto pr-1">
      {/* Primary Action */}
      <Link href="/mail/compose"
        onClick={() => setIsMobileMenuOpen(false)}
        className="flex items-center gap-3 py-3 px-2 mt-3 w-full bg-muted/80 text-webmail-primary hover:bg-muted transition-all font-bold rounded-lg shadow-sm group">
        <PenSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span>Compose</span>
      </Link>
      {/* Navigation Menu */}
      <nav className="flex flex-col gap-1 m-0">
        
        <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass("/mail/inbox")} href="/mail/inbox">
          <div className="flex items-center gap-3">
            <Inbox className="w-5 h-5" />
            <span className="text-sm">Inbox</span>
          </div>
          <span className="text-xs bg-white text-webmail-primary px-1.5 py-0.5 rounded font-bold min-w-[20px] text-center">12</span>
        </Link>
        <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass("/mail/starred")} href="/mail/starred">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5" />
            <span className="text-sm font-medium">Starred</span>
          </div>
        </Link>
        <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass("/mail/sent")} href="/mail/sent">
          <div className="flex items-center gap-3">
            <Send className="w-5 h-5" />
            <span className="text-sm font-medium">Sent</span>
          </div>
        </Link>
        <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass("/mail/drafts")} href="/mail/drafts">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5" />
            <span className="text-sm font-medium">Drafts</span>
          </div>
          <span className="text-xs text-white/40 font-medium">2</span>
        </Link>
        <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass("/mail/archive")} href="/mail/archive">
          <div className="flex items-center gap-3">
            <Archive className="w-5 h-5" />
            <span className="text-sm font-medium">Archive</span>
          </div>
        </Link>
        <Link onClick={() => setIsMobileMenuOpen(false)} className={getLinkClass("/mail/trash")} href="/mail/trash">
          <div className="flex items-center gap-3">
            <Trash2 className="w-5 h-5" />
            <span className="text-sm font-medium">Trash</span>
          </div>
        </Link>
      </nav>
      {/* Custom Labels */}
      <div className="mt-2">
        <div className="flex items-center justify-between px-3 mb-2 group cursor-pointer">
          <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Labels</h3>
          <Plus className="text-white/20 w-4 h-4 group-hover:text-white/60 transition-colors" />
        </div>
        <nav className="flex flex-col gap-0.5">
          <Link onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors group" href="#">
            <span className="w-2 h-2 rounded-full border-2 border-blue-400"></span>
            <span className="text-sm font-medium">Personal</span>
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors group" href="#">
            <span className="w-2 h-2 rounded-full border-2 border-purple-400"></span>
            <span className="text-sm font-medium">Work</span>
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-colors group" href="#">
            <span className="w-2 h-2 rounded-full border-2 border-green-400"></span>
            <span className="text-sm font-medium">Finance</span>
          </Link>
        </nav>
      </div>
    {/* Sidebar Footer */}
    <div className="mt-auto pt-4 border-t border-white/10">
      <Link onClick={() => setIsMobileMenuOpen(false)} href="/mail/settings" className="flex items-center gap-3 px-3 py-2 w-full text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
        <Settings className="w-5 h-5" />
        <span className="text-sm font-medium">Settings</span>
      </Link>
    </div>
    </div>
  </div>
);

export default SidebarContent;