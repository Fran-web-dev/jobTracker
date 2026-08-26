import { PageShell, Panel, SectionHeader } from "../components/PageShell";

export const Settings = () => (
  <PageShell title="Settings">
    <SectionHeader eyebrow="Workspace" title="Configure your recruiting workflow." description="Tune notifications, defaults, and workspace preferences for your hiring process." />
    <section className="grid gap-4 lg:grid-cols-2">
      <Panel>
        <h2 className="text-lg font-semibold text-white">Notifications</h2>
        <div className="mt-5 space-y-4 text-sm">
          <label className="flex items-center justify-between gap-4"><span className="text-slate-300">Interview reminders</span><input type="checkbox" defaultChecked className="h-5 w-5 accent-cyan-400" /></label>
          <label className="flex items-center justify-between gap-4"><span className="text-slate-300">Daily pipeline digest</span><input type="checkbox" defaultChecked className="h-5 w-5 accent-cyan-400" /></label>
        </div>
      </Panel>
      <Panel>
        <h2 className="text-lg font-semibold text-white">Defaults</h2>
        <div className="mt-5 grid gap-4">
          <label className="text-sm text-slate-400">Default stage<select className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-white"><option>Review</option><option>Screening</option><option>Interview</option></select></label>
          <label className="text-sm text-slate-400">Weekly application goal<input className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-white" defaultValue="75" /></label>
        </div>
      </Panel>
    </section>
  </PageShell>
);
