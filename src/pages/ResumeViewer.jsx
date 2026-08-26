import { ArrowLeft, ExternalLink, FileText } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageShell, Panel, SectionHeader } from "../components/PageShell";
import { isSafeDocumentUrl } from "../utils/api";

export const ResumeViewer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resumeUrl = searchParams.get("url") || "";
  const candidateName = searchParams.get("name") || "Candidate";
  const resumeName = searchParams.get("resume") || "";
  const viewerUrl = isSafeDocumentUrl(resumeUrl) ? resumeUrl : "";
  const isPdf = /\.pdf($|\?)/i.test(viewerUrl);

  return (
    <PageShell
      title="CV viewer"
      actions={(
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-200"
          onClick={() => navigate(-1)}
          type="button"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      )}
    >
      <SectionHeader
        eyebrow="Candidate profile"
        title={`${candidateName}'s CV`}
        description="Review the candidate document without leaving your workspace."
      />

      {!viewerUrl ? (
        <Panel>
          <div className="flex items-center gap-3 text-slate-300">
            <FileText className="text-cyan-300" size={22} />
            <p>No CV is available for this candidate.</p>
          </div>
        </Panel>
      ) : (
        <Panel className="overflow-hidden p-0">
          <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300">
                <FileText size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white">{candidateName}</p>
                <p className="truncate text-sm text-slate-400">{resumeName || viewerUrl}</p>
              </div>
            </div>
            <a
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-200"
              href={viewerUrl}
              rel="noreferrer"
              target="_blank"
            >
              <ExternalLink size={16} />
              Open file
            </a>
          </div>
          {isPdf ? (
            <iframe
              className="h-[76vh] w-full border-0 bg-white"
              sandbox="allow-downloads allow-same-origin"
              src={viewerUrl}
              title={`${candidateName} CV`}
            />
          ) : (
            <div className="flex min-h-[42vh] flex-col items-center justify-center gap-4 p-8 text-center">
              <FileText className="text-cyan-300" size={40} />
              <div>
                <h2 className="text-lg font-semibold text-white">Preview not available</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                  This CV format cannot be previewed in the browser. Open the file to read it.
                </p>
              </div>
              <a
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                href={viewerUrl}
                rel="noreferrer"
                target="_blank"
              >
                <ExternalLink size={16} />
                Open file
              </a>
            </div>
          )}
        </Panel>
      )}

      {!viewerUrl && (
        <Link className="text-sm font-semibold text-cyan-300 hover:text-cyan-200" to="/">
          Return to dashboard
        </Link>
      )}
    </PageShell>
  );
};
