import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import api from "../lib/api";
import SEO from "../components/SEO";

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/blog/${slug}`).then((r) => setPost(r.data)).catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) return <div className="pt-40 pb-32 text-center font-serif text-3xl text-slate-300">Story not found.</div>;
  if (!post) return <div className="pt-40 pb-32 text-center text-slate-500 font-mono text-xs tracking-widest uppercase">Loading…</div>;

  return (
    <div data-testid={`blog-post-${post.slug}`} className="pt-32 pb-24">
      <SEO title={post.title} description={post.excerpt} image={post.cover} path={`/blog/${post.slug}`}
        jsonLd={{ "@context": "https://schema.org", "@type": "Article", headline: post.title, author: { "@type": "Organization", name: post.author }, datePublished: post.published_at }} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link to="/blog" data-testid="blog-back-link" className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-slate-400 hover:text-[#E6C687] transition-colors mb-10">
          <ArrowLeft size={14} /> All Stories
        </Link>
        <p className="text-[0.62rem] font-mono text-[#C5A059] tracking-widest uppercase mb-4">{post.published_at} · {(post.tags || []).join(" / ")}</p>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight leading-tight">{post.title}</h1>
        {post.cover && <img src={post.cover} alt={post.title} className="w-full h-72 object-cover border border-[#C5A059]/20 mt-10" />}
        <div className="mt-10 space-y-5">
          {post.body.split("\n").filter(Boolean).map((para, i) => (
            <p key={i} className="text-slate-300 font-light leading-relaxed">{para}</p>
          ))}
        </div>
        {post.source_url && (
          <a href={post.source_url} target="_blank" rel="noopener noreferrer" data-testid="blog-source-link"
            className="mt-10 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-slate-500 hover:text-[#E6C687] transition-colors">
            Originally published at atlantis <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
