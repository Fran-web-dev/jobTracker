import { PageShell, Panel, SectionHeader } from "../components/PageShell";
import { useApiResource } from "../Hooks/useApiResource";
import { useAuth } from "../context/useAuth";
import { mapApplicationFromApi } from "../utils/api";

export const Applications = () => {
  const { isCandidate } = useAuth();
  const { data: applications, loading, error } = useApiResource(
    isCandidate ? "/applications/me" : "/applications",
    mapApplicationFromApi,
  );

  return (
    <PageShell title="Applications">
      <SectionHeader
        eyebrow="Applications"
        title="Prioritize every candidate in progress."
        description="Review each application with its candidate, role, status, and timing in one focused queue."
      />

      {loading && <p className="text-sm text-slate-500">Loading applications...</p>}
      {error && <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">{error}</div>}
      {!loading && !error && applications.length === 0 && (
        <Panel><p className="text-sm text-slate-400">No applications found.</p></Panel>
      )}

      {applications.length > 0 && (
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="pb-4">Candidate</th>
                  <th className="pb-4">Email</th>
                  <th className="pb-4">Job</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td className="py-4 font-medium text-white">{application.candidate?.name ?? application.candidateId}</td>
                    <td className="py-4 text-slate-400">{application.candidate?.email ?? "No email"}</td>
                    <td className="py-4 text-slate-300">{application.job?.title ?? application.jobId}</td>
                    <td className="py-4 text-cyan-300">{application.status}</td>
                    <td className="py-4 text-slate-500">{application.createdAt ? new Date(application.createdAt).toLocaleString() : "Unknown"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </PageShell>
  );
};
