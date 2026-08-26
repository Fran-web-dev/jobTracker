import { BriefcaseBusiness, FileText, ImagePlus, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { API_BASE_URL, apiRequest, saveLocalAvatar } from "../utils/api";

const initialForm = {
  avatar: "",
  name: "",
  email: "",
  password: "",
  resume: "",
  role: "recruiter",
};

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;
const MAX_RESUME_SIZE = 5 * 1024 * 1024;

export const Auth = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [avatarPath, setAvatarPath] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [error, setError] = useState("");
  const [registeredEmails, setRegisteredEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  const isRegister = mode === "register";

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === "email" || field === "name") {
      setError("");
    }
  };

  const resolveAvatarSrc = (avatar) => {
    if (!avatar) {
      return "";
    }

    if (avatar.startsWith("data:") || avatar.startsWith("http")) {
      return avatar;
    }

    return `${API_BASE_URL.replace("/api", "")}${avatar}`;
  };

  const selectAvatar = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setError("Please select an image under 2 MB.");
      return;
    }

    const uploadAvatar = async () => {
      try {
        setUploadingAvatar(true);
        setError("");
        setAvatarPreview(URL.createObjectURL(file));

        const formData = new FormData();
        formData.append("avatar", file);

        const response = await fetch(`${API_BASE_URL}/uploads/avatar/file`, {
          method: "POST",
          body: formData,
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.message ?? "Avatar upload failed.");
        }

        const uploaded = payload?.data ?? payload;
        const nextAvatar = uploaded?.avatarUrl ?? uploaded?.avatar;

        if (!nextAvatar) {
          throw new Error("Avatar upload did not return an image path.");
        }

        updateField("avatar", nextAvatar);
        saveLocalAvatar(form.email, nextAvatar);
        setAvatarPreview(uploaded?.fullUrl ?? resolveAvatarSrc(nextAvatar));
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setUploadingAvatar(false);
      }
    };

    uploadAvatar();
  };

  const selectResume = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a PDF, DOC, or DOCX resume.");
      return;
    }

    if (file.size > MAX_RESUME_SIZE) {
      setError("Please select a CV under 5 MB.");
      return;
    }

    setResumeName(file.name);
    updateField("resume", file.name);
    setResumeFile(file);
    setError("");
  };

  const importAvatarFromPath = async () => {
    if (!avatarPath.trim()) {
      setError("Enter an image path before importing.");
      return;
    }

    try {
      setUploadingAvatar(true);
      setError("");
      const uploaded = await apiRequest("/uploads/avatar", {
        method: "POST",
        body: JSON.stringify({ sourcePath: avatarPath.trim() }),
      });
      const nextAvatar = uploaded?.avatarUrl ?? uploaded?.avatar ?? uploaded?.fullUrl;

      if (!nextAvatar) {
        throw new Error("Avatar upload did not return an image path.");
      }

      updateField("avatar", nextAvatar);
      saveLocalAvatar(form.email, nextAvatar);
      setAvatarPreview(uploaded?.fullUrl ?? resolveAvatarSrc(nextAvatar));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const submitAuth = async (event) => {
    event.preventDefault();
    const email = form.email.trim().toLowerCase();
    const shouldClearRegisterForm = isRegister;

    try {
      setLoading(true);
      setError("");

      if (isRegister) {
        if (registeredEmails.includes(email)) {
          setError("This account already exists. Please log in instead.");
          return;
        }

        await register({ ...form, resumeFile });
        setForm(initialForm);
        setAvatarPath("");
        setAvatarPreview("");
        setResumeName("");
        setResumeFile(null);
      } else {
        await login({ email: form.email, password: form.password });
      }

      navigate("/", { replace: true });
    } catch (requestError) {
      const message = requestError.message?.toLowerCase() ?? "";
      const isDuplicateUser =
        isRegister &&
        (requestError.status === 409 ||
          message.includes("already") ||
          message.includes("exists") ||
          message.includes("duplicate") ||
          message.includes("registrado"));

      if (isDuplicateUser) {
        setRegisteredEmails((current) => [...new Set([...current, email])]);
        setError("This account already exists. Please log in instead.");
      } else {
        setError(requestError.message);
      }
    } finally {
      if (shouldClearRegisterForm) {
        setForm(initialForm);
        setAvatarPath("");
        setAvatarPreview("");
        setResumeName("");
        setResumeFile(null);
      }
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-5 py-10 text-slate-950">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-200/80 lg:grid-cols-[1fr_440px]">
        <div className="flex flex-col justify-center bg-[#0b1220] p-8 text-white sm:p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400 text-slate-950">
              <BriefcaseBusiness size={23} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Job Tracker</h1>
              <p className="text-sm text-slate-400">Recruiting operations hub</p>
            </div>
          </div>

          <div className="mt-20 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Welcome
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Welcome to your hiring workspace.
            </h2>
            <p className="mt-5 text-sm leading-6 text-slate-300">
              Sign in to manage openings, candidates, applications, interviews, and
              every follow-up that moves your hiring process forward.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6 flex rounded-lg border border-slate-200 bg-slate-100 p-1">
            <button
              className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
                !isRegister ? "bg-slate-950 text-white shadow-sm" : "text-slate-500"
              }`}
              onClick={() => setMode("login")}
              onFocus={() => setError("")}
              type="button"
            >
              Login
            </button>
            <button
              className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${
                isRegister ? "bg-slate-950 text-white shadow-sm" : "text-slate-500"
              }`}
              onClick={() => setMode("register")}
              onFocus={() => setError("")}
              type="button"
            >
              Register
            </button>
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
            {isRegister ? "Create account" : "Welcome back"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isRegister
              ? "Create your account to start using Job Tracker."
              : "Log in to continue where you left off."}
          </p>

          {error && (
            <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form className="mt-6 grid gap-4" onSubmit={submitAuth}>
            {isRegister && (
              <>
                <label className="text-sm font-medium text-slate-700">
                  Name
                  <input
                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                    onChange={(event) => updateField("name", event.target.value)}
                    required
                    value={form.name}
                  />
                </label>
                <div className="text-sm font-medium text-slate-700">
                  Avatar
                  <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
                      {form.avatar || avatarPreview ? (
                        <img
                          alt="Selected avatar"
                          className="h-full w-full object-cover"
                          src={avatarPreview || resolveAvatarSrc(form.avatar)}
                        />
                      ) : (
                        <ImagePlus size={20} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                        Select image
                        <input
                          accept="image/*"
                          className="hidden"
                          onChange={selectAvatar}
                          type="file"
                        />
                      </label>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {uploadingAvatar
                          ? "Uploading image..."
                          : form.avatar
                            ? "Image uploaded"
                            : "PNG, JPG, WEBP, or GIF"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2">
                    <input
                      className="w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                      onChange={(event) => setAvatarPath(event.target.value)}
                      placeholder="D:/Escritorio/imagenes/midu.png"
                      value={avatarPath}
                    />
                    <button
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-400 hover:text-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={uploadingAvatar}
                      onClick={importAvatarFromPath}
                      type="button"
                    >
                      {uploadingAvatar ? "Importing..." : "Import image from path"}
                    </button>
                  </div>
                </div>
              </>
            )}

            <label className="text-sm font-medium text-slate-700">
              Email
              <input
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                onChange={(event) => updateField("email", event.target.value)}
                required
                type="email"
                value={form.email}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Password
              <input
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                minLength={6}
                onChange={(event) => updateField("password", event.target.value)}
                required
                type="password"
                value={form.password}
              />
            </label>

            {isRegister && (
              <label className="text-sm font-medium text-slate-700">
                Role
                <select
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                  onChange={(event) => updateField("role", event.target.value)}
                  value={form.role}
                >
                  <option value="recruiter">Recruiter</option>
                  <option value="candidate">Candidate</option>
                </select>
              </label>
            )}

            {isRegister && form.role === "candidate" && (
              <div className="text-sm font-medium text-slate-700">
                Resume
                <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                      Upload CV
                      <input
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={selectResume}
                        type="file"
                      />
                    </label>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {resumeName || "PDF, DOC, or DOCX"}
                    </p>
                  </div>
                </div>
                <input
                  className="mt-3 w-full rounded-lg border border-slate-200 bg-white p-3 text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100"
                  onChange={(event) => {
                    updateField("resume", event.target.value);
                    setResumeName(event.target.value);
                  }}
                  placeholder="./src/resume/resume.pdf"
                  value={form.resume}
                />
              </div>
            )}

            <button
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
              {loading ? "Please wait..." : isRegister ? "Create account" : "Login"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};
