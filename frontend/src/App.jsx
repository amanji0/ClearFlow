import { useState, useEffect, useCallback, useRef } from "react";
import { Zap, Waves, PackageOpen, Check, X, Search, AlertTriangle, Users, Package, DollarSign, IndianRupee, BarChart2, ClipboardList, ArrowUpDown, Menu, Sparkles, Warehouse, Award, FileText, CheckCircle2, XCircle, LayoutDashboard, LogOut, TrendingDown, Eye, EyeOff } from 'lucide-react';


// ─── DESIGN TOKENS (Huggingface-inspired Light Theme) ─────────────────────────
const C = {
  bg: "#FFFFFF",
  bgSec: "#F9FAFB",
  bgWarm: "#FFF8F0",
  surface: "#FFFFFF",
  surfaceHover: "#F3F4F6",
  surfaceElevated: "#FFFFFF",
  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  borderFocus: "#FFD21E",
  accent: "#FF9D00",
  accentHover: "#E88D00",
  accentSoft: "rgba(255,157,0,0.08)",
  accentYellow: "#FFD21E",
  accentYellowSoft: "rgba(255,210,30,0.12)",
  success: "#16A34A",
  successSoft: "rgba(22,163,74,0.08)",
  warning: "#F59E0B",
  warningSoft: "rgba(245,158,11,0.08)",
  danger: "#DC2626",
  dangerSoft: "rgba(220,38,38,0.06)",
  purple: "#7C3AED",
  purpleSoft: "rgba(124,58,237,0.08)",
  cyan: "#0891B2",
  cyanSoft: "rgba(8,145,178,0.08)",
  text: "#111827",
  textSec: "#6B7280",
  textDim: "#9CA3AF",
  gradPrimary: "linear-gradient(135deg, #FFD21E 0%, #FF9D00 100%)",
  gradSuccess: "linear-gradient(135deg, #16A34A 0%, #0891B2 100%)",
};

// ─── LOCAL STORAGE HELPERS ────────────────────────────────────────────────────
const STORAGE_KEY = "stockpro_data";

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

// ─── MOCK DATA (defaults) ─────────────────────────────────────────────────────
const MOCK_USERS = {
  admin: { password: "admin123", role: "Admin", name: "Rajan Mehta" },
  sales: { password: "sales123", role: "Sales", name: "Priya Sharma" },
  warehouse: { password: "wh123", role: "Warehouse", name: "Vikram Patel" },
  accounts: { password: "acc123", role: "Accounts", name: "Anita Desai" },
};

const DEFAULT_CUSTOMERS = [
  { id: 1, name: "Kiran Traders", mobile: "9876543210", email: "kiran@traders.com", business: "Kiran Enterprises", gst: "27AAPFU0939F1ZV", type: "Wholesale", address: "Mumbai, MH", status: "Active", followUp: "2026-08-20", notes: "High-value client, prefers bulk orders." },
  { id: 2, name: "Suresh Distributors", mobile: "9123456780", email: "suresh@dist.com", business: "Suresh & Sons", gst: "", type: "Distributor", address: "Pune, MH", status: "Lead", followUp: "2026-08-15", notes: "Needs product catalog." },
  { id: 3, name: "Retail Hub", mobile: "9988776655", email: "hub@retail.in", business: "Retail Hub Pvt", gst: "07AAACR5055K1ZJ", type: "Retail", address: "Delhi", status: "Active", followUp: "2026-09-01", notes: "Prefers COD." },
  { id: 4, name: "Bharat Steel Works", mobile: "9871234560", email: "bharat@steelworks.in", business: "Bharat Steel Industries", gst: "24AABCB1234F1Z5", type: "Wholesale", address: "Ahmedabad, GJ", status: "Active", followUp: "2026-08-25", notes: "Monthly orders, 30-day credit terms." },
  { id: 5, name: "Metro Pipes Ltd", mobile: "9654321870", email: "info@metropipes.com", business: "Metro Pipes Pvt Ltd", gst: "29AADCM5678G1Z3", type: "Distributor", address: "Bangalore, KA", status: "Lead", followUp: "2026-08-18", notes: "Interested in PVC product range." },
];

const DEFAULT_PRODUCTS = [
  { id: 1, name: "Industrial Bolts M8", sku: "BOLT-M8-100", category: "Fasteners", price: 450, stock: 2400, minStock: 500, location: "Rack A-12" },
  { id: 2, name: "Steel Pipe 2-inch", sku: "PIPE-ST-2IN", category: "Pipes", price: 1200, stock: 80, minStock: 100, location: "Yard B" },
  { id: 3, name: "PVC Elbow 90°", sku: "PVC-ELB-90", category: "Fittings", price: 85, stock: 620, minStock: 200, location: "Rack C-3" },
  { id: 4, name: "Copper Wire 1.5mm", sku: "WIRE-CU-1.5", category: "Electrical", price: 3200, stock: 15, minStock: 50, location: "Rack D-7" },
  { id: 5, name: "SS Flanges 4-inch", sku: "FLG-SS-4IN", category: "Fittings", price: 2800, stock: 340, minStock: 100, location: "Rack E-1" },
  { id: 6, name: "GI Wire 2mm", sku: "WIRE-GI-2MM", category: "Electrical", price: 780, stock: 45, minStock: 60, location: "Rack D-3" },
];

const DEFAULT_STOCK_LOG = [
  { id: 1, productId: 1, productName: "Industrial Bolts M8", qty: 500, type: "IN", reason: "Purchase Order #PO-001", by: "Vikram Patel", ts: "2026-08-10 09:30" },
  { id: 2, productId: 3, productName: "PVC Elbow 90°", qty: -120, type: "OUT", reason: "Challan CH-0001", by: "Priya Sharma", ts: "2026-08-11 14:15" },
  { id: 3, productId: 4, productName: "Copper Wire 1.5mm", qty: 30, type: "IN", reason: "Purchase Order #PO-002", by: "Vikram Patel", ts: "2026-08-11 16:00" },
];

const DEFAULT_CHALLANS = [
  { id: 1, number: "CH-0001", customerId: 1, customerName: "Kiran Traders", items: [{ productId: 3, name: "PVC Elbow 90°", sku: "PVC-ELB-90", qty: 120, price: 85 }], total: 10200, status: "Confirmed", by: "Priya Sharma", date: "2026-08-11" },
  { id: 2, number: "CH-0002", customerId: 4, customerName: "Bharat Steel Works", items: [{ productId: 1, name: "Industrial Bolts M8", sku: "BOLT-M8-100", qty: 200, price: 450 }, { productId: 5, name: "SS Flanges 4-inch", sku: "FLG-SS-4IN", qty: 50, price: 2800 }], total: 230000, status: "Confirmed", by: "Priya Sharma", date: "2026-08-12" },
];

// ─── UTILITY FUNCTIONS ────────────────────────────────────────────────────────
const uid = () => Math.floor(Math.random() * 900000) + 100000;
const fmtCurrency = (n) => "₹" + Number(n).toLocaleString("en-IN");
const now = () => new Date().toLocaleString("en-IN", { hour12: false }).replace(",", "");
const today = () => new Date().toISOString().split("T")[0];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

