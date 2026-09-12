import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "../../lib/api";

const SCORE_COLORS = { HOT: "#ef4444", WARM: "#D4AF37", COLD: "#38bdf8" };

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then((r) => setData(r.data)).catch(() => {});
  }, []);

  if (!data) return <div className="text-slate-500 font-mono text-xs tracking-widest uppercase">Loading dashboard…</div>;

  const stageData = Object.entries(data.by_status).map(([k, v]) => ({ name: k.replace(/_/g, " "), value: v }));
  const scoreData = Object.entries(data.by_score).map(([k, v]) => ({ name: k, value: v }));
  const sourceData = Object.entries(data.by_source).map(([k, v]) => ({ name: k.replace(/_/g, " "), value: v }));

  return (
    <div data-testid="admin-dashboard-page">
      <h1 className="font-serif text-3xl mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Leads", value: data.total_leads, testid: "dash-total-leads" },
          { label: "Hot Leads", value: data.by_score.HOT || 0, testid: "dash-hot-leads" },
          { label: "Booked", value: data.by_status.BOOKED || 0, testid: "dash-booked" },
          { label: "Live Projects", value: data.total_projects, testid: "dash-projects" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-6">
            <p data-testid={s.testid} className="font-serif text-4xl gold-text">{s.value}</p>
            <p className="text-[0.6rem] font-mono uppercase tracking-[0.2em] text-slate-400 mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="glass-card p-6 lg:col-span-1">
          <h2 className="font-serif text-lg mb-4">Pipeline Funnel</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stageData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={110} tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <Tooltip contentStyle={{ background: "#101B2E", border: "1px solid rgba(197,160,89,0.3)", fontSize: 12 }} />
              <Bar dataKey="value" fill="#D4AF37" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-6">
          <h2 className="font-serif text-lg mb-4">AI Lead Score</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={scoreData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                {scoreData.map((s) => <Cell key={s.name} fill={SCORE_COLORS[s.name]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#101B2E", border: "1px solid rgba(197,160,89,0.3)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-[0.62rem] font-mono uppercase tracking-wider">
            {scoreData.map((s) => <span key={s.name} style={{ color: SCORE_COLORS[s.name] }}>{s.name} · {s.value}</span>)}
          </div>
        </div>
        <div className="glass-card p-6">
          <h2 className="font-serif text-lg mb-4">Leads by Source</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sourceData}>
              <XAxis dataKey="name" tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "JetBrains Mono" }} />
              <YAxis tick={{ fill: "#94A3B8", fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#101B2E", border: "1px solid rgba(197,160,89,0.3)", fontSize: 12 }} />
              <Bar dataKey="value" fill="#C5A059" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-serif text-lg mb-4">Latest Enquiries</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="dash-recent-leads-table">
            <thead>
              <tr className="border-b border-[#C5A059]/20 text-left">
                {["Name", "Phone", "Project", "Source", "Score", "Stage"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[0.6rem] font-mono uppercase tracking-[0.2em] text-slate-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recent_leads.map((l) => (
                <tr key={l.id} data-testid={`dash-lead-row-${l.id.slice(0, 8)}`} className="border-b border-slate-800/50">
                  <td className="px-4 py-3">{l.name}</td>
                  <td className="px-4 py-3 text-slate-400">{l.phone}</td>
                  <td className="px-4 py-3 text-slate-400">{l.project_name || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{l.source}</td>
                  <td className="px-4 py-3"><span style={{ color: SCORE_COLORS[l.score] }} className="font-mono text-xs">{l.score}</span></td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{l.status?.replace(/_/g, " ")}</td>
                </tr>
              ))}
              {data.recent_leads.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-mono text-xs">No leads yet — enquiries from the site will appear here.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
