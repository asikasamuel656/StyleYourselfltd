import React, { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";
import { ShoppingCart } from "lucide-react";
import HeroSlider from "../components/HeroSliderShop.jsx";
import MainNavbar from "../components/Navbar.jsx";
import { useStore } from "../context/StoreContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { collection, onSnapshot, orderBy, query, doc, setDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";

const categories = ["All", "Clothes", "Shoes", "Accessories"];

// Small lookup so color names entered in the admin form ("Red", "Navy Blue")
// render as an actual swatch dot. Falls back to a neutral gray dot with the
// name shown as a tooltip for anything not in the list.
const COLOR_HEX = {
  red: "#EF4444", blue: "#3B82F6", "navy blue": "#1E3A8A", navy: "#1E3A8A",
  black: "#111827", white: "#F9FAFB", green: "#10B981", yellow: "#F59E0B",
  gold: "#D4AF37", orange: "#F97316", purple: "#8B5CF6", pink: "#EC4899",
  brown: "#78350F", beige: "#E7D9C4", cream: "#FFFDD0", grey: "#9CA3AF",
  gray: "#9CA3AF", maroon: "#7F1D1D", teal: "#14B8A6", tan: "#D2B48C",
};

function colorToHex(name) {
  return COLOR_HEX[name.trim().toLowerCase()] || "#CBD5E1";
}

function discountPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

// Stock bar caps its visual fill at STOCK_CAP units — a product with 20+ in
// stock shows a full bar, one with 1-2 left shows it almost empty. This
// mirrors the "X items left" urgency pattern from the reference design.
const STOCK_CAP = 20;

function Shop() {
  const { addToCart } = useStore();
  const { T } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(saved);
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "products"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        price: Number(doc.data().price) || 0,
      }));
      setProducts(fetched);
      setLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ── Page view tracking for Conversion Estimate in the admin dashboard ──
  // Increments a simple all-time counter once per page load. This is a
  // page-view count, not unique-visitor tracking (repeat visits by the same
  // person each count separately) — a reasonable proxy for "traffic" without
  // building a full analytics/session system.
  useEffect(() => {
    const viewRef = doc(db, "analytics", "shopViews");
    setDoc(viewRef, { total: increment(1), updatedAt: serverTimestamp() }, { merge: true }).catch((err) => {
      console.error("Failed to record page view:", err);
    });
  }, []);

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const toggleWishlist = (product) => {
    const exists = wishlist.find((i) => i.id === product.id);
    const updated = exists
      ? wishlist.filter((i) => i.id !== product.id)
      : [...wishlist, product];
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const isInWishlist = (id) => wishlist.some((i) => i.id === id);

  return (
    <>
      <MainNavbar />
      <HeroSlider />

      <section
        className="py-16 px-6 min-h-screen"
        style={{ background: T.bg, color: T.text }}
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold" style={{ color: T.text }}>
            Our <span className="text-amber-500">Store</span>
          </h1>
        </div>

        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-4 py-2 rounded-full transition font-medium"
              style={
                selectedCategory === cat
                  ? { background: "#F59E0B", color: "#fff" }
                  : { background: T.card, color: T.text }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-xl animate-pulse"
                style={{ background: T.card, height: 320 }}
              />
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && (
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                T={T}
                isWishlisted={isInWishlist(item.id)}
                onToggleWishlist={() => toggleWishlist(item)}
                onAddToCart={() => addToCart(item)}
              />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: T.muted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🛍️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>No products found</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Try a different category</div>
          </div>
        )}
      </section>
    </>
  );
}

