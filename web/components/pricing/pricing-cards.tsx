import { Check } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface PricingProps {
  billing: string;
  setBilling: Dispatch<SetStateAction<string>>;
}

export default function PricingCards({ billing, setBilling }: PricingProps) {
  return (
    <section className="px-4 pt-10 pb-20">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* <!-- Individual Plan --> */}
          <div
            className="flex flex-col rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Individual</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Perfect for freelancers and solo pros.
              </p>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-black text-neutral-900 dark:text-white tracking-tight">${billing === 'monthly' ? '5' : billing === 'yearly' ? '48' : ''}</span>
              <span className="text-neutral-500 dark:text-neutral-400 font-medium">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
            </div>
            <button
              className="w-full h-11 rounded-lg border-2 border-primary dark:border-white text-primary dark:text-white font-bold text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors mb-8">
              Start Free Trial
            </button>
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="material-symbols-outlined text-primary dark:text-white text-xl"><Check /></span>
                5GB Encrypted Storage
              </div>
              <div className="flex gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="material-symbols-outlined text-primary dark:text-white text-xl"><Check /></span>
                1 Custom Domain
              </div>
              <div className="flex gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="material-symbols-outlined text-primary dark:text-white text-xl"><Check /></span>
                Standard Support
              </div>
              <div className="flex gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="material-symbols-outlined text-primary dark:text-white text-xl"><Check /></span>
                Calendar &amp; Contacts
              </div>
            </div>
          </div>
          {/* <!-- Team Plan --> */}
          <div
            className="relative flex flex-col rounded-xl border border-primary dark:border-neutral-700 bg-white dark:bg-neutral-900 p-8 shadow-xl">
            <div
              className="absolute -top-3 right-8 bg-primary dark:bg-white text-white dark:text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Most Popular
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Team</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Best for growing companies.</p>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-5xl font-black text-neutral-900 dark:text-white tracking-tight">${billing === 'monthly' ? '12' : billing === 'yearly' ? '115.2' : ''}</span>
              <span className="text-neutral-500 dark:text-neutral-400 font-medium">/{billing === 'monthly' ? 'mo' : 'yr'}</span>
            </div>
            <button
              className="w-full h-11 rounded-lg bg-primary dark:bg-white text-white dark:text-primary font-bold text-sm hover:opacity-90 transition-opacity mb-8">
              Get Started
            </button>
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="material-symbols-outlined text-primary dark:text-white text-xl"><Check /></span>
                50GB Storage per user
              </div>
              <div className="flex gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="material-symbols-outlined text-primary dark:text-white text-xl"><Check /></span>
                Unlimited Custom Domains
              </div>
              <div className="flex gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="material-symbols-outlined text-primary dark:text-white text-xl"><Check /></span>
                Priority 24/7 Support
              </div>
              <div className="flex gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="material-symbols-outlined text-primary dark:text-white text-xl"><Check /></span>
                Team Management Dashboard
              </div>
              <div className="flex gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                <span className="material-symbols-outlined text-primary dark:text-white text-xl"><Check /></span>
                Collaborative Inboxes
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}