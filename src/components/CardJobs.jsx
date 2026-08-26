export const CardJobs = ({
  actionLabel = "View Details",
  company,
  description,
  disabled = false,
  location,
  onAction,
  onSecondaryAction,
  salary,
  secondaryActionLabel,
  secondaryDisabled = false,
  state,
  title,
}) => {
  const isOpen = state?.toLowerCase() === "open";

  return (
    <li className="w-full rounded-lg border border-white/10 bg-slate-950/60 p-6 text-slate-100 shadow-xl shadow-black/10 transition hover:border-cyan-400/40">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-cyan-300">{company}</p>
        </div>
        <span className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs ${isOpen ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-slate-500/20 bg-slate-500/10 text-slate-300"}`}>
          {state}
        </span>
      </div>

      <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-slate-400">{description}</p>

      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-slate-500">Location</span>
          <span className="font-medium text-slate-200">{location}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Salary</span>
          <span className="font-semibold text-emerald-300">{salary}</span>
        </div>
      </div>

      <div className={secondaryActionLabel ? "mt-6 grid grid-cols-2 gap-3" : "mt-6"}>
        <button
          className="w-full rounded-lg bg-cyan-400 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
        {secondaryActionLabel && (
          <button
            className="w-full rounded-lg border border-white/10 py-2.5 font-semibold text-slate-200 transition hover:border-cyan-400/50 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={secondaryDisabled}
            onClick={onSecondaryAction}
            type="button"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </li>
  );
};
