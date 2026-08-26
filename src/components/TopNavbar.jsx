import { Bell, FileUp, LogOut, Moon, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  API_BASE_URL,
  apiRequest,
  getLocalAvatar,
} from "../utils/api";

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

export const TopNavbar = ({ name, actions }) => {
  const { isCandidate, logout, user } = useAuth();
  const [failedAvatarSrc, setFailedAvatarSrc] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);
  const navigate = useNavigate();
  const displayName = user?.name ?? user?.email ?? "Frank";
  const avatar = user?.avatar || getLocalAvatar(user?.email);
  const apiOrigin = API_BASE_URL.replace("/api", "");
  const avatarSrc = (() => {
    if (!avatar) {
      return "";
    }

    if (avatar.startsWith("data:") || avatar.startsWith("http")) {
      return avatar;
    }

    if (avatar.startsWith("/")) {
      return `${apiOrigin}${avatar}`;
    }

    if (avatar.startsWith("uploads/")) {
      return `${apiOrigin}/${avatar}`;
    }

    return `${apiOrigin}/uploads/avatars/${avatar}`;
  })();
  const visibleAvatarSrc = avatarSrc === failedAvatarSrc ? "" : avatarSrc;
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const uploadResume = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !user?.email) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      window.alert("Please select a PDF, DOC, or DOCX CV.");
      return;
    }

    if (file.size > MAX_RESUME_SIZE) {
      window.alert("Please select a CV under 5 MB.");
      return;
    }

    try {
      setUploadingResume(true);
      const formData = new FormData();
      formData.append("resume", file);
      const uploaded = await apiRequest("/uploads/resume/file", {
        method: "POST",
        body: formData,
      });
      const resumeUrl = uploaded?.resumeUrl ?? uploaded?.resume;

      await apiRequest("/candidates/me", {
        method: "PUT",
        body: JSON.stringify({
          name: user.name || user.email,
          resume: resumeUrl,
        }),
      });

      window.dispatchEvent(new CustomEvent("jobtracker:resume-updated"));
      navigate(0);
    } catch (error) {
      window.alert(error.message);
    } finally {
      setUploadingResume(false);
    }
  };

  return (
    <header className="flex min-h-20 items-center justify-between gap-4 border-b border-white/10 bg-slate-950/70 px-5 backdrop-blur sm:px-8">
      <h2 className="text-lg font-semibold text-white sm:text-xl">{name}</h2>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 rounded-lg border border-white/10 bg-slate-900/80 py-2 pl-10 pr-4 text-sm text-white outline-none transition focus:border-cyan-400"
          />
        </div>

        {actions ?? (
          isCandidate ? (
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
              <FileUp size={16} />
              {uploadingResume ? "Uploading..." : "Upload CV"}
              <input
                accept=".pdf,.doc,.docx"
                className="hidden"
                disabled={uploadingResume}
                onChange={uploadResume}
                type="file"
              />
            </label>
          ) : null
        )}

        <button className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:text-white" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:text-white" aria-label="Theme">
          <Moon size={18} />
        </button>
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-cyan-300/50 bg-white text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-950/30">
          {visibleAvatarSrc ? (
            <img
              alt={displayName}
              className="h-full w-full object-contain object-center"
              onError={() => setFailedAvatarSrc(visibleAvatarSrc)}
              src={visibleAvatarSrc}
            />
          ) : (
            initials
          )}
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-rose-400/40 hover:text-rose-200"
          onClick={handleLogout}
          type="button"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};
