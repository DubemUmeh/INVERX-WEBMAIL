"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    toast.promise(
      signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      }),
      {
        loading: "Creating account...",
        success: (data) => {
          if (data.error) {
            if (data.error.status >= 500) {
              throw new Error("Server error, try again");
            }
            throw new Error(data.error.message);
          }
          window.location.replace(`${process.env.NEXT_PUBLIC_APP_ORIGIN}/dashboard`);
          return "Account created! Redirecting...";
        },
        error: (err) => {
          setLoading(false);
          return err.message;
        },
      }
    );
  };

  return (
    <main className="flex min-h-screen w-full bg-neutral-950 text-white pt-20">
      {/* Left Side (Visual) */}
      <div className="hidden lg:flex relative w-1/2 flex-col justify-between overflow-hidden bg-neutral-900 border-r border-neutral-800 p-12">
        {/* Background Gradients */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-blue-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[100px]"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
              {/* Logo Placeholder - You might want to replace this with your actual logo component */}
              <div className="h-8 w-8 rounded-lg bg-linear-to-br from-white to-neutral-400"></div>
              <span className="text-xl font-bold tracking-tight">Inverx</span>
          </div>

          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight mb-6">
            Sync, managed <br /> 
            <span className="text-transparent bg-clip-text bg-linear-to-r from-neutral-200 to-neutral-500">
             and delivered.
            </span>
          </h1>
          <p className="text-lg text-neutral-400 max-w-md leading-relaxed">
             Join thousands of developers building the future of email infrastructure with Inverx.
          </p>
        </div>

        {/* Feature List / Testimonial */}
        <div className="relative z-10 mt-auto">
           <div className="space-y-4 mb-12">
             {['99.99% Uptime SLA', 'Global Edge Network', 'Real-time Analytics'].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                        <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="text-neutral-300 font-medium">{feature}</span>
                </div>
             ))}
           </div>

           <div className="rounded-2xl border border-neutral-800 bg-neutral-950/50 p-6 backdrop-blur-sm">
             <p className="text-neutral-300 leading-relaxed mb-4">
               "Inverx has completely transformed how we handle transactional emails. The API is a joy to work with."
             </p>
             <div className="flex items-center gap-3">
               <div className="h-10 w-10 rounded-full bg-neutral-800 border border-neutral-700"></div>
               <div>
                  <div className="font-semibold text-sm">Alex Chen</div>
                  <div className="text-xs text-neutral-500">CTO at TechFlow</div>
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Right Side (Form) */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 bg-neutral-950 relative overflow-hidden">
        {/* Subtle grid pattern for the form side too */}
        <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px]"></div>

        <div className="relative z-10 w-full max-w-[420px] animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Create an account</h2>
            <p className="text-neutral-400 text-sm">
              Start building in seconds. No credit card required.
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
             {/* Social Login */}
             <button
                className="flex items-center justify-center gap-2 h-11 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 transition-all hover:border-neutral-700 text-white font-medium text-sm"
                type="button">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#FFFFFF"
                  ></path>
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  ></path>
                </svg>
                Sign up with Google
              </button>

              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-neutral-800"></div>
                <span className="shrink-0 mx-4 text-[10px] font-medium text-neutral-500 uppercase tracking-widest">Or with email</span>
                <div className="grow border-t border-neutral-800"></div>
              </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 uppercase tracking-wider" htmlFor="full-name">Full Name</label>
              <input
                className="flex w-full rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-sm text-white placeholder-neutral-500 shadow-sm transition-colors focus:border-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-600 hover:border-neutral-700"
                id="full-name" 
                placeholder="Jane Doe" 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 uppercase tracking-wider" htmlFor="email">Work Email</label>
              <input
                className="flex w-full rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-sm text-white placeholder-neutral-500 shadow-sm transition-colors focus:border-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-600 hover:border-neutral-700"
                id="email" 
                placeholder="name@company.com" 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 uppercase tracking-wider" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  className="flex w-full rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-sm text-white placeholder-neutral-500 shadow-sm transition-colors focus:border-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-600 hover:border-neutral-700 pr-10"
                  id="password" 
                  placeholder="Create a strong password" 
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 focus:outline-none transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
               {/* Strength Meter (Visual only for now) */}
               <div className="flex gap-1 mt-2 h-0.5">
                  <div className={`flex-1 rounded-full ${formData.password.length > 0 ? 'bg-white' : 'bg-neutral-800'}`}></div>
                  <div className={`flex-1 rounded-full ${formData.password.length > 6 ? 'bg-white' : 'bg-neutral-800'}`}></div>
                  <div className={`flex-1 rounded-full ${formData.password.length > 8 ? 'bg-white' : 'bg-neutral-800'}`}></div>
                  <div className={`flex-1 rounded-full ${formData.password.length > 10 ? 'bg-white' : 'bg-neutral-800'}`}></div>
               </div>
            </div>

            <div className="pt-2">
                <button
                disabled={loading}
                className="group relative w-full flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-white px-4 py-3 text-sm font-bold text-neutral-950 shadow-[0_1px_15px_rgba(255,255,255,0.1)] transition-all hover:bg-neutral-200 hover:shadow-[0_1px_20px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit">
                {loading && <Loader2 className="animate-spin" size={16} />}
                {loading ? "Creating Account..." : "Create Account"}
                </button>
            </div>
            
            <p className="text-center text-xs text-neutral-500 mt-2">
              By clicking "Create Account", you agree to our <Link href="/terms" className="underline hover:text-neutral-300">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-neutral-300">Privacy Policy</Link>.
            </p>
          </form>

          <div className="mt-8 text-center">
             <p className="text-sm text-neutral-500">
               Already have an account? <Link href="/login" className="text-white font-medium hover:underline underline-offset-4">Log in</Link>
             </p>
          </div>
        </div>
      </div>
    </main>
  );
}
