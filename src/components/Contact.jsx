import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWhatsapp, FaPhone, FaMapMarkerAlt, FaEnvelope, FaInstagram, FaChevronDown } from "react-icons/fa";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import SubSlider from "./SubSlider.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

import showroomWide from "../assets/showroom-wide.jpg";
import loungeCorner from "../assets/lounge-corner.jpg";

// Store details — edit these in one place, they're used across the page
const STORE = {
  name: "Style Yourself",
  tag: "Abuja Showcase",
  address: "G.O Plaza, Opposite Light Gold Estate, Lugbe.",
  address2: "Shop A21 Vegas Mall & Apartment, Wuse.",
  hours: [
    { days: "Mon – Sat", time: "9:00am – 9:00pm" },
  ],
  phone: "+234 912 717 0775",
  whatsapp: "2349127170775",
  email: "styleyourself@gmail.com",
  instagram: "@styleyourselfltd",
};

const MAP_EMBED_SRC =
  "https://www.google.com/maps?q=" +
  encodeURIComponent(STORE.address) +
  "&output=embed";

const clientCare = [
  {
    q: "Shipping & Delivery",
    a: "Same-day delivery within Abuja, standard nationwide delivery takes 1–3 business days.",
  },
  {
    q: "Returns & Refunds",
    a: "We want you to feel confident in every StyleYourself purchase. Unworn items with tag attached may be returned or exchanged within a day of delivery. simply provide your receipt or order or order confirmation and contact us on Whatsapp.",
  },
  {
    q: "Payment Methods",
    a: "We accept bank transfer, card payment in-store, and cash.",
  },
];

