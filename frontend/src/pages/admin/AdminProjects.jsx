import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "../../lib/api";
import ImageCropUpload from "../../components/ImageCropUpload";

const EMPTY = {
  name: "", slug: "", tagline: "", description: "", status: "UPCOMING", category: "RESIDENTIAL",
  city: "", locality: "", address: "", rera_number: "", possession: "", price_label: "Price on Request",
  price_from: "", total_towers: "", total_area: "", floors: "", featured: false, is_hot_selling: false,
  sort_order: 10, project_type: [], images: [], configs: [], amenities: [], specifications: [], landmarks: [],
  videos: [], documents: [], zones: [],
  seo: { title: "", description: "", keywords: "" }, placeholders: [], logo: "",
};

function toText(v) { return (v || []).map((x) => (typeof x === "string" ? x : x.url || x.name || x.config || JSON.stringify(x))).join("\n"); }

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null); // project object or null
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/admin/projects").then((r) => setProjects(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const uploadPdf = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    e.target.value = "";
    if (f.type !== "application/pdf") { toast.error("Only PDF files are accepted here."); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const { data } = await api.post("/admin/upload", { data_url: reader.result });
        setEditing((cur) => ({
          ...cur,
          documents_text: `${cur.documents_text || ""}${cur.documents_text ? "\n" : ""}${f.name.replace(/\.pdf$/i, "")} | ${data.url}`,
        }));
        toast.success("PDF uploaded and added to documents.");
      } catch (err) {
        toast.error(formatApiError(err, "Upload failed."));
      }
    };
    reader.readAsDataURL(f);
  };

  const save = async () => {
    setSaving(true);
    try {
      const p = { ...editing };
      p.price_from = p.price_from ? Number(p.price_from) : null;
      p.total_towers = p.total_towers ? Number(p.total_towers) : null;
      p.floors = p.floors ? Number(p.floors) : null;
      p.sort_order = Number(p.sort_order) || 10;
      p.lat = p.lat ? Number(p.lat) : null;
      p.lng = p.lng ? Number(p.lng) : null;
      p.project_type = typeof p.project_type === "string" ? p.project_type.split(",").map((s) => s.trim()).filter(Boolean) : p.project_type;
      p.images = (typeof p.images_text === "string" ? p.images_text : toText(p.images)).split("\n").map((u) => u.trim()).filter(Boolean)
        .map((u) => ({ url: u, alt: `${p.name} — ${p.locality || p.city}`, category: "EXTERIOR" }));
      p.configs = (typeof p.configs_text === "string" ? p.configs_text : toText(p.configs)).split("\n").map((l) => l.trim()).filter(Boolean)
        .map((l) => { const [config, price, area] = l.split("|").map((s) => s?.trim()); return { config: config || "", price_label: price || "On Request", area: area || "", availability: "AVAILABLE" }; });
      p.amenities = (typeof p.amenities_text === "string" ? p.amenities_text : toText(p.amenities)).split("\n").map((l) => l.trim()).filter(Boolean)
        .map((l) => { const [name, group] = l.split("|").map((s) => s?.trim()); return { name, group: group || "Lifestyle" }; });
      p.videos = (typeof p.videos_text === "string" ? p.videos_text : "").split("\n").map((l) => l.trim()).filter(Boolean)
        .map((l) => { const [url, title] = l.split("|").map((s) => s?.trim()); return { url, title: title || "Project Video" }; });
      p.documents = (typeof p.documents_text === "string" ? p.documents_text : "").split("\n").map((l) => l.trim()).filter(Boolean)
        .map((l) => { const [name, url] = l.split("|").map((s) => s?.trim()); return { name: name || "Document", url }; });
      const zmap = {};
      (typeof p.zones_text === "string" ? p.zones_text : "").split("\n").map((l) => l.trim()).filter(Boolean)
        .forEach((l) => {
          const [zoneName, config, price, area] = l.split("|").map((s) => s?.trim());
          if (!zoneName || !config) return;
          (zmap[zoneName] = zmap[zoneName] || []).push({ config, price_label: price || "On Request", area: area || "", availability: "AVAILABLE" });
        });
      p.zones = Object.entries(zmap).map(([label, configs], i) => ({ key: label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `zone-${i}`, label, configs }));
      delete p.images_text; delete p.configs_text; delete p.amenities_text; delete p.videos_text; delete p.documents_text; delete p.zones_text;
      if (projects.some((x) => x.id === p.id)) {
        await api.put(`/admin/projects/${p.id}`, p);
      } else {
        await api.post("/admin/projects", p);
      }
      toast.success("Project saved.");
      setEditing(null);
      load();
    } catch (e) {
      toast.error(formatApiError(e, "Save failed."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this project permanently?")) return;
    await api.delete(`/admin/projects/${id}`);
    toast.success("Project deleted.");
    load();
  };

  return (
    <div data-testid="admin-projects-page">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl">Projects CMS</h1>
        <button data-testid="admin-add-project-btn" onClick={() => setEditing({ ...EMPTY, images_text: "", configs_text: "", amenities_text: "", videos_text: "", documents_text: "", zones_text: "" })} className="gold-btn">
          <Plus size={14} /> New Project
        </button>
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm" data-testid="admin-projects-table">
          <thead>
            <tr className="border-b border-[#C5A059]/20 text-left">
              {["Project", "City", "Status", "Category", "Price", "Featured", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-[0.6rem] font-mono uppercase tracking-[0.2em] text-slate-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} data-testid={`admin-project-row-${p.slug}`} className="border-b border-slate-800/50 hover:bg-[#D4AF37]/5">
                <td className="px-5 py-3.5 font-serif text-base">{p.name}</td>
                <td className="px-5 py-3.5 text-slate-400">{p.city}</td>
                <td className="px-5 py-3.5"><span className="text-[0.62rem] font-mono uppercase tracking-wider text-slate-300">{(p.status || "").replace(/_/g, " ")}</span></td>
                <td className="px-5 py-3.5 text-slate-400 text-xs">{p.category}</td>
                <td className="px-5 py-3.5 gold-text font-serif">{p.price_label}</td>
                <td className="px-5 py-3.5">{p.featured ? <span className="text-[#D4AF37]">●</span> : <span className="text-slate-600">○</span>}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2">
                    <button data-testid={`admin-edit-project-${p.slug}`} onClick={() => setEditing({ ...p, images_text: toText(p.images), configs_text: (p.configs || []).map((c) => [c.config, c.price_label, c.area].join(" | ")).join("\n"), amenities_text: (p.amenities || []).map((a) => [a.name, a.group].join(" | ")).join("\n"), videos_text: (p.videos || []).map((v) => [v.url, v.title].filter(Boolean).join(" | ")).join("\n"), documents_text: (p.documents || []).map((d) => [d.name, d.url].join(" | ")).join("\n"), zones_text: (p.zones || []).flatMap((z) => (z.configs || []).map((c) => [z.label, c.config, c.price_label, c.area].join(" | "))).join("\n") })}
                      className="p-2 border border-slate-700 text-slate-300 hover:border-[#D4AF37] hover:text-[#E6C687] transition-colors"><Pencil size={13} /></button>
                    <button data-testid={`admin-delete-project-${p.slug}`} onClick={() => remove(p.id)}
                      className="p-2 border border-slate-700 text-slate-300 hover:border-red-500 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div data-testid="admin-project-editor" className="fixed inset-0 z-[70] bg-[#050B14]/90 backdrop-blur-md overflow-y-auto">
          <div className="max-w-3xl mx-auto my-10 glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl">{editing.id ? "Edit Project" : "New Project"}</h2>
              <button data-testid="admin-editor-close-btn" onClick={() => setEditing(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input data-testid="editor-name-input" placeholder="Project name *" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="px-4 py-3 text-sm" />
              <input data-testid="editor-slug-input" placeholder="Slug (auto if empty)" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="px-4 py-3 text-sm" />
              <input data-testid="editor-tagline-input" placeholder="Tagline" value={editing.tagline} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} className="px-4 py-3 text-sm sm:col-span-2" />
              <textarea data-testid="editor-description-input" placeholder="Description" rows={4} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="px-4 py-3 text-sm sm:col-span-2" />
              <div className="sm:col-span-2">
                <label className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-2">Project Logo — PNG transparent · 512×512 standard</label>
                <div className="flex items-center gap-4 flex-wrap">
                  {editing.logo ? (
                    <img src={editing.logo} alt="Project logo" data-testid="editor-logo-preview" className="h-16 w-16 object-contain border border-[#C5A059]/30 bg-[#0A1322] p-1.5" />
                  ) : (
                    <div data-testid="editor-logo-preview" className="h-16 w-16 border border-dashed border-slate-700 flex items-center justify-center text-slate-600 text-[0.5rem] font-mono text-center px-1">NO LOGO</div>
                  )}
                  <ImageCropUpload testidPrefix="editor-logo" onUploaded={(url) => setEditing({ ...editing, logo: url })} />
                  <input data-testid="editor-logo-url-input" placeholder="…or paste a logo URL" value={editing.logo || ""} onChange={(e) => setEditing({ ...editing, logo: e.target.value })} className="flex-1 min-w-[200px] px-4 py-3 text-xs font-mono" />
                  {editing.logo && (
                    <button type="button" data-testid="editor-logo-remove-btn" onClick={() => setEditing({ ...editing, logo: "" })} className="text-[0.62rem] font-mono uppercase tracking-wider text-slate-500 hover:text-red-400 transition-colors">Remove</button>
                  )}
                </div>
              </div>
              <select data-testid="editor-status-select" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="px-4 py-3 text-sm">
                {["ONGOING", "READY_TO_MOVE", "UPCOMING", "DELIVERED"].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
              <select data-testid="editor-category-select" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="px-4 py-3 text-sm">
                {["RESIDENTIAL", "COMMERCIAL", "INDUSTRIAL"].map((s) => <option key={s}>{s}</option>)}
              </select>
              <input data-testid="editor-city-input" placeholder="City *" value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} className="px-4 py-3 text-sm" />
              <input data-testid="editor-locality-input" placeholder="Locality / Sector" value={editing.locality} onChange={(e) => setEditing({ ...editing, locality: e.target.value })} className="px-4 py-3 text-sm" />
              <input data-testid="editor-address-input" placeholder="Full address" value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} className="px-4 py-3 text-sm sm:col-span-2" />
              <input data-testid="editor-rera-input" placeholder="RERA number" value={editing.rera_number} onChange={(e) => setEditing({ ...editing, rera_number: e.target.value })} className="px-4 py-3 text-sm" />
              <input data-testid="editor-possession-input" placeholder="Possession (e.g. March 2026)" value={editing.possession} onChange={(e) => setEditing({ ...editing, possession: e.target.value })} className="px-4 py-3 text-sm" />
              <input data-testid="editor-lat-input" placeholder="Map latitude (e.g. 30.6590)" value={editing.lat ?? ""} onChange={(e) => setEditing({ ...editing, lat: e.target.value })} className="px-4 py-3 text-sm" />
              <input data-testid="editor-lng-input" placeholder="Map longitude (e.g. 76.8350)" value={editing.lng ?? ""} onChange={(e) => setEditing({ ...editing, lng: e.target.value })} className="px-4 py-3 text-sm" />
              <input data-testid="editor-price-label-input" placeholder="Price label (e.g. From ₹1.44 Cr.)" value={editing.price_label} onChange={(e) => setEditing({ ...editing, price_label: e.target.value })} className="px-4 py-3 text-sm" />
              <input data-testid="editor-price-from-input" placeholder="Price from (numeric, ₹)" value={editing.price_from ?? ""} onChange={(e) => setEditing({ ...editing, price_from: e.target.value })} className="px-4 py-3 text-sm" />
              <input data-testid="editor-towers-input" placeholder="Towers" value={editing.total_towers ?? ""} onChange={(e) => setEditing({ ...editing, total_towers: e.target.value })} className="px-4 py-3 text-sm" />
              <input data-testid="editor-area-input" placeholder="Total area (e.g. 7+ acres)" value={editing.total_area} onChange={(e) => setEditing({ ...editing, total_area: e.target.value })} className="px-4 py-3 text-sm" />
              <input data-testid="editor-seo-title-input" placeholder="SEO title" value={editing.seo?.title || ""} onChange={(e) => setEditing({ ...editing, seo: { ...editing.seo, title: e.target.value } })} className="px-4 py-3 text-sm" />
              <input data-testid="editor-seo-keywords-input" placeholder="SEO keywords" value={editing.seo?.keywords || ""} onChange={(e) => setEditing({ ...editing, seo: { ...editing.seo, keywords: e.target.value } })} className="px-4 py-3 text-sm" />
              <textarea data-testid="editor-seo-description-input" placeholder="SEO description" rows={2} value={editing.seo?.description || ""} onChange={(e) => setEditing({ ...editing, seo: { ...editing.seo, description: e.target.value } })} className="px-4 py-3 text-sm sm:col-span-2" />
              <div className="sm:col-span-2">
                <label className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-2">Image URLs — one per line</label>
                <textarea data-testid="editor-images-input" rows={3} value={editing.images_text ?? ""} onChange={(e) => setEditing({ ...editing, images_text: e.target.value })} className="w-full px-4 py-3 text-xs font-mono" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-2">Configs — one per line: Config | Price label | Area</label>
                <textarea data-testid="editor-configs-input" rows={3} placeholder={"3 BHK | From ₹1.44 Cr. | 1,850 sq.ft"} value={editing.configs_text ?? ""} onChange={(e) => setEditing({ ...editing, configs_text: e.target.value })} className="w-full px-4 py-3 text-xs font-mono" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-2">Amenities — one per line: Name | Group</label>
                <textarea data-testid="editor-amenities-input" rows={3} placeholder={"Clubhouse | Lifestyle"} value={editing.amenities_text ?? ""} onChange={(e) => setEditing({ ...editing, amenities_text: e.target.value })} className="w-full px-4 py-3 text-xs font-mono" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-2">Zones (optional) — publish Residential & Commercial in the same project. One per line: Zone Label | Config | Price | Area</label>
                <textarea data-testid="editor-zones-input" rows={3} placeholder={"Residential Zone | 3 BHK | On Request | 1,850 sq.ft\nCommercial Zone | Showroom | On Request | 1,200 sq.ft"} value={editing.zones_text ?? ""} onChange={(e) => setEditing({ ...editing, zones_text: e.target.value })} className="w-full px-4 py-3 text-xs font-mono" />
                <p className="text-[0.6rem] text-slate-600 mt-1.5 font-mono">When zones exist, the project page shows zone tabs (e.g. Residential Zone / Commercial Zone) above the inventory table.</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-2">Videos — one per line: YouTube or MP4 URL | Title</label>
                <textarea data-testid="editor-videos-input" rows={3} placeholder={"https://youtube.com/watch?v=… | Walkthrough"} value={editing.videos_text ?? ""} onChange={(e) => setEditing({ ...editing, videos_text: e.target.value })} className="w-full px-4 py-3 text-xs font-mono" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-2">Documents / Brochures — one per line: Name | PDF URL</label>
                <textarea data-testid="editor-documents-input" rows={3} placeholder={"E-Brochure | https://…/brochure.pdf"} value={editing.documents_text ?? ""} onChange={(e) => setEditing({ ...editing, documents_text: e.target.value })} className="w-full px-4 py-3 text-xs font-mono" />
                <div className="mt-2">
                  <input id="editor-pdf-file" data-testid="editor-pdf-file-input" type="file" accept="application/pdf" className="hidden" onChange={uploadPdf} />
                  <label htmlFor="editor-pdf-file" data-testid="editor-pdf-upload-btn" className="outline-btn cursor-pointer">Upload PDF Brochure</label>
                </div>
              </div>
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input data-testid="editor-featured-checkbox" type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="accent-[#D4AF37] w-4 h-4" />
                Featured on homepage
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input data-testid="editor-hot-checkbox" type="checkbox" checked={!!editing.is_hot_selling} onChange={(e) => setEditing({ ...editing, is_hot_selling: e.target.checked })} className="accent-[#D4AF37] w-4 h-4" />
                Hot selling badge
              </label>
            </div>
            <div className="flex gap-4 mt-8">
              <button data-testid="admin-save-project-btn" onClick={save} disabled={saving || !editing.name || !editing.city} className="gold-btn disabled:opacity-50">
                {saving ? "Saving…" : "Save Project"}
              </button>
              <button data-testid="admin-cancel-project-btn" onClick={() => setEditing(null)} className="outline-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
