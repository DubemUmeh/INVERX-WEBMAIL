import { CheckCircle, Laptop, Server, Smartphone } from "lucide-react"

export default function SecurityDiagram() {
  return (
    <section className="w-full px-4 py-20 bg-neutral-50 dark:bg-neutral-900 border-y border-border-light dark:border-border-dark">
      <div className="max-w-[960px] mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 flex flex-col gap-6">
            <h2 className="text-3xl font-bold text-primary dark:text-white tracking-tight">Defense in Depth</h2>
            <ul className="flex flex-col gap-4">
              <li className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-primary dark:text-white mt-1"><CheckCircle /></span>
                <div>
                  <h4 className="font-bold text-primary dark:text-white">Transport Layer Security (TLS 1.3)</h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">All connections to our servers are encrypted in transit.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-primary dark:text-white mt-1"><CheckCircle /></span>
                <div>
                  <h4 className="font-bold text-primary dark:text-white">Encryption at Rest</h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Databases are encrypted on disk using AES-256.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-primary dark:text-white mt-1"><CheckCircle /></span>
                <div>
                  <h4 className="font-bold text-primary dark:text-white">Open Source Cryptography</h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">We use battle-tested,
                    open libraries (OpenPGP.js, Sodium) rather than proprietary "black box" code.
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div className="flex-1 w-full">
            <div className="aspect-square md:aspect-4/3 w-full rounded-xl bg-linear-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700 relative overflow-hidden flex items-center justify-center p-8 shadow-inner" data-alt="Abstract schematic diagram showing encrypted data packets moving between server icons">
              {/* <!-- Schematic Representation --> */}
              <div className="relative w-full h-full flex items-center justify-between">
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="size-16 bg-white dark:bg-black rounded-lg shadow-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl"><Laptop /></span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Sender</span>
                </div>
                <div className="h-[2px] flex-1 bg-neutral-400/30 mx-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary dark:bg-white w-1/3 animate-[pulse_2s_infinite]"></div>
                </div>
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="size-20 bg-primary dark:bg-white rounded-lg shadow-xl flex items-center justify-center text-white dark:text-primary relative">
                    <span className="material-symbols-outlined text-4xl"><Server /></span>
                    <div className="absolute -top-2 -right-2 bg-green-500 size-4 rounded-full border-2 border-white dark:border-black"></div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Encrypted Cloud</span>
                </div>
                <div className="h-[2px] flex-1 bg-neutral-400/30 mx-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary dark:bg-white w-1/3 animate-[pulse_2s_infinite] delay-75"></div>
                </div>
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="size-16 bg-white dark:bg-black rounded-lg shadow-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl"><Smartphone /></span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Receiver</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}