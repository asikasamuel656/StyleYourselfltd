import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaHeart } from "react-icons/fa";

// Images (keep yours as-is)
import img4 from "../assets/img4.jpg";
import img5 from "../assets/img5.jpg";
import img6 from "../assets/img6.jpg";
import FaceCap from "../assets/FaceCap.jpg";
import HandlessCart from "../assets/HandlessCart.jpg";
import Slippers from "../assets/Slippers.jpg";
import Slipper2 from "../assets/Slippers2.jpg";
import Slipper3 from "../assets/Slippers3.jpg";
import TravellingBag from "../assets/TravellingBag.jpg";
import Shirt from "../assets/Shirt.jpg";
import Shirt2 from "../assets/Shirt2.jpg";
import Shirt3 from "../assets/Shirt3.jpg";
import Shirt4 from "../assets/Shirt4.jpg";
import Shirt5 from "../assets/Shirt5.jpg";
import Shirt6 from "../assets/Shirt6.jpg";
import Belt from "../assets/Belt.jpg";
import Belt2 from "../assets/Belt2.jpg";
import Belt3 from "../assets/Belt3.jpg";
import Belt4 from "../assets/Belt4.jpg";
import Hoody from "../assets/Hoody.jpg";
import Hoody2 from "../assets/Hoody2.jpg";
import Hoody3 from "../assets/Hoody3.jpg";
import Hoody4 from "../assets/Hoody4.jpg";
import Hoody5 from "../assets/Hoody5.jpg";
import Hoody6 from "../assets/Hoody6.jpg";
import perfume from "../assets/Perfume.jpg";
import perfume2 from "../assets/Perfume2.jpg";
import perfume3 from "../assets/Perfume3.jpg";
import perfume4 from "../assets/Perfume4.jpg";
import perfume5 from "../assets/Perfume5.jpg";
import perfume6 from "../assets/Perfume6.jpg";
import perfume7 from "../assets/Perfume7.jpg";
import perfume8 from "../assets/Perfume8.jpg";
import ItalianShoe from "../assets/ItalianShoe.jpg";
import ItalianShoe1 from "../assets/ItalianShoe1.jpg";
import ItalianShoe2 from "../assets/ItalianShoe2.jpg";
import Sneaker from "../assets/Sneaker.jpg";
import Sneaker2 from "../assets/Sneaker2.jpg";
import Sneaker3 from "../assets/Sneaker3.jpg";
import Sneaker4 from "../assets/Sneaker4.jpg";
import Sneaker5 from "../assets/Sneaker5.jpg";
import Sneaker6 from "../assets/Sneaker6.jpg";
import Sneaker7 from "../assets/Sneaker7.jpg";
import Sneaker8 from "../assets/Sneaker8.jpg";
import Sneaker9 from "../assets/Sneaker9.jpg";
import Short from "../assets/Short.jpg";
import Short2 from "../assets/Short2.jpg";
import Baggy from "../assets/Baggy.jpg";
import Baggy1 from "../assets/Baggy1.jpg";
import Baggy2 from "../assets/Baggy2.jpg";

