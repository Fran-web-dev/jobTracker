import { PageShell, Panel, SectionHeader } from "../components/PageShell";
import { useApiResource } from "../Hooks/useApiResource";
import { mapJobFromApi } from "../utils/api";

export const Companies = () => {
  const { data: jobs, loading, error } = useApiResource("/jobs", mapJobFromApi);
  const companies = jobs.reduce((acc, job) => {
    const current = acc.get(job.company) ?? {
      name: job.company,
      jobs: [],
      location: job.location,
    };
    current.jobs.push(job);
    acc.set(job.company, current);
    return acc;
  }, new Map());

  return (
    <PageShell title="Companies">
      <SectionHeader
        eyebrow="Companies"
        title="See where your hiring demand is coming from."
        description="Companies are grouped by active roles so you can scan hiring activity quickly."
      />
      {loading && <p className="text-sm text-slate-500">Loading companies...</p>}
      {error && <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">{error}</div>}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[...companies.values()].map((company) => (
          <Panel key={company.name}>
            <h2 className="text-lg font-semibold text-white">{company.name}</h2>
            <p className="mt-1 text-sm text-cyan-300">{company.jobs.length} job(s)</p>
            <div className="mt-5 space-y-2 text-sm">
              <p className="text-slate-500">{company.location}</p>
              {company.jobs.map((job) => (
                <p key={job.id} className="text-slate-300">{job.title}</p>
              ))}
            </div>
          </Panel>
        ))}
      </section>
    </PageShell>
  );
};
