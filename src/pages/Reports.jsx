import { PageShell, Panel, SectionHeader } from "../components/PageShell";
import { useApiResource } from "../Hooks/useApiResource";
import {
  mapApplicationFromApi,
  mapCandidateFromApi,
  isUpcomingInterview,
  mapInterviewFromApi,
  mapJobFromApi,
} from "../utils/api";
import { useAuth } from "../context/useAuth";

export const Reports = () => {
  const { isCandidate } = useAuth();
  const { data: jobs } = useApiResource("/jobs", mapJobFromApi);
  const { data: candidates } = useApiResource("/candidates", mapCandidateFromApi);
  const { data: applications } = useApiResource(isCandidate ? "/applications/me" : "/applications", mapApplicationFromApi);
  const { data: interviews } = useApiResource("/interviews", mapInterviewFromApi);

  const openJobs = jobs.filter((job) => job.state?.toLowerCase() === "open").length;
  const scheduled = interviews.filter(isUpcomingInterview).length;
  const completed = interviews.filter((interview) => interview.status === "COMPLETED").length;

  return (
    <PageShell title="Reports">
      <SectionHeader
        eyebrow="Reports"
        title="Measure hiring momentum at a glance."
        description="Monitor role coverage, candidate volume, application flow, and scheduled interviews."
      />
      <section className="grid gap-4 md:grid-cols-4">
        <Panel><p className="text-sm text-slate-500">Open jobs</p><p className="mt-3 text-4xl font-bold text-white">{openJobs}</p></Panel>
        <Panel><p className="text-sm text-slate-500">Candidates</p><p className="mt-3 text-4xl font-bold text-white">{candidates.length}</p></Panel>
        <Panel><p className="text-sm text-slate-500">Applications</p><p className="mt-3 text-4xl font-bold text-white">{applications.length}</p></Panel>
        <Panel><p className="text-sm text-slate-500">Scheduled calls</p><p className="mt-3 text-4xl font-bold text-white">{scheduled}</p></Panel>
      </section>
      <Panel>
        <h2 className="mb-4 text-lg font-semibold text-white">Interview status</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4"><p className="text-sm text-slate-500">Scheduled</p><p className="mt-2 text-2xl font-bold text-cyan-300">{scheduled}</p></div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4"><p className="text-sm text-slate-500">Completed</p><p className="mt-2 text-2xl font-bold text-emerald-300">{completed}</p></div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4"><p className="text-sm text-slate-500">Total</p><p className="mt-2 text-2xl font-bold text-white">{interviews.length}</p></div>
        </div>
      </Panel>
    </PageShell>
  );
};
