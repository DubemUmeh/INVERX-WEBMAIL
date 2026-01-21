"use client";

import ActivityShell from "@/components/layout/activity-shell";
import { useEffect, useState } from 'react';
import { UserPlus, MoreHorizontal, Loader2 } from 'lucide-react';
import { accountsApi, authApi } from '@/lib/api';
import { AccountMember } from '@/types';
import { toast } from 'sonner';

export default function AccessControlPage() {
  const [members, setMembers] = useState<AccountMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accountId, setAccountId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Get current user to know which account to load
        // In a real app, this would come from a Context
        const { data: user } = await authApi.getProfile();
        setAccountId(user.accountId);

        // 2. Fetch members
        const { data: membersData } = await accountsApi.getMembers();
        setMembers(membersData);
      } catch (error) {
        toast.error('Failed to load team members');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <ActivityShell>
        <div className="flex items-center justify-center h-full">
           <Loader2 className="animate-spin text-primary size-8" />
        </div>
      </ActivityShell>
    );
  }
  
  return (
    <ActivityShell>
         <header className="shrink-0 border-b border-border-dark bg-background-dark z-10 px-6 py-5">
            <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-white text-2xl font-bold tracking-tight mb-1">Access Control</h2>
                  <p className="text-text-secondary text-sm">Manage team members and their roles.</p>
               </div>
               <button className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-500/20">
                  <UserPlus size={18} />
                  Invite Member
               </button>
            </div>
         </header>

         <div className="flex-1 overflow-auto p-6">
            <div className="rounded-xl border border-border-dark bg-surface-dark overflow-hidden">
               <table className="min-w-full divide-y divide-border-dark">
                  <thead className="bg-[#161616]">
                     <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">MFA Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Last Login</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border-dark">
                     {members.map((member) => (
                        <tr key={member.id} className="hover:bg-background-dark/50 transition-colors">
                           <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                 <div className="size-8 rounded-full bg-linear-to-tr from-primary to-indigo-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                                    {member.user.fullName 
                                       ? member.user.fullName.substring(0, 2) 
                                       : member.user.email.substring(0, 2)}
                                 </div>
                                 <div>
                                    <p className="text-sm font-medium text-white">{member.user.fullName || 'Unknown'}</p>
                                    <p className="text-text-secondary text-xs">{member.user.email}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                                 member.role === 'owner' 
                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              }`}>
                                 {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                              </span>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Enabled</span>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                              -
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button className="text-text-secondary hover:text-white transition-colors">
                                 <MoreHorizontal size={18} />
                              </button>
                           </td>
                        </tr>
                     ))}
                     {members.length === 0 && (
                        <tr>
                           <td colSpan={5} className="px-6 py-8 text-center text-text-secondary">
                              No team members found.
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
    </ActivityShell>
  );
}
