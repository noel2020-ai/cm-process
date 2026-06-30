import { apiClient } from "./client";
import type { ApiResponse, SqlServerConnectionInfo, SqlServerRelatedSearchRequest, SqlServerRelatedTable } from "../types";

export const getSqlServerConnection = async () => {
  const response = await apiClient.get<ApiResponse<SqlServerConnectionInfo>>("/sqlserver/connection");
  return response.data.data;
};

export const runReadonlyQuery = async (query: string) => {
  const response = await apiClient.post<ApiResponse<Record<string, unknown>[]>>("/sqlserver/query", { query });
  return response.data.data;
};

export const readSqlServerObject = async (payload: {
  schema_name: string;
  object_name: string;
  object_type: "table" | "view";
  limit: number;
}) => {
  const response = await apiClient.post<ApiResponse<Record<string, unknown>[]>>("/sqlserver/object", payload);
  return response.data.data;
};

export const getRelatedSqlServerRows = async (masterId: string) => {
  const response = await apiClient.get<ApiResponse<SqlServerRelatedTable[]>>(`/sqlserver/related/${encodeURIComponent(masterId)}`);
  return response.data.data;
};

export const searchRelatedSqlServerRows = async (payload: SqlServerRelatedSearchRequest) => {
  const response = await apiClient.post<ApiResponse<SqlServerRelatedTable[]>>("/sqlserver/related-search", payload);
  return response.data.data;
};
