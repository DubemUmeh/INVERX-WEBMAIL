import { api } from "./client";

export const usersApi = {
  // Backend only implements /me for now
  getMe: () => api.get<any>("/me"),

  // Generic CRUD endpoints do not exist in current backend
};
