import { useEffect, useState } from "react";
import api from "../lib/api";
import SEO from "../components/SEO";
import ProjectCard from "../components/ProjectCard";

export default function Portfolio() {
  const [projects, setProjects] = useState(null);

  useEffect(() => {
    api.get("/projects", { params: { status: "DELIVERED" } }).then((r) => setProjects(r.data)).catch(() => setProjects([]));
  }, []);

  return (
    <div data-testid="portfolio-page" className="pt-32 pb-24">
      <SEO title="Delivered Portfolio" path="/portfolio"
        description="Completed ATLANTIS addresses — handed over on time, built to last. Explore our delivered portfolio in the Chandigarh Tricity." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="eyebrow mb-3">Proof of Promise</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight mb-4">Delivered <span className="gold-text italic">Addresses</span></h1>
        <p className="text-slate-400 font-light max-w-2xl mb-14">Every handover is a promise kept. Explore the completed Atlantis portfolio.</p>
        {projects === null ? (
          <div className="py-20 text-center text-slate-500 font-mono text-xs tracking-widest uppercase">Loading…</div>
        ) : projects.length === 0 ? (
          <p className="text-slate-500 font-mono text-sm">Delivered projects will be showcased here.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
