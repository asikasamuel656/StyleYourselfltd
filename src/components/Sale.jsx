import { motion } from "framer-motion";
import { FaTag } from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import img5 from "../assets/img5.jpg";
import img4 from "../assets/img4.jpg";
import Baggy from "../assets/Baggy.jpg";
import Footer from "./Footer.jsx";
import SubSlider from "./SubSlider.jsx";
import showroomWide from "../assets/showroom-wide.jpg";


import { useTheme } from "../context/ThemeContext";

const Sale = () => {

  // Sale Data
  const saleItems = [
    {
      id: 1,
      name: "Stylish Outfit",
      price: 80000,
      discount: 10,
      image: img5,
      productId: 8, // 👈 link to Shop item
    },
    {
      id: 2,
      name: "Luxury Wear",
      price: 60000,
      discount: 20,
      image: img4,
      productId: 9,
    },
    {
      id: 3,
      name: "Casual Baggy",
      price: 75000,
      discount: 10,
      image: Baggy,
      productId: 10,
    },
  ];

    const { T } = useTheme();

  return (
    <>
    <Navbar />

    <SubSlider
      eyebrow="Limited Time"
      title="Hot Deals & Sales"
      subtitle="Grab your favorite styles at discounted prices before they're gone."
      images={[showroomWide]}
      height="h-[34vh] min-h-[260px]"
    />

    <section
      style={{ background: T.bg, color: T.text }}
      id="Sale"
      className="relative scroll-smooth bg-amber-50 py-10 px-4 md:px-10 lg:px-20"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent blur-3xl"></div>

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
                    ₦{item.price.toLocaleString()}
                  </span>
                  <span className="text-lg font-bold text-amber-500">
                    ₦{discountedPrice.toLocaleString()}
                  </span>
                </div>

               <Link
                  to="/shop"
                  state={{ productId: item.productId }} // 👈 THIS is the fix
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
    <Footer/>
    </>
  );
};

export default Sale;