import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

const Delivery = () => {
  return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-white font-sans">

        {/* Header */}
        <div className="bg-black text-white px-6 sm:px-12 lg:px-24 py-12">
          <p className="text-xs uppercase tracking-widest text-amber-400 mb-2">StyleYourself</p>
          <h1 className="text-3xl sm:text-4xl font-bold">Delivery Policy</h1>
          <p className="mt-3 text-gray-400 text-sm max-w-lg leading-relaxed">
            Everything you need to know about how we get your order from us to you — quickly, safely, and without the stress.
          </p>
        </div>

        <div className="px-6 sm:px-12 lg:px-24 py-12 max-w-4xl">

          {/* At a glance */}
          <section className="mb-10">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-amber-500 mb-4">At a glance</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Processing time", value: "1 business day", sub: "After order confirmation" },
                { label: "Standard delivery", value: "1 – 3 business days", sub: "Within Nigeria" },
                { label: "Express delivery", value: "1 - 2 business days", sub: "Selected locations" },
                { label: "Free delivery", value: "Orders above ₦500,000", sub: "Abuja only" },
              ].map(({ label, value, sub }) => (
                <div key={label} className="border border-amber-100 rounded-xl p-4 bg-amber-50">
                  <p className="text-[10px] uppercase tracking-widest text-amber-600 mb-1">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{value}</p>
                  <p className="text-[11px] text-amber-700 mt-1">{sub}</p>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-amber-100 mb-10" />

          {/* How it works */}
          <section className="mb-10">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-amber-500 mb-4">How it works</p>
            <div className="flex flex-col gap-3">
              {[
                { title: "Order confirmation", body: "Once your payment is verified, you'll receive a confirmation email or WhatsApp message within 30 minutes." },
                { title: "Processing", body: "We carefully pick, quality-check, and package your items within 24 hours. Orders placed after 4 PM are processed the next business day." },
                { title: "Dispatch & tracking", body: "Your order is handed to our delivery partner and you'll receive a tracking number to follow your package in real time." },
                { title: "Delivery", body: "Our courier will contact you before arrival. Please ensure someone is available to receive the package at your address." },
              ].map(({ title, body }) => (
                <div key={title} className="flex gap-4 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                  <span className="w-2 h-2 mt-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600 leading-relaxed">
                    <span className="font-medium text-gray-900">{title} — </span>{body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-amber-100 mb-10" />

          {/* Delivery fees */}
          <section className="mb-10">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-amber-500 mb-4">Delivery fees</p>
            <div className="flex flex-col gap-3">
              {[
                { title: "Lagos", body: "₦10,000 flat rate." },
                { title: "Abuja", body: "Free on orders above ₦500,000." },
                { title: "Other states", body: "₦10,500 – ₦15,000 depending on location. Calculated at checkout." },
                { title: "International", body: "We currently deliver within Nigeria only. International shipping coming soon." },
              ].map(({ title, body }) => (
                <div key={title} className="flex gap-4 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                  <span className="w-2 h-2 mt-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600 leading-relaxed">
                    <span className="font-medium text-gray-900">{title} — </span>{body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-amber-100 mb-10" />

          {/* Important notes */}
          <section className="mb-10">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-amber-500 mb-4">Important notes</p>
            <div className="flex flex-col gap-3">
              {[
                { title: "Failed deliveries", body: "If delivery fails due to an incorrect address or no one being available, a redelivery fee may apply. Please double-check your address before checkout." },
                { title: "Public holidays", body: "Deliveries do not occur on public holidays. Timelines may shift slightly during festive periods (Christmas, Eid, etc.)." },
                { title: "Damaged items", body: "If your item arrives damaged, contact us within 24 hours with a photo. We'll resolve it promptly — see our Returns & Refunds policy." },
              ].map(({ title, body }) => (
                <div key={title} className="flex gap-4 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                  <span className="w-2 h-2 mt-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600 leading-relaxed">
                    <span className="font-medium text-gray-900">{title} — </span>{body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Notice */}
          <div className="border-l-4 border-amber-400 bg-amber-50 border border-amber-100 rounded-lg px-5 py-4 mb-10">
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-medium text-gray-900">Need help with your order?</span> Reach us on WhatsApp or email within business hours (Mon – Sat, 9 AM – 9 PM).
            </p>
          </div>

          <div className="flex gap-6 text-xs text-gray-400">
            <Link to="/customer/faqs" className="hover:text-amber-500 transition-colors">FAQs</Link>
            <Link to="/customer/return-refund" className="hover:text-amber-500 transition-colors">Returns & Refunds</Link>
            <Link to="/customer/privacy-policy" className="hover:text-amber-500 transition-colors">Privacy Policy</Link>
          </div>
          <p className="text-[11px] text-gray-600 mt-4">Last updated: June 2026</p>
        </div>
      </div>
    </>
  );
};

export default Delivery;