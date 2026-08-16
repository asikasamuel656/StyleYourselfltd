import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaChevronRight, FaTag, FaStar, FaShoppingBag,} from "react-icons/fa";
import { ShoppingCart } from "lucide-react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import HeroSlider from "./HeroSlider.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

// Product imagery (same assets already used across Collection/Sale/Shop)
import img5 from "../assets/img5.jpg";
import img4 from "../assets/img4.jpg";
import Baggy from "../assets/Baggy.jpg";
import FaceCap from "../assets/FaceCap.jpg";
import Slippers from "../assets/Slippers.jpg";
import Sneaker from "../assets/sneaker9.jpg";
import Shirt from "../assets/Shirt3.jpg";
import Hoody from "../assets/Hoody.jpg";
import lounge from "../assets/lounge-corner.jpg";
import Showroom from "../assets/showroom-wide1.jpg"

const MotionLink = motion.create(Link);

const newArrivals = [
  { id: 1, name: "Vintage Shirt", kicker: "EXCLUSIVE", image: Shirt },
  { id: 2, name: "Rubber Slides", kicker: "AMBER EDITION", image: Slippers },
  { id: 3, name: "Baggy Jeans", kicker: "ATELIER", image: Baggy },
  { id: 4, name: "Hoodie", kicker: "EXCLUSIVE", image: Hoody },
];

const saleItems = [
  { id: 1, name: "Stylish Outfit", price: 60000, discount: 16, image: img5 },
  { id: 2, name: "Luxury Wear", price: 60000, discount: 16, image: img4 },
  { id: 3, name: "Sneaker Drop", price: 263500, discount: 5, image: Sneaker },
];

const testimonials = [
  { name: "Chinedu A.", rating: 5, quote: "Walked in unsure, walked out looking like a completely different level of put-together." },
  { name: "Ifeoma O.", rating: 5, quote: "The styling session alone was worth it — they actually listened to what I wanted." },
  { name: "Bashir M.", rating: 4, quote: "Great range of travel pieces. My case has survived three trips already." },
];

