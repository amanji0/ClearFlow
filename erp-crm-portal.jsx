import { useState, useEffect, useCallback } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const COLORS = {
  bg: "#0F1117",
  surface: "#16181F",
  surfaceHover: "#1E2029",
  border: "#2A2D3A",
  borderLight: "#333647",
  accent: "#4F6EF7",
  accentHover: "#3D5CE3",
  accentSoft: "rgba(79,110,247,0.12)",
  success: "#22C55E",
  successSoft: "rgba(34,197,94,0.12)",
  warning: "#F59E0B",
  warningSoft: "rgba(245,158,11,0.12)",
  danger: "#EF4444",
  dangerSoft: "rgba(239,68,68,0.12)",
  text: "#F1F3F9",
  textMuted: "#8B92A5",
  textDim: "#4A4F63",
  purple: "#8B5CF6",
  purpleSoft: "rgba(139,92,246,0.12)",
  cyan: "#06B6D4",
  cyanSoft: "rgba(6,182,212,0.12)",
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_USERS = {
  admin: { password: "admin123", role: "Admin", name: "Rajan Mehta" },
  sales: { password: "sales123", role: "Sales", name: "Priya Sharma" },
  warehouse: { password: "wh123", role: "Warehouse", name: "Vikram Patel" },
  accounts: { password: "acc123", role: "Accounts", name: "Anita Desai" },
};

const initCustomers = [
  { id: 1, name: "Kiran Traders", mobile: "9876543210", email: "kiran@traders.com", business: "Kiran Enterprises", gst: "27AAPFU0939F1ZV", type: "Wholesale", address: "Mumbai, MH", status: "Active", followUp: "2026-08-20", notes: "High-value client, prefers bulk orders." },
  { id: 2, name: "Suresh Distributors", mobile: "9123456780", email: "suresh@dist.com", business: "Suresh & Sons", gst: "", type: "Distributor", address: "Pune, MH", status: "Lead", followUp: "2026-08-15", notes: "Needs product catalog." },
  { id: 3, name: "Retail Hub", mobile: "9988776655", email: "hub@retail.in", business: "Retail Hub Pvt", gst: "07AAACR5055K1ZJ", type: "Retail", address: "Delhi", status: "Active", followUp: "2026-09-01", notes: "Prefers COD." },
];

const initProducts = [
  { id: 1, name: "Industrial Bolts M8", sku: "BOLT-M8-100", category: "Fasteners", price: 450, stock: 2400, minStock: 500, location: "Rack A-12" },
  { id: 2, name: "Steel Pipe 2-inch", sku: "PIPE-ST-2IN", category: "Pipes", price: 1200, stock: 80, minStock: 100, location: "Yard B" },
  { id: 3, name: "PVC Elbow 90°", sku: "PVC-ELB-90", category: "Fittings", price: 85, stock: 620, minStock: 200, location: "Rack C-3" },
  { id: 4, name: "Copper Wire 1.5mm", sku: "WIRE-CU-1.5", category: "Electrical", price: 3200, stock: 15, minStock: 50, location: "Rack D-7" },
];

const initStockLog = [
  { id: 1, productId: 1, productName: "Industrial Bolts M8", qty: 500, type: "IN", reason: "Purchase Order #001", by: "Vikram Patel", ts: "2026-08-10 09:30" },
  { id: 2, productId: 3, productName: "PVC Elbow 90°", qty: -120, type: "OUT", reason: "Challan CH-0001", by: "Priya Sharma", ts: "2026-08-11 14:15" },
];

const initChallans = [
  { id: 1, number: "CH-0001", customerId: 1, customerName: "Kiran Traders", items: [{ productId: 3, name: "PVC Elbow 90°", sku: "PVC-ELB-90", qty: 120, price: 85 }], total: 10200, status: "Confirmed", by: "Priya Sharma", date: "2026-08-11" },
];

// ─── UTILITY FUNCTIONS ────────────────────────────────────────────────────────
const uid = () => Math.floor(Math.random() * 900000) + 100000;
const fmtCurrency = (n) => "₹" + Number(n).toLocaleString("en-IN");
const now = () => new Date().toLocaleString("en-IN", { hour12: false }).replace(",", "");

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: ${COLORS.bg}; color: ${COLORS.text}; min-height: 100vh; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
  input, select, textarea { font-family: 'Inter', sans-serif; }
  button { font-family: 'Inter', sans-serif; cursor: pointer; }
  .mono { font-family: 'JetBrains Mono', monospace; }
`;

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
const Badge = ({ color = "accent", children }) => {
  const map = { accent: [COLORS.accentSoft, COLORS.accent], success: [COLORS.successSoft, COLORS.success], warning: [COLORS.warningSoft, COLORS.warning], danger: [COLORS.dangerSoft, COLORS.danger], purple: [COLORS.purpleSoft, COLORS.purple], cyan: [COLORS.cyanSoft, COLORS.cyan] };
  const [bg, fg] = map[color] || map.accent;
  return <span style={{ background: bg, color: fg, fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, letterSpacing: "0.04em", textTransform: "uppercase", display: "inline-block" }}>{children}</span>;
};

const StatusBadge = ({ status }) => {
  const map = { Active: "success", Lead: "warning", Inactive: "danger", Draft: "cyan", Confirmed: "success", Cancelled: "danger", Low: "danger", OK: "success" };
  return <Badge color={map[status] || "accent"}>{status}</Badge>;
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24, ...style }}>{children}</div>
);

const Btn = ({ children, onClick, variant = "primary", size = "md", disabled = false, style = {} }) => {
  const sizes = { sm: { padding: "6px 14px", fontSize: 13 }, md: { padding: "9px 20px", fontSize: 14 }, lg: { padding: "12px 28px", fontSize: 15 } };
  const variants = {
    primary: { background: COLORS.accent, color: "#fff", border: "none" },
    ghost: { background: "transparent", color: COLORS.textMuted, border: `1px solid ${COLORS.border}` },
    danger: { background: COLORS.dangerSoft, color: COLORS.danger, border: `1px solid ${COLORS.danger}33` },
    success: { background: COLORS.successSoft, color: COLORS.success, border: `1px solid ${COLORS.success}33` },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...sizes[size], ...variants[variant], borderRadius: 8, fontWeight: 600, transition: "all 0.15s", opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 6, ...style }}>
      {children}
    </button>
  );
};

const Input = ({ label, value, onChange, type = "text", placeholder = "", required = false, options, style = {} }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}{required && <span style={{ color: COLORS.danger }}> *</span>}</label>}
    {options ? (
      <select value={value} onChange={e => onChange(e.target.value)} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", width: "100%" }}>
        {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
      </select>
    ) : type === "textarea" ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", width: "100%", resize: "vertical" }} />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", width: "100%" }} />
    )}
  </div>
);

const Modal = ({ title, children, onClose, width = 600 }) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 16, width: "100%", maxWidth: width, maxHeight: "90vh", overflow: "auto" }} onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${COLORS.border}` }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  </div>
);

