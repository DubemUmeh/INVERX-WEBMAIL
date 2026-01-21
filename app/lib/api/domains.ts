import { api } from "./client";

export const domainsApi = {
  getAll: (params?: any) => api.get<any>("/domains", params),
  getById: (id: string) => api.get<any>(`/domains/${id}`),
  create: (data: any) => api.post<any>("/domains", data),
  delete: (id: string) => api.delete<void>(`/domains/${id}`),

  verify: (id: string) => api.post<any>(`/domains/${id}/verify`),
  getDnsRecords: (id: string) => api.get<any>(`/domains/${id}/dns`),
  checkDns: (id: string) => api.post<any>(`/domains/${id}/dns/check`),

  // Addresses
  getAddresses: (id: string) => api.get<any>(`/domains/${id}/addresses`),
  createAddress: (id: string, data: any) =>
    api.post<any>(`/domains/${id}/addresses`, data),
  deleteAddress: (id: string, addressId: string) =>
    api.delete<void>(`/domains/${id}/addresses/${addressId}`),
};
