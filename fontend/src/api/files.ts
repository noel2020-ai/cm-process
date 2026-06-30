import { apiClient } from "./client";
import type { ApiResponse, FileEntry, FilePreview, LoadLog } from "../types";

export const scanFiles = async () => {
  const response = await apiClient.get<ApiResponse<FileEntry[]>>("/files/scan");
  return response.data.data;
};

export const previewFile = async (relativePath: string) => {
  const response = await apiClient.get<ApiResponse<FilePreview>>("/files/preview", {
    params: { relative_path: relativePath },
  });
  return response.data.data;
};

export const loadFile = async (payload: { relative_path: string; table_name: string; mode: string }) => {
  const response = await apiClient.post<ApiResponse<unknown>>("/files/load", payload);
  return response.data;
};

export const getLoadLogs = async () => {
  const response = await apiClient.get<ApiResponse<LoadLog[]>>("/files/logs");
  return response.data.data;
};

