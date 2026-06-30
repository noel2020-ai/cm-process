import { useEffect, useState } from "react";

import { getLoadLogs, previewFile, scanFiles } from "../api/files";
import { searchRelatedSqlServerRows } from "../api/sqlserver";
import { extractErrorMessage } from "../api/client";
import { DataTable } from "../components/DataTable";
import { FileScanner } from "../components/FileScanner";
import { Layout } from "../components/Layout";
import { StatusBadge } from "../components/StatusBadge";
import { demoFiles, demoLogs, getDemoPreviewPage, getDemoRelatedTables } from "../demo/mockData";
import type { FileEntry, FilePreview, LoadLog, SqlServerRelatedSearchRequest, SqlServerRelatedTable } from "../types";

const PREVIEW_PAGE_SIZE = 100;

const findValueByAliases = (row: Record<string, unknown>, aliases: string[]): string | null => {
  const normalizedAliases = aliases.map((alias) => alias.toLowerCase());
  const key = Object.keys(row).find((item) => normalizedAliases.includes(item.toLowerCase()));
  if (!key) {
    return null;
  }
  const value = row[key];
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return String(value);
};

const buildRelatedSearchPayload = (row: Record<string, unknown>): SqlServerRelatedSearchRequest => ({
  name: findValueByAliases(row, ["CustomerName", "Name", "ParentName"]) ?? undefined,
  address: findValueByAliases(row, ["Address", "CustomerAddress", "AddressLine1"]) ?? undefined,
  parent_id: findValueByAliases(row, ["ParentId", "ParentID", "Parent_Id"]) ?? undefined,
  limit: 100,
});

