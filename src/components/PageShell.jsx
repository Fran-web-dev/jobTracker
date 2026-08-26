import { SideBar } from "./SideBar";
import { TopNavbar } from "./TopNavbar";

export const PageShell = ({ title, children, actions }) => (
  <div className="flex min-h-screen bg-transparent text-slate-100">
    <SideBar />
    <div className="flex min-w-0 flex-1 flex-col">
      <TopNavbar name={title} actions={actions} />
      <main className="flex-1 px-5 py-6 sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">{children}</div>
      </main>
    </div>
  </div>
);

export const SectionHeader = ({ eyebrow, title, description }) => (
  <section className="flex flex-col gap-2">
    {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">{eyebrow}</p>}
    <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
    {description && <p className="max-w-2xl text-sm leading-6 text-slate-400">{description}</p>}
  </section>
);

export const Panel = ({ children, className = "" }) => (
  <section className={`rounded-lg border border-white/10 bg-slate-950/60 p-5 shadow-2xl shadow-black/20 ${className}`}>
    {children}
  </section>
);
