import { useState, useRef } from "react";

const ROOMS = [
  "Sala de Estar","Sala de Jantar","Cozinha","Quarto Principal",
  "Quarto 2","Quarto 3","Banheiro Social","Banheiro Suíte",
  "Área de Serviço","Varanda","Garagem","Área Externa","Corredor","Escritório"
];

const ESTADOS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const INIT = {
  screen: "home",
  brokerName: "", brokerCreci: "", brokerLogo: null,
  contractNumber: "", startDate: "", locador: "", locatario: "",
  propCep: "", propRua: "", propNumero: "", propComplemento: "",
  propBairro: "", propCidade: "", propEstado: "", propType: "",
  propDate: new Date().toISOString().split("T")[0],
  vistoriadorName: "", vistoriadorDoc: "",
  rooms: {}, activeRoom: null, paid: false,
};

// ── Chave da API Google Gemini (gratuita) ─────────────────────────────────
const GEMINI_API_KEY = "AIzaSyBr50wIThe5rdHpwqr2BX6Q1MyALATVBwg";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Jost:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Jost', sans-serif; background: #EDEBE6; min-height: 100vh; }
  .wrap { max-width: 480px; margin: 0 auto; background: #F8F6F1; min-height: 100vh; display: flex; flex-direction: column; }
  .hdr { background: #16213E; padding: 18px 22px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
  .hdr-brand { font-family: 'Cormorant Garamond', serif; font-size: 20px; color: #D4A853; font-weight: 700; }
  .hdr-sub { font-size: 10px; color: #6B7A99; letter-spacing: 2px; text-transform: uppercase; margin-top: 1px; }
  .hdr-badge { background: #D4A85322; border: 1px solid #D4A85355; color: #D4A853; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
  .pg { padding: 22px; flex: 1; overflow-y: auto; }
  .ttl { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 700; color: #16213E; line-height: 1.2; }
  .sub { font-size: 13px; color: #7A7A8C; margin-top: 4px; margin-bottom: 22px; }
  .card { background: #fff; border: 1px solid #E2DDD5; border-radius: 16px; padding: 18px; margin-bottom: 14px; }
  .card-title { font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #9090A0; margin-bottom: 14px; }
  .lbl { font-size: 11px; font-weight: 600; color: #9090A0; text-transform: uppercase; letter-spacing: 1.2px; display: block; margin-bottom: 5px; }
  .inp { width: 100%; padding: 11px 14px; border: 1.5px solid #DDD9D0; border-radius: 10px; font-family: 'Jost', sans-serif; font-size: 15px; color: #16213E; background: #FAFAF8; outline: none; transition: border 0.2s; }
  .inp:focus { border-color: #D4A853; background: #fff; }
  .sel { width: 100%; padding: 11px 14px; border: 1.5px solid #DDD9D0; border-radius: 10px; font-family: 'Jost', sans-serif; font-size: 15px; color: #16213E; background: #FAFAF8; outline: none; appearance: none; }
  .ta { width: 100%; padding: 11px 14px; border: 1.5px solid #DDD9D0; border-radius: 10px; font-family: 'Jost', sans-serif; font-size: 14px; color: #16213E; background: #FAFAF8; outline: none; resize: vertical; min-height: 80px; }
  .ta:focus { border-color: #D4A853; }
  .ig { margin-bottom: 14px; }
  .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .divider { height: 1px; background: #E8E4DC; margin: 18px 0; }
  .btn { display: block; width: 100%; padding: 15px; border-radius: 12px; border: none; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 15px; font-weight: 600; transition: all 0.18s; text-align: center; }
  .btn-gold { background: linear-gradient(135deg, #D4A853, #B8883A); color: #fff; }
  .btn-gold:hover { opacity: 0.92; transform: translateY(-1px); }
  .btn-gold:disabled { opacity: 0.45; transform: none; cursor: not-allowed; }
  .btn-dark { background: #16213E; color: #D4A853; border: none; cursor: pointer; font-family: 'Jost', sans-serif; font-weight: 600; border-radius: 12px; }
  .btn-ghost { background: transparent; border: 1.5px solid #DDD9D0; color: #16213E; }
  .btn-sm { width: auto; padding: 9px 16px; font-size: 13px; display: inline-block; }
  .btn-clr { background: #FFF0EE; border: 1.5px solid #F5C6C0; color: #C0392B; border-radius: 8px; padding: 7px 14px; font-size: 13px; font-family: 'Jost', sans-serif; cursor: pointer; }
  .btn-cep { background: #16213E; color: #D4A853; border: none; border-radius: 10px; padding: 11px 18px; font-family: 'Jost', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
  .btn-cep:disabled { opacity: 0.5; cursor: not-allowed; }
  .gap { height: 10px; }
  .back { display: flex; align-items: center; gap: 6px; background: none; border: none; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 13px; color: #9090A0; margin-bottom: 18px; padding: 0; }
  .hero { background: linear-gradient(145deg, #16213E 0%, #0F3460 100%); border-radius: 20px; padding: 28px 22px; margin-bottom: 20px; position: relative; overflow: hidden; }
  .hero::after { content:''; position:absolute; top:-50px; right:-50px; width:180px; height:180px; border-radius:50%; background:#D4A85312; }
  .hero-tag { display: inline-block; background: #D4A85325; color: #D4A853; border: 1px solid #D4A85340; border-radius: 20px; padding: 3px 12px; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 14px; }
  .hero-ttl { font-family: 'Cormorant Garamond', serif; font-size: 30px; font-weight: 700; color: #fff; line-height: 1.2; }
  .hero-ttl span { color: #D4A853; }
  .hero-p { font-size: 13px; color: #8090B0; margin-top: 10px; line-height: 1.6; }
  .steps { display: flex; gap: 4px; margin-bottom: 22px; }
  .step-dot { flex: 1; height: 3px; border-radius: 3px; background: #E2DDD5; }
  .step-dot.on { background: #D4A853; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
  .stat { background: #fff; border: 1px solid #E2DDD5; border-radius: 14px; padding: 14px 10px; text-align: center; }
  .stat-n { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 700; color: #D4A853; }
  .stat-l { font-size: 11px; color: #9090A0; margin-top: 2px; }
  .plan-row { display: flex; align-items: center; gap: 14px; }
  .plan-icon { width: 50px; height: 50px; background: #D4A85318; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
  .plan-price { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 700; color: #D4A853; white-space: nowrap; }
  .pix-box { background: #F0F9F4; border: 2px solid #A8D5B544; border-radius: 14px; padding: 20px; text-align: center; margin: 16px 0; }
  .pix-key { font-family: monospace; font-size: 13px; background: #16213E; color: #D4A853; padding: 10px 14px; border-radius: 8px; margin: 10px 0; word-break: break-all; }
  .file-upload-label { display: block; cursor: pointer; }
  .file-upload-label input[type=file] { display: none; }
  .logo-box { border: 2px dashed #DDD9D0; border-radius: 12px; padding: 22px 16px; text-align: center; background: #FAFAF8; transition: all 0.2s; }
  .logo-box:hover { border-color: #D4A853; background: #FDF9F2; }
  .logo-preview { width: 80px; height: 80px; object-fit: contain; border-radius: 10px; display: block; margin: 0 auto 10px; border: 1px solid #E2DDD5; background: #fff; padding: 4px; }
  .upload-cta { display: inline-block; margin-top: 10px; background: #16213E; color: #D4A853; border-radius: 8px; padding: 9px 20px; font-family: 'Jost', sans-serif; font-size: 13px; font-weight: 600; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 18px; }
  .chip { padding: 7px 13px; border-radius: 20px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1.5px solid #DDD9D0; background: #fff; color: #16213E; transition: all 0.15s; user-select: none; }
  .chip:hover { border-color: #D4A853; }
  .chip.active { background: #16213E; color: #fff; border-color: #16213E; }
  .chip.has { border-color: #7CB98A; color: #2E7D45; background: #F0FAF3; }
  .chip.active.has { background: #2E7D45; border-color: #2E7D45; color: #fff; }

  /* BOTÕES DE FOTO */
  .photo-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
  .photo-btn-label { display: block; cursor: pointer; }
  .photo-btn-label input[type=file] { display: none; }
  .photo-btn { border-radius: 12px; padding: 16px 10px; text-align: center; border: 2px solid transparent; transition: all 0.2s; }
  .photo-btn-cam { background: linear-gradient(135deg, #16213E, #0F3460); color: #fff; }
  .photo-btn-cam:hover { opacity: 0.9; }
  .photo-btn-gal { background: #FDF9F2; border: 2px dashed #D4A85366; color: #B8883A; }
  .photo-btn-gal:hover { background: #FAF3E4; }
  .photo-btn-icon { font-size: 28px; display: block; margin-bottom: 6px; }
  .photo-btn-txt { font-size: 13px; font-weight: 600; display: block; }
  .photo-btn-sub { font-size: 11px; opacity: 0.75; margin-top: 2px; display: block; }

  .photo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
  .photo-item { border-radius: 12px; overflow: hidden; border: 1.5px solid #E2DDD5; background: #fff; }
  .photo-item img { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; }
  .photo-cap { padding: 7px 8px; }
  .photo-wrap { position: relative; }
  .photo-del { position: absolute; top: 5px; right: 5px; background: #00000088; color: #fff; border: none; border-radius: 50%; width: 26px; height: 26px; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; }

  /* IA BADGE */
  .ai-badge { display: inline-flex; align-items: center; gap: 5px; background: #F0F0FF; border: 1px solid #C0C0FF; color: #5050CC; border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; margin-bottom: 8px; }
  .ai-loading { background: #FDF9F2; border: 1.5px solid #D4A85344; border-radius: 10px; padding: 12px; margin-top: 8px; display: flex; align-items: center; gap: 10px; }
  .ai-result { background: #F0FAF3; border: 1.5px solid #7CB98A55; border-radius: 10px; padding: 12px; margin-top: 8px; font-size: 13px; color: #2A5A3A; line-height: 1.6; }
  .ai-result-title { font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #2E7D45; margin-bottom: 6px; display: flex; align-items: center; gap: 5px; }
  .spinner { width: 18px; height: 18px; border: 2px solid #D4A85344; border-top-color: #D4A853; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .sig-wrap { border: 1.5px solid #DDD9D0; border-radius: 12px; overflow: hidden; background: #FAFAF8; touch-action: none; cursor: crosshair; }
  .sig-wrap canvas { display: block; width: 100%; height: 130px; }
  .rpt-header { background: #16213E; border-radius: 18px; padding: 22px; margin-bottom: 22px; color: #fff; }
  .rpt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 14px; }
  .rpt-field strong { display: block; font-size: 10px; color: #D4A853; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 2px; }
  .rpt-field span { font-size: 13px; color: #C0CFDF; }
  .rpt-room { margin-bottom: 22px; }
  .rpt-room-ttl { font-family: 'Cormorant Garamond', serif; font-size: 19px; font-weight: 700; color: #16213E; padding-bottom: 8px; border-bottom: 2px solid #D4A85333; margin-bottom: 10px; }
  .rpt-room-desc { font-size: 13px; color: #7A7A8C; font-style: italic; margin-bottom: 10px; }
  .rpt-ai-desc { font-size: 12px; color: #2A5A3A; background: #F0FAF3; border-left: 3px solid #7CB98A; padding: 8px 12px; border-radius: 0 8px 8px 0; margin-bottom: 10px; }
  .success-wrap { text-align: center; padding: 30px 0 20px; }
  .cep-row { display: flex; gap: 8px; }
  .cep-row .inp { flex: 1; }
  .cep-msg { font-size: 12px; margin-top: 6px; padding: 6px 10px; border-radius: 8px; }
  .cep-ok { color: #2E7D45; background: #F0FAF3; }
  .cep-err { color: #C0392B; background: #FFF0EE; }
  @media print {
    .no-print { display: none !important; }
    .wrap { max-width: 100%; }
    .pg { padding: 8px; }
    body { background: #fff; }
  }
`;

export default function App() {
  const [s, setS] = useState(INIT);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepMsg, setCepMsg] = useState({ text: "", type: "" });
  const [analyzingId, setAnalyzingId] = useState(null);
  const sigRef = useRef(null);
  const sigDrawing = useRef(false);
  const up = (patch) => setS(prev => ({ ...prev, ...patch }));

  // ── Comprimir imagem antes de salvar ────────────────────────────────────
  const compressImage = (file, maxW, quality, cb) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        cb(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const onLogoChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    compressImage(file, 400, 0.85, (src) => up({ brokerLogo: src }));
  };

  // ── Adicionar fotos (com compressão) ────────────────────────────────────
  const addPhotos = (e) => {
    const files = Array.from(e.target.files || []);
    const room = s.activeRoom;
    if (!room || files.length === 0) return;
    files.forEach(file => {
      // Comprime para max 1200px e qualidade 75% — reduz 90% do tamanho
      compressImage(file, 1200, 0.75, (src) => {
        const newPhoto = { id: Date.now() + Math.random(), src, caption: "", aiDesc: "" };
        setS(prev => {
          const existing = prev.rooms[room] || { photos: [], desc: "" };
          return {
            ...prev,
            rooms: { ...prev.rooms, [room]: { ...existing, photos: [...existing.photos, newPhoto] } }
          };
        });
        analyzePhoto(newPhoto.id, src, room);
      });
    });
    e.target.value = "";
  };

  // ── IA: analisar foto ────────────────────────────────────────────────────
  const analyzePhoto = async (photoId, src, room) => {
    if (!GEMINI_API_KEY) return;
    setAnalyzingId(photoId);
    try {
      const base64 = src.split(",")[1];
      const mediaType = src.split(";")[0].split(":")[1];
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inline_data: { mime_type: mediaType, data: base64 } },
                { text: `Você é um vistoriador de imóveis profissional. Analise esta foto do cômodo "${room}" e descreva em 2-3 frases curtas: o estado geral, acabamentos, e qualquer problema visível. Seja objetivo e técnico. Responda apenas a descrição, sem introdução.` }
              ]
            }]
          })
        }
      );
      const data = await response.json();
      const desc = (data.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
      if (desc) {
        setS(prev => {
          const roomData = prev.rooms[room];
          if (!roomData) return prev;
          return {
            ...prev,
            rooms: {
              ...prev.rooms,
              [room]: {
                ...roomData,
                photos: roomData.photos.map(p => p.id === photoId ? { ...p, aiDesc: desc } : p)
              }
            }
          };
        });
      }
    } catch (err) { console.error("Erro IA:", err); }
    setAnalyzingId(null);
  };

  const removePhoto = (room, id) => setS(prev => ({
    ...prev,
    rooms: { ...prev.rooms, [room]: { ...prev.rooms[room], photos: prev.rooms[room].photos.filter(p => p.id !== id) } }
  }));

  const updateCaption = (room, id, caption) => setS(prev => ({
    ...prev,
    rooms: { ...prev.rooms, [room]: { ...prev.rooms[room], photos: prev.rooms[room].photos.map(p => p.id === id ? { ...p, caption } : p) } }
  }));

  const updateAiDesc = (room, id, aiDesc) => setS(prev => ({
    ...prev,
    rooms: { ...prev.rooms, [room]: { ...prev.rooms[room], photos: prev.rooms[room].photos.map(p => p.id === id ? { ...p, aiDesc } : p) } }
  }));

  const updateDesc = (room, desc) => setS(prev => ({
    ...prev,
    rooms: { ...prev.rooms, [room]: { ...(prev.rooms[room] || { photos: [] }), desc } }
  }));

  const selectRoom = (room) => setS(prev => ({
    ...prev, activeRoom: room,
    rooms: prev.rooms[room] ? prev.rooms : { ...prev.rooms, [room]: { photos: [], desc: "" } }
  }));

  // ── CEP ──────────────────────────────────────────────────────────────────
  const buscarCep = async () => {
    const cep = s.propCep.replace(/\D/g, "");
    if (cep.length !== 8) { setCepMsg({ text: "CEP deve ter 8 dígitos", type: "err" }); return; }
    setCepLoading(true); setCepMsg({ text: "Buscando...", type: "" });
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) { setCepMsg({ text: "CEP não encontrado", type: "err" }); }
      else {
        up({ propRua: data.logradouro || "", propBairro: data.bairro || "", propCidade: data.localidade || "", propEstado: data.uf || "" });
        setCepMsg({ text: "✅ Endereço preenchido!", type: "ok" });
      }
    } catch { setCepMsg({ text: "Erro ao buscar. Preencha manualmente.", type: "err" }); }
    setCepLoading(false);
  };

  // ── Assinatura ───────────────────────────────────────────────────────────
  const getXY = (e) => {
    const c = sigRef.current;
    const rect = c.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return [(src.clientX - rect.left) * (c.width / rect.width), (src.clientY - rect.top) * (c.height / rect.height)];
  };
  const sigStart = (e) => { sigDrawing.current = true; const [x,y] = getXY(e); const ctx = sigRef.current.getContext("2d"); ctx.beginPath(); ctx.moveTo(x,y); };
  const sigMove = (e) => {
    if (!sigDrawing.current) return; e.preventDefault();
    const [x,y] = getXY(e); const ctx = sigRef.current.getContext("2d");
    ctx.strokeStyle="#16213E"; ctx.lineWidth=2.5; ctx.lineCap="round"; ctx.lineJoin="round";
    ctx.lineTo(x,y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x,y);
  };
  const sigEnd = () => { sigDrawing.current = false; };
  const clearSig = () => { const c = sigRef.current; if(c) c.getContext("2d").clearRect(0,0,c.width,c.height); };

  const totalPhotos = Object.values(s.rooms).reduce((a, r) => a + r.photos.length, 0);
  const activeRoomData = s.activeRoom ? (s.rooms[s.activeRoom] || { photos: [], desc: "" }) : null;
  const fullAddress = [s.propRua, s.propNumero, s.propComplemento, s.propBairro, s.propCidade, s.propEstado, s.propCep ? `CEP ${s.propCep}` : ""].filter(Boolean).join(", ");

  const Header = ({ sub }) => (
    <div className="hdr">
      <div><div className="hdr-brand">VistoriaApp</div><div className="hdr-sub">{sub}</div></div>
      {s.paid && <div className="hdr-badge">✓ Ativo</div>}
    </div>
  );
  const Steps = ({ active }) => (
    <div className="steps">{[0,1,2].map(i => <div key={i} className={`step-dot${i<=active?" on":""}`}/>)}</div>
  );

  return (
    <div className="wrap">
      <style>{css}</style>

      {/* ══ HOME ══ */}
      {s.screen === "home" && <>
        <Header sub="Para Corretores"/>
        <div className="pg">
          <div className="hero">
            <div className="hero-tag">🏠 Imóveis</div>
            <div className="hero-ttl">Vistoria <span>Fotográfica</span><br/>Profissional</div>
            <div className="hero-p">Fotografe, organize por cômodo e gere laudos PDF com análise de IA.</div>
          </div>
          <div className="stats">
            <div className="stat"><div className="stat-n">PDF</div><div className="stat-l">Relatório</div></div>
            <div className="stat"><div className="stat-n">🤖</div><div className="stat-l">IA</div></div>
            <div className="stat"><div className="stat-n">5'</div><div className="stat-l">Rápido</div></div>
          </div>
          <div className="card" style={{marginBottom:20}}>
            <div style={{fontSize:13,color:'#7A7A8C',lineHeight:2}}>
              ✅ Câmera direta ou galeria<br/>
              ✅ IA analisa o estado de cada ambiente<br/>
              ✅ Dados completos do contrato<br/>
              ✅ Busca automática pelo CEP<br/>
              ✅ Logo e assinatura digital<br/>
              ✅ Laudo PDF profissional — R$ 12,00
            </div>
          </div>
          <button className="btn btn-gold" onClick={() => up({ screen: "step1" })}>Iniciar Nova Vistoria →</button>
          {s.paid && <><div className="gap"/><button className="btn btn-ghost" onClick={() => up({ screen: "vistoria" })}>Continuar Vistoria</button></>}
        </div>
      </>}

      {/* ══ STEP 1 ══ */}
      {s.screen === "step1" && <>
        <Header sub="Plano"/>
        <div className="pg">
          <button className="back" onClick={() => up({ screen: "home" })}>← Voltar</button>
          <Steps active={0}/>
          <div className="ttl">Vistoria Avulsa</div>
          <div className="sub">R$ 12,00 por vistoria completa</div>
          <div className="card">
            <div className="plan-row">
              <div className="plan-icon">📋</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:15}}>Vistoria Avulsa</div>
                <div style={{fontSize:12,color:'#9090A0',marginTop:2}}>Laudo PDF + análise de IA por ambiente</div>
              </div>
              <div className="plan-price">R$ 12,00</div>
            </div>
          </div>
          <div className="card">
            <div style={{fontSize:13,color:'#7A7A8C',lineHeight:1.9}}>
              ✅ Câmera + galeria<br/>
              ✅ IA descreve o estado do imóvel<br/>
              ✅ Dados completos do contrato<br/>
              ✅ Logo e assinatura digital<br/>
              ✅ Relatório PDF profissional
            </div>
          </div>
          <div className="gap"/>
          <button className="btn btn-gold" onClick={() => up({ screen: "step2" })}>Próximo: Meus Dados →</button>
        </div>
      </>}

      {/* ══ STEP 2 ══ */}
      {s.screen === "step2" && <>
        <Header sub="Seus Dados"/>
        <div className="pg">
          <button className="back" onClick={() => up({ screen: "step1" })}>← Voltar</button>
          <Steps active={1}/>
          <div className="ttl">Seus Dados</div>
          <div className="sub">Aparecem no cabeçalho do relatório</div>
          <div className="card">
            <div className="ig">
              <label className="lbl">Logo da Imobiliária (opcional)</label>
              <label className="file-upload-label">
                <input type="file" accept="image/*" onChange={onLogoChange}/>
                <div className="logo-box">
                  {s.brokerLogo ? <img src={s.brokerLogo} className="logo-preview" alt="logo"/> : <div style={{fontSize:44,marginBottom:6}}>🏢</div>}
                  <div style={{fontSize:13,color:'#9090A0'}}>{s.brokerLogo ? "✅ Logo carregada!" : "Toque aqui para escolher o logo"}</div>
                  <div className="upload-cta">{s.brokerLogo ? "🔄 Trocar" : "📁 Escolher arquivo"}</div>
                </div>
              </label>
            </div>
            <div className="ig">
              <label className="lbl">Nome / Imobiliária</label>
              <input className="inp" value={s.brokerName} onChange={e => up({ brokerName: e.target.value })} placeholder="Ex: João Silva Imóveis"/>
            </div>
            <div className="ig" style={{marginBottom:0}}>
              <label className="lbl">CRECI</label>
              <input className="inp" value={s.brokerCreci} onChange={e => up({ brokerCreci: e.target.value })} placeholder="Ex: 12345-F"/>
            </div>
          </div>
          <button className="btn btn-gold" onClick={() => up({ screen: "step3" })}>Próximo: Pagamento →</button>
        </div>
      </>}

      {/* ══ STEP 3 ══ */}
      {s.screen === "step3" && <>
        <Header sub="Pagamento"/>
        <div className="pg">
          <button className="back" onClick={() => up({ screen: "step2" })}>← Voltar</button>
          <Steps active={2}/>
          <div className="ttl">Confirmar Pagamento</div>
          <div className="sub">Pague via PIX para liberar a vistoria</div>
          <div className="card">
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span style={{color:'#7A7A8C',fontSize:14}}>Plano</span><strong>Vistoria Avulsa</strong>
            </div>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <span style={{color:'#7A7A8C',fontSize:14}}>Total</span>
              <strong style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:'#D4A853'}}>R$ 12,00</strong>
            </div>
          </div>
          <div className="pix-box">
            <div style={{fontSize:32,marginBottom:8}}>📱</div>
            <div style={{fontWeight:600,marginBottom:4}}>PIX — Chave CNPJ</div>
            <div className="pix-key">12.345.678/0001-99</div>
            <div style={{fontSize:12,color:'#7A7A8C'}}>Após pagar, toque em "Confirmar"</div>
          </div>
          <button className="btn btn-gold" onClick={() => up({ screen: "pago", paid: true })}>✅ Confirmar Pagamento</button>
        </div>
      </>}

      {/* ══ PAGO ══ */}
      {s.screen === "pago" && <>
        <Header sub="Confirmado"/>
        <div className="pg">
          <div className="success-wrap">
            <div style={{fontSize:72,marginBottom:16}}>🎉</div>
            <div className="ttl" style={{textAlign:'center'}}>Pagamento Confirmado!</div>
            <div className="sub" style={{textAlign:'center'}}>Sua vistoria está liberada</div>
          </div>
          <button className="btn btn-gold" onClick={() => up({ screen: "vistoria" })}>Iniciar Vistoria →</button>
        </div>
      </>}

      {/* ══ VISTORIA ══ */}
      {s.screen === "vistoria" && <>
        <Header sub="Vistoria"/>
        <div className="pg">
          <button className="back" onClick={() => up({ screen: "home" })}>← Início</button>
          <div className="ttl">Vistoria em Andamento</div>
          <div className="sub">Preencha os dados e fotografe cada cômodo</div>

          {/* CONTRATO */}
          <div className="card">
            <div className="card-title">📋 Dados do Contrato</div>
            <div className="row2">
              <div className="ig">
                <label className="lbl">Nº Contrato</label>
                <input className="inp" value={s.contractNumber} onChange={e => up({ contractNumber: e.target.value })} placeholder="Ex: 2024-001"/>
              </div>
              <div className="ig">
                <label className="lbl">Início do Contrato</label>
                <input className="inp" type="date" value={s.startDate} onChange={e => up({ startDate: e.target.value })}/>
              </div>
            </div>
            <div className="ig">
              <label className="lbl">Locador (Proprietário)</label>
              <input className="inp" value={s.locador} onChange={e => up({ locador: e.target.value })} placeholder="Nome completo do proprietário"/>
            </div>
            <div className="ig">
              <label className="lbl">Locatário (Inquilino)</label>
              <input className="inp" value={s.locatario} onChange={e => up({ locatario: e.target.value })} placeholder="Nome completo do inquilino"/>
            </div>
            <div className="ig">
              <label className="lbl">Vistoriador — Nome</label>
              <input className="inp" value={s.vistoriadorName} onChange={e => up({ vistoriadorName: e.target.value })} placeholder="Nome completo do vistoriador"/>
            </div>
            <div className="ig" style={{marginBottom:0}}>
              <label className="lbl">Vistoriador — CPF / CRECI</label>
              <input className="inp" value={s.vistoriadorDoc} onChange={e => up({ vistoriadorDoc: e.target.value })} placeholder="CPF ou CRECI do vistoriador"/>
            </div>
          </div>

          {/* ENDEREÇO */}
          <div className="card">
            <div className="card-title">🏠 Endereço do Imóvel</div>
            <div className="ig">
              <label className="lbl">CEP</label>
              <div className="cep-row">
                <input className="inp" value={s.propCep} maxLength={9}
                  onChange={e => { up({ propCep: e.target.value }); setCepMsg({ text:"", type:"" }); }}
                  placeholder="00000-000" onKeyDown={e => e.key==="Enter" && buscarCep()}/>
                <button className="btn-cep" disabled={cepLoading} onClick={buscarCep}>{cepLoading ? "..." : "Buscar"}</button>
              </div>
              {cepMsg.text && <div className={`cep-msg cep-${cepMsg.type||"ok"}`}>{cepMsg.text}</div>}
            </div>
            <div className="ig">
              <label className="lbl">Rua / Logradouro</label>
              <input className="inp" value={s.propRua} onChange={e => up({ propRua: e.target.value })} placeholder="Nome da rua"/>
            </div>
            <div className="row2">
              <div className="ig">
                <label className="lbl">Número</label>
                <input className="inp" value={s.propNumero} onChange={e => up({ propNumero: e.target.value })} placeholder="Nº"/>
              </div>
              <div className="ig">
                <label className="lbl">Complemento</label>
                <input className="inp" value={s.propComplemento} onChange={e => up({ propComplemento: e.target.value })} placeholder="Apto, Sala..."/>
              </div>
            </div>
            <div className="ig">
              <label className="lbl">Bairro</label>
              <input className="inp" value={s.propBairro} onChange={e => up({ propBairro: e.target.value })} placeholder="Bairro"/>
            </div>
            <div className="row2">
              <div className="ig">
                <label className="lbl">Cidade</label>
                <input className="inp" value={s.propCidade} onChange={e => up({ propCidade: e.target.value })} placeholder="Cidade"/>
              </div>
              <div className="ig">
                <label className="lbl">Estado</label>
                <select className="sel" value={s.propEstado} onChange={e => up({ propEstado: e.target.value })}>
                  <option value="">UF</option>
                  {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
            </div>
            <div className="row2">
              <div className="ig">
                <label className="lbl">Tipo de Imóvel</label>
                <select className="sel" value={s.propType} onChange={e => up({ propType: e.target.value })}>
                  <option value="">Selecione</option>
                  <option>Apartamento</option><option>Casa</option><option>Cobertura</option>
                  <option>Sala Comercial</option><option>Galpão</option><option>Terreno</option>
                </select>
              </div>
              <div className="ig">
                <label className="lbl">Data da Vistoria</label>
                <input className="inp" type="date" value={s.propDate} onChange={e => up({ propDate: e.target.value })}/>
              </div>
            </div>
          </div>

          {/* CÔMODOS */}
          <div style={{fontWeight:600,fontSize:14,marginBottom:10,color:'#16213E'}}>Selecione um Cômodo</div>
          <div className="chips">
            {ROOMS.map(r => {
              const has = (s.rooms[r]?.photos?.length || 0) > 0;
              const active = s.activeRoom === r;
              return (
                <span key={r} className={`chip${active?" active":""}${has?" has":""}`} onClick={() => selectRoom(r)}>
                  {has?"✓ ":""}{r}{has?` (${s.rooms[r].photos.length})`:""}
                </span>
              );
            })}
          </div>

          {/* CÔMODO ATIVO */}
          {s.activeRoom && activeRoomData && (
            <div className="card">
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:'#16213E',marginBottom:4}}>
                📍 {s.activeRoom}
              </div>
              {GEMINI_API_KEY && (
                <div className="ai-badge">🤖 IA ativa — análise automática das fotos</div>
              )}
              <div className="ig" style={{marginTop:10}}>
                <label className="lbl">Descrição / Observações</label>
                <textarea className="ta" value={activeRoomData.desc}
                  onChange={e => updateDesc(s.activeRoom, e.target.value)}
                  placeholder="Estado geral, itens presentes, defeitos..."/>
              </div>

              {/* BOTÕES DE CÂMERA E GALERIA */}
              <div className="photo-actions">
                <label className="photo-btn-label">
                  <input type="file" accept="image/*" capture="environment" onChange={addPhotos}/>
                  <div className="photo-btn photo-btn-cam">
                    <span className="photo-btn-icon">📷</span>
                    <span className="photo-btn-txt">Tirar Foto</span>
                    <span className="photo-btn-sub">Abrir câmera</span>
                  </div>
                </label>
                <label className="photo-btn-label">
                  <input type="file" accept="image/*" multiple onChange={addPhotos}/>
                  <div className="photo-btn photo-btn-gal">
                    <span className="photo-btn-icon">🖼️</span>
                    <span className="photo-btn-txt">Galeria</span>
                    <span className="photo-btn-sub">Escolher fotos</span>
                  </div>
                </label>
              </div>

              {/* FOTOS */}
              {activeRoomData.photos.length > 0 && (
                <div className="photo-grid">
                  {activeRoomData.photos.map(photo => (
                    <div key={photo.id} className="photo-item">
                      <div className="photo-wrap">
                        <img src={photo.src} alt=""/>
                        <button className="photo-del" onClick={() => removePhoto(s.activeRoom, photo.id)}>✕</button>
                      </div>
                      <div className="photo-cap">
                        {analyzingId === photo.id && (
                          <div className="ai-loading">
                            <div className="spinner"/>
                            <span style={{fontSize:12,color:'#B8883A'}}>IA analisando a foto...</span>
                          </div>
                        )}
                        {photo.aiDesc && analyzingId !== photo.id && (
                          <div style={{marginBottom:6}}>
                            <div className="ai-result-title" style={{padding:'4px 0 2px'}}>🤖 Descrição da IA (editável)</div>
                            <textarea
                              className="ta"
                              style={{fontSize:12,minHeight:70,padding:'7px 10px'}}
                              value={photo.aiDesc}
                              onChange={e => updateAiDesc(s.activeRoom, photo.id, e.target.value)}
                            />
                          </div>
                        )}
                        {!photo.aiDesc && analyzingId !== photo.id && (
                          <input className="inp" style={{fontSize:12,padding:'6px 10px',marginTop:6}}
                            value={photo.caption}
                            onChange={e => updateCaption(s.activeRoom, photo.id, e.target.value)}
                            placeholder="Adicionar legenda..."/>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="divider"/>
          <div className="stats" style={{marginBottom:16}}>
            <div className="stat"><div className="stat-n">{Object.keys(s.rooms).length}</div><div className="stat-l">Cômodos</div></div>
            <div className="stat"><div className="stat-n">{totalPhotos}</div><div className="stat-l">Fotos</div></div>
            <div className="stat"><div className="stat-n">✓</div><div className="stat-l">Ativo</div></div>
          </div>
          <button className="btn btn-gold" disabled={totalPhotos===0} style={{opacity:totalPhotos===0?0.5:1}}
            onClick={() => up({ screen: "relatorio" })}>
            📄 Gerar Relatório PDF
          </button>
          {totalPhotos===0 && <div style={{textAlign:'center',fontSize:12,color:'#9090A0',marginTop:8}}>Adicione fotos para gerar o relatório</div>}
          <div style={{height:24}}/>
        </div>
      </>}

      {/* ══ RELATÓRIO ══ */}
      {s.screen === "relatorio" && <>
        <div className="hdr no-print"><div><div className="hdr-brand">VistoriaApp</div><div className="hdr-sub">Relatório</div></div></div>
        <div className="pg">
          <div style={{display:'flex',gap:10,marginBottom:20}} className="no-print">
            <button className="btn btn-ghost btn-sm" onClick={() => up({ screen: "vistoria" })}>← Editar</button>
            <button className="btn btn-dark" style={{flex:1,padding:'12px'}} onClick={() => window.print()}>🖨️ Salvar como PDF</button>
          </div>

          <div className="rpt-header">
            <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
              {s.brokerLogo && <img src={s.brokerLogo} style={{width:56,height:56,borderRadius:10,objectFit:'contain',background:'#fff',padding:4}} alt="logo"/>}
              <div>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:21,fontWeight:700,color:'#D4A853'}}>{s.brokerName||"Corretor"}</div>
                {s.brokerCreci && <div style={{fontSize:12,color:'#6B7A99'}}>CRECI: {s.brokerCreci}</div>}
              </div>
            </div>
            <div style={{height:1,background:'#D4A85330',marginBottom:14}}/>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:700,marginBottom:12}}>Laudo de Vistoria</div>
            <div className="rpt-grid">
              {s.contractNumber && <div className="rpt-field"><strong>Nº Contrato</strong><span>{s.contractNumber}</span></div>}
              {s.startDate && <div className="rpt-field"><strong>Início Contrato</strong><span>{new Date(s.startDate+"T12:00:00").toLocaleDateString("pt-BR")}</span></div>}
              {s.locador && <div className="rpt-field"><strong>Locador</strong><span>{s.locador}</span></div>}
              {s.locatario && <div className="rpt-field"><strong>Locatário</strong><span>{s.locatario}</span></div>}
              {s.propType && <div className="rpt-field"><strong>Tipo</strong><span>{s.propType}</span></div>}
              <div className="rpt-field"><strong>Data Vistoria</strong><span>{new Date(s.propDate+"T12:00:00").toLocaleDateString("pt-BR")}</span></div>
            </div>
            {fullAddress && (
              <div style={{marginTop:14,padding:'10px 14px',background:'#ffffff18',borderRadius:10,fontSize:13,color:'#C0CFDF'}}>
                📍 {fullAddress}
              </div>
            )}
          </div>

          {Object.entries(s.rooms).map(([room, data]) =>
            data.photos.length > 0 && (
              <div key={room} className="rpt-room">
                <div className="rpt-room-ttl">🚪 {room}</div>
                {data.desc && <div className="rpt-room-desc">{data.desc}</div>}
                <div className="photo-grid">
                  {data.photos.map(photo => (
                    <div key={photo.id} className="photo-item">
                      <img src={photo.src} alt={photo.caption||room}/>
                      {photo.aiDesc && (
                        <div className="rpt-ai-desc">🤖 {photo.aiDesc}</div>
                      )}
                      {photo.caption && <div style={{padding:'6px 8px',fontSize:12,color:'#7A7A8C',background:'#F8F6F1'}}>{photo.caption}</div>}
                    </div>
                  ))}
                </div>
                <div className="divider"/>
              </div>
            )
          )}

          <div className="card">
            <div style={{fontWeight:700,fontSize:16,marginBottom:4,fontFamily:"'Cormorant Garamond',serif",color:'#16213E'}}>Assinaturas</div>
            <div style={{fontSize:12,color:'#9090A0',marginBottom:20}}>Campos para assinatura das partes envolvidas</div>

            {/* Locador */}
            <div style={{marginBottom:24}}>
              <div style={{fontSize:11,fontWeight:600,color:'#9090A0',textTransform:'uppercase',letterSpacing:'1px',marginBottom:6}}>Locador (Proprietário)</div>
              <div style={{borderTop:'1.5px solid #16213E',marginBottom:6}}/>
              <div style={{textAlign:'center',fontSize:13,color:'#7A7A8C'}}>
                <strong>{s.locador || "________________________________"}</strong><br/>
                <span style={{fontSize:11}}>Assinatura / Data: ___/___/______</span>
              </div>
            </div>

            {/* Locatário */}
            <div style={{marginBottom:24}}>
              <div style={{fontSize:11,fontWeight:600,color:'#9090A0',textTransform:'uppercase',letterSpacing:'1px',marginBottom:6}}>Locatário (Inquilino)</div>
              <div style={{borderTop:'1.5px solid #16213E',marginBottom:6}}/>
              <div style={{textAlign:'center',fontSize:13,color:'#7A7A8C'}}>
                <strong>{s.locatario || "________________________________"}</strong><br/>
                <span style={{fontSize:11}}>Assinatura / Data: ___/___/______</span>
              </div>
            </div>

            {/* Vistoriador */}
            <div style={{marginBottom:8}}>
              <div style={{fontSize:11,fontWeight:600,color:'#9090A0',textTransform:'uppercase',letterSpacing:'1px',marginBottom:6}}>Vistoriador</div>
              <div style={{borderTop:'1.5px solid #16213E',marginBottom:6}}/>
              <div style={{textAlign:'center',fontSize:13,color:'#7A7A8C'}}>
                <strong>{s.vistoriadorName || "________________________________"}</strong><br/>
                {s.vistoriadorDoc && <span style={{fontSize:11}}>CPF/CRECI: {s.vistoriadorDoc}<br/></span>}
                <span style={{fontSize:11}}>Assinatura / Data: ___/___/______</span>
              </div>
            </div>
          </div>

          <div style={{textAlign:'center',fontSize:11,color:'#B0A090',padding:'14px 0'}}>
            Documento gerado por VistoriaApp • {new Date().toLocaleDateString("pt-BR")}
          </div>
          <button className="btn btn-dark no-print" style={{padding:'15px'}} onClick={() => window.print()}>🖨️ Salvar como PDF</button>
          <div className="gap"/>
          <button className="btn btn-ghost no-print" onClick={() => { setS(INIT); setCepMsg({text:"",type:""}); }}>Nova Vistoria</button>
          <div style={{height:24}}/>
        </div>
      </>}
    </div>
  );
}
