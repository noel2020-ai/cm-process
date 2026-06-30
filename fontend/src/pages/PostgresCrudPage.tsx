import { useEffect, useState } from "react";

import { extractErrorMessage } from "../api/client";
import { createRecord, deleteRecord, getExportUrl, getRecords, listTables, updateRecord } from "../api/postgres";
import { DataTable } from "../components/DataTable";
import { SearchBar } from "../components/SearchBar";

export function PostgresCrudPage() {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [recordJson, setRecordJson] = useState('{\n  "name": ""\n}');
  const [message, setMessage] = useState("");

  const fetchTables = async () => {
    try {
      const nextTables = await listTables();
      setTables(nextTables);
      if (!selectedTable && nextTables.length > 0) {
        setSelectedTable(nextTables[0]);
      }
    } catch (error) {
      setMessage(extractErrorMessage(error));
    }
  };

  const fetchRows = async () => {
    if (!selectedTable) {
      return;
    }
    try {
      const data = await getRecords(selectedTable, search);
      setRows(data.rows);
      setColumns(data.columns);
    } catch (error) {
      setMessage(extractErrorMessage(error));
    }
  };

  useEffect(() => {
    void fetchTables();
  }, []);

  useEffect(() => {
    void fetchRows();
  }, [selectedTable]);

  const parseRecord = () => JSON.parse(recordJson) as Record<string, unknown>;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-panel">
        <div className="mb-4 flex flex-wrap gap-3">
          <select className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm" value={selectedTable} onChange={(event) => setSelectedTable(event.target.value)}>
            <option value="">Select table</option>
            {tables.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>
          <a className="rounded-xl border border-brand-200 px-4 py-2.5 text-sm font-medium text-brand-700" href={selectedTable ? getExportUrl(selectedTable, "csv") : "#"}>
            Export CSV
          </a>
          <a className="rounded-xl border border-brand-200 px-4 py-2.5 text-sm font-medium text-brand-700" href={selectedTable ? getExportUrl(selectedTable, "xlsx") : "#"}>
            Export Excel
          </a>
        </div>
        <SearchBar value={search} onChange={setSearch} onSearch={() => void fetchRows()} placeholder="Search table records" />
        {message && <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div>}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <DataTable columns={columns} rows={rows} />
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-panel">
          <h3 className="text-lg font-semibold text-slate-900">CRUD Workspace</h3>
          <p className="mt-2 text-sm text-slate-500">Edit JSON payloads for insert or update operations.</p>
          <textarea
            className="mt-4 h-64 w-full rounded-2xl border border-slate-200 p-4 font-mono text-sm"
            value={recordJson}
            onChange={(event) => setRecordJson(event.target.value)}
          />
          <div className="mt-4 grid gap-3">
            <button
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
              onClick={async () => {
                try {
                  await createRecord(selectedTable, parseRecord());
                  setMessage("Record created");
                  await fetchRows();
                } catch (error) {
                  setMessage(extractErrorMessage(error));
                }
              }}
              type="button"
            >
              Create Record
            </button>
            <button
              className="rounded-xl border border-brand-200 px-4 py-2.5 text-sm font-semibold text-brand-700"
              onClick={async () => {
                try {
                  const payload = parseRecord();
                  const recordId = Number(payload.id);
                  delete payload.id;
                  await updateRecord(selectedTable, recordId, payload);
                  setMessage("Record updated");
                  await fetchRows();
                } catch (error) {
                  setMessage(extractErrorMessage(error));
                }
              }}
              type="button"
            >
              Update Record
            </button>
            <button
              className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700"
              onClick={async () => {
                try {
                  const payload = parseRecord();
                  await deleteRecord(selectedTable, Number(payload.id));
                  setMessage("Record deleted");
                  await fetchRows();
                } catch (error) {
                  setMessage(extractErrorMessage(error));
                }
              }}
              type="button"
            >
              Delete Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

