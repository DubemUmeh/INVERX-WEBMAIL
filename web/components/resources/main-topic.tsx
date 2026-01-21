import Link from "next/link";
import { Flag, BookOpen, UserCog2, ArrowRight } from "lucide-react";

export default function MainTopic() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <h2 className="text-[#141414] dark:text-white text-2xl font-bold leading-tight">Explore Topics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* <!-- Card 1 --> */}
        <Link className="group flex flex-1 gap-4 rounded-xl border border-[#dbdbdb] dark:border-neutral-800 bg-white dark:bg-[#1e1e1e] p-6 flex-col hover:border-primary/50 hover:shadow-sm transition-all"
          href="#">
          <div
            className="size-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[#141414] dark:text-white group-hover:bg-primary group-hover:text-white transition-colors">
            <span className="material-symbols-outlined"><Flag /></span>
          </div>
          <div className="flex flex-col gap-2 justify-between h-full">
            <h3 className="text-[#141414] dark:text-white text-lg font-bold leading-tight">Getting Started</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm font-normal leading-relaxed">
              Setting up your profile, securing your account, and your first email.
            </p>
            <span
              className="text-primary dark:text-white text-sm font-bold mt-2 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Read Guides <span className="material-symbols-outlined text-[16px]"><ArrowRight /></span>
            </span>
          </div>
        </Link>
        {/* <!-- Card 2 --> */}
        <Link className="group flex flex-1 gap-4 rounded-xl border border-[#dbdbdb] dark:border-neutral-800 bg-white dark:bg-[#1e1e1e] p-6 flex-col hover:border-primary/50 hover:shadow-sm transition-all"
          href="#">
          <div
            className="size-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[#141414] dark:text-white group-hover:bg-primary group-hover:text-white transition-colors">
            <span className="material-symbols-outlined"><BookOpen /></span>
          </div>
          <div className="flex flex-col gap-2 justify-between h-full">
            <h3 className="text-[#141414] dark:text-white text-lg font-bold leading-tight">Knowledge Base</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm font-normal leading-relaxed">
              Deep dives into power features like Snooze, Aliases, and Keyboard Shortcuts.
            </p>
            <span
              className="text-primary dark:text-white text-sm font-bold mt-2 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Browse Articles <span className="material-symbols-outlined text-[16px]"><ArrowRight /></span>
            </span>
          </div>
        </Link>
        {/* <!-- Card 3 --> */}
        <Link className="group flex flex-1 gap-4 rounded-xl border border-[#dbdbdb] dark:border-neutral-800 bg-white dark:bg-[#1e1e1e] p-6 flex-col hover:border-primary/50 hover:shadow-sm transition-all"
          href="#">
          <div
            className="size-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[#141414] dark:text-white group-hover:bg-primary group-hover:text-white transition-colors">
            <span className="material-symbols-outlined"><UserCog2 /></span>
          </div>
          <div className="flex flex-col gap-2 justify-between h-full">
            <h3 className="text-[#141414] dark:text-white text-lg font-bold leading-tight">Account &amp; Billing</h3>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm font-normal leading-relaxed">
              Manage your subscription, update payment methods, and account security.
            </p>
            <span
              className="text-primary dark:text-white text-sm font-bold mt-2 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Manage Account <span className="material-symbols-outlined text-[16px]"><ArrowRight /></span>
            </span>
          </div>
        </Link>
      </div>
    </div>
  )
}