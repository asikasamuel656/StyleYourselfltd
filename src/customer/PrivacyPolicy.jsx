import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

const PrivacyPolicy = () => {
  return (
    <>
      <Navbar/>
      <div className="min-h-screen bg-white font-sans">

        <div className="bg-black text-white px-6 sm:px-12 lg:px-24 py-12">
          <p className="text-xs uppercase tracking-widest text-amber-400 mb-2">StyleYourself</p>
          <h1 className="text-3xl sm:text-4xl font-bold">Privacy Policy</h1>
          <p className="mt-3 text-gray-400 text-sm max-w-lg leading-relaxed">
            Your privacy matters as much as your style. Here's what we collect, why, and how we protect it — in plain English.
          </p>
        </div>

        <div className="px-6 sm:px-12 lg:px-24 py-12 max-w-4xl">

          {[
            {
              label: "Who we are",
              items: [{ body: "StyleYourself is an online fashion store based in Nigeria. We are the data controller responsible for any personal information you share with us when you shop, browse, or contact us." }],
            },
            {
              label: "What we collect",
              items: [
                { title: "Account & order information", body: "Name, email address, phone number, and delivery address when you place an order or create an account." },
                { title: "Payment information", body: "We do not store your card details. Payments are processed securely by third-party payment providers." },
                { title: "Device & usage data", body: "Browser type, IP address, pages visited, and time spent on our site. This helps us improve your shopping experience." },
                { title: "Communications", body: "Messages you send us via email, WhatsApp, or our contact form." },
              ],
            },
            {
              label: "How we use your data",
              items: [
                { title: "To fulfil your orders", body: "Processing payments, arranging delivery, and sending order updates." },
                { title: "To provide customer support", body: "Responding to your enquiries, complaints, and return requests." },
                { title: "To send you offers", body: "Only if you've consented. You can opt out of marketing emails at any time." },
                { title: "To comply with the law", body: "Including the Nigeria Data Protection Act (NDPA) 2023 and any other applicable regulations." },
              ],
            },
            {
              label: "Your rights",
              items: [
                { title: "Access", body: "You can request a copy of the personal data we hold about you at any time." },
                { title: "Correction", body: "If any information we hold is inaccurate, you have the right to have it corrected." },
                { title: "Deletion", body: "You can ask us to delete your personal data, subject to any legal obligations we may have to retain it." },
                { title: "Opt out", body: "You can withdraw consent for marketing communications at any time by contacting us or clicking unsubscribe." },
              ],
            },
            {
              label: "How we protect your data",
              items: [
                { body: "We use industry-standard security measures to protect your data from unauthorized access, loss, or disclosure. We do not sell your personal information to third parties — ever." },
                { title: "Third-party services", body: "We work with trusted providers (e.g. payment processors, delivery partners) who are bound by their own privacy obligations. We only share the data they need to carry out their service." },
              ],
            },
            {
              label: "Cookies",
              items: [{ body: "We use cookies to keep your shopping cart active and understand how visitors use our site. You can disable cookies in your browser settings, though some features may not work as expected." }],
            },
          ].map(({ label, items }) => (
            <section key={label} className="mb-10">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-amber-500 mb-4">{label}</p>
              <div className="flex flex-col gap-3">
                {items.map(({ title, body }, i) => (
                  <div key={i} className="flex gap-4 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
                    <span className="w-2 h-2 mt-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {title && <span className="font-medium text-gray-900">{title} — </span>}{body}
                    </p>
                  </div>
                ))}
              </div>
              <hr className="border-amber-100 mt-10" />
            </section>
          ))}

          <div className="border-l-4 border-amber-400 bg-amber-50 border border-amber-100 rounded-lg px-5 py-4 mb-10">
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-medium text-gray-900">Questions about your privacy?</span> Contact us at{" "}
              <span className="font-medium text-gray-900">styleyourself@gmail.com</span> or via WhatsApp. We aim to respond within 7 business days.
            </p>
          </div>

          <div className="flex gap-6 text-xs text-gray-400">
            <Link to="/customer/faqs" className="hover:text-amber-500 transition-colors">FAQs</Link>
            <Link to="/customer/delivery" className="hover:text-amber-500 transition-colors">Delivery</Link>
            <Link to="/customer/return-refund" className="hover:text-amber-500 transition-colors">Returns & Refunds</Link>
          </div>
          <p className="text-[11px] text-gray-600 mt-4">Last updated: June 2026 · Governed by the Nigeria Data Protection Act (NDPA) 2023.</p>
        </div>
      </div>
    </> 
  );
};

export default PrivacyPolicy;