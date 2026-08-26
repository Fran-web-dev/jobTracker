import { PageShell, Panel, SectionHeader } from "../components/PageShell";
import { useApiResource } from "../Hooks/useApiResource";
import { mapCandidateFromApi } from "../utils/api";

export const TalentPool = () => {
  const { data: candidates, loading, error } = useApiResource(
    "/candidates",
    mapCandidateFromApi,
  );

  return (
    <PageShell title="Talent Pool">
      <SectionHeader
        eyebrow="Talent pool"
        title="Keep future-fit candidates close."
        description="Maintain a warm list of candidates who may be right for upcoming roles."
      />
      {loading && <p className="text-sm text-slate-500">Loading talent pool...</p>}
      {error && <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">{error}</div>}
      <section className="grid gap-4 md:grid-cols-2">
        {candidates.map((candidate) => (
          <Panel key={candidate.id}>
            <h2 className="text-lg font-semibold text-white">{candidate.name}</h2>
            <p className="mt-1 text-sm text-cyan-300">{candidate.email}</p>
            <p className="mt-4 text-sm text-slate-400">{candidate.resume || "No resume attached"}</p>
          </Panel>
        ))}
      </section>
    </PageShell>
  );
};
