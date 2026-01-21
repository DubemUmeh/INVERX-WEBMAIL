import { api } from "./client";

export const authApi = {
  login: (data: any) => api.post<any>("/auth/login", data),
  register: (data: any) => api.post<any>("/auth/register", data),
  logout: () => api.post<void>("/auth/logout"),
  refresh: () => api.post<any>("/auth/refresh"),
  // Profile matches /me endpoint
  getProfile: () => api.get<any>("/me"),
  updateProfile: (data: any) => api.patch<any>("/me", data),
};
