import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "../../lib/api";
import ImageCropUpload from "../../components/ImageCropUpload";

const EMPTY_MEMBER = { name: "", designation: "", group: "Leadership", photo: "", bio: "", linkedin: "", sort_order: 10 };

export default function AdminTeam() {
  const [team, setTeam] = useState([]);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/team").then((r) => setTeam(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const groups = [...new Set(team.map((m) => m.group || "General"))];

  const save = async () => {
    if (!editing.name.trim()) return;
    setSaving(true);
    try {
      const m = { ...editing, sort_order: Number(editing.sort_order) || 10 };
      if (m.id) await api.put(`/admin/team/${m.id}`, m);
      else await api.post("/admin/team", m);
      toast.success("Team member saved.");
      setEditing(null);
      load();
    } catch (e) {
      toast.error(formatApiError(e, "Save failed."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Remove this team member?")) return;
    await api.delete(`/admin/team/${id}`);
    toast.success("Removed.");
    load();
  };

  return (
    <div data-testid="admin-team-page">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl">Team Folder</h1>
        <button data-testid="admin-add-member-btn" onClick={() => setEditing({ ...EMPTY_MEMBER })} className="gold-btn">
          <Plus size={14} /> Add Member
        </button>
      </div>

      {groups.map((g) => (
        <div key={g} className="mb-10" data-testid={`admin-team-group-${g.replace(/\W+/g, "-").toLowerCase()}`}>
          <div className="flex items-center gap-3 mb-4">
            <FolderOpen size={16} className="text-[#D4AF37]" />
            <h2 className="font-serif text-xl">{g}</h2>
            <span className="text-[0.6rem] font-mono text-slate-500 tracking-wider">{team.filter((m) => (m.group || "General") === g).length} members</span>
          </div>
          <div className="glass-card overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {team.filter((m) => (m.group || "General") === g).map((m) => (
                  <tr key={m.id} data-testid={`admin-team-row-${m.id}`} className="border-b border-slate-800/50 hover:bg-[#D4AF37]/5">
                    <td className="px-5 py-3 w-14">
                      {m.photo ? <img src={m.photo} alt={m.name} className="h-10 w-10 object-cover border border-[#C5A059]/30" /> : <div className="h-10 w-10 border border-dashed border-slate-700" />}
                    </td>
                    <td className="px-5 py-3 font-serif text-base">{m.name}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs font-mono uppercase tracking-wider">{m.designation}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button data-testid={`admin-edit-member-${m.id}`} onClick={() => setEditing({ ...m })} className="p-2 border border-slate-700 text-slate-300 hover:border-[#D4AF37] hover:text-[#E6C687] transition-colors"><Pencil size={13} /></button>
                        <button data-testid={`admin-delete-member-${m.id}`} onClick={() => remove(m.id)} className="p-2 border border-slate-700 text-slate-300 hover:border-red-500 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {editing && (
        <div data-testid="admin-member-editor" className="fixed inset-0 z-[70] bg-[#050B14]/90 backdrop-blur-md overflow-y-auto">
          <div className="max-w-2xl mx-auto my-10 glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl">{editing.id ? "Edit Member" : "Add Member"}</h2>
              <button data-testid="member-editor-close-btn" onClick={() => setEditing(null)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input data-testid="member-name-input" placeholder="Full name *" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="px-4 py-3 text-sm" />
              <input data-testid="member-designation-input" placeholder="Designation" value={editing.designation} onChange={(e) => setEditing({ ...editing, designation: e.target.value })} className="px-4 py-3 text-sm" />
              <div>
                <label className="text-[0.6rem] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-1.5">Folder / Group</label>
                <input data-testid="member-group-input" list="team-groups" placeholder="e.g. Leadership, Sales, Site" value={editing.group} onChange={(e) => setEditing({ ...editing, group: e.target.value })} className="w-full px-4 py-3 text-sm" />
                <datalist id="team-groups">
                  {["Leadership", "Sales & CRM", "Site & Construction", "Marketing", "Channel Relations", ...groups].map((g) => <option key={g} value={g} />)}
                </datalist>
              </div>
              <input data-testid="member-linkedin-input" placeholder="LinkedIn URL (optional)" value={editing.linkedin} onChange={(e) => setEditing({ ...editing, linkedin: e.target.value })} className="px-4 py-3 text-sm self-end" />
              <textarea data-testid="member-bio-input" placeholder="Short bio" rows={3} value={editing.bio} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} className="px-4 py-3 text-sm sm:col-span-2" />
              <div className="sm:col-span-2">
                <label className="text-[0.6rem] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-2">Photo — cropped to 512×512 PNG</label>
                <div className="flex items-center gap-4 flex-wrap">
                  {editing.photo ? (
                    <img src={editing.photo} alt={editing.name} data-testid="member-photo-preview" className="h-16 w-16 object-cover border border-[#C5A059]/30" />
                  ) : (
                    <div data-testid="member-photo-preview" className="h-16 w-16 border border-dashed border-slate-700" />
                  )}
                  <ImageCropUpload testidPrefix="member-photo" label="Upload & Crop Photo" onUploaded={(url) => setEditing({ ...editing, photo: url })} />
                  <input data-testid="member-photo-url-input" placeholder="…or paste photo URL" value={editing.photo} onChange={(e) => setEditing({ ...editing, photo: e.target.value })} className="flex-1 min-w-[200px] px-4 py-3 text-xs font-mono" />
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button data-testid="member-save-btn" onClick={save} disabled={saving || !editing.name.trim()} className="gold-btn disabled:opacity-50">{saving ? "Saving…" : "Save Member"}</button>
              <button data-testid="member-cancel-btn" onClick={() => setEditing(null)} className="outline-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
