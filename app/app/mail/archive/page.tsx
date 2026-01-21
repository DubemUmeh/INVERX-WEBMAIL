"use client";

import React from "react";
import { Archive, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ArchivePage() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#121212]">
      <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Archive</h1>
        <p className="text-gray-500 text-sm">Optimized storage for older messages</p>
      </div>
       <ScrollArea className="flex-1">
         <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-60">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
              <Archive className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Archive is empty</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-sm mt-2">Messages you archive will appear here.</p>
         </div>
      </ScrollArea>
    </div>
  );
}
