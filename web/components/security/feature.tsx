import { Lock, EyeOff, Globe, Key } from "lucide-react"

export default function SecurityFeature() {
  return (
    <section className="w-full px-4 py-20 max-w-[960px]">
      <div className="flex flex-col gap-4 mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-primary dark:text-white tracking-tight">The Zero-Knowledge Promise</h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-[400px] md:max-w-[720px]">
          We build trust through transparency and technical rigor. Here is how we ensure your communications remain private.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* <!-- Card 1 --> */}
        <div className="flex flex-col gap-4 p-6 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-neutral-900 hover:shadow-lg transition-shadow">
          <div className="size-12 rounded-full bg-primary/5 dark:bg-white/10 flex items-center justify-center text-primary dark:text-white">
            <span className="material-symbols-outlined text-2xl"><Lock /></span>
          </div>
          <h3 className="text-xl font-bold text-primary dark:text-white">End-to-End Encryption</h3>
          <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Your data is encrypted on your device before it ever reaches our servers. We do not hold the keys to decrypt your messages, meaning we physically cannot read your emails even if compelled to.
          </p>
        </div>
        {/* <!-- Card 2 --> */}
        <div className="flex flex-col gap-4 p-6 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-neutral-900 hover:shadow-lg transition-shadow">
          <div className="size-12 rounded-full bg-primary/5 dark:bg-white/10 flex items-center justify-center text-primary dark:text-white">
            <span className="material-symbols-outlined text-2xl"><EyeOff /></span>
          </div>
          <h3 className="text-xl font-bold text-primary dark:text-white">Zero Tracking Policy</h3>
          <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
            We are funded by your subscription, not by advertisers. There are zero pixels, zero trackers, and zero analytics scripts scanning your inbox content.
          </p>
        </div>
        {/* <!-- Card 3 --> */}
        <div className="flex flex-col gap-4 p-6 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-neutral-900 hover:shadow-lg transition-shadow">
          <div className="size-12 rounded-full bg-primary/5 dark:bg-white/10 flex items-center justify-center text-primary dark:text-white">
            <span className="material-symbols-outlined text-2xl"><Globe /></span>
          </div>
          <h3 className="text-xl font-bold text-primary dark:text-white">Data Residency Control</h3>
          <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Compliance requirements vary by region. Choose exactly where your data lives—our secure facilities in Virginia (US) or Frankfurt (EU)—to meet GDPR or CCPA needs.
          </p>
        </div>
        {/* <!-- Card 4 --> */}
        <div className="flex flex-col gap-4 p-6 rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-neutral-900 hover:shadow-lg transition-shadow">
          <div className="size-12 rounded-full bg-primary/5 dark:bg-white/10 flex items-center justify-center text-primary dark:text-white">
            <span className="material-symbols-outlined text-2xl"><Key /></span>
          </div>
          <h3 className="text-xl font-bold text-primary dark:text-white">Hardware 2FA Support</h3>
          <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
            SMS verification is vulnerable. Secure your account with industry-standard hardware keys (YubiKey, Titan) or TOTP authenticator apps.
          </p>
        </div>
      </div>
    </section>
  )
}