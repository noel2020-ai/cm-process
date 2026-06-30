import type { FileEntry } from "../types";

type Props = {
  files: FileEntry[];
  selectedPath: string;
  onSelect: (path: string) => void;
  onScan: () => void;
  loading: boolean;
};

export function FileScanner({ files, selectedPath, onSelect, onScan, loading }: Props) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 shadow-panel backdrop-blur">
      <div className="mb-4 flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Shared Folder Scan</h2>
          <p className="text-sm text-brand-100">Supported formats: .xlsx, .xls, .csv</p>
        </div>
        <button
          className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          onClick={onScan}
          type="button"
        >
          {loading ? "Scanning..." : "Scan Folder"}
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="space-y-2">
          {files.map((file) => (
            <button
              key={file.relative_path}
              className={`block w-full min-w-0 overflow-hidden rounded-2xl border px-4 py-3 text-left transition ${
                selectedPath === file.relative_path
                  ? "border-brand-300 bg-white/15"
                  : "border-white/10 bg-white/5 hover:border-brand-200 hover:bg-white/10"
              }`}
              onClick={() => onSelect(file.relative_path)}
              type="button"
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-medium text-white">{file.name}</div>
                  <div className="break-all text-xs text-brand-100">{file.relative_path}</div>
                </div>
                <div className="shrink-0 text-xs text-brand-100">{Math.round(file.size_bytes / 1024)} KB</div>
              </div>
            </button>
          ))}
          {files.length === 0 && <div className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-brand-100">No supported files found.</div>}
        </div>
      </div>
    </div>
  );
}
