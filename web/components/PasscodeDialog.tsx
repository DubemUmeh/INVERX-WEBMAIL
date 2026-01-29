"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Loader2 } from "lucide-react"
import Link from "next/link"

interface PasscodeDialogProps {
  isOpen: boolean
  onVerify: (passcode: string) => Promise<string | null>
}

export function PasscodeDialog({ isOpen, onVerify }: PasscodeDialogProps) {
  const [passcode, setPasscode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passcode) return

    setIsLoading(true)
    setError(false)
    
    try {
      const token = await onVerify(passcode)
      if (!token) {
        setError(true)
        setPasscode("")
      }
    } catch (err) {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="min-h-screen">
      <Dialog open={isOpen}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-500" />
              Admin Access Required
            </DialogTitle>
            <DialogDescription>
              Please enter the admin passcode to access this page.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
                autoFocus
              />
              {error && (
                <p className="text-xs text-red-500 font-medium">
                  Invalid passcode. Please try again.
                </p>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isLoading || !passcode}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Access Dashboard"
                )}
              </Button>
            </DialogFooter>
          </form>
          <Link href='/waitlist' className="text-center font-semibold underline underline-offset-2 decoration-blue-600">Join Waitlist ?</Link>
        </DialogContent>
      </Dialog>
    </section>
  )
}
