import { Eye, FileText } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import { PageShell, Panel, SectionHeader } from "../components/PageShell";
import { useApiResource } from "../Hooks/useApiResource";
import {
  mapApplicationFromApi,
  mapCandidateFromApi,
  isUpcomingInterview,
  mapInterviewFromApi,
  mapJobFromApi,
  resolveResumeUrl,
} from "../utils/api";
import { useAuth } from "../context/useAuth";

export const Dashboard = () => {
  const { isCandidate, user } = useAuth();
  const { data: jobs, loading: loadingJobs, error: jobsError } = useApiResource(
    isCandidate ? null : "/jobs",
    mapJobFromApi,
  );
  const { data: candidates, loading: loadingCandidates } = useApiResource(
    isCandidate ? null : "/candidates",
    mapCandidateFromApi,
  );
  const { data: currentCandidate, loading: loadingCandidate } = useApiResource(
    isCandidate ? "/candidates/me" : null,
    mapCandidateFromApi,
    { single: true },
  );
  const { data: applications, loading: loadingApplications } = useApiResource(
    isCandidate ? null : "/applications",
    mapApplicationFromApi,
  );
  const { data: interviews, loading: loadingInterviews } = useApiResource("/interviews", mapInterviewFromApi);

  const loading =
    loadingJobs || loadingCandidates || loadingApplications || loadingInterviews;
  const openJobs = useMemo(
    () => jobs.filter((job) => job.state?.toLowerCase() === "open").length,
    [jobs],
  );
  const upcomingInterviews = useMemo(
    () => interviews.filter(isUpcomingInterview),
    [interviews],
  );
  const scheduledInterviews = upcomingInterviews.length;

  if (isCandidate) {
    return (
      <PageShell title="Dashboard">
        <SectionHeader
          eyebrow="Candidate workspace"
          title={`Welcome${user?.name ? `, ${user.name}` : ""}.`}
          description="Review your upcoming interviews and join scheduled calls from one focused place."
        />

        {(loadingInterviews || loadingCandidate) && (
          <p className="text-sm text-slate-500">Loading your workspace...</p>
        )}

        <section className="grid gap-4 md:grid-cols-2">
          <Card title="Scheduled interviews" hint="Upcoming conversations">{scheduledInterviews}</Card>
          <Card title="Total interviews" hint="Your interview history">{interviews.length}</Card>
        </section>

        <Panel>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Your CV</h2>
                <p className="text-sm text-slate-400">
                  {currentCandidate?.resume || "No CV attached yet."}
                </p>
              </div>
            </div>
            {currentCandidate?.resume && (
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                to={`/resume-viewer?url=${encodeURIComponent(resolveResumeUrl(currentCandidate.resume))}&name=${encodeURIComponent(currentCandidate.name || user?.name || "Candidate")}&email=${encodeURIComponent(currentCandidate.email || user?.email || "")}&resume=${encodeURIComponent(currentCandidate.resume)}`}
              >
                <Eye size={16} />
                View CV
              </Link>
            )}
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-4 text-lg font-semibold text-white">Your interviews</h2>
          <div className="space-y-3">
            {upcomingInterviews.slice(0, 5).map((interview) => (
              <div key={interview.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="font-medium text-white">{interview.role}</p>
                <p className="text-sm text-slate-400">{interview.type} - {interview.status}</p>
                <p className="mt-2 text-sm text-cyan-300">{interview.date} at {interview.time}</p>
              </div>
            ))}
            {!upcomingInterviews.length && <p className="text-sm text-slate-500">No interviews found.</p>}
          </div>
        </Panel>
      </PageShell>
    );
  }

  return (
    <PageShell title="Dashboard">
      <SectionHeader
        eyebrow="Hiring overview"
        title="Your recruiting command center."
        description="Track openings, candidates, applications, and interviews from one clear workspace."
      />

      {loading && <p className="text-sm text-slate-500">Loading dashboard data...</p>}
      {jobsError && <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">{jobsError}</div>}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card title="Open jobs" hint="Active hiring demand">{openJobs}</Card>
        <Card title="Candidates" hint="People in your pipeline">{candidates.length}</Card>
        <Card title="Applications" hint="Submissions to review">{applications.length}</Card>
        <Card title="Scheduled interviews" hint="Upcoming conversations">{scheduledInterviews}</Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel>
          <h2 className="mb-4 text-lg font-semibold text-white">Latest applications</h2>
          <div className="space-y-3">
            {applications.slice(0, 5).map((application) => (
              <div key={application.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="font-medium text-white">{application.candidate?.name ?? application.candidateId}</p>
                <p className="text-sm text-slate-400">{application.job?.title ?? application.jobId}</p>
                <p className="mt-2 text-sm text-cyan-300">{application.status}</p>
              </div>
            ))}
            {!applications.length && <p className="text-sm text-slate-500">No applications found.</p>}
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-4 text-lg font-semibold text-white">Upcoming interviews</h2>
          <div className="space-y-3">
            {upcomingInterviews.slice(0, 5).map((interview) => (
              <div key={interview.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <p className="font-medium text-white">{interview.role}</p>
                <p className="text-sm text-slate-400">{interview.candidate}</p>
                <p className="mt-2 text-sm text-cyan-300">{interview.date} at {interview.time}</p>
              </div>
            ))}
            {!upcomingInterviews.length && <p className="text-sm text-slate-500">No interviews found.</p>}
          </div>
        </Panel>
      </section>
    </PageShell>
  );
};
