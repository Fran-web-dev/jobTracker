import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import "./App.css";

const Applications = lazy(() =>
  import("./pages/Applications").then((module) => ({ default: module.Applications })),
);
const Auth = lazy(() => import("./pages/Auth").then((module) => ({ default: module.Auth })));
const Calendar = lazy(() =>
  import("./pages/Calendar").then((module) => ({ default: module.Calendar })),
);
const Candidates = lazy(() =>
  import("./pages/Candidates").then((module) => ({ default: module.Candidates })),
);
const Companies = lazy(() =>
  import("./pages/Companies").then((module) => ({ default: module.Companies })),
);
const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })),
);
const Interviews = lazy(() =>
  import("./pages/Interviews").then((module) => ({ default: module.Interviews })),
);
const JobDetails = lazy(() =>
  import("./pages/JobDetails").then((module) => ({ default: module.JobDetails })),
);
const Jobs = lazy(() => import("./pages/Jobs").then((module) => ({ default: module.Jobs })));
const MeetingRoom = lazy(() =>
  import("./pages/MeetingRoom").then((module) => ({ default: module.MeetingRoom })),
);
const Pipeline = lazy(() =>
  import("./pages/Pipeline").then((module) => ({ default: module.Pipeline })),
);
const Reports = lazy(() =>
  import("./pages/Reports").then((module) => ({ default: module.Reports })),
);
const ResumeViewer = lazy(() =>
  import("./pages/ResumeViewer").then((module) => ({ default: module.ResumeViewer })),
);
const Settings = lazy(() =>
  import("./pages/Settings").then((module) => ({ default: module.Settings })),
);
const TalentPool = lazy(() =>
  import("./pages/TalentPool").then((module) => ({ default: module.TalentPool })),
);

const AppFallback = () => (
  <main className="flex min-h-screen items-center justify-center bg-slate-950 text-sm font-semibold text-white">
    Loading...
  </main>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<AppFallback />}>
          <Routes>
            <Route path="/login" element={<Auth />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/interviews" element={<Interviews />} />
              <Route path="/call/:meetingId" element={<MeetingRoom />} />
              <Route path="/resume-viewer" element={<ResumeViewer />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["recruiter", "admin"]} />}>
              <Route path="/applications" element={<Applications />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/pipelines" element={<Pipeline />} />
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/talent" element={<TalentPool />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
