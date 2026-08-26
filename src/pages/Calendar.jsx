import { Link } from "react-router-dom";
import { PageShell, Panel, SectionHeader } from "../components/PageShell";
import { useApiResource } from "../Hooks/useApiResource";
import { isUpcomingInterview, mapInterviewFromApi } from "../utils/api";

export const Calendar = () => {
  const { data: interviews, loading, error } = useApiResource(
    "/interviews",
    mapInterviewFromApi,
  );
  const scheduledInterviews = interviews.filter(isUpcomingInterview);

  return (
    <PageShell title="Calendar">
      <SectionHeader
        eyebrow="Schedule"
        title="Keep every hiring conversation on track."
        description="See upcoming interviews with timing, format, candidate, role, and interviewer context."
      />

      {error && (
        <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading interviews...</p>
      ) : scheduledInterviews.length === 0 && !error ? (
        <Panel>
          <p className="text-sm text-slate-400">No interviews found.</p>
        </Panel>
      ) : (
        <section className="grid gap-4 lg:grid-cols-3">
          {scheduledInterviews.map((interview) => (
            <Panel key={interview.id}>
              <p className="text-sm font-semibold uppercase tracking-wider text-cyan-300">{interview.date || "No date"}</p>
              <h2 className="mt-3 text-xl font-semibold text-white">{interview.time || "No time"}</h2>
              <p className="mt-4 font-medium text-white">{interview.role}</p>
              <p className="text-sm text-slate-400">{interview.type} interview for {interview.candidate}</p>
              <p className="mt-4 text-sm text-slate-500">With {interview.interviewer}</p>
              <p className="mt-2 text-sm text-slate-500">{interview.status}</p>
              <Link
                className="mt-5 inline-flex rounded-lg bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                to={`/call/${interview.id}`}
              >
                Join call
              </Link>
            </Panel>
          ))}
        </section>
      )}
    </PageShell>
  );
};
