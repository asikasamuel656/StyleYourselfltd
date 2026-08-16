import { useAdminAuth } from "../components/useAdminAuth.js";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection, addDoc, updateDoc, deleteDoc, doc, getDoc,
  onSnapshot, query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase.js";
import StyleYourself from "../../assets/StyleYourself.jpg"
// ── Cloudinary config ──
const CLOUDINARY_CLOUD_NAME = "gyi1abfr";
const CLOUDINARY_UPLOAD_PRESET = "products";

// Uploads a File to Cloudinary using the unsigned preset and returns
// { url, publicId }. Safe to call directly from the browser — no secret
// key involved, since the preset is unsigned.
async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cloudinary upload failed: ${errText}`);
  }

  const data = await res.json();
  return { url: data.secure_url, publicId: data.public_id };
}
import { ADMIN_EMAIL } from "../config/adminConfig";
import { FaBoxOpen, FaClipboard, FaClipboardList, FaExclamationTriangle, FaHourglassHalf, FaMoneyBillWave, FaRegClipboard, FaShoppingBag, FaShoppingCart, FaTrophy, FaWallet, FaSignOutAlt } from "react-icons/fa";


// ── CONSTANTS ──
const mockProducts = [
  { id: 1, name: "Silk Wrap Dress", price: 89.99, stock: 4, image: "👗", sales: 142, category: "Women's Wear" },
  { id: 2, name: "Linen Blazer", price: 129.99, stock: 18, image: "🧥", sales: 98, category: "Men's Wear" },
  { id: 3, name: "Gold Hoop Earrings", price: 45.00, stock: 3, image: "💛", sales: 211, category: "Accessories" },
  { id: 4, name: "Strappy Heels", price: 74.99, stock: 0, image: "👠", sales: 55, category: "Footwear" },
  { id: 5, name: "Crossbody Bag", price: 34.99, stock: 22, image: "👜", sales: 76, category: "Accessories" },
  { id: 6, name: "Vintage Shirt", price: 59.99, stock: 7, image: "👔", sales: 134, category: "Men's Wear" },
];

const LOW_STOCK = 5;

// ── ORDER STATUS SYSTEMS ──
// Fulfillment can only move forward one step at a time (or to Cancelled,
// but only before Dispatched). The dropdown only ever offers valid next
// steps — that's what makes invalid jumps (e.g. Pending → Delivered)
// structurally impossible rather than just "discouraged."
const FULFILLMENT_STEPS = ["Pending", "Confirmed", "Processing", "Packed", "Dispatched", "Delivered"];

function getFulfillmentOptions(current, paymentStatus) {
  if (current === "Cancelled" || current === "Delivered") return [current]; // terminal states
  const idx = FULFILLMENT_STEPS.indexOf(current);
  const options = [current];
  if (idx >= 0 && idx < FULFILLMENT_STEPS.length - 1) {
    const next = FULFILLMENT_STEPS[idx + 1];
    // Delivered is withheld until payment is actually confirmed — for COD,
    // every earlier step (including Dispatched) still proceeds normally
    // with payment Pending, since the courier collects cash on arrival.
    if (next !== "Delivered" || paymentStatus === "Paid") {
      options.push(next);
    }
  }
  if (idx >= 0 && idx < FULFILLMENT_STEPS.indexOf("Dispatched")) options.push("Cancelled");
  return options;
}

const PAYMENT_STEPS = ["Pending", "Paid", "Failed", "Refunded", "Partially Refunded"];

const PAYMENT_BADGE = {
  "Pending": { bg: "#F1F5F9", color: "#64748B" },
  "Paid": { bg: "#D1FAE5", color: "#065F46" },
  "Failed": { bg: "#FEE2E2", color: "#991B1B" },
  "Refunded": { bg: "#EDE9FE", color: "#5B21B6" },
  "Partially Refunded": { bg: "#EDE9FE", color: "#5B21B6" },
};

const FULFILLMENT_BADGE = {
  "Pending": { bg: "#FFEDD5", color: "#9A3412" },
  "Confirmed": { bg: "#FEF3C7", color: "#92400E" },
  "Processing": { bg: "#DBEAFE", color: "#1E40AF" },
  "Packed": { bg: "#E0E7FF", color: "#3730A3" },
  "Dispatched": { bg: "#E0F2FE", color: "#075985" },
  "Delivered": { bg: "#D1FAE5", color: "#065F46" },
  "Cancelled": { bg: "#FEE2E2", color: "#991B1B" },
};

const INVENTORY_BADGE = {
  "Not Reserved": { bg: "#F1F5F9", color: "#64748B" },
  "Reserved": { bg: "#FFEDD5", color: "#9A3412" },
  "Deducted": { bg: "#D1FAE5", color: "#065F46" },
  "Restored": { bg: "#DBEAFE", color: "#1E40AF" },
};

function StatusBadge({ label, map }) {
  const style = map[label] || { bg: "#F1F5F9", color: "#64748B" };
  return (
    <span style={{
      background: style.bg, color: style.color,
      fontSize: 10, fontWeight: 700, padding: "3px 9px",
      borderRadius: 99, whiteSpace: "nowrap", display: "inline-block",
    }}>{label || "—"}</span>
  );
}

// Firestore Timestamps need .toDate() — this handles both that and a
// plain ISO string, so it never crashes regardless of which shape it gets.
function formatOrderDate(ts) {
  if (!ts) return "—";
  const d = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function orderItemsSummary(items) {
  if (!items || items.length === 0) return "—";
  const first = items[0].name;
  return items.length > 1 ? `${first} +${items.length - 1} more` : first;
}

function orderItemsQty(items) {
  return (items || []).reduce((s, i) => s + (i.quantity || 1), 0);
}

// ── REAL ANALYTICS (computed from actual orders, not fake product.sales) ──
//
// Only counts Delivered orders — the one status that's locked, complete,
// and can't change anymore. A Pending or Processing order could still be
// cancelled, so it deliberately doesn't count as a "sale" yet. This keeps
// Sales, Best Seller, and Revenue by Product on the same basis as Total
// Revenue (which already only counted Delivered orders).
//
// Uses the frozen name/image/price stored on each order's item snapshot,
// not the live products collection — so this stays accurate even if a
// product's price changes or the product is deleted later.
function computeSalesStats(orders) {
  const map = {};
  let totalUnitsSold = 0;

  orders.forEach((o) => {
    if (o.fulfillment?.status !== "Delivered") return;
    (o.items || []).forEach((item) => {
      const key = item.productId || item.name;
      if (!map[key]) {
        map[key] = { productId: item.productId, name: item.name, image: item.image, unitsSold: 0, revenue: 0 };
      }
      const qty = item.quantity || 1;
      map[key].unitsSold += qty;
      map[key].revenue += (Number(item.price) || 0) * qty;
      totalUnitsSold += qty;
    });
  });

  const revenueByProduct = Object.values(map).sort((a, b) => b.revenue - a.revenue);
  const bestSeller = revenueByProduct.length
    ? [...revenueByProduct].sort((a, b) => b.unitsSold - a.unitsSold)[0]
    : null;

  return { bestSeller, totalUnitsSold, revenueByProduct };
}

// Buckets Delivered orders into the last N weeks by real createdAt
// timestamps, summing orderTotal per week — same Delivered-only basis as
// computeSalesStats, so the trend chart and Revenue by Product always agree.
function computeSalesTrend(orders, periods = 8) {
  const now = new Date();
  const buckets = Array.from({ length: periods }, (_, i) => ({
    label: i === periods - 1 ? "This wk" : `${periods - 1 - i}w ago`,
    value: 0,
  }));

  orders.forEach((o) => {
    if (o.fulfillment?.status !== "Delivered") return;
    const ts = o.createdAt;
    const d = ts && typeof ts.toDate === "function" ? ts.toDate() : (ts ? new Date(ts) : null);
    if (!d || isNaN(d)) return;
    const weeksAgo = Math.floor((now - d) / (7 * 24 * 60 * 60 * 1000));
    const idx = periods - 1 - weeksAgo;
    if (idx >= 0 && idx < periods) buckets[idx].value += Number(o.orderTotal || 0);
  });

  return buckets;
}

// Matches a product against a free-text search term across name, brand,
// category, colors, and price — so admins can find a product among
// hundreds/thousands without needing to know the exact name.
function matchesProductSearch(product, term) {
  if (!term.trim()) return true;
  const t = term.trim().toLowerCase();
  if (product.name?.toLowerCase().includes(t)) return true;
  if (product.brand?.toLowerCase().includes(t)) return true;
  if (product.category?.toLowerCase().includes(t)) return true;
  if (Array.isArray(product.colors) && product.colors.some(c => c.toLowerCase().includes(t))) return true;
  if (String(product.price ?? "").includes(t)) return true;
  return false;
}

// Compares a product's state before and after an edit, returning a short
// human-readable list of exactly what changed (e.g. "Price: ₦20,000 → ₦18,000").
function buildEditDiff(before, after) {
  const changes = [];
  const num = (v) => Number(v) || 0;
  const arr = (v) => (Array.isArray(v) ? v.slice().sort().join(", ") : "");

  if ((before.name || "") !== (after.name || "")) changes.push(`Name: "${before.name}" → "${after.name}"`);
  if ((before.brand || "") !== (after.brand || "")) changes.push(`Brand updated`);
  if ((before.category || "") !== (after.category || "")) changes.push(`Category: ${before.category} → ${after.category}`);
  if (num(before.price) !== num(after.price)) changes.push(`Price: ₦${num(before.price).toLocaleString()} → ₦${num(after.price).toLocaleString()}`);
  if (num(before.oldPrice) !== num(after.oldPrice)) changes.push(`Old Price updated`);
  if (num(before.stock) !== num(after.stock)) changes.push(`Stock: ${num(before.stock)} → ${num(after.stock)}`);
  if (arr(before.colors) !== arr(after.colors)) changes.push(`Colors updated`);
  if (arr(before.sizes) !== arr(after.sizes)) changes.push(`Sizes updated`);
  if (Boolean(before.featured) !== Boolean(after.featured)) changes.push(`Featured: ${after.featured ? "Yes" : "No"}`);
  if (Boolean(before.bestSeller) !== Boolean(after.bestSeller)) changes.push(`Best Seller: ${after.bestSeller ? "Yes" : "No"}`);
  if (Boolean(before.newArrival) !== Boolean(after.newArrival)) changes.push(`New Arrival: ${after.newArrival ? "Yes" : "No"}`);
  if ((before.image || "") !== (after.image || "")) changes.push(`Image updated`);
  if ((before.description || "") !== (after.description || "")) changes.push(`Description updated`);

  return changes;
}

// Formats a Date as a short relative time string for the notification list.
function timeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// Formats currency for stat cards so huge revenue numbers never overflow the card.
// e.g. 950 -> "$950.00", 12500 -> "₦12.5K", 3200000 -> "₦3.2M"
function formatMoney(value, symbol = "₦") {
  const n = Number(value) || 0;
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${symbol}${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `${symbol}${(n / 1_000).toFixed(1)}K`;
  return `${symbol}${n.toFixed(2)}`;
}

// ── THEME TOKENS ──
const DARK = {
  bg: "#0F172A",
  surface: "#1E293B",
  surfaceHover: "#263548",
  border: "#334155",
  text: "#F1F5F9",
  muted: "#94A3B8",
  sub: "#64748B",
  input: "#0F172A",
  inputBorder: "#334155",
  cardShadow: "0 4px 24px rgba(0,0,0,0.4)",
  navActive: "rgba(245,158,11,0.12)",
};
const LIGHT = {
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceHover: "#F8FAFC",
  border: "#E2E8F0",
  text: "#0F172A",
  muted: "#64748B",
  sub: "#94A3B8",
  input: "#F8FAFC",
  inputBorder: "#CBD5E1",
  cardShadow: "0 4px 24px rgba(0,0,0,0.06)",
  navActive: "#FEF3C7",
};

const GOLD = "#F59E0B";
const GOLD_DARK = "#D97706";
const GOLD_LIGHT = "#FEF3C7";

// ── REUSABLE STYLE FACTORIES ──
const makeBtn = (T) => ({
  primary: {
    padding: "9px 20px", borderRadius: 9, border: "none", cursor: "pointer",
    background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
    color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: "0.02em",
    boxShadow: `0 2px 14px ${GOLD}44`, transition: "all 0.2s",
    fontFamily: "inherit",
  },
  ghost: {
    padding: "8px 16px", borderRadius: 9, border: `1px solid ${T.border}`,
    cursor: "pointer", background: "transparent", color: T.muted,
    fontSize: 12, fontWeight: 600, transition: "all 0.15s", fontFamily: "inherit",
  },
  danger: {
    padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer",
    background: "#FEE2E2", color: "#DC2626", fontSize: 12, fontWeight: 600,
    transition: "all 0.15s", fontFamily: "inherit",
  },
  edit: {
    padding: "7px 14px", borderRadius: 8, border: `1px solid ${T.border}`,
    cursor: "pointer", background: T.surface, color: T.muted,
    fontSize: 12, fontWeight: 600, marginRight: 6, transition: "all 0.15s",
    fontFamily: "inherit",
  },
});

const makeInput = (T) => ({
  width: "100%", background: T.input, border: `1.5px solid ${T.inputBorder}`,
  borderRadius: 9, padding: "10px 13px", color: T.text, fontSize: 13,
  marginTop: 5, marginBottom: 14, boxSizing: "border-box",
  fontFamily: "inherit", outline: "none", transition: "border-color 0.2s",
});

// ── STAT CARD ──
function StatCard({ label, value, meta, accent, icon, trend, T, isMobile }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: isMobile ? "18px 16px" : "22px 20px",
        position: "relative",
        overflow: "hidden",
        boxShadow: hovered ? `0 8px 32px ${accent}22` : T.cardShadow,
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
        cursor: "default",
      }}
    >
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${accent}, ${accent}66)`,
        borderRadius: "16px 16px 0 0",
      }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{
            fontSize: 10, color: T.muted, textTransform: "uppercase",
            letterSpacing: "0.12em", fontWeight: 600, marginBottom: 10,
          }}>{label}</div>
          <div style={{
            fontSize: String(value).length > 12 ? 15 : String(value).length > 8 ? 18 : 21,
            fontWeight: 800, color: T.text, lineHeight: 1.1, letterSpacing: "-0.5px",
            wordBreak: "break-word",
          }}>{value}</div>
          <div style={{ fontSize: 11, color: T.sub, marginTop: 5 }}>{meta}</div>
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 12, display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: 22,
          background: `${accent}15`, flexShrink: 0,
        }}>{icon}</div>
      </div>
      {trend && (
        <div style={{
          marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: trend.positive ? "#10B981" : "#EF4444",
          }}>{trend.positive ? "▲" : "▼"} {trend.value}</span>
          <span style={{ fontSize: 11, color: T.sub }}>{trend.label}</span>
        </div>
      )}
    </div>
  );
}

