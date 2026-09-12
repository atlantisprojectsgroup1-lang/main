import { useState } from "react";
import api, { formatApiError } from "../lib/api";
import { toast } from "sonner";

export default function EnquiryForm({ projectId = "", projectName = "", source = "website", compact = false, testidPrefix = "enquiry" }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/leads", { ...form, project_id: projectId, project_name: projectName, source });
      setDone(true);
      toast.success("Enquiry received. Our team will reach out within 24 hours.");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div data-testid={`${testidPrefix}-success`} className="glass-card p-8 text-center">
        <p className="font-serif text-2xl gold-text mb-2">Thank You</p>
        <p className="text-sm text-slate-400">Our relationship team will reach you within 24 hours to discuss availability, pricing and a private site visit.</p>
      </div>
    );
  }

  return (
    <form data-testid={`${testidPrefix}-form`} onSubmit={submit} className={compact ? "space-y-3" : "space-y-4"}>
      <div className={compact ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
        <input data-testid={`${testidPrefix}-name-input`} required placeholder="Your name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 text-sm" />
        <input data-testid={`${testidPrefix}-phone-input`} required placeholder="Mobile number" value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 text-sm" />
      </div>
      {!compact && (
        <input data-testid={`${testidPrefix}-email-input`} type="email" placeholder="Email (optional)" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 text-sm" />
      )}
      <textarea data-testid={`${testidPrefix}-message-input`} rows={compact ? 2 : 4}
        placeholder={projectName ? `I'm interested in ${projectName}…` : "Tell us what you're looking for…"}
        value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-3 text-sm" />
      <button data-testid={`${testidPrefix}-submit-btn`} type="submit" disabled={loading} className="gold-btn w-full justify-center disabled:opacity-60">
        {loading ? "Submitting…" : "Request a Call Back"}
      </button>
      <p className="text-[0.65rem] font-mono text-slate-500 text-center tracking-wider">
        By submitting you consent to be contacted by ATLANTIS. DPDP compliant.
      </p>
    </form>
  );
}
