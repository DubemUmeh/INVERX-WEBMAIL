import { api } from "./client";

export const attachmentsApi = {
  /**
   * Step 1: Initiate upload
   * Returns signed URL for direct upload to Supabase
   */
  initiateUpload: (data: {
    messageId: string;
    filename: string;
    contentType: string;
    sizeBytes: number;
    contentId?: string;
  }) =>
    api.post<{
      attachmentId: string;
      uploadUrl: string;
      expiresAt: string;
      storageKey: string;
    }>("/attachments/initiate", data),

  /**
   * Helper: Upload file to Supabase using signed URL
   * This calls Supabase directly, not the backend API
   */
  uploadToSupabase: async (uploadUrl: string, file: File | Blob) => {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to upload file to storage");
    }

    return true;
  },

  /**
   * Step 2: Finalize upload
   * Backend verifies file exists and marks attachment as ready
   */
  finalizeUpload: (id: string, data: { checksum?: string } = {}) =>
    api.post<any>(`/attachments/${id}/finalize`, data),

  /**
   * Get attachment details
   */
  getById: (id: string) => api.get<any>(`/attachments/${id}`),

  /**
   * Get signed download URL
   */
  getDownloadUrl: (id: string) =>
    api.get<{
      downloadUrl: string;
      expiresAt: string;
      filename: string;
      contentType: string;
    }>(`/attachments/${id}/download`),

  /**
   * Delete attachment
   */
  delete: (id: string) => api.delete<void>(`/attachments/${id}`),
};
