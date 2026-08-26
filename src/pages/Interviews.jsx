import { Copy, ExternalLink, RefreshCw, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageShell, Panel, SectionHeader } from "../components/PageShell";
import { apiRequest, buildMeetingUrl, isUpcomingInterview, mapCandidateFromApi, mapInterviewFromApi, mapJobFromApi } from "../utils/api";
import { useAuth } from "../context/useAuth";

const initialForm = {
  title: "Entrevista tecnica",
  candidateId: "",
  jobId: "",
  date: "",
  time: "",
  duration: "45",
  type: "VIDEO",
};

export const Interviews = () => {
  const { isAuthenticated, isCandidate, loadingUser } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [apiMode, setApiMode] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      if (loadingUser) {
        return;
      }

      if (!isAuthenticated) {
        setLoading(false);
        setApiMode(false);
        setError("Log in to view your interview schedule.");
        return;
      }

      try {
        setLoading(true);
        setError("");
        const [interviewsData, candidatesData, jobsData] = isCandidate
          ? [await apiRequest("/interviews"), [], []]
          : await Promise.all([
              apiRequest("/interviews"),
              apiRequest("/candidates"),
              apiRequest("/jobs"),
            ]);

        const nextCandidates = (Array.isArray(candidatesData) ? candidatesData : []).map(
          mapCandidateFromApi,
        );
        const nextJobs = (Array.isArray(jobsData) ? jobsData : []).map(mapJobFromApi);

        setInterviews(
          (Array.isArray(interviewsData) ? interviewsData : [])
            .map(mapInterviewFromApi)
            .filter(isUpcomingInterview),
        );
        setCandidates(nextCandidates);
        setJobs(nextJobs);
        setForm((current) => ({
          ...current,
          candidateId: current.candidateId || nextCandidates[0]?.id || "",
          jobId: current.jobId || nextJobs[0]?.id || "",
        }));
        setApiMode(true);
      } catch (requestError) {
        setInterviews([]);
        setCandidates([]);
        setJobs([]);
        setApiMode(false);
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, isCandidate, loadingUser, refreshKey]);

  const selectedJob = useMemo(
    () => jobs.find((job) => String(job.id) === String(form.jobId)),
    [form.jobId, jobs],
  );

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const scheduleMeeting = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setError("Missing session. Log in first.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const createdInterview = await apiRequest("/interviews", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          candidateId: form.candidateId,
          jobId: form.jobId,
          startTime: new Date(`${form.date}T${form.time}`).toISOString(),
          duration: Number(form.duration),
          type: form.type,
        }),
      });

      setInterviews((current) => [mapInterviewFromApi(createdInterview), ...current]);
      setApiMode(true);
      setForm((current) => ({
        ...initialForm,
        candidateId: current.candidateId,
        jobId: current.jobId,
      }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const getJoinUrl = async (meeting) => {
    if (!apiMode || !isAuthenticated) {
      throw new Error("Save the interview before joining the call.");
    }

    const data = await apiRequest(`/interviews/${meeting.id}/join`);
    return buildMeetingUrl(data);
  };

  const copyMeetingUrl = async (meeting) => {
    try {
      const joinUrl = await getJoinUrl(meeting);
      await navigator.clipboard.writeText(joinUrl);
      setCopiedId(meeting.id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const openMeeting = async (meeting) => {
    try {
      const joinUrl = await getJoinUrl(meeting);
      window.open(joinUrl, "_blank", "noopener,noreferrer");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const canSchedule =
    isAuthenticated &&
    Boolean(form.candidateId) &&
    Boolean(form.jobId) &&
    candidates.length > 0 &&
    jobs.length > 0;

  return (
    <PageShell
      title="Interviews"
      actions={
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-cyan-200"
          onClick={() => setRefreshKey((key) => key + 1)}
          type="button"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      }
    >
      <SectionHeader
        eyebrow="Video calls"
        title={isCandidate ? "Your interview schedule." : "Schedule interviews and join calls."}
        description={
          isCandidate
            ? "Review your scheduled interviews and join video calls when it is time."
            : "Plan video, phone, or onsite conversations connected to the right candidate and role."
        }
      />

      {error && (
        <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          {error}
        </div>
      )}

      <section className={`grid gap-6 ${isCandidate ? "" : "xl:grid-cols-[0.9fr_1.1fr]"}`}>
        {!isCandidate && (
        <Panel>
          <h2 className="text-lg font-semibold text-white">Schedule interview</h2>
          <form className="mt-5 grid gap-4" onSubmit={scheduleMeeting}>
            <label className="text-sm text-slate-400">
              Title
              <input
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-white outline-none focus:border-cyan-400"
                required
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
              />
            </label>

            <label className="text-sm text-slate-400">
              Candidate
              <select
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-white outline-none focus:border-cyan-400"
                required
                value={form.candidateId}
                onChange={(event) => updateField("candidateId", event.target.value)}
              >
                {!candidates.length && (
                  <option value="">No candidates available</option>
                )}
                {candidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-slate-400">
              Job
              <select
                className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-white outline-none focus:border-cyan-400"
                required
                value={form.jobId}
                onChange={(event) => updateField("jobId", event.target.value)}
              >
                {!jobs.length && <option value="">No jobs available</option>}
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-400">
                Date
                <input className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-white outline-none focus:border-cyan-400" required type="date" value={form.date} onChange={(event) => updateField("date", event.target.value)} />
              </label>
              <label className="text-sm text-slate-400">
                Time
                <input className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-white outline-none focus:border-cyan-400" required type="time" value={form.time} onChange={(event) => updateField("time", event.target.value)} />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-400">
                Type
                <select className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-white outline-none focus:border-cyan-400" value={form.type} onChange={(event) => updateField("type", event.target.value)}>
                  <option value="VIDEO">VIDEO</option>
                  <option value="PHONE">PHONE</option>
                  <option value="ONSITE">ONSITE</option>
                </select>
              </label>
              <label className="text-sm text-slate-400">
                Duration
                <select className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900 p-3 text-white outline-none focus:border-cyan-400" value={form.duration} onChange={(event) => updateField("duration", event.target.value)}>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                </select>
              </label>
            </div>

            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60" disabled={saving || !canSchedule}>
              <Video size={18} />
              {saving ? "Scheduling..." : "Schedule interview"}
            </button>
          </form>
        </Panel>
        )}

        <section className="grid gap-4">
          {loading && <p className="text-sm text-slate-500">Loading interviews...</p>}
          {interviews.map((meeting) => (
            <Panel key={meeting.id}>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">{meeting.type}</span>
                    <span className="text-sm text-slate-500">{meeting.duration}</span>
                    {meeting.status && <span className="text-sm text-slate-500">{meeting.status}</span>}
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-white">{meeting.role}</h2>
                  <p className="text-sm text-slate-400">{meeting.candidate}</p>
                  <p className="mt-4 text-sm text-slate-300">
                    {meeting.date} at {meeting.time}
                  </p>
                  {selectedJob && (
                    <p className="mt-2 text-xs text-slate-500">
                      Selected job: {selectedJob.title}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {!isCandidate && (
                    <>
                      <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-cyan-200" type="button" onClick={() => copyMeetingUrl(meeting)}>
                        <Copy size={16} />
                        {copiedId === meeting.id ? "Copied" : "Copy link"}
                      </button>
                      <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/50 hover:text-cyan-200" type="button" onClick={() => openMeeting(meeting)}>
                        <ExternalLink size={16} />
                        New tab
                      </button>
                    </>
                  )}
                  <Link className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${apiMode ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300" : "pointer-events-none bg-slate-800 text-slate-500"}`} to={`/call/${meeting.id}`}>
                    <Video size={16} />
                    Join call
                  </Link>
                </div>
              </div>
            </Panel>
          ))}
        </section>
      </section>
    </PageShell>
  );
};
