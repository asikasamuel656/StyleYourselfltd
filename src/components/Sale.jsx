import { motion } from "framer-motion";
import { FaTag } from "react-icons/fa";
import { Link } from "react-router-dom";

import img5 from "../assets/img5.jpg";
import img4 from "../assets/img4.jpg";
import Baggy from "../assets/Baggy.jpg";

const Sale = () => {

  // ✅ Dynamic Sale Data
  const saleItems = [
    {
      id: 1,
      name: "Stylish Outfit",
      price: 80,
      discount: 10,
      image: img5,
    },
    {
      id: 2,
      name: "Luxury Wear",
      price: 120,
      discount: 20,
      image: img4,
    },
    {
      id: 3,
      name: "Casual Baggy",
      price: 75,
      discount: 10,
      image: Baggy,
    },
  ];

  return (
    <section
      id="Sale"
      className="relative scroll-smooth bg-neutral-100 py-16 px-4 md:px-10 lg:px-20"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent blur-3xl"></div>

      {/* Header */}
      <div className="relative z-10">
        {/* Section label */}
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-0.5 bg-[gold]" />
          <span className="text-[gold] font-semibold text-sm uppercase tracking-wider">
            SALE
          </span>
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-800 mb-2 leading-tight">
          HOT DEALS & <span className="text-[gold]">SALES !</span>
        </h2>

        {/* Description */}
        <p className="text-neutral-600 text-lg leading-relaxed">
          Grab your favorite styles at discounted prices before they're gone!
        </p>
      </div>

      {/* Sale Cards */}
      <div className="relative z-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-7">
        {saleItems.map((item, index) => {
          const discountedPrice =
            item.price - (item.price * item.discount) / 100;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-64 object-cover"
                />

                {/* Discount Badge */}
                <span className="absolute top-3 left-3 bg-red-500 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1">
                  <FaTag /> -{item.discount}%
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-800">
                  {item.name}
                </h3>

                <div className="flex items-center gap-3 mt-2">
                  <span className="text-gray-400 line-through">
                    NGN{item.price}
                  </span>
                  <span className="text-lg font-bold text-amber-500">
                    NGN{discountedPrice.toFixed(2)}
                  </span>
                </div>

               <Link
                to="/shop"
                className="mt-4 block w-full bg-amber-500 text-white py-2 rounded-xl font-semibold hover:bg-amber-600 transition text-center"
              >
                Shop Now
              </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default Sale;