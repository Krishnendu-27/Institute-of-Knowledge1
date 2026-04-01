import { AnimatePresence } from "framer-motion";
import LoginModal from "./components/Login/LoginModal";
import LandingPage from "./pages/LandingPage";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ProtectedRoute } from "./Routes/Route";
import Home from "./pages/Home";
import { useEffect, useState } from "react";
import useAuthStore from "./stores/useAuthStore";
import { useLoginStore } from "./stores/useLoginStore";
import useUiStateStore from "./stores/useUiStateStore";

const App = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openLoginModal = useLoginStore((state) => state.openModal);
  const isDarkMode = useUiStateStore((state) => state.isDarkMode);

  // THEME SWICTHER FOR DARK/LIGHT MODE
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
  }, [isDarkMode]);

  // IF THE USER IS NOT AUTHENTICATED THE MODAL WILL SHOW AFTER 5 SECONDS
  useEffect(() => {
    if (!isAuthenticated) {
      const timeOut = setTimeout(openLoginModal, 5000);
      return () => clearTimeout(timeOut);
    }
  }, [isAuthenticated, openLoginModal]);

  return (
    <Router>
      <Toaster />
      <LoginModal />
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
        </Route>
        <Route path="/home" element={<LandingPage />} />
      </Routes>
    </Router>
  );
};

export default App;
