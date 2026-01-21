"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

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
          window.location.href = "http://localhost:2000/dashboard";
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
    <main className="flex flex-1 justify-center items-center p-4 sm:p-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* ... Left Side Content ... */}
        <div className="hidden lg:flex flex-col gap-8 pr-8">
            <div className="space-y-4">
            <h1 className="text-5xl font-black leading-tight tracking-tight text-primary dark:text-white">
                Email, but <br />
                <span className="text-neutral-400 dark:text-neutral-500">distraction-free.</span>
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed max-w-md">
                Join over 10,000 teams who have switched to a faster, more private way to communicate.
            </p>
            </div>
            {/* Testimonial */}
             <div
            className="flex flex-col gap-4 p-6 bg-surface-light dark:bg-surface-dark rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="flex text-primary dark:text-white gap-1">
              <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
              <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
              <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
              <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
              <span className="material-symbols-outlined text-yellow-500 text-sm">star</span>
            </div>
            <p className="text-base font-medium leading-relaxed">"Inverx completely changed how our design team
              communicates. It's calm, fast, and secure. I can't imagine going back."</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                <img alt="Portrait of a smiling woman in a business setting" className="w-full h-full object-cover"
                  data-alt="Portrait of Sarah Jenkins"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMTvBjejRz4mKncWgIv0JEt9I7YakZTWnwBAy-XUZo4OW9CO-0e7OpJkpLOyw3CjJFSPK5vpU1UPli2ktcOGsW9kj6zjcgCbUZQVpvJ8WzYDpUbn_WkaWhTsRaoTuQUMyEeun62tSnQAgGYDQsEIw1AL4OMBoWpAotgOLXun30EPolM2GdyD1g2rKTfEBI3AsG5OTTNexpjdaFWhd4QYiIcO1xgmHDJZbDxoY37LJphFxMXwUmetH9oTSZ1_2rfan-_Dzubca-jZs" />
              </div>
              <div>
                <p className="text-sm font-bold">Sarah Jenkins</p>
                <p className="text-xs text-neutral-500">Product Lead at Stripe</p>
              </div>
            </div>
          </div>
        </div>

        {/* <!-- Right Side: Signup Form --> */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div
            className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-8 sm:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary dark:text-white mb-2">Create your account</h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">Start your 14-day free trial. No credit card
                required.</p>
            </div>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {/* Google Signup */}
              <button
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                type="button">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"></path>
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"></path>
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"></path>
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"></path>
                </svg>
                <span className="text-sm font-bold text-primary dark:text-white">Sign up with Google</span>
              </button>
              
              <div className="relative flex py-2 items-center">
                <div className="grow border-t border-neutral-200 dark:border-neutral-700"></div>
                <span className="shrink-0 mx-4 text-neutral-400 text-xs font-medium uppercase">Or continue with
                  email</span>
                <div className="grow border-t border-neutral-200 dark:border-neutral-700"></div>
              </div>
              {/* <!-- Full Name --> */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-primary dark:text-white" htmlFor="full-name">Full Name</label>
                <input
                  className="form-input w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-primary dark:text-white placeholder-neutral-400 focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-white dark:focus:ring-white h-12 px-4 transition-shadow"
                  id="full-name" 
                  placeholder="Jane Doe" 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              {/* <!-- Work Email --> */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-primary dark:text-white" htmlFor="email">Work Email</label>
                <input
                  className="form-input w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-primary dark:text-white placeholder-neutral-400 focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-white dark:focus:ring-white h-12 px-4 transition-shadow"
                  id="email" 
                  placeholder="name@company.com" 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {/* <!-- Password --> */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-primary dark:text-white" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    className="form-input w-full rounded-lg border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-primary dark:text-white placeholder-neutral-400 focus:border-primary focus:ring-1 focus:ring-primary dark:focus:border-white dark:focus:ring-white h-12 pl-4 pr-12 transition-shadow"
                    id="password" 
                    placeholder="Create a strong password" 
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    className="absolute right-0 top-0 bottom-0 px-3 flex items-center text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                 {/* Password Strength Meter (Simplified for now) */}
                 <div className="flex gap-1 mt-1">
                  <div className={`h-1 flex-1 rounded-full ${formData.password.length > 0 ? 'bg-green-500' : 'bg-neutral-200 dark:bg-neutral-700'}`}></div>
                  <div className={`h-1 flex-1 rounded-full ${formData.password.length > 5 ? 'bg-green-500' : 'bg-neutral-200 dark:bg-neutral-700'}`}></div>
                  <div className={`h-1 flex-1 rounded-full ${formData.password.length > 8 ? 'bg-green-500' : 'bg-neutral-200 dark:bg-neutral-700'}`}></div>
                  <div className={`h-1 flex-1 rounded-full ${formData.password.length > 12 ? 'bg-green-500' : 'bg-neutral-200 dark:bg-neutral-700'}`}></div>
                </div>
              </div>
              
              {/* <!-- Terms Checkbox --> */}
              <label className="flex items-start gap-3 mt-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    className="form-checkbox h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary dark:bg-neutral-800 dark:border-neutral-600 dark:checked:bg-white dark:focus:ring-offset-neutral-900"
                    type="checkbox" 
                    required
                  />
                </div>
                <span
                  className="text-sm text-neutral-500 dark:text-neutral-400 leading-normal group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors">
                  I agree to the <Link
                    className="underline decoration-neutral-300 underline-offset-4 hover:text-primary dark:hover:text-white"
                    href="/terms">Terms of Service</Link> and <Link
                    className="underline decoration-neutral-300 underline-offset-4 hover:text-primary dark:hover:text-white"
                    href="/privacy-policy">Privacy Policy</Link>.
                </span>
              </label>
              {/* <!-- CTA Button --> */}
              <button
                disabled={loading}
                className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-lg bg-primary dark:bg-white text-white dark:text-primary hover:opacity-90 h-12 px-6 text-base font-bold tracking-wide transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                type="submit">
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>
          <p className="text-center pt-5 text-neutral-600">Already have an account? <Link href='/login' className="text-black font-semibold underline underline-offset-2">Log In</Link></p>
          <div className="text-center mt-8 lg:hidden">
            <p className="text-sm text-neutral-500">
              Trusted by teams at
              <span className="font-semibold text-neutral-700 dark:text-neutral-300 ml-1">Stripe, Linear, and Vercel</span>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
