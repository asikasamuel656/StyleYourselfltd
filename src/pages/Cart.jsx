import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useStore } from "../context/StoreContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase.js";
import Navbar from "../components/Navbar.jsx";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useStore();
  const { T } = useTheme();
  const navigate = useNavigate();

  // Live stock per product, so quantity controls always reflect what's
  // actually available right now — not just what stock looked like when
  // the item was added to the cart (which could be stale if someone else
  // bought some in the meantime).
  const [liveStock, setLiveStock] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const map = {};
        snapshot.docs.forEach((d) => {
          map[d.id] = Number(d.data().stock) || 0;
        });
        setLiveStock(map);
        console.log("[Cart] Live stock loaded:", map);
      },
      (err) => {
        console.error("[Cart] Failed to load live stock — falling back to stale cart values:", err);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    console.log("[Cart] Current cart items:", cart);
  }, [cart]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function maxAvailable(item) {
    // Falls back to the stock captured when the item was added, in case
    // liveStock hasn't loaded yet or the product was somehow removed.
    return liveStock[item.id] ?? item.stock ?? 0;
  }

  // If stock dropped below what's already in the cart (e.g. someone else
  // bought the last few while this customer was browsing), flag it instead
  // of silently changing their cart for them.
  const stockIssues = cart.filter((item) => item.quantity > maxAvailable(item));
  const hasStockIssue = stockIssues.length > 0;

  function handleIncrement(item) {
    const max = maxAvailable(item);
    if (item.quantity >= max) return; // already at the limit — button should be disabled anyway
    updateQuantity(item.id, "inc");
  }

  return (
    <>
      <Navbar />

      <div
        className="min-h-screen py-10 px-4"
        style={{ background: T.bg, color: T.text }}
      >
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: T.text }}>Your Cart</h1>
              <p className="text-sm mt-1" style={{ color: T.muted }}>
                {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
              </p>
            </div>
            <Link
              to="/shop"
              className="flex items-center gap-2 text-sm font-medium text-amber-500 hover:text-amber-600"
            >
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>

          {cart.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <ShoppingBag size={80} className="text-amber-300 mb-6" />
              <h2 className="text-2xl font-bold mb-2" style={{ color: T.text }}>
                Your cart is empty
              </h2>
              <p className="mb-8" style={{ color: T.muted }}>
                Looks like you haven't added anything yet.
              </p>
              <Link
                to="/shop"
                className="bg-amber-400 hover:bg-amber-500 text-white font-semibold px-8 py-3 rounded-full transition"
              >
                Start Shopping
              </Link>
            </motion.div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">

              {/* Cart Items */}
              <div className="flex-1 space-y-4">
                <AnimatePresence>
                  {cart.map((item) => {
                    const max = maxAvailable(item);
                    const atMax = item.quantity >= max;
                    const overStock = item.quantity > max;

                    return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-2xl shadow-sm p-4 flex gap-4 items-center"
                      style={{ background: T.card, border: overStock ? "1.5px solid #EF4444" : "none" }}
                    >
                      {/* Image */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h2
                          className="font-bold text-lg truncate"
                          style={{ color: T.text }}
                        >
                          {item.name}
                        </h2>
                        <p className="text-sm" style={{ color: T.muted }}>
                          {item.category}
                        </p>
                        <p className="font-semibold mt-1 text-amber-500">
                          ₦{item.price.toLocaleString()}
                        </p>
                        {overStock ? (
                          <p className="text-xs mt-1 font-semibold" style={{ color: "#EF4444" }}>
                            Only {max} left — please reduce quantity
                          </p>
                        ) : atMax && max > 0 ? (
                          <p className="text-xs mt-1" style={{ color: T.muted }}>
                            Max available: {max}
                          </p>
                        ) : null}
                      </div>

                      {/* Quantity + Delete */}
                      <div className="flex flex-col items-end gap-3">
                        {/* Quantity Controls */}
                        <div
                          className="flex items-center gap-2 rounded-full px-3 py-1"
                          style={{ background: T.surface }}
                        >
                          <button
                            onClick={() => updateQuantity(item.id, "dec")}
                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-amber-400 hover:text-white transition"
                            style={{ color: T.text }}
                          >
                            <Minus size={12} />
                          </button>
                          <span
                            className="w-5 text-center font-semibold text-sm"
                            style={{ color: T.text }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleIncrement(item)}
                            disabled={atMax}
                            className="w-6 h-6 flex items-center justify-center rounded-full transition"
                            style={
                              atMax
                                ? { color: T.muted, cursor: "not-allowed", opacity: 0.5 }
                                : { color: T.text }
                            }
                            onMouseEnter={(e) => { if (!atMax) { e.currentTarget.style.background = "#F59E0B"; e.currentTarget.style.color = "#fff"; } }}
                            onMouseLeave={(e) => { if (!atMax) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.text; } }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Item subtotal */}
                        <p
                          className="text-sm font-bold"
                          style={{ color: T.text }}
                        >
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </p>

                        {/* Delete */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="cursor-pointer transition"
                          style={{ color: T.muted }}
                        >
                          <Trash2 size={18} className="hover:text-red-500"/>
                        </button>
                      </div>
                    </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Clear Cart */}
                <button
                  onClick={clearCart}
                  className="text-sm hover:text-red-600 transition mt-2 text-red-400"
                >
                  Clear entire cart
                </button>
              </div>

              {/* Order Summary */}
              <div className="lg:w-80">
                <div
                  className="rounded-2xl shadow-sm p-6 sticky top-24"
                  style={{ background: T.card }}
                >
                  <h2
                    className="text-xl font-bold mb-6"
                    style={{ color: T.text }}
                  >
                    Order Summary
                  </h2>

                  <div className="space-y-3 text-sm">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between"
                        style={{ color: T.muted }}
                      >
                        <span className="truncate max-w-[160px]">
                          {item.name} × {item.quantity}
                        </span>
                        <span
                          className="font-medium"
                          style={{ color: T.text }}
                        >
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    className="border-t my-4"
                    style={{ borderColor: T.border }}
                  />

                  <div className="flex justify-between font-bold text-lg">
                    <span style={{ color: T.text }}>Subtotal</span>
                    <span className="text-amber-500">₦{subtotal.toLocaleString()}</span>
                  </div>

                  <p
                    className="text-xs mt-2 mb-6"
                    style={{ color: T.muted }}
                  >
                    Delivery fee (if you choose delivery) is calculated at checkout based on your state.
                  </p>

                  {hasStockIssue && (
                    <div
                      className="text-xs mb-4 p-3 rounded-lg font-medium"
                      style={{ background: "#FEF2F2", color: "#B91C1C" }}
                    >
                      Some items exceed what's currently in stock. Please reduce their quantity before checking out.
                    </div>
                  )}

                  {/* Proceed to Checkout — this is what actually creates the order */}
                  <button
                    onClick={() => navigate("/checkout")}
                    disabled={hasStockIssue}
                    className="w-full font-bold py-3 rounded-full flex items-center justify-center gap-2 transition"
                    style={
                      hasStockIssue
                        ? { background: T.surface, color: T.muted, cursor: "not-allowed" }
                        : { background: "#F59E0B", color: "#fff" }
                    }
                  >
                    Proceed to Checkout
                  </button>

                  {/* WhatsApp is now support-only, not the order mechanism —
                      placing an order here always goes through Checkout so it's
                      properly recorded in Firestore with payment/fulfillment/
                      inventory tracking. */}
                  <a
                    href="https://wa.me/2349127170775"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-3 flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-full border transition"
                    style={{ borderColor: T.border, color: T.muted }}
                  >
                    <FaWhatsapp size={16} className="text-green-500" />
                    Questions? Chat with us
                  </a>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;