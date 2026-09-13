import { Link } from "react-router-dom";
import { MapPin, ArrowUpRight, ShieldCheck } from "lucide-react";

const STATUS_STYLES = {
  ONGOING: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  READY_TO_MOVE: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  UPCOMING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  DELIVERED: "bg-sky-500/15 text-sky-400 border-sky-500/30",
};

export default function ProjectCard({ project, index = 0 }) {
  const cover = project.images?.[0]?.url;
  return (
    <Link to={`/projects/${project.slug}`} data-testid={`project-card-${project.slug}`}
      className="group block glass-card overflow-hidden hover:border-[#D4AF37]/50 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(212,175,55,0.15)] transition-all duration-500">
      <div className="relative h-64 overflow-hidden">
        {cover ? (
          <img src={cover} alt={project.images[0].alt || project.name} loading={index > 2 ? "lazy" : "eager"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-[#101B2E] flex items-center justify-center">
            <span className="font-serif text-4xl text-[#C5A059]/40">A</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-transparent to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`text-[0.6rem] font-mono uppercase tracking-[0.2em] px-3 py-1.5 border backdrop-blur-md ${STATUS_STYLES[project.status] || STATUS_STYLES.ONGOING}`}>
            {project.status.replace(/_/g, " ")}
          </span>
          {project.is_hot_selling && (
            <span className="hot-badge text-[0.6rem] font-mono uppercase tracking-[0.2em] px-3 py-1.5 backdrop-blur-md">Hot Selling</span>
          )}
        </div>
        {project.logo && (
          <img src={project.logo} alt={`${project.name} logo`} data-testid={`project-logo-${project.slug}`}
            className="absolute top-4 right-4 h-11 w-11 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-[0.65rem] font-mono uppercase tracking-[0.25em] text-[#E6C687]/90 mb-1">{project.category}</p>
          <h3 className="font-serif text-2xl text-slate-100 leading-tight">{project.name}</h3>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
          <MapPin size={14} className="text-[#C5A059]" />
          <span>{project.locality}{project.locality && project.city ? ", " : ""}{project.city}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {(project.configs || []).slice(0, 4).map((c, i) => (
            <span key={i} className="text-[0.65rem] font-mono px-2.5 py-1 border border-slate-700 text-slate-300">{c.config}</span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="gold-text font-serif text-xl">{project.price_label}</span>
          <span data-testid={`project-view-btn-${project.slug}`} className="flex items-center gap-1 text-[0.65rem] font-mono uppercase tracking-[0.2em] text-[#E6C687] group-hover:gap-2 transition-all">
            Explore <ArrowUpRight size={14} />
          </span>
        </div>
        {project.rera_number && (
          <div className="flex items-center gap-1.5 mt-3 text-[0.6rem] font-mono text-slate-500">
            <ShieldCheck size={12} className="text-emerald-500" /> RERA: {project.rera_number}
          </div>
        )}
      </div>
    </Link>
  );
}
