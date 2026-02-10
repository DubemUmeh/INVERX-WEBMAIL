import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function SecurityHero() {
  return (
    <section
      className="w-full px-4 pt-20 py-16 max-w-[960px] flex flex-col items-center text-center gap-8 relative overflow-hidden">
      {/* <!-- Background Decoration --> */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-linear-to-tr from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-full blur-[100px] -z-10">
      </div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 dark:bg-white/10 border border-primary/10 dark:border-white/20">
        <span className="material-symbols-outlined text-sm text-primary dark:text-white"><ShieldCheck /></span>
        <span className="text-xs font-semibold uppercase tracking-wider text-primary dark:text-white">Trust Center</span>
      </div>
      <h1 className="text-primary dark:text-white text-4xl md:text-6xl font-black leading-tight tracking-[-0.033em]">
        Security isn't a feature.<br className="hidden md:block" /> It's the foundation.
      </h1>
      <p className="text-neutral-600 dark:text-neutral-400 text-lg md:text-xl font-normal leading-relaxed max-w-[640px]">
        How Inverx protects your data. Fast, private, and distraction-free email built on a zero-knowledge architecture for modern teams.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
        <Link href='/privacy-policy' className="h-12 px-8 rounded bg-primary dark:bg-white text-white dark:text-primary text-base font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
          View Privacy Policy
        </Link>
        <button className="h-12 px-8 rounded border border-border-light dark:border-border-dark bg-transparent text-text-light dark:text-text-dark text-base font-bold flex items-center justify-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
          Request Security Whitepaper
        </button>
      </div>
    </section>
  )
}