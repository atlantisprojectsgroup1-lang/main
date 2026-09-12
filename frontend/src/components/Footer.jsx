import { Link } from "react-router-dom";
import { Phone, MapPin } from "lucide-react";

export default function Footer({ company }) {
  const office = company?.offices?.[0];
  const phone = company?.phones?.primary || "+91 97083 97083";
  return (
    <footer data-testid="site-footer" className="border-t border-[#C5A059]/20 bg-[#050B14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 border border-[#D4AF37]/70 flex items-center justify-center rotate-45">
              <span className="font-serif text-lg text-[#E6C687] -rotate-45">A</span>
            </div>
            <span className="font-serif text-xl tracking-[0.3em]">ATLANTIS</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md">
            {company?.tagline || "Building Tomorrow's Landmarks"}. Premium residential & commercial developments across Mohali, Zirakpur and Aerocity — low-density, RERA registered, built to last.
          </p>
          <p className="text-xs font-mono text-slate-500 mt-6 tracking-wider">RERA Registered · Punjab Real Estate Regulatory Authority</p>
        </div>
        <div>
          <h4 className="eyebrow mb-5">Explore</h4>
          <div className="flex flex-col gap-3 text-sm text-slate-400">
            <Link to="/projects" data-testid="footer-link-projects" className="hover:text-[#E6C687] transition-colors">Projects</Link>
            <Link to="/portfolio" data-testid="footer-link-portfolio" className="hover:text-[#E6C687] transition-colors">Delivered Portfolio</Link>
            <Link to="/about" data-testid="footer-link-about" className="hover:text-[#E6C687] transition-colors">About the Group</Link>
            <Link to="/blog" data-testid="footer-link-blog" className="hover:text-[#E6C687] transition-colors">Insights</Link>
            <Link to="/contact" data-testid="footer-link-contact" className="hover:text-[#E6C687] transition-colors">Contact</Link>
          </div>
        </div>
        <div>
          <h4 className="eyebrow mb-5">Reach Us</h4>
          <div className="flex flex-col gap-4 text-sm text-slate-400">
            <a href={`tel:${phone.replace(/\s/g, "")}`} data-testid="footer-phone-link" className="flex items-center gap-2 hover:text-[#E6C687] transition-colors">
              <Phone size={14} className="text-[#C5A059]" /> {phone}
            </a>
            {office && (
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-[#C5A059] mt-1 shrink-0" />
                <span>{office.address}, {office.city}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-[#C5A059]/10 py-6 text-center">
        <p className="text-xs font-mono text-slate-600 tracking-widest">© {new Date().getFullYear()} ATLANTIS GROUP · ALL RIGHTS RESERVED</p>
      </div>
    </footer>
  );
}
