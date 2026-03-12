import { AnimatePresence } from "framer-motion";
import "./App.css";
import LoginModal from "./components/Login/LoginModal";
import LandingPage from "./pages/LandingPage";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ProtectedRoute } from "./Routes/Route";
import Home from "./pages/Home";

const App = () => {
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