const Home = () => {
  const { T } = useTheme();

  return (
    <>
      <Navbar />
      <HeroSlider />

      {/* ── New Arrivals strip ── */}
      <section style={{ background: T.bg, color: T.text }} className="px-6 md:px-12 lg:px-20 py-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="Just Landed" title="New Arrivals" sub="The latest pieces to enter the Style Yourself wardrobe." />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            {newArrivals.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group relative border border-amber-500/20 hover:border-amber-500/80 transition-all duration-500 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/10"
                style={{ background: T.card }}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-black">
                  <span
                    className="absolute top-2 right-2 z-10"
                    style={{
                      background: "#111827",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: 6,
                      letterSpacing: "0.04em",
                    }}
                  >
                    New
                  </span>
                  {/* <Wishlist active={liked} onToggle={() => setLiked((v) => !v)} /> */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  <div className="absolute inset-x-3 bottom-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    {/* <button className="mt-1 w-full py-2 rounded-lg flex items-center justify-center gap-1.5 font-semibold text-xs bg-[#F59E0B]">
                      <ShoppingCart size={13} />
                      Add to Cart
                    </button> */}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-amber-500">
                      {item.kicker}
                    </p>
                  </div>
                  <h3 className="text-base font-medium leading-snug mb-2 font-display line-clamp-1">
                    {item.name}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          <ViewAllLink to="/shop" text="New Arrivals" />
        </div>
      </section>

      {/* ── Collection teaser ── */}
      <section style={{ background: T.card }} className="px-6 md:px-12 lg:px-20 py-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#F59E0B] text-xs font-semibold tracking-[0.22em] uppercase">Curated Edit</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl mt-4 mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif", color: T.text }}>
              Every Piece, One Standard
            </h2>
            <p className="text-base leading-relaxed opacity-75 max-w-md mb-8" style={{ color: T.text }}>
              From tailored shirting to travel-ready luggage, every item in our
              collection is chosen to the same standard — considered, authentic
              and unmistakably Style Yourself.
            </p>
            <MotionLink
              to="/collection"
              className="group inline-flex items-center gap-3 text-white bg-amber-500 px-7 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-amber-600 hover:shadow-xl"
            >
              View Collections <FaChevronRight size={11} />

            </MotionLink>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-xl overflow-hidden shadow-lg"
          >
            <img src={Showroom} alt="Style Yourself collection" className="w-full h-[380px] md:h-[440px] object-cover" />
          </motion.div>
        </div>
      </section>

      {/* ── Sale teaser ── */}
      <section style={{ background: T.bg, color: T.text }} className="px-6 md:px-12 lg:px-20 py-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="Limited Time" title="Hot Deals & Sales" sub="Grab your favorite styles at discounted prices before they're gone." />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {saleItems.map((item, i) => {
              const finalPrice = item.price - (item.price * item.discount) / 100;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="rounded-lg overflow-hidden group"
                  style={{ background: T.card }}
                >
                  <div className="relative overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-3 left-3 bg-[#0E0E10] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase tracking-wide">
                      <FaTag size={10} /> -{item.discount}%
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{item.name}</h3>
                    <div className="flex items-baseline gap-3">
                      <span className="opacity-40 line-through text-sm">₦{item.price.toLocaleString()}</span>
                      <span className="text-xl font-bold" style={{ color: "#F59E0B" }}>₦{finalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* <ViewAllLink to="/sale" text="Shop All Deals" /> */}
        </div>
      </section>

      {/* ── Styling teaser banner ── */}
      <section className="relative h-[46vh] min-h-[340px] overflow-hidden">
        <img src={lounge} alt="Style Yourself lounge" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <span className="text-[#F59E0B] text-xs font-semibold tracking-[0.22em] uppercase mb-4">Your Own Stylist</span>
          <h2 className="text-white text-3xl md:text-4xl lg:text-5xl mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
            Dress With Intention
          </h2>
          <p className="text-neutral-200 max-w-md mb-8 font-light">
            Every styling experience begins with a personalized consultation — in-store or virtual.
          </p>
          <ViewAllLink to="/styling" text="Book A Consultation" />
        </div>
      </section>

      {/* ── Reviews teaser ── */}
      <section style={{ background: T.card }} className="px-6 md:px-12 lg:px-20 py-20">
        <div className="max-w-7xl mx-auto">
          <SectionHeading eyebrow="Client Love" title="What Our Clients Say" sub="Real words from men who Styled Themselves." />

          <div className="grid sm:grid-cols-3 gap-6 mt-10">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-xl p-7 border border-black/5"
                style={{ background: T.bg }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <FaStar key={idx} size={13} className="text-amber-500" />
                  ))}
                </div>
                <p className="text-sm italic opacity-80 mb-5" style={{ color: T.text }}>"{t.quote}"</p>
                <p className="text-sm font-semibold" style={{ color: T.text }}>{t.name}</p>
              </motion.div>
            ))}
          </div>

          <ViewAllLink to="/review" text="Read All Reviews" />
        </div>
      </section>

      <Footer />
    </>
  );
};

function SectionHeading({ eyebrow, title, sub }) {
  return (
    <div className="text-center">
      <span className="text-[#F59E0B] text-xs font-semibold tracking-[0.22em] uppercase">{eyebrow}</span>
      <h2 className="text-3xl md:text-4xl mt-3" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h2>
      {sub && <p className="opacity-70 mt-2 text-sm md:text-base max-w-lg mx-auto">{sub}</p>}
    </div>
  );
}

function ViewAllLink({ to, text }) {
  return (
    <div className="flex justify-center mt-12">
      <MotionLink
        to={to}
        className="group inline-flex items-center gap-3 text-white bg-amber-500 px-7 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-amber-600 hover:shadow-xl"
      >
        {text} <FaChevronRight size={11} />
      </MotionLink>
    </div>
  );
}

export default Home;