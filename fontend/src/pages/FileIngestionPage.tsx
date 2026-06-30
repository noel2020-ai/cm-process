import { useEffect, useState } from "react";

import { getLoadLogs, previewFile, scanFiles } from "../api/files";
import { getRelatedSqlServerRows } from "../api/sqlserver";
import { extractErrorMessage } from "../api/client";
import { DataTable } from "../components/DataTable";
import { FileScanner } from "../components/FileScanner";
import { Layout } from "../components/Layout";
import { StatusBadge } from "../components/StatusBadge";
import { demoFiles, demoLogs, demoPreview, getDemoRelatedTables } from "../demo/mockData";
import type { FileEntry, FilePreview, LoadLog, SqlServerRelatedTable } from "../types";

const findMasterIdValue = (row: Record<string, unknown>): string | null => {
  const key = Object.keys(row).find((item) => item.toLowerCase() === "masterid" || item.toLowerCase() === "master_id");
  if (!key) {
    return null;
  }
  const value = row[key];
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return String(value);
};

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
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);
  const [relatedTables, setRelatedTables] = useState<SqlServerRelatedTable[]>([]);
  const [usingDemoData, setUsingDemoData] = useState(false);

  const enableDemoMode = (reason?: string) => {
    setFiles(demoFiles);
    setLogs(demoLogs);
    setSelectedPath(demoFiles[0].relative_path);
    setPreview(demoPreview);
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

  const handlePreview = async (path: string) => {
    setSelectedPath(path);
    setLoadingPreview(true);
    try {
      const nextPreview = usingDemoData ? demoPreview : await previewFile(path);
      setPreview(nextPreview);
      setSelectedRowIndex(null);
      setSelectedMasterId(null);
      setRelatedTables([]);
      setMessage(usingDemoData ? "Showing built-in demo preview data." : "");
    } catch (error) {
      setPreview(demoPreview);
      setUsingDemoData(true);
      setMessage(`Preview service unavailable. Showing built-in demo data instead. ${extractErrorMessage(error)}`);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleRowSelect = async (row: Record<string, unknown>, rowIndex: number) => {
    const masterId = findMasterIdValue(row);
    setSelectedRowIndex(rowIndex);
    setSelectedMasterId(masterId);

    if (!masterId) {
      setRelatedTables([]);
      setMessage("The selected row does not contain a MasterId value.");
      return;
    }

    setLoadingRelated(true);
    try {
      const nextTables = usingDemoData ? getDemoRelatedTables(masterId) : await getRelatedSqlServerRows(masterId);
      setRelatedTables(nextTables);
      setMessage(usingDemoData ? "Showing demo related tables." : "");
    } catch (error) {
      setRelatedTables(getDemoRelatedTables(masterId));
      setUsingDemoData(true);
      setMessage(`Related table service unavailable. Showing built-in demo related data instead. ${extractErrorMessage(error)}`);
    } finally {
      setLoadingRelated(false);
    }
  };

  const previewColumns = preview?.headers ?? [];
  const previewRows = preview?.rows ?? [];
  const rowsWithMasterId = previewRows.filter((row) => findMasterIdValue(row)).length;
  const selectedRow = selectedRowIndex !== null ? previewRows[selectedRowIndex] : null;

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
              <p className="text-sm text-slate-500">Review the scanned file and select a row to load related SQL Server tables by `MasterId`.</p>
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
                  <div className="text-xs uppercase tracking-wide text-slate-500">Rows With MasterId</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{rowsWithMasterId}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Selected MasterId</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">{selectedMasterId ?? "None selected"}</div>
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
                    <p className="text-sm text-slate-500">Click a row to load related SQL Server tables using `MasterId`.</p>
                  </div>
                  {selectedRow && <StatusBadge status="success" />}
                </div>
                <DataTable
                  columns={previewColumns}
                  rows={previewRows}
                  selectedRowIndex={selectedRowIndex}
                  onRowClick={(row, index) => void handleRowSelect(row, index)}
                />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-panel">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Related SQL Server Tables</h3>
              <p className="text-sm text-slate-500">Detail tables are loaded from the configured SQL Server objects using the selected `MasterId`.</p>
            </div>
            {selectedMasterId && <div className="rounded-xl bg-brand-50 px-3 py-2 text-sm font-medium text-brand-800">MasterId: {selectedMasterId}</div>}
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
                  <DataTable columns={columns} rows={table.rows} compact />
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
