import { ChevronDown } from "lucide-react"

export default function PrcingFAQ() {
  return (
    <section
      className="py-20 bg-neutral-50 dark:bg-neutral-900/50 border-t border-neutral-200 dark:border-neutral-800 px-4">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-12 text-neutral-900 dark:text-white tracking-tight">Frequently
          Asked Questions</h2>
        <div className="space-y-4">
          {/* <!-- FAQ Item 1 --> */}
          <details
            className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg open:shadow-md transition-shadow">
            <summary className="flex items-center justify-between cursor-pointer p-5 list-none">
              <span className="font-bold text-neutral-900 dark:text-white">Can I cancel my subscription anytime?</span>
              <span
                className="material-symbols-outlined text-neutral-500 transition-transform group-open:rotate-180"><ChevronDown /></span>
            </summary>
            <div className="px-5 pb-5 pt-0 text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
              Absolutely. You can cancel your subscription at any time from your account settings. Your access will
              continue until the end of your current billing period.
            </div>
          </details>
          {/* <!-- FAQ Item 2 --> */}
          <details
            className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg open:shadow-md transition-shadow">
            <summary className="flex items-center justify-between cursor-pointer p-5 list-none">
              <span className="font-bold text-neutral-900 dark:text-white">Do you offer discounts for non-profits?</span>
              <span
                className="material-symbols-outlined text-neutral-500 transition-transform group-open:rotate-180"><ChevronDown /></span>
            </summary>
            <div className="px-5 pb-5 pt-0 text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
              Yes! We support organizations that do good. Contact our support team with proof of your non-profit
              status to receive a 30% lifetime discount.
            </div>
          </details>
          {/* <!-- FAQ Item 3 --> */}
          <details
            className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg open:shadow-md transition-shadow">
            <summary className="flex items-center justify-between cursor-pointer p-5 list-none">
              <span className="font-bold text-neutral-900 dark:text-white">How does migration work?</span>
              <span
                className="material-symbols-outlined text-neutral-500 transition-transform group-open:rotate-180"><ChevronDown /></span>
            </summary>
            <div className="px-5 pb-5 pt-0 text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
              We provide a simple import tool that connects to your old provider (Gmail, Outlook, Yahoo) via IMAP.
              We'll copy all your folders and messages over in the background.
            </div>
          </details>
          {/* <!-- FAQ Item 4 --> */}
          <details
            className="group bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg open:shadow-md transition-shadow">
            <summary className="flex items-center justify-between cursor-pointer p-5 list-none">
              <span className="font-bold text-neutral-900 dark:text-white">What payment methods do you accept?</span>
              <span
                className="material-symbols-outlined text-neutral-500 transition-transform group-open:rotate-180"><ChevronDown /></span>
            </summary>
            <div className="px-5 pb-5 pt-0 text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">
              We accept all major credit cards (Visa, Mastercard, Amex) as well as PayPal and Apple Pay. For
              enterprise teams, we can support invoicing.
            </div>
          </details>
        </div>
      </div>
    </section>
  )
}