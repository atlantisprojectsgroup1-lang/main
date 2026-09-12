import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Building2, Users, UsersRound, Settings, Sparkles, LogOut, Globe } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, testid: "admin-nav-dashboard" },
  { to: "/admin/projects", label: "Projects CMS", icon: Building2, testid: "admin-nav-projects-crud" },
  { to: "/admin/team", label: "Team", icon: UsersRound, testid: "admin-nav-team" },
  { to: "/admin/leads", label: "CRM Pipeline", icon: Users, testid: "admin-nav-crm-pipeline" },
  { to: "/admin/studio", label: "AI Studio", icon: Sparkles, testid: "admin-nav-ai-studio" },
  { to: "/admin/settings", label: "Settings", icon: Settings, testid: "admin-nav-settings" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (user === null) return <div className="min-h-screen bg-[#050B14] flex items-center justify-center text-slate-500 font-mono text-xs tracking-widest uppercase">Verifying session…</div>;
  if (user === false) return <Navigate to="/admin" replace />;

  return (
    <div data-testid="admin-dashboard-container" className="min-h-screen bg-[#050B14] flex">
      <aside className="w-60 shrink-0 border-r border-[#C5A059]/15 bg-[#0A1322]/60 hidden md:flex flex-col">
        <div className="p-6 border-b border-[#C5A059]/15">
          <p className="font-serif text-lg tracking-[0.25em]">ATLANTIS</p>
          <p className="text-[0.55rem] font-mono tracking-[0.3em] text-[#C5A059]/80 uppercase mt-1">Command Center</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} data-testid={n.testid}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 text-xs font-mono uppercase tracking-[0.15em] transition-colors ${isActive ? "bg-[#D4AF37]/10 text-[#F3E5AB] border-l-2 border-[#D4AF37]" : "text-slate-400 hover:text-slate-200 border-l-2 border-transparent"}`}>
              <n.icon size={15} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-[#C5A059]/15 space-y-1">
          <button data-testid="admin-view-site-btn" onClick={() => navigate("/")} className="flex items-center gap-3 px-4 py-2.5 text-xs font-mono uppercase tracking-[0.15em] text-slate-400 hover:text-slate-200 w-full">
            <Globe size={15} /> View Site
          </button>
          <button data-testid="admin-logout-btn" onClick={async () => { await logout(); navigate("/admin"); }} className="flex items-center gap-3 px-4 py-2.5 text-xs font-mono uppercase tracking-[0.15em] text-slate-400 hover:text-red-400 w-full">
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="md:hidden border-b border-[#C5A059]/15 p-3 flex gap-2 overflow-x-auto bg-[#0A1322]/80">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} data-testid={`mobile-${n.testid}`}
              className={({ isActive }) => `flex items-center gap-2 px-3 py-2 text-[0.62rem] font-mono uppercase tracking-wider whitespace-nowrap ${isActive ? "text-[#F3E5AB] bg-[#D4AF37]/10" : "text-slate-400"}`}>
              <n.icon size={13} /> {n.label}
            </NavLink>
          ))}
          <button data-testid="mobile-admin-logout-btn" onClick={async () => { await logout(); navigate("/admin"); }} className="flex items-center gap-2 px-3 py-2 text-[0.62rem] font-mono uppercase tracking-wider text-slate-400">
            <LogOut size={13} /> Out
          </button>
        </div>
        <main className="p-6 lg:p-10">
          <div className="mb-8 flex items-center justify-between">
            <p className="text-xs font-mono text-slate-500 tracking-wider">Signed in as <span className="text-[#E6C687]">{user.email}</span> · {user.role}</p>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
