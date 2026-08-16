import { useState } from "react";
import { motion } from "framer-motion";
import { FaWhatsapp, FaGem, FaUserTie, FaTshirt } from "react-icons/fa";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import SubSlider from "./SubSlider.jsx";
import mannequinPolo from "../assets/mannequin-polo.jpg";
import lounge from "../assets/lounge-corner.jpg";
import { useTheme } from "../context/ThemeContext.jsx";

const STORE = {
  email: "styleyourself@gmail.com",
  whatsapp: "2349127170775",
  phone: "+234 912 717 0775",
};

const services = [
  {
    icon: <FaTshirt size={20} />,
    title: "Smart Casual Styling",
    body: "Elevate your everyday with perfectly balanced casual and semi-formal outfits that fit your lifestyle.",
  },
  {
    icon: <FaUserTie size={20} />,
    title: "Signature Look",
    body: "Create a unique personal style that matches your personality, lifestyle, and fashion goals.",
  },
  {
    icon: <FaGem size={20} />,
    title: "Luxury Essentials",
    body: "Build a wardrobe with quality footwear, fragrances, and accessories that reflect confidence and timeless style.",
  },
];

const occasions = ["Everyday / Personal", "Corporate / Executive", "Event / Red Carpet", "Travel"];
const budgets = ["Under ₦50,000", "₦50,000 – ₦150,000", "₦150,000 – ₦500,000", "₦500,000+"];

const Styling = () => {
  const { T } = useTheme();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    occasion: occasions[0],
    budget: budgets[1],
    style: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    // ── HINT IDENTIFIER & FORMATTING ──
    const subject = `[STYLING CONSULTATION REQUEST] - ${form.name}`;
    const body = `
    SOURCE: Personal Styling Consultation Page
    -------------------------------------------
    Client Name: ${form.name}
    Phone: ${form.phone}
    Email: ${form.email}

    CONSULTATION PREFERENCES:
    - Occasion: ${form.occasion}
    - Budget Range: ${form.budget}

    PREFERRED STYLE / NOTES:
    ${form.style || "None specified"}
        `.trim();

    const mailtoUrl =
      `mailto:${STORE.email}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
    setSubmitted(true);
    setForm({
      name: "",
      phone: "",
      email: "",
      occasion: occasions[0],
      budget: budgets[1],
      style: "",
    });
  };

  return (
    <>
      <Navbar />

      <SubSlider
        eyebrow="Your Own Stylist"
        title="Personal Styling"
        subtitle="Your own stylist, on your schedule."
        images={[mannequinPolo, lounge]}
      />

      {/* Service Cards */}
      <section style={{ background: T.bg, color: T.text }} className="px-6 md:px-12 lg:px-20 py-16">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center rounded-xl p-8 border border-black/5 dark:border-white/10"
              style={{ background: T.card }}
            >
              <div
                className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{ background: "rgba(201,162,75,0.12)", color: "#F59E0B" }}
              >
                {s.icon}
              </div>
              <h3 className="text-lg mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                {s.title}
              </h3>
              <p className="text-sm opacity-70">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Book A Consultation */}
      <section style={{ background: T.card }} className="px-6 md:px-12 lg:px-20 py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-28"
          >
            <span className="text-[#F59E0B] text-xs font-semibold tracking-[0.22em] uppercase">
              Why Book
            </span>
            <h2
              className="text-3xl md:text-4xl mt-4 mb-6"
              style={{ fontFamily: "'Playfair Display', serif", color: T.text }}
            >
              Dress With Intention
            </h2>
            <p className="text-base leading-relaxed opacity-75 mb-4 max-w-md" style={{ color: T.text }}>
              Every styling experience begins with a personalized consultation. Share your occasion,
              style preference, budget, and desired look, and our styling experts will carefully curate
              pieces that suit you perfectly—whether you visit us in-store or shop from anywhere.
            </p>
            <p className="text-sm opacity-60 mb-8 max-w-md" style={{ color: T.text }}>
              Need assistance? Connect with us on WhatsApp for one-on-one styling advice and personalized
              recommendations from our team.
            </p>

            <a
              href={`https://wa.me/${STORE.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 bg-[#FBBF24] text-black px-7 py-3.5 text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-amber-500 transition-colors font-semibold"
            >
              <FaWhatsapp size={16} /> Chat With A Stylist
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-xl p-8 border border-black/5 dark:border-white/10"
            style={{ background: T.bg }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl" style={{ fontFamily: "'Playfair Display', serif", color: T.text }}>
                Book A Consultation
              </h3>
              {/* <span className="text-[10px] font-bold tracking-widest uppercase bg-[#F59E0B]/10 text-[#F59E0B] px-2.5 py-1 rounded-full border border-[#F59E0B]/20">
                Styling Session
              </span> */}
            </div>
            <p className="text-sm opacity-60 mb-6" style={{ color: T.text }}>
              We'll confirm your appointment within 24 hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Name" T={T}>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Full name"
                    className="w-full bg-transparent border border-black/10 dark:border-white/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#F59E0B]"
                    style={{ color: T.text }}
                  />
                </Field>
                <Field label="Phone" T={T}>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="080..."
                    className="w-full bg-transparent border border-black/10 dark:border-white/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#F59E0B]"
                    style={{ color: T.text }}
                  />
                </Field>
              </div>

              <Field label="Email" T={T}>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@email.com"
                  className="w-full bg-transparent border border-black/10 dark:border-white/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#F59E0B]"
                  style={{ color: T.text }}
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Occasion" T={T}>
                  <select
                    name="occasion"
                    value={form.occasion}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-black/10 dark:border-white/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#F59E0B]"
                    style={{ color: T.text }}
                  >
                    {occasions.map((o) => (
                      <option key={o} value={o} style={{ color: "#000" }}>
                        {o}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Budget" T={T}>
                  <select
                    name="budget"
                    value={form.budget}
                    onChange={handleChange}
                    className="w-full bg-transparent border border-black/10 dark:border-white/15 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#F59E0B]"
                    style={{ color: T.text }}
                  >
                    {budgets.map((b) => (
                      <option key={b} value={b} style={{ color: "#000" }}>
                        {b}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Preferred Style" T={T}>
                <textarea
                  name="style"
                  value={form.style}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us about your taste, colors you love, and what you're looking for..."
                  className="w-full bg-transparent border border-black/10 dark:border-white/15 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#F59E0B]"
                  style={{ color: T.text }}
                />
              </Field>

              <button
                type="submit"
                className="w-full bg-[#FBBF24] text-black font-semibold text-xs uppercase tracking-[0.14em] py-4 rounded-lg hover:bg-[#F59E0B] transition-colors"
              >
                Request Booking
              </button>

              {submitted && (
                <p className="text-sm text-green-600 dark:text-green-400 text-center font-medium mt-2">
                  Opening your email app — just hit send from there.
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </>
  );
};

function Field({ label, T, children }) {
  return (
    <label className="block">
      <span
        className="text-[11px] font-semibold uppercase tracking-wider opacity-60 mb-1.5 block"
        style={{ color: T.text }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

export default Styling;