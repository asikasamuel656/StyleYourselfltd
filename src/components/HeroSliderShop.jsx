import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import Hotsale from "../assets/Hotsale.png";
import Hotsale2 from "../assets/Hotsale2.png";
import hero6 from "../assets/hero3.jpg";


const slides = [
  {
    id: 1,
    title: "Fresh Drops Just Landed",
    content: "Hoodies, sneakers & fits you don’t want to miss.",
    image: Hotsale,
  },
  {
    id: 2,
    title: "Upgrade Your Everyday Style",
    content: "Clean, bold pieces made for your daily look.",
    image: Hotsale2,
  },
  {
    id: 3,
    title: "Everything You Need Is Here",
    content: "From outfits to accessories—scroll and explore.",
    image: hero6,
  }
];

const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  initial: { y: 50, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -50, opacity: 0 },
};

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  }, []);

  // ✅ auto slide (pauses on interaction)
  useEffect(() => {
    if (paused) return;

    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide, paused]);

  const handleNext = () => {
    setPaused(true);
    nextSlide();
  };

  const handlePrev = () => {
    setPaused(true);
    prevSlide();
  };

  return (
    <section
      className="relative w-full min-h-[90vh] lg:h-screen overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentSlide}
          src={slides[currentSlide].image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        />
      </AnimatePresence>

      {/* ✅ FIX: overlay no longer blocks clicks */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="max-w-2xl"
          >
            <motion.h1
              variants={itemVariants}
              className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            >
              {slides[currentSlide].title}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-gray-200 text-sm sm:text-base md:text-lg"
            >
              {slides[currentSlide].content}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((slide, index) => (
          <motion.button
            key={slide.id}
            onClick={() => {
              setPaused(true);
              setCurrentSlide(index);
            }}
            animate={{
              scale: currentSlide === index ? 1.3 : 1,
              opacity: currentSlide === index ? 1 : 0.5,
            }}
            className="w-2.5 h-2.5 rounded-full bg-white"
          />
        ))}
      </div>

      {/* ✅ FIX: arrows now clickable always */}
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={handlePrev}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2
        bg-white/20 text-white p-2 md:p-3 rounded-full backdrop-blur z-30"
      >
        <FaChevronLeft size={13} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleNext}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2
        bg-white/20 text-white p-2 md:p-3 rounded-full backdrop-blur z-30"
      >
        <FaChevronRight size={13} />
      </motion.button>
    </section>
  );
}