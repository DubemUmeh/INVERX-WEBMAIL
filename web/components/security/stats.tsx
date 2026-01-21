export default function SecurityStats() {
  return (
    <section className="w-full px-4 py-10 border-y border-border-light dark:border-border-dark bg-neutral-50/50 dark:bg-neutral-900/50">
      <div className="max-w-[960px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          <div className="flex flex-col gap-2 items-center text-center">
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Uptime Guarantee</span>
            <span className="text-3xl font-bold text-primary dark:text-white tracking-tight">99.99%</span>
          </div>
          <div className="flex flex-col gap-2 items-center text-center">
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Regions</span>
            <span className="text-3xl font-bold text-primary dark:text-white tracking-tight">US &amp; EU</span>
          </div>
          <div className="flex flex-col gap-2 items-center text-center">
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Encryption</span>
            <span className="text-3xl font-bold text-primary dark:text-white tracking-tight">AES-256</span>
          </div>
          <div className="flex flex-col gap-2 items-center text-center">
            <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Audits</span>
            <span className="text-3xl font-bold text-primary dark:text-white tracking-tight">Annual</span>
          </div>
      </div>
    </section>
  )
}