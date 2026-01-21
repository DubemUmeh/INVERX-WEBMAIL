"use client";

import React from "react";
import { Star, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StarredPage() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#121212]">
      <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Starred</h1>
          <p className="text-gray-500 text-sm">Important messages you've saved</p>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
         <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-60">
            <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-full mb-4">
              <Star className="w-8 h-8 text-yellow-500 fill-current" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No starred messages yet</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-sm mt-2">Star important messages to easily find them later.</p>
         </div>
      </ScrollArea>
    </div>
  );
}
