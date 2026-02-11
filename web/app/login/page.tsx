"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    toast.promise(
      signIn.email({
        email: formData.email,
        password: formData.password,
      }),
      {
        loading: "Signing in...",
        success: (data) => {
          if (data.error) {
            if (data.error.status >= 500) {
              throw new Error("Server error, try again");
            }
            throw new Error(data.error.message);
          }
          window.location.href = "https://app.inverx.pro/dashboard";
          return "Login successful!";
        },
        error: (err) => {
          setLoading(false);
          return err.message;
        },
      }
    );
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-neutral-950 pt-20 px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-neutral-700 to-transparent opacity-50"></div>
      
      {/* Grid Pattern (Optional subtle texture) */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>

      <div className="z-10 w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500">
        <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-xl shadow-2xl overflow-hidden p-8">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              Welcome back
            </h1>
            <p className="text-neutral-400 text-sm">
              Enter your credentials to access your workspace.
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 uppercase tracking-wider" htmlFor="email">
                Email
              </label>
              <input
                className="flex w-full rounded-lg border border-neutral-800 bg-neutral-950/50 px-4 py-3 text-sm text-white placeholder-neutral-500 shadow-sm transition-colors focus:border-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-600 hover:border-neutral-700"
                id="email" 
                placeholder="name@company.com" 
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-neutral-300 uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <Link href="#" className="text-xs font-medium text-neutral-400 hover:text-white transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  className="flex w-full rounded-lg border border-neutral-800 bg-neutral-950/50 px-4 py-3 text-sm text-white placeholder-neutral-500 shadow-sm transition-colors focus:border-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-600 hover:border-neutral-700 pr-10"
                  id="password" 
                  placeholder="••••••••" 
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
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              className="mt-2 group relative w-full flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-white px-4 py-3 text-sm font-semibold text-neutral-950 shadow-[0_1px_15px_rgba(255,255,255,0.1)] transition-all hover:bg-neutral-200 hover:shadow-[0_1px_20px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Divider */}
            <div className="relative flex py-2 items-center">
              <div className="grow border-t border-neutral-800"></div>
              <span className="shrink-0 mx-4 text-[10px] font-medium text-neutral-500 uppercase tracking-widest">
                Or continue with
              </span>
              <div className="grow border-t border-neutral-800"></div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button
                className="flex items-center justify-center gap-2 h-10 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 transition-colors"
                type="button"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span className="text-xs font-medium text-neutral-300">Google</span>
              </button>
              <button
                className="flex items-center justify-center gap-2 h-10 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 transition-colors"
                type="button"
              >
                <svg className="w-4 h-4" viewBox="0 0 23 23">
                  <path d="M0 0h23v23H0z" fill="#f3f3f3"></path>
                  <path d="M1 1h10v10H1z" fill="#f35325"></path>
                  <path d="M12 1h10v10H12z" fill="#81bc06"></path>
                  <path d="M1 12h10v10H1z" fill="#05a6f0"></path>
                  <path d="M12 12h10v10H12z" fill="#ffba08"></path>
                </svg>
                <span className="text-xs font-medium text-neutral-300">Microsoft</span>
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500">
              New here?{" "}
              <Link href="/sign-up" className="text-white font-medium hover:underline underline-offset-4">
                Create an account
              </Link>
            </p>
          </div>
        </div>
        
        {/* Footer Links */}
        <div className="mt-8 flex justify-center gap-6 text-xs text-neutral-500">
          <Link href="#" className="hover:text-neutral-400">Terms</Link>
          <Link href="#" className="hover:text-neutral-400">Privacy</Link>
          <Link href="#" className="hover:text-neutral-400">Help</Link>
        </div>
      </div>
    </main>
  );
}

