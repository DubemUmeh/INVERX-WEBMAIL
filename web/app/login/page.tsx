"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

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
          window.location.href = "http://localhost:2000/dashboard";
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
    <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <div className="layout-content-container flex flex-col w-full max-w-[480px]">
        {/* <!-- Page Heading --> */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-primary dark:text-white text-3xl font-bold leading-tight tracking-tight mb-2">Welcome back
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-normal">Enter your details to access your
            workspace.</p>
        </div>
        {/* <!-- Form --> */}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* <!-- Email Field --> */}
          <div className="flex flex-col gap-2">
            <label className="text-primary dark:text-white text-sm font-medium leading-normal" htmlFor="email">Email</label>
            <input
              className="form-input flex w-full resize-none overflow-hidden rounded-lg text-primary dark:text-white bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 focus:border-primary dark:focus:border-white focus:ring-1 focus:ring-primary dark:focus:ring-white h-12 px-4 text-base placeholder:text-neutral-500 dark:placeholder:text-neutral-600 transition-all"
              id="email" 
              placeholder="name@company.com" 
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          {/* <!-- Password Field --> */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-primary dark:text-white text-sm font-medium leading-normal"
                htmlFor="password">Password</label>
            </div>
            <div className="relative flex w-full items-center">
              <input
                className="form-input flex w-full resize-none overflow-hidden rounded-lg text-primary dark:text-white bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 focus:border-primary dark:focus:border-white focus:ring-1 focus:ring-primary dark:focus:ring-white h-12 px-4 pr-12 text-base placeholder:text-neutral-500 dark:placeholder:text-neutral-600 transition-all"
                id="password" 
                placeholder="••••••••" 
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                className="absolute right-3 p-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 focus:outline-none"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          {/* <!-- Remember Me & Forgot Password --> */}
          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary dark:border-neutral-600 dark:bg-neutral-800 dark:checked:bg-white dark:checked:border-white"
                type="checkbox" />
              <span className="text-sm font-normal text-neutral-600 dark:text-neutral-300">Remember me</span>
            </label>
            <a className="text-sm font-medium text-primary dark:text-white hover:underline" href="#">Forgot password?</a>
          </div>
          {/* <!-- Submit Button --> */}
          <button
            disabled={loading}
            className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary text-white hover:bg-neutral-800 dark:bg-white dark:text-primary dark:hover:bg-neutral-200 text-base font-bold leading-normal transition-all mt-2 disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
          
          {/* ... Social Login ... */}
          {/* <!-- Divider --> */}
          <div className="relative flex py-2 items-center">
            <div className="grow border-t border-neutral-200 dark:border-neutral-700"></div>
            <span
              className="shrink-0 mx-4 text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Or
              continue with</span>
            <div className="grow border-t border-neutral-200 dark:border-neutral-700"></div>
          </div>
           {/* <!-- Social Login --> */}
          <div className="grid grid-cols-2 gap-3">
            <button
              className="flex items-center justify-center gap-2 h-11 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              type="button">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Google</span>
            </button>
            <button
              className="flex items-center justify-center gap-2 h-11 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              type="button">
              <svg className="w-5 h-5" viewBox="0 0 23 23">
                <path d="M0 0h23v23H0z" fill="#f3f3f3"></path>
                <path d="M1 1h10v10H1z" fill="#f35325"></path>
                <path d="M12 1h10v10H12z" fill="#81bc06"></path>
                <path d="M1 12h10v10H1z" fill="#05a6f0"></path>
                <path d="M12 12h10v10H12z" fill="#ffba08"></path>
              </svg>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Microsoft</span>
            </button>
          </div>
        </form>

        <p className="text-center pt-5 text-neutral-600">Haven't registered an account? <Link href='/waitlists' className="text-black font-semibold underline underline-offset-2">Create One</Link></p>
      </div>
    </main>
  )
}