const Contact = () => {
  const { T } = useTheme();
  const [openIndex, setOpenIndex] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    // Opens the user's own email app with everything pre-filled — no
    // account, API key, or backend needed. They just hit send from there.
    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`;
    const mailtoUrl =
      `mailto:${STORE.email}` +
      `?subject=${encodeURIComponent(form.subject || "Message from styleyourself.com")}` +
      `&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <>
      <Navbar />

      <SubSlider
        eyebrow="We're Here To Help"
        title="Get In Touch"
        subtitle="Have a question? We'd love to hear from you."
        images={[loungeCorner, showroomWide]}
        height="h-[34vh] min-h-[260px]"
      />

      {/* ── Form + Reach Us + Client Care ── */}
      <section style={{ background: T.bg, color: T.text }} className="px-6 md:px-12 lg:px-20 py-16">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-xl p-7 md:p-9"
            style={{ background: T.card }}
          >
            <h2 className="text-2xl mb-6 font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Send A Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Name" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
                <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@email.com" />
              </div>
              <Field label="Subject" name="subject" value={form.subject} onChange={handleChange} placeholder="How can we help?" />
              <div>
                <label className="text-xs font-semibold tracking-[0.14em] uppercase opacity-60 block mb-1.5">Message</label>
                <textarea
                  name="message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us what you need..."
                  required
                  className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-lg font-semibold text-xs uppercase tracking-[0.14em] bg-amber-400 text-black hover:bg-amber-500 transition-colors"
              >
                Send Message
              </button>

              <AnimatePresence>
                {sent && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-green-600 dark:text-green-400 text-center"
                  >
                    Opening your email app — just hit send from there.
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

          {/* Reach Us + Client Care */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-xl p-7 md:p-9"
              style={{ background: T.card }}
            >
              <span className="text-amber-500 text-xs font-semibold tracking-[0.22em] uppercase">Reach Out</span>
              <div className="mt-5 space-y-4 text-sm">
                <ContactRow icon={<FaPhone size={13} className="text-amber-500" />} label="Phone" value={STORE.phone} href={`tel:${STORE.phone.replace(/\s/g, "")}`} />
                <ContactRow icon={<FaWhatsapp size={14} className="text-amber-500" />} label="WhatsApp" value="Send a message" href={`https://wa.me/${STORE.whatsapp}`} />
                <ContactRow icon={<FaEnvelope size={13} className="text-amber-500" />} label="Email" value={STORE.email} href={`mailto:${STORE.email}`} />
                <ContactRow icon={<FaInstagram size={14} className="text-amber-500" />} label="Instagram" value={STORE.instagram} href={`https://instagram.com/${STORE.instagram.replace("@", "")}`} />
                <ContactRow icon={<FaMapMarkerAlt size={13} className="text-amber-500" />} label="Address" value={STORE.address} />
                <ContactRow icon={<FaMapMarkerAlt size={13} className="text-amber-500" />} label="Address" value={STORE.address2} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-xl p-7 md:p-9"
              style={{ background: T.card }}
            >
              <span className="text-amber-500 text-xs font-semibold tracking-[0.22em] uppercase">Client Support</span>
              <div className="mt-4">
                {clientCare.map((item, i) => (
                  <div key={item.q} className="border-b border-black/10 dark:border-white/10 last:border-0">
                    <button
                      onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                      className="w-full flex items-center justify-between py-4 text-left font-semibold text-sm"
                    >
                      {item.q}
                      <motion.span animate={{ rotate: openIndex === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <FaChevronDown size={11} className="opacity-50" />
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {openIndex === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm opacity-70 pb-4 leading-relaxed">{item.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Map + store card (Visit Our Store) ── */}
      <section style={{ background: T.card }} className="px-6 md:px-12 lg:px-20 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-amber-500 text-xs font-semibold tracking-[0.22em] uppercase">Abuja Showcase</span>
            <h2 className="text-3xl md:text-4xl mt-3 font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Visit Our Store
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-0 rounded-xl overflow-hidden shadow-lg">
            <div className="h-[340px] lg:h-auto">
              <iframe
                title="Style Yourself location"
                src={MAP_EMBED_SRC}
                width="100%"
                height="100%"
                style={{ border: 0, display: "block", minHeight: 340 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="p-8 md:p-10 flex flex-col justify-center" style={{ background: T.bg }}>
              <span className="text-amber-500 text-xs font-semibold tracking-[0.22em] uppercase">{STORE.tag}</span>
              <h3 className="text-2xl md:text-3xl mt-2 mb-6 font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                {STORE.name}
              </h3>

              <dl className="space-y-4 text-sm mb-8">
                <div>
                  <dt className="font-semibold opacity-60 mb-1">Address</dt>
                  <dd className="opacity-80 mb-2">{STORE.address}</dd>
                  <dt className="font-semibold opacity-60 mb-1">Address</dt>
                  <dd className="opacity-80">{STORE.address2}</dd>
                </div>
                <div>
                  <dt className="font-semibold opacity-60 mb-1">Hours</dt>
                  <dd className="opacity-80">
                    {STORE.hours.map((h) => `${h.days}: ${h.time}`).join(" · ")}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold opacity-60 mb-1">Phone</dt>
                  <dd className="opacity-80">{STORE.phone}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/${STORE.whatsapp}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-xs uppercase tracking-wider bg-amber-400 text-black hover:bg-amber-500 transition-colors"
                >
                  <FaWhatsapp size={18}/> WhatsApp Us
                </a>
                <a
                  href={`tel:${STORE.phone.replace(/\s/g, "")}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-xs uppercase tracking-wider border border-black/15 dark:border-white/20 hover:border-amber-500 hover:text-amber-500 transition-colors"
                >
                  <FaPhone size={16}/> Call Now
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(STORE.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-xs uppercase tracking-wider border border-black/15 dark:border-white/20 hover:border-amber-500 hover:text-amber-500 transition-colors"
                >
                  <FaMapMarkerAlt size={16} /> Get Directions
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(STORE.address2)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-xs uppercase tracking-wider border border-black/15 dark:border-white/20 hover:border-amber-500 hover:text-amber-500 transition-colors"
                >
                  <FaMapMarkerAlt size={16} /> Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

function Field({ label, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-xs font-semibold tracking-[0.14em] uppercase opacity-60 block mb-1.5">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-amber-400"
      />
    </div>
  );
}

function ContactRow({ icon, label, value, href }) {
  const content = (
    <>
      <span className="text-[#C9A24B] mt-0.5">{icon}</span>
      <span>
        <span className="block font-semibold text-xs uppercase tracking-wider opacity-50">{label}</span>
        <span className="block">{value}</span>
      </span>
    </>
  );
  return href ? (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex items-start gap-3 hover:text-[#C9A24B] transition-colors">
      {content}
    </a>
  ) : (
    <div className="flex items-start gap-3">{content}</div>
  );
}

export default Contact;