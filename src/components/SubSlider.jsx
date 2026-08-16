import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
* SubSlider — the signature banner used at the top of every non-home page
* (About, Shop, Collections, Sale, Styling, Store, Contact...).
*
* Same visual language as the homepage HeroSlider (dark ground, serif
* headline, gold eyebrow rule) but shorter and quieter, so it reads as
* "you're inside the site" rather than a second homepage moment.
*
* Usage:
*   <SubSlider
*     eyebrow="Who We Are"
*     title="Our Story"
*     subtitle="Getting dressed is usual — why not Style Yourself?"
*     images={[img1, img2, img3]}   // 1 image = static, 2+ = slow rotation
*   />
*/
const AUTOPLAY_MS = 5500;

export default function SubSlider({
  eyebrow,
  title,
  subtitle,
  images = [],
  height = "h-[42vh] min-h-[320px] md:min-h-[380px]",
}) {
  const [index, setIndex] = useState(0);
  const hasMultiple = images.length > 1;

  const next = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!hasMultiple) return;
    const t = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [hasMultiple, next]);

  return (
    <section className={`relative w-full ${height} overflow-hidden bg-[#0E0E10]`}>
      {images.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={images[index]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          />
        </AnimatePresence>
      )}

      <div className="absolute inset-0 bg-black/70" />
      {images.length > 0 && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
      )}

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        {eyebrow && (
          <div className="flex items-center gap-3 mb-4">
            <span className="w-6 h-px bg-[#C9A24B]" />
            <span className="text-[#C9A24B] text-xs font-semibold tracking-[0.22em] uppercase">
              {eyebrow}
            </span>
            <span className="w-6 h-px bg-[#C9A24B]" />
          </div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-white text-4xl md:text-5xl lg:text-6xl leading-tight font-semibold"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {title}
        </motion.h1>

        {subtitle && (
          <p className="mt-4 text-neutral-300 text-sm md:text-base font-light max-w-lg">
            {subtitle}
          </p>
        )}
      </div>

      {hasMultiple && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Background ${i + 1}`}
              className={`h-1 rounded-full transition-all ${i === index ? "w-5 bg-[#C9A24B]" : "w-1 bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}