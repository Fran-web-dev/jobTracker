import { NavLink } from "react-router-dom";
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChartNoAxesCombined,
  Gauge,
  KanbanSquare,
  Settings,
  Sparkles,
  UserRoundCheck,
  Users,
  Workflow,
} from "lucide-react";
import { useAuth } from "../context/useAuth";

export const SideBar = () => {
  const { isCandidate } = useAuth();
  const recruiterLinks = [
    { name: "Dashboard", path: "/", icon: Gauge },
    { name: "Applications", path: "/applications", icon: Workflow },
    { name: "Jobs", path: "/jobs", icon: BriefcaseBusiness },
    { name: "Candidates", path: "/candidates", icon: Users },
    { name: "Companies", path: "/companies", icon: Building2 },
    { name: "Pipeline", path: "/pipelines", icon: KanbanSquare },
    { name: "Calendar", path: "/calendar", icon: CalendarDays },
    { name: "Reports", path: "/reports", icon: ChartNoAxesCombined },
    { name: "Interviews", path: "/interviews", icon: UserRoundCheck },
    { name: "Talent Pool", path: "/talent", icon: Sparkles },
    { name: "Settings", path: "/settings", icon: Settings },
  ];
  const candidateLinks = [
    { name: "Dashboard", path: "/", icon: Gauge },
    { name: "Jobs", path: "/jobs", icon: BriefcaseBusiness },
    { name: "Calendar", path: "/calendar", icon: CalendarDays },
    { name: "Interviews", path: "/interviews", icon: UserRoundCheck },
    { name: "Settings", path: "/settings", icon: Settings },
  ];
  const links = isCandidate ? candidateLinks : recruiterLinks;

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-slate-950/75 lg:flex">
      <div className="border-b border-white/10 px-6 py-7">
        <h1 className="text-2xl font-bold tracking-tight text-white">Job Tracker</h1>
        <p className="mt-1 text-sm text-slate-500">Personal ATS Dashboard</p>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/"}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "border border-cyan-400/25 bg-cyan-400/10 text-cyan-200"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                }`
              }
            >
              <Icon size={18} />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 p-4">
        <div className="rounded-lg border border-white/10 bg-slate-900/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {isCandidate ? "Interview access" : "Progress"}
          </p>
          <p className="mt-1 font-semibold text-white">
            {isCandidate ? "Ready for calls" : "67% weekly goal"}
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-2/3 rounded-full bg-cyan-400" />
          </div>
        </div>
      </div>
    </aside>
  );
};
