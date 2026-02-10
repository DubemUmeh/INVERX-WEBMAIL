import React from "react";
import { SettingsNav } from "./settings-nav";
import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Settings",
  description: "Manage your account settings, preferences, and integrations.",
});

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark">
      <div className="flex-1 max-w-[1280px] w-full mx-auto px-4 md:px-6 py-4 md:py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          <SettingsNav />
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
