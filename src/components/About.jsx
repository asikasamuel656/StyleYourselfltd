import { motion } from "framer-motion";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import SubSlider from "./SubSlider.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

// Real showroom photography — reuse the hero set + a couple of detail shots
import showroomWide from "../assets/showroom-wide.jpg";
import mannequinPolo from "../assets/mannequin-polo.jpg";
import rails from "../assets/rails.jpg";
import beltDetail from "../assets/belt-detail.jpg";   // Batis dragon buckle close-up
import hatDetail from "../assets/hat-detail.jpg";     // denim boonie hat close-up
import abt1 from "../assets/abt.jpg"
import about from "../assets/about1.jpg"
import Abt from "../assets/About.jpg"
import About2 from "../assets/About2.jpg"

const pillars = [
  {
    mark: 
    <div className="w-9 h-9 bg-[gold] rounded-xl flex items-center justify-center mb-4">
      <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622" />
      </svg>
    </div>,
    title: "Our Mission",
    body: "Helping men dress with confidence — one signature look at a time.",
  },
  {
    mark: 
      <div className="w-9 h-9 bg-[gold] rounded-xl flex items-center justify-center mb-4">
        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        </div>,
    title: "Our Vision",
    body: "To become Africa's leading luxury menswear destination.",
  },
  {
    mark: 
      <div className="w-9 h-9 bg-[gold] rounded-xl flex items-center justify-center mb-4 text-black">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 2v4m0 12v4M2 12h4m12 0h4M12 8a4 4 0 100 8 4 4 0 000-8zm0-6a10 10 0 100 20 10 10 0 000-20z"
          />
        </svg>
      </div>,
    title: "Why We Exist",
    body: "Because getting dressed is usual. We help you Style Yourself.",
  },
];

const gallery = [showroomWide, about, abt1, Abt, About2];

const About = () => {
  const { T } = useTheme();

  return (
    <>
      <Navbar />

      <SubSlider
        eyebrow="Who We Are"
        title="Our Story"
        subtitle="Getting dressed is usual — why not Style Yourself?"
        images={[showroomWide, rails]}
      />

      {/* ── Intro split ── */}
      <section style={{ background: T.bg, color: T.text }} className="px-6 md:px-12 lg:px-20 py-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-xl overflow-hidden shadow-lg"
          >
            <img src={showroomWide} alt="Style Yourself showroom" className="w-full h-[420px] md:h-[520px] object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="text-amber-500 text-xs font-semibold tracking-[0.22em] uppercase">
              Who We Are
            </span>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl mt-4 mb-6 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Abuja's Home Of Luxury Menswear
            </h2>
            <p className="text-base md:text-lg leading-relaxed opacity-80 max-w-lg">
              Style Yourself began with a simple belief: every man deserves to walk
              into a room and own it. From our showroom on Lugbe / Airport Road and Vegas Mall & Apartment, Wuse, we
              curate the finest in menswear, footwear, fragrance and travel —
              authentic, considered and unmistakably Style Yourself.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Mission / Vision / Why We Exist ── */}
      <section style={{ background: T.card }} className="px-6 md:px-12 lg:px-20 py-16">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center bg-white/60 dark:bg-white/5 rounded-xl p-8 border border-black/5"
            >
              <span className="text-amber-500 text-2xl">{p.mark}</span>
              <h3 className="text-xl mt-3 mb-2 font-medium" style={{ fontFamily: "'Playfair Display', serif", color: T.text }}>
                {p.title}
              </h3>
              <p className="text-sm opacity-70" style={{ color: T.text }}>{p.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Showroom gallery ── */}
      <section style={{ background: T.bg, color: T.text }} className="px-6 md:px-12 lg:px-20 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-amber-500 text-xs font-semibold tracking-[0.22em] uppercase">
              Inside Our Fashion Store
            </span>
            <h2 className="text-3xl md:text-4xl mt-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              The Showroom Gallery
            </h2>
            <p className="opacity-70 mt-2 text-sm md:text-base">A look inside our Abuja Showcase.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className={`overflow-hidden rounded-lg ${i === 0 ? "col-span-2 row-span-2" : ""}`}
              >
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  style={{ minHeight: i === 0 ? 340 : 160 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default About;