// ── PRODUCT CARD ──
function ProductCard({ item, T, isWishlisted, onToggleWishlist, onAddToCart }) {
  const discount = discountPercent(item.price, item.oldPrice);
  const stock = Number(item.stock) || 0;
  const outOfStock = stock === 0;
  const stockFillPct = Math.min((stock / STOCK_CAP) * 100, 100);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: T.card, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
    >
      {/* ── Image area ── */}
      <div className="relative" style={{ aspectRatio: "1 / 1", background: T.bg }}>
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = "none"; }}
        />

        {discount && (
          <span className="absolute top-2 right-2" style={{
            background: "#FDECD8", color: "#C2410C",
            fontSize: 11, fontWeight: 800, padding: "3px 8px",
            borderRadius: 6,
          }}>
            -{discount}%
          </span>
        )}

        {!discount && item.newArrival && (
          <span className="absolute top-2 right-2" style={{
            background: "#111827", color: "#fff",
            fontSize: 10, fontWeight: 800, padding: "3px 8px",
            borderRadius: 6, letterSpacing: "0.04em",
          }}>NEW</span>
        )}

        <button
          onClick={onToggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.9)" }}
        >
          <FaHeart size={11} className={isWishlisted ? "text-red-500" : "text-gray-400"} />
        </button>
      </div>

      {/* ── Details area ── */}
      <div className="p-3">
        {/* Price + color swatches row, right under the image */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="font-bold" style={{ color: "#F59E0B", fontSize: 16 }}>
              ₦{Number(item.price).toLocaleString()}
            </span>
          </div>
          {item.colors?.length > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {item.colors.slice(0, 4).map((c) => (
                <span
                  key={c}
                  title={c}
                  style={{
                    width: 12, height: 12, borderRadius: "50%",
                    background: colorToHex(c),
                    border: "1px solid rgba(0,0,0,0.12)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {item.oldPrice > item.price && (
          <p style={{ fontSize: 11.5, color: T.muted, textDecoration: "line-through", marginTop: -4, marginBottom: 6 }}>
            ₦{Number(item.oldPrice).toLocaleString()}
          </p>
        )}

        <h3
          className="font-medium truncate mb-2"
          style={{ color: T.text, fontSize: 13.5 }}
        >
          {item.name}
        </h3>

        {/* Stock bar */}
        {outOfStock ? (
          <p style={{ fontSize: 11, fontWeight: 700, color: "#DC2626", marginBottom: 10 }}>Out of stock</p>
        ) : (
          <div className="mb-2">
            <div style={{ height: 5, borderRadius: 99, background: T.bg, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${stockFillPct}%`, background: "#F59E0B", borderRadius: 99 }} />
            </div>
            <p style={{ fontSize: 10.5, color: T.muted, marginTop: 4 }}>
              {stock} {stock === 1 ? "item" : "items"} left
            </p>
          </div>
        )}

        <button
          onClick={onAddToCart}
          disabled={outOfStock}
          className="mt-1 w-full py-2 rounded-lg flex items-center justify-center gap-1.5 font-semibold text-xs"
          style={
            outOfStock
              ? { background: T.bg, color: T.muted, cursor: "not-allowed" }
              : { background: "#F59E0B", color: "#fff" }
          }
        >
          <ShoppingCart size={13} />
          {outOfStock ? "Unavailable" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

export default Shop;



// import React, { useState, useEffect, useMemo } from "react";
// import { FaHeart } from "react-icons/fa";
// import { ShoppingCart, SlidersHorizontal, X } from "lucide-react";
// import MainNavbar from "./MainNavbar";
// import SubSlider from "./SubSlider";
// import { useStore } from "../context/StoreContext";
// import { useTheme } from "../context/ThemeContext";
// import { collection, onSnapshot, orderBy, query, doc, setDoc, increment, serverTimestamp } from "firebase/firestore";
// import { db } from "../firebase";

// import showroomWide from "../assets/hero/showroom-wide.jpg";
// import rails from "../assets/hero/rails.jpg";

// const categories = ["All", "Clothes", "Shoes", "Accessories"];

// const PRICE_BANDS = [
//   { id: "all", label: "All prices", test: () => true },
//   { id: "u30", label: "Under \u20a630,000", test: (p) => p < 30000 },
//   { id: "30-100", label: "\u20a630,000 \u2013 \u20a6100,000", test: (p) => p >= 30000 && p <= 100000 },
//   { id: "100-300", label: "\u20a6100,000 \u2013 \u20a6300,000", test: (p) => p > 100000 && p <= 300000 },
//   { id: "300+", label: "\u20a6300,000+", test: (p) => p > 300000 },
// ];

// const COLOR_HEX = {
//   red: "#EF4444", blue: "#3B82F6", "navy blue": "#1E3A8A", navy: "#1E3A8A",
//   black: "#111827", white: "#F9FAFB", green: "#10B981", yellow: "#F59E0B",
//   gold: "#D4AF37", orange: "#F97316", purple: "#8B5CF6", pink: "#EC4899",
//   brown: "#78350F", beige: "#E7D9C4", cream: "#FFFDD0", grey: "#9CA3AF",
//   gray: "#9CA3AF", maroon: "#7F1D1D", teal: "#14B8A6", tan: "#D2B48C",
// };
// function colorToHex(name) { return COLOR_HEX[name?.trim().toLowerCase()] || "#CBD5E1"; }
// function discountPercent(price, oldPrice) {
//   if (!oldPrice || oldPrice <= price) return null;
//   return Math.round(((oldPrice - price) / oldPrice) * 100);
// }
// const STOCK_CAP = 20;

// function Shop() {
//   const { addToCart } = useStore();
//   const { T } = useTheme();

//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [selectedBrands, setSelectedBrands] = useState([]);
//   const [priceBand, setPriceBand] = useState("all");
//   const [filtersOpen, setFiltersOpen] = useState(false);
//   const [wishlist, setWishlist] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const saved = JSON.parse(localStorage.getItem("wishlist")) || [];
//     setWishlist(saved);
//   }, []);

//   useEffect(() => {
//     const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
//     const unsub = onSnapshot(q, (snapshot) => {
//       const fetched = snapshot.docs.map((d) => ({ id: d.id, ...d.data(), price: Number(d.data().price) || 0 }));
//       setProducts(fetched);
//       setLoading(false);
//     }, (err) => { console.error("Firestore error:", err); setLoading(false); });
//     return () => unsub();
//   }, []);

//   useEffect(() => {
//     const viewRef = doc(db, "analytics", "shopViews");
//     setDoc(viewRef, { total: increment(1), updatedAt: serverTimestamp() }, { merge: true }).catch((err) => {
//       console.error("Failed to record page view:", err);
//     });
//   }, []);

//   // Brand list derived from live product data — falls back gracefully if a
//   // product has no `brand` field.
//   const brands = useMemo(() => {
//     const set = new Set(products.map((p) => p.brand).filter(Boolean));
//     return Array.from(set).sort();
//   }, [products]);

//   const toggleBrand = (brand) => {
//     setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);
//   };

//   const priceTest = PRICE_BANDS.find((b) => b.id === priceBand)?.test ?? (() => true);

//   const filteredProducts = products.filter((p) => {
//     const catOk = selectedCategory === "All" || p.category === selectedCategory;
//     const brandOk = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
//     const priceOk = priceTest(Number(p.price) || 0);
//     return catOk && brandOk && priceOk;
//   });

//   const toggleWishlist = (product) => {
//     const exists = wishlist.find((i) => i.id === product.id);
//     const updated = exists ? wishlist.filter((i) => i.id !== product.id) : [...wishlist, product];
//     setWishlist(updated);
//     localStorage.setItem("wishlist", JSON.stringify(updated));
//     window.dispatchEvent(new Event("wishlistUpdated"));
//   };
//   const isInWishlist = (id) => wishlist.some((i) => i.id === id);

//   const clearFilters = () => { setSelectedCategory("All"); setSelectedBrands([]); setPriceBand("all"); };
//   const activeFilterCount = (selectedCategory !== "All" ? 1 : 0) + selectedBrands.length + (priceBand !== "all" ? 1 : 0);

//   return (
//     <>
//       <MainNavbar />

//       <SubSlider
//         eyebrow="Shop The Range"
//         title="The Shop"
//         subtitle="Every category, one destination."
//         images={[showroomWide, rails]}
//         height="h-[34vh] min-h-[260px]"
//       />

//       <section style={{ background: T.bg, color: T.text }} className="py-12 px-6 md:px-10 lg:px-16">
//         <div className="max-w-7xl mx-auto flex gap-10">

//           {/* ── Filters sidebar (desktop) ── */}
//           <aside className="hidden lg:block w-64 flex-shrink-0">
//             <FilterPanel
//               T={T}
//               categories={categories}
//               selectedCategory={selectedCategory}
//               setSelectedCategory={setSelectedCategory}
//               brands={brands}
//               selectedBrands={selectedBrands}
//               toggleBrand={toggleBrand}
//               priceBand={priceBand}
//               setPriceBand={setPriceBand}
//               onClear={clearFilters}
//             />
//           </aside>

//           {/* ── Main column ── */}
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center justify-between mb-6">
//               <p className="text-sm opacity-60">{filteredProducts.length} products</p>
//               <button
//                 onClick={() => setFiltersOpen(true)}
//                 className="lg:hidden flex items-center gap-2 text-sm font-semibold border border-black/10 dark:border-white/15 rounded-full px-4 py-2"
//               >
//                 <SlidersHorizontal size={14} />
//                 Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
//               </button>
//             </div>

//             {loading && (
//               <div className="grid gap-6 grid-cols-2 md:grid-cols-3">
//                 {[...Array(6)].map((_, i) => (
//                   <div key={i} className="rounded-lg animate-pulse" style={{ background: T.card, aspectRatio: "3/4" }} />
//                 ))}
//               </div>
//             )}

//             {!loading && (
//               <div className="grid gap-6 grid-cols-2 md:grid-cols-3">
//                 {filteredProducts.map((item) => (
//                   <ProductCard
//                     key={item.id}
//                     item={item}
//                     T={T}
//                     isWishlisted={isInWishlist(item.id)}
//                     onToggleWishlist={() => toggleWishlist(item)}
//                     onAddToCart={() => addToCart(item)}
//                   />
//                 ))}
//               </div>
//             )}

//             {!loading && filteredProducts.length === 0 && (
//               <div style={{ textAlign: "center", padding: "60px 0", color: T.muted }}>
//                 <div style={{ fontSize: 40, marginBottom: 12 }}>🛍️</div>
//                 <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>No products found</div>
//                 <div style={{ fontSize: 13, marginTop: 4 }}>Try clearing a filter</div>
//               </div>
//             )}
//           </div>
//         </div>
//       </section>

//       {/* ── Mobile filter drawer ── */}
//       {filtersOpen && (
//         <div className="fixed inset-0 z-50 lg:hidden">
//           <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
//           <div className="absolute right-0 top-0 h-full w-80 max-w-[88vw] p-6 overflow-y-auto" style={{ background: T.bg, color: T.text }}>
//             <div className="flex items-center justify-between mb-6">
//               <span className="font-semibold">Filters</span>
//               <button onClick={() => setFiltersOpen(false)}><X size={18} /></button>
//             </div>
//             <FilterPanel
//               T={T}
//               categories={categories}
//               selectedCategory={selectedCategory}
//               setSelectedCategory={setSelectedCategory}
//               brands={brands}
//               selectedBrands={selectedBrands}
//               toggleBrand={toggleBrand}
//               priceBand={priceBand}
//               setPriceBand={setPriceBand}
//               onClear={clearFilters}
//             />
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// // ── FILTER PANEL (shared desktop/mobile) ──
// function FilterPanel({ T, categories, selectedCategory, setSelectedCategory, brands, selectedBrands, toggleBrand, priceBand, setPriceBand, onClear }) {
//   return (
//     <div className="space-y-8">
//       <div>
//         <p className="text-xs font-semibold tracking-[0.18em] uppercase mb-3" style={{ color: "#C9A24B" }}>Category</p>
//         <div className="space-y-1.5">
//           {categories.map((cat) => (
//             <button
//               key={cat}
//               onClick={() => setSelectedCategory(cat)}
//               className="block text-left w-full text-sm py-1"
//               style={{ color: selectedCategory === cat ? "#C9A24B" : T.text, fontWeight: selectedCategory === cat ? 700 : 400 }}
//             >
//               {cat}
//             </button>
//           ))}
//         </div>
//       </div>

//       {brands.length > 0 && (
//         <div>
//           <p className="text-xs font-semibold tracking-[0.18em] uppercase mb-3" style={{ color: "#C9A24B" }}>Brand</p>
//           <div className="space-y-2">
//             {brands.map((brand) => (
//               <label key={brand} className="flex items-center gap-2.5 text-sm cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={selectedBrands.includes(brand)}
//                   onChange={() => toggleBrand(brand)}
//                   className="accent-[#C9A24B] w-4 h-4"
//                 />
//                 {brand}
//               </label>
//             ))}
//           </div>
//         </div>
//       )}

//       <div>
//         <p className="text-xs font-semibold tracking-[0.18em] uppercase mb-3" style={{ color: "#C9A24B" }}>Price</p>
//         <div className="space-y-2">
//           {PRICE_BANDS.map((band) => (
//             <label key={band.id} className="flex items-center gap-2.5 text-sm cursor-pointer">
//               <input
//                 type="radio"
//                 name="priceBand"
//                 checked={priceBand === band.id}
//                 onChange={() => setPriceBand(band.id)}
//                 className="accent-[#C9A24B] w-4 h-4"
//               />
//               {band.label}
//             </label>
//           ))}
//         </div>
//       </div>

//       <button
//         onClick={onClear}
//         className="w-full text-xs font-semibold uppercase tracking-wider border border-black/15 dark:border-white/20 rounded-full py-3 hover:border-[#C9A24B] hover:text-[#C9A24B] transition-colors"
//       >
//         Clear Filters
//       </button>
//     </div>
//   );
// }

// // ── PRODUCT CARD ──
// function ProductCard({ item, T, isWishlisted, onToggleWishlist, onAddToCart }) {
//   const discount = discountPercent(item.price, item.oldPrice);
//   const stock = Number(item.stock) || 0;
//   const outOfStock = stock === 0;
//   const stockFillPct = Math.min((stock / STOCK_CAP) * 100, 100);

//   return (
//     <div className="group rounded-lg overflow-hidden" style={{ background: T.card }}>
//       <div className="relative" style={{ aspectRatio: "4 / 5", background: T.bg }}>
//         <img
//           src={item.image}
//           alt={item.name}
//           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//           onError={(e) => { e.target.style.display = "none"; }}
//         />

//         {discount ? (
//           <span className="absolute top-2.5 left-2.5 bg-[#0E0E10] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
//             -{discount}%
//           </span>
//         ) : item.newArrival ? (
//           <span className="absolute top-2.5 left-2.5 border border-[#C9A24B] text-[#C9A24B] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide bg-black/40 backdrop-blur-sm">
//             New Arrival
//           </span>
//         ) : null}

//         <button
//           onClick={onToggleWishlist}
//           aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
//           className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm"
//         >
//           <FaHeart size={12} className={isWishlisted ? "text-red-500" : "text-gray-400"} />
//         </button>

//         {!outOfStock && (
//           <button
//             onClick={onAddToCart}
//             className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-[#0E0E10] text-white text-[11px] font-semibold uppercase tracking-wider py-2.5 flex items-center justify-center gap-2"
//           >
//             <ShoppingCart size={12} /> Quick Add
//           </button>
//         )}
//       </div>

//       <div className="p-3.5">
//         {item.brand && (
//           <p className="text-[10px] font-semibold uppercase tracking-[0.14em] mb-1" style={{ color: "#C9A24B" }}>
//             {item.brand}
//           </p>
//         )}

//         <h3 className="truncate mb-1.5" style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: T.text }}>
//           {item.name}
//         </h3>

//         <div className="flex items-baseline gap-2 mb-2">
//           <span className="font-bold" style={{ color: "#C9A24B", fontSize: 15 }}>
//             ₦{Number(item.price).toLocaleString()}
//           </span>
//           {item.oldPrice > item.price && (
//             <span style={{ fontSize: 12, color: T.muted, textDecoration: "line-through" }}>
//               ₦{Number(item.oldPrice).toLocaleString()}
//             </span>
//           )}
//         </div>

//         {item.colors?.length > 0 && (
//           <div className="flex items-center gap-1 mb-2">
//             {item.colors.slice(0, 5).map((c) => (
//               <span key={c} title={c} style={{ width: 11, height: 11, borderRadius: "50%", background: colorToHex(c), border: "1px solid rgba(0,0,0,0.15)" }} />
//             ))}
//           </div>
//         )}

//         {outOfStock ? (
//           <p style={{ fontSize: 11, fontWeight: 700, color: "#DC2626" }}>Out of stock</p>
//         ) : (
//           <div>
//             <div style={{ height: 3, borderRadius: 99, background: T.bg, overflow: "hidden" }}>
//               <div style={{ height: "100%", width: `${stockFillPct}%`, background: "#C9A24B", borderRadius: 99 }} />
//             </div>
//             <p style={{ fontSize: 10.5, color: T.muted, marginTop: 4 }}>
//               {stock} {stock === 1 ? "item" : "items"} left
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Shop;