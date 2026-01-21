import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function PricingCallout() {
  return (
    <section className="layout-container flex h-full grow flex-col bg-neutral-100 dark:bg-neutral-900/50">
      <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-20">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="bg-primary dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="p-10 flex-1 flex flex-col justify-center gap-6">
              <h2 className="text-white text-3xl font-bold">Simple pricing for teams</h2>
              <p className="text-white/80 text-lg">
                Stop paying for features you don't use. One simple plan that scales with your team.
              </p>
              <ul className="flex flex-col gap-3">
                <li className="flex items-center gap-3 text-white/90">
                  <span className="material-symbols-outlined text-green-400"><CheckCircle /></span>
                  <span>Unlimited Shared Inboxes</span>
                </li>
                <li className="flex items-center gap-3 text-white/90">
                  <span className="material-symbols-outlined text-green-400"><CheckCircle /></span>
                  <span>Advanced Admin Dashboard</span>
                </li>
                <li className="flex items-center gap-3 text-white/90">
                  <span className="material-symbols-outlined text-green-400"><CheckCircle /></span>
                  <span>Priority Support</span>
                </li>
                <li className="flex items-center gap-3 text-white/90">
                  <span className="material-symbols-outlined text-green-400"><CheckCircle /></span>
                  <span>30-Day Audit Log History</span>
                </li>
              </ul>
            </div>
            <div
              className="bg-neutral-800 dark:bg-neutral-900 p-10 md:w-[350px] flex flex-col items-center justify-center gap-6 text-center border-l border-white/10">
              <div>
                <span className="text-white text-5xl font-black">$12</span>
                <span className="text-white/60 text-lg">/team/mo</span>
              </div>
              <p className="text-white/60 text-sm">Billed annually. $15 billed monthly.</p>
              <button
                className="w-full bg-white text-primary h-12 rounded-lg font-bold hover:bg-neutral-100 transition-colors">
                Start Free Trial
              </button>
              <Link className="text-white/80 hover:text-white underline text-sm" href="/contact">Contact sales for enterprise</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}