export function FileIngestionPage() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selectedPath, setSelectedPath] = useState("");
  const [preview, setPreview] = useState<FilePreview | null>(null);
  const [logs, setLogs] = useState<LoadLog[]>([]);
  const [loadingScan, setLoadingScan] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [selectedSearchSummary, setSelectedSearchSummary] = useState<string>("");
  const [relatedTables, setRelatedTables] = useState<SqlServerRelatedTable[]>([]);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [previewOffset, setPreviewOffset] = useState(0);

  const enableDemoMode = (reason?: string) => {
    setFiles(demoFiles);
    setLogs(demoLogs);
    setSelectedPath(demoFiles[0].relative_path);
    setPreview(getDemoPreviewPage(0, PREVIEW_PAGE_SIZE));
    setPreviewOffset(0);
    setUsingDemoData(true);
    setMessage(reason ?? "Demo mode is active.");
  };

  const fetchFiles = async () => {
    setLoadingScan(true);
    try {
      setFiles(await scanFiles());
      setUsingDemoData(false);
    } catch (error) {
      enableDemoMode(`Backend scan unavailable. Showing built-in demo data instead. ${extractErrorMessage(error)}`);
    } finally {
      setLoadingScan(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLogs(await getLoadLogs());
    } catch (error) {
      setLogs(demoLogs);
    }
  };

  useEffect(() => {
    void fetchFiles();
    void fetchLogs();
  }, []);

  const loadPreviewPage = async (path: string, offset: number) => {
    setSelectedPath(path);
    setLoadingPreview(true);
    try {
      const nextPreview = usingDemoData
        ? getDemoPreviewPage(offset, PREVIEW_PAGE_SIZE)
        : await previewFile(path, offset, PREVIEW_PAGE_SIZE);
      setPreview(nextPreview);
      setPreviewOffset(offset);
      setSelectedRowIndex(null);
      setSelectedSearchSummary("");
      setRelatedTables([]);
      setMessage(usingDemoData ? "Showing built-in demo preview data." : "");
    } catch (error) {
      setPreview(getDemoPreviewPage(offset, PREVIEW_PAGE_SIZE));
      setPreviewOffset(offset);
      setUsingDemoData(true);
      setMessage(`Preview service unavailable. Showing built-in demo data instead. ${extractErrorMessage(error)}`);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handlePreview = async (path: string) => {
    await loadPreviewPage(path, 0);
  };

  const handleRowSelect = async (row: Record<string, unknown>, rowIndex: number) => {
    const criteria = buildRelatedSearchPayload(row);
    const criteriaSummary = [
      criteria.name ? `Name: ${criteria.name}` : null,
      criteria.address ? `Address: ${criteria.address}` : null,
      criteria.parent_id ? `ParentId: ${criteria.parent_id}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    setSelectedRowIndex(rowIndex);
    setSelectedSearchSummary(criteriaSummary);

    if (!criteria.name && !criteria.address && !criteria.parent_id) {
      setRelatedTables([]);
      setMessage("The selected row does not contain name, address, or parent ID values for related lookup.");
      return;
    }

    setLoadingRelated(true);
    try {
      const nextTables = usingDemoData
        ? getDemoRelatedTables(findValueByAliases(row, ["MasterId", "Master_ID"]) ?? "")
        : await searchRelatedSqlServerRows(criteria);
      setRelatedTables(nextTables);
      setMessage(usingDemoData ? "Showing demo related tables." : "");
    } catch (error) {
      setRelatedTables(getDemoRelatedTables(findValueByAliases(row, ["MasterId", "Master_ID"]) ?? ""));
      setUsingDemoData(true);
      setMessage(`Related table service unavailable. Showing built-in demo related data instead. ${extractErrorMessage(error)}`);
    } finally {
      setLoadingRelated(false);
    }
  };

  const previewColumns = preview?.headers ?? [];
  const previewRows = preview?.rows ?? [];
  const rowsWithLookupData = previewRows.filter((row) => {
    const criteria = buildRelatedSearchPayload(row);
    return Boolean(criteria.name || criteria.address || criteria.parent_id);
  }).length;
  const selectedRow = selectedRowIndex !== null ? previewRows[selectedRowIndex] : null;
  const visiblePreviewCount = previewRows.length;
  const currentPage = preview ? Math.floor(preview.offset / preview.limit) + 1 : 1;
  const totalPages = preview ? Math.max(1, Math.ceil(preview.row_count / preview.limit)) : 1;
  const pageStartRow = preview && preview.row_count > 0 ? preview.offset + 1 : 0;
  const pageEndRow = preview ? Math.min(preview.offset + preview.rows.length, preview.row_count) : 0;

  return (
    <Layout
      sidebar={
        <FileScanner
          files={files}
          selectedPath={selectedPath}
          onSelect={(path) => void handlePreview(path)}
          onScan={() => void fetchFiles()}
          loading={loadingScan}
        />
      }
    >
      <div className="mb-6 lg:hidden">
        <FileScanner
          files={files}
          selectedPath={selectedPath}
          onSelect={(path) => void handlePreview(path)}
          onScan={() => void fetchFiles()}
          loading={loadingScan}
        />
      </div>
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-panel">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Master File Preview</h2>
              <p className="text-sm text-slate-500">Review the scanned file and select a row to load related SQL Server tables by name, address, and parent ID.</p>
            </div>
          </div>
          {message && <div className="mb-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-800">{message}</div>}
          {usingDemoData && (
            <div className="mb-4 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
              Demo mode is active. The dashboard is using local sample data because the backend or connected data source is not available.
            </div>
          )}
          {loadingPreview && <div className="text-sm text-slate-500">Loading preview...</div>}
          {preview && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Rows</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{preview.row_count}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Columns</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{preview.headers.length}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Validation</div>
                  <div className="mt-2">
                    <StatusBadge status={preview.validation_errors.length === 0 ? "success" : "warning"} />
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Rows With Lookup Data</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{rowsWithLookupData}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Selected Search</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{selectedSearchSummary || "None selected"}</div>
                </div>
              </div>
              {preview.validation_errors.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  {preview.validation_errors.join(" | ")}
                </div>
              )}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Master File Rows</h3>
                    <p className="text-sm text-slate-500">
                      Showing rows {pageStartRow}-{pageEndRow} of {preview.row_count}. Click a row to search related SQL Server tables by name, address, and parent ID.
                    </p>
                  </div>
                  {selectedRow && <StatusBadge status="success" />}
                </div>
                <DataTable
                  columns={previewColumns}
                  rows={previewRows}
                  selectedRowIndex={selectedRowIndex}
                  onRowClick={(row, index) => void handleRowSelect(row, index)}
                  maxHeightClass="max-h-[32rem]"
                />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-slate-500">
                    Page {currentPage} of {totalPages} | {visiblePreviewCount} rows on this page | {rowsWithLookupData} rows with lookup data
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!preview || preview.offset === 0 || loadingPreview}
                      onClick={() => void loadPreviewPage(selectedPath, Math.max(0, previewOffset - PREVIEW_PAGE_SIZE))}
                      type="button"
                    >
                      Previous
                    </button>
                    <button
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!preview || preview.offset + preview.rows.length >= preview.row_count || loadingPreview}
                      onClick={() => void loadPreviewPage(selectedPath, previewOffset + PREVIEW_PAGE_SIZE)}
                      type="button"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-panel">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Related SQL Server Tables</h3>
              <p className="text-sm text-slate-500">Detail tables are loaded from the configured SQL Server objects using the selected name, address, or parent ID values.</p>
            </div>
            {selectedSearchSummary && <div className="rounded-xl bg-brand-50 px-3 py-2 text-sm font-medium text-brand-800">{selectedSearchSummary}</div>}
          </div>
          {loadingRelated && <div className="text-sm text-slate-500">Loading related tables...</div>}
          {!loadingRelated && relatedTables.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              Select a master row to load the related SQL Server tables.
            </div>
          )}
          <div className="space-y-5">
            {relatedTables.map((table) => {
              const columns = table.rows.length > 0 ? Object.keys(table.rows[0]) : [];
              return (
                <div key={table.table_name} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-base font-semibold text-slate-900">{table.table_name}</h4>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{table.rows.length} rows</div>
                  </div>
                  <DataTable columns={columns} rows={table.rows} compact maxHeightClass="max-h-64" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-panel">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Ingestion Log</h3>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start justify-between rounded-2xl border border-slate-100 p-4">
                <div>
                  <div className="font-medium text-slate-900">{log.filename}</div>
                  <div className="text-sm text-slate-500">
                    Table: {log.table_name} | Rows: {log.row_count}
                  </div>
                  {log.error_message && <div className="mt-1 text-sm text-rose-600">{log.error_message}</div>}
                </div>
                <StatusBadge status={log.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
