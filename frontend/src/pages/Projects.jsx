import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import api from "../lib/api";
import SEO from "../components/SEO";
import ProjectCard from "../components/ProjectCard";

const STATUSES = ["", "ONGOING", "UPCOMING", "DELIVERED"];

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [meta, setMeta] = useState({ cities: [], types: [] });
  const [loading, setLoading] = useState(true);

  const filters = {
    status: searchParams.get("status") || "",
    category: searchParams.get("category") || "",
    city: searchParams.get("city") || "",
    ptype: searchParams.get("ptype") || "",
  };

  useEffect(() => {
    api.get("/projects/meta/filters").then((r) => setMeta(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    api.get("/projects", { params })
      .then((r) => setProjects(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const set = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div data-testid="projects-page" className="pt-32 pb-24">
      <SEO title="Projects — Luxury Residences & Commercial Spaces" path="/projects"
        description="Explore ATLANTIS projects across Zirakpur, Mohali & Aerocity — ongoing, upcoming and delivered RERA-registered landmarks." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="eyebrow mb-3">The Portfolio</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight mb-10">Every Atlantis address is <span className="gold-text italic">exactly where you want to be.</span></h1>

        {/* Filters */}
        <div data-testid="projects-filter-bar" className="glass-card p-4 mb-12 flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map((s) => (
              <button key={s || "all"} data-testid={`filter-status-${(s || "all").toLowerCase()}`} onClick={() => set("status", s)}
                className={`text-[0.62rem] font-mono uppercase tracking-[0.18em] px-3.5 py-2 border transition-all ${filters.status === s ? "border-[#D4AF37] text-[#F3E5AB] bg-[#D4AF37]/10" : "border-slate-700 text-slate-400"}`}>
                {s || "All"}
              </button>
            ))}
          </div>
          <div className="flex gap-3 flex-1 flex-wrap">
            <select data-testid="filter-category-select" value={filters.category} onChange={(e) => set("category", e.target.value)} className="px-3 py-2.5 text-xs flex-1 min-w-[130px]">
              <option value="">Category — All</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="INDUSTRIAL">Industrial</option>
            </select>
            <select data-testid="filter-city-select" value={filters.city} onChange={(e) => set("city", e.target.value)} className="px-3 py-2.5 text-xs flex-1 min-w-[130px]">
              <option value="">City — All</option>
              {meta.cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select data-testid="filter-ptype-select" value={filters.ptype} onChange={(e) => set("ptype", e.target.value)} className="px-3 py-2.5 text-xs flex-1 min-w-[130px]">
              <option value="">Property Type — All</option>
              {meta.types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center text-slate-500 font-mono text-xs tracking-widest uppercase">Loading landmarks…</div>
        ) : projects.length === 0 ? (
          <div data-testid="projects-empty-state" className="py-24 text-center">
            <SlidersHorizontal size={28} className="mx-auto text-[#C5A059]/50 mb-4" />
            <p className="font-serif text-2xl text-slate-300">No addresses match those filters.</p>
            <p className="text-sm text-slate-500 mt-2">Try a different status, city or property type.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.06 }}>
                <ProjectCard project={p} index={i} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
