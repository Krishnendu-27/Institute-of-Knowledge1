import { motion } from "framer-motion";
import { Image } from "../../assets/Image";
import { NavLink } from "react-router-dom";
import { useLoginStore } from "../../stores/useLoginStore";
import useAuthStore from "../../stores/useAuthStore";

export const Navbar = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const openModal = useLoginStore((state) => state.openModal);

  return (
    <nav className="flex items-center justify-between px-6 md:px-12 md:py-0 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-md">
      <div className="flex gap-6 text-sm font-semibold text-gray-700">
        <NavLink
          to="/"
          className="hover:text-yellow-600 transition md:text-xl md:font-extrabold font-bold"
        >
          Features
        </NavLink>
        <NavLink
          to="/"
          className="hover:text-yellow-600 transition md:text-xl md:font-extrabold font-bold"
        >
          Modules
        </NavLink>
      </div>
      <div className="flex flex-col items-center">
        <div className="md:w-25 w-15 rounded-lg flex items-center justify-center">
          <img src={Image.Logo} />
        </div>
      </div>
      <div className="flex items-center gap-4">
        {!isAuthenticated && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openModal}
            className="bg-yellow-500 text-white px-8 py-3 rounded-full font-black text-lg tracking-widest shadow-[0_10px_20px_rgba(217,176,97,0.3)]"
          >
            Login
          </motion.button>
        )}
      </div>
    </nav>
  );
};
