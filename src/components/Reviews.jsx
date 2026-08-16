import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaStar, FaQuoteLeft } from "react-icons/fa";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import SubSlider from "./SubSlider.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

import showroomWide from "../assets/showroom-wide.jpg";
import mannequinPolo from "../assets/mannequin-polo.jpg";

// Swap this for a Firestore "reviews" collection query whenever you're
// ready — shape matches what onSnapshot would give you (id, name, rating,
// date, content), so wiring it in later is a drop-in swap.
const reviews = [
  { id: 1, name: "James Colonel", rating: 5, date: "June 2026", content: "This boutique has amazing quality products. I love everything I bought here — the fit and finishing are a level above what else is available in Abuja." },
  { id: 2, name: "Sarah Johnson", rating: 4, date: "June 2026", content: "Fast delivery and beautiful styles. The team helped me put together a full look for a wedding and it turned out better than I imagined." },
  { id: 3, name: "Blessing Ike", rating: 5, date: "May 2026", content: "Great customer service and premium fashion items. I've been shopping here for over a year and the quality has never dropped." },
  { id: 4, name: "Daniel Okafor", rating: 5, date: "May 2026", content: "Booked a styling consultation and it was worth every naira. Left with pieces I actually wear on repeat, not just impulse buys." },
  { id: 5, name: "Chidi Nwosu", rating: 4, date: "April 2026", content: "Solid range of shoes and travel bags. Prices are fair for the quality — the luggage I bought has held up perfectly on three trips." },
  { id: 6, name: "Amaka Bello", rating: 5, date: "April 2026", content: "The showroom itself is beautiful, and the staff never rush you. Bought a belt and a pair of loafers, both authentic and well packaged." },
];

const filters = ["All", 5, 4, 3];

const Reviews = () => {
  const { T } = useTheme();
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = useMemo(
    () => (activeFilter === "All" ? reviews : reviews.filter((r) => r.rating === activeFilter)),
    [activeFilter]
  );

  const average = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100),
  }));

  return (
    <>
      <Navbar />

      <SubSlider
        eyebrow="Customer Feedback"
        title="Reviews"
        subtitle="Real feedback from real Style Yourself customers."
        images={[mannequinPolo, showroomWide]}
        height="h-[34vh] min-h-[260px]"
      />

      {/* ── Rating summary ── */}
      <section style={{ background: T.bg, color: T.text }} className="px-6 md:px-12 lg:px-20 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[280px_1fr] gap-12 items-center">
          <div className="text-center md:text-left">
            <p className="text-6xl leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>{average}</p>
            <div className="flex justify-center md:justify-start gap-1 mt-3 mb-2">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} size={16} className={i < Math.round(average) ? "text-amber-500" : "opacity-20"} />
              ))}
            </div>
            <p className="text-sm opacity-60">{reviews.length} verified reviews</p>
          </div>

          <div className="space-y-2.5">
            {breakdown.map((b) => (
              <div key={b.star} className="flex items-center gap-3 text-sm">
                <span className="w-10 flex items-center gap-1 opacity-70">{b.star} <FaStar size={11} className="text-amber-500" /></span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: T.card }}>
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${b.pct}%` }} />
                </div>
                <span className="w-8 text-right opacity-50 text-xs">{b.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Filter + grid ── */}
      <section style={{ background: T.card }} className="px-6 md:px-12 lg:px-20 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-10">
            <h2 className="text-2xl md:text-3xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              What Our Customers Say
            </h2>
            <div className="flex gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors"
                  style={
                    activeFilter === f
                      ? { background: "#F59E0B", color: "#000" }
                      : { background: T.bg, color: T.text }
                  }
                >
                  {f === "All" ? "All" : `${f} Star`}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="popLayout">
            <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((r, i) => (
                <motion.div
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="rounded-xl p-7"
                  style={{ background: T.bg }}
                >
                  <FaQuoteLeft className="text-amber-500 opacity-60 mb-4" size={18} />
                  <p className="text-sm leading-relaxed opacity-80 mb-6">{r.content}</p>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{r.name}</p>
                      <p className="text-xs opacity-50 mt-0.5">{r.date}</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(r.rating)].map((_, i) => (
                        <FaStar key={i} size={12} className="text-amber-500" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <p className="text-center opacity-50 py-16 text-sm">No reviews at this rating yet.</p>
          )}
        </div>
      </section>

      {/* ── Leave a review CTA ── */}
      <section style={{ background: T.bg, color: T.text }} className="px-6 md:px-12 lg:px-20 py-16 text-center">
        <span className="text-amber-500 text-xs font-semibold tracking-[0.22em] uppercase">Shopped With Us?</span>
        <h2 className="text-3xl md:text-4xl mt-3 mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
          Share Your Experience
        </h2>
        <p className="opacity-70 max-w-md mx-auto mb-8 text-sm md:text-base">
          Your feedback helps other men find their fit. Message us on WhatsApp or
          leave a review the next time you're in-store.
        </p>
        <a
          href="https://wa.me/+2349127170775"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold text-xs uppercase tracking-[0.14em] bg-amber-400 text-black hover:bg-amber-500 transition-colors"
        >
          Leave A Review
        </a>
      </section>

      <Footer />
    </>
  );
};

export default Reviews;