import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Newspaper, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "../../lib/api";

const EMPTY_POST = {
  title: "", slug: "", kind: "blog", excerpt: "", body: "", cover: "", author: "Atlantis Editorial",
  tags: "", platform: "Website", external_url: "", published_at: new Date().toISOString().slice(0, 10),
};

export default function AdminContent() {
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("ALL");

  const load = () => api.get("/blog").then((r) => setPosts(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const filtered = tab === "ALL" ? posts : posts.filter((p) => (p.kind || "blog") === tab);

  const uploadCover = async (e) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const { data } = await api.post("/admin/upload", { data_url: reader.result });
        setEditing((cur) => ({ ...cur, cover: data.url }));
        toast.success("Cover image uploaded.");
      } catch (err) {
        toast.error(formatApiError(err, "Upload failed."));
      }
    };
    reader.readAsDataURL(f);
  };

  const save = async () => {
    if (!editing.title.trim()) return;
    setSaving(true);
    try {
      const p = {
        ...editing,
        tags: typeof editing.tags === "string" ? editing.tags.split(",").map((t) => t.trim()).filter(Boolean) : editing.tags,
      };
      await api.post("/admin/blog", p);
      toast.success("Saved.");
      setEditing(null);
      load();
    } catch (e) {
      toast.error(formatApiError(e, "Save failed."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this post permanently?")) return;
    await api.delete(`/admin/blog/${id}`);
    toast.success("Deleted.");
    load();
  };

  return (
    <div data-testid="admin-content-page">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl">Blogs & Daily Updates</h1>
          <p className="text-xs text-slate-500 font-light mt-1">Daily updates can link out to social media posts (Instagram, LinkedIn, YouTube…) or any page.</p>
        </div>
        <button data-testid="admin-add-post-btn" onClick={() => setEditing({ ...EMPTY_POST })} className="gold-btn">
          <Plus size={14} /> New Post / Update
        </button>
      </div>

      <div className="flex gap-2 mb-6" data-testid="admin-content-tabs">
        {[["ALL", "All"], ["blog", "Blogs"], ["update", "Daily Updates"]].map(([k, label]) => (
          <button key={k} data-testid={`admin-content-tab-${k.toLowerCase()}`} onClick={() => setTab(k)}
            className={`text-[0.62rem] font-mono uppercase tracking-[0.18em] px-4 py-2 border transition-all ${tab === k ? "border-[#D4AF37] text-[#F3E5AB] bg-[#D4AF37]/10" : "border-slate-700 text-slate-400"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm" data-testid="admin-content-table">
          <thead>
            <tr className="border-b border-[#C5A059]/20 text-left">
              {["Title", "Type", "Platform / Link", "Published", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-[0.6rem] font-mono uppercase tracking-[0.2em] text-slate-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} data-testid={`admin-content-row-${p.slug}`} className="border-b border-slate-800/50 hover:bg-[#D4AF37]/5">
                <td className="px-5 py-3.5 font-serif text-base max-w-xs truncate">{p.title}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-[0.58rem] font-mono uppercase tracking-wider px-2 py-1 border ${p.kind === "update" ? "border-amber-500/40 text-amber-400" : "border-[#C5A059]/40 text-[#E6C687]"}`}>
                    {p.kind === "update" ? "Update" : "Blog"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">
                  {p.external_url ? (
                    <span className="flex items-center gap-1.5">{p.platform || "Link"} <ExternalLink size={11} /></span>
                  ) : "Internal"}
                </td>
                <td className="px-5 py-3.5 text-slate-400 text-xs font-mono">{p.published_at}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2">
                    <button data-testid={`admin-edit-post-${p.slug}`} onClick={() => setEditing({ ...p, tags: (p.tags || []).join(", ") })}
                      className="p-2 border border-slate-700 text-slate-300 hover:border-[#D4AF37] hover:text-[#E6C687] transition-colors"><Pencil size={13} /></button>
                    <button data-testid={`admin-delete-post-${p.slug}`} onClick={() => remove(p.id)}
                      className="p-2 border border-slate-700 text-slate-300 hover:border-red-500 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div data-testid="admin-post-editor" className="fixed inset-0 z-[70] bg-[#050B14]/90 backdrop-blur-md overflow-y-auto">
          <div className="max-w-2xl mx-auto my-10 glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl flex items-center gap-3"><Newspaper size={20} className="text-[#D4AF37]" /> {editing.id ? "Edit" : "New"} {editing.kind === "update" ? "Update" : "Blog Post"}</h2>
              <button data-testid="post-editor-close-btn" onClick={() => setEditing(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select data-testid="post-kind-select" value={editing.kind} onChange={(e) => setEditing({ ...editing, kind: e.target.value })} className="px-4 py-3 text-sm">
                <option value="blog">Blog Post</option>
                <option value="update">Daily Update</option>
              </select>
              <input data-testid="post-date-input" type="date" value={editing.published_at} onChange={(e) => setEditing({ ...editing, published_at: e.target.value })} className="px-4 py-3 text-sm" />
              <input data-testid="post-title-input" placeholder="Title *" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="px-4 py-3 text-sm sm:col-span-2" />
              <textarea data-testid="post-excerpt-input" placeholder="Excerpt / short summary" rows={2} value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} className="px-4 py-3 text-sm sm:col-span-2" />
              {editing.kind === "blog" ? (
                <textarea data-testid="post-body-input" placeholder="Full article body" rows={5} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} className="px-4 py-3 text-sm sm:col-span-2" />
              ) : (
                <>
                  <select data-testid="post-platform-select" value={editing.platform} onChange={(e) => setEditing({ ...editing, platform: e.target.value })} className="px-4 py-3 text-sm">
                    {["Website", "Instagram", "LinkedIn", "Facebook", "YouTube", "X", "Press"].map((p) => <option key={p}>{p}</option>)}
                  </select>
                  <input data-testid="post-external-url-input" placeholder="External link (social post URL or /projects/…)" value={editing.external_url} onChange={(e) => setEditing({ ...editing, external_url: e.target.value })} className="px-4 py-3 text-sm font-mono" />
                </>
              )}
              <input data-testid="post-tags-input" placeholder="Tags — comma separated" value={editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} className="px-4 py-3 text-sm sm:col-span-2" />
              <div className="sm:col-span-2">
                <label className="text-[0.6rem] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-2">Cover Image</label>
                <div className="flex items-center gap-4 flex-wrap">
                  {editing.cover && <img src={editing.cover} alt="Cover" data-testid="post-cover-preview" className="h-16 w-28 object-cover border border-[#C5A059]/30" />}
                  <input id="post-cover-file" data-testid="post-cover-file-input" type="file" accept="image/*" className="hidden" onChange={uploadCover} />
                  <label htmlFor="post-cover-file" data-testid="post-cover-upload-btn" className="outline-btn cursor-pointer">Upload Cover</label>
                  <input data-testid="post-cover-url-input" placeholder="…or paste image URL" value={editing.cover} onChange={(e) => setEditing({ ...editing, cover: e.target.value })} className="flex-1 min-w-[200px] px-4 py-3 text-xs font-mono" />
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button data-testid="post-save-btn" onClick={save} disabled={saving || !editing.title.trim()} className="gold-btn disabled:opacity-50">{saving ? "Saving…" : "Save"}</button>
              <button data-testid="post-cancel-btn" onClick={() => setEditing(null)} className="outline-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
