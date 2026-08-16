  import { motion } from "framer-motion";
  import { Link } from "react-router-dom";
  import { Home } from "lucide-react";

  export default function NotFound() {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
            className="text-9xl font-bold text-amber-400 mb-4"
          >
            404
          </motion.div>

          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-lg text-gray-500 mb-8">
            Sorry, the page you're looking for doesn't exist.
          </p>

          <Link to="/">
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-amber-400 hover:bg-amber-500 text-white font-bold transition-all cursor-pointer"
            >
              <Home size={20} />
              Back to Home
            </motion.span>
          </Link>
        </motion.div>
      </div>
    );
  }