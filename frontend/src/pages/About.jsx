import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Linkedin, FolderOpen, ArrowUpRight } from "lucide-react";
import api from "../lib/api";
import SEO from "../components/SEO";

const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.7 } };

export default function About() {
  const [company, setCompany] = useState(null);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    api.get("/company").then((r) => setCompany(r.data)).catch(() => {});
    api.get("/team").then((r) => setTeam(r.data)).catch(() => {});
  }, []);

  if (!company) return <div className="pt-40 pb-32 text-center text-slate-500 font-mono text-xs tracking-widest uppercase">Loading…</div>;

  const builder = company.builder || {};
  const stats = company.stats || {};
  const teamGroups = {};
  team.forEach((m) => { (teamGroups[m.group || "General"] = teamGroups[m.group || "General"] || []).push(m); });
  const orderedGroups = Object.keys(teamGroups).sort((a, b) => (a === "Leadership" ? -1 : b === "Leadership" ? 1 : a.localeCompare(b)));

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

        {/* BUILDER PROFILE */}
        <section data-testid="builder-profile-section" className="mt-20">
          <p className="eyebrow mb-3">Builder Profile</p>
          <div className="glass-card p-8 lg:p-12 relative overflow-hidden">
            <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
              <div>
                <img src="/assets/atlantis-logo.png" alt="ATLANTIS Group logo" className="h-12 w-auto object-contain mb-5" data-testid="builder-logo" />
                <h2 className="font-serif text-3xl tracking-wide">{company.brand_name || "ATLANTIS"} GROUP</h2>
                <p className="text-sm text-slate-400 mt-2">{builder.focus || "Luxury Residential & Commercial"} · Est. {company.founded_year || 2016}</p>
                <p className="text-[0.62rem] font-mono text-emerald-400 tracking-wider mt-4 uppercase">{builder.rera_note || "Every project registered with Punjab RERA"}</p>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                {[
                  [stats.total_projects || 6, "Landmark Projects"],
                  [`${stats.luxury_residences || 500}+`, "Luxury Residences"],
                  [stats.prime_locations || 3, "Prime Locations"],
                  [`${stats.design_partners || 6}+`, "Design Partners"],
                ].map(([v, l]) => (
                  <div key={l} className="border-l border-[#C5A059]/30 pl-4">
                    <p className="font-serif text-3xl gold-text">{v}</p>
                    <p className="text-[0.58rem] font-mono uppercase tracking-[0.2em] text-slate-500 mt-1">{l}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="eyebrow mb-2">Building In</p>
                <p className="text-slate-300 text-sm">{builder.regions || "Mohali · Zirakpur · Aerocity"}</p>
                <p className="eyebrow mt-6 mb-2">The Promise</p>
                <p className="text-slate-300 text-sm leading-relaxed">{builder.delivery_promise || "On-time handover, transparent pricing, consortium-built quality."}</p>
                <Link to="/projects" data-testid="builder-portfolio-link" className="outline-btn mt-7 inline-flex">View Portfolio <ArrowUpRight size={13} /></Link>
              </div>
            </div>
          </div>
        </section>

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
                  {m.image && <img src={m.image} alt={m.title} className="w-full sm:w-56 h-36 object-cover img-frame" loading="lazy" />}
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* TEAM FOLDER */}
        {orderedGroups.length > 0 && (
          <section className="mt-24" data-testid="team-folder-section">
            <p className="eyebrow mb-3">Team Folder</p>
            <h2 className="font-serif text-3xl sm:text-4xl mb-14">The People Behind <span className="gold-text italic">the Landmarks</span></h2>
            {orderedGroups.map((group) => (
              <div key={group} className="mb-14" data-testid={`team-folder-${group.replace(/\W+/g, "-").toLowerCase()}`}>
                <div className="flex items-center gap-3 mb-7 border-b border-[#C5A059]/20 pb-4">
                  <FolderOpen size={18} className="text-[#D4AF37]" />
                  <h3 className="font-serif text-2xl">{group}</h3>
                  <span className="text-[0.6rem] font-mono text-slate-500 tracking-[0.2em] uppercase">{teamGroups[group].length} member{teamGroups[group].length > 1 ? "s" : ""}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {teamGroups[group].map((m, i) => (
                    <motion.div key={m.id || i} {...fade} data-testid={`team-card-${(m.id || `${group}-${i}`).toString().replace(/\W+/g, "-").toLowerCase()}`} className="glass-card overflow-hidden group">
                      {m.photo && (
                        <div className="h-72 img-frame">
                          <img src={m.photo} alt={m.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center justify-between">
                          <h4 className="font-serif text-xl">{m.name}</h4>
                          {m.linkedin && <a href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`} className="text-slate-500 hover:text-[#E6C687]"><Linkedin size={15} /></a>}
                        </div>
                        <p className="text-[0.62rem] font-mono uppercase tracking-[0.2em] text-[#C5A059] mt-1">{m.designation}</p>
                        {m.bio && <p className="text-sm text-slate-400 mt-3 leading-relaxed">{m.bio}</p>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
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
