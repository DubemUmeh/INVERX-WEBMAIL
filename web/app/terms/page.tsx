'use client';

import { 
  Info, 
  UserCog, 
  ScrollText, 
  Lock, 
  CreditCard, 
  Ban, 
  Gavel, 
  Download, 
  Printer, 
  ChevronDown, 
  CalendarDays 
} from "lucide-react";
import { useState, useEffect } from "react";

const items = [
  { title: 'Introduction', href: '#introduction', Icon: <Info /> },
  { title: 'Account Responsibilities', href: '#responsibilities', Icon: <UserCog /> },
  { title: 'Acceptable Use Policy', href: '#acceptable-use', Icon: <ScrollText /> },
  { title: 'Privacy & Data', href: '#privacy', Icon: <Lock /> },
  { title: 'Subscription & Billing', href: '#billing', Icon: <CreditCard /> },
  { title: 'Termination', href: '#termination', Icon: <Ban /> },
  { title: 'Limitation of Liability', href: '#liability', Icon: <Gavel /> },
]

export default function Page() {
  const [activeHash, setActiveHash] = useState('#introduction');

  useEffect(() => {
    const updateHash = () => setActiveHash(window.location.hash || '#introduction');
    updateHash();

    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, [])

  return (
    <main className="flex-1 flex justify-center py-12 px-4 md:px-10">
      <div className="flex flex-col lg:flex-row max-w-[1200px] w-full gap-12">
        {/* <!-- Sidebar Navigation (Sticky on Desktop) --> */}
        <aside className="hidden lg:block w-64 shrink-0 relative">
          <div className="sticky top-24 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-[#141414] dark:text-white text-sm font-bold uppercase tracking-wider mb-2">Contents</h3>
              <nav className="flex flex-col gap-1">
                {items.map((item) => (
                  <a 
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-primary dark:hover:text-white text-sm font-medium transition-colors ${item.href === activeHash ? 'bg-[#ededed]' : ''}`}
                    >
                    <span className="material-symbols-outlined text-[18px]">{item.Icon}</span>
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
            {/* <!-- Action Buttons in Sidebar --> */}
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg h-9 px-4 border border-[#ededed] dark:border-neutral-700 bg-white dark:bg-neutral-900 text-[#141414] dark:text-white text-sm font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                <span className="material-symbols-outlined text-[18px]"><Download /></span>
                <span>Download PDF</span>
              </button>
              <button
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg h-9 px-4 border border-[#ededed] dark:border-neutral-700 bg-white dark:bg-neutral-900 text-[#141414] dark:text-white text-sm font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                <span className="material-symbols-outlined text-[18px]"><Printer /></span>
                <span>Print</span>
              </button>
            </div>
          </div>
        </aside>
        {/* <!-- Content Area --> */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* <!-- Page Header --> */}
          <div className="flex flex-col gap-4 mb-10 pb-6 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-primary dark:text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
              Terms of Service</h1>
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-base font-normal">
              <span className="material-symbols-outlined text-[20px]"><CalendarDays /></span>
              <p>Last Updated: January 13, 2026</p>
            </div>
          </div>
          {/* <!-- Mobile Navigation (Visible only on small screens) --> */}
          <div className="lg:hidden mb-10">
            <details
              className="group bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg">
              <summary
                className="flex items-center justify-between p-4 cursor-pointer font-bold text-primary dark:text-white">
                <span>Jump to section...</span>
                <span className="material-symbols-outlined transition-transform group-open:rotate-180"><ChevronDown /></span>
              </summary>
              <div className="px-4 pb-4 flex flex-col gap-2 border-t border-gray-100 dark:border-neutral-800 pt-2">
                <a className="py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-white"
                  href="#introduction">1. Introduction</a>
                <a className="py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-white"
                  href="#responsibilities">2. Account Responsibilities</a>
                <a className="py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-white"
                  href="#acceptable-use">3. Acceptable Use Policy</a>
                <a className="py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-white"
                  href="#privacy">4. Privacy &amp; Data</a>
                <a className="py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-white"
                  href="#billing">5. Subscription &amp; Billing</a>
                <a className="py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-white"
                  href="#termination">6. Termination</a>
                <a className="py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-white"
                  href="#liability">7. Limitation of Liability</a>
                <div className="flex gap-2 pt-2 mt-2 border-t border-gray-100 dark:border-neutral-800">
                  <button
                    className="flex-1 py-2 text-xs font-bold text-primary dark:text-white bg-neutral-100 dark:bg-neutral-800 rounded">Download
                    PDF</button>
                </div>
              </div>
            </details>
          </div>
          {/* <!-- Legal Text Content --> */}
          <div
            className="prose prose-neutral dark:prose-invert max-w-none text-[#141414] dark:text-gray-300 leading-relaxed">
            {/* <!-- Section 1 --> */}
            <section className="mb-12 scroll-mt-32" id="introduction">
              <h2
                className="text-[#141414] dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em] mb-4 flex items-center gap-3">
                <span
                  className="flex items-center justify-center size-8 rounded-full bg-primary/10 dark:bg-white/10 text-primary dark:text-white text-sm">1</span>
                Introduction
              </h2>
              <p className="mb-4">
                Welcome to Inverx. By accessing or using our webmail services, applications, and website
                (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not
                agree to these Terms, do not use the Service.
              </p>
              <p>
                Inverx provides a distraction-free email platform designed for teams and individuals. We prioritize
                privacy, speed, and simplicity. These terms govern your relationship with Inverx and detail your
                rights and responsibilities.
              </p>
            </section>
            {/* <!-- Section 2 --> */}
            <section className="mb-12 scroll-mt-32" id="responsibilities">
              <h2
                className="text-[#141414] dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em] mb-4 flex items-center gap-3">
                <span
                  className="flex items-center justify-center size-8 rounded-full bg-primary/10 dark:bg-white/10 text-primary dark:text-white text-sm">2</span>
                Account Responsibilities
              </h2>
              <p className="mb-4">
                To use Inverx, you must create an account. You agree to provide accurate, current, and complete
                information during the registration process and to update such information to keep it accurate, current,
                and complete.
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4 marker:text-primary dark:marker:text-neutral-400">
                <li><strong>Security:</strong> You are responsible for safeguarding your password. You agree not to
                  disclose your password to any third party and to take sole responsibility for any activities or
                  actions under your account.</li>
                <li><strong>Age Requirement:</strong> You must be at least 13 years old to use the Service. By agreeing
                  to these Terms, you represent and warrant to us that you are at least 13 years of age.</li>
                <li><strong>Team Admins:</strong> If you are creating an account on behalf of a company or team, you
                  represent that you have the authority to bind that entity to these Terms.</li>
              </ul>
            </section>
            {/* <!-- Section 3 --> */}
            <section className="mb-12 scroll-mt-32" id="acceptable-use">
              <h2
                className="text-[#141414] dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em] mb-4 flex items-center gap-3">
                <span
                  className="flex items-center justify-center size-8 rounded-full bg-primary/10 dark:bg-white/10 text-primary dark:text-white text-sm">3</span>
                Acceptable Use Policy
              </h2>
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                <p className="text-red-800 dark:text-red-200 text-sm font-medium m-0">
                  <strong>Strict Prohibition:</strong> Inverx has a zero-tolerance policy for spam and malicious
                  activities. Violation of this policy will result in immediate termination.
                </p>
              </div>
              <p className="mb-4">
                You agree not to use the Service to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4 marker:text-primary dark:marker:text-neutral-400">
                <li>Send unsolicited bulk emails (spam), junk mail, or chain letters.</li>
                <li>Distribute malware, viruses, or any other harmful software.</li>
                <li>Harass, abuse, threaten, or incite violence against any individual or group.</li>
                <li>Impersonate any person or entity or falsely state your affiliation with a person or entity.</li>
                <li>Violate any applicable local, state, national, or international law.</li>
              </ul>
            </section>
            {/* <!-- Section 4 --> */}
            <section className="mb-12 scroll-mt-32" id="privacy">
              <h2
                className="text-[#141414] dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em] mb-4 flex items-center gap-3">
                <span
                  className="flex items-center justify-center size-8 rounded-full bg-primary/10 dark:bg-white/10 text-primary dark:text-white text-sm">4</span>
                Privacy &amp; Data
              </h2>
              <p className="mb-4">
                Your privacy is critical to us. Our Privacy Policy explains how we collect, use, and protect your
                personal information. By using the Service, you agree to the collection and use of information in
                accordance with our Privacy Policy.
              </p>
              <p>
                We do not sell your data to advertisers. We do not scan your emails for marketing purposes. Your data
                belongs to you.
              </p>
            </section>
            {/* <!-- Section 5 --> */}
            <section className="mb-12 scroll-mt-32" id="billing">
              <h2
                className="text-[#141414] dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em] mb-4 flex items-center gap-3">
                <span
                  className="flex items-center justify-center size-8 rounded-full bg-primary/10 dark:bg-white/10 text-primary dark:text-white text-sm">5</span>
                Subscription &amp; Billing
              </h2>
              <p className="mb-4">
                Certain aspects of the Service may be provided for a fee or other charge. If you elect to use paid
                aspects of the Service, you agree to the pricing and payment terms as we may update them from time to
                time.
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4 marker:text-primary dark:marker:text-neutral-400">
                <li><strong>Renewals:</strong> Subscriptions automatically renew unless canceled at least 24 hours
                  before the end of the current period.</li>
                <li><strong>Refunds:</strong> We offer a 14-day money-back guarantee for new subscriptions. After 14
                  days, refunds are at the sole discretion of Inverx.</li>
                <li><strong>Changes:</strong> We reserve the right to change our subscription plans or adjust pricing
                  for our service or any components thereof in any manner and at any time as we may determine in our
                  sole and absolute discretion.</li>
              </ul>
            </section>
            {/* <!-- Section 6 --> */}
            <section className="mb-12 scroll-mt-32" id="termination">
              <h2
                className="text-[#141414] dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em] mb-4 flex items-center gap-3">
                <span
                  className="flex items-center justify-center size-8 rounded-full bg-primary/10 dark:bg-white/10 text-primary dark:text-white text-sm">6</span>
                Termination
              </h2>
              <p className="mb-4">
                We may terminate or suspend your access to the Service immediately, without prior notice or liability,
                under our sole discretion, for any reason whatsoever and without limitation, including but not limited
                to a breach of the Terms.
              </p>
              <p>
                Upon termination, your right to use the Service will immediately cease. If you wish to terminate your
                account, you may simply discontinue using the Service or delete your account through the settings
                dashboard.
              </p>
            </section>
            {/* <!-- Section 7 --> */}
            <section className="mb-12 scroll-mt-32" id="liability">
              <h2
                className="text-[#141414] dark:text-white text-2xl font-bold leading-tight tracking-[-0.015em] mb-4 flex items-center gap-3">
                <span
                  className="flex items-center justify-center size-8 rounded-full bg-primary/10 dark:bg-white/10 text-primary dark:text-white text-sm">7</span>
                Limitation of Liability
              </h2>
              <p className="mb-4">
                In no event shall Inverx, nor its directors, employees, partners, agents, suppliers, or affiliates,
                be liable for any indirect, incidental, special, consequential or punitive damages, including without
                limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
              </p>
              <ol className="list-decimal pl-6 space-y-2 mb-4 marker:text-primary dark:marker:text-neutral-400 font-medium">
                <li>Your access to or use of or inability to access or use the Service;</li>
                <li>Any conduct or content of any third party on the Service;</li>
                <li>Any content obtained from the Service; and</li>
                <li>Unauthorized access, use or alteration of your transmissions or content.</li>
              </ol>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-8 italic">
                These terms constitute the entire agreement between us regarding our Service, and supersede and replace
                any prior agreements we might have had between us regarding the Service.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}