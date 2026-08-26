import { ArrowLeft, BriefcaseBusiness, MapPin, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageShell, Panel, SectionHeader } from "../components/PageShell";
import { useAuth } from "../context/useAuth";
import { apiRequest, mapJobFromApi } from "../utils/api";

export const JobDetails = () => {
  const { id = "" } = useParams();
  const { isCandidate } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiRequest(`/jobs/${id}`);
        setJob(mapJobFromApi(data));
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);

  const applyToJob = async () => {
    try {
      setApplying(true);
      setError("");
      await apiRequest("/applications/apply", {
        method: "POST",
        body: JSON.stringify({ jobId: id }),
      });
      setApplied(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <PageShell title="Job Details">
      <Link className="inline-flex w-fit items-center gap-2 text-sm font-medium text-cyan-300 hover:text-cyan-200" to="/jobs">
        <ArrowLeft size={16} />
        Back to jobs
      </Link>

      {loading && <p className="text-sm text-slate-500">Loading job details...</p>}
      {error && <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">{error}</div>}

      {job && (
        <>
          <SectionHeader
            eyebrow="Opportunity"
            title={job.title}
            description={job.description || "Review this opportunity and decide if it is a good fit."}
          />

          <section className="grid gap-6 xl:grid-cols-[1fr_0.45fr]">
            <Panel>
              <h2 className="text-lg font-semibold text-white">About the role</h2>
              <p className="mt-4 leading-7 text-slate-300">{job.description || "No description available."}</p>
            </Panel>

            <Panel>
              <div className="space-y-4 text-sm">
                <p className="flex items-center gap-3 text-slate-300">
                  <BriefcaseBusiness size={17} className="text-cyan-300" />
                  {job.company}
                </p>
                <p className="flex items-center gap-3 text-slate-300">
                  <MapPin size={17} className="text-cyan-300" />
                  {job.location}
                </p>
                <p className="flex items-center gap-3 text-slate-300">
                  <Wallet size={17} className="text-emerald-300" />
                  {job.salary}
                </p>
                <p className="rounded-full border border-white/10 px-3 py-2 text-center text-slate-300">
                  {job.state}
                </p>
              </div>

              {isCandidate && (
                <button
                  className="mt-6 w-full rounded-lg bg-cyan-400 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={applying || applied || job.state?.toLowerCase() !== "open"}
                  onClick={applyToJob}
                  type="button"
                >
                  {applied ? "Applied" : applying ? "Applying..." : "Apply now"}
                </button>
              )}
            </Panel>
          </section>
        </>
      )}
    </PageShell>
  );
};
