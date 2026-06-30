import { useEffect, useState } from "react";

import { extractErrorMessage } from "../api/client";
import { getResearchResults, searchResearch } from "../api/research";
import { SearchBar } from "../components/SearchBar";
import { StatusBadge } from "../components/StatusBadge";
import type { ResearchResult } from "../types";

export function ResearchSearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshResults = async () => {
    try {
      setResults(await getResearchResults());
    } catch (error) {
      setMessage(extractErrorMessage(error));
    }
  };

  useEffect(() => {
    void refreshResults();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-panel">
        <h3 className="text-lg font-semibold text-slate-900">Research Search</h3>
        <p className="mt-2 text-sm text-slate-500">
          Uses approved APIs where configured. The secondary source remains a placeholder until credentials are supplied.
        </p>
        <div className="mt-4">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSearch={async () => {
              setLoading(true);
              try {
                setResults(await searchResearch(query, 5));
                setMessage("");
              } catch (error) {
                setMessage(extractErrorMessage(error));
              } finally {
                setLoading(false);
              }
            }}
            placeholder="Enter company or topic criteria"
            loading={loading}
          />
        </div>
        {message && <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div>}
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={`${result.source}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">{result.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{result.snippet}</p>
                {result.url && (
                  <a className="mt-3 inline-block text-sm font-medium text-brand-700 hover:text-brand-800" href={result.url} rel="noreferrer" target="_blank">
                    {result.url}
                  </a>
                )}
              </div>
              <div className="space-y-2 text-right">
                <StatusBadge status={result.status} />
                <div className="text-xs uppercase tracking-wide text-slate-500">{result.source}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

