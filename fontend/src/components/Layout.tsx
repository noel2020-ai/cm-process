import { useState } from "react";
import type { PropsWithChildren } from "react";

type LayoutProps = PropsWithChildren<{
  sidebar?: React.ReactNode;
}>;

export function Layout({ children, sidebar }: LayoutProps) {
  const [workspaceCollapsed, setWorkspaceCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(154,217,95,0.18),_transparent_28%),linear-gradient(180deg,#f8fcf8_0%,#f8fafc_100%)]">
      <div className="flex min-h-screen w-full gap-6 px-4 py-6 lg:px-6">
        <aside
          className={`hidden flex-col rounded-3xl bg-brand-900 p-5 text-white shadow-panel transition-all duration-300 lg:flex ${
            workspaceCollapsed ? "w-20" : "w-72"
          }`}
        >
          <div className={`mb-6 flex items-start ${workspaceCollapsed ? "justify-center" : "justify-between gap-3"}`}>
            <div className={workspaceCollapsed ? "hidden" : "block"}>
              <div className="text-xs uppercase tracking-[0.3em] text-brand-200">Workspace</div>
              <h1 className="mt-2 text-2xl font-semibold">Master File Review</h1>
            </div>
            <button
              aria-label={workspaceCollapsed ? "Expand workspace" : "Collapse workspace"}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/15"
              onClick={() => setWorkspaceCollapsed((value) => !value)}
              title={workspaceCollapsed ? "Expand workspace" : "Collapse workspace"}
              type="button"
            >
              <span className="text-lg leading-none">{workspaceCollapsed ? ">" : "<"}</span>
            </button>
          </div>
          <div className={workspaceCollapsed ? "hidden" : "min-h-0 flex-1 overflow-hidden"}>
            {sidebar}
          </div>
          {workspaceCollapsed && (
            <div className="flex flex-1 items-start justify-center pt-2">
              <div className="-rotate-180 text-xs uppercase tracking-[0.3em] text-brand-200 [writing-mode:vertical-rl]">
                Workspace
              </div>
            </div>
          )}
        </aside>
        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
