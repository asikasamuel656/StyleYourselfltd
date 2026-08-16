import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// ── Showroom photography ──
// Drop the source files into src/assets and rename to match (or edit the
// paths below). These are the real Style Yourself showroom + product shots.
import showroomWide from "../assets/showroom-wide1.jpg";     // full boutique, wall of shoes + mannequin (IMG_7518)
import mannequinPolo from "../assets/mannequin-polo.jpg";   // striped polo mannequin close (IMG_7514 crop / IMG_7490)
import rails from "../assets/rails.jpg";                    // clothing rails, green jacket run (IMG_7516)
import loungeCorner from "../assets/lounge-corner.jpg";      // teal sofa + gold wordmark wall (IMG_7557)
import luggageWall from "../assets/luggage-wall.jpg";        // suitcase display (IMG_7505 / IMG_7514)
import product from "../assets/Product.jpg"
const MotionLink = motion.create(Link);

const slides = [
  {
    id: "showroom",
    image: showroomWide,
    eyebrow: "Abuja Showcase",
    title: "Style Yourself",
    line: "Luxury menswear, footwear and travel — curated under one roof.",
    ctaText: "Explore The Shop",
    ctaLink: "/shop",
  },
  {
    id: "tailoring",
    image: product,
    eyebrow: "New Season",
    title: "Dress With Intention",
    line: "Considered pieces built for men who own the room they walk into.",
    ctaText: "View Collections",
    ctaLink: "/Collection",
  },
  {
    id: "rails",
    image: rails,
    eyebrow: "Just Landed",
    title: "New Arrivals",
    line: "The latest drops to enter the Style Yourself wardrobe.",
    ctaText: "Shop New In",
    ctaLink: "/shop?filter=new",
  },
  {
    id: "lounge",
    image: luggageWall,
    eyebrow: "In-Store & Virtual",
    title: "Book A Styling Session",
    line: "Tell us the occasion, your budget and your taste — we'll do the rest.",
    ctaText: "Book A Consultation",
    ctaLink: "/styling",
  },
  {
    id: "travel",
    image: loungeCorner,
    eyebrow: "Travel Edit",
    title: "Built To Move",
    line: "Hard-shell luggage and travel accessories for the well-dressed departure.",
    ctaText: "Shop Travel",
    ctaLink: "/shop?category=Travel",
  },
];

const AUTOPLAY_MS = 6000;

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [next, paused]);

  const slide = slides[index];

  return (
    <section
      id="HeroSlider"
      className="relative w-full h-[92vh] min-h-[560px] overflow-hidden bg-[#0E0E10]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background photography with slow Ken-Burns drift */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <motion.img
            src={slide.image}
            alt=""
            className="w-full h-full object-cover"
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: AUTOPLAY_MS / 1000 + 1, ease: "linear" }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Editorial gradient — darker left/bottom where copy sits */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent" />

      {/* Copy block */}
      <div className="relative z-10 h-full flex items-end md:items-center">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 pb-20 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-xl"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="w-8 h-px bg-[#C9A24B]" />
                <span className="text-[#C9A24B] text-xs font-semibold tracking-[0.22em] uppercase">
                  {slide.eyebrow}
                </span>
              </div>

              <h1
                className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {slide.title}
              </h1>

              <p className="text-neutral-200/90 text-base md:text-lg mb-9 max-w-md font-light">
                {slide.line}
              </p>

              <MotionLink
                to={slide.ctaLink}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center gap-3 text-white bg-amber-500 px-7 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-amber-600 hover:shadow-xl"
              >
                {slide.ctaText}
                <FaChevronRight size={11} />
              </MotionLink>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide index, editorial style (bottom-right) */}
      <div className="absolute bottom-8 right-6 md:right-12 z-20 flex items-center gap-4 text-white/70 text-xs tracking-widest">
        <span className="text-white font-semibold">{String(index + 1).padStart(2, "0")}</span>
        <span className="w-10 h-px bg-white/30 relative overflow-hidden">
          <motion.span
            key={slide.id}
            className="absolute inset-y-0 left-0 bg-[#C9A24B]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
          />
        </span>
        <span>{String(slides.length).padStart(2, "0")}</span>
      </div>

      {/* Arrows */}
      <button
        onClick={() => { setPaused(true); prev(); }}
        aria-label="Previous slide"
        className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full border border-white/25 text-white/80 hover:border-[#C9A24B] hover:text-[#C9A24B] transition-colors"
      >
        <FaChevronLeft size={13} />
      </button>
      <button
        onClick={() => { setPaused(true); next(); }}
        aria-label="Next slide"
        className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 items-center justify-center rounded-full border border-white/25 text-white/80 hover:border-[#C9A24B] hover:text-[#C9A24B] transition-colors"
      >
        <FaChevronRight size={13} />
      </button>

      {/* Dots (mobile-friendly, also present on desktop under copy on small screens) */}
      <div className="absolute bottom-8 left-6 md:hidden flex gap-2 z-20">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => { setPaused(true); setIndex(i); }}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-[#C9A24B]" : "w-1.5 bg-white/40"}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}