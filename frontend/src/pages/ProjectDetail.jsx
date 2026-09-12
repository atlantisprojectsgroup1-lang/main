import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ShieldCheck, X, ChevronRight, Plane, Train, Hospital, GraduationCap, ShoppingBag, Navigation, Calculator } from "lucide-react";
import api from "../lib/api";
import SEO from "../components/SEO";
import Coverflow from "../components/Coverflow";
import EnquiryForm from "../components/EnquiryForm";

const LANDMARK_ICONS = { airport: Plane, transport: Train, school: GraduationCap, hospital: Hospital, mall: ShoppingBag, highway: Navigation };

function EmiCalculator({ defaultPrice }) {
  const [principal, setPrincipal] = useState(defaultPrice || 14400000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const emi = useMemo(() => {
    const r = rate / 1200;
    const n = years * 12;
    if (!r || !n) return 0;
    return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  }, [principal, rate, years]);
  return (
    <div data-testid="emi-calculator" className="glass-card p-7">
      <div className="flex items-center gap-2 mb-6">
        <Calculator size={18} className="text-[#D4AF37]" />
        <h3 className="font-serif text-xl">EMI Calculator</h3>
      </div>
      <div className="space-y-5">
        <div>
          <label className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 flex justify-between">
            <span>Loan Amount</span><span className="text-[#E6C687]">₹{(principal / 100000).toFixed(1)} L</span>
          </label>
          <input data-testid="emi-principal-range" type="range" min="1000000" max="50000000" step="100000" value={principal}
            onChange={(e) => setPrincipal(+e.target.value)} className="w-full accent-[#D4AF37] mt-2" />
        </div>
        <div>
          <label className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 flex justify-between">
            <span>Interest Rate</span><span className="text-[#E6C687]">{rate}%</span>
          </label>
          <input data-testid="emi-rate-range" type="range" min="6" max="12" step="0.1" value={rate}
            onChange={(e) => setRate(+e.target.value)} className="w-full accent-[#D4AF37] mt-2" />
        </div>
        <div>
          <label className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 flex justify-between">
            <span>Tenure</span><span className="text-[#E6C687]">{years} yrs</span>
          </label>
          <input data-testid="emi-tenure-range" type="range" min="5" max="30" value={years}
            onChange={(e) => setYears(+e.target.value)} className="w-full accent-[#D4AF37] mt-2" />
        </div>
        <div className="pt-4 border-t border-slate-800 flex items-end justify-between">
          <span className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400">Monthly EMI</span>
          <span data-testid="emi-result" className="font-serif text-3xl gold-text">₹{emi.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setProject(null);
    setNotFound(false);
    api.get(`/projects/${slug}`).then((r) => setProject(r.data)).catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="pt-40 pb-32 text-center" data-testid="project-not-found">
        <p className="font-serif text-4xl text-slate-300">This address does not exist.</p>
        <Link to="/projects" className="outline-btn mt-8 inline-flex">Back to Projects</Link>
      </div>
    );
  }
  if (!project) return <div className="pt-40 pb-32 text-center text-slate-500 font-mono text-xs tracking-widest uppercase">Loading…</div>;

  const cover = project.images?.[0]?.url;
  const gallery = project.images || [];
  const coverItems = gallery.map((img, i) => ({ key: i, image: img.url, title: project.name, eyebrow: img.category, subtitle: img.alt }));
  const amenityGroups = {};
  (project.amenities || []).forEach((a) => { (amenityGroups[a.group] = amenityGroups[a.group] || []).push(a); });

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Residence",
    name: project.name, description: project.description,
    address: { "@type": "PostalAddress", streetAddress: project.address, addressLocality: project.city, addressRegion: "Punjab", addressCountry: "IN" },
    ...(cover ? { image: cover } : {}),
  };

  const subnav = [
    ["Overview", "overview", "detail-nav-overview"],
    ["Showcase", "showcase", "detail-nav-showcase"],
    ["Gallery", "gallery", "detail-nav-gallery"],
    ["Amenities", "amenities", "detail-nav-amenities"],
    ["Specifications", "specs", "detail-nav-specs"],
    ["Location", "location", "detail-nav-location"],
    ["Enquire", "enquire", "detail-nav-enquire"],
  ];

  return (
    <div data-testid={`project-detail-${project.slug}`}>
      <SEO title={project.seo?.title || project.name} description={project.seo?.description || project.description?.slice(0, 155)}
        keywords={project.seo?.keywords} image={cover} path={`/projects/${project.slug}`} jsonLd={jsonLd} />

      {/* Hero */}
      <section className="relative h-[68vh] min-h-[480px] flex items-end overflow-hidden hero-grain">
        {cover && <img src={cover} alt={project.images[0].alt || project.name} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-[#050B14]/50 to-[#050B14]/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[0.62rem] font-mono uppercase tracking-[0.2em] px-3 py-1.5 border border-[#D4AF37]/50 text-[#F3E5AB] bg-[#050B14]/60 backdrop-blur-md">{project.status}</span>
              <span className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-300">{project.category}</span>
            </div>
            <h1 className="font-serif font-light text-4xl sm:text-5xl lg:text-6xl tracking-tight">{project.name}</h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-sm text-slate-300">
              <span className="flex items-center gap-2"><MapPin size={15} className="text-[#C5A059]" />{project.address}</span>
              <span className="gold-text font-serif text-2xl">{project.price_label}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sticky subnav */}
      <div data-testid="project-detail-subnav" className="sticky top-20 z-40 backdrop-blur-xl bg-[#050B14]/85 border-y border-[#C5A059]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 overflow-x-auto py-3.5">
          {subnav.map(([label, id, tid]) => (
            <a key={id} href={`#${id}`} data-testid={tid} className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 hover:text-[#E6C687] transition-colors whitespace-nowrap">
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Overview */}
      <section id="overview" className="py-16 lg:py-24 scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <p className="eyebrow mb-3">Overview</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight mb-6">{project.tagline}</h2>
            <p className="text-slate-300 font-light leading-relaxed text-base sm:text-lg">{project.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-10">
              {[
                ["Possession", project.possession], ["Towers", project.total_towers], ["Floors", project.floors], ["Total Area", project.total_area],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="border-l border-[#C5A059]/30 pl-4">
                  <p className="font-serif text-xl text-slate-100">{v}</p>
                  <p className="text-[0.6rem] font-mono uppercase tracking-[0.2em] text-slate-500 mt-1">{k}</p>
                </div>
              ))}
            </div>
            {project.placeholders?.length > 0 && (
              <p className="mt-8 text-[0.62rem] font-mono text-slate-600 tracking-wider">
                Details being updated by the developer: {project.placeholders.join(", ")}
              </p>
            )}
          </div>
          <div className="space-y-6">
            <div className="glass-card p-7">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={18} className="text-emerald-500" />
                <h3 className="font-serif text-xl">RERA & Transparency</h3>
              </div>
              {project.rera_number ? (
                <p className="text-sm text-slate-300 leading-relaxed">Registered with Punjab RERA.<br /><span className="font-mono text-[#E6C687] text-xs tracking-wider">{project.rera_number}</span></p>
              ) : (
                <p className="text-sm text-slate-400 leading-relaxed">RERA registration details will be published here upon allotment. Atlantis registers every project with Punjab RERA — no exceptions.</p>
              )}
            </div>
            <EmiCalculator defaultPrice={project.price_from} />
          </div>
        </div>
      </section>

      {/* 3D Showcase */}
      {coverItems.length > 1 && (
        <section id="showcase" className="py-16 lg:py-24 bg-[#0A1322]/50 overflow-hidden scroll-mt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
            <p className="eyebrow mb-3">3D Showcase</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight">A <span className="gold-text italic">Closer Look</span></h2>
          </div>
          <Coverflow items={coverItems} testid="project-3d-showcase" onSelect={(item) => setLightbox(item.image)} />
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section id="gallery" className="py-16 lg:py-24 scroll-mt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="eyebrow mb-3">Gallery</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight mb-10">Imagery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {gallery.map((img, i) => (
                <button key={i} data-testid={`gallery-thumb-${i}`} onClick={() => setLightbox(img.url)} className="group relative h-64 overflow-hidden border border-[#C5A059]/20">
                  <img src={img.url} alt={img.alt} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050B14]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Inventory / Price */}
      {project.configs?.length > 0 && (
        <section id="inventory" className="py-16 lg:py-24 bg-[#0A1322]/50 scroll-mt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="eyebrow mb-3">Inventory</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight mb-10">Configurations & <span className="gold-text italic">Pricing</span></h2>
            <div className="glass-card overflow-x-auto">
              <table className="w-full text-sm" data-testid="inventory-table">
                <thead>
                  <tr className="border-b border-[#C5A059]/20 text-left">
                    {["Configuration", "Area", "Price", "Availability"].map((h) => (
                      <th key={h} className="px-6 py-4 text-[0.62rem] font-mono uppercase tracking-[0.2em] text-slate-400 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {project.configs.map((c, i) => (
                    <tr key={i} data-testid={`inventory-row-${i}`} className="border-b border-slate-800/60 hover:bg-[#D4AF37]/5 transition-colors">
                      <td className="px-6 py-4 font-serif text-lg">{c.config}</td>
                      <td className="px-6 py-4 text-slate-400">{c.area || "—"}</td>
                      <td className="px-6 py-4 gold-text font-serif text-lg">{c.price_label}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[0.6rem] font-mono uppercase tracking-[0.18em] px-2.5 py-1 border ${c.availability === "AVAILABLE" ? "border-emerald-500/40 text-emerald-400" : c.availability === "FEW_LEFT" ? "border-amber-500/40 text-amber-400" : "border-slate-600 text-slate-500"}`}>
                          {(c.availability || "").replace("_", " ") || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Amenities */}
      {Object.keys(amenityGroups).length > 0 && (
        <section id="amenities" className="py-16 lg:py-24 scroll-mt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="eyebrow mb-3">World-Class</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight mb-10">Premium <span className="gold-text italic">Amenities</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Object.entries(amenityGroups).map(([group, items]) => (
                <div key={group} className="glass-card p-7">
                  <h3 className="font-serif text-xl gold-text mb-4">{group}</h3>
                  <ul className="space-y-2.5">
                    {items.map((a, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
                        <ChevronRight size={13} className="text-[#C5A059] shrink-0" />{a.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Specifications */}
      {project.specifications?.length > 0 && (
        <section id="specs" className="py-16 lg:py-24 bg-[#0A1322]/50 scroll-mt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="eyebrow mb-3">Premium Quality</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight mb-10">Technical <span className="gold-text italic">Specifications</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.specifications.map((s, i) => (
                <div key={i} data-testid={`spec-section-${i}`} className="border border-[#C5A059]/20 p-6 hover:border-[#D4AF37]/40 transition-colors">
                  <h3 className="font-mono text-[0.68rem] uppercase tracking-[0.25em] text-[#E6C687] mb-4">{s.section}</h3>
                  <ul className="space-y-2">
                    {s.details.map((d, j) => <li key={j} className="text-sm text-slate-400 leading-relaxed">— {d}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Location */}
      <section id="location" className="py-16 lg:py-24 scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="eyebrow mb-3">Where We Build</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight mb-4">{project.locality}, {project.city}</h2>
          <p className="text-slate-400 text-sm mb-10">{project.address}</p>
          {project.landmarks?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {project.landmarks.map((l, i) => {
                const Icon = LANDMARK_ICONS[l.type] || MapPin;
                return (
                  <div key={i} data-testid={`landmark-${i}`} className="glass-card p-5 text-center">
                    <Icon size={20} className="text-[#D4AF37] mx-auto mb-3" />
                    <p className="font-serif text-xl gold-text">{l.distance}</p>
                    <p className="text-xs text-slate-400 mt-1">{l.name}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500 font-mono">Location advantages being curated by the developer.</p>
          )}
        </div>
      </section>

      {/* FAQs */}
      {project.faqs?.length > 0 && (
        <section id="faqs" className="py-16 lg:py-24 bg-[#0A1322]/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <p className="eyebrow mb-3">Questions</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight mb-10">Before You <span className="gold-text italic">Visit</span></h2>
            <div className="space-y-4">
              {project.faqs.map((f, i) => (
                <details key={f.id || i} data-testid={`faq-item-${i}`} className="glass-card p-6 group">
                  <summary className="font-serif text-lg cursor-pointer list-none flex items-center justify-between">
                    {f.question}
                    <ChevronRight size={16} className="text-[#C5A059] group-open:rotate-90 transition-transform shrink-0 ml-4" />
                  </summary>
                  <p className="text-sm text-slate-400 mt-4 leading-relaxed">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Enquire */}
      <section id="enquire" className="py-16 lg:py-24 scroll-mt-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="eyebrow mb-4">Private Appointment</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal tracking-tight mb-4">Experience {project.name} <span className="gold-text italic">in Person</span></h2>
          <p className="text-slate-400 font-light mb-10">Share your details and our relationship team will arrange a private site visit.</p>
          <div className="glass-card p-8 text-left">
            <EnquiryForm projectId={project.id} projectName={project.name} source={`project_${project.slug}`} testidPrefix="project-enquiry" />
          </div>
        </div>
      </section>

      {/* Similar */}
      {project.similar_projects?.length > 0 && (
        <section className="py-16 lg:py-20 bg-[#0A1322]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-2xl sm:text-3xl mb-8">Similar addresses <span className="gold-text italic">nearby</span></h2>
            <div className="flex flex-wrap gap-4">
              {project.similar_projects.map((s) => (
                <Link key={s.id} to={`/projects/${s.slug}`} data-testid={`similar-project-${s.slug}`}
                  className="outline-btn">{s.name}</Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div data-testid="gallery-lightbox" className="fixed inset-0 z-[60] bg-[#050B14]/95 backdrop-blur-lg flex items-center justify-center p-6" onClick={() => setLightbox(null)}>
          <button data-testid="lightbox-close-btn" className="absolute top-6 right-6 text-slate-300 hover:text-white" aria-label="Close"><X size={28} /></button>
          <img src={lightbox} alt="Gallery" className="max-w-full max-h-full object-contain border border-[#C5A059]/30" />
        </div>
      )}
    </div>
  );
}
