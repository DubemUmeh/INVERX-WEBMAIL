"use client"

import { useEffect, useState } from "react"
import { Search, Mail, Calendar, MoreHorizontal, User, Filter, ArrowUpDown, Users, Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/api/client"
import { useSession } from "@/lib/auth-client"
import { PasscodeDialog } from "@/components/PasscodeDialog"

interface WaitlistEntry {
  id: string
  name: string
  email: string
  createdAt: string
}

export default function AdminPage() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminToken, setAdminToken] = useState<string | null>(null)

  const fetchWaitlist = async (token: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get<any>("/waitlist", undefined, {
        headers: {
          "X-Admin-Token": token
        }
      })
      console.log('waitlists data: ', response)
      setWaitlist(Array.isArray(response.data) ? response.data : [])
      return true
    } catch (err: any) {
      setError(err.message || "Failed to fetch waitlist")
      if (err.status === 401) {
        setIsAuthenticated(false)
        setAdminToken(null)
        document.cookie = "admin_token=; max-age=0; path=/;"
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (passcode: string) => {
    try {
      const response = await api.post<any>("/auth/admin/login", { passcode })
      if (response.success && response.token) {
        setAdminToken(response.token)
        setIsAuthenticated(true)
        
        // Save to cookie with 5 minute expiry (300 seconds)
        document.cookie = `admin_token=${response.token}; max-age=300; path=/; SameSite=Strict`
        
        await fetchWaitlist(response.token)
        return response.token
      }
      return null
    } catch (err) {
      return null
    }
  }

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()?.split(';').shift()
      return null
    }

    const savedToken = getCookie("admin_token")
    if (savedToken) {
      setAdminToken(savedToken)
      setIsAuthenticated(true)
      fetchWaitlist(savedToken)
    }
  }, [])

  if (!isAuthenticated) {
    return <PasscodeDialog isOpen={true} onVerify={handleVerify} />
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pt-20 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-8 space-y-6">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
          <div className="relative w-full sm:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              placeholder="Search emails..."
            />
          </div>
          <div className="flex items-center justify-end w-full gap-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Users className="h-4 w-4" />
              <span>Waitlists</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-700 min-w-[32px] flex justify-center">
                {isLoading ? (
                  <Skeleton className="h-3 w-3 rounded-full" />
                ) : (
                  waitlist.length
                )}
              </span>
            </button>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <ArrowUpDown className="h-4 w-4" />
                <span>Sort</span>
              </button>
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
          
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <div className="col-span-1 flex items-center">
              <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            </div>
            <div className="col-span-6 sm:col-span-5">User</div>
            <div className="col-span-4 hidden sm:block">Date Joined</div>
            <div className="col-span-5 sm:col-span-2 text-right">Actions</div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {isLoading ? (
              // Skeleton Rows
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                  <div className="col-span-1 flex items-center">
                    <Skeleton className="h-4 w-4 rounded" />
                  </div>
                  <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="col-span-4 hidden sm:flex items-center">
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="col-span-5 sm:col-span-2 flex justify-end">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-red-500 font-medium">{error}</p>
              </div>
            ) : waitlist.length === 0 ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                No one on the waitlist yet.
              </div>
            ) : (
              waitlist.map((entry) => (
                <div key={entry.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <div className="col-span-1 flex items-center">
                    <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 bg-transparent" />
                  </div>
                  
                  <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{entry.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{entry.email}yes</p>
                    </div>
                  </div>

                  <div className="col-span-4 hidden sm:flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                    <span>{new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <div className="col-span-5 sm:col-span-2 flex justify-end">
                    <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </main>
  )
}
