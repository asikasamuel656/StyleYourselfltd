// src/pages/Checkout.jsx
//
// ASSUMPTIONS (adjust if wrong):
// - Cart state comes from useStore() in "../context/StoreContext", same as
//   the rest of the app (cart, clearCart already exist there).
// - Cart items look like { ...productFields, quantity }, matching what
//   Shop.jsx passes into addToCart(item).
// - Cloudinary product images are already full URLs (item.image).
// - This page is NOT yet wired into your router — add a route for it
//   (e.g. <Route path="/checkout" element={<Checkout />} />) and point your
//   Cart page's "Proceed to Checkout" button at that route.
//
// WHAT THIS PAGE DOES:
// Creates a real order document in a new Firestore "orders" collection.
// Payment policy: delivery is strictly bank transfer, confirmed manually by
// the admin before the order ships. Pickup allows either bank transfer or
// cash paid in person at pickup. No online gateway is wired up.

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useStore } from "../context/StoreContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import {
  DELIVERY_FEES_BY_STATE,
  CUSTOMER_DELIVERY_SHARE,
  getDeliveryFee,
} from "../pages/Deliveryfees.js";
import { BANK_DETAILS } from "../pages/Bankdetails.js";

const STATE_OPTIONS = Object.keys(DELIVERY_FEES_BY_STATE);

