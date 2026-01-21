import { BadgeCheck, CheckCircle, ShieldCheck } from "lucide-react"

export default function ComplianceBadges() {
  return (
    <section className="w-full px-4 py-16 max-w-[960px] flex flex-col items-center gap-8">
      <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Compliant with Global Standards</h3>
      <div
        className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale-0 hover:grayscale transition-all duration-500">
        <div className="flex items-center gap-2 px-4 py-2 border-2 border-current rounded font-bold text-xl">SOC 2
          <span className="text-xs font-normal bg-green-200 border p-1 rounded-xl"><BadgeCheck /></span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 border-2 border-current rounded font-bold text-xl">GDPR
          <span className="text-xs font-normal bg-green-200 border p-1 rounded-xl"><CheckCircle /></span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 border-2 border-current rounded font-bold text-xl">HIPAA
          <span className="text-xs font-normal bg-green-200 border p-1 rounded-xl"><ShieldCheck /></span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 border-2 border-current rounded font-bold text-xl">CCPA
        </div>
      </div>
    </section>
  )
}