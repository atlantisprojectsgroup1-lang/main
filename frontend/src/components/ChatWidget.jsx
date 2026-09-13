import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles } from "lucide-react";
import { API } from "../lib/api";

const SUGGESTIONS = ["3 BHK options in Zirakpur?", "Which projects are near possession?", "Price of Atlantis Grand?", "Book a site visit"];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Welcome to ATLANTIS. I'm your AI concierge — ask me about our residences, pricing, possession or locations across the Tricity." },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const sessionId = useRef(localStorage.getItem("atlantis_chat_sid") || (() => {
    const sid = crypto.randomUUID();
    localStorage.setItem("atlantis_chat_sid", sid);
    return sid;
  })());
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || streaming) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }, { role: "assistant", content: "" }]);
    setStreaming(true);
    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId.current, message: msg }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") break;
          try {
            const { token } = JSON.parse(payload);
            if (token) {
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + token };
                return copy;
              });
            }
          } catch (e) { /* partial chunk */ }
        }
      }
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: "I'm momentarily unavailable — please call +91 97083 97083 or leave your number in the enquiry form." };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <>
      <button data-testid="ai-concierge-toggle-btn" onClick={() => setOpen(!open)} aria-label={open ? "Close AI Concierge" : "AI Concierge"}
        className="fixed bottom-6 right-6 z-50 h-14 px-5 rounded-full glass-card border-[#D4AF37]/50 flex items-center gap-2 text-[#E6C687] hover:border-[#D4AF37] transition-all duration-300 animate-pulse-gold">
        {open ? <X size={18} /> : <Sparkles size={18} />}
        <span className="text-[0.65rem] font-mono uppercase tracking-[0.2em] hidden sm:inline">{open ? "Close" : "AI Concierge"}</span>
      </button>

      {open && (
        <div data-testid="ai-concierge-chat-modal" className="fixed bottom-[10.5rem] right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 h-[480px] glass-card flex flex-col overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#C5A059]/20 bg-[#0A1322]/80">
            <div>
              <p className="font-serif text-lg gold-text">ATLANTIS Concierge</p>
              <p className="text-[0.6rem] font-mono text-slate-500 tracking-widest uppercase">Powered by AI · Replies instantly</p>
            </div>
            <button data-testid="ai-concierge-close-btn" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-200"><X size={18} /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" data-testid="ai-concierge-messages">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-[#D4AF37]/15 text-slate-100 border border-[#D4AF37]/30" : "bg-[#101B2E] text-slate-300 border border-slate-800"}`}>
                  {m.content || (streaming && i === messages.length - 1 ? <span className="text-slate-500">Thinking…</span> : "")}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} data-testid={`ai-suggestion-${s.slice(0, 12).replace(/\W/g, "-").toLowerCase()}`} onClick={() => send(s)}
                  className="text-[0.65rem] font-mono px-3 py-1.5 border border-[#C5A059]/30 text-[#E6C687]/80 hover:border-[#D4AF37] transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="px-4 py-3 border-t border-[#C5A059]/20 bg-[#0A1322]/80 flex gap-2">
            <input data-testid="ai-concierge-chat-input" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about projects, prices, possession…" className="flex-1 px-4 py-2.5 text-sm" />
            <button data-testid="ai-concierge-chat-send-btn" onClick={() => send()} disabled={streaming}
              className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-[#C5A059] to-[#D4AF37] text-[#050B14] disabled:opacity-50">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
