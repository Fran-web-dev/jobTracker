export const Card = ({ title, children, hint }) => {
  return (
    <div className="rounded-lg border border-white/10 bg-slate-950/60 p-5 text-white shadow-2xl shadow-black/20">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-400">{title}</h2>
        <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
      </div>
      <p className="mt-6 text-4xl font-bold tracking-tight text-white">{children}</p>
      {hint && <p className="mt-2 text-sm text-slate-500">{hint}</p>}
    </div>
  );
};
