import { useEffect, useState } from "react";
import api from "../lib/api";

export default function WhatsAppFloat() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.get("/settings/public").then((r) => setSettings(r.data)).catch(() => {});
  }, []);

  if (!settings?.whatsapp_number) return null;
  const msg = encodeURIComponent(settings.whatsapp_default_message || "Hi, I'm interested in ATLANTIS projects.");
  return (
    <a data-testid="whatsapp-floating-btn" href={`https://wa.me/${settings.whatsapp_number}?text=${msg}`}
      target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
      className="fixed bottom-24 right-6 z-50 group">
      <span className="absolute inset-0 rounded-full bg-[#D4AF37]/40 blur-lg scale-90 group-hover:scale-110 group-hover:bg-[#D4AF37]/60 transition-all duration-500" />
      <span className="relative block w-14 h-14 rounded-full overflow-hidden border border-[#D4AF37]/60 shadow-[0_10px_30px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(243,229,171,0.5)] group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300 animate-float-slow">
        <img src="/assets/wa-3d-black-gold.jpg" alt="WhatsApp" className="w-full h-full object-cover scale-[1.12]" draggable={false} />
      </span>
      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#D4AF37] border-2 border-[#050B14] animate-pulse" />
    </a>
  );
}
