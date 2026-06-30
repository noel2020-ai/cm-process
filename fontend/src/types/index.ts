export type ApiResponse<T> = {
  status: "success" | "error";
  message: string;
  data: T;
};

export type FileEntry = {
  name: string;
  relative_path: string;
  extension: string;
  size_bytes: number;
  modified_at: string;
};

export type FilePreview = {
  file: FileEntry;
  headers: string[];
  inferred_types: Record<string, string>;
  rows: Record<string, unknown>[];
  row_count: number;
  validation_errors: string[];
};

export type LoadLog = {
  id: number;
  filename: string;
  table_name: string;
  row_count: number;
  status: string;
  error_message?: string | null;
  created_at: string;
};

export type TableDataset = {
  rows: Record<string, unknown>[];
  total: number;
  columns: string[];
};

export type SqlServerConnectionInfo = {
  use_trusted_connection: boolean;
  database: string;
  host: string;
  port: number;
};

export type SqlServerRelatedTable = {
  table_name: string;
  rows: Record<string, unknown>[];
};

export type ResearchResult = {
  source: string;
  title: string;
  url: string;
  snippet: string;
  status: string;
  searched_at?: string;
  created_at?: string;
  query?: string;
};
