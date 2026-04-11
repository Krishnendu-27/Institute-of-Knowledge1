import { AnimatePresence } from "framer-motion";
import LoginModal from "./components/Login/LoginModal";
import LandingPage from "./pages/LandingPage";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import {
  ProtectedRoute,
  ProtectedRouteRoleBased,
  PublicRoute,
} from "./Routes/Route";
import Dashboard from "./pages/Dashboard";
import { useEffect, useState } from "react";
import useAuthStore from "./stores/useAuthStore";
import { useLoginStore } from "./stores/useLoginStore";
import useUiStateStore from "./stores/useUiStateStore";
import AllTeachers from "./pages/Admin/AllTeachers";
import AllStudents from "./pages/Admin/AllStudents";
import Batch from "./pages/Admin/Batch";
import Course from "./pages/Admin/Course";
import Loading from "./pages/Loading";
import { NavigationLayout } from "./components/UI/NavigationLayout";
import ProfilePage from "./pages/ProfilePage";
import CreateUser from "./pages/CreateUser";

const App = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const openLoginModal = useLoginStore((state) => state.openModal);
  const isDarkMode = useUiStateStore((state) => state.isDarkMode);
  const loaduser = useAuthStore((state) => state.loadUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loaduser();

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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

  useEffect(() => {});

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router>
      <Toaster />
      <LoginModal />
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route element={<NavigationLayout />}>
            {/* Role for All users */}
            <Route
              element={
                <ProtectedRouteRoleBased
                  allowedRoles={["Admin", "Teacher", "Student"]}
                />
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Routes for both Admins / Teachers */}
            <Route
              element={
                <ProtectedRouteRoleBased allowedRoles={["Admin", "Teacher"]} />
              }
            >
              <Route path="/teachers" element={<AllTeachers />} />
              <Route path="/students" element={<AllStudents />} />
              <Route path="/createuser" element={<CreateUser />} />
            </Route>

            {/* <Route
              element={<ProtectedRouteRoleBased allowedRoles={["Teacher"]} />}
            >
              The Admin will provide power to the teachers
            </Route> */}
          </Route>
        </Route>

        <Route element={<PublicRoute />}>
          <Route path="/home" element={<LandingPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
