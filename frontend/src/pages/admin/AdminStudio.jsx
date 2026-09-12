import { useEffect, useState } from "react";
import { Sparkles, Copy } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "../../lib/api";

const KINDS = [
  { id: "description", label: "Project Description" },
  { id: "seo", label: "SEO Meta Pack" },
  { id: "alt", label: "Image Alt Text" },
  { id: "whatsapp", label: "WhatsApp Template" },
  { id: "blog", label: "Blog Draft" },
];

export default function AdminStudio() {
  const [projects, setProjects] = useState([]);
  const [kind, setKind] = useState("description");
  const [projectId, setProjectId] = useState("");
  const [extra, setExtra] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/admin/projects").then((r) => setProjects(r.data)).catch(() => {});
  }, []);

  const generate = async () => {
    setLoading(true);
    setOutput("");
    try {
      const p = projects.find((x) => x.id === projectId);
      const context = p
        ? `${p.name} | ${p.status} | ${p.category} | ${p.locality}, ${p.city} | ${p.price_label} | Possession: ${p.possession} | RERA: ${p.rera_number || "pending"} | ${p.description}\n${extra}`
        : extra;
      const { data } = await api.post("/admin/ai/generate", { kind, context });
      setOutput(data.output);
      toast.success("Generated.");
    } catch (e) {
      toast.error(formatApiError(e, "Generation failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="admin-studio-page" className="max-w-4xl">
      <h1 className="font-serif text-3xl mb-2">AI Content Studio</h1>
      <p className="text-sm text-slate-500 mb-8 font-light">Generate descriptions, SEO packs, alt text, WhatsApp templates and blog drafts. Output is a draft — review before publishing.</p>

      <div className="glass-card p-7 space-y-5">
        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button key={k.id} data-testid={`studio-kind-${k.id}`} onClick={() => setKind(k.id)}
              className={`text-[0.62rem] font-mono uppercase tracking-[0.18em] px-4 py-2 border transition-all ${kind === k.id ? "border-[#D4AF37] text-[#F3E5AB] bg-[#D4AF37]/10" : "border-slate-700 text-slate-400"}`}>
              {k.label}
            </button>
          ))}
        </div>
        <select data-testid="studio-project-select" value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full px-4 py-3 text-sm">
          <option value="">— Context: pick a project (optional) —</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <textarea data-testid="studio-context-input" rows={4} value={extra} onChange={(e) => setExtra(e.target.value)}
          placeholder="Extra context, brief, or source notes for the AI…" className="w-full px-4 py-3 text-sm" />
        <button data-testid="studio-generate-btn" onClick={generate} disabled={loading || (!projectId && !extra.trim())} className="gold-btn disabled:opacity-50">
          <Sparkles size={14} /> {loading ? "Generating…" : "Generate"}
        </button>
      </div>

      {output && (
        <div className="glass-card p-7 mt-6" data-testid="studio-output">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl">Draft Output</h2>
            <button data-testid="studio-copy-btn" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied."); }}
              className="flex items-center gap-1.5 text-[0.62rem] font-mono text-slate-400 hover:text-[#E6C687]"><Copy size={13} /> Copy</button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-slate-300 font-light leading-relaxed">{output}</pre>
        </div>
      )}
    </div>
  );
}
