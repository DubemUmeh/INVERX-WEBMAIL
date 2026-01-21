import { LockKeyhole, EyeOff, Shield } from "lucide-react"

export default function SecurityGurantee() {
  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* <!-- Item 1 --> */}
          <div className="flex flex-col items-center text-center p-6 border rounded-2xl shadow-sm hover:shadow-md">
            <div
              className="size-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4 text-primary dark:text-white">
              <span className="material-symbols-outlined text-[28px]"><LockKeyhole /></span>
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">End-to-End Encryption</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs">
              Your emails are encrypted before they leave your device. Only you hold the keys.
            </p>
          </div>
          {/* <!-- Item 2 --> */}
          <div className="flex flex-col items-center text-center p-6 border rounded-2xl shadow-sm hover:shadow-md">
            <div
              className="size-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4 text-primary dark:text-white">
              <span className="material-symbols-outlined text-[28px]"><EyeOff /></span>
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Zero Tracking</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs">
              We don't scan your data for ads. We don't sell your profile. You are the customer, not the product.
            </p>
          </div>
          {/* <!-- Item 3 --> */}
          <div className="flex flex-col items-center text-center p-6 border rounded-2xl shadow-sm hover:shadow-md">
            <div
              className="size-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4 text-primary dark:text-white">
              <span className="material-symbols-outlined text-[28px]"><Shield /></span>
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">GDPR Compliant</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs">
              Fully compliant with EU privacy laws. Your data is stored on secure servers in Switzerland.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}