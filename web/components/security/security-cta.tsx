import { ShieldClose } from "lucide-react"
import Link from "next/link"

export default function SecurityCTA() {
  return (
    <section className="w-full px-4 py-20 bg-primary text-white border-t border-border-dark">
      <div className="max-w-[960px] mx-auto text-center flex flex-col gap-8 items-center">
        <div className="size-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-4xl"><ShieldClose /></span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-[720px]">Ready to take back your privacy?</h2>
        <p className="text-lg text-white/70 max-w-[600px]">Join thousands of teams who trust Inverx for secure, distraction-free communication.</p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link href='/login' className="h-12 px-8 rounded bg-white text-primary text-base font-bold flex items-center justify-center hover:bg-neutral-200 transition-colors">
            Get Started
          </Link>
          <Link href='/report' className="h-12 px-8 rounded border border-white/20 bg-transparent text-white text-base font-bold flex items-center justify-center hover:bg-white/10 transition-colors">
            Read Transparency Report
          </Link>
        </div>
      </div>
    </section>
  )
}