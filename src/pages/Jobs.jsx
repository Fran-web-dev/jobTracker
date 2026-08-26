import { CardJobs } from "../components/CardJobs";
import { PageShell, Panel, SectionHeader } from "../components/PageShell";
import { useAuth } from "../context/useAuth";
import { useApiResource } from "../Hooks/useApiResource";
import { apiRequest, mapJobFromApi } from "../utils/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Jobs = () => {
  const { data: jobs, loading, error } = useApiResource("/jobs", mapJobFromApi);
  const { isCandidate } = useAuth();
  const navigate = useNavigate();
  const [applyingJobId, setApplyingJobId] = useState("");
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyError, setApplyError] = useState("");

  const applyToJob = async (jobId) => {
    try {
      setApplyingJobId(jobId);
      setApplyError("");
      setApplyMessage("");
      await apiRequest("/applications/apply", {
        method: "POST",
        body: JSON.stringify({ jobId }),
      });
      setAppliedJobIds((current) => [...new Set([...current, jobId])]);
      setApplyMessage("Application submitted.");
    } catch (requestError) {
      setApplyError(requestError.message);
    } finally {
      setApplyingJobId("");
    }
  };

  return (
    <PageShell title="Jobs">
      <SectionHeader
        eyebrow="Open roles"
        title={isCandidate ? "Find your next opportunity." : "Manage job openings and hiring demand."}
        description={
          isCandidate
            ? "Browse open roles and apply directly from your candidate workspace."
            : "Review active roles, locations, salary ranges, and role details in one place."
        }
      />

      {loading && <p className="text-sm text-slate-500">Loading jobs...</p>}
      {error && <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">{error}</div>}
      {applyMessage && <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{applyMessage}</div>}
      {applyError && <div className="rounded-lg border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{applyError}</div>}
      {!loading && !error && jobs.length === 0 && (
        <Panel><p className="text-sm text-slate-400">No jobs found.</p></Panel>
      )}

      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job) => (
          <CardJobs
            key={job.id}
            {...job}
            actionLabel={
              isCandidate
                ? "View details"
                : "View Details"
            }
            onAction={() => navigate(`/jobs/${job.id}`)}
            secondaryActionLabel={
              isCandidate
                ? appliedJobIds.includes(job.id)
                  ? "Applied"
                  : "Apply now"
                : undefined
            }
            secondaryDisabled={
              isCandidate &&
              (applyingJobId === job.id ||
                appliedJobIds.includes(job.id) ||
                job.state?.toLowerCase() !== "open")
            }
            onSecondaryAction={
              isCandidate
                ? () => applyToJob(job.id)
                : undefined
            }
          />
        ))}
      </ul>
    </PageShell>
  );
};
