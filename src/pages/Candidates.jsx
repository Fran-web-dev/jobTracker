import { Eye, Mail, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";
import { PageShell, Panel, SectionHeader } from "../components/PageShell";
import { useApiResource } from "../Hooks/useApiResource";
import { mapCandidateFromApi, resolveAssetUrl } from "../utils/api";

export const Candidates = () => {
  const { data: candidates, loading, error } = useApiResource(
    "/candidates",
    mapCandidateFromApi,
  );

  return (
    <PageShell title="Candidates">
      <SectionHeader
        eyebrow="Candidates"
        title="Keep your candidate directory organized."
        description="Review contact details, resumes, and candidate records from one searchable workspace."
      />

      {loading && <p className="text-sm text-slate-500">Loading candidates...</p>}
      {error && <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">{error}</div>}
      {!loading && !error && candidates.length === 0 && (
        <Panel><p className="text-sm text-slate-400">No candidates found.</p></Panel>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {candidates.map((candidate) => (
          <Panel key={candidate.id}>
            <h2 className="text-lg font-semibold text-white">{candidate.name}</h2>
            <div className="mt-5 space-y-3 text-sm">
              <p className="flex items-center gap-2 text-slate-300">
                <Mail size={16} className="text-cyan-300" />
                {candidate.email || "No email"}
              </p>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                <p className="flex min-w-0 items-center gap-2 text-slate-300">
                  <ScrollText size={16} className="shrink-0 text-emerald-300" />
                  <span className="truncate">{candidate.resume || "No resume"}</span>
                </p>
                {candidate.resume && (
                  <Link
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
                    to={`/resume-viewer?url=${encodeURIComponent(resolveAssetUrl(candidate.resume))}&name=${encodeURIComponent(candidate.name)}&email=${encodeURIComponent(candidate.email)}&resume=${encodeURIComponent(candidate.resume)}`}
                  >
                    <Eye size={14} />
                    View resume
                  </Link>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Created: {candidate.createdAt ? new Date(candidate.createdAt).toLocaleString() : "Unknown"}
              </p>
            </div>
          </Panel>
        ))}
      </section>
    </PageShell>
  );
};
