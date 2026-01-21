"use client";

import React from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TrashPage() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#121212]">
      <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Trash</h1>
          <p className="text-gray-500 text-sm">Items in trash are deleted forever after 30 days</p>
        </div>
        <Button variant="destructive" size="sm" className="gap-2">
            <Trash2 className="w-4 h-4" />
            Empty Trash
        </Button>
      </div>
       <ScrollArea className="flex-1">
         <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-60">
            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-full mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trash is empty</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-sm mt-2">Hooray! No junk here.</p>
         </div>
      </ScrollArea>
    </div>
  );
}