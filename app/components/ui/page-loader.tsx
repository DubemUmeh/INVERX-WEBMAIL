"use client";

import React from "react";

interface PageLoaderProps {
  name?: string;
}

export function PageLoader({ name = "Page" }: PageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="loader"></div>
        <p className="text-sm font-medium text-white/80 animate-pulse">
          Loading {name}...
        </p>
      </div>
    </div>
  );
}
