import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import api from "../lib/api";
import SEO from "../components/SEO";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("ALL");

  useEffect(() => {
    api.get("/blog").then((r) => setPosts(r.data)).catch(() => {});
  }, []);

  const filtered = tab === "ALL" ? posts : posts.filter((b) => (b.kind || "blog") === tab);

  return (
    <div data-testid="blog-page" className="pt-32 pb-24">
      <SEO title="Blogs & Daily Updates" path="/blog"
        description="ATLANTIS blogs & daily updates — market insights, buyer guides, construction updates and social posts from across the Chandigarh Tricity." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="eyebrow mb-3">Stay Updated</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight mb-8">Blogs & <span className="gold-text italic">Daily Updates</span></h1>
        <div className="flex gap-2 flex-wrap mb-12" data-testid="blog-page-tabs">
          {[["ALL", "All"], ["blog", "Blogs"], ["update", "Daily Updates"]].map(([k, label]) => (
            <button key={k} data-testid={`blog-tab-${k.toLowerCase()}`} onClick={() => setTab(k)}
              className={`text-[0.62rem] font-mono uppercase tracking-[0.18em] px-4 py-2 border transition-all ${tab === k ? "border-[#D4AF37] text-[#F3E5AB] bg-[#D4AF37]/10" : "border-slate-700 text-slate-400"}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((b) => {
            const isUpdate = b.kind === "update";
            const external = isUpdate && b.external_url?.startsWith("http");
            const inner = (
              <>
                {b.cover && (
                  <div className="h-48 img-frame">
                    <img src={b.cover} alt={b.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                )}
                <div className="p-7">
                  <p className="text-[0.6rem] font-mono text-slate-500 tracking-widest uppercase mb-4">
                    {b.published_at} · {isUpdate ? (b.platform || "UPDATE").toUpperCase() : (b.tags || []).join(" / ")}
                  </p>
                  <h2 className="font-serif text-xl leading-snug group-hover:text-[#F3E5AB] transition-colors">{b.title}</h2>
                  <p className="text-sm text-slate-400 mt-3 leading-relaxed line-clamp-3">{b.excerpt}</p>
                  <span className="flex items-center gap-1 text-[0.65rem] font-mono uppercase tracking-[0.2em] text-[#E6C687] mt-5">
                    {isUpdate ? (external ? "View Post" : "View Update") : "Read Story"} <ArrowUpRight size={13} />
                  </span>
                </div>
              </>
            );
            const cls = "group glass-card overflow-hidden hover:border-[#D4AF37]/50 hover:-translate-y-1.5 transition-all duration-500 block";
            return external ? (
              <a key={b.id} href={b.external_url} target="_blank" rel="noopener noreferrer" data-testid={`update-card-${b.slug}`} className={cls}>{inner}</a>
            ) : (
              <Link key={b.id} to={isUpdate && b.external_url ? b.external_url : `/blog/${b.slug}`} data-testid={`${isUpdate ? "update" : "blog"}-card-${b.slug}`} className={cls}>{inner}</Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
