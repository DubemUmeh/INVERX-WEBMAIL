import { api } from "./client";

export interface ProfileData {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  themePreference: string | null;
  isVerified: boolean | null;
  createdAt: string;
}

export interface SecurityStatus {
  email: string;
  lastLoginAt: string | null;
  isVerified: boolean | null;
  activeApiKeys: number;
  twoFactorEnabled: boolean;
  recentActivity: Array<{
    action: string;
    createdAt: string;
    ipAddress: string | null;
  }>;
}

export const settingsApi = {
  // Profile
  getProfile: () => api.get<ProfileData>("/settings/profile"),
  updateProfile: (
    data: Partial<
      Pick<ProfileData, "fullName" | "avatarUrl" | "themePreference">
    >
  ) => api.patch<ProfileData>("/settings/profile", data),

  // Security
  getSecurity: () => api.get<SecurityStatus>("/settings/security"),
  updateSecurity: (data: {
    currentPassword?: string;
    newPassword?: string;
    twoFactorEnabled?: boolean;
  }) => api.patch<{ message: string }>("/settings/security", data),
};
