"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("admin-auth")) {
      router.replace("/admin-login");
      return;
    }
    // Ambil statistik dari Supabase
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin-auth");
    router.replace("/");
  };

  const menuItems = [
    {
      title: "Pembaruan Kajian",
      desc: "Jadwal, tema & info kajian rutin masjid",
      href: "/admin/kajian",
      iconClass: "mi-gold",
      badgeClass: "badge-gold",
      arrowColor: "#c9a84c",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19V7l7-4 7 4v12"/><rect x="8" y="13" width="6" height="6"/>
          <path d="M8 9h6M11 9v4"/>
        </svg>
      ),
    },
    {
      title: "Info Saldo Infaq",
      desc: "Pemasukan, pengeluaran & saldo kas masjid",
      href: "/admin/infaq",
      iconClass: "mi-green",
      badgeClass: "badge-green",
      arrowColor: "#2ecc71",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#2ecc71" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="16" height="14" rx="2"/>
          <path d="M3 9h16M7 5V3M15 5V3M7 13h8M7 16h5"/>
        </svg>
      ),
    },
    {
      title: "Pengumuman",
      desc: "Buat & kelola pengumuman jemaah masjid",
      href: "/admin/pengumuman",
      iconClass: "mi-blue",
      badgeClass: "badge-blue",
      arrowColor: "#3498db",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#3498db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
      ),
    },
    {
      title: "Info Pembangunan",
      desc: "Update progres & dana pembangunan masjid",
      href: "/admin/pembangunan",
      iconClass: "mi-purple",
      badgeClass: "badge-purple",
      arrowColor: "#9b59b6",
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="#9b59b6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="13" width="18" height="7" rx="1"/>
          <path d="M6 13V9a6 6 0 0110 0v4"/>
          <line x1="11" y1="16" x2="11" y2="18"/>
        </svg>
      ),
    },
  ];

  if (loading) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .db-root{min-height:100vh;background:#060f09;font-family:'Plus Jakarta Sans',sans-serif;overflow-x:hidden;position:relative;}
        .bg-base{position:fixed;inset:0;background:radial-gradient(ellipse 100% 50% at 50% 0%,#0d2e18 0%,#060f09 55%);z-index:0;}
        .bg-pat{position:fixed;inset:0;opacity:.035;z-index:0;background-image:url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a84c' stroke-width='0.6'%3E%3Cpolygon points='60,6 114,33 114,87 60,114 6,87 6,33'/%3E%3Cpolygon points='60,22 98,42 98,78 60,98 22,78 22,42'/%3E%3C/g%3E%3C/svg%3E");background-size:120px 120px;}
        .bar{position:fixed;left:0;right:0;height:2px;z-index:10;background:linear-gradient(90deg,transparent,#b8962e 20%,#f0d080 50%,#b8962e 80%,transparent);}
        .bar-t{top:0;}.bar-b{bottom:0;}
        .page{position:relative;z-index:1;max-width:430px;margin:0 auto;padding:0 0 48px;min-height:100vh;}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .db-header{padding:24px 20px 20px;display:flex;align-items:center;justify-content:space-between;animation:fadeDown .6s cubic-bezier(.22,1,.36,1) both;}
        .greeting{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(201,168,76,.55);margin-bottom:3px;}
        .admin-name{font-family:'Playfair Display',serif;font-size:20px;color:#e8d8a0;font-weight:700;}
        .logout-btn{width:38px;height:38px;background:rgba(255,255,255,.04);border:1px solid rgba(201,168,76,.15);border-radius:11px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;}
        .logout-btn:hover{background:rgba(201,168,76,.08);border-color:rgba(201,168,76,.3);}
        .bismillah-bar{margin:0 20px 20px;padding:10px 18px;background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.14);border-radius:12px;text-align:center;font-family:'Amiri',serif;font-size:15px;color:rgba(201,168,76,.6);animation:fadeUp .6s .05s cubic-bezier(.22,1,.36,1) both;}
        .sec-label{font-size:10px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:rgba(201,168,76,.45);padding:0 20px;margin-bottom:10px;}
        .db-divider{display:flex;align-items:center;gap:10px;padding:0 20px;margin-bottom:14px;animation:fadeUp .6s .18s cubic-bezier(.22,1,.36,1) both;}
        .dline{flex:1;height:1px;}.dl{background:linear-gradient(90deg,transparent,rgba(201,168,76,.25));}.dr{background:linear-gradient(90deg,rgba(201,168,76,.25),transparent);}
        .dtext{font-size:9px;color:rgba(201,168,76,.35);letter-spacing:2.5px;text-transform:uppercase;white-space:nowrap;}
        .menu-list{display:flex;flex-direction:column;gap:10px;padding:0 20px;}
        .menu-item{background:rgba(255,255,255,.03);border:1px solid rgba(201,168,76,.1);border-radius:16px;padding:16px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:all .22s;position:relative;overflow:hidden;}
        .menu-item::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(201,168,76,.06),transparent);opacity:0;transition:opacity .22s;}
        .menu-item:hover::before{opacity:1;}
        .menu-item::after{content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;border-radius:0 3px 3px 0;background:linear-gradient(180deg,#c9a84c,#f0d080);opacity:0;transform:scaleY(.3);transition:all .22s;}
        .menu-item:hover::after{opacity:1;transform:scaleY(1);}
        .menu-item:hover{border-color:rgba(201,168,76,.28);transform:translateX(4px);box-shadow:0 4px 20px rgba(0,0,0,.3),-4px 0 0 rgba(201,168,76,.3);}
        .menu-icon{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .mi-gold{background:linear-gradient(135deg,rgba(201,168,76,.15),rgba(201,168,76,.06));border:1px solid rgba(201,168,76,.2);}
        .mi-green{background:linear-gradient(135deg,rgba(46,204,113,.15),rgba(46,204,113,.06));border:1px solid rgba(46,204,113,.2);}
        .mi-blue{background:linear-gradient(135deg,rgba(52,152,219,.15),rgba(52,152,219,.06));border:1px solid rgba(52,152,219,.2);}
        .mi-purple{background:linear-gradient(135deg,rgba(155,89,182,.15),rgba(155,89,182,.06));border:1px solid rgba(155,89,182,.2);}
        .menu-content{flex:1;min-width:0;}
        .menu-title{font-size:14px;font-weight:600;color:#e8d8a0;margin-bottom:3px;}
        .menu-desc{font-size:11px;color:rgba(255,255,255,.3);line-height:1.4;}
        .menu-arrow{opacity:.3;transition:all .2s;}
        .menu-item:hover .menu-arrow{opacity:.7;transform:translateX(3px);}
        .db-footer{text-align:center;margin-top:28px;padding:0 20px;font-family:'Amiri',serif;font-size:13px;color:rgba(201,168,76,.2);animation:fadeUp .6s .55s cubic-bezier(.22,1,.36,1) both;}
      `}</style>

      <div className="db-root">
        <div className="bg-base"/><div className="bg-pat"/>
        <div className="bar bar-t"/><div className="bar bar-b"/>

        <div className="page">

          {/* Header */}
          <div className="db-header">
            <div>
              <div className="greeting">Assalamu'alaikum</div>
              <div className="admin-name">Admin DKM</div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Keluar">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(201,168,76,0.65)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3"/>
                <path d="M10 11l3-3-3-3M13 8H6"/>
              </svg>
            </button>
          </div>

          {/* Bismillah */}
          <div className="bismillah-bar">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>

          {/* Divider */}
          <div className="db-divider">
            <div className="dline dl"/>
            <span className="dtext">✦ Menu Kelola ✦</span>
            <div className="dline dr"/>
          </div>

          {/* Menu */}
          <div className="menu-list">
            {menuItems.map((item, i) => (
              <div
                key={item.href}
                className="menu-item"
                onClick={() => router.push(item.href)}
                style={{ animation: `fadeUp 0.6s ${0.22 + i * 0.06}s cubic-bezier(0.22,1,0.36,1) both` }}
              >
                <div className={`menu-icon ${item.iconClass}`}>{item.icon}</div>
                <div className="menu-content">
                  <div className="menu-title">{item.title}</div>
                  <div className="menu-desc">{item.desc}</div>
                </div>
                <svg className="menu-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={item.arrowColor} strokeWidth="1.5">
                  <path d="M6 4l4 4-4 4"/>
                </svg>
              </div>
            ))}
          </div>

          <div className="db-footer">إِنَّمَا يَعْمُرُ مَسَاجِدَ اللَّهِ مَنْ آمَنَ بِاللَّهِ</div>
        </div>
      </div>
    </>
  );
}