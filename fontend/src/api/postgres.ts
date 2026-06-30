import { apiClient } from "./client";
import type { ApiResponse, TableDataset } from "../types";

export const listTables = async () => {
  const response = await apiClient.get<ApiResponse<string[]>>("/postgres/tables");
  return response.data.data;
};

export const getRecords = async (tableName: string, search: string) => {
  const response = await apiClient.get<ApiResponse<TableDataset>>(`/postgres/records/${tableName}`, {
    params: { search },
  });
  return response.data.data;
};

export const createRecord = async (tableName: string, record: Record<string, unknown>) => {
  return apiClient.post("/postgres/records", { table_name: tableName, record });
};

export const updateRecord = async (tableName: string, recordId: number, record: Record<string, unknown>) => {
  return apiClient.put("/postgres/records", { table_name: tableName, record_id: recordId, record });
};

export const deleteRecord = async (tableName: string, recordId: number) => {
  return apiClient.delete(`/postgres/records/${tableName}/${recordId}`);
};

export const getExportUrl = (tableName: string, formatName: "csv" | "xlsx") =>
  `${apiClient.defaults.baseURL}/postgres/export/${tableName}?format_name=${formatName}`;

