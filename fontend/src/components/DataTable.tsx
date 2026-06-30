type Props = {
  columns: string[];
  rows: Record<string, unknown>[];
  onRowClick?: (row: Record<string, unknown>, index: number) => void;
  selectedRowIndex?: number | null;
  compact?: boolean;
};

export function DataTable({ columns, rows, onRowClick, selectedRowIndex = null, compact = false }: Props) {
  return (
    <div className="overflow-auto rounded-2xl border border-slate-200 bg-white shadow-panel">
      <table className={`min-w-full ${compact ? "text-xs" : "text-sm"}`}>
        <thead className="bg-brand-50 text-left text-slate-700">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-slate-500" colSpan={columns.length || 1}>
                No rows available.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={index}
                className={`border-t border-slate-100 ${onRowClick ? "cursor-pointer transition hover:bg-brand-50/60" : ""} ${
                  selectedRowIndex === index ? "bg-brand-50" : ""
                }`}
                onClick={() => onRowClick?.(row, index)}
              >
                {columns.map((column) => (
                  <td key={`${index}-${column}`} className={`align-top text-slate-700 ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
                    {String(row[column] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
