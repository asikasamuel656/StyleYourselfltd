import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

const faqs = [
  {
    category: "Orders & payment",
    items: [
      { q: "How do I place an order?", a: "Browse our shop, add items to your cart, and proceed to checkout. You'll need to provide your delivery address and complete payment. You'll receive a confirmation message once your order is confirmed." },
      { q: "What payment methods do you accept?", a: "We accept bank transfers, card payments (Visa & Mastercard), and mobile payment options. All payments are processed securely. We do not accept cash on delivery at this time." },
      { q: "Can I modify or cancel my order after placing it?", a: "You can request a modification or cancellation within 2 hours of placing your order by contacting us via WhatsApp. Once your order has been dispatched, we are unable to make changes." },
      { q: "I paid but didn't get a confirmation — what should I do?", a: "Check your spam or junk folder first. If you still haven't received a confirmation after 30 minutes, contact us with your payment receipt and we'll sort it out right away." },
    ],
  },
  {
    category: "Delivery",
    items: [
      { q: "How long does delivery take?", a: "Standard delivery within Lagos and Abuja takes 1–2 business days. Other states typically take 3–4 business days. Express delivery (1–3 days) is available in selected locations." },
      { q: "How can I track my order?", a: "Once your order is dispatched, you'll receive a tracking number via SMS or WhatsApp. You can use this to monitor your delivery in real time through our courier partner's platform." },
      { q: "Do you deliver outside Nigeria?", a: "We currently deliver within Nigeria only. International shipping is something we're working on — stay tuned for updates!" },
      { q: "What happens if no one is home to receive my order?", a: "Our courier will call you before arriving. If delivery fails, they will attempt redelivery the next business day. A redelivery fee may apply for repeated missed deliveries." },
    ],
  },
  {
    category: "Returns & refunds",
    items: [
      { q: "What is your return policy?", a: "We accept returns within 7 days of delivery, provided the item is unworn, unwashed, and in its original packaging with all tags attached. Sale items are non-returnable." },
      { q: "My item arrived damaged — what do I do?", a: "Please contact us within 24 hours of receiving your order with a photo of the damaged item. We'll arrange a replacement or refund as quickly as possible." },
      { q: "How long does a refund take?", a: "Once we receive and inspect your return, refunds are processed within 1–2 business days. The time it takes to reflect in your account depends on your bank or payment provider." },
    ],
  },
  {
    category: "Products & sizing",
    items: [
      { q: "How do I know what size to order?", a: "Each product page includes a size guide with measurements. If you're between sizes, we generally recommend sizing up. Still unsure? Contact us and we'll help you choose." },
      { q: "Are the colors accurate in the photos?", a: "We do our best to represent colors accurately, but slight variations may occur due to different screen settings and lighting conditions during photography." },
      { q: "An item I want is out of stock — will it come back?", a: "Popular items are often restocked. You can add it to your wishlist or contact us to be notified when it's back in." },
    ],
  },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
      <div className={`border rounded-xl overflow-hidden mb-2 transition-colors ${open ? "border-amber-300" : "border-gray-100"}`}>
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex justify-between items-center gap-3 text-left px-4 py-3.5 bg-white hover:bg-amber-50 transition-colors"
        >
          <span className="text-sm font-medium text-gray-900">{q}</span>
          <span className={`text-amber-400 text-lg transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}>&#8964;</span>
        </button>
        {open && (
          <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed bg-amber-50 border-t border-amber-100">
            {a}
          </div>
        )}
      </div>
    );
  };

  const FAQs = () => {
    return (
      <>
        <Navbar/>
        <div className="min-h-screen bg-white font-sans">

          <div className="bg-black text-white px-6 sm:px-12 lg:px-24 py-12">
            <p className="text-xs uppercase tracking-widest text-amber-400 mb-2">StyleYourself</p>
            <h1 className="text-3xl sm:text-4xl font-bold">Frequently asked questions</h1>
            <p className="mt-3 text-gray-400 text-sm max-w-lg leading-relaxed">
              Can't find your answer? Reach us on WhatsApp or email — we're happy to help.
            </p>
          </div>

          <div className="px-6 sm:px-12 lg:px-24 py-12 max-w-4xl">
            {faqs.map(({ category, items }) => (
              <section key={category} className="mb-10">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-amber-500 mb-4">{category}</p>
                {items.map((item) => <FAQItem key={item.q} {...item} />)}
              </section>
            ))}

            <hr className="border-amber-100 mb-10" />

            <div className="border-l-4 border-amber-400 bg-amber-50 border border-amber-100 rounded-lg px-5 py-4 mb-10">
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-medium text-gray-900">Still have a question?</span> Email us at{" "}
                <span className="font-medium text-gray-900">styleyourself@gmail.com</span> or WhatsApp — we respond within 24 hours on business days.
              </p>
            </div>

            <div className="flex gap-6 text-xs text-gray-400">
              <Link to="/customer/delivery" className="hover:text-amber-500 transition-colors">Delivery</Link>
              <Link to="/customer/return-refund" className="hover:text-amber-500 transition-colors">Returns & Refunds</Link>
              <Link to="/customer/privacy-policy" className="hover:text-amber-500 transition-colors">Privacy Policy</Link>
            </div>
            <p className="text-[11px] text-gray-600 mt-4">Last updated: June 2026</p>
          </div>
        </div>
      </>
  );
};
export default FAQs;