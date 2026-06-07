"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Kajian = {
  id: number;
  judul: string;
  ustadz: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  deskripsi: string;
  aktif: boolean;
};

const emptyForm = { judul: "", ustadz: "", tanggal: "", waktu: "", lokasi: "Masjid Jami' Nuril Anwar", deskripsi: "", aktif: true };

export default function AdminKajianPage() {
  const router = useRouter();
  const [list, setList] = useState<Kajian[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Kajian | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("admin-auth")) { router.replace("/admin-login"); return; }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("kajian").select("*").order("tanggal", { ascending: false });
    setList(data || []);
    setLoading(false);
  };

  const showToast = (msg: string, type: "ok" | "err") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (item: Kajian) => { setEditItem(item); setForm({ judul: item.judul, ustadz: item.ustadz, tanggal: item.tanggal, waktu: item.waktu, lokasi: item.lokasi, deskripsi: item.deskripsi || "", aktif: item.aktif }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.judul.trim() || !form.ustadz.trim() || !form.tanggal || !form.waktu) { showToast("Judul, ustadz, tanggal & waktu wajib diisi", "err"); return; }
    setSaving(true);
    try {
      if (editItem) {
        const { error } = await supabase.from("kajian").update({ ...form, is_new: true }).eq("id", editItem.id);
        if (error) throw error;
        showToast("Kajian berhasil diperbarui", "ok");
      } else {
        const { error } = await supabase.from("kajian").insert({ ...form, is_new: true });
        if (error) throw error;
        showToast("Kajian berhasil ditambahkan", "ok");
      }
      setShowForm(false);
      fetchData();
    } catch (err: any) { 
  console.error("Error:", err);
  showToast(err?.message || "Terjadi kesalahan", "err"); 
}
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus kajian ini?")) return;
    await supabase.from("kajian").delete().eq("id", id);
    showToast("Kajian dihapus", "ok");
    fetchData();
  };

  const toggleAktif = async (item: Kajian) => {
    await supabase.from("kajian").update({ aktif: !item.aktif }).eq("id", item.id);
    fetchData();
  };

  const formatTgl = (tgl: string) => new Date(tgl).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .pg-root{min-height:100vh;background:#060f09;font-family:'Plus Jakarta Sans',sans-serif;position:relative;overflow-x:hidden;}
        .bg-base{position:fixed;inset:0;background:radial-gradient(ellipse 100% 50% at 50% 0%,#0d2e18 0%,#060f09 55%);z-index:0;}
        .bg-pat{position:fixed;inset:0;opacity:.03;z-index:0;background-image:url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c9a84c' stroke-width='0.6'%3E%3Cpolygon points='60,6 114,33 114,87 60,114 6,87 6,33'/%3E%3C/g%3E%3C/svg%3E");background-size:120px 120px;}
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
        .add-btn{display:flex;align-items:center;gap:6px;padding:8px 14px;background:linear-gradient(135deg,#122b1c,#1a4a2d);border:1px solid rgba(201,168,76,.28);border-radius:10px;color:#e8d8a0;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap;}
        .add-btn:hover{border-color:rgba(201,168,76,.5);}
        .list{display:flex;flex-direction:column;gap:10px;padding:0 20px;animation:fadeUp .6s .1s cubic-bezier(.22,1,.36,1) both;}
        .item-card{background:rgba(255,255,255,.03);border:1px solid rgba(201,168,76,.1);border-radius:16px;padding:16px;position:relative;overflow:hidden;transition:all .2s;}
        .item-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.2),transparent);}
        .item-card.nonaktif{opacity:.5;}
        .item-row{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:6px;}
        .item-judul{font-size:14px;font-weight:600;color:#e8d8a0;line-height:1.3;}
        .item-badge{font-size:9px;font-weight:600;padding:3px 9px;border-radius:20px;white-space:nowrap;flex-shrink:0;}
        .badge-aktif{background:rgba(46,204,113,.12);color:#2ecc71;border:1px solid rgba(46,204,113,.2);}
        .badge-nonaktif{background:rgba(255,255,255,.06);color:rgba(255,255,255,.3);border:1px solid rgba(255,255,255,.08);}
        .item-meta{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px;}
        .meta-chip{display:flex;align-items:center;gap:4px;font-size:10.5px;color:rgba(255,255,255,.4);}
        .item-desc{font-size:11.5px;color:rgba(255,255,255,.3);line-height:1.5;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .item-actions{display:flex;gap:6px;flex-wrap:wrap;}
        .act-btn{padding:5px 12px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;border:1px solid;}
        .btn-toggle{background:rgba(52,152,219,.08);color:#3498db;border-color:rgba(52,152,219,.2);}
        .btn-toggle:hover{background:rgba(52,152,219,.15);}
        .btn-edit{background:rgba(201,168,76,.08);color:#c9a84c;border-color:rgba(201,168,76,.2);}
        .btn-edit:hover{background:rgba(201,168,76,.15);}
        .btn-del{background:rgba(231,76,60,.08);color:#e74c3c;border-color:rgba(231,76,60,.2);}
        .btn-del:hover{background:rgba(231,76,60,.15);}
        .empty{text-align:center;padding:48px 20px;color:rgba(255,255,255,.2);font-size:13px;animation:fadeUp .6s .1s cubic-bezier(.22,1,.36,1) both;}
        .empty-icon{font-size:36px;margin-bottom:12px;opacity:.4;}
        .loading{text-align:center;padding:48px;color:rgba(201,168,76,.4);font-size:13px;}
        .spinner{width:20px;height:20px;border:2px solid rgba(201,168,76,.2);border-top-color:#c9a84c;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 12px;}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:100;display:flex;align-items:flex-end;justify-content:center;}
        .modal{width:100%;max-width:430px;background:#0d1f13;border:1px solid rgba(201,168,76,.18);border-radius:22px 22px 0 0;padding:28px 24px 40px;animation:slideUp .4s cubic-bezier(.22,1,.36,1) both;position:relative;max-height:90vh;overflow-y:auto;}
        .modal::before{content:'';position:absolute;top:0;left:15%;right:15%;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.3),transparent);}
        .modal-handle{width:36px;height:4px;background:rgba(255,255,255,.12);border-radius:2px;margin:0 auto 20px;}
        .modal-title{font-family:'Playfair Display',serif;font-size:18px;color:#e8d8a0;font-weight:700;margin-bottom:20px;}
        .field{margin-bottom:14px;}
        .field label{display:block;font-size:10.5px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:rgba(201,168,76,.6);margin-bottom:7px;}
        .field input,.field textarea,.field select{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(201,168,76,.14);border-radius:11px;padding:12px 14px;font-size:14px;color:rgba(255,255,255,.85);font-family:'Plus Jakarta Sans',sans-serif;outline:none;transition:all .2s;resize:none;}
        .field input::placeholder,.field textarea::placeholder{color:rgba(255,255,255,.18);}
        .field input:focus,.field textarea:focus,.field select:focus{border-color:rgba(201,168,76,.4);background:rgba(255,255,255,.07);box-shadow:0 0 0 3px rgba(201,168,76,.07);}
        .field select option{background:#0d1f13;color:#e8d8a0;}
        .row2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .toggle-row{display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:12px 14px;}
        .toggle-label{font-size:13px;color:rgba(255,255,255,.6);}
        .toggle{width:42px;height:24px;border-radius:12px;border:none;cursor:pointer;position:relative;transition:background .25s;flex-shrink:0;}
        .toggle.on{background:#2ecc71;}.toggle.off{background:rgba(255,255,255,.15);}
        .toggle-knob{position:absolute;top:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .25s;}
        .toggle.on .toggle-knob{left:21px;}.toggle.off .toggle-knob{left:3px;}
        .modal-actions{display:flex;gap:10px;margin-top:20px;}
        .btn-cancel{flex:1;padding:13px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:11px;color:rgba(255,255,255,.5);font-size:13px;font-weight:600;cursor:pointer;}
        .btn-save{flex:2;padding:13px;background:linear-gradient(135deg,#122b1c,#1a4a2d);border:1px solid rgba(201,168,76,.28);border-radius:11px;color:#e8d8a0;font-size:13px;font-weight:600;cursor:pointer;letter-spacing:.5px;}
        .btn-save:hover{border-color:rgba(201,168,76,.5);}
        .btn-save:disabled{opacity:.5;cursor:not-allowed;}
        .toast{position:fixed;bottom:32px;left:50%;transform:translateX(-50%);padding:10px 20px;border-radius:12px;font-size:13px;font-weight:600;z-index:200;white-space:nowrap;animation:fadeUp .3s ease both;}
        .toast-ok{background:#1a4a2d;color:#7ecf9a;border:1px solid rgba(46,204,113,.25);}
        .toast-err{background:#3d1a1a;color:#f09090;border:1px solid rgba(231,76,60,.25);}
      `}</style>

      <div className="pg-root">
        <div className="bg-base"/><div className="bg-pat"/>
        <div className="bar bar-t"/><div className="bar bar-b"/>
        <div className="page">
          <div className="ap-header">
            <button className="back-btn" onClick={() => router.push("/admin")}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="rgba(201,168,76,0.6)" strokeWidth="1.5" strokeLinecap="round"><path d="M9 11L5 7l4-4"/></svg>
            </button>
            <div className="header-text">
              <div className="header-title">Pembaruan Kajian</div>
              <div className="header-sub">{list.length} kajian tersimpan</div>
            </div>
            <button className="add-btn" onClick={openAdd}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="7" y1="2" x2="7" y2="12"/><line x1="2" y1="7" x2="12" y2="7"/></svg>
              Tambah
            </button>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"/><div>Memuat data...</div></div>
          ) : list.length === 0 ? (
            <div className="empty"><div className="empty-icon">🕌</div><div>Belum ada kajian</div></div>
          ) : (
            <div className="list">
              {list.map((item) => (
                <div key={item.id} className={`item-card ${!item.aktif ? "nonaktif" : ""}`}>
                  <div className="item-row">
                    <div className="item-judul">{item.judul}</div>
                    <span className={`item-badge ${item.aktif ? "badge-aktif" : "badge-nonaktif"}`}>{item.aktif ? "Aktif" : "Nonaktif"}</span>
                  </div>
                  <div className="item-meta">
                    <span className="meta-chip">
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="5.5" cy="5.5" r="4.5"/><path d="M5.5 3v2.5l1.5 1.5"/></svg>
                      {formatTgl(item.tanggal)} · {item.waktu}
                    </span>
                    <span className="meta-chip">
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M9 4.5c0 3.5-3.5 5.5-3.5 5.5S2 8 2 4.5a3.5 3.5 0 017 0z"/><circle cx="5.5" cy="4.5" r="1.2"/></svg>
                      {item.lokasi}
                    </span>
                  </div>
                  {item.deskripsi && <div className="item-desc">{item.deskripsi}</div>}
                  <div className="item-actions">
                    <button className="act-btn btn-toggle" onClick={() => toggleAktif(item)}>{item.aktif ? "Nonaktifkan" : "Aktifkan"}</button>
                    <button className="act-btn btn-edit" onClick={() => openEdit(item)}>Edit</button>
                    <button className="act-btn btn-del" onClick={() => handleDelete(item.id)}>Hapus</button>
                  </div>
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
            <div className="modal-title">{editItem ? "Edit Kajian" : "Tambah Kajian"}</div>
            <div className="field"><label>Judul Kajian</label><input type="text" placeholder="Contoh: Kajian Rutin Subuh" value={form.judul} onChange={(e) => setForm(f=>({...f,judul:e.target.value}))}/></div>
            <div className="field"><label>Nama Ustadz</label><input type="text" placeholder="Contoh: Ust. Abdullah" value={form.ustadz} onChange={(e) => setForm(f=>({...f,ustadz:e.target.value}))}/></div>
            <div className="row2">
              <div className="field"><label>Tanggal</label><input type="date" value={form.tanggal} onChange={(e) => setForm(f=>({...f,tanggal:e.target.value}))}/></div>
              <div className="field"><label>Waktu</label><input type="time" value={form.waktu} onChange={(e) => setForm(f=>({...f,waktu:e.target.value}))}/></div>
            </div>
            <div className="field"><label>Lokasi</label><input type="text" placeholder="Masjid Jami' Nuril Anwar" value={form.lokasi} onChange={(e) => setForm(f=>({...f,lokasi:e.target.value}))}/></div>
            <div className="field"><label>Deskripsi (opsional)</label><textarea rows={3} placeholder="Keterangan tambahan..." value={form.deskripsi} onChange={(e) => setForm(f=>({...f,deskripsi:e.target.value}))}/></div>
            <div className="field">
              <div className="toggle-row">
                <span className="toggle-label">Tampilkan ke jemaah</span>
                <button className={`toggle ${form.aktif?"on":"off"}`} onClick={() => setForm(f=>({...f,aktif:!f.aktif}))}><div className="toggle-knob"/></button>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowForm(false)}>Batal</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>{saving?"Menyimpan...":editItem?"Simpan Perubahan":"Tambah Kajian"}</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className={`toast ${toast.type==="ok"?"toast-ok":"toast-err"}`}>{toast.msg}</div>}
    </>
  );
}