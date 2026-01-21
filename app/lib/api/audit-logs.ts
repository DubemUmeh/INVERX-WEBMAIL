import { api } from "./client";

export const auditLogsApi = {
  getAll: (params?: any) => api.get<any>("/audit-logs", params),
};
