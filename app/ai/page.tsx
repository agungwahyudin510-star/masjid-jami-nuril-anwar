"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Send, Bot, User, Trash2, Loader } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string; };

const SUGGESTIONS = [
  "Apa hukum sholat berjamaah?",
  "Jelaskan rukun Islam",
  "Doa sebelum tidur",
  "Keutamaan membaca Al-Quran",
  "Apa itu puasa sunnah?",
  "Cara tayamum yang benar",
];

export default function IslamicAI() {
  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const accepted = localStorage.getItem("ai-disclaimer");
    if (!accepted) setShowDisclaimer(true);
  }, []);

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
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply ?? "Maaf, terjadi kesalahan." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Maaf, gagal terhubung ke server. Coba lagi." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{-webkit-tap-highlight-color:transparent;}
        body{background:#060f09;font-family:'Plus Jakarta Sans',sans-serif;color:#fff;overflow:hidden;}

        .bg-base{position:fixed;inset:0;background:radial-gradient(ellipse 100% 55% at 50% 0%,#0d2e18 0%,#060f09 60%);z-index:0;}
        .bg-pat{position:fixed;inset:0;opacity:.03;z-index:0;background-image:url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a84c' stroke-width='0.6'%3E%3Cpolygon points='60,6 114,33 114,87 60,114 6,87 6,33'/%3E%3Cpolygon points='60,22 98,42 98,78 60,98 22,78 22,42'/%3E%3C/g%3E%3C/svg%3E");background-size:120px 120px;}
        .bar{position:fixed;left:0;right:0;height:2px;z-index:10;background:linear-gradient(90deg,transparent,#b8962e 20%,#f0d080 50%,#b8962e 80%,transparent);}
        .bar-t{top:0;}.bar-b{bottom:0;}

        .ai-wrap{position:relative;z-index:1;display:flex;flex-direction:column;height:100dvh;max-width:480px;margin:0 auto;}

        @keyframes fadeDown{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes bounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-6px);opacity:1}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes popIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}

        /* Header */
        .ai-header{
          background:linear-gradient(160deg,#071a0e 0%,#0d2e18 40%,#091c13 100%);
          padding:56px 20px 20px;border-radius:0 0 24px 24px;
          position:relative;overflow:hidden;flex-shrink:0;
          border-bottom:1px solid rgba(201,168,76,.15);
          box-shadow:0 12px 40px rgba(0,0,0,.5);
          animation:fadeDown .6s cubic-bezier(.22,1,.36,1) both;
        }
        .ai-header::before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 60% 60% at 80% 20%,rgba(201,168,76,.07) 0%,transparent 70%);}
        .ai-ring{position:absolute;top:-50px;right:-50px;width:200px;height:200px;border-radius:50%;border:1px solid rgba(201,168,76,.08);box-shadow:0 0 0 28px rgba(201,168,76,.03);pointer-events:none;}

        .back-btn{display:inline-flex;align-items:center;gap:6px;color:rgba(201,168,76,.7);text-decoration:none;font-size:13px;font-weight:600;margin-bottom:16px;transition:color .2s;}
        .back-btn:hover{color:rgba(201,168,76,.9);}

        .ai-avatar{width:44px;height:44px;border-radius:14px;flex-shrink:0;background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.25);display:flex;align-items:center;justify-content:center;font-size:20px;}
        .ai-title{font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:#e8d8a0;}
        .online-dot{width:6px;height:6px;border-radius:50%;background:#2ecc71;box-shadow:0 0 6px #2ecc71;}

        .clear-btn{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:7px 12px;cursor:pointer;display:flex;align-items:center;gap:5px;color:rgba(255,255,255,.45);font-size:12px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;transition:all .2s;}
        .clear-btn:hover{background:rgba(231,76,60,.1);border-color:rgba(231,76,60,.25);color:#e74c3c;}

        /* Chat area */
        .chat-area{flex:1;overflow-y:auto;padding:16px 16px 0;display:flex;flex-direction:column;gap:12px;scrollbar-width:thin;scrollbar-color:rgba(201,168,76,.15) transparent;}
        .chat-area::-webkit-scrollbar{width:4px;}
        .chat-area::-webkit-scrollbar-thumb{background:rgba(201,168,76,.15);border-radius:4px;}

        /* Bubble */
        .bubble-wrap{display:flex;gap:8px;align-items:flex-end;}
        .bubble-wrap.user{flex-direction:row-reverse;}

        .bub-avatar{width:30px;height:30px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
        .bav-ai{background:rgba(46,204,113,.15);border:1px solid rgba(46,204,113,.2);}
        .bav-user{background:rgba(201,168,76,.15);border:1px solid rgba(201,168,76,.2);}

        .bubble{max-width:78%;padding:12px 14px;border-radius:18px;font-size:13.5px;line-height:1.7;white-space:pre-wrap;word-break:break-word;animation:fadeUp .3s ease both;}
        .bub-ai{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-bottom-left-radius:4px;color:rgba(255,255,255,.85);}
        .bub-user{background:linear-gradient(135deg,#122b1c,#1a4a2d);border:1px solid rgba(201,168,76,.2);border-bottom-right-radius:4px;color:#e8d8a0;}

        /* Typing */
        .typing{display:flex;gap:5px;align-items:center;padding:14px 16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:18px;border-bottom-left-radius:4px;width:fit-content;}
        .dot{width:7px;height:7px;border-radius:50%;background:rgba(201,168,76,.6);animation:bounce 1.2s ease-in-out infinite;}
        .dot:nth-child(2){animation-delay:.2s;}.dot:nth-child(3){animation-delay:.4s;}

        /* Empty state */
        .empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px 24px 16px;text-align:center;}
        .empty-icon{width:72px;height:72px;border-radius:24px;background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.15);display:flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px;}

        /* Suggestions */
        .suggestions{display:flex;flex-wrap:wrap;gap:8px;padding:12px 16px;flex-shrink:0;}
        .sug-chip{background:rgba(255,255,255,.04);border:1px solid rgba(201,168,76,.14);border-radius:20px;padding:7px 14px;font-size:12px;font-weight:600;color:rgba(201,168,76,.7);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:all .15s;}
        .sug-chip:hover{background:rgba(201,168,76,.08);border-color:rgba(201,168,76,.3);}

        /* Input bar */
        .input-bar{
          background:rgba(6,15,9,.95);border-top:1px solid rgba(201,168,76,.1);
          padding:12px 16px;padding-bottom:max(12px,env(safe-area-inset-bottom));
          display:flex;align-items:flex-end;gap:10px;flex-shrink:0;
          backdrop-filter:blur(20px);
        }
        .input-wrap{
          flex:1;background:rgba(255,255,255,.05);
          border:1px solid rgba(201,168,76,.16);border-radius:16px;
          padding:10px 14px;display:flex;align-items:flex-end;gap:8px;
          transition:border-color .2s;
        }
        .input-wrap:focus-within{border-color:rgba(201,168,76,.4);background:rgba(255,255,255,.07);}
        textarea{flex:1;background:transparent;border:none;outline:none;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:400;color:#fff;resize:none;max-height:120px;min-height:22px;line-height:1.5;}
        textarea::placeholder{color:rgba(255,255,255,.2);}

        .send-btn{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#122b1c,#1a4a2d);border:1px solid rgba(201,168,76,.25);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .2s;box-shadow:0 4px 12px rgba(0,0,0,.3);}
        .send-btn:hover:not(:disabled){border-color:rgba(201,168,76,.45);box-shadow:0 4px 16px rgba(26,74,45,.4);}
        .send-btn:active:not(:disabled){transform:scale(.9);}
        .send-btn:disabled{opacity:.35;cursor:not-allowed;}

        /* Disclaimer modal */
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:999;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(8px);}
        .modal-card{background:#0d1f13;border:1px solid rgba(201,168,76,.18);border-radius:24px;padding:28px 24px;max-width:360px;width:100%;animation:popIn .3s cubic-bezier(.34,1.56,.64,1) both;position:relative;overflow:hidden;}
        .modal-card::before{content:'';position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.3),transparent);}
        .modal-btn{width:100%;margin-top:20px;padding:14px;border-radius:13px;background:linear-gradient(135deg,#122b1c,#1a4a2d);border:1px solid rgba(201,168,76,.28);color:#e8d8a0;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;letter-spacing:.5px;transition:all .2s;}
        .modal-btn:hover{border-color:rgba(201,168,76,.5);}
        .fade-in{animation:fadeUp .3s ease both;}
      `}</style>

      <div className="bg-base"/><div className="bg-pat"/>
      <div className="bar bar-t"/><div className="bar bar-b"/>

      {/* Disclaimer */}
      {showDisclaimer && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div style={{fontSize:28,marginBottom:10}}>⚠️</div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#e8d8a0",marginBottom:12}}>
              Disclaimer AI Islam
            </h2>
            <p style={{fontSize:13,color:"rgba(255,255,255,.5)",lineHeight:1.75}}>
              AI Islam merupakan fitur bantuan berbasis kecerdasan buatan untuk informasi umum tentang Islam.
              <br/><br/>
              Jawaban AI <strong style={{color:"rgba(201,168,76,.8)"}}>bukan fatwa resmi</strong> dan tidak menggantikan konsultasi dengan ustadz atau ulama yang berwenang.
              <br/><br/>
              Untuk masalah akidah, pernikahan, waris, dan hukum syariah yang kompleks, silakan berkonsultasi langsung kepada ahli agama.
            </p>
            <button className="modal-btn" onClick={acceptDisclaimer}>Saya Mengerti</button>
          </div>
        </div>
      )}

      <div className="ai-wrap">

        {/* Header */}
        <div className="ai-header">
          <div className="ai-ring"/>
          <div style={{position:"relative",zIndex:1}}>
            <Link href="/home" className="back-btn">
              <ArrowLeft size={15}/> Kembali
            </Link>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div className="ai-avatar">🤖</div>
                <div>
                  <div className="ai-title">AI Islam</div>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginTop:3}}>
                    <div className="online-dot"/>
                    <span style={{fontSize:11,color:"rgba(255,255,255,.35)"}}>Powered by Groq · Llama 3</span>
                  </div>
                </div>
              </div>
              {messages.length > 0 && (
                <button className="clear-btn" onClick={() => setMessages([])}>
                  <Trash2 size={13}/> Hapus
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="chat-area">
          {messages.length === 0 && (
            <div className="empty-state fade-in">
              <div className="empty-icon">🕌</div>
              <p style={{fontFamily:"'Amiri',serif",fontSize:20,color:"rgba(201,168,76,.7)",marginBottom:6}}>
                بِسْمِ اللَّهِ
              </p>
              <p style={{fontSize:14,fontWeight:600,color:"#e8d8a0",marginBottom:6}}>
                Assalamu'alaikum! 👋
              </p>
              <p style={{fontSize:13,color:"rgba(255,255,255,.35)",lineHeight:1.7}}>
                Tanyakan apa saja seputar Islam — fiqih, doa, Al-Quran, hadist, dan lainnya.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`bubble-wrap ${msg.role} fade-in`}>
              <div className={`bub-avatar ${msg.role === "assistant" ? "bav-ai" : "bav-user"}`}>
                {msg.role === "assistant"
                  ? <Bot size={15} color="rgba(46,204,113,0.8)"/>
                  : <User size={14} color="rgba(201,168,76,0.8)"/>}
              </div>
              <div className={`bubble ${msg.role === "assistant" ? "bub-ai" : "bub-user"}`}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="bubble-wrap fade-in">
              <div className="bub-avatar bav-ai"><Bot size={15} color="rgba(46,204,113,0.8)"/></div>
              <div className="typing">
                <div className="dot"/><div className="dot"/><div className="dot"/>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Suggestions */}
        {messages.length === 0 && (
          <div className="suggestions">
            {SUGGESTIONS.map(s => (
              <button key={s} className="sug-chip" onClick={() => sendMessage(s)}>{s}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="input-bar">
          <div className="input-wrap">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Tanya tentang Islam..."
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button className="send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
            {loading
              ? <Loader size={18} color="rgba(201,168,76,0.8)" style={{animation:"spin 1s linear infinite"}}/>
              : <Send size={18} color="rgba(201,168,76,0.8)"/>}
          </button>
        </div>

      </div>
    </>
  );
}