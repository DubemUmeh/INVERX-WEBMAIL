"use client";

import React from "react";
import { 
  FileText, 
  MoreVertical, 
  PenSquare,
  Search,
  Filter,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function DraftsPage() {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#121212]">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Drafts</h1>
          <p className="text-gray-500 text-sm">2 unsent messages</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="icon">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Drafts List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {[1, 2].map((i) => (
            <div key={i} className="group relative px-8 py-4 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors cursor-pointer flex gap-4 items-start">
              <div className="pt-1">
                <Avatar className="h-10 w-10 bg-orange-100 dark:bg-orange-900/20">
                    <AvatarFallback className="text-orange-600 dark:text-orange-400">
                      <FileText className="w-5 h-5" />
                    </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-red-500 text-xs font-bold uppercase tracking-wide">Draft</span>
                  <span className="text-xs text-gray-400">10:23 AM</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Project Requirements - Phase 2</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                  Hi Team, I've started outlining the requirements for the next phase. Please see the attached...
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 self-center">
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                 </Button>
                 <Button className="bg-webmail-primary text-white h-8 px-3 text-xs font-bold gap-2">
                    <PenSquare className="w-3 h-3" />
                    Continue
                 </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
