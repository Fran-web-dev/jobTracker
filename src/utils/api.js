export const API_BASE_URL = "/api";
export const AVATAR_STORAGE_PREFIX = "jobtracker-avatar:";
export const API_ORIGIN = API_BASE_URL.replace("/api", "");

let inMemoryToken = "";

export const getAuthToken = () => inMemoryToken;

export const setAuthToken = (token) => {
  inMemoryToken = token || "";
};

export const clearAuthToken = () => {
  inMemoryToken = "";
};

export const saveLocalAvatar = (email, avatar) => {
  if (email && avatar) {
    localStorage.setItem(`${AVATAR_STORAGE_PREFIX}${email}`, avatar);
  }
};

export const getLocalAvatar = (email) =>
  email ? (localStorage.getItem(`${AVATAR_STORAGE_PREFIX}${email}`) ?? "") : "";

export const apiRequest = async (path, options = {}) => {
  const token = getAuthToken();
  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(payload?.message ?? "API request failed");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload?.data ?? payload;
};

export const healthRequest = async () => {
  const response = await fetch(`${API_ORIGIN}/health`);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message ?? "Health check failed");
  }

  return payload?.data ?? payload;
};

export const extractToken = (payload) =>
  payload?.token ??
  payload?.accessToken ??
  payload?.jwt ??
  payload?.data?.token ??
  payload?.data?.accessToken ??
  "";

export const extractUser = (payload) =>
  payload?.user ?? payload?.data?.user ?? payload?.data ?? null;

export const mapInterviewFromApi = (interview) => {
  const durationMinutes = Number(interview.duration ?? 45);
  const startsAt = interview.startTime ?? interview.scheduledAt ?? "";

  return {
    id: interview.id ?? interview._id,
    candidate:
      interview.candidate?.name ??
      interview.candidateName ??
      interview.candidate ??
      "Candidate",
    role:
      interview.role ??
      interview.job?.title ??
      interview.jobTitle ??
      interview.title ??
      "Interview",
    date:
      interview.date ?? interview.scheduledDate ?? startsAt?.slice(0, 10) ?? "",
    time:
      interview.time ??
      interview.scheduledTime ??
      startsAt?.slice(11, 16) ??
      "",
    interviewer:
      interview.recruiter?.name ??
      interview.interviewer?.name ??
      interview.interviewerName ??
      interview.interviewer ??
      "Interviewer",
    type: interview.type ?? "VIDEO",
    status: interview.status ?? "SCHEDULED",
    duration: `${durationMinutes} min`,
    durationMinutes,
    startsAt,
    meetingId: interview.id ?? interview._id,
    meetingUrl:
      interview.roomUrl ??
      interview.meetingUrl ??
      interview.joinUrl ??
      interview.url ??
      "",
    raw: interview,
  };
};

export const isUpcomingInterview = (interview) => {
  const inactiveStatuses = ["COMPLETED", "CANCELLED", "NO_SHOW"];

  if (inactiveStatuses.includes(interview.status)) {
    return false;
  }

  if (!interview.startsAt) {
    return interview.status === "SCHEDULED";
  }

  const startTime = new Date(interview.startsAt).getTime();

  if (Number.isNaN(startTime)) {
    return interview.status === "SCHEDULED";
  }

  const durationMs = (interview.durationMinutes || 45) * 60 * 1000;
  return startTime + durationMs > Date.now();
};

export const mapJobFromApi = (job) => ({
  id: job.id ?? job._id,
  title: job.title ?? "Untitled job",
  description: job.description ?? "",
  company: job.company ?? "Company",
  location: job.location ?? "Location",
  salary:
    typeof job.salary === "number" ? `$${job.salary}` : (job.salary ?? ""),
  state: job.state ?? "open",
  createdAt: job.createdAt ?? "",
});

export const mapCandidateFromApi = (candidate) => ({
  id: candidate.id ?? candidate._id,
  name: candidate.name ?? "Candidate",
  email: candidate.email ?? "",
  resume: candidate.resume ?? "",
  createdAt: candidate.createdAt ?? "",
  applications: candidate.applications ?? [],
  interviews: candidate.interviews ?? [],
});

export const mapApplicationFromApi = (application) => ({
  id: application.id ?? application._id,
  jobId: application.jobId,
  candidateId: application.candidateId,
  status: application.status ?? "pending",
  createdAt: application.createdAt ?? "",
  job: application.job ?? null,
  candidate: application.candidate ?? null,
});

export const buildMeetingUrl = (data) => {
  const roomUrl =
    data?.roomUrl ?? data?.joinUrl ?? data?.meetingUrl ?? data?.url ?? "";

  if (!roomUrl || !data?.token) {
    return roomUrl;
  }

  const separator = roomUrl.includes("?") ? "&" : "?";
  return `${roomUrl}${separator}t=${encodeURIComponent(data.token)}`;
};

export const resolveAssetUrl = (assetPath) => {
  if (!assetPath) {
    return "";
  }

  if (assetPath.startsWith("http") || assetPath.startsWith("data:")) {
    return assetPath;
  }

  if (assetPath.startsWith("/")) {
    return `${API_ORIGIN}${assetPath}`;
  }

  return `${API_ORIGIN}/${assetPath.replace(/^\.?\//, "")}`;
};

export const resolveResumeUrl = (resumePath) => {
  if (!resumePath) {
    return "";
  }

  if (
    resumePath.startsWith("http") ||
    resumePath.startsWith("/") ||
    resumePath.startsWith("uploads/")
  ) {
    return resolveAssetUrl(resumePath);
  }

  return resolveAssetUrl(`/uploads/resumes/${resumePath.replace(/^\.?\//, "")}`);
};

export const isSafeDocumentUrl = (url) => {
  if (!url) {
    return false;
  }

  try {
    const currentOrigin = globalThis.location?.origin ?? "http://localhost";
    const parsedUrl = new URL(url, currentOrigin);
    const allowedOrigins = new Set([
      currentOrigin,
      "https://cutlet-infinite-cow.abasthan.app",
    ]);

    return allowedOrigins.has(parsedUrl.origin) && parsedUrl.pathname.startsWith("/uploads/");
  } catch {
    return false;
  }
};

/** Local date (YYYY-MM-DD) + time (HH:mm) from form inputs → ISO string for the API. */
export const buildInterviewStartTime = (date, time) => {
  if (!date?.trim() || !time?.trim()) {
    throw new Error("Select both date and time for the interview.");
  }

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time.trim());

  if (!dateMatch || !timeMatch) {
    throw new Error("Use a valid date and time (check the year is correct).");
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);

  if (year < 1970 || year > 2100) {
    throw new Error("Choose a year between 1970 and 2100.");
  }

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error("Choose a valid calendar date.");
  }

  if (hours > 23 || minutes > 59) {
    throw new Error("Choose a valid time.");
  }

  const start = new Date(year, month - 1, day, hours, minutes, 0, 0);

  if (Number.isNaN(start.getTime())) {
    throw new Error("Invalid date or time. Check the values and try again.");
  }

  if (
    start.getFullYear() !== year ||
    start.getMonth() !== month - 1 ||
    start.getDate() !== day
  ) {
    throw new Error(
      "That date does not exist on the calendar (for example Feb 30).",
    );
  }

  return start.toISOString();
};

export const todayDateInputValue = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};
