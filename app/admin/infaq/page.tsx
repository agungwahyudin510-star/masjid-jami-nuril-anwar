"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Infaq = { id: number; keterangan: string; jumlah: number; tipe: "masuk" | "keluar"; tanggal: string; };

const emptyForm = { keterangan: "", jumlah: "", tipe: "masuk" as "masuk"|"keluar", tanggal: new Date().toISOString().split("T")[0] };

export default function AdminInfaqPage() {
  const router = useRouter();
  const [list, setList] = useState<Infaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState<{ msg: string; type: "ok"|"err" }|null>(null);

  useEffect(() => {
    if (!localStorage.getItem("admin-auth")) { router.replace("/admin-login"); return; }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("infaq").select("*").order("tanggal", { ascending: false });
    setList(data || []);
    setLoading(false);
  };

  const showToast = (msg: string, type: "ok"|"err") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const totalMasuk = list.filter(i => i.tipe === "masuk").reduce((a, b) => a + b.jumlah, 0);
  const totalKeluar = list.filter(i => i.tipe === "keluar").reduce((a, b) => a + b.jumlah, 0);
  const saldo = totalMasuk - totalKeluar;

  const formatRp = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  const formatTgl = (tgl: string) => new Date(tgl).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  const handleSave = async () => {
    if (!form.keterangan.trim() || !form.jumlah || !form.tanggal) { showToast("Semua field wajib diisi", "err"); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from("infaq").insert({ keterangan: form.keterangan, jumlah: parseInt(form.jumlah), tipe: form.tipe, tanggal: form.tanggal });
      if (error) throw error;
      showToast("Data infaq berhasil ditambahkan", "ok");
      setShowForm(false);
      setForm(emptyForm);
      fetchData();
    } catch (err: any) { 
  console.error("Error:", err);
  showToast(err?.message || "Terjadi kesalahan", "err"); 
}
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus data ini?")) return;
    await supabase.from("infaq").delete().eq("id", id);
    showToast("Data dihapus", "ok");
    fetchData();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .pg-root{min-height:100vh;background:#060f09;font-family:'Plus Jakarta Sans',sans-serif;position:relative;overflow-x:hidden;}
        .bg-base{position:fixed;inset:0;background:radial-gradient(ellipse 100% 50% at 50% 0%,#0d2e18 0%,#060f09 55%);z-index:0;}
        .bar{position:fixed;left:0;right:0;height:2px;z-index:10;background:linear-gradient(90deg,transparent,#b8962e 20%,#f0d080 50%,#b8962e 80%,transparent);}
        .bar-t{top:0;}.bar-b{bottom:0;}
        .page{position:relative;z-index:1;max-width:430px;margin:0 auto;padding:0 0 48px;}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .ap-header{padding:24px 20px 16px;display:flex;align-items:center;gap:12px;animation:fadeDown .6s cubic-bezier(.22,1,.36,1) both;}
        .back-btn{width:36px;height:36px;background:rgba(255,255,255,.04);border:1px solid rgba(201,168,76,.15);border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;flex-shrink:0;}
        .back-btn:hover{background:rgba(201,168,76,.08);border-color:rgba(201,168,76,.3);}
        .header-text{flex:1;}
        .header-title{font-family:'Playfair Display',serif;font-size:20px;color:#e8d8a0;font-weight:700;}
        .header-sub{font-size:11px;color:rgba(255,255,255,.3);margin-top:2px;}
        .add-btn{display:flex;align-items:center;gap:6px;padding:8px 14px;background:linear-gradient(135deg,#122b1c,#1a4a2d);border:1px solid rgba(201,168,76,.28);border-radius:10px;color:#e8d8a0;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;}
        .add-btn:hover{border-color:rgba(201,168,76,.5);}

        /* Saldo cards */
        .saldo-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:0 20px;margin-bottom:20px;animation:fadeUp .6s .05s cubic-bezier(.22,1,.36,1) both;}
        .saldo-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:12px;text-align:center;}
        .saldo-card.main{grid-column:span 3;background:rgba(201,168,76,.06);border-color:rgba(201,168,76,.18);padding:16px;}
        .saldo-label{font-size:9.5px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;}
        .sl-saldo{color:rgba(201,168,76,.6);}
        .sl-masuk{color:rgba(46,204,113,.6);}
        .sl-keluar{color:rgba(231,76,60,.6);}
        .saldo-value{font-size:13px;font-weight:700;color:#e8d8a0;}
        .saldo-card.main .saldo-value{font-size:18px;}

        .list{display:flex;flex-direction:column;gap:8px;padding:0 20px;animation:fadeUp .6s .12s cubic-bezier(.22,1,.36,1) both;}
        .item-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:14px;display:flex;align-items:center;gap:12px;transition:all .2s;}
        .item-tipe{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;}
        .tipe-masuk{background:rgba(46,204,113,.1);border:1px solid rgba(46,204,113,.2);}
        .tipe-keluar{background:rgba(231,76,60,.1);border:1px solid rgba(231,76,60,.2);}
        .item-info{flex:1;min-width:0;}
        .item-ket{font-size:13px;font-weight:600;color:#e8d8a0;margin-bottom:2px;}
        .item-tgl{font-size:10.5px;color:rgba(255,255,255,.3);}
        .item-jumlah{font-size:14px;font-weight:700;white-space:nowrap;}
        .jml-masuk{color:#2ecc71;}
        .jml-keluar{color:#e74c3c;}
        .btn-del-sm{width:28px;height:28px;background:rgba(231,76,60,.08);border:1px solid rgba(231,76,60,.15);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;flex-shrink:0;}
        .btn-del-sm:hover{background:rgba(231,76,60,.18);}

        .empty{text-align:center;padding:48px 20px;color:rgba(255,255,255,.2);font-size:13px;}
        .empty-icon{font-size:36px;margin-bottom:12px;opacity:.4;}
        .loading{text-align:center;padding:48px;color:rgba(201,168,76,.4);font-size:13px;}
        .spinner{width:20px;height:20px;border:2px solid rgba(201,168,76,.2);border-top-color:#c9a84c;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 12px;}

        .overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:100;display:flex;align-items:flex-end;justify-content:center;}
        .modal{width:100%;max-width:430px;background:#0d1f13;border:1px solid rgba(201,168,76,.18);border-radius:22px 22px 0 0;padding:28px 24px 40px;animation:slideUp .4s cubic-bezier(.22,1,.36,1) both;position:relative;}
        .modal::before{content:'';position:absolute;top:0;left:15%;right:15%;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.3),transparent);}
        .modal-handle{width:36px;height:4px;background:rgba(255,255,255,.12);border-radius:2px;margin:0 auto 20px;}
        .modal-title{font-family:'Playfair Display',serif;font-size:18px;color:#e8d8a0;font-weight:700;margin-bottom:20px;}
        .field{margin-bottom:14px;}
        .field label{display:block;font-size:10.5px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:rgba(201,168,76,.6);margin-bottom:7px;}
        .field input,.field select{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(201,168,76,.14);border-radius:11px;padding:12px 14px;font-size:14px;color:rgba(255,255,255,.85);font-family:'Plus Jakarta Sans',sans-serif;outline:none;transition:all .2s;}
        .field input::placeholder{color:rgba(255,255,255,.18);}
        .field input:focus,.field select:focus{border-color:rgba(201,168,76,.4);background:rgba(255,255,255,.07);}
        .field select option{background:#0d1f13;color:#e8d8a0;}
        .tipe-toggle{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
        .tipe-btn{padding:12px;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;border:1px solid;text-align:center;}
        .tipe-btn.masuk-on{background:rgba(46,204,113,.15);color:#2ecc71;border-color:rgba(46,204,113,.3);}
        .tipe-btn.masuk-off{background:rgba(255,255,255,.04);color:rgba(255,255,255,.3);border-color:rgba(255,255,255,.08);}
        .tipe-btn.keluar-on{background:rgba(231,76,60,.15);color:#e74c3c;border-color:rgba(231,76,60,.3);}
        .tipe-btn.keluar-off{background:rgba(255,255,255,.04);color:rgba(255,255,255,.3);border-color:rgba(255,255,255,.08);}
        .row2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .modal-actions{display:flex;gap:10px;margin-top:20px;}
        .btn-cancel{flex:1;padding:13px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:11px;color:rgba(255,255,255,.5);font-size:13px;font-weight:600;cursor:pointer;}
        .btn-save{flex:2;padding:13px;background:linear-gradient(135deg,#122b1c,#1a4a2d);border:1px solid rgba(201,168,76,.28);border-radius:11px;color:#e8d8a0;font-size:13px;font-weight:600;cursor:pointer;}
        .btn-save:hover{border-color:rgba(201,168,76,.5);}
        .btn-save:disabled{opacity:.5;cursor:not-allowed;}
        .toast{position:fixed;bottom:32px;left:50%;transform:translateX(-50%);padding:10px 20px;border-radius:12px;font-size:13px;font-weight:600;z-index:200;white-space:nowrap;animation:fadeUp .3s ease both;}
        .toast-ok{background:#1a4a2d;color:#7ecf9a;border:1px solid rgba(46,204,113,.25);}
        .toast-err{background:#3d1a1a;color:#f09090;border:1px solid rgba(231,76,60,.25);}
      `}</style>

      <div className="pg-root">
        <div className="bg-base"/>
        <div className="bar bar-t"/><div className="bar bar-b"/>
        <div className="page">
          <div className="ap-header">
            <button className="back-btn" onClick={() => router.push("/admin")}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(201,168,76,0.6)" strokeWidth="1.5" strokeLinecap="round"><path d="M9 11L5 7l4-4"/></svg>
            </button>
            <div className="header-text">
              <div className="header-title">Info Saldo Infaq</div>
              <div className="header-sub">{list.length} transaksi tercatat</div>
            </div>
            <button className="add-btn" onClick={() => setShowForm(true)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="7" y1="2" x2="7" y2="12"/><line x1="2" y1="7" x2="12" y2="7"/></svg>
              Tambah
            </button>
          </div>

          {/* Saldo summary */}
          <div className="saldo-grid">
            <div className="saldo-card main">
              <div className="saldo-label sl-saldo">Saldo Saat Ini</div>
              <div className="saldo-value">{formatRp(saldo)}</div>
            </div>
            <div className="saldo-card">
              <div className="saldo-label sl-masuk">Masuk</div>
              <div className="saldo-value" style={{color:"#2ecc71",fontSize:12}}>{formatRp(totalMasuk)}</div>
            </div>
            <div className="saldo-card">
              <div className="saldo-label sl-keluar">Keluar</div>
              <div className="saldo-value" style={{color:"#e74c3c",fontSize:12}}>{formatRp(totalKeluar)}</div>
            </div>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"/><div>Memuat data...</div></div>
          ) : list.length === 0 ? (
            <div className="empty"><div className="empty-icon">💰</div><div>Belum ada transaksi</div></div>
          ) : (
            <div className="list">
              {list.map((item) => (
                <div key={item.id} className="item-card">
                  <div className={`item-tipe ${item.tipe === "masuk" ? "tipe-masuk" : "tipe-keluar"}`}>
                    {item.tipe === "masuk" ? "↓" : "↑"}
                  </div>
                  <div className="item-info">
                    <div className="item-ket">{item.keterangan}</div>
                    <div className="item-tgl">{formatTgl(item.tanggal)}</div>
                  </div>
                  <div className={`item-jumlah ${item.tipe === "masuk" ? "jml-masuk" : "jml-keluar"}`}>
                    {item.tipe === "masuk" ? "+" : "-"}{formatRp(item.jumlah)}
                  </div>
                  <button className="btn-del-sm" onClick={() => handleDelete(item.id)}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#e74c3c" strokeWidth="1.5" strokeLinecap="round"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="modal">
            <div className="modal-handle"/>
            <div className="modal-title">Tambah Transaksi</div>
            <div className="field">
              <label>Tipe Transaksi</label>
              <div className="tipe-toggle">
                <button className={`tipe-btn ${form.tipe==="masuk"?"masuk-on":"masuk-off"}`} onClick={() => setForm(f=>({...f,tipe:"masuk"}))}>↓ Pemasukan</button>
                <button className={`tipe-btn ${form.tipe==="keluar"?"keluar-on":"keluar-off"}`} onClick={() => setForm(f=>({...f,tipe:"keluar"}))}>↑ Pengeluaran</button>
              </div>
            </div>
            <div className="field"><label>Keterangan</label><input type="text" placeholder="Contoh: Infaq Jumat" value={form.keterangan} onChange={(e) => setForm(f=>({...f,keterangan:e.target.value}))}/></div>
            <div className="row2">
              <div className="field"><label>Jumlah (Rp)</label><input type="number" placeholder="50000" value={form.jumlah} onChange={(e) => setForm(f=>({...f,jumlah:e.target.value}))}/></div>
              <div className="field"><label>Tanggal</label><input type="date" value={form.tanggal} onChange={(e) => setForm(f=>({...f,tanggal:e.target.value}))}/></div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowForm(false)}>Batal</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>{saving?"Menyimpan...":"Tambah Transaksi"}</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className={`toast ${toast.type==="ok"?"toast-ok":"toast-err"}`}>{toast.msg}</div>}
    </>
  );
}