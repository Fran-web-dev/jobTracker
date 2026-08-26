import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PageShell, Panel, SectionHeader } from "../components/PageShell";
import { apiRequest, buildMeetingUrl } from "../utils/api";

export const MeetingRoom = () => {
  const { meetingId = "" } = useParams();
  const navigate = useNavigate();
  const [meetingUrl, setMeetingUrl] = useState("");
  const [roomName, setRoomName] = useState("");
  const [interview, setInterview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    const loadJoinUrl = async () => {
      try {
        setLoading(true);
        setError("");
        const [interviewData, joinData] = await Promise.all([
          apiRequest(`/interviews/${meetingId}`),
          apiRequest(`/interviews/${meetingId}/join`),
        ]);
        setInterview(interviewData);
        setMeetingUrl(buildMeetingUrl(joinData));
        setRoomName(
          joinData?.roomName ??
            interviewData?.roomName ??
            joinData?.roomUrl?.split("/").pop() ??
            "",
        );
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadJoinUrl();
  }, [meetingId]);

  const finishInterview = async () => {
    try {
      setFinishing(true);
      setError("");
      await apiRequest(`/interviews/${meetingId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: interview?.title,
          startTime: interview?.startTime,
          duration: interview?.duration,
          type: interview?.type,
          status: "COMPLETED",
        }),
      });
      navigate("/interviews", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setFinishing(false);
    }
  };

  return (
    <PageShell
      title="Live Call"
      actions={
        <a
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            meetingUrl
              ? "bg-cyan-400 text-slate-950 hover:bg-cyan-300"
              : "bg-slate-800 text-slate-500"
          }`}
          href={meetingUrl}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!meetingUrl}
        >
          <ExternalLink size={16} />
          Open
        </a>
      }
    >
      <SectionHeader
        eyebrow="Online interview"
        title="Join the video call from inside Job Tracker."
        description="Allow camera and microphone permissions when the meeting room asks for them."
      />

      <Panel className="p-0">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 p-4">
          <div>
            <p className="text-sm text-slate-500">Meeting room</p>
            <p className="font-medium text-white">{roomName || meetingId}</p>
          </div>
          <Link className="text-sm font-medium text-cyan-300 hover:text-cyan-200" to="/interviews">
            Back to interviews
          </Link>
        </div>
        {error && (
          <div className="m-4 rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            {error}
          </div>
        )}
        {meetingUrl ? (
          <div className="relative">
            <iframe
              title="Video meeting"
              src={meetingUrl}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              className="h-[72vh] w-full rounded-b-lg border-0 bg-slate-900"
            />
            <div className="absolute bottom-4 right-4">
              <div className="flex gap-3">
                <button
                  className="rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={finishing}
                  onClick={finishInterview}
                  type="button"
                >
                  {finishing ? "Finishing..." : "Finish interview"}
                </button>
                <a
                  className="rounded-lg bg-slate-950/80 px-3 py-2 text-sm font-semibold text-cyan-200 backdrop-blur transition hover:bg-slate-900"
                  href={meetingUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open in browser
                </a>
              </div>
            </div>
          </div>
        ) : !loading && error ? (
          <div className="flex h-[72vh] flex-col items-center justify-center gap-4 text-center">
            <p className="max-w-md text-sm text-slate-400">
              We could not prepare this meeting room. Please go back and try joining again.
            </p>
            <Link className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300" to="/interviews">
              Back to interviews
            </Link>
          </div>
        ) : (
          <div className="flex h-[72vh] items-center justify-center text-sm text-slate-500">
            Preparing your meeting room...
          </div>
        )}
      </Panel>
    </PageShell>
  );
};
