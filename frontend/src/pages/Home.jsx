import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Building2, Landmark, Factory, ShieldCheck, Compass, Users, Award } from "lucide-react";
import api from "../lib/api";
import SEO from "../components/SEO";
import Coverflow from "../components/Coverflow";
import ProjectCard from "../components/ProjectCard";
import EnquiryForm from "../components/EnquiryForm";

const HERO_BG = "https://atlantisgroup.in/assets/images/grand/renders/grand-arrival-night.webp";

function Counter({ value, suffix = "", testid }) {
  const [n, setN] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (t) => {
        const p = Math.min((t - start) / 1600, 1);
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);
  return <span ref={ref} data-testid={testid}>{n}{suffix}</span>;
}

const fade = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } };

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [company, setCompany] = useState(null);
  const [blog, setBlog] = useState([]);
  const [tab, setTab] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/projects").then((r) => setProjects(r.data)).catch(() => {});
    api.get("/company").then((r) => setCompany(r.data)).catch(() => {});
    api.get("/blog").then((r) => setBlog(r.data.slice(0, 3))).catch(() => {});
  }, []);

  const filtered = tab === "ALL" ? projects : projects.filter((p) => p.status === tab);
  const hotProjects = projects.filter((p) => p.is_hot_selling);

  const heroSlides = projects.flatMap((p) => (p.images || []).map((img) => ({ url: img.url, alt: img.alt, name: p.name, slug: p.slug })));
  const [heroIdx, setHeroIdx] = useState(0);
  useEffect(() => {
    if (heroSlides.length < 2) return;
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, [heroSlides.length]);
  const coverItems = projects.filter((p) => p.featured).map((p) => ({
    key: p.id, image: p.images?.[0]?.url || HERO_BG, title: p.name,
    eyebrow: p.status, subtitle: `${p.locality}, ${p.city} · ${p.price_label}`, slug: p.slug,
  }));
  const stats = company?.stats || {};

  const jsonLd = {
    "@context": "https://schema.org", "@type": "RealEstateAgent",
    name: "ATLANTIS Group", slogan: company?.tagline,
    telephone: company?.phones?.primary, areaServed: ["Mohali", "Zirakpur", "Aerocity", "Chandigarh Tricity"],
  };

  return (
    <div data-testid="home-page">
      <SEO title="Premium Real Estate Developers in Chandigarh Tricity" path="/"
        description="ATLANTIS builds luxury 3/4 BHK residences, penthouses & commercial landmarks across Mohali, Zirakpur & Aerocity. RERA registered. Low-density. Built to last."
        jsonLd={jsonLd} />

      {/* HERO */}
      <section data-testid="hero-section" className="relative min-h-screen flex flex-col justify-end hero-grain overflow-hidden">
        <div className="absolute inset-0">
          {(heroSlides.length ? heroSlides : [{ url: HERO_BG, alt: "ATLANTIS landmark residences at night" }]).map((s, i) => (
            <img key={`${s.url}-${i}`} src={s.url} alt={s.alt || "ATLANTIS project"} data-testid={`hero-slide-${i}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1400ms] ease-out ${i === heroIdx ? "opacity-100" : "opacity-0"}`}
              loading={i === 0 ? "eager" : "lazy"} />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/70 to-[#050B14]/30" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#C8102E]/25 via-transparent to-transparent" />
          {heroSlides.length > 1 && (
            <div className="absolute bottom-6 right-6 z-10 hidden sm:flex flex-col items-end gap-3">
              {heroSlides[heroIdx]?.name && (
                <Link to={`/projects/${heroSlides[heroIdx].slug}`} data-testid="hero-slide-caption"
                  className="glass-card px-4 py-2.5 text-right hover:border-[#D4AF37]/60 transition-colors">
                  <p className="text-[0.55rem] font-mono uppercase tracking-[0.25em] text-[#E6C687]/80">Now Showcasing</p>
                  <p className="font-serif text-lg text-slate-100 leading-tight">{heroSlides[heroIdx].name}</p>
                </Link>
              )}
              <div className="flex gap-1.5">
                {heroSlides.map((_, i) => (
                  <button key={i} data-testid={`hero-slide-dot-${i}`} aria-label={`Slide ${i + 1}`} onClick={() => setHeroIdx(i)}
                    className={`h-1 transition-all duration-500 ${i === heroIdx ? "w-7 bg-gradient-to-r from-[#C8102E] to-[#D4AF37]" : "w-2.5 bg-slate-600 hover:bg-slate-400"}`} />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-36 pb-16">
          <motion.p {...fade} className="eyebrow mb-5">Premium Residences · Chandigarh Tricity</motion.p>
          <motion.h1 {...fade} transition={{ ...fade.transition, delay: 0.1 }} data-testid="hero-main-title"
            className="font-serif font-medium text-4xl sm:text-5xl lg:text-7xl leading-[1.05] tracking-tight max-w-4xl">
            Built for Those<br />Who <span className="gold-text italic font-semibold">Arrive.</span>
          </motion.h1>
          <motion.p {...fade} transition={{ ...fade.transition, delay: 0.2 }} className="mt-6 text-slate-300 font-light text-base sm:text-lg max-w-xl leading-relaxed">
            Landmark addresses across Zirakpur, Mohali & Aerocity. One uncompromising standard — low-density, RERA registered, built to last.
          </motion.p>

          <motion.div {...fade} transition={{ ...fade.transition, delay: 0.3 }} className="mt-10 flex flex-wrap gap-4">
            <button data-testid="hero-enquire-btn" onClick={() => window.dispatchEvent(new Event("open-enquiry-popup"))} className="gold-btn">Enquire Now</button>
            <Link to="/projects" data-testid="hero-explore-link" className="outline-btn">Explore Residences</Link>
          </motion.div>

          <motion.div {...fade} transition={{ ...fade.transition, delay: 0.4 }} className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl">
            {[
              { v: stats.total_projects || 6, s: "", label: "Landmark Projects", testid: "hero-stat-projects-val" },
              { v: stats.luxury_residences || 500, s: "+", label: "Luxury Residences", testid: "hero-stat-residences-val" },
              { v: stats.prime_locations || 3, s: "", label: "Prime Locations", testid: "hero-stat-locations-val" },
              { v: stats.design_partners || 6, s: "+", label: "Design Partners", testid: "hero-stat-partners-val" },
            ].map((s) => (
              <div key={s.label} className="border-l border-[#C5A059]/30 pl-4">
                <p className="font-serif text-3xl sm:text-4xl gold-text"><Counter value={s.v} suffix={s.s} testid={s.testid} /></p>
                <p className="text-[0.6rem] font-mono uppercase tracking-[0.2em] text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3D COVERFLOW SHOWCASE */}
      {coverItems.length > 0 && (
        <section className="py-20 lg:py-28 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 flex items-end justify-between">
            <div>
              <p className="eyebrow mb-3">The Portfolio</p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight">Three Addresses. <span className="gold-text italic">One Standard.</span></h2>
            </div>
            <Link to="/projects" data-testid="showcase-view-all-link" className="hidden sm:flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#E6C687] hover:gap-3 transition-all">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          <Coverflow items={coverItems} testid="hero-3d-coverflow-carousel"
            onSelect={(item) => navigate(`/projects/${item.slug}`)} />
        </section>
      )}

      {/* HOT SELLING */}
      {hotProjects.length > 0 && (
        <section data-testid="hot-selling-section" className="py-20 lg:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(200,16,46,0.15),transparent_55%)]" />
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#C8102E] via-[#C8102E]/40 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="eyebrow mb-3" style={{ color: "#F87171" }}>Featured · Hot Selling</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight mb-12">
              Hot Selling <span className="crimson-text italic">Properties</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotProjects.map((p, i) => (
                <motion.div key={p.id} {...fade} transition={{ ...fade.transition, delay: i * 0.08 }}>
                  <ProjectCard project={p} index={i} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* STATUS TABS + PROJECTS */}
      <section className="py-20 lg:py-28 bg-[#0A1322]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <p className="eyebrow mb-3">Current & Completed</p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight">Explore the <span className="gold-text italic">Landmarks</span></h2>
            </div>
            <div className="flex gap-2 flex-wrap" data-testid="projects-status-tabs">
              {["ALL", "ONGOING", "UPCOMING", "DELIVERED"].map((t) => (
                <button key={t} data-testid={`projects-tab-${t.toLowerCase()}`} onClick={() => setTab(t)}
                  className={`text-[0.65rem] font-mono uppercase tracking-[0.2em] px-4 py-2 border transition-all duration-300 ${tab === t ? "border-[#D4AF37] text-[#F3E5AB] bg-[#D4AF37]/10" : "border-slate-700 text-slate-400 hover:border-[#C5A059]/50"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p, i) => (
              <motion.div key={p.id} {...fade} transition={{ ...fade.transition, delay: i * 0.08 }}>
                <ProjectCard project={p} index={i} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORY TILES */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="eyebrow mb-3">What We Build</p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight mb-12">A Portfolio of <span className="gold-text italic">Distinction</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Building2, title: "Residential", desc: "Low-density luxury apartments, penthouses & sky villas designed around light, air and privacy.", testid: "cat-residential-tile", q: "RESIDENTIAL" },
              { icon: Landmark, title: "Commercial", desc: "High-street retail and showroom spaces in high-growth corridors with strong internal footfall.", testid: "cat-commercial-tile", q: "COMMERCIAL" },
              { icon: Factory, title: "Investment", desc: "High-appreciation addresses minutes from the international airport and IT corridors.", testid: "cat-industrial-tile", q: "" },
            ].map((c) => (
              <Link key={c.title} to={c.q ? `/projects?category=${c.q}` : "/projects"} data-testid={c.testid}
                className="group glass-card p-8 hover:border-[#D4AF37]/50 hover:-translate-y-2 transition-all duration-500">
                <c.icon size={28} className="text-[#D4AF37] mb-6" />
                <h3 className="font-serif text-2xl mb-3">{c.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">{c.desc}</p>
                <span className="flex items-center gap-1 text-[0.65rem] font-mono uppercase tracking-[0.2em] text-[#E6C687] group-hover:gap-2 transition-all">Explore <ArrowUpRight size={13} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY ATLANTIS */}
      <section className="py-20 lg:py-28 bg-[#0A1322]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="eyebrow mb-3">The Difference</p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight leading-tight">
                We build the addresses <span className="gold-text italic">people aspire to.</span>
              </h2>
              <p className="mt-6 text-slate-400 leading-relaxed font-light">
                Atlantis was founded on a simple belief: that premium living in Tricity deserved a higher standard.
                We build low-density. We build with precision. We build to last.
              </p>
              <Link to="/about" data-testid="why-learn-more-link" className="outline-btn mt-8 inline-flex">About the Group</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: Compass, t: "Low-Density Design", d: "Fewer homes per acre. More light, more air, more life." },
                { icon: ShieldCheck, t: "RERA Compliance, Always", d: "Every project registered with Punjab RERA. Full transparency, booking to possession." },
                { icon: Award, t: "Prime Connectivity", d: "Minutes from Chandigarh International Airport, IT corridors, hospitals and universities." },
                { icon: Users, t: "Consortium of Excellence", d: "Leading architects, landscape designers and structural engineers on every project." },
              ].map((f, i) => (
                <motion.div key={f.t} {...fade} transition={{ ...fade.transition, delay: i * 0.08 }} data-testid={`why-feature-${i}`} className="glass-card p-6">
                  <f.icon size={22} className="text-[#D4AF37] mb-4" />
                  <h3 className="font-serif text-xl mb-2">{f.t}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.d}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MILESTONES */}
      {company?.milestones?.length > 0 && (
        <section data-testid="company-timeline-section" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="eyebrow mb-3">The Journey</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight mb-14">Milestones</h2>
            <div className="relative border-l border-[#C5A059]/30 ml-3 space-y-14">
              {company.milestones.map((m, i) => (
                <motion.div key={i} {...fade} transition={{ ...fade.transition, delay: i * 0.1 }} className="relative pl-10">
                  <div className="absolute -left-[7px] top-1.5 w-3.5 h-3.5 rotate-45 border border-[#D4AF37] bg-[#050B14]" />
                  <p data-testid={`milestone-year-${m.year}`} className="font-serif text-3xl gold-text">{m.year}</p>
                  <h3 className="font-serif text-xl mt-1">{m.title}</h3>
                  <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">{m.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BLOG TEASERS */}
      {blog.length > 0 && (
        <section className="py-20 lg:py-28 bg-[#0A1322]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="eyebrow mb-3">Insights</p>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">The Atlantis <span className="gold-text italic">Perspective</span></h2>
              </div>
              <Link to="/blog" data-testid="blog-view-all-link" className="hidden sm:flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#E6C687]">All Stories <ArrowUpRight size={14} /></Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blog.map((b, i) => (
                <Link key={b.id} to={`/blog/${b.slug}`} data-testid={`blog-teaser-${b.slug}`} className="group glass-card p-7 hover:border-[#D4AF37]/50 hover:-translate-y-1.5 transition-all duration-500">
                  <p className="text-[0.6rem] font-mono text-slate-500 tracking-widest uppercase mb-4">{b.published_at} · {(b.tags || []).join(" / ")}</p>
                  <h3 className="font-serif text-xl leading-snug group-hover:text-[#F3E5AB] transition-colors">{b.title}</h3>
                  <p className="text-sm text-slate-400 mt-3 leading-relaxed line-clamp-3">{b.excerpt}</p>
                  <span className="flex items-center gap-1 text-[0.65rem] font-mono uppercase tracking-[0.2em] text-[#E6C687] mt-5">Read <ArrowUpRight size={13} /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ENQUIRY CTA */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#D4AF37]/5 to-transparent" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="eyebrow mb-4">Begin Your Journey</p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight mb-4">Reserve Your <span className="gold-text italic">Residence</span></h2>
          <p className="text-slate-400 font-light mb-10">Our team will reach you within 24 hours to discuss availability, pricing, and a personal site visit. Prefer to speak directly? <a href="tel:+919708397083" data-testid="cta-call-link" className="text-[#E6C687]">+91 97083 97083</a></p>
          <div className="glass-card p-8 text-left">
            <EnquiryForm source="home_cta" testidPrefix="home-enquiry" />
          </div>
        </div>
      </section>
    </div>
  );
}
