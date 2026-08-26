import { PageShell, Panel, SectionHeader } from "../components/PageShell";
import { pipelineStages } from "../data/mockData";

export const Pipeline = () => (
  <PageShell title="Pipeline">
    <SectionHeader eyebrow="Pipeline" title="Spot bottlenecks before they slow hiring." description="Stage counts show how candidates are moving from sourcing to offer." />
    <section className="grid gap-4 md:grid-cols-5">
      {pipelineStages.map((stage) => (
        <Panel key={stage.name} className="min-h-52">
          <div className={`mb-4 h-2 rounded-full ${stage.color}`} />
          <h2 className="font-semibold text-white">{stage.name}</h2>
          <p className="mt-2 text-4xl font-bold text-white">{stage.count}</p>
          <p className="mt-2 text-sm text-slate-500">Candidates</p>
        </Panel>
      ))}
    </section>
  </PageShell>
);
