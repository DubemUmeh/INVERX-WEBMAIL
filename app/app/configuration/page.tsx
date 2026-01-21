"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import ActivityShell from "@/components/layout/activity-shell";
import { Save, Server, Mail } from 'lucide-react';

export default function ConfigurationPage() {
  return (
    <ActivityShell>
          <header className="shrink-0 border-b border-border-dark bg-background-dark z-10 px-6 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-white text-2xl font-bold tracking-tight mb-1">Configuration</h2>
                  <p className="text-text-secondary text-sm">System-wide settings and preferences.</p>
                </div>
                <button className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-accent px-4 py-2 rounded-lg text-sm font-bold transition-colors w-full sm:w-auto">
                  <Save size={18} />
                  Save Changes
                </button>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-6 space-y-6">
            {/* SMTP Settings */}
            <section className="bg-surface-dark border border-border-dark rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-border-dark pb-4">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Server size={22} />
                  </div>
                  <div>
                      <h3 className="text-white text-lg font-bold">SMTP Configuration</h3>
                      <p className="text-text-secondary text-sm">Configure your outbound mail server settings.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Hostname</label>
                      <input type="text" className="w-full bg-[#0a0a0a] border border-border-dark rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" value="smtp.inverx.io" readOnly />
                  </div>
                  <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Port</label>
                      <input type="text" className="w-full bg-[#0a0a0a] border border-border-dark rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" defaultValue="587" />
                  </div>
                  <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Encryption Method</label>
                      <Select defaultValue="STARTTLS (Recommended)">
                        <SelectTrigger className="w-full bg-[#0a0a0a] border border-border-dark rounded-lg px-3 py-2.5 text-white text-sm focus:ring-primary focus:ring-offset-0 h-auto">
                          <SelectValue placeholder="Select Method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STARTTLS (Recommended)">STARTTLS (Recommended)</SelectItem>
                          <SelectItem value="SSL/TLS">SSL/TLS</SelectItem>
                          <SelectItem value="None">None</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
                  <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Timeout (seconds)</label>
                      <input type="number" className="w-full bg-[#0a0a0a] border border-border-dark rounded-lg px-3 py-2.5 text-white text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none" defaultValue="30" />
                  </div>
                </div>
            </section>

            {/* Email Defaults */}
            <section className="bg-surface-dark border border-border-dark rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-border-dark pb-4">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <Mail size={22} />
                  </div>
                  <div>
                      <h3 className="text-white text-lg font-bold">Email Defaults</h3>
                      <p className="text-text-secondary text-sm">Default settings for new messages and tracking.</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a] border border-border-dark">
                      <div>
                        <h4 className="text-white text-sm font-medium">Open Tracking</h4>
                        <p className="text-text-secondary text-xs mt-0.5">Automatically track email opens.</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary cursor-pointer">
                        <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                      </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0a] border border-border-dark">
                      <div>
                        <h4 className="text-white text-sm font-medium">Click Tracking</h4>
                        <p className="text-text-secondary text-xs mt-0.5">Track clicks on links within your emails.</p>
                      </div>
                      <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary cursor-pointer">
                        <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                      </div>
                  </div>
                </div>
            </section>
          </div>
    </ActivityShell>
  );
}
