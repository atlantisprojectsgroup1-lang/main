import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Lock } from "lucide-react";

const LINKS = [
  { to: "/projects", label: "Projects", testid: "nav-link-projects" },
  { to: "/portfolio", label: "Portfolio", testid: "nav-link-portfolio" },
  { to: "/about", label: "About", testid: "nav-link-about" },
  { to: "/blog", label: "Insights", testid: "nav-link-blog" },
  { to: "/contact", label: "Contact", testid: "nav-link-contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header data-testid="header-navbar" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "backdrop-blur-xl bg-[#050B14]/85 border-b border-[#C5A059]/20" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" data-testid="nav-logo-link" className="flex items-center gap-3 group">
          <div className="w-9 h-9 border border-[#D4AF37]/70 flex items-center justify-center rotate-45 group-hover:rotate-[135deg] transition-transform duration-700">
            <span className="font-serif text-lg text-[#E6C687] -rotate-45 group-hover:-rotate-[135deg] transition-transform duration-700">A</span>
          </div>
          <div className="leading-none">
            <span className="font-serif text-xl tracking-[0.3em] text-slate-100">ATLANTIS</span>
            <span className="block text-[0.55rem] font-mono tracking-[0.35em] text-[#C5A059]/80 mt-1">GROUP · TRICITY</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} data-testid={l.testid} className="text-xs font-mono uppercase tracking-[0.2em] text-slate-300 hover:text-[#E6C687] transition-colors duration-300">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <Link to="/admin" data-testid="nav-link-admin" className="text-slate-500 hover:text-[#E6C687] transition-colors" title="Admin">
            <Lock size={15} />
          </Link>
          <button data-testid="nav-cta-enquire-button" onClick={() => navigate("/contact")} className="gold-btn">Enquire</button>
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
          <Link to="/admin" data-testid="mobile-nav-link-admin" onClick={() => setOpen(false)} className="text-sm font-mono uppercase tracking-[0.2em] text-slate-500">Admin</Link>
          <button data-testid="mobile-nav-cta-enquire" onClick={() => { setOpen(false); navigate("/contact"); }} className="gold-btn justify-center mt-2">Enquire</button>
        </div>
      )}
    </header>
  );
}
