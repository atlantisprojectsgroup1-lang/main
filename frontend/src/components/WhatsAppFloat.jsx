import { useEffect, useState } from "react";
import api from "../lib/api";
import { MessageCircle } from "lucide-react";

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
      className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform duration-300 animate-float-slow">
      <MessageCircle size={26} className="text-white" fill="white" />
    </a>
  );
}
