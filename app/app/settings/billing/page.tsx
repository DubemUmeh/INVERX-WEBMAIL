"use client";

import React from "react";
import { CreditCard } from "lucide-react";

export default function BillingSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[#141414] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em] mb-2">
          Billing
        </h2>
        <p className="text-neutral-500 text-base">
          Manage your subscription and payment methods.
        </p>
      </div>
      <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-12 flex flex-col items-center justify-center text-center">
         <div className="h-12 w-12 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="h-6 w-6 text-neutral-400" />
         </div>
         <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">No active subscription</h3>
         <p className="text-neutral-500 max-w-sm mt-1">Upgrade to a Pro plan to unlock advanced features.</p>
      </div>
    </div>
  );
}
