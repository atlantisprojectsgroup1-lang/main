import { useEffect, useState } from "react";
import { Phone, MapPin, Clock } from "lucide-react";
import api from "../lib/api";
import SEO from "../components/SEO";
import EnquiryForm from "../components/EnquiryForm";

export default function Contact() {
  const [company, setCompany] = useState(null);

  useEffect(() => {
    api.get("/company").then((r) => setCompany(r.data)).catch(() => {});
  }, []);

  const phones = company?.phones || { primary: "+91 9041795879", sales: "+91 9041795879" };

  return (
    <div data-testid="contact-page" className="pt-32 pb-24">
      <SEO title="Contact — Book a Private Site Visit" path="/contact"
        description="Reach ATLANTIS — call +91 9041795879 or request a private site visit. Corporate office: Sector 82A, Mohali, Punjab." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="eyebrow mb-3">Reach Us</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight mb-14">Begin Your <span className="gold-text italic">Journey</span></h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="glass-card p-7">
              <div className="flex items-center gap-3 mb-4">
                <Phone size={18} className="text-[#D4AF37]" />
                <h2 className="font-serif text-xl">Call Us</h2>
              </div>
              <div className="space-y-2 text-slate-300">
                <a data-testid="contact-phone-primary" href={`tel:${phones.primary?.replace(/\s/g, "")}`} className="block hover:text-[#E6C687] transition-colors">{phones.primary} <span className="text-xs text-slate-500 font-mono ml-2">PRIMARY</span></a>
                <a data-testid="contact-phone-sales" href={`tel:${phones.sales?.replace(/\s/g, "")}`} className="block hover:text-[#E6C687] transition-colors">{phones.sales} <span className="text-xs text-slate-500 font-mono ml-2">SALES</span></a>
              </div>
            </div>

            {(company?.offices || []).map((o, i) => (
              <div key={i} className="glass-card p-7" data-testid={`contact-office-${i}`}>
                <div className="flex items-center gap-3 mb-4">
                  <MapPin size={18} className="text-[#D4AF37]" />
                  <h2 className="font-serif text-xl">{o.name}</h2>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{o.address}, {o.city}</p>
                {o.email && (
                  <a href={`mailto:${o.email}`} data-testid={`contact-office-email-${i}`} className="block text-sm text-[#E6C687] hover:text-[#F3E5AB] mt-2 transition-colors">{o.email}</a>
                )}
                {company?.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" data-testid={`contact-office-website-${i}`} className="block text-xs font-mono text-slate-500 hover:text-[#E6C687] mt-1.5 transition-colors">{company.website.replace("https://", "")}</a>
                )}
              </div>
            ))}

            <div className="glass-card p-7">
              <div className="flex items-center gap-3 mb-4">
                <Clock size={18} className="text-[#D4AF37]" />
                <h2 className="font-serif text-xl">Office Hours</h2>
              </div>
              <p className="text-slate-300 text-sm">Mon – Sat: 10 AM – 7 PM</p>
              <p className="text-slate-500 text-sm mt-1">Sunday: By Appointment</p>
            </div>
          </div>

          <div className="glass-card p-8 lg:p-10 h-fit">
            <h2 className="font-serif text-2xl mb-2">Request a Call Back</h2>
            <p className="text-sm text-slate-400 mb-8">Our relationship team responds within 24 hours.</p>
            <EnquiryForm source="contact_page" testidPrefix="contact-enquiry" />
          </div>
        </div>
      </div>
    </div>
  );
}
