import { api } from "./client";

export const mailApi = {
  // Backend separates messages by folder
  getInbox: (params?: any) => api.get<any>("/mail/inbox", params),
  getSent: (params?: any) => api.get<any>("/mail/sent", params),
  getDrafts: (params?: any) => api.get<any>("/mail/drafts", params),
  getSpam: (params?: any) => api.get<any>("/mail/spam", params),
  getArchive: (params?: any) => api.get<any>("/mail/archive", params),

  // Generic getter defaults to inbox to match UI expectation
  getMessages: (params?: any) => api.get<any>("/mail/inbox", params),

  getMessage: (id: string) => api.get<any>(`/mail/messages/${id}`),

  // Mailboxes (Folders) - Backend doesn't have specific mailbox endpoints yet
  // getMailboxes: () => api.get<any>("/mail/mailboxes"),
  // createMailbox: (data: any) => api.post<any>("/mail/mailboxes", data),

  // Actions
  sendMessage: (data: any) => api.post<any>("/mail/send", data),
  createDraft: (data: any) => api.post<any>("/mail/draft", data),

  // Backend uses PATCH for state updates
  markAsRead: (id: string) =>
    api.patch<void>(`/mail/messages/${id}`, { isRead: true }),
  markAsUnread: (id: string) =>
    api.patch<void>(`/mail/messages/${id}`, { isRead: false }),

  archiveMessage: (id: string) =>
    api.patch<void>(`/mail/messages/${id}`, { isArchived: true }),

  deleteMessage: (id: string) => api.delete<void>(`/mail/messages/${id}`),
};
