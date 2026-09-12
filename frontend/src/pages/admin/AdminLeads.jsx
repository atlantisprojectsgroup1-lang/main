import { useEffect, useState } from "react";
import { X, Phone, Mail, RefreshCw, StickyNote } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "../../lib/api";

const STAGES = ["NEW", "CONTACTED", "SITE_VISIT_SCHEDULED", "SITE_VISIT_DONE", "NEGOTIATION", "BOOKED", "LOST"];
const STAGE_LABEL = (s) => s.replace(/_/g, " ");
const SCORE_STYLES = { HOT: "text-red-400 border-red-500/40", WARM: "text-amber-400 border-amber-500/40", COLD: "text-sky-400 border-sky-500/40" };

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");

  const load = () => api.get("/admin/leads").then((r) => setLeads(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const move = async (lead, status) => {
    try {
      const { data } = await api.put(`/admin/leads/${lead.id}`, { status });
      setLeads((ls) => ls.map((l) => (l.id === lead.id ? data : l)));
      if (selected?.id === lead.id) setSelected(data);
      toast.success(`Moved to ${STAGE_LABEL(status)}`);
    } catch (e) {
      toast.error(formatApiError(e));
    }
  };

  const addNote = async () => {
    if (!note.trim() || !selected) return;
    const { data } = await api.put(`/admin/leads/${selected.id}`, { note: note.trim() });
    setSelected(data);
    setLeads((ls) => ls.map((l) => (l.id === data.id ? data : l)));
    setNote("");
    toast.success("Note added.");
  };

  const rescore = async (lead) => {
    const { data } = await api.post(`/admin/leads/${lead.id}/rescore`);
    setLeads((ls) => ls.map((l) => (l.id === lead.id ? data : l)));
    if (selected?.id === lead.id) setSelected(data);
    toast.success(`Re-scored: ${data.score}`);
  };

  return (
    <div data-testid="admin-leads-page">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl">CRM Pipeline</h1>
        <span className="text-xs font-mono text-slate-500 tracking-wider">{leads.length} leads</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6" data-testid="kanban-board">
        {STAGES.map((stage) => {
          const items = leads.filter((l) => l.status === stage);
          return (
            <div key={stage} data-testid={`kanban-col-${stage.toLowerCase()}`} className="w-64 shrink-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-[0.62rem] font-mono uppercase tracking-[0.18em] text-slate-400">{STAGE_LABEL(stage)}</h2>
                <span className="text-[0.62rem] font-mono text-[#C5A059]">{items.length}</span>
              </div>
              <div className="space-y-3 min-h-[120px] border-t border-[#C5A059]/20 pt-3">
                {items.map((l) => (
                  <button key={l.id} data-testid={`lead-card-${l.id.slice(0, 8)}`} onClick={() => setSelected(l)}
                    className="w-full text-left glass-card p-4 hover:border-[#D4AF37]/50 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-serif text-base leading-tight">{l.name}</span>
                      <span className={`text-[0.55rem] font-mono px-1.5 py-0.5 border ${SCORE_STYLES[l.score] || SCORE_STYLES.WARM}`}>{l.score}</span>
                    </div>
                    <p className="text-xs text-slate-400">{l.phone}</p>
                    {l.project_name && <p className="text-[0.62rem] font-mono text-[#C5A059]/80 mt-1.5 truncate">{l.project_name}</p>}
                    <p className="text-[0.58rem] font-mono text-slate-600 mt-1.5">{l.source} · {new Date(l.created_at).toLocaleDateString("en-IN")}</p>
                  </button>
                ))}
                {items.length === 0 && <p className="text-[0.62rem] font-mono text-slate-700 text-center py-6">Empty</p>}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div data-testid="lead-detail-drawer" className="fixed inset-0 z-[70] bg-[#050B14]/80 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#0A1322] border-l border-[#C5A059]/25 p-8 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl">{selected.name}</h2>
              <button data-testid="lead-drawer-close-btn" onClick={() => setSelected(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="space-y-3 text-sm mb-6">
              <a href={`tel:${selected.phone}`} data-testid="lead-call-link" className="flex items-center gap-2 text-slate-300 hover:text-[#E6C687]"><Phone size={14} className="text-[#C5A059]" />{selected.phone}</a>
              {selected.email && <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-slate-300 hover:text-[#E6C687]"><Mail size={14} className="text-[#C5A059]" />{selected.email}</a>}
              <p className="text-slate-400"><span className="text-slate-600 font-mono text-xs uppercase">Project:</span> {selected.project_name || "—"}</p>
              <p className="text-slate-400"><span className="text-slate-600 font-mono text-xs uppercase">Source:</span> {selected.source}</p>
              {selected.message && <p className="text-slate-400 border-l-2 border-[#C5A059]/40 pl-3 italic">"{selected.message}"</p>}
            </div>

            <div className="glass-card p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono px-2 py-1 border ${SCORE_STYLES[selected.score] || SCORE_STYLES.WARM}`}>AI SCORE: {selected.score}</span>
                <button data-testid="lead-rescore-btn" onClick={() => rescore(selected)} className="flex items-center gap-1.5 text-[0.62rem] font-mono text-slate-400 hover:text-[#E6C687]"><RefreshCw size={12} /> Re-score</button>
              </div>
              {selected.score_reason && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{selected.score_reason}</p>}
            </div>

            <div className="mb-6">
              <label className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-2">Move Stage</label>
              <select data-testid="lead-stage-select" value={selected.status} onChange={(e) => move(selected, e.target.value)} className="w-full px-4 py-3 text-sm">
                {STAGES.map((s) => <option key={s} value={s}>{STAGE_LABEL(s)}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-2">Activity & Notes</label>
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {(selected.notes || []).map((n, i) => (
                  <div key={i} className="border border-slate-800 p-3">
                    <p className="text-sm text-slate-300">{n.text}</p>
                    <p className="text-[0.58rem] font-mono text-slate-600 mt-1">{n.by} · {new Date(n.at).toLocaleString("en-IN")}</p>
                  </div>
                ))}
                {(selected.notes || []).length === 0 && <p className="text-xs text-slate-600 font-mono">No notes yet.</p>}
              </div>
              <div className="flex gap-2">
                <input data-testid="lead-note-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note…" className="flex-1 px-4 py-2.5 text-sm" />
                <button data-testid="lead-note-add-btn" onClick={addNote} className="px-4 border border-[#C5A059]/40 text-[#E6C687] hover:border-[#D4AF37]"><StickyNote size={15} /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
