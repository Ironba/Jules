import { useState, useEffect } from "react";

const JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function formatDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00");
  return `${JOURS[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`;
}

function getTodayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

const EMPTY_FORM = {
  date: getTodayISO(),
  moniteur: "",
  duree: "1",
  note: "",
  acquis: [],
  zones: "",
  conseils: "",
  humeur: "",
};

const ACQUIS_OPTIONS = [
  "Démarrage / arrêt", "Changement de vitesses", "Freinages", "Créneaux",
  "Demi-tour", "Priorités", "Rond-point", "Voie rapide / autoroute",
  "Croisements étroits", "Stationnement", "Manœuvres", "Conduite de nuit",
];

const HUMEURS = [
  { emoji: "😤", label: "Difficile" },
  { emoji: "😐", label: "Moyen" },
  { emoji: "🙂", label: "Bien" },
  { emoji: "😄", label: "Super" },
];

export default function CarnetConduite() {
  const [sessions, setSessions] = useState([]);
  const [view, setView] = useState("list");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [detailId, setDetailId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("sessions");
    if (saved) setSessions(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);

  function openNew() {
    setForm({ ...EMPTY_FORM, date: getTodayISO() });
    setEditId(null);
    setView("form");
  }

  function openEdit(s) {
    setForm({
      date: s.date, moniteur: s.moniteur || "", duree: s.duree || "1",
      note: s.note || "", acquis: s.acquis || [], zones: s.zones || "",
      conseils: s.conseils || "", humeur: s.humeur || "",
    });
    setEditId(s.id);
    setView("form");
  }

  function openDetail(s) {
    setDetailId(s.id);
    setView("detail");
  }

  function saveForm() {
    if (!form.date) return;
    if (editId) {
      setSessions(prev => prev.map(s => s.id === editId ? { ...s, ...form } : s));
    } else {
      setSessions(prev => [{ ...form, id: Date.now() }, ...prev]);
    }
    setView("list");
  }

  function deleteSession(id) {
    if (window.confirm("Supprimer cette séance ?")) {
      setSessions(prev => prev.filter(s => s.id !== id));
      setView("list");
    }
  }

  function toggleAcquis(item) {
    setForm(f => ({
      ...f,
      acquis: f.acquis.includes(item)
        ? f.acquis.filter(a => a !== item)
        : [...f.acquis, item],
    }));
  }

  const totalHeures = sessions.reduce((acc, s) => acc + parseFloat(s.duree || 1), 0);
  const detail = sessions.find(s => s.id === detailId);

  if (view === "form") return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'Inter', system-ui, sans-serif", color: "#e2e8f0", paddingBottom: 40 }}>
      <div style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={() => setView("list")} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 2 }}>←</button>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>{editId ? "Modifier la séance" : "Nouvelle séance"}</h2>
      </div>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Date</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Durée (h)</label>
            <select value={form.duree} onChange={e => setForm(f => ({ ...f, duree: e.target.value }))} style={inputStyle}>
              {["0.5","1","1.5","2","2.5","3"].map(v => <option key={v} value={v}>{v}h</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Moniteur / Monitrice</label>
          <input type="text" placeholder="Nom" value={form.moniteur} onChange={e => setForm(f => ({ ...f, moniteur: e.target.value }))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Comment ça s'est passé ?</label>
          <div style={{ display: "flex", gap: 10 }}>
            {HUMEURS.map(h => (
              <button key={h.label} onClick={() => setForm(f => ({ ...f, humeur: h.label }))}
                style={{ flex: 1, padding: "10px 4px", border: "2px solid", borderColor: form.humeur === h.label ? "#3b82f6" : "#334155", borderRadius: 10, background: form.humeur === h.label ? "#1d4ed8" : "#1e293b", cursor: "pointer", fontSize: 22, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span>{h.emoji}</span>
                <span style={{ fontSize: 10, color: "#94a3b8" }}>{h.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={labelStyle}>Zones / Trajets</label>
          <input type="text" placeholder="Ex: centre-ville, rocade…" value={form.zones} onChange={e => setForm(f => ({ ...f, zones: e.target.value }))} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Points travaillés</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ACQUIS_OPTIONS.map(item => (
              <button key={item} onClick={() => toggleAcquis(item)}
                style={{ padding: "6px 12px", borderRadius: 20, fontSize: 13, cursor: "pointer", border: "1.5px solid", borderColor: form.acquis.includes(item) ? "#22c55e" : "#334155", background: form.acquis.includes(item) ? "#14532d" : "#1e293b", color: form.acquis.includes(item) ? "#86efac" : "#94a3b8" }}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={labelStyle}>Ce que j'ai fait / observé</label>
          <textarea placeholder="Décris le déroulement…" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
        </div>
        <div>
          <label style={labelStyle}>Conseils du moniteur</label>
          <textarea placeholder="Qu'est-ce qu'il t'a dit ?" value={form.conseils} onChange={e => setForm(f => ({ ...f, conseils: e.target.value }))} rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
        </div>
        <button onClick={saveForm} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 4 }}>
          {editId ? "Enregistrer les modifications" : "Ajouter la séance"}
        </button>
      </div>
    </div>
  );

  if (view === "detail" && detail) {
    const humeurObj = HUMEURS.find(h => h.label === detail.humeur);
    return (
      <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'Inter', system-ui, sans-serif", color: "#e2e8f0", paddingBottom: 40 }}>
        <div style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setView("list")} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 2 }}>←</button>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>Séance</h2>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => openEdit(detail)} style={{ background: "#1e3a5f", color: "#93c5fd", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13 }}>Modifier</button>
            <button onClick={() => deleteSession(detail.id)} style={{ background: "#3b0f0f", color: "#fca5a5", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13 }}>Supprimer</button>
          </div>
        </div>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ background: "#1e293b", borderRadius: 14, padding: "18px 20px", borderLeft: "4px solid #3b82f6" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>{formatDate(detail.date)}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, color: "#94a3b8", fontSize: 14 }}>
              {detail.moniteur && <span>👤 {detail.moniteur}</span>}
              <span>⏱ {detail.duree}h</span>
              {humeurObj && <span>{humeurObj.emoji} {humeurObj.label}</span>}
            </div>
          </div>
          {detail.zones && <Card title="📍 Zones / Trajets" content={detail.zones} />}
          {detail.acquis?.length > 0 && (
            <div style={cardStyle}>
              <div style={cardTitleStyle}>✅ Points travaillés</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                {detail.acquis.map(a => (
                  <span key={a} style={{ padding: "4px 12px", borderRadius: 20, fontSize: 13, background: "#14532d", color: "#86efac", border: "1px solid #22c55e" }}>{a}</span>
                ))}
              </div>
            </div>
          )}
          {detail.note && <Card title="📝 Ce que j'ai fait / observé" content={detail.note} />}
          {detail.conseils && <Card title="💡 Conseils du moniteur" content={detail.conseils} accent="#f59e0b" />}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'Inter', system-ui, sans-serif", color: "#e2e8f0", paddingBottom: 80 }}>
      <div style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "16px 20px", position: "sticky", top: 0, zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f1f5f9", letterSpacing: -0.3 }}>🚗 Carnet de conduite</h1>
        {sessions.length > 0 && (
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
            {sessions.length} séance{sessions.length > 1 ? "s" : ""} · {totalHeures}h au total
          </div>
        )}
      </div>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "20px 16px" }}>
        {sessions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚦</div>
            <div style={{ fontSize: 17, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>Pas encore de séance</div>
            <div style={{ fontSize: 14 }}>Enregistre ta première heure de conduite</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sessions.map(s => {
              const humeurObj = HUMEURS.find(h => h.label === s.humeur);
              return (
                <button key={s.id} onClick={() => openDetail(s)}
                  style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 14, padding: "16px 18px", cursor: "pointer", textAlign: "left", width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9" }}>{formatDate(s.date)}</div>
                    {humeurObj && <span style={{ fontSize: 18 }}>{humeurObj.emoji}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
                    {s.moniteur && <span style={tagStyle}>👤 {s.moniteur}</span>}
                    <span style={tagStyle}>⏱ {s.duree}h</span>
                    {s.zones && <span style={tagStyle}>📍 {s.zones.slice(0, 30)}{s.zones.length > 30 ? "…" : ""}</span>}
                  </div>
                  {s.acquis?.length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 12, color: "#86efac" }}>
                      ✅ {s.acquis.slice(0, 3).join(", ")}{s.acquis.length > 3 ? ` +${s.acquis.length - 3}` : ""}
                    </div>
                  )}
                  {s.conseils && (
                    <div style={{ marginTop: 6, fontSize: 12, color: "#fbbf24", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                      💡 {s.conseils.slice(0, 80)}{s.conseils.length > 80 ? "…" : ""}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <button onClick={openNew}
        style={{ position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: "50%", background: "#2563eb", color: "#fff", fontSize: 26, border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(37,99,235,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20 }}>
        +
      </button>
    </div>
  );
}

function Card({ title, content, accent = "#3b82f6" }) {
  return (
    <div style={{ ...cardStyle, borderLeft: `3px solid ${accent}` }}>
      <div style={cardTitleStyle}>{title}</div>
      <div style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.7, whiteSpace: "pre-wrap", marginTop: 8 }}>{content}</div>
    </div>
  );

}

const labelStyle = { display: "block", fontSize: 13, fontWeight: 500, color: "#94a3b8", marginBottom: 7 };
const inputStyle = { width: "100%", boxSizing: "border-box", background: "#1e293b", border: "1.5px solid #334155", borderRadius: 10, padding: "11px 14px", color: "#f1f5f9", fontSize: 14, outline: "none" };
const cardStyle = { background: "#1e293b", borderRadius: 14, padding: "16px 18px", border: "1px solid #334155" };
const cardTitleStyle = { fontSize: 13, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 };
const tagStyle = { fontSize: 12, color: "#94a3b8", background: "#0f172a", padding: "3px 10px", borderRadius: 20, border: "1px solid #334155" };
