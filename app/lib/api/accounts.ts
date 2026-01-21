import { api } from "./client";

export const accountsApi = {
  // Backend uses singleton pattern for the current user's account
  getState: () => api.get<any>("/account"),
  update: (data: any) => api.patch<any>("/account", data),

  // Members - scoped to current account context
  getMembers: () => api.get<any>("/account/members"),

  inviteMember: (data: any) => api.post<any>("/account/members", data),

  updateMember: (memberId: string, data: any) =>
    api.patch<any>(`/account/members/${memberId}`, data),

  removeMember: (memberId: string) =>
    api.delete<void>(`/account/members/${memberId}`),
};
