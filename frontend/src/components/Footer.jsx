import { Link } from "react-router-dom";
import { Phone, MapPin, Mail, Instagram, Linkedin, Facebook, Youtube } from "lucide-react";

const SOCIAL_ICONS = { Instagram, LinkedIn: Linkedin, Facebook, YouTube: Youtube };

export default function Footer({ company }) {
  const office = company?.offices?.[0];
  const phone = company?.phones?.primary || "+91 9041795879";
  return (
    <footer data-testid="site-footer" className="border-t border-[#C5A059]/20 bg-[#050B14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-5 gap-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <img src="/assets/atlantis-logo.png" alt="ATLANTIS Group" className="h-9 w-auto object-contain" />
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md">
            {company?.tagline || "Building Tomorrow's Landmarks"}. Premium residential & commercial developments across Mohali, Zirakpur and Aerocity — low-density, RERA registered, built to last.
          </p>
          <div data-testid="footer-social-links" className="flex items-center gap-3 mt-6">
            {(company?.social_links || []).filter((s) => s.url).map((s) => {
              const Icon = SOCIAL_ICONS[s.name];
              return (
                <a key={s.name} data-testid={`footer-social-${s.name.toLowerCase()}`} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name}
                  className="w-10 h-10 border border-[#C5A059]/30 flex items-center justify-center text-slate-400 hover:text-[#F3E5AB] hover:border-[#D4AF37] transition-colors duration-300">
                  {Icon ? <Icon size={16} /> : <span className="text-[0.55rem] font-mono">{s.name.slice(0, 2).toUpperCase()}</span>}
                </a>
              );
            })}
          </div>
          <p className="text-xs font-mono text-slate-500 mt-6 tracking-wider">RERA Registered · Punjab Real Estate Regulatory Authority</p>
        </div>
        <div>
          <h4 className="eyebrow mb-5">Explore</h4>
          <div className="flex flex-col gap-3 text-sm text-slate-400">
            <Link to="/projects" data-testid="footer-link-projects" className="hover:text-[#E6C687] transition-colors">Projects</Link>
            <Link to="/portfolio" data-testid="footer-link-portfolio" className="hover:text-[#E6C687] transition-colors">Delivered Portfolio</Link>
            <Link to="/about" data-testid="footer-link-about" className="hover:text-[#E6C687] transition-colors">About Us</Link>
            <Link to="/blog" data-testid="footer-link-blog" className="hover:text-[#E6C687] transition-colors">Blogs & Updates</Link>
          </div>
        </div>
        <div>
          <h4 className="eyebrow mb-5">Legal</h4>
          <div className="flex flex-col gap-3 text-sm text-slate-400">
            <Link to="/contact" data-testid="footer-link-contact" className="hover:text-[#E6C687] transition-colors">Contact Us</Link>
            <Link to="/privacy-policy" data-testid="footer-link-privacy" className="hover:text-[#E6C687] transition-colors">Privacy Policy</Link>
            <Link to="/terms-and-conditions" data-testid="footer-link-terms" className="hover:text-[#E6C687] transition-colors">Terms & Conditions</Link>
            <Link to="/payment-refund-policy" data-testid="footer-link-payment-refund" className="hover:text-[#E6C687] transition-colors">Payment & Refund Policy</Link>
            <Link to="/booking-cancellation-policy" data-testid="footer-link-booking-policy" className="hover:text-[#E6C687] transition-colors">Booking & Cancellation Policy</Link>
            <Link to="/admin" data-testid="footer-link-admin" className="hover:text-[#E6C687] transition-colors">Admin Login</Link>
          </div>
        </div>
        <div>
          <h4 className="eyebrow mb-5">Reach Us</h4>
          <div className="flex flex-col gap-4 text-sm text-slate-400">
            <a href={`tel:${phone.replace(/\s/g, "")}`} data-testid="footer-phone-link" className="flex items-center gap-2 hover:text-[#E6C687] transition-colors">
              <Phone size={14} className="text-[#C5A059]" /> {phone}
            </a>
            {office?.email && (
              <a href={`mailto:${office.email}`} data-testid="footer-email-link" className="flex items-center gap-2 hover:text-[#E6C687] transition-colors">
                <Mail size={14} className="text-[#C5A059]" /> {office.email}
              </a>
            )}
            {office && (
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-[#C5A059] mt-1 shrink-0" />
                <span>{office.address}, {office.city}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-[#C5A059]/10 py-6 px-4">
        <p className="text-xs font-mono text-slate-500 tracking-wider text-center" data-testid="footer-channel-partner-credit">
          This website is designed, published and managed by an authorised channel partner of ATLANTIS —{" "}
          <a href="https://qualityrealestate.in/" target="_blank" rel="noopener noreferrer" data-testid="footer-quality-real-estate-link"
            className="text-[#E6C687] hover:text-[#F3E5AB] underline underline-offset-4 decoration-[#C5A059]/40 transition-colors">
            QUALITY REAL ESTATE
          </a>
        </p>
        <p className="text-[0.65rem] font-mono text-slate-600 tracking-wider text-center mt-2.5" data-testid="footer-marketing-disclaimer">
          This website is published for marketing, branding and promotional purposes only. All project details are indicative; please verify with the developer and Punjab RERA.
        </p>
        <p className="text-xs font-mono text-slate-600 tracking-widest text-center mt-3">© {new Date().getFullYear()} ATLANTIS GROUP · ALL RIGHTS RESERVED</p>
      </div>
    </footer>
  );
}
