"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Pembangunan = { id: number; nama_proyek: string; deskripsi: string; target_dana: number; dana_terkumpul: number; progress: number; status: "berjalan"|"selesai"|"ditunda"; aktif: boolean; tanggal_mulai: string; };

type FormState = {
  nama_proyek: string;
  deskripsi: string;
  target_dana: string;
  dana_terkumpul: string;
  progress: string;
  status: "berjalan" | "selesai" | "ditunda";
  aktif: boolean;
  tanggal_mulai: string;
};

const emptyForm: FormState = {
  nama_proyek: "",
  deskripsi: "",
  target_dana: "",
  dana_terkumpul: "",
  progress: "0",
  status: "berjalan",
  aktif: true,
  tanggal_mulai: new Date().toISOString().split("T")[0]
};

export default function AdminPembangunanPage() {
  const router = useRouter();
  const [list, setList] = useState<Pembangunan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Pembangunan|null>(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState<{msg:string;type:"ok"|"err"}|null>(null);

  useEffect(() => {
    if (!localStorage.getItem("admin-auth")) { router.replace("/admin-login"); return; }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    const { data } = await supabase.from("pembangunan").select("*").order("tanggal_mulai", { ascending: false });
    setList(data || []);
    setLoading(false);
  };

  const showToast = (msg:string,type:"ok"|"err") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (item: Pembangunan) => {
    setEditItem(item);
    setForm({
  nama_proyek: item.nama_proyek,
  deskripsi: item.deskripsi ?? "",
  target_dana: String(item.target_dana),
  dana_terkumpul: String(item.dana_terkumpul),
  progress: String(item.progress),
  status: item.status as "berjalan" | "selesai" | "ditunda",
  aktif: item.aktif,
  tanggal_mulai: item.tanggal_mulai,
});
  };

  const handleSave = async () => {
    if (!form.nama_proyek.trim()) { showToast("Nama proyek wajib diisi", "err"); return; }
    const prog = Math.min(100, Math.max(0, parseInt(form.progress)||0));
    setSaving(true);
    try {
      const payload = { nama_proyek: form.nama_proyek, deskripsi: form.deskripsi, target_dana: parseInt(form.target_dana)||0, dana_terkumpul: parseInt(form.dana_terkumpul)||0, progress: prog, status: form.status, aktif: form.aktif, tanggal_mulai: form.tanggal_mulai };
      if (editItem) {
        const { error } = await supabase.from("pembangunan").update(payload).eq("id", editItem.id);
        if (error) throw error;
        showToast("Data pembangunan diperbarui", "ok");
      } else {
        const { error } = await supabase.from("pembangunan").insert(payload);
        if (error) throw error;
        showToast("Data pembangunan ditambahkan", "ok");
      }
      setShowForm(false);
      fetchData();
    } catch { showToast("Terjadi kesalahan", "err"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id:number) => {
    if (!confirm("Hapus data ini?")) return;
    await supabase.from("pembangunan").delete().eq("id", id);
    showToast("Data dihapus", "ok");
    fetchData();
  };

  const formatRp = (n:number) => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
  const statusColor = (s:string) => s==="selesai"?"#2ecc71":s==="ditunda"?"#e74c3c":"#c9a84c";
  const statusBg = (s:string) => s==="selesai"?"rgba(46,204,113,.12)":s==="ditunda"?"rgba(231,76,60,.12)":"rgba(201,168,76,.12)";

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
        .list{display:flex;flex-direction:column;gap:12px;padding:0 20px;animation:fadeUp .6s .1s cubic-bezier(.22,1,.36,1) both;}
        .item-card{background:rgba(255,255,255,.03);border:1px solid rgba(201,168,76,.1);border-radius:16px;padding:18px;position:relative;overflow:hidden;}
        .item-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.2),transparent);}
        .item-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px;}
        .item-nama{font-size:15px;font-weight:700;color:#e8d8a0;line-height:1.3;}
        .item-status{font-size:9px;font-weight:700;padding:3px 10px;border-radius:20px;white-space:nowrap;flex-shrink:0;text-transform:uppercase;letter-spacing:.5px;}
        .item-desc{font-size:12px;color:rgba(255,255,255,.35);margin-bottom:12px;line-height:1.5;}
        .progress-section{margin-bottom:12px;}
        .progress-header{display:flex;justify-content:space-between;margin-bottom:6px;}
        .progress-label{font-size:10.5px;color:rgba(255,255,255,.3);}
        .progress-pct{font-size:13px;font-weight:700;color:#9b59b6;}
        .progress-bar-bg{height:6px;background:rgba(255,255,255,.07);border-radius:4px;overflow:hidden;}
        .progress-bar-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,#9b59b6,#c39bd3);transition:width .5s ease;}
        .dana-row{display:flex;justify-content:space-between;margin-bottom:12px;}
        .dana-item{text-align:center;}
        .dana-label{font-size:9.5px;color:rgba(255,255,255,.3);font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:3px;}
        .dana-value{font-size:12px;font-weight:700;color:#e8d8a0;}
        .item-actions{display:flex;gap:6px;}
        .act-btn{padding:5px 12px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;border:1px solid;}
        .btn-edit{background:rgba(201,168,76,.08);color:#c9a84c;border-color:rgba(201,168,76,.2);}
        .btn-edit:hover{background:rgba(201,168,76,.15);}
        .btn-del{background:rgba(231,76,60,.08);color:#e74c3c;border-color:rgba(231,76,60,.2);}
        .btn-del:hover{background:rgba(231,76,60,.15);}
        .empty{text-align:center;padding:48px 20px;color:rgba(255,255,255,.2);font-size:13px;}
        .empty-icon{font-size:36px;margin-bottom:12px;opacity:.4;}
        .loading{text-align:center;padding:48px;color:rgba(201,168,76,.4);font-size:13px;}
        .spinner{width:20px;height:20px;border:2px solid rgba(201,168,76,.2);border-top-color:#c9a84c;border-radius:50%;animation:spin .7s linear infinite;margin:0 auto 12px;}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:100;display:flex;align-items:flex-end;justify-content:center;}
        .modal{width:100%;max-width:430px;background:#0d1f13;border:1px solid rgba(201,168,76,.18);border-radius:22px 22px 0 0;padding:28px 24px 40px;animation:slideUp .4s cubic-bezier(.22,1,.36,1) both;position:relative;max-height:92vh;overflow-y:auto;}
        .modal::before{content:'';position:absolute;top:0;left:15%;right:15%;height:1px;background:linear-gradient(90deg,transparent,rgba(201,168,76,.3),transparent);}
        .modal-handle{width:36px;height:4px;background:rgba(255,255,255,.12);border-radius:2px;margin:0 auto 20px;}
        .modal-title{font-family:'Playfair Display',serif;font-size:18px;color:#e8d8a0;font-weight:700;margin-bottom:20px;}
        .field{margin-bottom:14px;}
        .field label{display:block;font-size:10.5px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:rgba(201,168,76,.6);margin-bottom:7px;}
        .field input,.field textarea,.field select{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(201,168,76,.14);border-radius:11px;padding:12px 14px;font-size:14px;color:rgba(255,255,255,.85);font-family:'Plus Jakarta Sans',sans-serif;outline:none;transition:all .2s;resize:none;}
        .field input::placeholder,.field textarea::placeholder{color:rgba(255,255,255,.18);}
        .field input:focus,.field textarea:focus,.field select:focus{border-color:rgba(201,168,76,.4);background:rgba(255,255,255,.07);}
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
              <div className="header-title">Info Pembangunan</div>
              <div className="header-sub">{list.length} proyek tercatat</div>
            </div>
            <button className="add-btn" onClick={openAdd}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="7" y1="2" x2="7" y2="12"/><line x1="2" y1="7" x2="12" y2="7"/></svg>
              Tambah
            </button>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"/><div>Memuat data...</div></div>
          ) : list.length === 0 ? (
            <div className="empty"><div className="empty-icon">🏗️</div><div>Belum ada data pembangunan</div></div>
          ) : (
            <div className="list">
              {list.map((item) => (
                <div key={item.id} className="item-card">
                  <div className="item-top">
                    <div className="item-nama">{item.nama_proyek}</div>
                    <span className="item-status" style={{background:statusBg(item.status),color:statusColor(item.status),border:`1px solid ${statusColor(item.status)}33`}}>{item.status}</span>
                  </div>
                  {item.deskripsi && <div className="item-desc">{item.deskripsi}</div>}
                  <div className="progress-section">
                    <div className="progress-header">
                      <span className="progress-label">Progress Pembangunan</span>
                      <span className="progress-pct">{item.progress}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{width:`${item.progress}%`}}/>
                    </div>
                  </div>
                  <div className="dana-row">
                    <div className="dana-item"><div className="dana-label">Target Dana</div><div className="dana-value">{formatRp(item.target_dana)}</div></div>
                    <div className="dana-item"><div className="dana-label">Terkumpul</div><div className="dana-value" style={{color:"#2ecc71"}}>{formatRp(item.dana_terkumpul)}</div></div>
                    <div className="dana-item"><div className="dana-label">Kurang</div><div className="dana-value" style={{color:"#e74c3c"}}>{formatRp(Math.max(0,item.target_dana-item.dana_terkumpul))}</div></div>
                  </div>
                  <div className="item-actions">
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
            <div className="modal-title">{editItem?"Edit Pembangunan":"Tambah Pembangunan"}</div>
            <div className="field"><label>Nama Proyek</label><input type="text" placeholder="Contoh: Pembangunan Serambi Masjid" value={form.nama_proyek} onChange={(e)=>setForm(f=>({...f,nama_proyek:e.target.value}))}/></div>
            <div className="field"><label>Deskripsi (opsional)</label><textarea rows={3} placeholder="Keterangan proyek..." value={form.deskripsi} onChange={(e)=>setForm(f=>({...f,deskripsi:e.target.value}))}/></div>
            <div className="row2">
              <div className="field"><label>Target Dana (Rp)</label><input type="number" placeholder="100000000" value={form.target_dana} onChange={(e)=>setForm(f=>({...f,target_dana:e.target.value}))}/></div>
              <div className="field"><label>Dana Terkumpul (Rp)</label><input type="number" placeholder="50000000" value={form.dana_terkumpul} onChange={(e)=>setForm(f=>({...f,dana_terkumpul:e.target.value}))}/></div>
            </div>
            <div className="row2">
              <div className="field"><label>Progress (%)</label><input type="number" min="0" max="100" placeholder="0-100" value={form.progress} onChange={(e)=>setForm(f=>({...f,progress:e.target.value}))}/></div>
              <div className="field"><label>Tanggal Mulai</label><input type="date" value={form.tanggal_mulai} onChange={(e)=>setForm(f=>({...f,tanggal_mulai:e.target.value}))}/></div>
            </div>
            <div className="field"><label>Status</label>
              <select
  value={form.status}
  onChange={(e) => {
    const val = e.target.value as "berjalan" | "selesai" | "ditunda";
    setForm(f => ({ ...f, status: val }));
  }}
>
                <option value="selesai">Selesai</option>
                <option value="ditunda">Ditunda</option>
              </select>
            </div>
            <div className="field">
              <div className="toggle-row">
                <span className="toggle-label">Tampilkan ke jemaah</span>
                <button className={`toggle ${form.aktif?"on":"off"}`} onClick={()=>setForm(f=>({...f,aktif:!f.aktif}))}><div className="toggle-knob"/></button>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={()=>setShowForm(false)}>Batal</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>{saving?"Menyimpan...":editItem?"Simpan Perubahan":"Tambah Proyek"}</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className={`toast ${toast.type==="ok"?"toast-ok":"toast-err"}`}>{toast.msg}</div>}
    </>
  );
}