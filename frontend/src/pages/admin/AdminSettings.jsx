import { useEffect, useState } from "react";
import { toast } from "sonner";
import api, { formatApiError } from "../../lib/api";

const FIELDS = [
  { key: "whatsapp_number", label: "WhatsApp Business Number", hint: "Digits only, with country code — powers the floating chat button" },
  { key: "whatsapp_default_message", label: "WhatsApp Prefill Message", hint: "Default message for the float button" },
  { key: "whatsapp_cloud_api_token", label: "WhatsApp Cloud API Token", hint: "Enables auto-replies, brochure delivery & OTP (Phase 2)" },
  { key: "whatsapp_phone_number_id", label: "WhatsApp Phone Number ID", hint: "From Meta Business Suite" },
  { key: "meta_pixel_id", label: "Meta Pixel ID", hint: "Facebook/Instagram ad tracking" },
  { key: "ga4_id", label: "GA4 Measurement ID", hint: "Google Analytics 4 (G-XXXXXXX)" },
  { key: "gtm_id", label: "Google Tag Manager ID", hint: "GTM-XXXXXXX" },
  { key: "cloudinary_cloud_name", label: "Cloudinary Cloud Name", hint: "Media CDN with auto WebP/AVIF (Phase 2)" },
  { key: "cloudinary_api_key", label: "Cloudinary API Key", hint: "" },
  { key: "smtp_host", label: "SMTP Host", hint: "Transactional email (Phase 2)" },
  { key: "smtp_user", label: "SMTP User", hint: "" },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [company, setCompany] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/admin/settings").then((r) => setSettings(r.data)).catch(() => {});
    api.get("/admin/company").then((r) => setCompany(r.data)).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings", settings);
      await api.put("/admin/company", company);
      toast.success("Settings saved.");
    } catch (e) {
      toast.error(formatApiError(e, "Save failed."));
    } finally {
      setSaving(false);
    }
  };

  if (!settings || !company) return <div className="text-slate-500 font-mono text-xs tracking-widest uppercase">Loading settings…</div>;

  const socialVal = (name) => (company.social_links || []).find((s) => s.name === name)?.url || "";
  const setSocial = (name, url) => {
    const links = [...(company.social_links || [])];
    const i = links.findIndex((s) => s.name === name);
    if (i >= 0) links[i] = { ...links[i], url };
    else links.push({ name, url });
    setCompany({ ...company, social_links: links });
  };

  return (
    <div data-testid="admin-settings-page" className="max-w-3xl">
      <h1 className="font-serif text-3xl mb-8">Global Settings</h1>

      <div className="glass-card p-7 mb-6">
        <h2 className="font-serif text-xl mb-2">Brand</h2>
        <p className="text-xs text-slate-500 mb-5 font-light">Core identity shown across the public site.</p>
        <div className="space-y-4">
          <div>
            <label className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-2">Tagline</label>
            <input data-testid="settings-tagline-input" value={company.tagline || ""} onChange={(e) => setCompany({ ...company, tagline: e.target.value })} className="w-full px-4 py-3 text-sm" />
          </div>
          <div>
            <label className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-2">About (long)</label>
            <textarea data-testid="settings-about-input" rows={4} value={company.about_long || ""} onChange={(e) => setCompany({ ...company, about_long: e.target.value })} className="w-full px-4 py-3 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-2">Primary Phone</label>
              <input data-testid="settings-phone-primary-input" value={company.phones?.primary || ""} onChange={(e) => setCompany({ ...company, phones: { ...company.phones, primary: e.target.value } })} className="w-full px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-2">Sales Phone</label>
              <input data-testid="settings-phone-sales-input" value={company.phones?.sales || ""} onChange={(e) => setCompany({ ...company, phones: { ...company.phones, sales: e.target.value } })} className="w-full px-4 py-3 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-2">Social Media Links</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {["Instagram", "LinkedIn", "Facebook", "YouTube"].map((name) => (
                <input key={name} data-testid={`settings-social-${name.toLowerCase()}-input`} placeholder={`${name} URL`} value={socialVal(name)}
                  onChange={(e) => setSocial(name, e.target.value)} className="px-4 py-3 text-sm font-mono" />
              ))}
            </div>
            <p className="text-[0.62rem] text-slate-600 mt-1.5 font-mono">Saved links appear as icons in the site footer.</p>
          </div>
          <div>
            <label className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-2">Builder Profile</label>
            <div className="space-y-3">
              <input data-testid="settings-builder-focus-input" placeholder="Focus (e.g. Luxury Residential & Commercial)" value={company.builder?.focus || ""}
                onChange={(e) => setCompany({ ...company, builder: { ...(company.builder || {}), focus: e.target.value } })} className="w-full px-4 py-3 text-sm" />
              <input data-testid="settings-builder-regions-input" placeholder="Regions (e.g. Mohali · Zirakpur · Aerocity)" value={company.builder?.regions || ""}
                onChange={(e) => setCompany({ ...company, builder: { ...(company.builder || {}), regions: e.target.value } })} className="w-full px-4 py-3 text-sm" />
              <input data-testid="settings-builder-promise-input" placeholder="Delivery promise" value={company.builder?.delivery_promise || ""}
                onChange={(e) => setCompany({ ...company, builder: { ...(company.builder || {}), delivery_promise: e.target.value } })} className="w-full px-4 py-3 text-sm" />
            </div>
            <p className="text-[0.62rem] text-slate-600 mt-1.5 font-mono">Shown in the Builder Profile section on About and the builder card on every project page.</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-7 mb-6">
        <h2 className="font-serif text-xl mb-2">Integrations & Tracking</h2>
        <p className="text-xs text-slate-500 mb-5 font-light">Empty fields keep features gracefully disabled. Paste your IDs and save — tracking pixels activate site-wide.</p>
        <div className="space-y-4">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 block mb-1.5">{f.label}</label>
              <input data-testid={`settings-${f.key.replace(/_/g, "-")}-input`} value={settings[f.key] || ""}
                onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })} className="w-full px-4 py-3 text-sm font-mono" />
              {f.hint && <p className="text-[0.62rem] text-slate-600 mt-1 font-mono">{f.hint}</p>}
            </div>
          ))}
        </div>
      </div>

      <button data-testid="settings-save-btn" onClick={save} disabled={saving} className="gold-btn disabled:opacity-50">
        {saving ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
}
