import { motion } from "framer-motion";
import { Image } from "../../assets/Image";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import { useLoginStore } from "../../stores/useLoginStore";
import useAuthStore from "../../stores/useAuthStore";
import { ArrowLeft, ArrowRight, Moon, Sun } from "lucide-react";
import useUiStateStore from "../../stores/useUiStateStore";

export const Navbar = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openModal = useLoginStore((state) => state.openModal);
  const navigate = useNavigate();
  const isDarkMode = useUiStateStore((state) => state.isDarkMode);
  const themeSwitch = useUiStateStore((state) => state.toggleDarkmode);

  return (
    <nav className="flex items-center justify-between px-6 md:px-12 md:py-0 py-4 bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-border shadow-sm">
      <div className="flex gap-6 text-sm font-semibold text-foreground/80">
        <NavLink
          to="/"
          className="hover:text-primary transition md:text-xl md:font-extrabold font-bold"
        >
          Features
        </NavLink>
        <NavLink
          to="/"
          className="hover:text-primary transition md:text-xl md:font-extrabold font-bold"
        >
          Modules
        </NavLink>
      </div>

      <div className="flex flex-col items-center">
        <div className="md:w-25 w-15 rounded-lg flex items-center justify-center">
          <img src={Image.Logo} alt="Logo" />
        </div>
      </div>

      <div className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-foreground/10 transition-colors">
        <button onClick={themeSwitch}>{isDarkMode ? <Sun /> : <Moon />}</button>
      </div>

      <div className="flex items-center gap-4">
        {!isAuthenticated ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openModal}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-black text-lg tracking-widest shadow-lg shadow-primary/30"
          >
            Login
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-black sm:text-xl text-sm tracking-widest shadow-lg shadow-primary/30"
          >
            <div>Start Now</div>
          </motion.button>
        )}
      </div>
    </nav>
  );
};