const allProducts = [
  { id: 1, name: "Face Cap", price: 45, category: "Accessories", image: FaceCap },
  { id: 2, name: "Belt", price: 150, category: "Accessories", image: Belt },
  { id: 3, name: "Hoodie", price: 80, category: "Clothing", image: Hoody },
  { id: 4, name: "Perfume", price: 60, category: "Accessories", image: perfume },
  { id: 5, name: "Baggy Jeans", price: 90, category: "Clothing", image: Baggy },
  { id: 6, name: "Italian Shoe", price: 150, category: "Shoes", image: ItalianShoe },
  { id: 7, name: "Sneaker", price: 120, category: "Shoes", image: Sneaker },
  { id: 8, name: "Short", price: 120, category: "Clothing", image: Short },
  { id: 9, name: "Italian Shoe", price: 150, category: "Shoes", image: ItalianShoe2 },
  { id: 10, name: "Sneaker", price: 150, category: "Shoes", image: Sneaker2 },
  { id: 11, name: "Short", price: 150, category: "Clothing", image: Short2 },
  { id: 12, name: "Sneaker", price: 150, category: "Shoes", image: Sneaker6 },
  { id: 13, name: "Up&down", price: 80, category: "Clothing", image: img5 },
  { id: 14, name: "Sneaker", price: 150, category: "Shoes", image: Sneaker5 },
  { id: 15, name: "Perfume", price: 150, category: "Accessories", image: perfume2 },
  { id: 16, name: "Hoodie", price: 150, category: "Clothing", image: Hoody3 },
  { id: 17, name: "Baggy", price: 150, category: "Clothing", image: Baggy2 },
  { id: 18, name: "Hoodie", price: 150, category: "Clothing", image: Hoody6 },
  { id: 19, name: "Sneaker", price: 150, category: "Shoes", image: Sneaker3 },
  { id: 20, name: "Hoodie", price: 80, category: "Clothing", image: Hoody3 },
  { id: 21, name: "Up&down", price: 150, category: "Clothing", image: img6 },
  { id: 22, name: "Sneaker", price: 150, category: "Shoes", image: Sneaker4 },
  { id: 23, name: "Baggy", price: 150, category: "Clothing", image: Baggy1 },
  { id: 24, name: "Perfume", price: 60, category: "Accessories", image: perfume3 },
  { id: 25, name: "Shirt", price: 80, category: "Clothing", image: Shirt4 },
  { id: 26, name: "Perfume", price: 60, category: "Accessories", image: perfume6 },
  { id: 27, name: "Italian Shoe", price: 150, category: "Shoes", image: ItalianShoe1 },
  { id: 28, name: "Perfume", price: 60, category: "Accessories", image: perfume8 },
  { id: 29, name: "Belt", price: 150, category: "Accessories", image: Belt3},
  { id: 30, name: "Hoodie", price: 80, category: "Clothing", image: Hoody2 },
  { id: 31, name: "Shirt", price: 80, category: "Clothing", image: Shirt2 },
  { id: 32, name: "Hoodie", price: 80, category: "Clothing", image: Hoody3 },
  { id: 33, name: "Sneaker", price: 150, category: "Shoes", image: Sneaker7 },
  { id: 34, name: "perfume", price: 150, category: "Accessories", image: perfume5 },
  { id: 35, name: "Sneaker", price: 150, category: "Shoes", image: Sneaker8 },
  { id: 36, name: "Belt", price: 150, category: "Accessories", image: Belt4},
  { id: 37, name: "Handless", price: 80, category: "Clothing", image: HandlessCart },
  { id: 38, name: "Hoodie", price: 80, category: "Clothing", image: Hoody4 },
  { id: 39, name: "Slippers", price: 80, category: "Accessories", image: Slipper2 },
  { id: 40, name: "Belt", price: 150, category: "Accessories", image: Belt2},
  { id: 41, name: "Perfume", price: 60, category: "Accessories", image: perfume4 },
  { id: 42, name: "Shirt", price: 80, category: "Clothing", image: Shirt },
  { id: 43, name: "Sneaker", price: 150, category: "Shoes", image: Sneaker9 }, 
  { id: 44, name: "Slippers", price: 80, category: "Accessories", image: Slipper3 },
  { id: 45, name: "Perfume", price: 60, category: "Accessories", image: perfume7 },
  { id: 46, name: "Shirt", price: 80, category: "Clothing", image: Shirt5 },
  { id: 47, name: "Up&down", price: 80, category: "Clothing", image: img4 },
  { id: 48, name: "Traveling-Bag", price: 80, category: "Accessories", image: TravellingBag },
  { id: 49, name: "Slippers", price: 80, category: "Accessories", image: Slippers },
  { id: 50, name: "Hoodie", price: 80, category: "Clothing", image: Hoody5 },
  { id: 51, name: "Hoodie", price: 80, category: "Clothing", image: Hoody6 },
  { id: 52, name: "Shirt", price: 80, category: "Clothing", image: Shirt6 },
  { id: 53, name: "Shirt", price: 80, category: "Clothing", image: Shirt3 },
];

const categories = ["All", "Clothing", "Shoes", "Accessories"];

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts =
    selectedCategory === "All"
      ? allProducts
      : allProducts.filter((p) => p.category === selectedCategory);

  // 🔥 Animation Variants
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="py-16 px-6 md:px-12 lg:px-20 bg-neutral-50 min-h-screen">
      
      {/* Header */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={container}
        className="text-center mb-12"
      >
        <motion.h1 variants={fadeUp} className="text-4xl font-bold text-neutral-800">
          Our <span className="text-amber-500">Store</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="text-gray-500 mt-3">
          Explore premium fashion collections
        </motion.p>
      </motion.div>

      {/* Filter Buttons */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="flex justify-center gap-4 mb-10 flex-wrap"
      >
        {categories.map((cat) => (
          <motion.button
            key={cat}
            variants={fadeUp}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full font-medium transition ${
              selectedCategory === cat
                ? "bg-amber-500 text-white"
                : "bg-white text-gray-600 border"
            }`}
          >
            {cat}
          </motion.button>
        ))}
      </motion.div>

      {/* Products */}
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredProducts.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -6 }}
            className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden"
          >
            {/* Image */}
            <div className="overflow-hidden">
              <motion.img
                src={item.image}
                alt={item.name}
                className="h-64 w-full object-cover"
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-gray-500 mt-1">NGN{item.price}</p>

              <motion.button
                whileTap={{ scale: 0.95 }}
                className="mt-4 w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition"
              >
                Add to Cart
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Shop;