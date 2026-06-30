import { useEffect, useState } from "react";

import { extractErrorMessage } from "../api/client";
import { getSqlServerConnection, readSqlServerObject, runReadonlyQuery } from "../api/sqlserver";
import { DataTable } from "../components/DataTable";

export function SqlServerReadOnlyPage() {
  const [connection, setConnection] = useState<{ host: string; database: string; port: number; use_trusted_connection: boolean } | null>(null);
  const [query, setQuery] = useState("SELECT TOP 25 * FROM [dbo].[sample_table]");
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [message, setMessage] = useState("");
  const [objectName, setObjectName] = useState("sample_table");
  const [schemaName, setSchemaName] = useState("dbo");

  useEffect(() => {
    void (async () => {
      try {
        setConnection(await getSqlServerConnection());
      } catch (error) {
        setMessage(extractErrorMessage(error));
      }
    })();
  }, []);

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-panel">
        <h3 className="text-lg font-semibold text-slate-900">Read-Only Connection</h3>
        {connection && (
          <p className="mt-2 text-sm text-slate-500">
            Host: {connection.host}:{connection.port} | Database: {connection.database} | Trusted Connection:{" "}
            {connection.use_trusted_connection ? "Enabled" : "Disabled"}
          </p>
        )}
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm" value={schemaName} onChange={(event) => setSchemaName(event.target.value)} placeholder="Schema" />
          <input className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm" value={objectName} onChange={(event) => setObjectName(event.target.value)} placeholder="Table or view" />
          <button
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
            onClick={async () => {
              try {
                setRows(await readSqlServerObject({ schema_name: schemaName, object_name: objectName, object_type: "table", limit: 100 }));
                setMessage("");
              } catch (error) {
                setMessage(extractErrorMessage(error));
              }
            }}
            type="button"
          >
            Read Object
          </button>
        </div>
        <textarea
          className="mt-4 h-36 w-full rounded-2xl border border-slate-200 p-4 font-mono text-sm"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button
          className="mt-4 rounded-xl border border-brand-200 px-4 py-2.5 text-sm font-semibold text-brand-700"
          onClick={async () => {
            try {
              setRows(await runReadonlyQuery(query));
              setMessage("");
            } catch (error) {
              setMessage(extractErrorMessage(error));
            }
          }}
          type="button"
        >
          Run SELECT Query
        </button>
        {message && <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div>}
      </div>
      <DataTable columns={columns} rows={rows} />
    </div>
  );
}

