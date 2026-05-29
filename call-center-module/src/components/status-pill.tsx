const TONES: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  busy: "bg-amber-50 text-amber-700 border-amber-200",
  break: "bg-violet-50 text-violet-700 border-violet-200",
  offline: "bg-slate-100 text-slate-600 border-slate-200",
  open: "bg-sky-50 text-sky-700 border-sky-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
  high: "bg-rose-50 text-rose-700 border-rose-200",
  urgent: "bg-rose-50 text-rose-700 border-rose-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
  connected: "bg-emerald-50 text-emerald-700 border-emerald-200",
  missed: "bg-rose-50 text-rose-700 border-rose-200",
  voicemail: "bg-violet-50 text-violet-700 border-violet-200",
  abandoned: "bg-slate-100 text-slate-600 border-slate-200",
};

export function StatusPill({ value }: { value: string }) {
  const tone = TONES[value.toLowerCase()] ?? "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${tone}`}>
      {value.replace(/_/g, " ")}
    </span>
  );
}
