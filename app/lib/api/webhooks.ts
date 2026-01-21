import { api } from "./client";

export const webhooksApi = {
  getAll: () => api.get<any>("/webhooks"),
  getById: (id: string) => api.get<any>(`/webhooks/${id}`),
  create: (data: any) => api.post<any>("/webhooks", data),
  update: (id: string, data: any) => api.patch<any>(`/webhooks/${id}`, data),
  delete: (id: string) => api.delete<void>(`/webhooks/${id}`),

  test: (id: string, event: string) =>
    api.post<any>(`/webhooks/${id}/test`, { event }),
  getEvents: (id: string, params?: any) =>
    api.get<any>(`/webhooks/${id}/events`, params),
};
