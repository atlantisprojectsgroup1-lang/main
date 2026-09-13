export default function TickerBar({ items = [], testid = "ticker-bar" }) {
  if (!items.length) return null;
  const row = items.join("   ✦   ");
  return (
    <div data-testid={testid} className="relative overflow-hidden border-y border-[#C5A059]/25 bg-[#0A1322]/70 py-4">
      <div className="ticker-track flex whitespace-nowrap will-change-transform">
        {[0, 1].map((k) => (
          <span key={k} className="font-serif text-xl gold-text tracking-wide px-4 shrink-0">{row}   ✦   </span>
        ))}
      </div>
    </div>
  );
}
