import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * 3D Coverflow showcase — auto-scroll, pause on hover, drag/swipe,
 * keyboard arrows, infinite loop, parallax depth, glass captions.
 */
export default function Coverflow({ items = [], autoSpeed = 4000, onSelect, testid = "coverflow-carousel", height = "h-[420px]" }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const drag = useRef({ startX: 0, dragging: false });
  const n = items.length;
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const go = useCallback((dir) => {
    if (n === 0) return;
    setActive((a) => (a + dir + n) % n);
  }, [n]);

  useEffect(() => {
    if (paused || n < 2 || reduced) return;
    const t = setInterval(() => go(1), autoSpeed);
    return () => clearInterval(t);
  }, [paused, go, autoSpeed, n, reduced]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (n === 0) return null;

  const onPointerDown = (e) => { drag.current = { startX: e.clientX ?? e.touches?.[0]?.clientX ?? 0, dragging: true }; };
  const onPointerUp = (e) => {
    if (!drag.current.dragging) return;
    const endX = e.clientX ?? e.changedTouches?.[0]?.clientX ?? drag.current.startX;
    const dx = endX - drag.current.startX;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    drag.current.dragging = false;
  };

  return (
    <div data-testid={testid} className={`relative ${height} select-none`}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onPointerDown={onPointerDown} onPointerUp={onPointerUp}
      onTouchStart={onPointerDown} onTouchEnd={onPointerUp}>
      <div className="coverflow-stage absolute inset-0 flex items-center justify-center">
        {items.map((item, i) => {
          let offset = i - active;
          if (offset > n / 2) offset -= n;
          if (offset < -n / 2) offset += n;
          const abs = Math.abs(offset);
          const visible = abs <= 2;
          const style = {
            transform: `translateX(${offset * 46}%) translateZ(${-abs * 260}px) rotateY(${offset * -32}deg) scale(${1 - abs * 0.12})`,
            opacity: visible ? 1 - abs * 0.35 : 0,
            zIndex: 20 - abs,
            filter: abs === 0 ? "none" : "brightness(0.45)",
            pointerEvents: visible ? "auto" : "none",
          };
          return (
            <div key={item.key ?? i} data-testid={`${testid}-slide-${i}`} className="coverflow-slide absolute w-[78%] sm:w-[52%] lg:w-[42%] h-full cursor-pointer" style={style}
              onClick={() => { if (offset === 0 && onSelect) onSelect(item); else if (visible) setActive(i); }}>
              <div className="relative w-full h-full overflow-hidden border border-[#C5A059]/30 shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
                <img src={item.image} alt={item.alt || item.title} className="w-full h-full object-cover" loading={abs > 1 ? "lazy" : "eager"} draggable={false} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-transparent to-transparent" />
                {abs === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 p-6 glass-card border-0 border-t border-[#C5A059]/30">
                    {item.eyebrow && <p className="eyebrow mb-1">{item.eyebrow}</p>}
                    <h3 className="font-serif text-2xl text-slate-100">{item.title}</h3>
                    {item.subtitle && <p className="text-xs font-mono text-slate-400 mt-1 tracking-wider">{item.subtitle}</p>}
                  </div>
                )}
              </div>
              <div className="mx-auto mt-2 h-4 w-[90%] bg-black/50 blur-md rounded-full" style={{ opacity: abs === 0 ? 0.7 : 0.3 }} />
            </div>
          );
        })}
      </div>

      <button data-testid={`${testid}-prev`} aria-label="Previous" onClick={(e) => { e.stopPropagation(); go(-1); }}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 glass-card flex items-center justify-center text-[#E6C687] hover:border-[#D4AF37] transition-colors">
        <ChevronLeft size={20} />
      </button>
      <button data-testid={`${testid}-next`} aria-label="Next" onClick={(e) => { e.stopPropagation(); go(1); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 glass-card flex items-center justify-center text-[#E6C687] hover:border-[#D4AF37] transition-colors">
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {items.map((_, i) => (
          <button key={i} data-testid={`${testid}-dot-${i}`} aria-label={`Slide ${i + 1}`} onClick={() => setActive(i)}
            className={`h-1 transition-all duration-500 ${i === active ? "w-8 bg-[#D4AF37]" : "w-3 bg-slate-600 hover:bg-slate-400"}`} />
        ))}
      </div>
    </div>
  );
}