// ── MINI SPARKLINE (pure CSS/SVG) ──
function Sparkline({ data, color }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80, h = 30;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

// ── HORIZONTAL BAR ──
function StockBar({ value, max = 30, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ height: 5, background: "#E2E8F0", borderRadius: 99, overflow: "hidden", width: "100%", minWidth: 60 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.4s" }} />
    </div>
  );
}

// ── FLAG BADGE (Featured / Best Seller / New Arrival) ──
function FlagBadge({ active }) {
  return active ? (
    <span style={{
      background: "#D1FAE5", color: "#065F46", fontSize: 10, fontWeight: 700,
      padding: "2px 8px", borderRadius: 99,
    }}>Yes</span>
  ) : (
    <span style={{
      background: "#F1F5F9", color: "#94A3B8", fontSize: 10, fontWeight: 600,
      padding: "2px 8px", borderRadius: 99,
    }}>No</span>
  );
}

// ── TOAST ──
function Toast({ toast }) {
  if (!toast) return null;
  const isSuccess = toast.type === "success";
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 200,
      background: isSuccess ? "#10B981" : "#EF4444",
      color: "#fff", padding: "12px 18px", borderRadius: 12,
      fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
      display: "flex", alignItems: "center", gap: 8,
      animation: "fadeUp 0.25s ease both",
      maxWidth: 320,
    }}>
      <span>{isSuccess ? "✓" : "⚠"}</span>
      {toast.message}
    </div>
  );
}

