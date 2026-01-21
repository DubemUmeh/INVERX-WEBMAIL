import { api } from "./client";

export const apiKeysApi = {
  getAll: () => api.get<any>("/api-keys"),
  create: (data: any) => api.post<any>("/api-keys", data),
  revoke: (id: string) => api.post<void>(`/api-keys/${id}/revoke`),
  delete: (id: string) => api.delete<void>(`/api-keys/${id}`),
};
