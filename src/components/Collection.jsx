import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";

// Images
import img4 from "../assets/img4.jpg";
import FaceCap from "../assets/FaceCap.jpg";
import HandlessCart from "../assets/HandlessCart.jpg";
import Slippers from "../assets/Slippers.jpg";
import TravellingBag from "../assets/TravellingBag.jpg";
import Shirt from "../assets/Shirt3.jpg";
import Belt from "../assets/Belt.jpg";
import Hoody from "../assets/Hoody.jpg";
import Perfume from "../assets/Perfume.jpg";
import ItalianShoe from "../assets/ItalianShoe.jpg";
import Sneaker from "../assets/Sneaker.jpg";
import Short from "../assets/Short.jpg";
import Baggy from "../assets/Baggy.jpg";

const products = [
  { id: 1, name: "Face cap & Hats", price: "$45", image: FaceCap },
  { id: 2, name: "Handless tops", price: "NGN25,000", image: HandlessCart },
  { id: 3, name: "Authentic rubber slides", price: "NGN35,000", image: Slippers },
  { id: 4, name: "Belts", price: "$25", image: Belt },
  { id: 5, name: "Traveling bags", price: "NGN250,000", image: TravellingBag },
  { id: 6, name: "Vintage shirts", price: "NGN30,000", image: Shirt },
  { id: 7, name: "Hoodies", price: "NGN60,000", image: Hoody },
  { id: 8, name: "Perfumes", price: "$25", image: Perfume },
  { id: 9, name: "Up & Down", price: "$25", image: img4 },
  { id: 10, name: "Italian Shoe", price: "$25", image: ItalianShoe },
  { id: 11, name: "Half Shoe (Italian)", price: "$25", image: ItalianShoe },
  { id: 12, name: "Sneakers", price: "$25", image: Sneaker },
  { id: 13, name: "Shorts", price: "$25", image: Short },
  { id: 14, name: "Baggy jeans", price: "NGN75,000", image: Baggy },
];

const Collection = () => {
  const carouselRef = useRef(null);

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  const MotionLink = motion.create(Link);

  return (
    <section
      id="Collection"
      className="scroll-smooth px-4 md:px-8 lg:px-16 py-12 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex justify-between items-center mb-8 flex-wrap gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-0.5 bg-[gold]" />
            <span className="text-[gold] font-semibold text-sm uppercase tracking-wider">
              Collection
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-800 mb-2 leading-tight">
            WHAT WE <span className="text-[gold]">OFFER !</span>
          </h2>

          <p className="text-neutral-600 text-lg leading-relaxed">
            StyleYourself brings to you luxurious men's wear and accessories.
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollLeft}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold"
          >
            ←
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollRight}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold"
          >
            →
          </motion.button>
        </div>
      </motion.div>

      {/* Carousel */}
      <div
        ref={carouselRef}
        className="flex gap-6 overflow-x-auto scroll-smooth no-scrollbar snap-x"
      >
        {products.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -8 }}
            className="min-w-[250px] bg-white rounded-xl shadow hover:shadow-lg transition snap-start"
          >
            <div className="overflow-hidden rounded-t-xl">
              <motion.img
                src={item.image}
                alt={item.name}
                className="h-72 w-full object-cover"
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="p-4">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-gray-500">{item.price}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Button */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="flex justify-center mt-10"
      >
        <MotionLink
          to="/shop"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="group inline-flex items-center gap-3 text-white bg-amber-500 px-7 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-amber-600 hover:shadow-xl cursor-pointer"
        >
          Shop Now
          <FaChevronRight className="transition-transform duration-300 group-hover:translate-x-2" />
        </MotionLink>
      </motion.div>
    </section>
  );
};

export default Collection;