export default function Checkout() {
  const { cart, clearCart } = useStore();
  const { T } = useTheme();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("delivery"); // "delivery" | "pickup"
  const [paymentMethod, setPaymentMethod] = useState("transfer"); // "transfer" | "cash" — cash only ever valid for pickup
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null); // holds order summary after success

  // Delivery is strictly bank transfer — if someone switches from pickup+cash
  // to delivery, force the payment method back to transfer automatically.
  useEffect(() => {
    if (deliveryMethod === "delivery" && paymentMethod !== "transfer") {
      setPaymentMethod("transfer");
    }
  }, [deliveryMethod]);

  const productsTotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.price) * (item.quantity || 1), 0),
    [cart]
  );

  const deliveryFee = deliveryMethod === "delivery" && state ? getDeliveryFee(state) : 0;
  const customerDeliveryShare = Math.round(deliveryFee * CUSTOMER_DELIVERY_SHARE);
  const storeDeliveryShare = deliveryFee - customerDeliveryShare;
  const orderTotal = productsTotal + (deliveryMethod === "delivery" ? customerDeliveryShare : 0);

  function validate() {
    const errs = {};
    if (!fullName.trim()) errs.fullName = "Full name is required.";
    if (!phone.trim()) errs.phone = "Phone number is required.";
    if (deliveryMethod === "delivery") {
      if (!state) errs.state = "Please select your state.";
      if (!address.trim()) errs.address = "Delivery address is required.";
    }
    if (cart.length === 0) errs.cart = "Your cart is empty.";
    return errs;
  }

  async function handlePlaceOrder() {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const orderPayload = {
        customer: {
          name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
        },
        delivery: {
          method: deliveryMethod,
          state: deliveryMethod === "delivery" ? state : null,
          address: deliveryMethod === "delivery" ? address.trim() : null,
          fee: deliveryFee,
          customerShare: deliveryMethod === "delivery" ? customerDeliveryShare : 0,
          storeShare: deliveryMethod === "delivery" ? storeDeliveryShare : 0,
        },
        customerNotes: notes.trim() || null,

        // Frozen snapshot of what was actually purchased — never changes
        // even if the product's price/details change later.
        items: cart.map((item) => ({
          productId: item.id,
          name: item.name,
          price: Number(item.price),
          quantity: item.quantity || 1,
          size: item.size || null,
          color: item.color || null,
          image: item.image || null,
        })),

        productsTotal,
        orderTotal,

        payment: {
          method: paymentMethod, // "transfer" | "cash"
          status: "Pending", // admin marks Paid manually once transfer/cash is confirmed
        },
        fulfillment: {
          status: "Pending",
        },
        inventory: {
          status: "Reserved", // stock is NOT deducted yet — only at Dispatch
        },

        timeline: [
          { label: "Order Created", at: new Date().toISOString() },
        ],
        auditLog: [],

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderPayload);

      setPlacedOrder({ id: docRef.id, ...orderPayload });
      clearCart();
    } catch (err) {
      console.error("Failed to place order:", err);
      setErrors({ submit: "Something went wrong placing your order. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success screen ──
  if (placedOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: T.bg }}>
        <div className="w-full max-w-md rounded-2xl p-8 text-center" style={{ background: T.card, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
          <h1 className="text-xl font-bold mb-2" style={{ color: T.text }}>Order placed!</h1>
          <p className="text-sm mb-4" style={{ color: T.muted }}>Order ID: <span style={{ color: T.text, fontWeight: 600 }}>{placedOrder.id}</span></p>

          {placedOrder.payment.method === "transfer" ? (
            <>
              <p className="text-sm mb-4" style={{ color: T.muted }}>
                {placedOrder.delivery.method === "delivery"
                  ? "Please transfer the amount below — we'll begin processing your order as soon as payment is confirmed."
                  : "Please transfer the amount below — your order will be ready once payment is confirmed."}
              </p>
              <div className="rounded-xl p-4 mb-6 text-left" style={{ background: T.bg }}>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: T.muted }}>Bank</span>
                  <span style={{ color: T.text, fontWeight: 600 }}>{BANK_DETAILS.bankName}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: T.muted }}>Account Number</span>
                  <span style={{ color: T.text, fontWeight: 600 }}>{BANK_DETAILS.accountNumber}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span style={{ color: T.muted }}>Account Name</span>
                  <span style={{ color: T.text, fontWeight: 600 }}>{BANK_DETAILS.accountName}</span>
                </div>
                <div className="pt-3 border-t flex justify-between font-bold" style={{ borderColor: T.muted + "33", color: "#F59E0B" }}>
                  <span>Amount to transfer</span>
                  <span>₦{placedOrder.orderTotal.toLocaleString()}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm mb-6" style={{ color: T.muted }}>
              Please visit our store to pick up your order and pay ₦{placedOrder.orderTotal.toLocaleString()} in cash.
            </p>
          )}

          <button
            onClick={() => navigate("/shop")}
            className="w-full py-3 rounded-full font-semibold text-sm"
            style={{ background: "#F59E0B", color: "#fff" }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: T.bg }}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6" style={{ color: T.text }}>Checkout</h1>

        {cart.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: T.card }}>
            <p style={{ color: T.muted }}>Your cart is empty.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-5">
            {/* ── Order summary ── */}
            <div className="md:col-span-2 rounded-2xl p-5 h-fit" style={{ background: T.card }}>
              <h2 className="font-semibold mb-4" style={{ color: T.text }}>Order Summary</h2>
              <div className="space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: T.text }}>{item.name}</p>
                      <p className="text-xs" style={{ color: T.muted }}>Qty {item.quantity || 1}</p>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: T.text }}>
                      ₦{(Number(item.price) * (item.quantity || 1)).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t space-y-2" style={{ borderColor: T.muted + "33" }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: T.muted }}>Products subtotal</span>
                  <span style={{ color: T.text }}>₦{productsTotal.toLocaleString()}</span>
                </div>

                {deliveryMethod === "delivery" && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: T.muted }}>Delivery fee (total)</span>
                      <span style={{ color: T.text }}>₦{deliveryFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: T.muted }}>— You cover (70%)</span>
                      <span style={{ color: T.text }}>₦{customerDeliveryShare.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: T.muted }}>— We cover (30%)</span>
                      <span style={{ color: "#10B981" }}>₦{storeDeliveryShare.toLocaleString()}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between font-bold pt-2 border-t" style={{ borderColor: T.muted + "33", color: T.text }}>
                  <span>Total to pay</span>
                  <span>₦{orderTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* ── Customer + delivery details ── */}
            <div className="md:col-span-3 rounded-2xl p-5" style={{ background: T.card }}>
              <h2 className="font-semibold mb-4" style={{ color: T.text }}>Your Details</h2>

              <Field label="Full Name" value={fullName} onChange={setFullName} error={errors.fullName} T={T} />
              <Field label="Phone Number" value={phone} onChange={setPhone} error={errors.phone} T={T} />
              <Field label="Email (optional)" value={email} onChange={setEmail} T={T} />

              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: T.muted }}>
                  How should we get this to you?
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeliveryMethod("delivery")}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold border-2"
                    style={
                      deliveryMethod === "delivery"
                        ? { borderColor: "#F59E0B", background: "#FEF3C7", color: "#92400E" }
                        : { borderColor: T.muted + "33", background: "transparent", color: T.muted }
                    }
                  >
                    Deliver to me
                  </button>
                  <button
                    onClick={() => setDeliveryMethod("pickup")}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold border-2"
                    style={
                      deliveryMethod === "pickup"
                        ? { borderColor: "#F59E0B", background: "#FEF3C7", color: "#92400E" }
                        : { borderColor: T.muted + "33", background: "transparent", color: T.muted }
                    }
                  >
                    I'll pick it up
                  </button>
                </div>
              </div>

              {deliveryMethod === "delivery" && (
                <>
                  <div className="mb-4">
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: T.muted }}>State</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:!border-[#F59E0B]"
                      style={{ background: T.bg, borderColor: T.muted + "44", color: T.text }}
                    >
                      <option value="">Select your state…</option>
                      {STATE_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.state && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{errors.state}</p>}
                  </div>

                  <Field label="Delivery Address" value={address} onChange={setAddress} error={errors.address} T={T} textarea className="resize-none" />

                  {state && (
                    <div className="mb-4 p-3 rounded-lg text-xs" style={{ background: "#FEF3C7", color: "#92400E" }}>
                      Delivery to {state} costs ₦{deliveryFee.toLocaleString()} total. You'll pay ₦{customerDeliveryShare.toLocaleString()} of that (70%) — we cover the rest.
                    </div>
                  )}

                  <div className="mb-4 p-3 rounded-lg text-xs" style={{ background: "#EFF6FF", color: "#1E40AF" }}>
                    Delivery orders are paid by bank transfer only — we ship once your transfer is confirmed. You'll see our account details after placing this order.
                  </div>
                </>
              )}

              {deliveryMethod === "pickup" && (
                <>
                  <div className="mb-4 p-3 rounded-lg text-xs" style={{ background: "#ECFDF5", color: "#065F46" }}>
                    No delivery fee for pickup.
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: T.muted }}>
                      How will you pay?
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setPaymentMethod("transfer")}
                        className="flex-1 py-2.5 rounded-lg text-sm font-semibold border-2"
                        style={
                          paymentMethod === "transfer"
                            ? { borderColor: "#F59E0B", background: "#FEF3C7", color: "#92400E" }
                            : { borderColor: T.muted + "33", background: "transparent", color: T.muted }
                        }
                      >
                        Bank Transfer
                      </button>
                      <button
                        onClick={() => setPaymentMethod("cash")}
                        className="flex-1 py-2.5 rounded-lg text-sm font-semibold border-2"
                        style={
                          paymentMethod === "cash"
                            ? { borderColor: "#F59E0B", background: "#FEF3C7", color: "#92400E" }
                            : { borderColor: T.muted + "33", background: "transparent", color: T.muted }
                        }
                      >
                        Cash at Pickup
                      </button>
                    </div>
                  </div>
                </>
              )}

              <Field label="Notes for us (optional)" className="resize-none min-h-25" value={notes} onChange={setNotes} T={T} textarea />

              {errors.submit && <p className="text-xs mb-3" style={{ color: "#EF4444" }}>{errors.submit}</p>}

              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full py-3 rounded-full font-semibold text-sm"
                style={{ background: submitting ? T.muted : "#F59E0B", color: "#fff" }}
              >
                {submitting
                  ? "Placing order…"
                  : paymentMethod === "transfer"
                  ? `Place Order — Pay ₦${orderTotal.toLocaleString()} by Transfer`
                  : `Place Order — Pay ₦${orderTotal.toLocaleString()} in Cash`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  T,
  textarea,
  className = "",
}) {
  const Component = textarea ? "textarea" : "input";

  return (
    <div className="mb-4">
      <label
        className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
        style={{ color: T.muted }}
      >
        {label}
      </label>

      <Component
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={textarea ? 3 : undefined}
        className={`w-full rounded-lg px-3 py-2.5 text-sm border transition-colors focus:outline-none focus:!border-[#F59E0B] ${className}`}
        style={{
          background: T.bg,
          borderColor: T.muted + "44",
          color: T.text,
        }}
      />

      {error && (
        <p className="text-xs mt-1" style={{ color: "#EF4444" }}>
          {error}
        </p>
      )}
    </div>
  );
}