"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Bot, User, Trash2, Loader } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  "Apa hukum sholat berjamaah?",
  "Jelaskan rukun Islam",
  "Doa sebelum tidur",
  "Keutamaan membaca Al-Quran",
  "Apa itu puasa sunnah?",
  "Cara tayamum yang benar",
];

export default function IslamicAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cek disclaimer
  useEffect(() => {
    const accepted = localStorage.getItem("ai-disclaimer");
    if (!accepted) setShowDisclaimer(true);
  }, []);

  // Auto scroll ke bawah
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function acceptDisclaimer() {
    localStorage.setItem("ai-disclaimer", "accepted");
    setShowDisclaimer(false);
  }

  async function sendMessage(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Reset tinggi textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      const reply = data.reply ?? "Maaf, terjadi kesalahan.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Maaf, gagal terhubung ke server. Coba lagi." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Nunito:wght@400;500;600;700;800&family=Amiri:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --g:    #166534;
          --g2:   #15803d;
          --gold: #d4a732;
          --gold2:#f0c84e;
          --ink:  #0f1f0f;
          --bg:   #f0faf4;
        }
        html { -webkit-tap-highlight-color: transparent; }
        body { background: var(--bg); font-family: 'Nunito', sans-serif; color: var(--ink); overflow: hidden; }

        .ai-header {
          background: linear-gradient(160deg, #0c3d20, #166534 50%, #14532d);
          padding: 52px 20px 20px;
          border-radius: 0 0 28px 28px;
          box-shadow: 0 8px 28px rgba(22,101,52,.3);
          position: relative; overflow: hidden; flex-shrink: 0;
        }
        .ai-header::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 60% at 80% 20%, rgba(212,167,50,.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          color: rgba(255,255,255,.7); text-decoration: none;
          font-size: 13px; font-weight: 700; margin-bottom: 16px;
        }

        .chat-area {
          flex: 1;
          overflow-y: auto;
          padding: 16px 16px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .bubble-wrap { display: flex; gap: 8px; align-items: flex-end; }
        .bubble-wrap.user { flex-direction: row-reverse; }

        .avatar {
          width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .avatar.ai  { background: linear-gradient(135deg,var(--g),var(--g2)); color:#fff; }
        .avatar.user{ background: linear-gradient(135deg,var(--gold),var(--gold2)); color:#3a1f00; }

        .bubble {
          max-width: 78%; padding: 12px 14px; border-radius: 18px;
          font-size: 14px; line-height: 1.65; white-space: pre-wrap;
          word-break: break-word; box-shadow: 0 2px 8px rgba(0,0,0,.07);
        }
        .bubble.ai   { background:#fff; border-bottom-left-radius:4px; border:1px solid rgba(22,101,52,.1); }
        .bubble.user { background:linear-gradient(135deg,var(--g),var(--g2)); color:#fff; border-bottom-right-radius:4px; }

        .typing {
          display:flex; gap:5px; align-items:center; padding:14px 16px;
          background:#fff; border-radius:18px; border-bottom-left-radius:4px;
          border:1px solid rgba(22,101,52,.1); width:fit-content;
          box-shadow:0 2px 8px rgba(0,0,0,.07);
        }
        .dot {
          width:7px; height:7px; border-radius:50%; background:var(--g2);
          animation: bounce 1.2s ease-in-out infinite;
        }
        .dot:nth-child(2){animation-delay:.2s;}
        .dot:nth-child(3){animation-delay:.4s;}
        @keyframes bounce {
          0%,60%,100%{transform:translateY(0);opacity:.5;}
          30%{transform:translateY(-6px);opacity:1;}
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .suggestions { display:flex; flex-wrap:wrap; gap:8px; padding:12px 16px; flex-shrink:0; }
        .chip {
          background:#fff; border:1.5px solid rgba(22,101,52,.2);
          border-radius:20px; padding:7px 14px; font-size:12px; font-weight:600;
          color:var(--g); cursor:pointer; font-family:'Nunito',sans-serif;
          transition:all .15s;
        }
        .chip:active { background:rgba(22,101,52,.08); transform:scale(.96); }

        .input-bar {
          background:#fff; border-top:1px solid rgba(22,101,52,.1);
          padding:12px 16px; padding-bottom:max(12px,env(safe-area-inset-bottom));
          display:flex; align-items:flex-end; gap:10px; flex-shrink:0;
        }
        .input-wrap {
          flex:1; background:#f0faf4;
          border:1.5px solid rgba(22,101,52,.2); border-radius:20px;
          padding:10px 14px; display:flex; align-items:flex-end; gap:8px;
          transition:border-color .2s;
        }
        .input-wrap:focus-within { border-color:var(--g2); }
        textarea {
          flex:1; background:transparent; border:none; outline:none;
          font-family:'Nunito',sans-serif; font-size:14px; font-weight:500;
          color:var(--ink); resize:none; max-height:120px; min-height:22px; line-height:1.5;
        }
        textarea::placeholder { color:#9ca3af; }

        .send-btn {
          width:42px; height:42px; border-radius:50%;
          background:linear-gradient(135deg,var(--g),var(--g2));
          border:none; display:flex; align-items:center; justify-content:center;
          cursor:pointer; flex-shrink:0; transition:transform .12s, opacity .12s;
          box-shadow:0 4px 12px rgba(22,101,52,.3);
        }
        .send-btn:active { transform:scale(.9); }
        .send-btn:disabled { opacity:.45; cursor:not-allowed; }

        .empty-state {
          display:flex; flex-direction:column; align-items:center;
          justify-content:center; padding:32px 24px 16px; text-align:center;
        }
        .empty-icon {
          width:72px; height:72px; border-radius:24px;
          background:linear-gradient(135deg,rgba(22,101,52,.1),rgba(22,101,52,.05));
          border:1px solid rgba(22,101,52,.15);
          display:flex; align-items:center; justify-content:center;
          font-size:32px; margin-bottom:16px;
        }

        /* Disclaimer Modal */
        .modal-overlay {
          position:fixed; inset:0; background:rgba(0,0,0,.7);
          z-index:999; display:flex; align-items:center; justify-content:center; padding:24px;
          backdrop-filter:blur(4px);
        }
        .modal-card {
          background:#fff; border-radius:28px; padding:28px 24px;
          max-width:360px; width:100%;
          animation: popIn .3s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes popIn {
          from { opacity:0; transform:scale(.85); }
          to   { opacity:1; transform:scale(1); }
        }
        .modal-btn {
          width:100%; margin-top:20px; padding:14px; border-radius:16px;
          background:linear-gradient(90deg,var(--g),var(--g2));
          color:#fff; border:none; font-family:'Nunito',sans-serif;
          font-size:14px; font-weight:800; cursor:pointer;
        }

        @keyframes fadeUp {
          from{opacity:0;transform:translateY(10px);}
          to{opacity:1;transform:translateY(0);}
        }
        .fade-in { animation: fadeUp .3s ease both; }
      `}</style>

      {/* DISCLAIMER MODAL */}
      {showDisclaimer && (
        <div className="modal-overlay">
          <div className="modal-card">
            <p style={{ fontSize: 28, marginBottom: 10 }}>⚠️</p>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", marginBottom: 12 }}>
              Disclaimer AI Islam
            </h2>
            <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.75 }}>
              AI Islam merupakan fitur bantuan berbasis kecerdasan buatan untuk informasi umum tentang Islam.
              <br /><br />
              Jawaban AI <strong>bukan fatwa resmi</strong> dan tidak menggantikan konsultasi dengan ustadz atau ulama yang berwenang.
              <br /><br />
              Untuk masalah akidah, pernikahan, waris, dan hukum syariah yang kompleks, silakan berkonsultasi langsung kepada ahli agama.
            </p>
            <button className="modal-btn" onClick={acceptDisclaimer}>
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", height:"100dvh", maxWidth:480, margin:"0 auto" }}>

        {/* HEADER */}
        <div className="ai-header">
          <div style={{ position:"relative", zIndex:1 }}>
            <Link href="/" className="back-btn">
              <ArrowLeft size={16} /> Kembali
            </Link>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{
                  width:46, height:46, borderRadius:15, flexShrink:0,
                  background:"rgba(212,167,50,.15)", border:"1px solid rgba(212,167,50,.3)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:22,
                }}>🤖</div>
                <div>
                  <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:18, fontWeight:700, color:"#fff" }}>
                    AI Islam
                  </h1>
                  <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:3 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80" }} />
                    <p style={{ fontSize:11, color:"rgba(255,255,255,.55)" }}>
                      Powered by Groq · Llama 3
                    </p>
                  </div>
                </div>
              </div>

              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  style={{
                    background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.15)",
                    borderRadius:10, padding:"7px 10px", cursor:"pointer",
                    display:"flex", alignItems:"center", gap:5,
                    color:"rgba(255,255,255,.7)", fontSize:12, fontWeight:700,
                    fontFamily:"'Nunito',sans-serif",
                  }}
                >
                  <Trash2 size={13} /> Hapus
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CHAT AREA */}
        <div className="chat-area">
          {messages.length === 0 && (
            <div className="empty-state fade-in">
              <div className="empty-icon">🕌</div>
              <p style={{ fontFamily:"'Amiri',serif", fontSize:20, color:"var(--g)", marginBottom:6 }}>
                بِسْمِ اللَّهِ
              </p>
              <p style={{ fontSize:14, fontWeight:700, color:"var(--ink)", marginBottom:6 }}>
                Assalamu'alaikum! 👋
              </p>
              <p style={{ fontSize:13, color:"#6b7280", lineHeight:1.7 }}>
                Tanyakan apa saja seputar Islam — fiqih, doa, Al-Quran, hadist, dan lainnya.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`bubble-wrap ${msg.role} fade-in`}>
              <div className={`avatar ${msg.role === "assistant" ? "ai" : "user"}`}>
                {msg.role === "assistant" ? <Bot size={16} /> : <User size={15} />}
              </div>
              <div className={`bubble ${msg.role === "assistant" ? "ai" : "user"}`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="bubble-wrap fade-in">
              <div className="avatar ai"><Bot size={16} /></div>
              <div className="typing">
                <div className="dot" /><div className="dot" /><div className="dot" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* SUGGESTIONS */}
        {messages.length === 0 && (
          <div className="suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="chip" onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* INPUT BAR */}
        <div className="input-bar">
          <div className="input-wrap">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Tanya tentang Islam..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            {loading
              ? <Loader size={18} color="#fff" style={{ animation:"spin 1s linear infinite" }} />
              : <Send size={18} color="#fff" />}
          </button>
        </div>

      </div>
    </>
  );
}