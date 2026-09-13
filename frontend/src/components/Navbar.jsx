import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Lock, ChevronDown, Phone } from "lucide-react";
import api from "../lib/api";

const LINKS = [
  { to: "/projects", label: "Projects", testid: "nav-link-projects" },
  { to: "/portfolio", label: "Portfolio", testid: "nav-link-portfolio" },
  { to: "/about", label: "About Us", testid: "nav-link-about" },
  { to: "/blog", label: "Insights", testid: "nav-link-blog" },
  { to: "/contact", label: "Contact Us", testid: "nav-link-contact" },
];

const POLICY_LINKS = [
  { to: "/privacy-policy", label: "Privacy Policy", testid: "nav-link-privacy" },
  { to: "/terms-and-conditions", label: "Terms & Conditions", testid: "nav-link-terms" },
  { to: "/payment-refund-policy", label: "Payment & Refund Policy", testid: "nav-link-payment-refund" },
  { to: "/booking-cancellation-policy", label: "Booking & Cancellation", testid: "nav-link-booking-policy" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [phone, setPhone] = useState("+91 97083 97083");

  useEffect(() => {
    api.get("/company").then((r) => setPhone(r.data?.phones?.primary || "+91 97083 97083")).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header data-testid="header-navbar" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "backdrop-blur-xl bg-[#050B14]/85 border-b border-[#C5A059]/20" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" data-testid="nav-logo-link" className="flex items-center gap-3 group">
          <img src="/assets/atlantis-logo.png" alt="ATLANTIS Group" className="h-8 w-auto object-contain" />
          <span className="block text-xs font-mono tracking-[0.35em] text-[#C5A059]/80 self-end pb-0.5">GROUP</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-5">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} data-testid={l.testid} className="text-[0.62rem] font-mono uppercase tracking-[0.16em] text-slate-300 hover:text-[#E6C687] transition-colors duration-300 whitespace-nowrap">
              {l.label}
            </Link>
          ))}
          <div className="relative group" data-testid="nav-policies-dropdown">
            <button data-testid="nav-policies-toggle" className="flex items-center gap-1.5 text-[0.62rem] font-mono uppercase tracking-[0.16em] text-slate-300 hover:text-[#E6C687] transition-colors duration-300 whitespace-nowrap">
              Policies <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-300" />
            </button>
            <div className="absolute right-0 top-full pt-4 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300">
              <div className="glass-card py-2 w-64 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
                {POLICY_LINKS.map((l) => (
                  <Link key={l.to} to={l.to} data-testid={`dropdown-${l.testid}`}
                    className="px-5 py-3 text-[0.62rem] font-mono uppercase tracking-[0.16em] text-slate-300 hover:text-[#F3E5AB] hover:bg-[#D4AF37]/10 transition-colors">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <a href={`tel:${phone.replace(/\s/g, "")}`} data-testid="header-call-btn" title={`Call ${phone}`}
            className="flex items-center gap-2.5 text-[#E6C687] hover:text-[#F3E5AB] transition-colors group/call">
            <span className="w-9 h-9 rounded-full border border-[#C5A059]/40 flex items-center justify-center group-hover/call:border-[#D4AF37] group-hover/call:shadow-[0_0_16px_rgba(212,175,55,0.35)] transition-all duration-300">
              <Phone size={14} />
            </span>
            <span className="hidden xl:inline text-xs font-mono tracking-wider">{phone}</span>
          </a>
          <Link to="/admin" data-testid="nav-link-admin" className="text-slate-500 hover:text-[#E6C687] transition-colors" title="Admin">
            <Lock size={15} />
          </Link>
          <button data-testid="nav-cta-enquire-button" onClick={() => window.dispatchEvent(new Event("open-enquiry-popup"))} className="gold-btn">Enquire</button>
        </div>

        <button data-testid="nav-mobile-menu-btn" className="lg:hidden text-slate-200" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden backdrop-blur-xl bg-[#050B14]/95 border-t border-[#C5A059]/20 px-6 py-6 flex flex-col gap-5">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} data-testid={`mobile-${l.testid}`} onClick={() => setOpen(false)} className="text-sm font-mono uppercase tracking-[0.2em] text-slate-200">
              {l.label}
            </Link>
          ))}
          <p className="text-[0.55rem] font-mono uppercase tracking-[0.3em] text-[#C5A059]/70 pt-3 border-t border-slate-800">Policies</p>
          {POLICY_LINKS.map((l) => (
            <Link key={l.to} to={l.to} data-testid={`mobile-${l.testid}`} onClick={() => setOpen(false)} className="text-sm font-mono uppercase tracking-[0.2em] text-slate-400">
              {l.label}
            </Link>
          ))}
          <a href={`tel:${phone.replace(/\s/g, "")}`} data-testid="mobile-header-call-btn" className="flex items-center gap-2.5 text-sm font-mono uppercase tracking-[0.2em] text-[#E6C687] pt-3 border-t border-slate-800">
            <Phone size={15} /> Call {phone}
          </a>
          <Link to="/admin" data-testid="mobile-nav-link-admin" onClick={() => setOpen(false)} className="text-sm font-mono uppercase tracking-[0.2em] text-slate-500">Admin</Link>
          <button data-testid="mobile-nav-cta-enquire" onClick={() => { setOpen(false); window.dispatchEvent(new Event("open-enquiry-popup")); }} className="gold-btn justify-center mt-2">Enquire</button>
        </div>
      )}
    </header>
  );
}
