import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import api, { formatApiError } from "../lib/api";

export default function EnquiryPopup() {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "", project: "", ptype: "", budget: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.get("/projects").then((r) => setProjects(r.data)).catch(() => {});
    api.get("/projects/meta/filters").then((r) => setTypes(r.data?.types || [])).catch(() => {});
    const show = () => setOpen(true);
    window.addEventListener("open-enquiry-popup", show);
    let t;
    if (!sessionStorage.getItem("atlantis_popup_seen")) {
      t = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem("atlantis_popup_seen", "1");
      }, 1800);
    }
    return () => { clearTimeout(t); window.removeEventListener("open-enquiry-popup", show); };
  }, []);

  const close = () => {
    setOpen(false);
    sessionStorage.setItem("atlantis_popup_seen", "1");
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const proj = projects.find((p) => p.id === form.project);
      await api.post("/leads", {
        name: form.name, phone: form.phone, email: form.email, message: form.message,
        project_id: form.project, project_name: proj?.name || "",
        budget: form.budget, config_interest: form.ptype, source: "enquiry_popup",
      });
      setDone(true);
      toast.success("Enquiry received. Our team will reach out within 24 hours.");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div data-testid="enquiry-popup-modal" className="fixed inset-0 z-[80] flex items-center justify-center px-4 bg-[#050B14]/85 backdrop-blur-md" onClick={close}>
      <div className="relative w-full max-w-md glass-card overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.7)]" onClick={(e) => e.stopPropagation()}>
        <div className="h-1.5 w-full bg-gradient-to-r from-[#9A7B38] via-[#D4AF37] to-[#F3E5AB]" />
        <button data-testid="enquiry-popup-close-btn" onClick={close} aria-label="Close"
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center border border-slate-700 text-slate-400 hover:text-white hover:border-[#C8102E] transition-colors">
          <X size={16} />
        </button>

        <div className="p-8 pt-7">
          <div className="flex flex-col items-center text-center mb-6">
            <img src="/assets/atlantis-logo.png" alt="ATLANTIS Group" className="h-10 w-auto object-contain mb-3" data-testid="enquiry-popup-logo" />
            <p className="eyebrow">Private Enquiry</p>
            <h2 className="font-serif text-2xl mt-2">Reserve Your <span className="gold-text italic">Residence</span></h2>
            <p className="text-xs text-slate-500 mt-1.5 font-light">Response within 24 hours · DPDP compliant</p>
          </div>

          {done ? (
            <div data-testid="enquiry-popup-success" className="text-center py-8">
              <p className="font-serif text-2xl gold-text mb-2">Thank You</p>
              <p className="text-sm text-slate-400">Our relationship team will reach you shortly to discuss availability, pricing and a private site visit.</p>
              <button data-testid="enquiry-popup-done-close-btn" onClick={close} className="outline-btn mt-6">Continue Browsing</button>
            </div>
          ) : (
            <form data-testid="enquiry-popup-form" onSubmit={submit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <select data-testid="popup-enquiry-project-select" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} className="px-3.5 py-3 text-xs">
                  <option value="">Project — Any</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.city}</option>)}
                </select>
                <select data-testid="popup-enquiry-budget-select" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className="px-3.5 py-3 text-xs">
                  <option value="">Budget — Any</option>
                  <option value="upto-1.5cr">Up to ₹1.5 Cr</option>
                  <option value="1.5-2cr">₹1.5 – 2 Cr</option>
                  <option value="2-3cr">₹2 – 3 Cr</option>
                  <option value="3cr-plus">₹3 Cr+</option>
                </select>
              </div>
              <select data-testid="popup-enquiry-ptype-select" value={form.ptype} onChange={(e) => setForm({ ...form, ptype: e.target.value })} className="w-full px-3.5 py-3 text-xs">
                <option value="">Property Type — Any</option>
                {types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input data-testid="popup-enquiry-name-input" required placeholder="Your name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 text-sm" />
              <input data-testid="popup-enquiry-phone-input" required placeholder="Mobile number" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 text-sm" />
              <input data-testid="popup-enquiry-email-input" type="email" placeholder="Email address" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 text-sm" />
              <textarea data-testid="popup-enquiry-message-input" rows={2} placeholder="Anything specific? (config, floor, facing…)" value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-3 text-sm" />
              <button data-testid="popup-enquiry-submit-btn" type="submit" disabled={loading} className="gold-btn w-full justify-center disabled:opacity-60">
                {loading ? "Submitting…" : "Request a Call Back"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
