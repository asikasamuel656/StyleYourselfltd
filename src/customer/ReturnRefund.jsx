import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

const ReturnRefund = () => {
  return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-white font-sans">

        <div className="bg-black text-white px-6 sm:px-12 lg:px-24 py-12">
          <p className="text-xs uppercase tracking-widest text-amber-400 mb-2">StyleYourself</p>
          <h1 className="text-3xl sm:text-4xl font-bold">Returns & Refunds</h1>
          <p className="mt-3 text-gray-400 text-sm max-w-lg leading-relaxed">
            We want you to love what you ordered. If something isn't right, here's exactly how we make it right.
          </p>
        </div>

        <div className="px-6 sm:px-12 lg:px-24 py-12 max-w-4xl">

          {/* At a glance */}
          <section className="mb-10">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-amber-500 mb-4">At a glance</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Return window", value: "7 days", sub: "From delivery date" },
                { label: "Refund timeline", value: "1 – 2 business days", sub: "After we receive item" },
                { label: "Exchange", value: "Available", sub: "Size or color swap" },
                { label: "Damaged items", value: "Report within 24 hrs", sub: "With photo evidence" },
              ].map(({ label, value, sub }) => (
                <div key={label} className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-widest text-amber-600 mb-1">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{value}</p>
                  <p className="text-[11px] text-amber-700 mt-1">{sub}</p>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-amber-100 mb-10" />

          {/* What can be returned */}
          <section className="mb-10">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-amber-500 mb-4">What can be returned</p>
            <div className="flex flex-wrap gap-2 mb-2">
              {["Unworn & unwashed items", "Original tags attached", "Original packaging intact", "Returned within 7 days"].map((t) => (
                <span key={t} className="text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full">
                  ✓ {t}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {["Sale / discounted items", "Worn or washed items", "Items without tags", "Intimate apparel"].map((t) => (
                <span key={t} className="text-[11px] font-medium bg-red-50 text-red-700 border border-red-100 px-3 py-1 rounded-full">
                  ✕ {t}
                </span>
              ))}
            </div>
          </section>

          <hr className="border-amber-100 mb-10" />

          {/* How to return */}
          <section className="mb-10">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-amber-500 mb-4">How to return an item</p>
            <div className="flex flex-col divide-y divide-amber-100">
              {[
                { title: "Contact us first", body: "Reach out via WhatsApp or email within 7 days of receiving your order. Tell us your order number and the reason for your return." },
                { title: "Get return approval", body: "We'll review your request and confirm eligibility within 1–2 business days. Do not send items back without our approval." },
                { title: "Send the item back", body: "Pack the item securely in its original packaging and ship to the address we provide. Return shipping costs are covered by the customer unless the item is faulty." },
                { title: "Inspection & resolution", body: "Once we receive and inspect the item, we'll process your refund or exchange within 3–5 business days." },
              ].map(({ title, body }, i) => (
                <div key={title} className="flex gap-4 py-4">
                  <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-xs font-semibold text-black flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-amber-100 mb-10" />

          {/* Refunds & Damaged */}
          {[
            {
              label: "Refunds",
              items: [
                { title: "How refunds are issued", body: "Refunds are returned to your original payment method. We do not issue cash refunds." },
                { title: "Processing time", body: "Allow 3–5 business days after we confirm receipt of your return. Your bank may take additional time to reflect the credit." },
                { title: "Shipping fees", body: "Original delivery fees are non-refundable unless the return is due to our error or a faulty item." },
              ],
            },
            {
              label: "Damaged or wrong items",
              items: [
                { title: "Report within 24 hours", body: "If your item arrives damaged, defective, or is the wrong item, contact us within 24 hours of delivery with a clear photo. We'll arrange a free replacement or full refund." },
                { title: "We cover return shipping", body: "For faulty or incorrect items, StyleYourself will cover the cost of returning the item to us." },
              ],
            },
          ].map(({ label, items }) => (
            <section key={label} className="mb-10">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-amber-500 mb-4">{label}</p>
              <div className="flex flex-col gap-3">
                {items.map(({ title, body }) => (
                  <div key={title} className="flex gap-4 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                    <span className="w-2 h-2 mt-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <p className="text-sm text-gray-600 leading-relaxed">
                      <span className="font-medium text-gray-900">{title} — </span>{body}
                    </p>
                  </div>
                ))}
              </div>
              <hr className="border-amber-100 mt-10" />
            </section>
          ))}

          <div className="border-l-4 border-amber-400 bg-amber-50 border border-amber-100 rounded-lg px-5 py-4 mb-10">
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-medium text-gray-900">Need to start a return?</span> Contact us at{" "}
              <span className="font-medium text-gray-900">styleyourself@gmail.com</span> or WhatsApp with your order number. We respond within 24 hours (Mon – Sat, 9 AM – 6 PM).
            </p>
          </div>

          <div className="flex gap-6 text-xs text-gray-400">
            <Link to="/customer/faqs" className="hover:text-amber-500 transition-colors">FAQs</Link>
            <Link to="/customer/delivery" className="hover:text-amber-500 transition-colors">Delivery</Link>
            <Link to="/customer/privacy-policy" className="hover:text-amber-500 transition-colors">Privacy Policy</Link>
          </div>
          <p className="text-[11px] text-gray-600 mt-4">Last updated: June 2026</p>
        </div>
      </div>
    </>  
  );
};

export default ReturnRefund;