import clsx from "clsx";

const variants: Record<string, string> = {
  success: "bg-emerald-100 text-emerald-700",
  error: "bg-rose-100 text-rose-700",
  warning: "bg-amber-100 text-amber-700",
  not_configured: "bg-slate-200 text-slate-700",
  default: "bg-slate-100 text-slate-700",
};

type Props = {
  status: string;
};

export function StatusBadge({ status }: Props) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        variants[status] ?? variants.default,
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

