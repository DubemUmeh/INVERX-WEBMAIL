"use client"

import { useState } from "react"
import { Mail, ArrowRight, Check, Lock, Sparkles, User, Loader2 } from "lucide-react"
import { api } from "@/lib/api/client"

export default function WaitlistPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await api.post("/waitlist", { name, email })
      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center py-20 px-4 sm:p-6 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none opacity-40 dark:opacity-20 mix-blend-multiply dark:mix-blend-screen animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none opacity-40 dark:opacity-20 mix-blend-multiply dark:mix-blend-screen animate-pulse-slow delay-1000"></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.4] dark:opacity-[0.2]" 
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.15) 1px, transparent 0)", backgroundSize: "24px 24px" }}>
      </div>

      <section className="w-full max-w-md relative z-10 perspective-1000">
        
        {/* Main Card */}
        <div className="relative group rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-blue-900/10 dark:shadow-black/50 border border-white/20 dark:border-slate-800 p-8 transition-all hover:shadow-blue-500/5 duration-500">
          
          {/* Decorative Top Highlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-linear-to-r from-transparent via-slate-700 to-transparent opacity-50 blur-sm rounded-b-full"></div>

          {/* Success Message */}
          {isSuccess && (
            <div id="success-state" className=" absolute inset-0 z-20 rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6 ring-4 ring-green-50 dark:ring-green-900/10">
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">You're on the list!</h2>
              <p className="text-slate-500 dark:text-slate-400">Thanks for joining. We'll verify your details and be in touch shortly.</p>
              <button 
                onClick={() => setIsSuccess(false)}
                className="mt-6 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Join with another email
              </button>
            </div>
          )}

          <div className="flex flex-col items-center text-center space-y-6">
            
            {/* Logo / Icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-gray-500 blur-xl opacity-20 rounded-full"></div>
              <div className="relative w-16 h-16 rounded-2xl bg-linear-to-br from-gray-600 to-slate-600 flex items-center justify-center shadow-lg shadow-blue-500/30 rotate-3 transition-transform group-hover:rotate-0 duration-500">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Request Early Access
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                Experience the next generation of automation. <br className="hidden sm:block"/> Secure your spot in the exclusive beta.
              </p>
            </div>

            {/* Form */}
            <form className="w-full space-y-4 text-left" onSubmit={handleSubmit}>
              
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Name</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-transparent transition-all outline-none"
                    placeholder="Enter Your Name..."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 ml-1">Email</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within/input:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-transparent transition-all outline-none"
                    placeholder="name@email.com"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 font-medium ml-1 animate-in fade-in slide-in-from-top-1">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="group/btn relative w-full flex items-center justify-center gap-2 bg-linear-to-r from-slate-600 to-gray-600 hover:from-slate-500 hover:to-gray-500 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-gray-500/25 hover:shadow-gray-500/40 transform active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Join Waitlist</span>
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Trust */}
            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <Lock className="w-3 h-3" />
              <span>Secure encryption. No spam, ever.</span>
            </div>

          </div>
        </div>
      </section>

    </main>
  )
}
