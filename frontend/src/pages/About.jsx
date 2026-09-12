import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";
import api from "../lib/api";
import SEO from "../components/SEO";

const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.7 } };

export default function About() {
  const [company, setCompany] = useState(null);

  useEffect(() => {
    api.get("/company").then((r) => setCompany(r.data)).catch(() => {});
  }, []);

  if (!company) return <div className="pt-40 pb-32 text-center text-slate-500 font-mono text-xs tracking-widest uppercase">Loading…</div>;

  return (
    <div data-testid="about-page" className="pt-32 pb-24">
      <SEO title="About the Group" path="/about" description={company.about_long?.slice(0, 155)} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="eyebrow mb-3">The Group</p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight max-w-4xl leading-[1.08]">
          We do not simply construct buildings. <span className="gold-text italic">We shape the future of modern living.</span>
        </h1>
        <p className="mt-8 text-slate-300 font-light leading-relaxed max-w-3xl text-base sm:text-lg">{company.about_long}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
          <div className="glass-card p-8">
            <p className="eyebrow mb-3">Vision</p>
            <p className="font-serif text-xl leading-relaxed text-slate-200">{company.vision}</p>
          </div>
          <div className="glass-card p-8">
            <p className="eyebrow mb-3">Mission</p>
            <p className="font-serif text-xl leading-relaxed text-slate-200">{company.mission}</p>
          </div>
        </div>

        {/* Timeline */}
        {company.milestones?.length > 0 && (
          <section data-testid="company-timeline-section" className="mt-24">
            <p className="eyebrow mb-3">History</p>
            <h2 className="font-serif text-3xl sm:text-4xl mb-14">The <span className="gold-text italic">Journey</span></h2>
            <div className="relative border-l border-[#C5A059]/30 ml-3 space-y-14">
              {company.milestones.map((m, i) => (
                <motion.div key={i} {...fade} className="relative pl-10 flex flex-col sm:flex-row gap-6">
                  <div className="absolute -left-[7px] top-1.5 w-3.5 h-3.5 rotate-45 border border-[#D4AF37] bg-[#050B14]" />
                  <div className="flex-1">
                    <p data-testid={`milestone-year-${m.year}`} className="font-serif text-3xl gold-text">{m.year}</p>
                    <h3 className="font-serif text-xl mt-1">{m.title}</h3>
                    <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">{m.description}</p>
                  </div>
                  {m.image && <img src={m.image} alt={m.title} className="w-full sm:w-56 h-36 object-cover border border-[#C5A059]/20" loading="lazy" />}
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Leadership */}
        {company.leadership?.length > 0 && (
          <section className="mt-24">
            <p className="eyebrow mb-3">Leadership</p>
            <h2 className="font-serif text-3xl sm:text-4xl mb-14">Guided by <span className="gold-text italic">hands-on experience.</span></h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {company.leadership.map((l, i) => (
                <motion.div key={i} {...fade} data-testid={`leader-card-${i}`} className="glass-card overflow-hidden group">
                  {l.photo && (
                    <div className="h-72 overflow-hidden">
                      <img src={l.photo} alt={l.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-xl">{l.name}</h3>
                      {l.linkedin && <a href={l.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#E6C687]"><Linkedin size={15} /></a>}
                    </div>
                    <p className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-[#C5A059] mt-1">{l.designation}</p>
                    <p className="text-sm text-slate-400 mt-3 leading-relaxed">{l.bio}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Design partners */}
        {company.design_partners?.length > 0 && (
          <section className="mt-24">
            <p className="eyebrow mb-3">Built With the Best</p>
            <h2 className="font-serif text-3xl sm:text-4xl mb-10">A Consortium of <span className="gold-text italic">Excellence</span></h2>
            <div className="flex flex-wrap gap-3">
              {company.design_partners.map((p) => (
                <span key={p} data-testid={`partner-${p.replace(/\W+/g, "-").toLowerCase()}`} className="px-5 py-2.5 border border-[#C5A059]/25 text-sm text-slate-300 font-mono tracking-wider hover:border-[#D4AF37]/60 transition-colors">
                  {p}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {company.certifications?.length > 0 && (
          <section className="mt-24">
            <p className="eyebrow mb-3">Trust</p>
            <h2 className="font-serif text-3xl sm:text-4xl mb-10">Certifications & <span className="gold-text italic">Compliance</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {company.certifications.map((c, i) => (
                <div key={i} data-testid={`certification-${i}`} className="border border-[#C5A059]/25 p-7">
                  <h3 className="font-serif text-xl gold-text mb-2">{c.name}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{c.detail}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
