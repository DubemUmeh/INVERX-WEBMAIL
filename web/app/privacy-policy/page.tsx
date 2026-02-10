'use client'

import { 
  Database,
  CheckCircle,
  XCircle,
  Key,
  ChevronDown,
  Mail,
  HelpCircle,
  History,
  Gavel,
  Lock,
  Check,
  EarthLock,
  EyeOff,
  Send
} from "lucide-react";
import { useState, useEffect } from "react";

const items = [
  { title: 'Introduction', href: '#introduction' },
  { title: 'Data', href: '#data-collection' },
  { title: 'Security & Encryption', href: '#security' },
  { title: 'No Tracking Pledge', href: '#no-tracking' },
  { title: 'Data Retention', href: '#retention' },
  { title: 'User Rights', href: '#rights' },
  { title: 'Contact Us', href: '#contact' },
]

export default function Page() {
  const [activeHash, setActiveHash] = useState('#introduction');

  useEffect(() => {
    const updateHash = () => setActiveHash(window.location.hash || '#introduction');
    updateHash();

    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, [])

  // const isActive = items.some(i => pathname.includes(i.href));
  // console.log('This is active', isActive)

  return (
    <main>
      <section
        className="bg-white dark:bg-neutral-900 border-b border-[#ededed] dark:border-neutral-800 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-primary dark:text-white mb-4">Privacy Policy
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-lg">
              We believe privacy is a fundamental human right. Here’s how we protect yours.
            </p>
            <div
              className="mt-6 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-500 font-medium bg-neutral-100 dark:bg-neutral-800 w-fit px-3 py-1.5 rounded-full">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>Last Updated: January 13, 2026</span>
            </div>
          </div>
        </div>
      </section>
      {/* <!-- Main Content Area with Sticky Sidebar --> */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* <!-- Sticky Sidebar Navigation --> */}
          <aside className="w-full lg:w-64 shrink-0 hidden lg:block">
            <div className="sticky top-24">
              <nav className="flex flex-col gap-1">
                <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-4 px-3">On this page</h3>
                {items.map((item) => (
                  <a 
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg ${item.href === activeHash ? 'dark:bg-white/10 text-primary dark:text-white' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-primary dark:hover:text-white transition-all'}`}
                    >
                    <span className={`size-1.5 rounded-full bg-primary dark:bg-white ${item.href === activeHash ? 'block' : 'hidden hover:block'}`}></span>
                      {item.title}
                  </a>
                ))}
              </nav>
              <div className="mt-8 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
                <p className="text-sm font-semibold text-primary dark:text-white mb-2">Need a PDF version?</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">Download a copy for your records.</p>
                <button
                  className="w-full flex items-center justify-center gap-2 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500 text-primary dark:text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-sm">download</span>
                  Download PDF
                </button>
              </div>
            </div>
          </aside>
          {/* <!-- Main Content Text --> */}
          <article className="flex-1 max-w-3xl prose prose-neutral dark:prose-invert prose-lg">
            {/* <!-- Introduction --> */}
            <section className="mb-16 scroll-mt-28" id="introduction">
              <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
                At Inverx, we are building the email service we want to use ourselves: one that respects your time,
                your attention, and most importantly, your privacy. This policy outlines exactly what information we
                collect, how we secure it, and why we will never sell it.
              </p>
              <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-300 mt-4">
                By using our Services, you agree to the collection and use of information in accordance with this policy.
                We promise to keep it simple, transparent, and user-centric.
              </p>
            </section>
            {/* <!-- Divider --> */}
            <hr className="border-neutral-200 dark:border-neutral-800 mb-16" />
            {/* <!-- Data Collection --> */}
            <section className="mb-16 scroll-mt-28" id="data-collection">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined"><Database /></span>
                </div>
                <h2 className="text-2xl font-bold text-primary dark:text-white m-0">Information Collection</h2>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                We collect only the absolute minimum amount of data required to provide a functioning email service. We
                practice "data minimization" by design.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div
                  className="p-5 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800/50">
                  <h3 className="text-base font-bold text-primary dark:text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-500 text-sm"><CheckCircle /></span>
                    What we collect
                  </h3>
                  <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <li className="flex items-start gap-2"><span>•</span>Account credentials (hashed)</li>
                    <li className="flex items-start gap-2"><span>•</span>Billing information (via Stripe)</li>
                    <li className="flex items-start gap-2"><span>•</span>Essential service logs (retention: 7 days)</li>
                    <li className="flex items-start gap-2"><span>•</span>Support tickets you submit</li>
                  </ul>
                </div>
                <div
                  className="p-5 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800/50">
                  <h3 className="text-base font-bold text-primary dark:text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 text-sm"><XCircle /></span>
                    What we DO NOT collect
                  </h3>
                  <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <li className="flex items-start gap-2"><span>•</span>Content of your emails for ads</li>
                    <li className="flex items-start gap-2"><span>•</span>Third-party tracking cookies</li>
                    <li className="flex items-start gap-2"><span>•</span>Location data</li>
                    <li className="flex items-start gap-2"><span>•</span>Device fingerprinting data</li>
                  </ul>
                </div>
              </div>
            </section>
            {/* <!-- Security --> */}
            <section className="mb-16 scroll-mt-28" id="security">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <span className="material-symbols-outlined"><Lock /></span>
                </div>
                <h2 className="text-2xl font-bold text-primary dark:text-white m-0">Security &amp; Encryption</h2>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                Your data security is our top priority. We employ industry-standard security measures to ensure your
                communications remain private.
              </p>
              <ul className="list-none pl-0 space-y-4 text-neutral-600 dark:text-neutral-400">
                <li className="flex gap-3">
                  <span className="material-symbols-outlined text-neutral-400 mt-1"><Key /></span>
                  <div>
                    <strong className="text-primary dark:text-white block">Encryption at Rest</strong>
                    All emails stored on our servers are encrypted using AES-256 encryption. Even if our physical servers
                    were compromised, the data would remain unreadable.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="material-symbols-outlined text-neutral-400 mt-1"><EarthLock /></span>
                  <div>
                    <strong className="text-primary dark:text-white block">Encryption in Transit</strong>
                    All data transmitted between your device and our servers is protected using TLS 1.3 (Transport Layer
                    Security).
                  </div>
                </li>
              </ul>
            </section>
            {/* <!-- No Tracking Pledge --> */}
            <section className="mb-16 scroll-mt-28" id="no-tracking">
              <div
                className="bg-primary dark:bg-neutral-800 text-white dark:text-white rounded-2xl p-8 relative overflow-hidden group">
                {/* <!-- Abstract decoration --> */}
                <div
                  className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500">
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-3xl"><EyeOff /></span>
                    <h2 className="text-2xl font-bold m-0 text-white">Our No Tracking Pledge</h2>
                  </div>
                  <p className="text-neutral-300 mb-6 max-w-lg text-lg">
                    We do not sell your data. We do not show ads. We do not track your activity across the web.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                      <span className="material-symbols-outlined text-green-400 text-lg"><Check /></span>
                      <span>No Advertisement ID logging</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                      <span className="material-symbols-outlined text-green-400 text-lg"><Check /></span>
                      <span>No data mining of inbox</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                      <span className="material-symbols-outlined text-green-400 text-lg"><Check /></span>
                      <span>No selling to data brokers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                      <span className="material-symbols-outlined text-green-400 text-lg"><Check /></span>
                      <span>Respect for Do Not Track</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            {/* <!-- Data Retention --> */}
            <section className="mb-16 scroll-mt-28" id="retention">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                  <span className="material-symbols-outlined"><History /></span>
                </div>
                <h2 className="text-2xl font-bold text-primary dark:text-white m-0">Data Retention</h2>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                We retain your personal information only for as long as is necessary for the purposes set out in this
                Privacy Policy.
              </p>
              <div className="border-l-4 border-purple-500 pl-6 py-2 bg-purple-50/50 dark:bg-purple-900/10 rounded-r-lg">
                <p className="text-neutral-800 dark:text-neutral-200 font-medium">
                  If you delete your account, your data is permanently removed from our active databases immediately and
                  from our backups within 30 days. This process is irreversible.
                </p>
              </div>
            </section>
            {/* <!-- User Rights --> */}
            <section className="mb-16 scroll-mt-28" id="rights">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                  <span className="material-symbols-outlined"><Gavel /></span>
                </div>
                <h2 className="text-2xl font-bold text-primary dark:text-white m-0">Your User Rights</h2>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                Whether you are located in the EU, California, or anywhere else, we extend the same robust privacy rights
                to all our users globally.
              </p>
              <div className="space-y-4">
                <details
                  className="group bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden transition-all duration-300 open:shadow-md">
                  <summary
                    className="flex justify-between items-center p-4 cursor-pointer list-none text-primary dark:text-white font-semibold">
                    <span>Right to Access &amp; Portability</span>
                    <span
                      className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180"><ChevronDown /></span>
                  </summary>
                  <div
                    className="p-4 pt-0 text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed border-t border-transparent group-open:border-neutral-100 dark:group-open:border-neutral-700">
                    You have the right to request copies of your personal data. We provide an easy-to-use export tool
                    within your account settings to download all your emails and contacts in standard formats (MBOX, VCF).
                  </div>
                </details>
                <details
                  className="group bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden transition-all duration-300">
                  <summary
                    className="flex justify-between items-center p-4 cursor-pointer list-none text-primary dark:text-white font-semibold">
                    <span>Right to Rectification</span>
                    <span
                      className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180"><ChevronDown /></span>
                  </summary>
                  <div
                    className="p-4 pt-0 text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed border-t border-transparent group-open:border-neutral-100 dark:group-open:border-neutral-700">
                    You have the right to request that we correct any information you believe is inaccurate or complete
                    information you believe is incomplete. Most of this can be done directly via your Settings page.
                  </div>
                </details>
                <details
                  className="group bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden transition-all duration-300">
                  <summary
                    className="flex justify-between items-center p-4 cursor-pointer list-none text-primary dark:text-white font-semibold">
                    <span>Right to Erasure</span>
                    <span
                      className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180"><ChevronDown /></span>
                  </summary>
                  <div
                    className="p-4 pt-0 text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed border-t border-transparent group-open:border-neutral-100 dark:group-open:border-neutral-700">
                    You have the right to request that we erase your personal data, under certain conditions. As noted in
                    our retention policy, account deletion is available to all users at any time.
                  </div>
                </details>
              </div>
            </section>
            {/* <!-- Contact --> */}
            <section className="mb-12 scroll-mt-28" id="contact">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg text-neutral-600 dark:text-neutral-300">
                  <span className="material-symbols-outlined"><Mail /></span>
                </div>
                <h2 className="text-2xl font-bold text-primary dark:text-white m-0">Contact Us</h2>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                If you have any questions about this Privacy Policy, please contact our Data Protection Officer:
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a className="flex items-center justify-center gap-2 px-6 py-3 bg-primary dark:bg-white text-white dark:text-primary font-bold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                  href="mailto:privacy@inverx.pro">
                  <span className="material-symbols-outlined text-sm"><Send /></span>
                  privacy@inverx.pro
                </a>
                <a className="flex items-center justify-center gap-2 px-6 py-3 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-transparent text-primary dark:text-white font-bold rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  href="#">
                  <span className="material-symbols-outlined text-sm"><HelpCircle /></span>
                  Visit Help Center
                </a>
              </div>
            </section>
          </article>
        </div>
      </div>
    </main>
  )
}