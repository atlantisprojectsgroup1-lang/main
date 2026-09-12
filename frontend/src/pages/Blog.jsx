import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import api from "../lib/api";
import SEO from "../components/SEO";

export default function Blog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get("/blog").then((r) => setPosts(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="blog-page" className="pt-32 pb-24">
      <SEO title="Insights — The Atlantis Perspective" path="/blog"
        description="Market insights, buyer guides and construction intelligence from ATLANTIS — real estate decisions deserve real information." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="eyebrow mb-3">Insights</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight mb-14">The Atlantis <span className="gold-text italic">Perspective</span></h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((b) => (
            <Link key={b.id} to={`/blog/${b.slug}`} data-testid={`blog-card-${b.slug}`} className="group glass-card overflow-hidden hover:border-[#D4AF37]/50 hover:-translate-y-1.5 transition-all duration-500">
              {b.cover && (
                <div className="h-48 overflow-hidden">
                  <img src={b.cover} alt={b.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              )}
              <div className="p-7">
                <p className="text-[0.6rem] font-mono text-slate-500 tracking-widest uppercase mb-4">{b.published_at} · {(b.tags || []).join(" / ")}</p>
                <h2 className="font-serif text-xl leading-snug group-hover:text-[#F3E5AB] transition-colors">{b.title}</h2>
                <p className="text-sm text-slate-400 mt-3 leading-relaxed line-clamp-3">{b.excerpt}</p>
                <span className="flex items-center gap-1 text-[0.65rem] font-mono uppercase tracking-[0.2em] text-[#E6C687] mt-5">Read Story <ArrowUpRight size={13} /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
