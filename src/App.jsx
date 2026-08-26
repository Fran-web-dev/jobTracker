import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { Applications } from "./pages/Applications";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";

import { Calendar } from "./pages/Calendar";
import { Candidates } from "./pages/Candidates";
import { Companies } from "./pages/Companies";
import { Interviews } from "./pages/Interviews";
import { Jobs } from "./pages/Jobs";
import { JobDetails } from "./pages/JobDetails";
import { MeetingRoom } from "./pages/MeetingRoom";
import { Pipeline } from "./pages/Pipeline";
import { Reports } from "./pages/Reports";
import { ResumeViewer } from "./pages/ResumeViewer";
import { Settings } from "./pages/Settings";
import { TalentPool } from "./pages/TalentPool";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
