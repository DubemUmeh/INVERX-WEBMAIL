import { Zap, Globe, Server, Keyboard, ShieldCheck, EyeOff } from "lucide-react"

export default function FeatureGrid() {
  return (
    <section className="py-20 bg-foreground/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-primary dark:text-white mb-6">
              Engineered for focus
            </h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              Every interaction is optimized for speed and clarity. We stripped away the bloat to leave you with pure utility.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* <!-- Feature 1 --> */}
          <div className="group p-6 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary/50 dark:hover:border-white/50 transition-colors">
            <div className="size-12 rounded-lg bg-white dark:bg-neutral-800 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary dark:text-white">
                <Zap />
              </span>
            </div>
            <h3 className="text-lg font-bold mb-2">Blazing Fast</h3>
            <p className="text-neutral-600 dark:text-neutral-400">Zero interaction latency. Every click, scroll,
              and keypress happens instantly.
            </p>
          </div>
          {/* <!-- Feature 2 --> */}
          <div className="group p-6 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary/50 dark:hover:border-white/50 transition-colors">
            <div className="size-12 rounded-lg bg-white dark:bg-neutral-800 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary dark:text-white">
                  <Globe />
                </span>
            </div>
            <h3 className="text-lg font-bold mb-2">Custom Domains</h3>
            <p className="text-neutral-600 dark:text-neutral-400">Bring your own domain. Full support for
              DKIM, SPF, and DMARC verification.
            </p>
          </div>
          {/* <!-- Feature 3 --> */}
          <div className="group p-6 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary/50 dark:hover:border-white/50 transition-colors">
            <div className="size-12 rounded-lg bg-white dark:bg-neutral-800 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary dark:text-white">
                  <Server />
                </span>
            </div>
            <h3 className="text-lg font-bold mb-2">SMTP Support</h3>
            <p className="text-neutral-600 dark:text-neutral-400">Connect any email provider. Send and receive
              emails using your existing SMTP credentials.
            </p>
          </div>
          {/* <!-- Feature 4 --> */}
          <div className="group p-6 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary/50 dark:hover:border-white/50 transition-colors">
            <div className="size-12 rounded-lg bg-white dark:bg-neutral-800 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary dark:text-white">
                  <Keyboard />
                </span>
            </div>
            <h3 className="text-lg font-bold mb-2">Command Palette</h3>
            <p className="text-neutral-600 dark:text-neutral-400">Navigate your entire inbox without touching
              the mouse. Just hit <kbd className="font-mono bg-neutral-200 dark:bg-neutral-700 px-1 rounded text-xs">Cmd+K</kbd>.
            </p>
          </div>
          {/* <!-- Feature 5 --> */}
          <div className="group p-6 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary/50 dark:hover:border-white/50 transition-colors">
            <div className="size-12 rounded-lg bg-white dark:bg-neutral-800 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary dark:text-white">
                  <ShieldCheck />
                </span>
            </div>
            <h3 className="text-lg font-bold mb-2">Privacy Focused</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Secure by default. No ads, no data mining, just your email.
            </p>
          </div>
          {/* <!-- Feature 6 --> */}
          <div className="group p-6 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-primary/50 dark:hover:border-white/50 transition-colors">
            <div className="size-12 rounded-lg bg-white dark:bg-neutral-800 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary dark:text-white">
                <EyeOff />
              </span>
            </div>
            <h3 className="text-lg font-bold mb-2">Distraction Free</h3>
            <p className="text-neutral-600 dark:text-neutral-400">A calm interface designed to help you process
              messages, not keep you addicted.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}