// ─── ANIMATED COUNTER HOOK ────────────────────────────────────────────────────
function useAnimatedValue(target, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(start);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function Badge({ color = "accent", children }) {
  const map = {
    accent: [C.accentSoft, C.accent],
    success: [C.successSoft, C.success],
    warning: [C.warningSoft, C.warning],
    danger: [C.dangerSoft, C.danger],
    purple: [C.purpleSoft, C.purple],
    cyan: [C.cyanSoft, C.cyan],
  };
  const [bg, fg] = map[color] || map.accent;
  return (
    <span className="badge" style={{ background: bg, color: fg }}>
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = { Active: "success", Lead: "warning", Inactive: "danger", Draft: "cyan", Confirmed: "success", Cancelled: "danger", Low: "danger", OK: "success" };
  return <Badge color={map[status] || "accent"}>{status}</Badge>;
}

function Btn({ children, onClick, variant = "primary", size = "md", disabled = false, style = {} }) {
  const sizeMap = { sm: "btn-sm", md: "", lg: "btn-lg" };
  const variantMap = { primary: "btn-primary", ghost: "btn-ghost", danger: "btn-danger", success: "btn-success" };
  return (
    <button
      className={`btn ${variantMap[variant] || ""} ${sizeMap[size] || ""}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type = "text", placeholder = "", required = false, options, style = {} }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label && (
        <label className="input-label">
          {label}{required && <span style={{ color: C.danger }}> *</span>}
        </label>
      )}
      {options ? (
        <select
          className="input-field select-field"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          className="input-field"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          style={{ resize: "vertical" }}
        />
      ) : isPassword ? (
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            className="input-field"
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ paddingRight: 40 }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 12,
              background: "none",
              border: "none",
              color: C.textDim,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
              borderRadius: 4
            }}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      ) : (
        <input
          className="input-field"
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

function Modal({ title, children, onClose, width = 600 }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="modal-content animate-modal-in"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function DataTable({ cols, rows, empty = "No records found." }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={cols.length}>
                <div className="empty-state">
                  <div className="empty-state-icon"><PackageOpen size={48} strokeWidth={1.5} /></div>
                  <div>{empty}</div>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={row.id || i} className="animate-fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                {cols.map((c) => (
                  <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value, sub, color = C.accent, icon, delay = 0 }) {
  return (
    <div className="stat-card animate-fade-in-up" style={{ animationDelay: `${delay}s`, "--stat-color": color }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value" style={{ color }}>{value}</div>
          {sub && <div className="stat-sub">{sub}</div>}
        </div>
        {icon && (
          <div className="stat-icon">{icon}</div>
        )}
      </div>
    </div>
  );
}

function Toast({ msg, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast toast-${type} animate-slide-in-right`}>
      <div className="toast-content">
        <span className="toast-icon">{type === "error" ? <X size={14} strokeWidth={3} /> : <Check size={14} strokeWidth={3} />}</span>
        <span>{msg}</span>
      </div>
      <div className="toast-progress-bar">
        <div className={`toast-progress toast-progress-${type}`} />
      </div>
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="search-wrapper">
      <span className="search-icon"><Search size={16} /></span>
      <input
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button className="search-clear" onClick={() => onChange("")}><X size={14} /></button>
      )}
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin, users, setUsers }) {
  const [activeTab, setActiveTab] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Signup form
  const [signupForm, setSignupForm] = useState({ name: "", username: "", password: "", confirmPassword: "", role: "Sales" });
  const [signupSuccess, setSignupSuccess] = useState("");

  
  const handleLogin = async () => {
    setIsLoading(true);
    setError("");

    const cleanUsername = (username || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    if (!cleanUsername || !cleanPassword) {
      setError("Please enter both username and password.");
      setTimeout(() => setError(""), 4000);
      setIsLoading(false);
      return;
    }

    const localUsers = { ...MOCK_USERS, ...(users || {}) };
    const localUser = localUsers[cleanUsername];

    // 1. Instant check against local/demo accounts & registered accounts
    if (localUser && localUser.password === cleanPassword) {
      setTimeout(() => onLogin({ username: cleanUsername, ...localUser }), 200);
      return;
    }

    // 2. Fallback to API check if not found locally
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(API_URL + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword })
      });

      if (res.ok) {
        const data = await res.json();
        setTimeout(() => onLogin(data), 200);
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data.error || "Invalid username or password");
      setTimeout(() => setError(""), 4000);
      setIsLoading(false);
    } catch (err) {
      setError("Invalid username or password");
      setTimeout(() => setError(""), 4000);
      setIsLoading(false);
    }
  };

  const handleSignup = () => {
    setError("");
    const name = (signupForm.name || "").trim();
    const cleanUsername = (signupForm.username || "").trim().toLowerCase();
    const password = (signupForm.password || "").trim();
    const confirmPassword = (signupForm.confirmPassword || "").trim();
    const role = signupForm.role || "Sales";

    if (!name || !cleanUsername || !password) {
      setError("Please fill all required fields.");
      setTimeout(() => setError(""), 4000);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setTimeout(() => setError(""), 4000);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    const localUsers = { ...MOCK_USERS, ...(users || {}) };
    if (localUsers[cleanUsername]) {
      setError("Username already exists.");
      setTimeout(() => setError(""), 4000);
      return;
    }

    const newUser = { name, username: cleanUsername, password, role };

    // Register user in local state & localStorage immediately
    setUsers((prev) => ({
      ...prev,
      [cleanUsername]: newUser
    }));

    // Async sync with API if available
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      fetch(API_URL + '/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      }).catch(() => {});
    } catch {}

    // INSTANT LOG IN AFTER SIGNUP!
    setIsLoading(true);
    setSignupSuccess(`Account created successfully! Logging you in...`);
    setTimeout(() => {
      onLogin(newUser);
    }, 600);
  };

  const quickLogin = (u) => {
    setIsLoading(true);
    const user = users[u];
    setTimeout(() => onLogin({ username: u, ...user }), 500);
  };

  return (
    <div className="login-bg">
      {/* Floating orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      <div className="login-container animate-fade-in-up">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div className="login-logo-row">
            <div className="login-logo-icon"><Waves size={24} color="#FFF" /></div>
            <span className="login-logo-text gradient-text">ClearFlow</span>
          </div>
          <p style={{ color: C.textSec, fontSize: 14, marginTop: 8 }}>
            Enterprise Operations & Distribution Portal
          </p>
        </div>

        <div className="login-card">
          {/* Tabs: Sign In / Create Account */}
          <div className="signup-tabs">
            <button
              className={`signup-tab ${activeTab === "login" ? "active" : ""}`}
              onClick={() => { setActiveTab("login"); setError(""); }}
            >
              Sign In
            </button>
            <button
              className={`signup-tab ${activeTab === "signup" ? "active" : ""}`}
              onClick={() => { setActiveTab("signup"); setError(""); }}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="login-error animate-fade-in-down">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {signupSuccess && (
            <div style={{ background: C.successSoft, color: C.success, padding: "12px 16px", borderRadius: 10, marginBottom: 18, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, border: `1px solid rgba(22,163,74,0.2)` }} className="animate-fade-in-down">
              <Check size={16} /> {signupSuccess}
            </div>
          )}

          {/* LOGIN TAB */}
          {activeTab === "login" && (
            <div className="animate-fade-in">
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <Input label="Username" value={username} onChange={setUsername} placeholder="Enter username" />
                <Input label="Password" value={password} onChange={setPassword} type="password" placeholder="Enter password" />
                <Btn
                  onClick={handleLogin}
                  size="lg"
                  disabled={isLoading}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {isLoading ? (
                    <span className="btn-spinner" />
                  ) : (
                    "Sign In →"
                  )}
                </Btn>
              </div>

            </div>
          )}

          {/* SIGNUP TAB */}
          {activeTab === "signup" && (
            <div className="animate-fade-in">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Input label="Full Name" value={signupForm.name} onChange={(v) => setSignupForm((f) => ({ ...f, name: v }))} placeholder="Enter your full name" required />
                <Input label="Username" value={signupForm.username} onChange={(v) => setSignupForm((f) => ({ ...f, username: v }))} placeholder="Choose a username" required />
                <Input label="Role" value={signupForm.role} onChange={(v) => setSignupForm((f) => ({ ...f, role: v }))} options={["Admin", "Sales", "Warehouse", "Accounts"]} />
                <Input label="Password" value={signupForm.password} onChange={(v) => setSignupForm((f) => ({ ...f, password: v }))} type="password" placeholder="Min 6 characters" required />
                <Input label="Confirm Password" value={signupForm.confirmPassword} onChange={(v) => setSignupForm((f) => ({ ...f, confirmPassword: v }))} type="password" placeholder="Re-enter password" required />
                <Btn
                  onClick={handleSignup}
                  size="lg"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Create Account →
                </Btn>
              </div>
              <div className="create-account-section">
                <span className="create-account-text">
                  Already have an account?{" "}
                  <button className="create-account-link" onClick={() => setActiveTab("login")}>
                    Sign in instead
                  </button>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ customers, products, challans, stockLog, user }) {
  const activeCustomers = customers.filter((c) => c.status === "Active").length;
  const lowStock = products.filter((p) => p.stock <= p.minStock).length;
  const confirmedChallans = challans.filter((c) => c.status === "Confirmed");
  const totalRevenue = confirmedChallans.reduce((s, c) => s + c.total, 0);
  const todayFollowUps = customers.filter((c) => c.followUp === today()).length;
  const totalInventoryValue = products.reduce((s, p) => s + p.stock * p.price, 0);

  const animatedRevenue = useAnimatedValue(totalRevenue, 1200);
  const animatedInventory = useAnimatedValue(totalInventoryValue, 1200);

  return (
    <div className="page-content">
      <div className="page-header animate-fade-in-down">
        <div>
          <h1 className="page-title">{getGreeting()}, {user.name.split(" ")[0]} <Sparkles size={24} color="#FF9D00" style={{ display: "inline", verticalAlign: "middle", marginLeft: 4 }} /></h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Total Customers" value={customers.length} sub={`${activeCustomers} active`} color={C.accent} icon={<Users size={28} opacity={0.7} />} delay={0} />
        <StatCard label="Products" value={products.length} sub={lowStock > 0 ? `${lowStock} low stock items` : "All stocked"} color={lowStock > 0 ? C.warning : C.success} icon={<Package size={28} opacity={0.7} />} delay={0.08} />
        <StatCard label="Revenue" value={fmtCurrency(animatedRevenue)} sub={`${confirmedChallans.length} confirmed challans`} color={C.success} icon={<IndianRupee size={28} opacity={0.7} />} delay={0.16} />
        <StatCard label="Inventory Value" value={fmtCurrency(animatedInventory)} sub={`${products.length} product lines`} color={C.purple} icon={<Warehouse size={28} opacity={0.7} />} delay={0.24} />
      </div>

      {/* Alerts */}
      {(lowStock > 0 || todayFollowUps > 0) && (
        <div className="alert-card animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="alert-header">
            <span className="alert-icon"><Zap size={18} fill="currentColor" /></span>
            <h3>Action Required</h3>
          </div>
          <div className="alert-body">
            {lowStock > 0 && (
              <div className="alert-item">
                <span className="alert-dot" style={{ background: C.danger }} />
                <span>{lowStock} product(s) at or below minimum stock level — reorder needed</span>
              </div>
            )}
            {todayFollowUps > 0 && (
              <div className="alert-item">
                <span className="alert-dot" style={{ background: C.warning }} />
                <span>{todayFollowUps} customer follow-up(s) scheduled for today</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Low Stock Products */}
      <div className="glass-card animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
        <h2 className="card-title">
          <TrendingDown size={20} color={C.danger} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} /> Low Stock Products
        </h2>
        {products.filter((p) => p.stock <= p.minStock).length === 0 ? (
          <p style={{ color: C.textSec, fontSize: 14 }}><Check size={14} style={{display:"inline", marginBottom:-2}} /> All products are adequately stocked.</p>
        ) : (
          <DataTable
            cols={[
              { key: "name", label: "Product" },
              { key: "sku", label: "SKU", render: (r) => <span className="mono" style={{ fontSize: 12, color: C.textSec }}>{r.sku}</span> },
              { key: "stock", label: "Current Stock", render: (r) => <span style={{ color: C.danger, fontWeight: 700 }}>{r.stock}</span> },
              { key: "minStock", label: "Min Required" },
              { key: "location", label: "Location" },
            ]}
            rows={products.filter((p) => p.stock <= p.minStock)}
          />
        )}
      </div>

      <div className="two-col-grid">
        {/* Recent Challans */}
        <div className="glass-card animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <h2 className="card-title">
            <ClipboardList size={20} style={{display:"inline"}} /> Recent Challans
          </h2>
          <DataTable
            cols={[
              { key: "number", label: "Challan #", render: (r) => <span className="mono" style={{ fontWeight: 600, color: C.accent }}>{r.number}</span> },
              { key: "customerName", label: "Customer" },
              { key: "total", label: "Amount", render: (r) => <span style={{ fontWeight: 600 }}>{fmtCurrency(r.total)}</span> },
              { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
            ]}
            rows={challans.slice(-5).reverse()}
            empty="No challans yet."
          />
        </div>

        {/* Recent Stock Movements */}
        <div className="glass-card animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
          <h2 className="card-title">
            <ArrowUpDown size={20} style={{display:"inline"}} /> Stock Movements
          </h2>
          <DataTable
            cols={[
              { key: "productName", label: "Product" },
              { key: "qty", label: "Qty", render: (r) => (
                <span style={{ color: r.type === "IN" ? C.success : C.danger, fontWeight: 700 }}>
                  {r.type === "IN" ? "+" : ""}{r.qty}
                </span>
              )},
              { key: "type", label: "Type", render: (r) => <Badge color={r.type === "IN" ? "success" : "danger"}>{r.type}</Badge> },
              { key: "by", label: "By" },
            ]}
            rows={stockLog.slice(-5).reverse()}
            empty="No movements yet."
          />
        </div>
      </div>
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
  const [statusFilter, setStatusFilter] = useState("All");

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.business.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search);
    const matchStatus = statusFilter === "All" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const emptyForm = { name: "", mobile: "", email: "", business: "", gst: "", type: "Retail", address: "", status: "Lead", followUp: "", notes: "" };

  const openAdd = () => { setForm(emptyForm); setModal("add"); };
  const openEdit = (c) => { setForm({ ...c }); setModal("edit"); };
  const openView = (c) => { setSelected(c); setFollowNote(""); setModal("view"); };

  const saveCustomer = () => {
    if (!form.name || !form.mobile) { showToast("Name and mobile are required.", "error"); return; }
    if (modal === "add") {
      setCustomers((prev) => [...prev, { ...form, id: uid() }]);
      showToast("Customer added successfully.");
    } else {
      setCustomers((prev) => prev.map((c) => (c.id === form.id ? form : c)));
      showToast("Customer updated.");
    }
    setModal(null);
  };

  const deleteCustomer = (id) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast("Customer deleted.");
    setModal(null);
  };

  const addFollowNote = () => {
    if (!followNote.trim()) return;
    const updated = { ...selected, notes: selected.notes + "\n[" + now() + "] " + followNote };
    setCustomers((prev) => prev.map((c) => (c.id === selected.id ? updated : c)));
    setSelected(updated);
    setFollowNote("");
    showToast("Follow-up note added.");
  };

  const canEdit = user.role !== "Warehouse" && user.role !== "Accounts";

  return (
    <div className="page-content">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="page-header animate-fade-in-down">
        <div>
          <h1 className="page-title">Customer CRM</h1>
          <p className="page-subtitle">{filtered.length} of {customers.length} records</p>
        </div>
        <div className="page-actions">
          <div className="filter-pills">
            {["All", "Active", "Lead", "Inactive"].map((s) => (
              <button
                key={s}
                className={`filter-pill ${statusFilter === s ? "active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, mobile…" />
          {canEdit && <Btn onClick={openAdd}>+ Add Customer</Btn>}
        </div>
      </div>

      <div className="glass-card animate-fade-in-up" style={{ padding: 0, overflow: "hidden" }}>
        <DataTable
          cols={[
            { key: "name", label: "Customer", render: (r) => (
              <div>
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: 12, color: C.textSec }}>{r.business}</div>
              </div>
            )},
            { key: "mobile", label: "Contact", render: (r) => (
              <div>
                <div className="mono" style={{ fontSize: 13 }}>{r.mobile}</div>
                <div style={{ fontSize: 12, color: C.textSec }}>{r.email}</div>
              </div>
            )},
            { key: "type", label: "Type", render: (r) => (
              <Badge color={r.type === "Wholesale" ? "purple" : r.type === "Distributor" ? "cyan" : "accent"}>
                {r.type}
              </Badge>
            )},
            { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
            { key: "followUp", label: "Follow Up", render: (r) => (
              <span style={{ fontSize: 12, color: r.followUp ? C.text : C.textDim }}>
                {r.followUp || "—"}
              </span>
            )},
            { key: "actions", label: "", render: (r) => (
              <div style={{ display: "flex", gap: 6 }}>
                <Btn size="sm" variant="ghost" onClick={() => openView(r)}>View</Btn>
                {canEdit && <Btn size="sm" variant="ghost" onClick={() => openEdit(r)}>Edit</Btn>}
              </div>
            )},
          ]}
          rows={filtered}
          empty="No customers found. Add one to get started."
        />
      </div>

      {/* Add/Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Add Customer" : "Edit Customer"} onClose={() => setModal(null)} width={620}>
          <div className="form-grid">
            <Input label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
            <Input label="Mobile" value={form.mobile} onChange={(v) => setForm((f) => ({ ...f, mobile: v }))} required />
            <Input label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} type="email" />
            <Input label="Business Name" value={form.business} onChange={(v) => setForm((f) => ({ ...f, business: v }))} />
            <Input label="GST Number" value={form.gst} onChange={(v) => setForm((f) => ({ ...f, gst: v }))} />
            <Input label="Customer Type" value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v }))} options={["Retail", "Wholesale", "Distributor"]} />
            <Input label="Status" value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} options={["Lead", "Active", "Inactive"]} />
            <Input label="Follow-up Date" value={form.followUp} onChange={(v) => setForm((f) => ({ ...f, followUp: v }))} type="date" />
            <div style={{ gridColumn: "1/-1" }}>
              <Input label="Address" value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <Input label="Notes" value={form.notes} onChange={(v) => setForm((f) => ({ ...f, notes: v }))} type="textarea" />
            </div>
          </div>
          <div className="modal-actions">
            {modal === "edit" && user.role === "Admin" && <Btn variant="danger" onClick={() => deleteCustomer(form.id)}>Delete</Btn>}
            <div style={{ flex: 1 }} />
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={saveCustomer}>{modal === "add" ? "Add Customer" : "Save Changes"}</Btn>
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {modal === "view" && selected && (
        <Modal title="Customer Profile" onClose={() => setModal(null)} width={620}>
          <div className="profile-grid">
            {[
              ["Name", selected.name],
              ["Business", selected.business],
              ["Mobile", selected.mobile],
              ["Email", selected.email || "—"],
              ["Type", <Badge color={selected.type === "Wholesale" ? "purple" : selected.type === "Distributor" ? "cyan" : "accent"}>{selected.type}</Badge>],
              ["Status", <StatusBadge status={selected.status} />],
              ["GST", selected.gst || "—"],
              ["Follow Up", selected.followUp || "—"],
              ["Address", selected.address || "—", true],
            ].map(([k, v, full]) => (
              <div key={k} style={{ gridColumn: full ? "1/-1" : undefined }}>
                <div className="profile-label">{k}</div>
                <div className="profile-value">{v}</div>
              </div>
            ))}
          </div>

          <div className="notes-section">
            <div className="profile-label">Follow-up Notes</div>
            <div className="notes-content">
              {selected.notes || "No notes yet."}
            </div>
            <div className="notes-input-row">
              <input
                className="input-field"
                value={followNote}
                onChange={(e) => setFollowNote(e.target.value)}
                placeholder="Add a follow-up note…"
                onKeyDown={(e) => e.key === "Enter" && addFollowNote()}
                style={{ flex: 1 }}
              />
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
  const [categoryFilter, setCategoryFilter] = useState("All");

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "All" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const emptyForm = { name: "", sku: "", category: "", price: "", stock: "", minStock: "", location: "" };

  const saveProduct = () => {
    if (!form.name || !form.sku || !form.price) {
      showToast("Name, SKU and price are required.", "error");
      return;
    }
    if (modal === "add") {
      setProducts((prev) => [...prev, { ...form, id: uid(), price: +form.price, stock: +form.stock || 0, minStock: +form.minStock || 0 }]);
      showToast("Product added.");
    } else {
      setProducts((prev) => prev.map((p) => (p.id === form.id ? { ...form, price: +form.price, stock: +form.stock, minStock: +form.minStock } : p)));
      showToast("Product updated.");
    }
    setModal(null);
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast("Product deleted.");
    setModal(null);
  };

  const doStockMove = () => {
    if (!stockForm.productId || !stockForm.qty || !stockForm.reason) {
      showToast("All fields required.", "error");
      return;
    }
    const qty = +stockForm.qty;
    if (qty <= 0) { showToast("Quantity must be positive.", "error"); return; }
    const product = products.find((p) => p.id === +stockForm.productId);
    if (!product) return;
    const change = stockForm.type === "IN" ? qty : -qty;
    if (product.stock + change < 0) {
      showToast("Stock cannot go negative!", "error");
      return;
    }
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stock: p.stock + change } : p)));
    setStockLog((prev) => [
      ...prev,
      {
        id: uid(),
        productId: product.id,
        productName: product.name,
        qty: change,
        type: stockForm.type,
        reason: stockForm.reason,
        by: user.name,
        ts: now(),
      },
    ]);
    setStockForm({ productId: "", qty: "", type: "IN", reason: "" });
    setModal(null);
    showToast(`Stock ${stockForm.type === "IN" ? "added" : "removed"}: ${qty} units of ${product.name}`);
  };

  const canEdit = user.role === "Admin" || user.role === "Warehouse";

  return (
    <div className="page-content">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="page-header animate-fade-in-down">
        <div>
          <h1 className="page-title">Products & Inventory</h1>
          <p className="page-subtitle">{filtered.length} products • Total value: {fmtCurrency(products.reduce((s, p) => s + p.stock * p.price, 0))}</p>
        </div>
        <div className="page-actions">
          <div className="filter-pills">
            {categories.map((c) => (
              <button
                key={c}
                className={`filter-pill ${categoryFilter === c ? "active" : ""}`}
                onClick={() => setCategoryFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder="Search product, SKU…" />
          {canEdit && <Btn variant="ghost" onClick={() => setModal("stock")}>↕ Stock Move</Btn>}
          {canEdit && <Btn onClick={() => { setForm(emptyForm); setModal("add"); }}>+ Add Product</Btn>}
        </div>
      </div>

      <div className="glass-card animate-fade-in-up" style={{ padding: 0, overflow: "hidden" }}>
        <DataTable
          cols={[
            { key: "name", label: "Product", render: (r) => (
              <div>
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                <div className="mono" style={{ fontSize: 11, color: C.textSec }}>{r.sku}</div>
              </div>
            )},
            { key: "category", label: "Category", render: (r) => <Badge color="cyan">{r.category}</Badge> },
            { key: "price", label: "Unit Price", render: (r) => <span style={{ fontWeight: 600 }}>{fmtCurrency(r.price)}</span> },
            { key: "stock", label: "Stock", render: (r) => (
              <div>
                <span style={{ fontWeight: 700, color: r.stock <= r.minStock ? C.danger : C.success }}>{r.stock}</span>
                <span style={{ fontSize: 11, color: C.textSec }}> / min {r.minStock}</span>
              </div>
            )},
            { key: "status", label: "Status", render: (r) => <StatusBadge status={r.stock <= r.minStock ? "Low" : "OK"} /> },
            { key: "location", label: "Location", render: (r) => <span style={{ fontSize: 12, color: C.textSec }}>{r.location}</span> },
            { key: "actions", label: "", render: (r) => canEdit && (
              <Btn size="sm" variant="ghost" onClick={() => { setForm({ ...r }); setModal("edit"); }}>Edit</Btn>
            )},
          ]}
          rows={filtered}
          empty="No products found."
        />
      </div>

      {/* Stock Log */}
      <div className="glass-card animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <h2 className="card-title">
          <BarChart2 size={20} style={{display:"inline"}} /> Stock Movement Log
        </h2>
        <DataTable
          cols={[
            { key: "productName", label: "Product" },
            { key: "qty", label: "Qty", render: (r) => (
              <span style={{ color: r.type === "IN" ? C.success : C.danger, fontWeight: 700 }}>
                {r.qty > 0 ? "+" : ""}{r.qty}
              </span>
            )},
            { key: "type", label: "Type", render: (r) => <Badge color={r.type === "IN" ? "success" : "danger"}>{r.type}</Badge> },
            { key: "reason", label: "Reason" },
            { key: "by", label: "By" },
            { key: "ts", label: "Time" },
          ]}
          rows={stockLog.slice().reverse()}
          empty="No stock movements recorded."
        />
      </div>

      {/* Add/Edit Product Modal */}
      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Add Product" : "Edit Product"} onClose={() => setModal(null)}>
          <div className="form-grid">
            <Input label="Product Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
            <Input label="SKU / Code" value={form.sku} onChange={(v) => setForm((f) => ({ ...f, sku: v }))} required />
            <Input label="Category" value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} placeholder="e.g. Fasteners, Pipes" />
            <Input label="Unit Price (₹)" value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} type="number" required />
            <Input label="Current Stock" value={form.stock} onChange={(v) => setForm((f) => ({ ...f, stock: v }))} type="number" />
            <Input label="Min Stock Alert" value={form.minStock} onChange={(v) => setForm((f) => ({ ...f, minStock: v }))} type="number" />
            <div style={{ gridColumn: "1/-1" }}>
              <Input label="Location / Warehouse" value={form.location} onChange={(v) => setForm((f) => ({ ...f, location: v }))} placeholder="e.g. Rack A-12, Yard B" />
            </div>
          </div>
          <div className="modal-actions">
            {modal === "edit" && user.role === "Admin" && <Btn variant="danger" onClick={() => deleteProduct(form.id)}>Delete</Btn>}
            <div style={{ flex: 1 }} />
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={saveProduct}>{modal === "add" ? "Add Product" : "Save Changes"}</Btn>
          </div>
        </Modal>
      )}

      {/* Stock Move Modal */}
      {modal === "stock" && (
        <Modal title="Stock Movement" onClose={() => setModal(null)} width={480}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input
              label="Product"
              value={stockForm.productId}
              onChange={(v) => setStockForm((f) => ({ ...f, productId: v }))}
              options={[{ value: "", label: "Select product…" }, ...products.map((p) => ({ value: p.id, label: `${p.name} (Stock: ${p.stock})` }))]}
            />
            <Input
              label="Movement Type"
              value={stockForm.type}
              onChange={(v) => setStockForm((f) => ({ ...f, type: v }))}
              options={[
                { value: "IN", label: "IN — Stock Received" },
                { value: "OUT", label: "OUT — Stock Dispatched" },
              ]}
            />
            <Input
              label="Quantity"
              value={stockForm.qty}
              onChange={(v) => setStockForm((f) => ({ ...f, qty: v }))}
              type="number"
              placeholder="Enter quantity"
            />
            <Input
              label="Reason"
              value={stockForm.reason}
              onChange={(v) => setStockForm((f) => ({ ...f, reason: v }))}
              placeholder="Purchase Order, Return, Adjustment…"
            />
          </div>
          <div className="modal-actions">
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
  const [statusFilter, setStatusFilter] = useState("All");

  const showToast = (msg, type = "success") => setToast({ msg, type });
  const resetForm = () => setForm({ customerId: "", items: [], status: "Draft" });

  const filteredChallans = challans.filter((c) => statusFilter === "All" || c.status === statusFilter);

  const pushItem = () => {
    if (!addItem.productId || !addItem.qty || +addItem.qty <= 0) {
      showToast("Select product and enter valid quantity.", "error");
      return;
    }
    const p = products.find((pr) => pr.id === +addItem.productId);
    if (!p) return;
    if (form.items.find((i) => i.productId === p.id)) {
      showToast("Product already added. Remove it first.", "error");
      return;
    }
    setForm((f) => ({
      ...f,
      items: [...f.items, { productId: p.id, name: p.name, sku: p.sku, qty: +addItem.qty, price: p.price }],
    }));
    setAddItem({ productId: "", qty: "" });
  };

  const removeItem = (pid) => setForm((f) => ({ ...f, items: f.items.filter((i) => i.productId !== pid) }));

  const totalAmount = form.items.reduce((s, i) => s + i.qty * i.price, 0);

  const saveChallan = () => {
    if (!form.customerId) { showToast("Select a customer.", "error"); return; }
    if (form.items.length === 0) { showToast("Add at least one product.", "error"); return; }
    const customer = customers.find((c) => c.id === +form.customerId);
    const challanNumber = "CH-" + String(challans.length + 1).padStart(4, "0");

    if (form.status === "Confirmed") {
      for (const item of form.items) {
        const p = products.find((pr) => pr.id === item.productId);
        if (!p || p.stock < item.qty) {
          showToast(`Insufficient stock for ${item.name}. Available: ${p?.stock ?? 0}`, "error");
          return;
        }
      }
      setProducts((prev) => prev.map((p) => {
        const item = form.items.find((i) => i.productId === p.id);
        return item ? { ...p, stock: p.stock - item.qty } : p;
      }));
      setStockLog((prev) => [
        ...prev,
        ...form.items.map((i) => ({
          id: uid(),
          productId: i.productId,
          productName: i.name,
          qty: -i.qty,
          type: "OUT",
          reason: `Challan ${challanNumber}`,
          by: user.name,
          ts: now(),
        })),
      ]);
    }

    const challan = {
      id: uid(),
      number: challanNumber,
      customerId: customer.id,
      customerName: customer.name,
      items: form.items,
      total: totalAmount,
      status: form.status,
      by: user.name,
      date: today(),
    };
    setChallans((prev) => [...prev, challan]);
    showToast(`Challan ${challan.number} ${form.status === "Confirmed" ? "confirmed" : "saved as draft"}.`);
    setModal(null);
    resetForm();
  };

  const confirmDraft = (c) => {
    for (const item of c.items) {
      const p = products.find((pr) => pr.id === item.productId);
      if (!p || p.stock < item.qty) {
        showToast(`Insufficient stock for ${item.name}!`, "error");
        return;
      }
    }
    setProducts((prev) => prev.map((p) => {
      const item = c.items.find((i) => i.productId === p.id);
      return item ? { ...p, stock: p.stock - item.qty } : p;
    }));
    setStockLog((prev) => [
      ...prev,
      ...c.items.map((i) => ({
        id: uid(),
        productId: i.productId,
        productName: i.name,
        qty: -i.qty,
        type: "OUT",
        reason: c.number,
        by: user.name,
        ts: now(),
      })),
    ]);
    setChallans((prev) => prev.map((ch) => (ch.id === c.id ? { ...ch, status: "Confirmed" } : ch)));
    showToast(`${c.number} confirmed — stock deducted.`);
    setViewChallan(null);
  };

  const cancelChallan = (c) => {
    setChallans((prev) => prev.map((ch) => (ch.id === c.id ? { ...ch, status: "Cancelled" } : ch)));
    showToast(`${c.number} cancelled.`, "error");
    setViewChallan(null);
  };

  const canCreate = user.role === "Admin" || user.role === "Sales";

  return (
    <div className="page-content">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="page-header animate-fade-in-down">
        <div>
          <h1 className="page-title">Sales Challans</h1>
          <p className="page-subtitle">{filteredChallans.length} of {challans.length} total</p>
        </div>
        <div className="page-actions">
          <div className="filter-pills">
            {["All", "Draft", "Confirmed", "Cancelled"].map((s) => (
              <button
                key={s}
                className={`filter-pill ${statusFilter === s ? "active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
          {canCreate && <Btn onClick={() => { resetForm(); setModal("create"); }}>+ New Challan</Btn>}
        </div>
      </div>

      <div className="glass-card animate-fade-in-up" style={{ padding: 0, overflow: "hidden" }}>
        <DataTable
          cols={[
            { key: "number", label: "Challan #", render: (r) => <span className="mono" style={{ fontWeight: 700, color: C.accent }}>{r.number}</span> },
            { key: "customerName", label: "Customer" },
            { key: "items", label: "Items", render: (r) => `${r.items.length} item(s)` },
            { key: "total", label: "Total", render: (r) => <span style={{ fontWeight: 700 }}>{fmtCurrency(r.total)}</span> },
            { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
            { key: "by", label: "Created By" },
            { key: "date", label: "Date" },
            { key: "actions", label: "", render: (r) => <Btn size="sm" variant="ghost" onClick={() => setViewChallan(r)}>View</Btn> },
          ]}
          rows={filteredChallans.slice().reverse()}
          empty="No challans yet."
        />
      </div>

      {/* Create Challan Modal */}
      {modal === "create" && (
        <Modal title="New Sales Challan" onClose={() => setModal(null)} width={720}>
          <div className="form-grid" style={{ marginBottom: 20 }}>
            <Input
              label="Customer"
              value={form.customerId}
              onChange={(v) => setForm((f) => ({ ...f, customerId: v }))}
              options={[
                { value: "", label: "Select customer…" },
                ...customers.filter((c) => c.status === "Active").map((c) => ({
                  value: c.id,
                  label: c.name + " — " + c.business,
                })),
              ]}
            />
            <Input
              label="Challan Status"
              value={form.status}
              onChange={(v) => setForm((f) => ({ ...f, status: v }))}
              options={["Draft", "Confirmed"]}
            />
          </div>

          <div className="challan-add-section">
            <h3 className="challan-section-title">Add Products</h3>
            <div className="challan-add-row">
              <div style={{ flex: 2, minWidth: 200 }}>
                <Input
                  value={addItem.productId}
                  onChange={(v) => setAddItem((f) => ({ ...f, productId: v }))}
                  options={[
                    { value: "", label: "Select product…" },
                    ...products.map((p) => ({
                      value: p.id,
                      label: `${p.name} (Stock: ${p.stock}) — ${fmtCurrency(p.price)}`,
                    })),
                  ]}
                />
              </div>
              <div style={{ width: 100 }}>
                <Input
                  value={addItem.qty}
                  onChange={(v) => setAddItem((f) => ({ ...f, qty: v }))}
                  type="number"
                  placeholder="Qty"
                />
              </div>
              <Btn onClick={pushItem} style={{ alignSelf: "flex-end" }}>Add</Btn>
            </div>
          </div>

          {form.items.length > 0 && (
            <div className="challan-items-table">
              <table className="data-table">
                <thead>
                  <tr>
                    {["Product", "SKU", "Qty", "Unit Price", "Total", ""].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item) => (
                    <tr key={item.productId}>
                      <td>{item.name}</td>
                      <td><span className="mono" style={{ fontSize: 11, color: C.textSec }}>{item.sku}</span></td>
                      <td style={{ fontWeight: 700 }}>{item.qty}</td>
                      <td>{fmtCurrency(item.price)}</td>
                      <td style={{ fontWeight: 700 }}>{fmtCurrency(item.qty * item.price)}</td>
                      <td>
                        <button className="remove-item-btn" onClick={() => removeItem(item.productId)}><X size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} style={{ textAlign: "right", fontWeight: 600, color: C.textSec }}>Grand Total:</td>
                    <td style={{ fontWeight: 800, fontSize: 18, color: C.accent }}>{fmtCurrency(totalAmount)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {form.status === "Confirmed" && (
            <div className="challan-warning animate-fade-in">
              <AlertTriangle size={16} style={{display:"inline", marginBottom:-3}} /> Confirming will immediately deduct stock. This action cannot be undone.
            </div>
          )}

          <div className="modal-actions">
            <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={saveChallan}>
              {form.status === "Confirmed" ? "Confirm & Save" : "Save as Draft"}
            </Btn>
          </div>
        </Modal>
      )}

      {/* View Challan Modal */}
      {viewChallan && (
        <Modal title={`Challan ${viewChallan.number}`} onClose={() => setViewChallan(null)} width={640}>
          <div className="profile-grid" style={{ marginBottom: 20 }}>
            {[
              ["Customer", viewChallan.customerName],
              ["Status", <StatusBadge status={viewChallan.status} />],
              ["Created By", viewChallan.by],
              ["Date", viewChallan.date],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="profile-label">{k}</div>
                <div className="profile-value">{v}</div>
              </div>
            ))}
          </div>

          <table className="data-table" style={{ marginBottom: 16 }}>
            <thead>
              <tr>
                {["Product", "SKU", "Qty", "Unit Price", "Total"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {viewChallan.items.map((i) => (
                <tr key={i.productId}>
                  <td>{i.name}</td>
                  <td><span className="mono" style={{ fontSize: 11, color: C.textSec }}>{i.sku}</span></td>
                  <td style={{ fontWeight: 700 }}>{i.qty}</td>
                  <td>{fmtCurrency(i.price)}</td>
                  <td style={{ fontWeight: 700 }}>{fmtCurrency(i.qty * i.price)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ textAlign: "right", fontWeight: 600, color: C.textSec }}>Total:</td>
                <td style={{ fontWeight: 800, fontSize: 18, color: C.accent }}>{fmtCurrency(viewChallan.total)}</td>
              </tr>
            </tfoot>
          </table>

          {canCreate && viewChallan.status === "Draft" && (
            <div className="modal-actions">
              <Btn variant="danger" onClick={() => cancelChallan(viewChallan)}>Cancel Challan</Btn>
              <div style={{ flex: 1 }} />
              <Btn variant="success" onClick={() => confirmDraft(viewChallan)}><Check size={16} /> Confirm Challan</Btn>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ─── REPORTS ──────────────────────────────────────────────────────────────────
function Reports({ customers, products, challans, stockLog }) {
  const confirmedChallans = challans.filter((c) => c.status === "Confirmed");
  const totalRevenue = confirmedChallans.reduce((s, c) => s + c.total, 0);
  const productSales = {};
  confirmedChallans.forEach((c) =>
    c.items.forEach((i) => {
      productSales[i.name] = (productSales[i.name] || 0) + i.qty * i.price;
    })
  );
  const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const totalInventoryValue = products.reduce((s, p) => s + p.stock * p.price, 0);
  const maxProductValue = Math.max(...products.map((p) => p.stock * p.price), 1);

  const animatedRevenue = useAnimatedValue(totalRevenue, 1200);

  return (
    <div className="page-content">
      <div className="page-header animate-fade-in-down">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Business intelligence at a glance</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Total Revenue" value={fmtCurrency(animatedRevenue)} color={C.success} icon={<IndianRupee size={28} opacity={0.7} />} delay={0} />
        <StatCard label="Active Customers" value={customers.filter((c) => c.status === "Active").length} color={C.accent} icon={<Users size={28} opacity={0.7} />} delay={0.08} />
        <StatCard label="Confirmed Challans" value={confirmedChallans.length} color={C.purple} icon={<Check size={28} opacity={0.7} />} delay={0.16} />
        <StatCard label="Low Stock Items" value={products.filter((p) => p.stock <= p.minStock).length} color={C.warning} icon={<AlertTriangle size={28} opacity={0.7} />} delay={0.24} />
      </div>

      <div className="two-col-grid">
        <div className="glass-card animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <h2 className="card-title"><Users size={20} style={{display:"inline"}} /> Customer Breakdown</h2>
          {["Retail", "Wholesale", "Distributor"].map((type) => {
            const count = customers.filter((c) => c.type === type).length;
            const pct = customers.length ? Math.round((count / customers.length) * 100) : 0;
            const colors = { Retail: C.accent, Wholesale: C.purple, Distributor: C.cyan };
            return (
              <div key={type} className="progress-item">
                <div className="progress-header">
                  <span className="progress-label">{type}</span>
                  <span className="progress-value">{count} ({pct}%)</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: pct + "%", background: colors[type] }}
                  />
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textSec, marginBottom: 12 }}>Status Distribution</h3>
            {["Active", "Lead", "Inactive"].map((status) => {
              const count = customers.filter((c) => c.status === status).length;
              const pct = customers.length ? Math.round((count / customers.length) * 100) : 0;
              const colors = { Active: C.success, Lead: C.warning, Inactive: C.danger };
              return (
                <div key={status} className="progress-item">
                  <div className="progress-header">
                    <span className="progress-label">{status}</span>
                    <span className="progress-value">{count} ({pct}%)</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: pct + "%", background: colors[status] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card animate-fade-in-up" style={{ animationDelay: "0.35s" }}>
          <h2 className="card-title"><Award size={20} color={C.accent} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} /> Top Selling Products</h2>
          {topProducts.length === 0 ? (
            <p style={{ color: C.textSec, fontSize: 14 }}>No sales data yet.</p>
          ) : (
            topProducts.map(([name, rev], i) => (
              <div key={name} className="top-product-item">
                <span className="top-product-rank">#{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div className="top-product-name">{name}</div>
                  <div className="top-product-revenue">{fmtCurrency(rev)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Challan Status */}
      <div className="glass-card animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
        <h2 className="card-title"><ClipboardList size={20} style={{display:"inline"}} /> Challan Status Summary</h2>
        <div className="challan-status-grid">
          {["Draft", "Confirmed", "Cancelled"].map((s) => {
            const count = challans.filter((c) => c.status === s).length;
            const colors = { Draft: C.cyan, Confirmed: C.success, Cancelled: C.danger };
            const statusIcons = {
              Draft: <FileText size={24} color={C.cyan} />,
              Confirmed: <CheckCircle2 size={24} color={C.success} />,
              Cancelled: <XCircle size={24} color={C.danger} />
            };
            return (
              <div key={s} className="challan-status-card">
                <div className="challan-status-icon" style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>{statusIcons[s]}</div>
                <div className="challan-status-count" style={{ color: colors[s] }}>{count}</div>
                <div className="challan-status-label">{s}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory Valuation */}
      <div className="glass-card animate-fade-in-up" style={{ animationDelay: "0.45s" }}>
        <h2 className="card-title"><Warehouse size={20} color={C.purple} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} /> Inventory Valuation</h2>
        <DataTable
          cols={[
            { key: "name", label: "Product" },
            { key: "stock", label: "Stock", render: (r) => <span style={{ fontWeight: 700 }}>{r.stock}</span> },
            { key: "price", label: "Unit Price", render: (r) => fmtCurrency(r.price) },
            { key: "value", label: "Total Value", render: (r) => (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontWeight: 700, color: C.accent, minWidth: 90 }}>{fmtCurrency(r.stock * r.price)}</span>
                <div className="progress-track" style={{ flex: 1 }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: Math.round((r.stock * r.price) / maxProductValue * 100) + "%",
                      background: C.accent,
                    }}
                  />
                </div>
              </div>
            )},
          ]}
          rows={products}
        />
        <div className="inventory-total">
          <span>Total Inventory Value:</span>
          <span className="inventory-total-value">{fmtCurrency(totalInventoryValue)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR NAV ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} />, roles: ["Admin", "Sales", "Warehouse", "Accounts"] },
  { id: "customers", label: "Customers", icon: <Users size={18} />, roles: ["Admin", "Sales", "Accounts"] },
  { id: "products", label: "Products", icon: <Package size={18} />, roles: ["Admin", "Sales", "Warehouse", "Accounts"] },
  { id: "challans", label: "Challans", icon: <ClipboardList size={18} />, roles: ["Admin", "Sales", "Warehouse", "Accounts"] },
  { id: "reports", label: "Reports", icon: <BarChart2 size={18} />, roles: ["Admin", "Accounts"] },
];

function Sidebar({ active, setActive, user, onLogout, collapsed, setCollapsed }) {
  const allowed = NAV_ITEMS.filter((n) => n.roles.includes(user.role));

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div className="sidebar-overlay" onClick={() => setCollapsed(true)} />
      )}
      <div className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="sidebar-logo-row">
            <div className="sidebar-logo-icon"><Waves size={20} color="#FFF" /></div>
            <div className="sidebar-logo-text">
              <div className="gradient-text" style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>ClearFlow</div>
              <div style={{ fontSize: 11, color: C.textSec }}>Operations Portal</div>
            </div>
          </div>
          <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* User */}
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user.name[0]}
          </div>
          <div className="sidebar-user-info">
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{user.name}</div>
            <Badge color="accent">{user.role}</Badge>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {allowed.map((item) => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${active === item.id ? "active" : ""}`}
              onClick={() => { setActive(item.id); setCollapsed(true); }}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
              {active === item.id && <span className="sidebar-active-dot" />}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <button className="sidebar-nav-item logout-btn" onClick={onLogout}>
            <span className="sidebar-nav-icon"><LogOut size={18} /></span>
            <span className="sidebar-nav-label">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);
  const [pageKey, setPageKey] = useState(0);

  // Load persisted data or use defaults
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [stockLog, setStockLog] = useState([]);
  const [challans, setChallans] = useState([]);
  const [users, setUsers] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarCollapsed(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch(API_URL + '/customers').then(r => r.json()),
      fetch(API_URL + '/products').then(r => r.json()),
      fetch(API_URL + '/challans').then(r => r.json()),
      fetch(API_URL + '/stocklogs').then(r => r.json()),
      fetch(API_URL + '/users').then(r => r.json())
    ]).then(([c, p, ch, sl, u]) => {
      setCustomers(c.length ? c : DEFAULT_CUSTOMERS);
      setProducts(p.length ? p : DEFAULT_PRODUCTS);
      setChallans(ch.length ? ch : DEFAULT_CHALLANS);
      setStockLog(sl.length ? sl : DEFAULT_STOCK_LOG);
      
      const usersMap = {};
      if (u && u.length) {
        u.forEach(user => usersMap[user.username.toLowerCase()] = user);
      } else {
        Object.assign(usersMap, MOCK_USERS);
      }
      setUsers(usersMap);
      setIsLoaded(true);
    }).catch(err => {
      console.error("API Error, falling back to local storage", err);
      const saved = loadData();
      setCustomers(saved?.customers || DEFAULT_CUSTOMERS);
      setProducts(saved?.products || DEFAULT_PRODUCTS);
      setStockLog(saved?.stockLog || DEFAULT_STOCK_LOG);
      setChallans(saved?.challans || DEFAULT_CHALLANS);
      setUsers(saved?.users || MOCK_USERS);
      setIsLoaded(true);
    });
  }, []);

  // Persist locally as backup
  useEffect(() => {
    if (isLoaded) saveData({ customers, products, stockLog, challans, users });
  }, [customers, products, stockLog, challans, users, isLoaded]);

  if (!isLoaded) return <div style={{display:'flex', height:'100vh', alignItems:'center', justifyContent:'center'}}>Loading...</div>;


  // Animate page transitions
  const handlePageChange = (page) => {
    setActive(page);
    setPageKey((k) => k + 1);
  };

  if (!user) {
    return <LoginPage onLogin={(u) => { setUser(u); setActive("dashboard"); setPageKey((k) => k + 1); }} users={users} setUsers={setUsers} />;
  }

  const pages = {
    dashboard: <Dashboard customers={customers} products={products} challans={challans} stockLog={stockLog} user={user} />,
    customers: <Customers customers={customers} setCustomers={setCustomers} user={user} />,
    products: <Products products={products} setProducts={setProducts} stockLog={stockLog} setStockLog={setStockLog} user={user} />,
    challans: <Challans challans={challans} setChallans={setChallans} customers={customers} products={products} setProducts={setProducts} setStockLog={setStockLog} user={user} />,
    reports: <Reports customers={customers} products={products} challans={challans} stockLog={stockLog} />,
  };

  return (
    <div className="app-layout">
      <Sidebar
        active={active}
        setActive={handlePageChange}
        user={user}
        onLogout={() => setUser(null)}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <main className="main-content" key={pageKey}>
        {/* Mobile header */}
        <div className="mobile-header">
          <button className="mobile-menu-btn" onClick={() => setSidebarCollapsed(false)}><Menu size={20} /></button>
          <span className="gradient-text" style={{ fontSize: 18, fontWeight: 800 }}>ClearFlow</span>
          <div style={{ width: 36 }} />
        </div>
        <div className="main-content-inner animate-fade-in">
          {pages[active] || pages.dashboard}
        </div>
      </main>
    </div>
  );
}