// ── MAIN COMPONENT ──
export default function AdminDashboard() {
  const { status, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState("overview");
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [dispatchTarget, setDispatchTarget] = useState(null);
  const [dispatching, setDispatching] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editOriginal, setEditOriginal] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success" | "error", message }
  const [activityLog, setActivityLog] = useState([]); // { id, message, time }
  const [orderFilter, setOrderFilter] = useState("all");
  const [now, setNow] = useState(new Date());
  const [showNotif, setShowNotif] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "", brand: "", price: "", oldPrice: "", stock: "", image: "👗",
    category: "", sizes: [], colors: "", description: "",
    featured: false, bestSeller: false, newArrival: false,
    imagePreview: null, imageFile: null,
    addLoading: false, addErrors: {},
  });

  function showToast(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  function pushActivity(message) {
    setActivityLog(prev => [{ id: `${Date.now()}-${Math.random()}`, message, time: new Date() }, ...prev].slice(0, 30));
  }

  function dismissActivity(id) {
    setActivityLog(prev => prev.filter(a => a.id !== id));
  }

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (status === "unauthorized") window.location.href = "/StyleYourself/manage/login";
  }, [status]);

  // ── Live product subscription — this is what keeps the table, the
  // customer Shop page, and the stat cards all in sync automatically ──
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setProducts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setProductsLoading(false);
      },
      (err) => {
        console.error("Error loading products:", err);
        setProductsLoading(false);
        showToast("error", "Couldn't load products. Check your connection.");
      }
    );
    return () => unsub();
  }, []);

  // ── Live orders subscription — pulls every order from every customer,
  // since all orders live in one shared "orders" collection (no per-user
  // scoping). onSnapshot means new orders appear here the instant a
  // customer checks out, with no refresh needed. ──
  const ordersFirstLoad = useRef(true);
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setOrders(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setOrdersLoading(false);

        // Only notify for orders that arrive AFTER the dashboard is already
        // open — otherwise every pre-existing order would "notify" on load.
        if (!ordersFirstLoad.current) {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
              const o = { id: change.doc.id, ...change.doc.data() };
              const name = o.customer?.name || "a customer";
              const total = Number(o.orderTotal || 0).toLocaleString();
              pushActivity(`🛒 New order from ${name} — ₦${total}`);
              showToast("success", `New order from ${name}!`);
            }
          });
        }
        ordersFirstLoad.current = false;
      },
      (err) => {
        console.error("Error loading orders:", err);
        setOrdersLoading(false);
        showToast("error", "Couldn't load orders. Check your connection.");
      }
    );
    return () => unsub();
  }, []);

  if (status === "checking") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Inter, sans-serif", color: GOLD, fontSize: 18, fontWeight: 700,
        background: "#0F172A", flexDirection: "column", gap: 16,
      }}>
        <div style={{ fontSize: 32, animation: "spin 1s linear infinite" }}>✦</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        Loading…
      </div>
    );
  }
  if (status !== "authorized") return null;

  const T = dark ? DARK : LIGHT;
  const Btn = makeBtn(T);
  const inputStyle = makeInput(T);

  const revenue = orders.filter(o => o.fulfillment?.status === "Delivered").reduce((s, o) => s + Number(o.orderTotal || 0), 0);
  const lowItems = products.filter(p => Number(p.stock) <= LOW_STOCK);
  const salesStats = computeSalesStats(orders);
  const salesTrend = computeSalesTrend(orders, 8);
  const salesByProductId = Object.fromEntries(
    salesStats.revenueByProduct.filter(p => p.productId).map(p => [p.productId, p])
  );
  const bestSeller = salesStats.bestSeller;
  const totalSales = salesStats.totalUnitsSold;
  const filteredOrders = orderFilter === "all" ? orders : orders.filter(o => o.fulfillment?.status === orderFilter);
  const pendingOrders = orders.filter(o => o.fulfillment?.status === "Pending").length;
  const featuredCount = products.filter(p => p.featured).length;
  const bestSellerCount = products.filter(p => p.bestSeller).length;
  const newArrivalCount = products.filter(p => p.newArrival).length;
  const visibleProducts = products.filter(p => matchesProductSearch(p, productSearch));

  // ── Image upload now goes through Cloudinary (see uploadToCloudinary above) ──
  // Deletion from Cloudinary requires a signed request (needs the API secret),
  // which can't safely happen in browser code. Old images are simply left
  // orphaned in Cloudinary when a product's image is replaced or the product
  // is deleted — the free tier's 25GB makes this a non-issue for a long time.
  // If it ever matters, the real fix is a small serverless function later.

  // ── DELETE: opens confirmation, real delete happens in confirmDeleteProduct ──
  const handleDelete = (product) => setDeleteTarget(product);

  async function confirmDeleteProduct() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "products", deleteTarget.id));
      showToast("success", `"${deleteTarget.name}" was deleted.`);
    } catch (err) {
      console.error("Failed to delete product:", err);
      showToast("error", "Failed to delete product. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  // ── EDIT ──
  const handleEditOpen = (p) => {
    setEditingProduct(p.id);
    setEditOriginal(p);
    setEditForm({
      ...p,
      colors: Array.isArray(p.colors) ? p.colors.join(", ") : (p.colors || ""),
    });
    setEditImageFile(null);
    setEditImagePreview(p.image || null);
    setEditErrors({});
  };

  function handleEditImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setEditImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function handleEditSave() {
    const errors = {};
    if (!editForm.name?.trim()) errors.name = "Product name is required.";
    if (!editForm.category) errors.category = "Category is required.";
    if (!editForm.price || parseFloat(editForm.price) <= 0) errors.price = "Enter a valid price.";
    if (editForm.stock === "" || editForm.stock === undefined || parseInt(editForm.stock) < 0) errors.stock = "Enter a valid stock quantity.";
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setEditSaving(true);
    try {
      let image = editForm.image || "";
      let imagePublicId = editForm.imagePublicId || "";

      if (editImageFile) {
        const uploaded = await uploadToCloudinary(editImageFile);
        image = uploaded.url;
        imagePublicId = uploaded.publicId;
      }

      const updates = {
        name: editForm.name.trim(),
        brand: editForm.brand || "",
        category: editForm.category,
        description: editForm.description || "",
        price: parseFloat(editForm.price),
        oldPrice: editForm.oldPrice ? parseFloat(editForm.oldPrice) : null,
        stock: parseInt(editForm.stock),
        sizes: editForm.sizes || [],
        colors: (editForm.colors || "").split(",").map(c => c.trim()).filter(Boolean),
        featured: Boolean(editForm.featured),
        bestSeller: Boolean(editForm.bestSeller),
        newArrival: Boolean(editForm.newArrival),
        image,
        imagePublicId,
      };

      await updateDoc(doc(db, "products", editingProduct), updates);

      if (editOriginal) {
        const changes = buildEditDiff(editOriginal, updates);
        if (changes.length > 0) {
          pushActivity(`Edited "${updates.name}" — ${changes.join("; ")}`);
        } else {
          pushActivity(`Edited "${updates.name}" — saved with no field changes`);
        }
      }

      showToast("success", "Product updated.");
      setEditingProduct(null);
    } catch (err) {
      console.error("Failed to update product:", err);
      showToast("error", "Failed to save changes. Please try again.");
    } finally {
      setEditSaving(false);
    }
  }

  // ── ADD ──
  async function handleAddSubmit() {
    const errors = {};
    if (!newProduct.imageFile) errors.image = "Please upload a product image.";
    if (!newProduct.name?.trim()) errors.name = "Product name is required.";
    if (!newProduct.category) errors.category = "Please select a category.";
    if (!newProduct.price || parseFloat(newProduct.price) <= 0) errors.price = "Enter a valid price.";
    if (!newProduct.stock && newProduct.stock !== 0) errors.stock = "Enter a valid stock quantity.";
    if (newProduct.category === "Clothes" && !newProduct.sizes?.length) errors.sizes = "Select at least one size.";
    if (newProduct.category === "Shoes" && !newProduct.sizes?.length) errors.sizes = "Select at least one shoe size.";

    if (Object.keys(errors).length > 0) {
      setNewProduct(p => ({ ...p, addErrors: errors }));
      return;
    }

    setNewProduct(p => ({ ...p, addLoading: true, addErrors: {} }));

    try {
      const { url, publicId } = await uploadToCloudinary(newProduct.imageFile);

      await addDoc(collection(db, "products"), {
        name: newProduct.name.trim(),
        brand: newProduct.brand || "",
        price: parseFloat(newProduct.price),
        oldPrice: newProduct.oldPrice ? parseFloat(newProduct.oldPrice) : null,
        stock: parseInt(newProduct.stock),
        image: url,
        imagePublicId: publicId,
        category: newProduct.category,
        sizes: newProduct.sizes || [],
        colors: (newProduct.colors || "").split(",").map(c => c.trim()).filter(Boolean),
        description: newProduct.description || "",
        featured: Boolean(newProduct.featured),
        bestSeller: Boolean(newProduct.bestSeller),
        newArrival: Boolean(newProduct.newArrival),
        sales: 0,
        createdAt: serverTimestamp(),
      });

      showToast("success", "Product added successfully.");

      setNewProduct({
        name: "", brand: "", price: "", oldPrice: "", stock: "", image: "👗",
        category: "", sizes: [], colors: "", description: "",
        featured: false, bestSeller: false, newArrival: false,
        imagePreview: null, imageFile: null,
        addLoading: false, addErrors: {},
      });
      setShowAdd(false);
    } catch (err) {
      console.error("Failed to add product:", err);
      setNewProduct(p => ({ ...p, addLoading: false }));
      showToast("error", "Failed to add product: " + err.message);
    }
  }

  // ── FULFILLMENT: forward-only, Dispatched routes through confirmation ──
  async function handleFulfillmentChange(order, newStatus) {
    if (newStatus === order.fulfillment?.status) return;

    if (newStatus === "Delivered" && order.payment?.status !== "Paid") {
      showToast("error", "Mark payment as Paid before marking this order Delivered.");
      return;
    }

    if (newStatus === "Dispatched") {
      setDispatchTarget(order);
      return;
    }

    const timelineLabel = newStatus === "Cancelled" ? "Order Cancelled" : newStatus;
    const updates = {
      "fulfillment.status": newStatus,
      timeline: [...(order.timeline || []), { label: timelineLabel, at: new Date().toISOString() }],
      auditLog: [...(order.auditLog || []), { at: new Date().toISOString(), action: `Fulfillment: ${order.fulfillment?.status || "—"} → ${newStatus}` }],
      updatedAt: serverTimestamp(),
    };
    if (newStatus === "Cancelled") {
      updates["inventory.status"] = "Not Reserved"; // release reservation — nothing was ever deducted
    }

    try {
      await updateDoc(doc(db, "orders", order.id), updates);
      showToast("success", `Order marked ${newStatus}.`);
    } catch (err) {
      console.error("Failed to update order:", err);
      showToast("error", "Failed to update order. Please try again.");
    }
  }

  // ── DISPATCH: the one irreversible step — confirm, then deduct real stock ──
  async function confirmDispatch() {
    if (!dispatchTarget) return;
    setDispatching(true);
    try {
      for (const item of dispatchTarget.items || []) {
        if (!item.productId) continue;
        const productRef = doc(db, "products", item.productId);
        const snap = await getDoc(productRef);
        if (snap.exists()) {
          const currentStock = Number(snap.data().stock) || 0;
          const newStock = Math.max(0, currentStock - (item.quantity || 1));
          await updateDoc(productRef, { stock: newStock });
        }
      }

      const nowIso = new Date().toISOString();
      await updateDoc(doc(db, "orders", dispatchTarget.id), {
        "fulfillment.status": "Dispatched",
        "inventory.status": "Deducted",
        "inventory.deductedAt": nowIso,
        timeline: [
          ...(dispatchTarget.timeline || []),
          { label: "Dispatched", at: nowIso },
          { label: "Inventory Deducted", at: nowIso },
        ],
        auditLog: [
          ...(dispatchTarget.auditLog || []),
          { at: nowIso, action: "Dispatched order; system deducted inventory" },
        ],
        updatedAt: serverTimestamp(),
      });

      showToast("success", "Order dispatched — inventory deducted.");
    } catch (err) {
      console.error("Failed to dispatch order:", err);
      showToast("error", "Failed to dispatch order. Please try again.");
    } finally {
      setDispatching(false);
      setDispatchTarget(null);
    }
  }

  // ── PAYMENT: fully independent of fulfillment — admin confirms cash manually ──
  async function handlePaymentChange(order, newStatus) {
    if (newStatus === order.payment?.status) return;
    try {
      await updateDoc(doc(db, "orders", order.id), {
        "payment.status": newStatus,
        timeline: [...(order.timeline || []), { label: `Payment: ${newStatus}`, at: new Date().toISOString() }],
        auditLog: [...(order.auditLog || []), { at: new Date().toISOString(), action: `Payment: ${order.payment?.status || "—"} → ${newStatus}` }],
        updatedAt: serverTimestamp(),
      });
      showToast("success", `Payment marked ${newStatus}.`);
    } catch (err) {
      console.error("Failed to update payment status:", err);
      showToast("error", "Failed to update payment status.");
    }
  }

  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  const navItems = [
    { key: "overview", label: "Dashboard", icon: "⬡" },
    { key: "products", label: "Products", icon: "◻" },
    { key: "orders", label: "Orders", icon: "◳" },
    { key: "analytics", label: "Analytics", icon: "◈" },
    { key: "alerts", label: "Low Stock", icon: "◇" },
  ];

  const tabLabels = {
    overview: "Dashboard",
    products: "Products",
    orders: "Orders",
    analytics: "Analytics",
    alerts: "Low Stock",
  };

  const SIDEBAR_W = 240;

  // ── STOCK COLOR ──
  const stockColor = (stock) => {
    if (stock === 0) return "#EF4444";
    if (stock <= 3) return "#F97316";
    if (stock <= LOW_STOCK) return "#F59E0B";
    return "#10B981";
  };

  // Revenue sparkline mock data
  const sparkData = [120, 145, 132, 178, 156, 190, 214, revenue];

  return (
    <div style={{
      fontFamily: "'Inter', 'DM Sans', sans-serif",
      background: T.bg,
      minHeight: "100vh",
      color: T.text,
      display: "flex",
      transition: "background 0.35s, color 0.35s",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 99px; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        .anim-fadeUp { animation: fadeUp 0.4s cubic-bezier(.4,0,.2,1) both; }
        .anim-fadeIn { animation: fadeIn 0.3s both; }
        .row-hover:hover td { background: ${T.surfaceHover} !important; }
        .nav-item:hover { background: ${T.navActive} !important; }
        .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-ghost:hover { background: ${T.border}22 !important; }
        .btn-danger:hover { background: #FECACA !important; }
        .quick-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px ${GOLD}22 !important; }
        select option { background: ${T.surface}; }
      `}</style>

      {/* ── BACKDROP ── */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 15,
          backdropFilter: "blur(2px)",
          animation: "fadeIn 0.2s both",
        }} />
      )}

      {/* ══════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════ */}
      <aside style={{
        width: SIDEBAR_W,
        background: dark ? "#1E293B" : "#FFFFFF",
        borderRight: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        bottom: 0,
        left: isMobile ? (sidebarOpen ? 0 : -SIDEBAR_W) : 0,
        overflowY: "auto",
        transition: "left 0.3s cubic-bezier(.4,0,.2,1)",
        zIndex: 20,
        boxShadow: isMobile && sidebarOpen ? "4px 0 40px rgba(0,0,0,0.2)" : "none",
      }}>
        {/* Logo */}
        <div style={{
          padding: "22px 20px 18px",
          borderBottom: `1px solid ${T.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div className="flex items-center gap-3 cursor-pointer">
              {/* Logo */}
              <div className="relative flex-shrink-0">
                <div className="logo-ring"></div>
            
                <div
                  className="
                    relative
                    w-11
                    h-11
                    md:w-12
                    md:h-12
                    rounded-full
                    overflow-hidden
                    border-2
                    border-yellow-500
                    bg-black
                    shadow-lg
                  "
                >
                  <img
                    src={StyleYourself}
                    alt="Style Yourself"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: T.text, letterSpacing: "-0.3px", lineHeight: 1.2 }}>StyleYourself</div>
              <div style={{ fontSize: 10, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 1 }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Admin profile */}
        <div style={{
          padding: "14px 16px 12px",
          borderBottom: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 99,
            background: `linear-gradient(135deg, #7C3AED, #4F46E5)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0, position: "relative",
          }}>A
            <div style={{
              position: "absolute", bottom: 0, right: 0,
              width: 9, height: 9, borderRadius: 99,
              background: "#10B981", border: `2px solid ${dark ? "#1E293B" : "#fff"}`,
            }} />
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Admin</div>
            <div style={{ fontSize: 10, color: T.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ADMIN_EMAIL}</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
          <div style={{ fontSize: 9, color: T.sub, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "6px 10px 10px" }}>Main Menu</div>
          {navItems.map((n, idx) => {
            const active = tab === n.key;
            return (
              <div
                key={n.key}
                className="nav-item"
                onClick={() => { setTab(n.key); if (isMobile) setSidebarOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                  marginBottom: 2,
                  background: active ? T.navActive : "transparent",
                  color: active ? GOLD_DARK : T.muted,
                  fontWeight: active ? 700 : 500, fontSize: 13,
                  transition: "all 0.15s",
                  position: "relative",
                  animation: `slideIn 0.3s ${idx * 0.04}s both`,
                }}
              >
                {active && (
                  <div style={{
                    position: "absolute", left: 0, top: "20%", bottom: "20%",
                    width: 3, borderRadius: 99,
                    background: `linear-gradient(180deg, ${GOLD}, ${GOLD_DARK})`,
                  }} />
                )}
                <span style={{ fontSize: 15, color: active ? GOLD : T.sub, transition: "color 0.15s" }}>{n.icon}</span>
                {n.label}
                {n.key === "alerts" && lowItems.length > 0 && (
                  <span style={{
                    marginLeft: "auto", background: "#FEE2E2", color: "#DC2626",
                    fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                  }}>{lowItems.length}</span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Account section — pinned to the bottom of the sidebar, not part of
            the scrollable nav above, so Sign Out always sits at the same spot
            regardless of screen size or how many nav items there are */}
        <div style={{ padding: "12px 10px", borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ fontSize: 9, color: T.sub, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 10px 10px" }}>Account</div>
          <button
            onClick={logout}
            className="nav-item"
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 10, cursor: "pointer",
              background: "transparent", color: "#EF4444", fontWeight: 600,
              fontSize: 13, border: "none", width: "100%", textAlign: "left",
              fontFamily: "inherit", transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 15 }}><FaSignOutAlt size={19} /></span> Sign out
          </button>
        </div>

        {/* Bottom version tag */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: T.sub, fontWeight: 500 }}>StyleYourself Admin v2.0</div>
          <div style={{ fontSize: 10, color: T.sub, marginTop: 2 }}>© 2025 All rights reserved</div>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════ */}
      <div style={{
        marginLeft: isMobile ? 0 : SIDEBAR_W,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        transition: "margin-left 0.3s cubic-bezier(.4,0,.2,1)",
      }}>

        {/* ── HEADER ── */}
        <header style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: isMobile ? "12px 16px" : "0 28px",
          height: isMobile ? "auto" : 64,
          background: dark ? "#1E293B" : "#FFFFFF",
          borderBottom: `1px solid ${T.border}`,
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: `0 1px 0 ${T.border}`,
        }}>
          {/* Left */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  background: "transparent", border: "none", color: T.text,
                  fontSize: 20, cursor: "pointer", padding: "4px",
                  display: "flex", alignItems: "center", flexShrink: 0,
                }}
              >☰</button>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10, color: T.sub, fontWeight: 500, letterSpacing: "0.04em" }}>
                StyleYourself / {tabLabels[tab] || tab}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.text, letterSpacing: "-0.3px", lineHeight: 1.2 }}>
                {tabLabels[tab] || tab}
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 14, flexShrink: 0 }}>
            {/* Clock */}
            {!isMobile && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: GOLD, letterSpacing: "0.03em", lineHeight: 1.1 }}>{timeStr}</div>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 1 }}>{dateStr}</div>
              </div>
            )}

            {/* Notification */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowNotif(!showNotif)}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  border: `1px solid ${T.border}`, background: T.surface,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", fontSize: 16, position: "relative",
                  transition: "all 0.15s", color: T.muted,
                }}
              >
                🔔
                {(lowItems.length + activityLog.length) > 0 && (
                  <div style={{
                    position: "absolute", top: -2, right: -2,
                    width: 16, height: 16, borderRadius: 99,
                    background: "#EF4444", color: "#fff",
                    fontSize: 9, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: `2px solid ${dark ? "#1E293B" : "#fff"}`,
                  }}>{lowItems.length + activityLog.length}</div>
                )}
              </button>
              {showNotif && (
                <div className="anim-fadeUp" style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 14, padding: "8px 0", width: 300,
                  maxHeight: 420, overflowY: "auto",
                  boxShadow: T.cardShadow, zIndex: 100,
                }}>
                  <div style={{ padding: "8px 16px 10px", borderBottom: `1px solid ${T.border}`, fontSize: 12, fontWeight: 700, color: T.text }}>
                    Notifications
                  </div>

                  {activityLog.length === 0 && lowItems.length === 0 && (
                    <div style={{ padding: "14px 16px", fontSize: 12, color: T.muted }}>All clear — no alerts.</div>
                  )}

                  {/* Recent activity — edits, with a dismiss × on each */}
                  {activityLog.map(a => (
                    <div key={a.id} style={{
                      padding: "10px 16px", display: "flex", gap: 8, alignItems: "flex-start",
                      borderBottom: `1px solid ${T.border}`,
                    }}>
                      <span style={{ fontSize: 14, marginTop: 1 }}>✎</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11.5, color: T.text, lineHeight: 1.4 }}>{a.message}</div>
                        <div style={{ fontSize: 10, color: T.sub, marginTop: 2 }}>{timeAgo(a.time)}</div>
                      </div>
                      <button
                        onClick={() => dismissActivity(a.id)}
                        aria-label="Dismiss notification"
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: T.sub, fontSize: 13, padding: 2, lineHeight: 1, flexShrink: 0,
                        }}
                      >✕</button>
                    </div>
                  ))}

                  {/* Low stock alerts */}
                  {lowItems.map(p => (
                    <div key={p.id} style={{
                      padding: "10px 16px", display: "flex", gap: 10, alignItems: "center",
                      cursor: "pointer", transition: "background 0.15s",
                    }}
                      onClick={() => { setTab("alerts"); setShowNotif(false); }}>
                      {p.image && p.image.startsWith("http") ? (
                        <img src={p.image} alt={p.name} style={{ width: 28, height: 28, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                      ) : (
                        <span style={{ fontSize: 18 }}>{p.image || "📦"}</span>
                      )}
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: p.stock === 0 ? "#EF4444" : "#F59E0B" }}>
                          {p.stock === 0 ? "Out of stock" : `${p.stock} units left`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dark mode toggle */}
            <div
              onClick={() => setDark(!dark)}
              style={{
                width: 48, height: 26, borderRadius: 99,
                background: dark ? `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})` : T.border,
                position: "relative", cursor: "pointer", transition: "all 0.3s",
                boxShadow: dark ? `0 0 12px ${GOLD}44` : "none",
                flexShrink: 0,
              }}
            >
              <div style={{
                position: "absolute",
                top: 3,
                left: dark ? 24 : 3,
                width: 20, height: 20, borderRadius: 99,
                background: "#fff",
                transition: "left 0.3s cubic-bezier(.4,0,.2,1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11,
                boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              }}>{dark ? "☽" : "☀"}</div>
            </div>

            {/* Avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: 99,
              background: `linear-gradient(135deg, #7C3AED, #4F46E5)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0, cursor: "pointer",
            }}>A</div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main style={{ padding: isMobile ? "20px 16px" : "28px 32px", flex: 1, minWidth: 0 }}>

          {/* ════════ OVERVIEW ════════ */}
          {tab === "overview" && (
            <div className="anim-fadeUp">
              {/* Greeting */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 28, height: 2, background: GOLD, borderRadius: 99 }} />
                  <span style={{ fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>Dashboard Overview</span>
                </div>
                <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.5px" }}>
                  Good to see you, <span style={{ color: GOLD }}>Admin ✦</span>
                </h1>
                <p style={{ fontSize: 13, color: T.muted, marginTop: 6, margin: "6px 0 0" }}>
                  Here's what's happening at StyleYourself today.
                </p>
              </div>

              {/* Stat Cards */}
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16, marginBottom: 24,
              }}>
                <StatCard T={T} isMobile={isMobile} label="Total Revenue" value={formatMoney(revenue)} meta="From delivered orders" accent={GOLD} icon={<FaWallet size={28} />}
                  trend={{ positive: true, value: "+12.4%", label: "vs last week" }} />
                <StatCard T={T} isMobile={isMobile} label="Total Orders" value={orders.length} meta="All time" accent="#8B5CF6" icon={<FaBoxOpen size={28} />}
                  trend={{ positive: true, value: "+3", label: "this week" }} />
                <StatCard T={T} isMobile={isMobile} label="Pending Orders" value={pendingOrders} meta="Awaiting fulfilment" accent="#F97316" icon={<FaClipboard size={28} />}
                  trend={{ positive: false, value: `${pendingOrders} open`, label: "need action" }} />
                <StatCard T={T} isMobile={isMobile} label="Low Stock Items" value={lowItems.length} meta="Need restocking" accent="#EF4444" icon="⚠️"
                  trend={{ positive: lowItems.length === 0, value: lowItems.length === 0 ? "All good" : `${lowItems.length} items`, label: "at risk" }} />
                <StatCard T={T} isMobile={isMobile} label="Total Products" value={products.length} meta="Active listings" accent="#10B981" icon={<FaShoppingBag size={28} />}
                  trend={{ positive: true, value: `${products.filter(p => p.stock > 0).length} in stock`, label: "available" }} />
                <StatCard T={T} isMobile={isMobile} label="Best Seller" value={bestSeller?.name || "No sales yet"} meta={bestSeller ? `${bestSeller.unitsSold} units sold` : "Place an order to see this"} accent="#EC4899" icon={<FaTrophy size={28} />}
                  trend={bestSeller ? { positive: true, value: `₦${Math.round(bestSeller.revenue).toLocaleString()}`, label: "revenue" } : undefined} />
              </div>

              {/* Quick Actions */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 12 }}>Quick Actions</div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)",
                  gap: 12,
                }}>
                  {[
                    { icon: "➕", label: "Add Product", action: () => { setTab("products"); setShowAdd(true); } },
                    { icon: "🛒", label: "View Orders", action: () => setTab("orders") },
                    { icon: "📦", label: "Inventory", action: () => setTab("products") },
                    { icon: "⚠️", label: "Low Stock", action: () => setTab("alerts") },
                    { icon: "📊", label: "Analytics", action: () => setTab("analytics") },
                  ].map((qa, i) => (
                    <div
                      key={i}
                      className="quick-card"
                      onClick={qa.action}
                      style={{
                        background: T.surface, border: `1px solid ${T.border}`,
                        borderRadius: 14, padding: "16px 12px",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        cursor: "pointer", transition: "all 0.2s cubic-bezier(.4,0,.2,1)",
                        boxShadow: T.cardShadow, textAlign: "center",
                      }}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: 11,
                        background: `${GOLD}15`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20,
                      }}>{qa.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{qa.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom row: Recent Orders + Top Products */}
              <div style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 340px",
                gap: 20,
              }}>
                {/* Recent Orders */}
                <div style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 16,
                  padding: isMobile ? "16px" : "20px 22px",
                  boxShadow: T.cardShadow,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, overflowX:"auto" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Recent Orders</div>
                    <button className="btn-ghost" style={Btn.ghost} onClick={() => setTab("orders")}>View all →</button>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isMobile ? "100%" : 650, }}>
                      <thead>
                        <tr>
                          {["Order", "Customer", "Product", "Total", "Status"].map(h => (
                            <th key={h} style={{
                              fontSize: 10, color: T.muted, textAlign: "left",
                              padding: "0 12px 10px", fontWeight: 700, textTransform: "uppercase",
                              letterSpacing: "0.1em",
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {ordersLoading && (
                          <tr><td colSpan={5} style={{ padding: "20px", textAlign: "center", color: T.muted, fontSize: 12 }}>Loading orders…</td></tr>
                        )}
                        {!ordersLoading && orders.length === 0 && (
                          <tr><td colSpan={5} style={{ padding: "20px", textAlign: "center", color: T.muted, fontSize: 12 }}>No orders yet.</td></tr>
                        )}
                        {orders.slice(0, 5).map(o => (
                          <tr key={o.id} className="row-hover" style={{ transition: "background 0.15s" }}>
                            <td style={{ padding: "12px 12px", borderTop: `1px solid ${T.border}`, fontSize: 13, color: GOLD, fontWeight: 700 }}>{o.id.slice(0, 6).toUpperCase()}</td>
                            <td style={{ padding: "12px 12px", borderTop: `1px solid ${T.border}`, fontSize: 12, color: T.muted }}>{o.customer?.name || "—"}</td>
                            <td style={{ padding: "12px 12px", borderTop: `1px solid ${T.border}`, fontSize: 13, color: T.text }}>{orderItemsSummary(o.items)}</td>
                            <td style={{ padding: "12px 12px", borderTop: `1px solid ${T.border}`, fontSize: 13, color: T.text, fontWeight: 600 }}>₦{Number(o.orderTotal || 0).toLocaleString()}</td>
                            <td style={{ padding: "12px 12px", borderTop: `1px solid ${T.border}` }}>
                              <StatusBadge label={o.fulfillment?.status} map={FULFILLMENT_BADGE} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Products */}
                <div style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 16, padding: "20px 22px", boxShadow: T.cardShadow,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 18 }}>Top Products</div>
                  {salesStats.revenueByProduct.length === 0 && (
                    <div style={{ fontSize: 12, color: T.muted, textAlign: "center", padding: "20px 0" }}>No sales yet.</div>
                  )}
                  {salesStats.revenueByProduct.slice(0, 5).map((p, i) => (
                    <div key={p.productId || p.name} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 0",
                      borderTop: i > 0 ? `1px solid ${T.border}` : "none",
                    }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 8,
                        background: i === 0 ? `${GOLD}20` : `${T.border}50`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 800, color: i === 0 ? GOLD_DARK : T.sub,
                        flexShrink: 0,
                      }}>{i + 1}</div>
                      <div style={{ width: 22, height: 22, borderRadius: 6, overflow: "hidden", fontSize: 18, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {p.image && p.image.startsWith("http") ? (
                          <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : "📦"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: T.muted }}>{p.unitsSold} sold</div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: GOLD_DARK, flexShrink: 0 }}>₦{Math.round(p.revenue).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════ PRODUCTS ════════ */}
          {tab === "products" && (
            <div className="anim-fadeUp">
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 28, height: 2, background: GOLD, borderRadius: 99 }} />
                  <span style={{ fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>Inventory</span>
                </div>
                <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.4px" }}>Products</h1>
                <p style={{ fontSize: 13, color: T.muted, marginTop: 4, margin: "4px 0 0" }}>Manage your StyleYourself collection</p>
              </div>

              <div style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 16, overflow: "hidden", boxShadow: T.cardShadow,
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "18px 22px", borderBottom: `1px solid ${T.border}`, gap: 16, flexWrap: "wrap",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, flexShrink: 0 }}>
                    {productSearch.trim() ? `${visibleProducts.length} of ${products.length}` : products.length} items &nbsp;
                    <span style={{ color: T.sub, fontWeight: 400 }}>in collection</span>
                  </div>

                  <div style={{ position: "relative", flex: 1, minWidth: 180, maxWidth: 320 }}>
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search by name, color, price…"
                      style={{
                        width: "100%", background: T.input, border: `1.5px solid ${T.inputBorder}`,
                        borderRadius: 9, padding: "8px 30px 8px 12px", color: T.text, fontSize: 12,
                        fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                      }}
                    />
                    {productSearch && (
                      <button
                        onClick={() => setProductSearch("")}
                        aria-label="Clear search"
                        style={{
                          position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                          background: "none", border: "none", cursor: "pointer", color: T.muted, fontSize: 14,
                          padding: 0, lineHeight: 1,
                        }}
                      >✕</button>
                    )}
                  </div>

                  <button
                    className="btn-primary"
                    style={Btn.primary}
                    onClick={() => setShowAdd(true)}
                    >
                    Add Product
                    </button>
                </div>

                {productsLoading && (
                  <div style={{ padding: "40px", textAlign: "center", color: T.muted, fontSize: 13 }}>Loading products…</div>
                )}
                {!productsLoading && products.length === 0 && (
                  <div style={{ padding: "40px", textAlign: "center", color: T.muted, fontSize: 13 }}>No products yet — click "Add Product" to create your first one.</div>
                )}
                {!productsLoading && products.length > 0 && visibleProducts.length === 0 && (
                  <div style={{ padding: "40px", textAlign: "center", color: T.muted, fontSize: 13 }}>No products match "{productSearch}".</div>
                )}

                {!productsLoading && visibleProducts.length > 0 && (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isMobile ? 520 : 760 }}>
                    <thead>
                      <tr style={{ background: dark ? "#0F172A" : "#F8FAFC" }}>
                        {["Item", "Category", "Price", "Stock", "Sales", "Revenue", "Featured", "Best Seller", "New Arrival", "Actions"].map(h => (
                          <th key={h} style={{
                            fontSize: 10, color: T.muted, textAlign: "left",
                            padding: "12px 16px", fontWeight: 700,
                            textTransform: "uppercase", letterSpacing: "0.1em",
                            whiteSpace: "nowrap",
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleProducts.map(p => (
                        <tr key={p.id} className="row-hover" style={{ transition: "background 0.12s" }}>
                          <td style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 40, height: 40, borderRadius: 10, fontSize: 18,
                                background: dark ? "#0F172A" : "#F8FAFC",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0, overflow: "hidden",
                              }}>
                                {p.image && p.image.startsWith("data:") || p.image?.startsWith("http") ? (
                                  <img
                                    src={p.image}
                                    alt={p.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }}
                                  />
                                ) : (
                                  <span style={{ fontSize: 18 }}>{p.image || "📦"}</span>
                                )}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{p.name}</div>
                                <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                                  {p.stock === 0 && <span style={{ background: "#F3F4F6", color: T.sub, fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 99 }}>OUT</span>}
                                  {p.stock > 0 && p.stock <= LOW_STOCK && <span style={{ background: "#FEE2E2", color: "#DC2626", fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 99 }}>LOW</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}` }}>
                            <span style={{ background: GOLD_LIGHT, color: GOLD_DARK, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>{p.category}</span>
                          </td>
                          <td style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}`, fontSize: 13, color: T.text, fontWeight: 500 }}>₦{Number(p.price).toLocaleString()}</td>
                          <td style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}` }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 70 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: stockColor(p.stock) }}>{p.stock}</div>
                              <StockBar value={p.stock} max={30} color={stockColor(p.stock)} />
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}`, fontSize: 13, color: T.muted }}>{salesByProductId[p.id]?.unitsSold || 0}</td>
                          <td style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.text }}>₦{Math.round(salesByProductId[p.id]?.revenue || 0).toLocaleString()}</td>
                          <td style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}` }}><FlagBadge active={p.featured} /></td>
                          <td style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}` }}><FlagBadge active={p.bestSeller} /></td>
                          <td style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}` }}><FlagBadge active={p.newArrival} /></td>
                          <td style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}` }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button className="btn-ghost" style={Btn.edit} onClick={() => handleEditOpen(p)}>Edit</button>
                              <button className="btn-danger" style={Btn.danger} onClick={() => handleDelete(p)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            </div>
          )}

          {/* ════════ ORDERS ════════ */}
          {tab === "orders" && (
            <div className="anim-fadeUp">
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 28, height: 2, background: GOLD, borderRadius: 99 }} />
                  <span style={{ fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>Fulfillment</span>
                </div>
                <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.4px" }}>Orders</h1>
                <p style={{ fontSize: 13, color: T.muted, marginTop: 4, margin: "4px 0 0" }}>Stock deducts automatically when an order is dispatched</p>
              </div>

              {/* Summary pills */}
              <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                {[
                  { key: "all", label: "All Orders", count: orders.length },
                  { key: "Pending", label: "Pending", count: orders.filter(o => o.fulfillment?.status === "Pending").length },
                  { key: "Dispatched", label: "Dispatched", count: orders.filter(o => o.fulfillment?.status === "Dispatched").length },
                  { key: "Delivered", label: "Delivered", count: orders.filter(o => o.fulfillment?.status === "Delivered").length },
                ].map(f => (
                  <button key={f.key} onClick={() => setOrderFilter(f.key)} style={{
                    padding: "7px 16px", borderRadius: 99,
                    border: `1.5px solid ${orderFilter === f.key ? GOLD : T.border}`,
                    background: orderFilter === f.key ? GOLD_LIGHT : "transparent",
                    color: orderFilter === f.key ? GOLD_DARK : T.muted,
                    fontSize: 12, cursor: "pointer", fontWeight: orderFilter === f.key ? 700 : 500,
                    fontFamily: "inherit", transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    {f.label}
                    <span style={{
                      background: orderFilter === f.key ? GOLD_DARK : T.border,
                      color: orderFilter === f.key ? "#fff" : T.muted,
                      fontSize: 10, fontWeight: 800, padding: "1px 6px",
                      borderRadius: 99, minWidth: 18, textAlign: "center",
                    }}>{f.count}</span>
                  </button>
                ))}
              </div>

              <div style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 16, overflow: "hidden", boxShadow: T.cardShadow,
              }}>
                {ordersLoading && (
                  <div style={{ padding: "40px", textAlign: "center", color: T.muted, fontSize: 13 }}>Loading orders…</div>
                )}
                {!ordersLoading && filteredOrders.length === 0 && (
                  <div style={{ padding: "40px", textAlign: "center", color: T.muted, fontSize: 13 }}>No orders {orderFilter !== "all" ? `with status "${orderFilter}"` : "yet"}.</div>
                )}
                {!ordersLoading && filteredOrders.length > 0 && (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: isMobile ? 900 : "auto" }}>
                    <thead>
                      <tr style={{ background: dark ? "#0F172A" : "#F8FAFC" }}>
                        {["Order", "Customer", "Product", "Qty", "Total", "Date", "Payment", "Fulfillment", "Inventory", "Update"].map(h => (
                          <th key={h} style={{
                            fontSize: 10, color: T.muted, textAlign: "left",
                            padding: "12px 16px", fontWeight: 700,
                            textTransform: "uppercase", letterSpacing: "0.1em",
                            whiteSpace: "nowrap",
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map(o => {
                        const fulfillmentOptions = getFulfillmentOptions(o.fulfillment?.status, o.payment?.status);
                        return (
                        <>
                        <tr key={o.id} className="row-hover" style={{ transition: "background 0.12s" }}>
                          <td
                            onClick={() => setExpandedOrderId(expandedOrderId === o.id ? null : o.id)}
                            style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}`, color: GOLD, fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            <span style={{ display: "inline-block", transition: "transform 0.15s", transform: expandedOrderId === o.id ? "rotate(90deg)" : "rotate(0deg)", marginRight: 6, fontSize: 10 }}>▶</span>
                            {o.id.slice(0, 6).toUpperCase()}
                          </td>
                          <td style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}`, fontSize: 12, color: T.muted }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                width: 26, height: 26, borderRadius: 99, flexShrink: 0,
                                background: `linear-gradient(135deg, #7C3AED, #4F46E5)`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 10, fontWeight: 800, color: "#fff",
                              }}>{o.customer?.name?.[0] || "?"}</div>
                              <div>
                                <div style={{ color: T.text, fontWeight: 500 }}>{o.customer?.name || "—"}</div>
                                {o.customer?.phone && (
                                  <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>{o.customer.phone}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}`, fontSize: 13, color: T.text }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              {o.items?.[0]?.image && (
                                <img src={o.items[0].image} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                              )}
                              <span>{orderItemsSummary(o.items)}</span>
                            </div>
                          </td>
                          <td style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}`, fontSize: 13, color: T.muted, textAlign: "center" }}>{orderItemsQty(o.items)}</td>
                          <td style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.text }}>₦{Number(o.orderTotal || 0).toLocaleString()}</td>
                          <td style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}`, fontSize: 12, color: T.muted, whiteSpace: "nowrap" }}>{formatOrderDate(o.createdAt)}</td>
                          <td style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}` }}>
                            <select
                              value={o.payment?.status || "Pending"}
                              onChange={e => handlePaymentChange(o, e.target.value)}
                              style={{
                                ...(PAYMENT_BADGE[o.payment?.status] ? { background: PAYMENT_BADGE[o.payment.status].bg, color: PAYMENT_BADGE[o.payment.status].color } : {}),
                                border: "none", borderRadius: 99, padding: "3px 22px 3px 9px", fontSize: 10, fontWeight: 700,
                                cursor: "pointer", fontFamily: "inherit", outline: "none", appearance: "none",
                              }}
                            >
                              {PAYMENT_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}` }}>
                            {fulfillmentOptions.length > 1 ? (
                              <select
                                value={o.fulfillment?.status || "Pending"}
                                onChange={e => handleFulfillmentChange(o, e.target.value)}
                                style={{
                                  ...(FULFILLMENT_BADGE[o.fulfillment?.status] ? { background: FULFILLMENT_BADGE[o.fulfillment.status].bg, color: FULFILLMENT_BADGE[o.fulfillment.status].color } : {}),
                                  border: "none", borderRadius: 99, padding: "3px 22px 3px 9px", fontSize: 10, fontWeight: 700,
                                  cursor: "pointer", fontFamily: "inherit", outline: "none", appearance: "none",
                                }}
                              >
                                {fulfillmentOptions.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            ) : (
                              <StatusBadge label={o.fulfillment?.status} map={FULFILLMENT_BADGE} />
                            )}
                            {o.fulfillment?.status === "Dispatched" && o.payment?.status !== "Paid" && (
                              <div style={{ fontSize: 9.5, color: "#DC2626", marginTop: 4, maxWidth: 110, lineHeight: 1.3 }}>
                                Awaiting payment before Delivered
                              </div>
                            )}
                          </td>
                          <td style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}` }}>
                            <StatusBadge label={o.inventory?.status} map={INVENTORY_BADGE} />
                          </td>
                          <td style={{ padding: "14px 16px", borderTop: `1px solid ${T.border}`, fontSize: 11, color: T.sub }}>
                            {o.fulfillment?.status === "Delivered" || o.fulfillment?.status === "Cancelled" ? "Locked" : "—"}
                          </td>
                        </tr>
                        {expandedOrderId === o.id && (
                          <tr key={`${o.id}-expanded`}>
                            <td colSpan={10} style={{ padding: 0, borderTop: `1px solid ${T.border}` }}>
                              <div style={{ padding: "18px 24px", background: dark ? "#0F172A" : "#F8FAFC" }}>
                                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.3fr 1fr", gap: 24 }}>

                                  {/* All items ordered */}
                                  <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                                      Items Ordered ({(o.items || []).length})
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                      {(o.items || []).map((item, idx) => (
                                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: T.surface, borderRadius: 10, border: `1px solid ${T.border}` }}>
                                          {item.image ? (
                                            <img src={item.image} alt={item.name} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                                          ) : (
                                            <div style={{ width: 36, height: 36, borderRadius: 8, background: T.bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📦</div>
                                          )}
                                          <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 12.5, fontWeight: 600, color: T.text }}>{item.name}</div>
                                            <div style={{ fontSize: 11, color: T.muted, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                              {item.size && <span>Size: {item.size}</span>}
                                              {item.color && <span>Color: {item.color}</span>}
                                              <span>Qty: {item.quantity || 1}</span>
                                            </div>
                                          </div>
                                          <div style={{ fontSize: 12, fontWeight: 700, color: T.text, flexShrink: 0 }}>
                                            ₦{Number((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Delivery / pickup + contact details */}
                                  <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                                      {o.delivery?.method === "pickup" ? "Pickup Details" : "Delivery Details"}
                                    </div>
                                    <div style={{ background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, padding: "14px 16px" }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                        <span style={{ fontSize: 12, color: T.muted }}>Method</span>
                                        <span style={{
                                          fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 99,
                                          background: o.delivery?.method === "pickup" ? "#ECFDF5" : "#FEF3C7",
                                          color: o.delivery?.method === "pickup" ? "#065F46" : "#92400E",
                                        }}>
                                          {o.delivery?.method === "pickup" ? "Store Pickup" : "Home Delivery"}
                                        </span>
                                      </div>

                                      {o.delivery?.method === "pickup" ? (
                                        <div style={{ fontSize: 12, color: T.text }}>Customer will collect this order in-store — no delivery fee applies.</div>
                                      ) : (
                                        <>
                                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                            <span style={{ fontSize: 12, color: T.muted }}>State</span>
                                            <span style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>{o.delivery?.state || "—"}</span>
                                          </div>
                                          <div style={{ marginBottom: 10 }}>
                                            <span style={{ fontSize: 12, color: T.muted, display: "block", marginBottom: 3 }}>Address</span>
                                            <span style={{ fontSize: 12.5, color: T.text }}>{o.delivery?.address || "—"}</span>
                                          </div>
                                          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                                              <span style={{ color: T.muted }}>Delivery fee (total)</span>
                                              <span style={{ color: T.text }}>₦{Number(o.delivery?.fee || 0).toLocaleString()}</span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                                              <span style={{ color: T.muted }}>Customer paid (70%)</span>
                                              <span style={{ color: T.text }}>₦{Number(o.delivery?.customerShare || 0).toLocaleString()}</span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                                              <span style={{ color: T.muted }}>Store covered (30%)</span>
                                              <span style={{ color: "#10B981" }}>₦{Number(o.delivery?.storeShare || 0).toLocaleString()}</span>
                                            </div>
                                          </div>
                                        </>
                                      )}
                                    </div>

                                    <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: "14px 0 10px" }}>
                                      Contact
                                    </div>
                                    <div style={{ background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, padding: "14px 16px" }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                        <span style={{ fontSize: 12, color: T.muted }}>Phone</span>
                                        <span style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>{o.customer?.phone || "—"}</span>
                                      </div>
                                      {o.customer?.email && (
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                          <span style={{ fontSize: 12, color: T.muted }}>Email</span>
                                          <span style={{ fontSize: 12, color: T.text }}>{o.customer.email}</span>
                                        </div>
                                      )}
                                    </div>

                                    {o.customerNotes && (
                                      <>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: "14px 0 10px" }}>
                                          Customer Notes
                                        </div>
                                        <div style={{ background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, padding: "12px 16px", fontSize: 12.5, color: T.text }}>
                                          {o.customerNotes}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                      );
                      })}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            </div>
          )}

          {/* ════════ ANALYTICS ════════ */}
          {tab === "analytics" && (
            <div className="anim-fadeUp">
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 28, height: 2, background: GOLD, borderRadius: 99 }} />
                  <span style={{ fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>Insights</span>
                </div>
                <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.4px" }}>Analytics</h1>
                <p style={{ fontSize: 13, color: T.muted, marginTop: 4, margin: "4px 0 0" }}>Performance overview for your store</p>
              </div>

              {/* KPI row */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "Total Revenue", value: `₦${Math.round(revenue).toLocaleString()}`, icon: <FaWallet size={28} /> , accent: GOLD,},
                  { label: "Total Sales", value: totalSales, icon: <FaWallet size={28} />, accent: "#10B981", },
                  { label: "Avg. Order Value", value: orders.length ? `₦${Math.round(orders.reduce((s, o) => s + Number(o.orderTotal || 0), 0) / orders.length).toLocaleString()}` : "₦0", icon: "🎯", accent: "#8B5CF6" },
                  { label: "Conversion Est.", value: "74.2%", icon: "🔥", accent: "#EF4444" },
                ].map((c, i) => (
                  <div key={i} style={{
                    background: T.surface, border: `1px solid ${T.border}`,
                    borderRadius: 14, padding: "18px 20px",
                    boxShadow: T.cardShadow,
                    borderTop: `3px solid ${c.accent}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{c.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: "-0.4px" }}>{c.value}</div>
                      </div>
                      <div style={{ fontSize: 22 }}>{c.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue by product */}
              <div style={{
                background: T.surface, border: `1px solid ${T.border}`,
                borderRadius: 16, padding: "22px", marginBottom: 20, boxShadow: T.cardShadow,
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 20 }}>Revenue by Product</div>
                {salesStats.revenueByProduct.length === 0 && (
                  <div style={{ fontSize: 12, color: T.muted, textAlign: "center", padding: "20px 0" }}>No sales yet — this fills in once orders come through.</div>
                )}
                {salesStats.revenueByProduct.map(p => {
                  const totalRev = salesStats.revenueByProduct.reduce((s, x) => s + x.revenue, 0) || 1;
                  const pct = (p.revenue / totalRev) * 100;
                  return (
                    <div key={p.productId || p.name} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 18, height: 18, borderRadius: 5, overflow: "hidden", fontSize: 16, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                            {p.image && p.image.startsWith("http") ? (
                              <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : "📦"}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{p.name}</span>
                        </div>
                        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: T.muted }}>{p.unitsSold} sold</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: GOLD_DARK }}>₦{Math.round(p.revenue).toLocaleString()}</span>
                          <span style={{ fontSize: 10, color: T.sub, minWidth: 32, textAlign: "right" }}>{pct.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div style={{ height: 6, background: dark ? "#1E293B" : "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${pct}%`,
                          background: `linear-gradient(90deg, ${GOLD}, ${GOLD_DARK})`,
                          borderRadius: 99, transition: "width 0.6s cubic-bezier(.4,0,.2,1)",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Weekly sparklines */}
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
                <div style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 16, padding: "22px", boxShadow: T.cardShadow,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Sales Trend</div>
                  <div style={{ fontSize: 11, color: T.muted, marginBottom: 18 }}>Revenue by week, last 8 weeks</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                    {(() => {
                      const maxVal = Math.max(...salesTrend.map(b => b.value), 1);
                      return salesTrend.map((b, i) => {
                        const h = maxVal > 0 ? (b.value / maxVal) * 80 : 0;
                        return (
                          <div key={i} title={`₦${Math.round(b.value).toLocaleString()}`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                            <div style={{
                              width: "100%", height: Math.max(h, 2),
                              background: i === salesTrend.length - 1 ? `linear-gradient(180deg, ${GOLD}, ${GOLD_DARK})` : (dark ? "#334155" : "#E2E8F0"),
                              borderRadius: "5px 5px 0 0",
                              transition: "height 0.4s",
                            }} />
                          </div>
                        );
                      });
                    })()}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                    {salesTrend.map((b, i) => (
                      <div key={i} style={{ flex: 1, fontSize: 9, color: T.sub, textAlign: "center" }}>{b.label}</div>
                    ))}
                  </div>
                </div>

                <div style={{
                  background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 16, padding: "22px", boxShadow: T.cardShadow,
                }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Order Status Breakdown</div>
                  <div style={{ fontSize: 11, color: T.muted, marginBottom: 18 }}>Current distribution</div>
                  {[
                    { label: "Delivered", count: orders.filter(o => o.fulfillment?.status === "Delivered").length, color: "#10B981" },
                    { label: "Dispatched", count: orders.filter(o => o.fulfillment?.status === "Dispatched").length, color: "#3B82F6" },
                    { label: "Pending", count: orders.filter(o => o.fulfillment?.status === "Pending").length, color: "#F59E0B" },
                  ].map((s, i) => (
                    <div key={i} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 99, background: s.color }} />
                          <span style={{ fontSize: 12, fontWeight: 500, color: T.text }}>{s.label}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{s.count}</span>
                      </div>
                      <div style={{ height: 6, background: dark ? "#1E293B" : "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${orders.length ? (s.count / orders.length * 100) : 0}%`,
                          background: s.color, borderRadius: 99, transition: "width 0.5s",
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════ LOW STOCK ════════ */}
          {tab === "alerts" && (
            <div className="anim-fadeUp">
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 28, height: 2, background: GOLD, borderRadius: 99 }} />
                  <span style={{ fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>Inventory Alerts</span>
                </div>
                <h1 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "-0.4px" }}>Low Stock</h1>
                <p style={{ fontSize: 13, color: T.muted, marginTop: 4, margin: "4px 0 0" }}>Items at or below {LOW_STOCK} units — act before you lose a sale</p>
              </div>

              {lowItems.length === 0 ? (
                <div style={{
                  background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16,
                  padding: "60px", textAlign: "center", color: T.muted, boxShadow: T.cardShadow,
                }}>
                  <div style={{ fontSize: 40, marginBottom: 14 }}>✦</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>All stocked up</div>
                  <div style={{ fontSize: 13 }}>Every item is above the low-stock threshold.</div>
                </div>
              ) : (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 18,
                }}>
                  {lowItems.map(p => {
                    const col = stockColor(p.stock);
                    const label = p.stock === 0 ? "Out of stock" : p.stock <= 3 ? "Critical" : "Low";
                    return (
                      <div key={p.id} style={{
                        background: T.surface, border: `1px solid ${T.border}`,
                        borderTop: `3px solid ${col}`,
                        borderRadius: 16, padding: "20px",
                        boxShadow: `0 4px 20px ${col}18`,
                        transition: "all 0.2s",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                              width: 46, height: 46, borderRadius: 13, fontSize: 24,
                              background: `${col}15`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              overflow: "hidden",
                            }}>
                              {p.image && p.image.startsWith("http") ? (
                                <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (p.image || "📦")}
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 3 }}>{p.name}</div>
                              <div style={{ fontSize: 11, color: T.muted }}>{p.category} · ₦{Number(p.price).toLocaleString()}</div>
                            </div>
                          </div>
                          <div style={{
                            background: `${col}18`, color: col,
                            fontSize: 10, fontWeight: 800, padding: "3px 9px",
                            borderRadius: 99, whiteSpace: "nowrap",
                          }}>{label}</div>
                        </div>

                        <div style={{ marginBottom: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 11, color: T.muted }}>Stock remaining</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: col }}>{p.stock} units</span>
                          </div>
                          <StockBar value={p.stock} max={30} color={col} />
                        </div>

                        <button
                          className="btn-primary"
                          style={{ ...Btn.primary, width: "100%", padding: "10px" }}
                          onClick={() => { setTab("products"); handleEditOpen(p); }}
                        >
                          Restock Now
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ════════ EDIT MODAL ════════ */}
      {editingProduct && (
        <div className="anim-fadeIn" style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 50, backdropFilter: "blur(4px)", padding: 16, overflowY: "auto",
        }}>
          <div className="anim-fadeUp" style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 18, padding: "28px", width: "100%", maxWidth: 480,
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)", margin: "auto",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, color: "#fff",
              }}>✎</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>Edit Product</div>
            </div>

            {/* Image */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Product Image</label>
              <div
                onClick={() => document.getElementById("edit-img-input").click()}
                style={{
                  marginTop: 6, border: `2px dashed ${T.inputBorder}`, borderRadius: 12, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
                }}
              >
                {editImagePreview ? (
                  <img src={editImagePreview} alt="preview" style={{ width: "100%", maxHeight: 150, objectFit: "cover", display: "block" }} />
                ) : (
                  <div style={{ padding: "20px", fontSize: 12, color: T.muted }}>Click to upload a replacement image</div>
                )}
              </div>
              <input id="edit-img-input" type="file" accept="image/*" style={{ display: "none" }} onChange={handleEditImageChange} />
            </div>

            <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Name</label>
            <input style={inputStyle} type="text" value={editForm.name || ""} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            {editErrors.name && <div style={{ fontSize: 11, color: "#EF4444", marginTop: -10, marginBottom: 10 }}>⚠ {editErrors.name}</div>}

            <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Brand</label>
            <input style={inputStyle} type="text" value={editForm.brand || ""} onChange={e => setEditForm(f => ({ ...f, brand: e.target.value }))} />

            <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Category</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={editForm.category || ""} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
              <option value="">Select a category…</option>
              <option value="Shoes">👟 Shoes</option>
              <option value="Clothes">👔 Clothes</option>
              <option value="Accessories">💍 Accessories</option>
            </select>
            {editErrors.category && <div style={{ fontSize: 11, color: "#EF4444", marginTop: -10, marginBottom: 10 }}>⚠ {editErrors.category}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Price</label>
                <input style={inputStyle} type="number" value={editForm.price || ""} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))} />
                {editErrors.price && <div style={{ fontSize: 11, color: "#EF4444", marginTop: -10, marginBottom: 10 }}>⚠ {editErrors.price}</div>}
              </div>
              <div>
                <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Old Price</label>
                <input style={inputStyle} type="number" value={editForm.oldPrice || ""} onChange={e => setEditForm(f => ({ ...f, oldPrice: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Stock</label>
                <input style={inputStyle} type="number" value={editForm.stock ?? ""} onChange={e => setEditForm(f => ({ ...f, stock: e.target.value }))} />
                {editErrors.stock && <div style={{ fontSize: 11, color: "#EF4444", marginTop: -10, marginBottom: 10 }}>⚠ {editErrors.stock}</div>}
              </div>
              <div>
                <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Colors (comma separated)</label>
                <input style={inputStyle} type="text" placeholder="Red, Blue, Black" value={editForm.colors || ""} onChange={e => setEditForm(f => ({ ...f, colors: e.target.value }))} />
              </div>
            </div>

            {(editForm.category === "Clothes" || editForm.category === "Shoes") && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {editForm.category === "Shoes" ? "Shoe Sizes" : "Sizes"}
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {(editForm.category === "Shoes"
                    ? ["38", "39", "40", "41", "42", "43", "44", "45", "46"]
                    : ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"]
                  ).map(sz => {
                    const selected = (editForm.sizes || []).includes(sz);
                    return (
                      <div
                        key={sz}
                        onClick={() => setEditForm(f => ({
                          ...f,
                          sizes: selected ? (f.sizes || []).filter(s => s !== sz) : [...(f.sizes || []), sz],
                        }))}
                        style={{
                          padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
                          border: `1.5px solid ${selected ? GOLD : T.inputBorder}`,
                          background: selected ? `${GOLD}18` : "transparent",
                          color: selected ? GOLD_DARK : T.muted, transition: "all 0.15s",
                        }}
                      >{sz}</div>
                    );
                  })}
                </div>
              </div>
            )}

            <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Description</label>
            <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 70 }} value={editForm.description || ""} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />

            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 18 }}>
              {[["featured", "Featured"], ["bestSeller", "Best Seller"], ["newArrival", "New Arrival"]].map(([key, label]) => (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.text, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={Boolean(editForm[key])}
                    onChange={e => setEditForm(f => ({ ...f, [key]: e.target.checked }))}
                  />
                  {label}
                </label>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              <button className="btn-primary" style={{ ...Btn.primary, flex: 1, opacity: editSaving ? 0.7 : 1 }} disabled={editSaving} onClick={handleEditSave}>
                {editSaving ? "Saving…" : "Save changes"}
              </button>
              <button className="btn-ghost" style={{ ...Btn.ghost, flex: 1 }} onClick={() => setEditingProduct(null)} disabled={editSaving}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ DISPATCH CONFIRMATION ════════ */}
      {dispatchTarget && (
        <div className="anim-fadeIn" style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 60, backdropFilter: "blur(4px)", padding: 16,
        }}>
          <div className="anim-fadeUp" style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 18, padding: "26px", width: "100%", maxWidth: 380,
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          }}>
            <div style={{ fontSize: 32, marginBottom: 10, textAlign: "center" }}>🚚</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 12, textAlign: "center" }}>Dispatch Order</div>
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 8 }}>This action will:</div>
            <ul style={{ fontSize: 13, color: T.text, marginBottom: 14, paddingLeft: 20, lineHeight: 1.8 }}>
              <li>Deduct product inventory</li>
              <li>Mark the order as Dispatched</li>
              <li>Notify the customer</li>
            </ul>
            <div style={{ fontSize: 12, color: "#DC2626", marginBottom: 20, fontWeight: 600 }}>
              This cannot be automatically reversed.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-ghost" style={{ ...Btn.ghost, flex: 1 }} onClick={() => setDispatchTarget(null)} disabled={dispatching}>Cancel</button>
              <button
                style={{
                  flex: 1, padding: "9px 16px", borderRadius: 9, border: "none", cursor: "pointer",
                  background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`, color: "#fff", fontSize: 13, fontWeight: 700,
                  fontFamily: "inherit", opacity: dispatching ? 0.7 : 1,
                }}
                disabled={dispatching}
                onClick={confirmDispatch}
              >
                {dispatching ? "Dispatching…" : "Dispatch Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════ DELETE CONFIRMATION ════════ */}
      {deleteTarget && (
        <div className="anim-fadeIn" style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 60, backdropFilter: "blur(4px)", padding: 16,
        }}>
          <div className="anim-fadeUp" style={{
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 18, padding: "26px", width: "100%", maxWidth: 360,
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)", textAlign: "center",
          }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🗑️</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 8 }}>Delete Product</div>
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>
              Are you sure you want to delete <strong style={{ color: T.text }}>"{deleteTarget.name}"</strong>? This cannot be undone.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-ghost" style={{ ...Btn.ghost, flex: 1 }} onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button
                style={{
                  flex: 1, padding: "9px 16px", borderRadius: 9, border: "none", cursor: "pointer",
                  background: "#EF4444", color: "#fff", fontSize: 13, fontWeight: 700,
                  fontFamily: "inherit", opacity: deleting ? 0.7 : 1,
                }}
                disabled={deleting}
                onClick={confirmDeleteProduct}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} />

      {/* ════════ ADD MODAL ════════ */}
{showAdd && (
  <div
    className="anim-fadeIn"
    onClick={(e) => { if (e.target === e.currentTarget) setShowAdd(false); }}
    style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 50, backdropFilter: "blur(4px)", padding: 16,
      overflowY: "auto",
    }}
  >
    <div
      className="anim-fadeUp"
      style={{
        background: T.surface, border: `1px solid ${T.border}`,
        borderRadius: 18, padding: "28px", width: "100%", maxWidth: 480,
        boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        margin: "auto", position: "relative",
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 17, color: "#fff", boxShadow: `0 4px 12px ${GOLD}44`,
          }}>+</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.text, letterSpacing: "-0.3px" }}>Add New Product</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 1 }}>Fill in the details below</div>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(false)}
          style={{
            width: 30, height: 30, borderRadius: 8, border: `1px solid ${T.border}`,
            background: "transparent", color: T.muted, cursor: "pointer",
            fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "inherit",
          }}
        >✕</button>
      </div>

      {/* ── Image Upload ── */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Product Image
        </label>
        <div
          onClick={() => document.getElementById("add-img-input").click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith("image/")) {
              const reader = new FileReader();
              reader.onload = (ev) => setNewProduct(p => ({ ...p, imagePreview: ev.target.result, imageFile: file }));
              reader.readAsDataURL(file);
            }
          }}
          style={{
            marginTop: 6,
            border: `2px dashed ${newProduct.imagePreview ? GOLD : T.inputBorder}`,
            borderRadius: 12, cursor: "pointer",
            background: newProduct.imagePreview ? "transparent" : (dark ? "#0F172A" : "#F8FAFC"),
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 8,
            height: newProduct.imagePreview ? "auto" : 110,
            overflow: "hidden",
            transition: "border-color 0.2s",
          }}
        >
          {newProduct.imagePreview ? (
            <div style={{ position: "relative", width: "100%" }}>
              <img
                src={newProduct.imagePreview}
                alt="preview"
                style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10, display: "block" }}
              />
              <div style={{
                position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)",
                borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                opacity: 0, transition: "opacity 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>Click to change</span>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 28 }}>🖼️</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Click or drag & drop image</div>
              <div style={{ fontSize: 10, color: T.sub }}>PNG, JPG, WEBP up to 5MB</div>
            </>
          )}
        </div>
        <input
          id="add-img-input"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (ev) => setNewProduct(p => ({ ...p, imagePreview: ev.target.result, imageFile: file }));
              reader.readAsDataURL(file);
            }
          }}
        />
        {newProduct.addErrors?.image && (
          <div style={{ fontSize: 11, color: "#EF4444", marginTop: 4 }}>⚠ {newProduct.addErrors.image}</div>
        )}
      </div>

      {/* ── Product Name ── */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Product Name <span style={{ color: "#EF4444" }}>*</span>
        </label>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g. Nike Air Force 1"
          value={newProduct.name || ""}
          onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
        />
        {newProduct.addErrors?.name && (
          <div style={{ fontSize: 11, color: "#EF4444", marginTop: -10, marginBottom: 6 }}>⚠ {newProduct.addErrors.name}</div>
        )}
      </div>

      {/* ── Brand ── */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Brand
        </label>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g. Nike"
          value={newProduct.brand || ""}
          onChange={e => setNewProduct(p => ({ ...p, brand: e.target.value }))}
        />
      </div>

      {/* ── Category ── */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Category <span style={{ color: "#EF4444" }}>*</span>
        </label>
        <select
          style={{ ...inputStyle, cursor: "pointer" }}
          value={newProduct.category || ""}
          onChange={e => setNewProduct(p => ({ ...p, category: e.target.value, sizes: [] }))}
        >
          <option value="">Select a category…</option>
          <option value="Shoes">👟 Shoes</option>
          <option value="Clothes">👔 Clothes</option>
          <option value="Accessories">💍 Accessories</option>
        </select>
        {newProduct.addErrors?.category && (
          <div style={{ fontSize: 11, color: "#EF4444", marginTop: -10, marginBottom: 6 }}>⚠ {newProduct.addErrors.category}</div>
        )}
      </div>

      {/* ── Dynamic Size Selector ── */}
      {newProduct.category === "Clothes" && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Sizes <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"].map(sz => {
              const selected = (newProduct.sizes || []).includes(sz);
              return (
                <div
                  key={sz}
                  onClick={() => setNewProduct(p => ({
                    ...p,
                    sizes: selected
                      ? (p.sizes || []).filter(s => s !== sz)
                      : [...(p.sizes || []), sz],
                  }))}
                  style={{
                    padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                    fontSize: 12, fontWeight: 700,
                    border: `1.5px solid ${selected ? GOLD : T.inputBorder}`,
                    background: selected ? `${GOLD}18` : "transparent",
                    color: selected ? GOLD_DARK : T.muted,
                    transition: "all 0.15s",
                  }}
                >{sz}</div>
              );
            })}
          </div>
          {newProduct.addErrors?.sizes && (
            <div style={{ fontSize: 11, color: "#EF4444", marginTop: 6 }}>⚠ {newProduct.addErrors.sizes}</div>
          )}
        </div>
      )}

      {newProduct.category === "Shoes" && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Shoe Sizes <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {["38", "39", "40", "41", "42", "43", "44", "45", "46"].map(sz => {
              const selected = (newProduct.sizes || []).includes(sz);
              return (
                <div
                  key={sz}
                  onClick={() => setNewProduct(p => ({
                    ...p,
                    sizes: selected
                      ? (p.sizes || []).filter(s => s !== sz)
                      : [...(p.sizes || []), sz],
                  }))}
                  style={{
                    padding: "6px 14px", borderRadius: 8, cursor: "pointer",
                    fontSize: 12, fontWeight: 700,
                    border: `1.5px solid ${selected ? GOLD : T.inputBorder}`,
                    background: selected ? `${GOLD}18` : "transparent",
                    color: selected ? GOLD_DARK : T.muted,
                    transition: "all 0.15s",
                  }}
                >{sz}</div>
              );
            })}
          </div>
          {newProduct.addErrors?.sizes && (
            <div style={{ fontSize: 11, color: "#EF4444", marginTop: 6 }}>⚠ {newProduct.addErrors.sizes}</div>
          )}
        </div>
      )}

      {newProduct.category === "Accessories" && (
        <div style={{
          marginBottom: 14, padding: "10px 14px", borderRadius: 10,
          background: `${GOLD}10`, border: `1px solid ${GOLD}30`,
        }}>
          <div style={{ fontSize: 12, color: GOLD_DARK, fontWeight: 600 }}>
            💍 Accessories don't require a size selection.
          </div>
        </div>
      )}

      {/* ── Price & Stock row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Price (₦) <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <div style={{ position: "relative", marginTop: 5, marginBottom: 14 }}>
            <span style={{
              position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
              fontSize: 13, color: T.muted, fontWeight: 700, pointerEvents: "none",
            }}>₦</span>
            <input
              style={{ ...inputStyle, paddingLeft: 28, marginTop: 0, marginBottom: 0 }}
              type="number"
              min="0"
              placeholder="0.00"
              value={newProduct.price || ""}
              onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))}
            />
          </div>
          {newProduct.addErrors?.price && (
            <div style={{ fontSize: 11, color: "#EF4444", marginTop: -10, marginBottom: 6 }}>⚠ {newProduct.addErrors.price}</div>
          )}
        </div>
        <div>
          <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Stock Qty <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <input
            style={inputStyle}
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={newProduct.stock || ""}
            onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))}
          />
          {newProduct.addErrors?.stock && (
            <div style={{ fontSize: 11, color: "#EF4444", marginTop: -10, marginBottom: 6 }}>⚠ {newProduct.addErrors.stock}</div>
          )}
        </div>
      </div>

      {/* ── Old Price & Colors row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Old Price (₦) <span style={{ color: T.sub, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
          </label>
          <input
            style={inputStyle}
            type="number"
            min="0"
            placeholder="0.00"
            value={newProduct.oldPrice || ""}
            onChange={e => setNewProduct(p => ({ ...p, oldPrice: e.target.value }))}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Colors <span style={{ color: T.sub, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(comma separated)</span>
          </label>
          <input
            style={inputStyle}
            type="text"
            placeholder="Red, Blue, Black"
            value={newProduct.colors || ""}
            onChange={e => setNewProduct(p => ({ ...p, colors: e.target.value }))}
          />
        </div>
      </div>

      {/* ── Description ── */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Description <span style={{ color: T.sub, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
        </label>
        <textarea
          style={{
            ...inputStyle,
            resize: "vertical", minHeight: 80, lineHeight: 1.5,
          }}
          placeholder="Describe the product — material, fit, occasion…"
          value={newProduct.description || ""}
          onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
        />
      </div>

      {/* ── Flags ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        {[["featured", "Featured"], ["bestSeller", "Best Seller"], ["newArrival", "New Arrival"]].map(([key, label]) => (
          <label key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.text, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={Boolean(newProduct[key])}
              onChange={e => setNewProduct(p => ({ ...p, [key]: e.target.checked }))}
            />
            {label}
          </label>
        ))}
      </div>

      {/* ── Buttons ── */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          className="btn-primary"
          style={{ ...Btn.primary, flex: 1, padding: "11px", fontSize: 13, opacity: newProduct.addLoading ? 0.7 : 1 }}
          disabled={newProduct.addLoading}
          onClick={handleAddSubmit}
        >
          {newProduct.addLoading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{
                width: 14, height: 14, border: "2px solid #fff",
                borderTopColor: "transparent", borderRadius: "50%",
                display: "inline-block", animation: "spin 0.7s linear infinite",
              }} />
              Adding…
            </span>
          ) : "Add Product"}
        </button>
        <button
          className="btn-ghost"
          style={{ ...Btn.ghost, flex: 1, padding: "11px" }}
          disabled={newProduct.addLoading}
          onClick={() => {
            setShowAdd(false);
            setNewProduct({
              name: "", brand: "", price: "", oldPrice: "", stock: "", image: "👗",
              category: "", sizes: [], colors: "", description: "",
              featured: false, bestSeller: false, newArrival: false,
              imagePreview: null, imageFile: null,
              addLoading: false, addErrors: {},
            });
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}