const Table = ({ cols, rows, empty = "No records found." }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {cols.map(c => <th key={c.key} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${COLORS.border}`, whiteSpace: "nowrap" }}>{c.label}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={cols.length} style={{ padding: 40, textAlign: "center", color: COLORS.textDim }}>{empty}</td></tr>
        ) : rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}22` }}>
            {cols.map(c => <td key={c.key} style={{ padding: "14px 16px", fontSize: 14, color: COLORS.text, verticalAlign: "middle" }}>{c.render ? c.render(row) : row[c.key]}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const StatCard = ({ label, value, sub, color = COLORS.accent, icon }) => (
  <Card>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color, letterSpacing: "-0.02em" }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 6 }}>{sub}</div>}
      </div>
      {icon && <div style={{ fontSize: 28, opacity: 0.6 }}>{icon}</div>}
    </div>
  </Card>
);

const Toast = ({ msg, type = "success" }) => (
  <div style={{ position: "fixed", bottom: 28, right: 28, background: type === "error" ? COLORS.dangerSoft : COLORS.successSoft, border: `1px solid ${type === "error" ? COLORS.danger : COLORS.success}44`, color: type === "error" ? COLORS.danger : COLORS.success, padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600, zIndex: 9999, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
    {type === "error" ? "⚠" : "✓"} {msg}
  </div>
);

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const user = MOCK_USERS[username.toLowerCase()];
    if (user && user.password === password) {
      onLogin({ username, ...user });
    } else {
      setError("Invalid credentials. Try: admin/admin123");
    }
  };

  const quickLogin = (u) => {
    const user = MOCK_USERS[u];
    onLogin({ username: u, ...user });
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>⚡</div>
            <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em" }}>FlowERP</span>
          </div>
          <p style={{ color: COLORS.textMuted, fontSize: 14 }}>Wholesale & Distribution Operations</p>
        </div>

        <Card>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Sign in to your account</h2>
          {error && <div style={{ background: COLORS.dangerSoft, color: COLORS.danger, padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Username" value={username} onChange={setUsername} placeholder="admin, sales, warehouse, accounts" />
            <Input label="Password" value={password} onChange={setPassword} type="password" placeholder="Enter password" />
            <Btn onClick={handleLogin} size="lg" style={{ width: "100%", justifyContent: "center" }}>Sign In →</Btn>
          </div>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${COLORS.border}` }}>
            <p style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Quick Login</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {Object.entries(MOCK_USERS).map(([u, d]) => (
                <button key={u} onClick={() => quickLogin(u)} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px", textAlign: "left", cursor: "pointer", transition: "border-color 0.15s" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>{d.role}</div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ customers, products, challans, stockLog }) {
  const activeCustomers = customers.filter(c => c.status === "Active").length;
  const lowStock = products.filter(p => p.stock <= p.minStock).length;
  const confirmedChallans = challans.filter(c => c.status === "Confirmed");
  const totalRevenue = confirmedChallans.reduce((s, c) => s + c.total, 0);
  const todayFollowUps = customers.filter(c => c.followUp === new Date().toISOString().split("T")[0]).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>Operations Overview</h1>
        <p style={{ color: COLORS.textMuted, marginTop: 4 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <StatCard label="Total Customers" value={customers.length} sub={`${activeCustomers} active`} color={COLORS.accent} icon="👥" />
        <StatCard label="Products" value={products.length} sub={lowStock > 0 ? `⚠ ${lowStock} low stock` : "Stock OK"} color={lowStock > 0 ? COLORS.warning : COLORS.success} icon="📦" />
        <StatCard label="Sales Challans" value={challans.length} sub={`${confirmedChallans.length} confirmed`} color={COLORS.purple} icon="📋" />
        <StatCard label="Revenue (Confirmed)" value={fmtCurrency(totalRevenue)} sub="From confirmed challans" color={COLORS.success} icon="💰" />
      </div>

      {/* Alerts */}
      {(lowStock > 0 || todayFollowUps > 0) && (
        <Card style={{ background: COLORS.warningSoft, border: `1px solid ${COLORS.warning}33` }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.warning, marginBottom: 12 }}>⚠ Action Required</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {lowStock > 0 && <div style={{ fontSize: 13, color: COLORS.text }}>• {lowStock} product(s) are at or below minimum stock level</div>}
            {todayFollowUps > 0 && <div style={{ fontSize: 13, color: COLORS.text }}>• {todayFollowUps} customer follow-up(s) scheduled for today</div>}
          </div>
        </Card>
      )}

      {/* Low Stock */}
      <Card>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Low Stock Products</h2>
        {products.filter(p => p.stock <= p.minStock).length === 0 ? (
          <p style={{ color: COLORS.textMuted, fontSize: 14 }}>✓ All products are adequately stocked.</p>
        ) : (
          <Table
            cols={[
              { key: "name", label: "Product" },
              { key: "sku", label: "SKU", render: r => <span className="mono" style={{ fontSize: 12, color: COLORS.textMuted }}>{r.sku}</span> },
              { key: "stock", label: "Current Stock", render: r => <span style={{ color: COLORS.danger, fontWeight: 700 }}>{r.stock}</span> },
              { key: "minStock", label: "Min Required" },
              { key: "location", label: "Location" },
            ]}
            rows={products.filter(p => p.stock <= p.minStock)}
          />
        )}
      </Card>

      {/* Recent Challans */}
      <Card>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Challans</h2>
        <Table
          cols={[
            { key: "number", label: "Challan #", render: r => <span className="mono" style={{ fontWeight: 600, color: COLORS.accent }}>{r.number}</span> },
            { key: "customerName", label: "Customer" },
            { key: "total", label: "Amount", render: r => fmtCurrency(r.total) },
            { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
            { key: "date", label: "Date" },
          ]}
          rows={challans.slice(-5).reverse()}
          empty="No challans yet."
        />
      </Card>

      {/* Stock Log */}
      <Card>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Recent Stock Movements</h2>
        <Table
          cols={[
            { key: "productName", label: "Product" },
            { key: "qty", label: "Qty", render: r => <span style={{ color: r.type === "IN" ? COLORS.success : COLORS.danger, fontWeight: 700 }}>{r.type === "IN" ? "+" : ""}{r.qty}</span> },
            { key: "type", label: "Type", render: r => <Badge color={r.type === "IN" ? "success" : "danger"}>{r.type}</Badge> },
            { key: "reason", label: "Reason" },
            { key: "by", label: "By" },
            { key: "ts", label: "Time" },
          ]}
          rows={stockLog.slice(-6).reverse()}
          empty="No stock movements yet."
        />
      </Card>
    </div>
  );
}

// ─── CUSTOMERS ────────────────────────────────────────────────────────────────
function Customers({ customers, setCustomers, user }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [followNote, setFollowNote] = useState("");

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.business.toLowerCase().includes(search.toLowerCase()) ||
    c.mobile.includes(search) ||
    c.status.toLowerCase().includes(search.toLowerCase())
  );

  const emptyForm = { name: "", mobile: "", email: "", business: "", gst: "", type: "Retail", address: "", status: "Lead", followUp: "", notes: "" };

  const openAdd = () => { setForm(emptyForm); setModal("add"); };
  const openEdit = (c) => { setForm({ ...c }); setModal("edit"); };
  const openView = (c) => { setSelected(c); setFollowNote(""); setModal("view"); };

  const saveCustomer = () => {
    if (!form.name || !form.mobile) { showToast("Name and mobile are required.", "error"); return; }
    if (modal === "add") {
      setCustomers(prev => [...prev, { ...form, id: uid() }]);
      showToast("Customer added successfully.");
    } else {
      setCustomers(prev => prev.map(c => c.id === form.id ? form : c));
      showToast("Customer updated.");
    }
    setModal(null);
  };

  const addFollowNote = () => {
    if (!followNote.trim()) return;
    const updated = { ...selected, notes: selected.notes + "\n[" + now() + "] " + followNote };
    setCustomers(prev => prev.map(c => c.id === selected.id ? updated : c));
    setSelected(updated);
    setFollowNote("");
    showToast("Follow-up note added.");
  };

  const canEdit = user.role !== "Warehouse" && user.role !== "Accounts";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {toast && <Toast {...toast} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Customer CRM</h1>
          <p style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 2 }}>{filtered.length} records</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, mobile, status…" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 8, padding: "9px 16px", fontSize: 14, outline: "none", width: 260 }} />
          {canEdit && <Btn onClick={openAdd}>+ Add Customer</Btn>}
        </div>
      </div>

      <Card style={{ padding: 0 }}>
        <Table
          cols={[
            { key: "name", label: "Customer", render: r => (
              <div>
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>{r.business}</div>
              </div>
            )},
            { key: "mobile", label: "Contact", render: r => (
              <div>
                <div className="mono" style={{ fontSize: 13 }}>{r.mobile}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>{r.email}</div>
              </div>
            )},
            { key: "type", label: "Type", render: r => <Badge color={r.type === "Wholesale" ? "purple" : r.type === "Distributor" ? "cyan" : "accent"}>{r.type}</Badge> },
            { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
            { key: "followUp", label: "Follow Up", render: r => <span style={{ fontSize: 12, color: r.followUp ? COLORS.text : COLORS.textDim }}>{r.followUp || "—"}</span> },
            { key: "actions", label: "", render: r => (
              <div style={{ display: "flex", gap: 6 }}>
                <Btn size="sm" variant="ghost" onClick={() => openView(r)}>View</Btn>
                {canEdit && <Btn size="sm" variant="ghost" onClick={() => openEdit(r)}>Edit</Btn>}
              </div>
            )},
          ]}
          rows={filtered}
          empty="No customers found. Add one to get started."
        />
      </Card>

      {/* Add/Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Add Customer" : "Edit Customer"} onClose={() => setModal(null)} width={620}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
            <Input label="Mobile" value={form.mobile} onChange={v => setForm(f => ({ ...f, mobile: v }))} required />
            <Input label="Email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" />
            <Input label="Business Name" value={form.business} onChange={v => setForm(f => ({ ...f, business: v }))} />
            <Input label="GST Number" value={form.gst} onChange={v => setForm(f => ({ ...f, gst: v }))} />
            <Input label="Customer Type" value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} options={["Retail", "Wholesale", "Distributor"]} />
            <Input label="Status" value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={["Lead", "Active", "Inactive"]} />
            <Input label="Follow-up Date" value={form.followUp} onChange={v => setForm(f => ({ ...f, followUp: v }))} type="date" />
            <div style={{ gridColumn: "1/-1" }}>
              <Input label="Address" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <Input label="Notes" value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} type="textarea" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={saveCustomer}>{modal === "add" ? "Add Customer" : "Save Changes"}</Btn>
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {modal === "view" && selected && (
        <Modal title="Customer Profile" onClose={() => setModal(null)} width={620}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {[
              ["Name", selected.name], ["Business", selected.business],
              ["Mobile", selected.mobile], ["Email", selected.email],
              ["Type", selected.type], ["Status", selected.status],
              ["GST", selected.gst || "—"], ["Follow Up", selected.followUp || "—"],
              ["Address", selected.address, true],
            ].map(([k, v, full]) => (
              <div key={k} style={{ gridColumn: full ? "1/-1" : undefined }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{k}</div>
                <div style={{ fontSize: 14 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Follow-up Notes</div>
            <div style={{ background: COLORS.bg, borderRadius: 8, padding: 12, fontSize: 13, whiteSpace: "pre-line", minHeight: 60, marginBottom: 12, color: selected.notes ? COLORS.text : COLORS.textDim }}>
              {selected.notes || "No notes yet."}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={followNote} onChange={e => setFollowNote(e.target.value)} placeholder="Add a follow-up note…" style={{ flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 8, padding: "9px 14px", fontSize: 14, outline: "none" }} />
              <Btn onClick={addFollowNote}>Add Note</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── PRODUCTS & INVENTORY ────────────────────────────────────────────────────
function Products({ products, setProducts, stockLog, setStockLog, user }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [stockForm, setStockForm] = useState({ productId: "", qty: "", type: "IN", reason: "" });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const emptyForm = { name: "", sku: "", category: "", price: "", stock: "", minStock: "", location: "" };

  const saveProduct = () => {
    if (!form.name || !form.sku || !form.price) { showToast("Name, SKU and price are required.", "error"); return; }
    if (modal === "add") {
      setProducts(prev => [...prev, { ...form, id: uid(), price: +form.price, stock: +form.stock, minStock: +form.minStock }]);
      showToast("Product added.");
    } else {
      setProducts(prev => prev.map(p => p.id === form.id ? { ...form, price: +form.price, stock: +form.stock, minStock: +form.minStock } : p));
      showToast("Product updated.");
    }
    setModal(null);
  };

  const doStockMove = () => {
    if (!stockForm.productId || !stockForm.qty || !stockForm.reason) { showToast("All fields required.", "error"); return; }
    const qty = +stockForm.qty;
    const product = products.find(p => p.id === +stockForm.productId);
    if (!product) return;
    const change = stockForm.type === "IN" ? qty : -qty;
    if (product.stock + change < 0) { showToast("Stock cannot go negative!", "error"); return; }
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: p.stock + change } : p));
    setStockLog(prev => [...prev, { id: uid(), productId: product.id, productName: product.name, qty: change, type: stockForm.type, reason: stockForm.reason, by: user.name, ts: now() }]);
    setStockForm({ productId: "", qty: "", type: "IN", reason: "" });
    setModal(null);
    showToast(`Stock ${stockForm.type === "IN" ? "added" : "removed"}: ${qty} units of ${product.name}`);
  };

  const canEdit = user.role === "Admin" || user.role === "Warehouse";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {toast && <Toast {...toast} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Products & Inventory</h1>
          <p style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 2 }}>{filtered.length} products</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product, SKU, category…" style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.text, borderRadius: 8, padding: "9px 16px", fontSize: 14, outline: "none", width: 240 }} />
          {canEdit && <Btn variant="ghost" onClick={() => setModal("stock")}>↕ Stock Move</Btn>}
          {canEdit && <Btn onClick={() => { setForm(emptyForm); setModal("add"); }}>+ Add Product</Btn>}
        </div>
      </div>

      <Card style={{ padding: 0 }}>
        <Table
          cols={[
            { key: "name", label: "Product", render: r => (
              <div>
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                <div className="mono" style={{ fontSize: 11, color: COLORS.textMuted }}>{r.sku}</div>
              </div>
            )},
            { key: "category", label: "Category", render: r => <Badge color="cyan">{r.category}</Badge> },
            { key: "price", label: "Unit Price", render: r => <span style={{ fontWeight: 600 }}>{fmtCurrency(r.price)}</span> },
            { key: "stock", label: "Stock", render: r => (
              <div>
                <span style={{ fontWeight: 700, color: r.stock <= r.minStock ? COLORS.danger : COLORS.success }}>{r.stock}</span>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}> / min {r.minStock}</span>
              </div>
            )},
            { key: "status", label: "Status", render: r => <StatusBadge status={r.stock <= r.minStock ? "Low" : "OK"} /> },
            { key: "location", label: "Location", render: r => <span style={{ fontSize: 12, color: COLORS.textMuted }}>{r.location}</span> },
            { key: "actions", label: "", render: r => canEdit && <Btn size="sm" variant="ghost" onClick={() => { setForm({ ...r }); setModal("edit"); }}>Edit</Btn> },
          ]}
          rows={filtered}
          empty="No products found."
        />
      </Card>

      {/* Stock Log */}
      <Card>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Stock Movement Log</h2>
        <Table
          cols={[
            { key: "productName", label: "Product" },
            { key: "qty", label: "Qty", render: r => <span style={{ color: r.type === "IN" ? COLORS.success : COLORS.danger, fontWeight: 700 }}>{r.qty > 0 ? "+" : ""}{r.qty}</span> },
            { key: "type", label: "Type", render: r => <Badge color={r.type === "IN" ? "success" : "danger"}>{r.type}</Badge> },
            { key: "reason", label: "Reason" },
            { key: "by", label: "By" },
            { key: "ts", label: "Time" },
          ]}
          rows={stockLog.slice().reverse()}
          empty="No stock movements recorded."
        />
      </Card>

      {/* Add/Edit Product Modal */}
      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Add Product" : "Edit Product"} onClose={() => setModal(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Input label="Product Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
            <Input label="SKU / Code" value={form.sku} onChange={v => setForm(f => ({ ...f, sku: v }))} required />
            <Input label="Category" value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} />
            <Input label="Unit Price (₹)" value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} type="number" required />
            <Input label="Current Stock" value={form.stock} onChange={v => setForm(f => ({ ...f, stock: v }))} type="number" />
            <Input label="Min Stock Alert" value={form.minStock} onChange={v => setForm(f => ({ ...f, minStock: v }))} type="number" />
            <div style={{ gridColumn: "1/-1" }}>
              <Input label="Location / Warehouse" value={form.location} onChange={v => setForm(f => ({ ...f, location: v }))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={saveProduct}>{modal === "add" ? "Add Product" : "Save Changes"}</Btn>
          </div>
        </Modal>
      )}

      {/* Stock Move Modal */}
      {modal === "stock" && (
        <Modal title="Stock Movement" onClose={() => setModal(null)} width={460}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="Product" value={stockForm.productId} onChange={v => setStockForm(f => ({ ...f, productId: v }))} options={[{ value: "", label: "Select product…" }, ...products.map(p => ({ value: p.id, label: `${p.name} (Current: ${p.stock})` }))]} />
            <Input label="Movement Type" value={stockForm.type} onChange={v => setStockForm(f => ({ ...f, type: v }))} options={["IN", "OUT"]} />
            <Input label="Quantity" value={stockForm.qty} onChange={v => setStockForm(f => ({ ...f, qty: v }))} type="number" placeholder="Enter quantity" />
            <Input label="Reason" value={stockForm.reason} onChange={v => setStockForm(f => ({ ...f, reason: v }))} placeholder="Purchase, Return, Adjustment…" />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={doStockMove}>Confirm Move</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── CHALLANS ─────────────────────────────────────────────────────────────────
function Challans({ challans, setChallans, customers, products, setProducts, setStockLog, user }) {
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [viewChallan, setViewChallan] = useState(null);
  const [form, setForm] = useState({ customerId: "", items: [], status: "Draft" });
  const [addItem, setAddItem] = useState({ productId: "", qty: "" });

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const resetForm = () => setForm({ customerId: "", items: [], status: "Draft" });

  const pushItem = () => {
    if (!addItem.productId || !addItem.qty || +addItem.qty <= 0) { showToast("Select product and enter valid qty.", "error"); return; }
    const p = products.find(pr => pr.id === +addItem.productId);
    if (!p) return;
    const exists = form.items.find(i => i.productId === p.id);
    if (exists) { showToast("Product already added. Edit quantity below.", "error"); return; }
    setForm(f => ({ ...f, items: [...f.items, { productId: p.id, name: p.name, sku: p.sku, qty: +addItem.qty, price: p.price }] }));
    setAddItem({ productId: "", qty: "" });
  };

  const removeItem = (pid) => setForm(f => ({ ...f, items: f.items.filter(i => i.productId !== pid) }));

  const totalAmount = form.items.reduce((s, i) => s + i.qty * i.price, 0);

  const saveChallan = () => {
    if (!form.customerId) { showToast("Select a customer.", "error"); return; }
    if (form.items.length === 0) { showToast("Add at least one product.", "error"); return; }
    const customer = customers.find(c => c.id === +form.customerId);
    if (form.status === "Confirmed") {
      for (const item of form.items) {
        const p = products.find(pr => pr.id === item.productId);
        if (!p || p.stock < item.qty) {
          showToast(`Insufficient stock for ${item.name}. Available: ${p?.stock ?? 0}`, "error");
          return;
        }
      }
      // Deduct stock
      setProducts(prev => prev.map(p => {
        const item = form.items.find(i => i.productId === p.id);
        return item ? { ...p, stock: p.stock - item.qty } : p;
      }));
      setStockLog(prev => [...prev, ...form.items.map(i => ({ id: uid(), productId: i.productId, productName: i.name, qty: -i.qty, type: "OUT", reason: `Challan CH-${String(challans.length + 1).padStart(4, "0")}`, by: user.name, ts: now() }))]);
    }
    const challan = { id: uid(), number: "CH-" + String(challans.length + 1).padStart(4, "0"), customerId: customer.id, customerName: customer.name, items: form.items, total: totalAmount, status: form.status, by: user.name, date: new Date().toISOString().split("T")[0] };
    setChallans(prev => [...prev, challan]);
    showToast(`Challan ${challan.number} ${form.status === "Confirmed" ? "confirmed" : "saved as draft"}.`);
    setModal(null);
    resetForm();
  };

  const confirmDraft = (c) => {
    for (const item of c.items) {
      const p = products.find(pr => pr.id === item.productId);
      if (!p || p.stock < item.qty) { showToast(`Insufficient stock for ${item.name}!`, "error"); return; }
    }
    setProducts(prev => prev.map(p => {
      const item = c.items.find(i => i.productId === p.id);
      return item ? { ...p, stock: p.stock - item.qty } : p;
    }));
    setStockLog(prev => [...prev, ...c.items.map(i => ({ id: uid(), productId: i.productId, productName: i.name, qty: -i.qty, type: "OUT", reason: c.number, by: user.name, ts: now() }))]);
    setChallans(prev => prev.map(ch => ch.id === c.id ? { ...ch, status: "Confirmed" } : ch));
    showToast(`${c.number} confirmed.`);
    setViewChallan(null);
  };

  const cancelChallan = (c) => {
    setChallans(prev => prev.map(ch => ch.id === c.id ? { ...ch, status: "Cancelled" } : ch));
    showToast(`${c.number} cancelled.`, "error");
    setViewChallan(null);
  };

  const canCreate = user.role === "Admin" || user.role === "Sales";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {toast && <Toast {...toast} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Sales Challans</h1>
          <p style={{ color: COLORS.textMuted, fontSize: 14, marginTop: 2 }}>{challans.length} total</p>
        </div>
        {canCreate && <Btn onClick={() => { resetForm(); setModal("create"); }}>+ New Challan</Btn>}
      </div>

      <Card style={{ padding: 0 }}>
        <Table
          cols={[
            { key: "number", label: "Challan #", render: r => <span className="mono" style={{ fontWeight: 700, color: COLORS.accent }}>{r.number}</span> },
            { key: "customerName", label: "Customer" },
            { key: "items", label: "Items", render: r => `${r.items.length} item(s)` },
            { key: "total", label: "Total", render: r => <span style={{ fontWeight: 700 }}>{fmtCurrency(r.total)}</span> },
            { key: "status", label: "Status", render: r => <StatusBadge status={r.status} /> },
            { key: "by", label: "Created By" },
            { key: "date", label: "Date" },
            { key: "actions", label: "", render: r => <Btn size="sm" variant="ghost" onClick={() => setViewChallan(r)}>View</Btn> },
          ]}
          rows={challans.slice().reverse()}
          empty="No challans yet."
        />
      </Card>

      {/* Create Challan Modal */}
      {modal === "create" && (
        <Modal title="New Sales Challan" onClose={() => setModal(null)} width={700}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <Input label="Customer" value={form.customerId} onChange={v => setForm(f => ({ ...f, customerId: v }))} options={[{ value: "", label: "Select customer…" }, ...customers.filter(c => c.status === "Active").map(c => ({ value: c.id, label: c.name + " - " + c.business }))]} />
            <Input label="Challan Status" value={form.status} onChange={v => setForm(f => ({ ...f, status: v }))} options={["Draft", "Confirmed"]} />
          </div>

          <div style={{ background: COLORS.bg, borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Add Products</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: 2, minWidth: 200 }}>
                <Input label="" value={addItem.productId} onChange={v => setAddItem(f => ({ ...f, productId: v }))} options={[{ value: "", label: "Select product…" }, ...products.map(p => ({ value: p.id, label: `${p.name} (Stock: ${p.stock}) - ${fmtCurrency(p.price)}` }))]} />
              </div>
              <div style={{ width: 100 }}>
                <Input label="" value={addItem.qty} onChange={v => setAddItem(f => ({ ...f, qty: v }))} type="number" placeholder="Qty" />
              </div>
              <Btn onClick={pushItem} style={{ alignSelf: "flex-end" }}>Add</Btn>
            </div>
          </div>

          {form.items.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Product", "SKU", "Qty", "Unit Price", "Total", ""].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {form.items.map(item => (
                    <tr key={item.productId}>
                      <td style={{ padding: "10px 12px", fontSize: 14 }}>{item.name}</td>
                      <td style={{ padding: "10px 12px" }}><span className="mono" style={{ fontSize: 11, color: COLORS.textMuted }}>{item.sku}</span></td>
                      <td style={{ padding: "10px 12px", fontWeight: 700 }}>{item.qty}</td>
                      <td style={{ padding: "10px 12px" }}>{fmtCurrency(item.price)}</td>
                      <td style={{ padding: "10px 12px", fontWeight: 700 }}>{fmtCurrency(item.qty * item.price)}</td>
                      <td style={{ padding: "10px 12px" }}><button onClick={() => removeItem(item.productId)} style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer", fontSize: 16 }}>✕</button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: COLORS.textMuted }}>Total Amount:</td>
                    <td style={{ padding: "12px", fontWeight: 800, fontSize: 18, color: COLORS.accent }}>{fmtCurrency(totalAmount)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {form.status === "Confirmed" && <div style={{ background: COLORS.warningSoft, border: `1px solid ${COLORS.warning}33`, borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: COLORS.warning }}>⚠ Confirming will immediately deduct stock. This cannot be undone.</div>}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={saveChallan}>{form.status === "Confirmed" ? "Confirm & Save" : "Save as Draft"}</Btn>
          </div>
        </Modal>
      )}

      {/* View Challan Modal */}
      {viewChallan && (
        <Modal title={`Challan ${viewChallan.number}`} onClose={() => setViewChallan(null)} width={620}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {[["Customer", viewChallan.customerName], ["Status", <StatusBadge status={viewChallan.status} />], ["Created By", viewChallan.by], ["Date", viewChallan.date]].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{k}</div>
                <div style={{ fontSize: 14 }}>{v}</div>
              </div>
            ))}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
            <thead>
              <tr>{["Product", "SKU", "Qty", "Unit Price", "Total"].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `1px solid ${COLORS.border}` }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {viewChallan.items.map(i => (
                <tr key={i.productId} style={{ borderBottom: `1px solid ${COLORS.border}22` }}>
                  <td style={{ padding: "10px 12px" }}>{i.name}</td>
                  <td style={{ padding: "10px 12px" }}><span className="mono" style={{ fontSize: 11, color: COLORS.textMuted }}>{i.sku}</span></td>
                  <td style={{ padding: "10px 12px", fontWeight: 700 }}>{i.qty}</td>
                  <td style={{ padding: "10px 12px" }}>{fmtCurrency(i.price)}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 700 }}>{fmtCurrency(i.qty * i.price)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td colSpan={4} style={{ padding: "12px", textAlign: "right", fontWeight: 600, color: COLORS.textMuted }}>Total:</td><td style={{ padding: "12px", fontWeight: 800, fontSize: 18, color: COLORS.accent }}>{fmtCurrency(viewChallan.total)}</td></tr>
            </tfoot>
          </table>
          {canCreate && viewChallan.status === "Draft" && (
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="danger" onClick={() => cancelChallan(viewChallan)}>Cancel Challan</Btn>
              <Btn variant="success" onClick={() => confirmDraft(viewChallan)}>Confirm Challan</Btn>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
function Reports({ customers, products, challans, stockLog }) {
  const confirmedChallans = challans.filter(c => c.status === "Confirmed");
  const totalRevenue = confirmedChallans.reduce((s, c) => s + c.total, 0);
  const productSales = {};
  confirmedChallans.forEach(c => c.items.forEach(i => { productSales[i.name] = (productSales[i.name] || 0) + i.qty * i.price; }));
  const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Reports & Analytics</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <StatCard label="Total Revenue" value={fmtCurrency(totalRevenue)} color={COLORS.success} icon="💰" />
        <StatCard label="Active Customers" value={customers.filter(c => c.status === "Active").length} color={COLORS.accent} icon="👥" />
        <StatCard label="Confirmed Challans" value={confirmedChallans.length} color={COLORS.purple} icon="✓" />
        <StatCard label="Low Stock Items" value={products.filter(p => p.stock <= p.minStock).length} color={COLORS.warning} icon="⚠" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Customer Breakdown</h2>
          {["Retail", "Wholesale", "Distributor"].map(type => {
            const count = customers.filter(c => c.type === type).length;
            const pct = customers.length ? Math.round(count / customers.length * 100) : 0;
            return (
              <div key={type} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{type}</span>
                  <span style={{ fontSize: 13, color: COLORS.textMuted }}>{count} ({pct}%)</span>
                </div>
                <div style={{ background: COLORS.bg, borderRadius: 4, height: 6 }}>
                  <div style={{ background: COLORS.accent, borderRadius: 4, height: 6, width: pct + "%" }} />
                </div>
              </div>
            );
          })}
        </Card>

        <Card>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Top Selling Products</h2>
          {topProducts.length === 0 ? <p style={{ color: COLORS.textMuted, fontSize: 14 }}>No sales data yet.</p> : topProducts.map(([name, rev], i) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: COLORS.textDim, width: 24 }}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{name}</div>
                <div style={{ fontSize: 13, color: COLORS.success, fontWeight: 700 }}>{fmtCurrency(rev)}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Challan Status Summary</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          {["Draft", "Confirmed", "Cancelled"].map(s => {
            const count = challans.filter(c => c.status === s).length;
            const colors = { Draft: COLORS.cyan, Confirmed: COLORS.success, Cancelled: COLORS.danger };
            return (
              <div key={s} style={{ background: COLORS.bg, borderRadius: 10, padding: 16, textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: colors[s] }}>{count}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s}</div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Inventory Valuation</h2>
        <Table
          cols={[
            { key: "name", label: "Product" },
            { key: "stock", label: "Stock", render: r => <span style={{ fontWeight: 700 }}>{r.stock}</span> },
            { key: "price", label: "Unit Price", render: r => fmtCurrency(r.price) },
            { key: "value", label: "Total Value", render: r => <span style={{ fontWeight: 700, color: COLORS.accent }}>{fmtCurrency(r.stock * r.price)}</span> },
          ]}
          rows={products}
        />
        <div style={{ borderTop: `1px solid ${COLORS.border}`, marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>Total Inventory Value: <span style={{ color: COLORS.success }}>{fmtCurrency(products.reduce((s, p) => s + p.stock * p.price, 0))}</span></span>
        </div>
      </Card>
    </div>
  );
}

// ─── SIDEBAR NAV ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "⊞", roles: ["Admin", "Sales", "Warehouse", "Accounts"] },
  { id: "customers", label: "Customers", icon: "👥", roles: ["Admin", "Sales", "Accounts"] },
  { id: "products", label: "Products", icon: "📦", roles: ["Admin", "Sales", "Warehouse", "Accounts"] },
  { id: "challans", label: "Challans", icon: "📋", roles: ["Admin", "Sales", "Accounts"] },
  { id: "reports", label: "Reports", icon: "📊", roles: ["Admin", "Accounts"] },
];

function Sidebar({ active, setActive, user, onLogout }) {
  const allowed = NAV_ITEMS.filter(n => n.roles.includes(user.role));
  return (
    <div style={{ width: 240, background: COLORS.surface, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>FlowERP</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>Operations Portal</div>
          </div>
        </div>
      </div>

      {/* User */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: COLORS.accentSoft, borderRadius: 50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: COLORS.accent, fontWeight: 700 }}>{user.name[0]}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user.name}</div>
            <div><Badge color="accent">{user.role}</Badge></div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
        {allowed.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", background: active === item.id ? COLORS.accentSoft : "transparent", color: active === item.id ? COLORS.accent : COLORS.textMuted, fontWeight: active === item.id ? 600 : 500, fontSize: 14, cursor: "pointer", marginBottom: 2, transition: "all 0.15s", textAlign: "left" }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: 16, borderTop: `1px solid ${COLORS.border}` }}>
        <button onClick={onLogout} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", background: "transparent", color: COLORS.textMuted, fontSize: 14, cursor: "pointer" }}>
          ⎋ Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("dashboard");
  const [customers, setCustomers] = useState(initCustomers);
  const [products, setProducts] = useState(initProducts);
  const [stockLog, setStockLog] = useState(initStockLog);
  const [challans, setChallans] = useState(initChallans);

  if (!user) return <LoginPage onLogin={u => { setUser(u); setActive("dashboard"); }} />;

  const pages = { dashboard: <Dashboard customers={customers} products={products} challans={challans} stockLog={stockLog} />, customers: <Customers customers={customers} setCustomers={setCustomers} user={user} />, products: <Products products={products} setProducts={setProducts} stockLog={stockLog} setStockLog={setStockLog} user={user} />, challans: <Challans challans={challans} setChallans={setChallans} customers={customers} products={products} setProducts={setProducts} setStockLog={setStockLog} user={user} />, reports: <Reports customers={customers} products={products} challans={challans} stockLog={stockLog} /> };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: COLORS.bg }}>
      <style>{css}</style>
      <Sidebar active={active} setActive={setActive} user={user} onLogout={() => setUser(null)} />
      <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto", minHeight: "100vh" }}>
        {pages[active] || pages.dashboard}
      </main>
    </div>
  );
}
