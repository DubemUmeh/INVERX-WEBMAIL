import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-14 border-t border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-[#141414]">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-primary dark:text-white mb-6">
          Ready to reclaim your inbox?
        </h2>
        <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-10">
            Join the waitlist to get early access to Inverx. Secure your spot today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/waitlists">
          <button className="h-14 px-8 rounded-lg bg-primary dark:bg-white text-white dark:text-primary text-lg font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
            Join Waitlist
          </button>
          </Link>
        </div>
      </div>
  </section>
  )
}