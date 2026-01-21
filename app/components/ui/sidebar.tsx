"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Sidebar({ children, className, defaultOpen = true, ...props }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full transition-all duration-300 ease-in-out bg-background",
        isOpen ? "w-[260px]" : "w-0",
        className
      )}
      {...props}
    >
      <div className={cn("flex-1 flex flex-col overflow-hidden w-[260px] bg-background", isOpen ? "opacity-100" : "opacity-0 invisible")}>
        {children}
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "absolute top-4 right-[-40px] z-50",
          "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
          "bg-white dark:bg-[#121212] w-9 h-9 flex items-center justify-center rounded-r-lg border-y border-r border-gray-200 dark:border-gray-800 shadow-sm transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary/20",
          // Mapped token classes to standard Tailwind
          "disabled:opacity-50 cursor-pointer"
        )}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        data-testid="close-sidebar-button"
        data-state={isOpen ? "open" : "closed"}
      >
        {isOpen ? (
          <ChevronLeft className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
      </button>
    </aside>
  );
}
