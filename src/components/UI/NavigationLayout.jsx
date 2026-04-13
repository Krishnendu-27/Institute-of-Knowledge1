import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Home, // Added for Dashboard
  Users,
  GraduationCap,
  UserPlus, // Added for Create User
  User,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Outlet, Link, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import { Image } from "../../assets/Image";
import toast from "react-hot-toast";

export const NavigationLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const userRole = useAuthStore((state) => state.userRole);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  // Updated routes to match your App.js routing structure
  const roleMenus = {
    admin: [
      { path: "/", icon: Home, label: "Dashboard" },
      { path: "/teachers", icon: Users, label: "Teachers" },
      { path: "/students", icon: GraduationCap, label: "Students" },
      { path: "/createuser", icon: UserPlus, label: "Create User" },
      { path: "/profile", icon: User, label: "Profile" },
    ],
    teacher: [
      { path: "/", icon: Home, label: "Dashboard" },
      { path: "/teachers", icon: Users, label: "Teachers" },
      { path: "/students", icon: GraduationCap, label: "Students" },
      { path: "/createuser", icon: UserPlus, label: "Create User" },
      { path: "/profile", icon: User, label: "Profile" },
    ],
    student: [
      { path: "/", icon: Home, label: "Dashboard" },
      { path: "/profile", icon: User, label: "Profile" },
    ],
  };

  // Safely fallback to student if role is undefined or doesn't match
  const currentRole = userRole ? userRole.toLowerCase() : "student";
  const menuItems = roleMenus[currentRole] || roleMenus.student;

  const handleLogout = () => {
    try {
      logout();
      toast.success("Logging out...");
    } catch (_) {}
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground relative">
      {/* =========================================
          DESKTOP SIDEBAR (Hidden on Mobile)
          ========================================= */}
      <motion.aside
        animate={{ width: isCollapsed ? "88px" : "260px" }}
        className="hidden md:flex h-screen sticky top-0 left-0 bg-card border-r border-border flex-col p-4 transition-all duration-300 ease-in-out z-40"
      >
        <div className="flex items-center px-2 mb-10 h-12">
          {/* Logo Icon */}
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 shrink-0">
            <img
              src={Image.Logo}
              alt="Logo"
              className="w-6 h-6 object-contain"
            />
          </div>
          {/* Expanded Brand Name */}
          {!isCollapsed && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-4 font-bold text-sm leading-tight tracking-tight whitespace-nowrap"
            >
              Institute of
              <br />
              Knowledge
            </motion.h1>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            // STRICT MATCHING: Prevents "/" from matching every other route
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.label}
                to={item.path}
                className={`w-full flex items-center p-3 rounded-xl transition-all group
                  ${isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-foreground/60 hover:bg-primary/10 hover:text-primary"}`}
              >
                <item.icon size={22} />
                {!isCollapsed && (
                  <span className="ml-4 font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="mt-auto border-t border-border pt-4 flex flex-col gap-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <LogOut size={22} />
            {!isCollapsed && <span className="ml-4 font-medium">Logout</span>}
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-primary/5 text-foreground/40 hover:text-primary transition-colors"
          >
            <motion.div animate={{ rotate: isCollapsed ? 0 : 180 }}>
              <ChevronRight size={20} />
            </motion.div>
          </button>
        </div>
      </motion.aside>

      {/* =========================================
          MAIN CONTENT AREA
          ========================================= */}
      <main className="flex-1 p-6 md:p-10 pb-32 md:pb-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Dynamic Page Header based on URL */}
          <h2 className="text-xl font-bold mb-6 capitalize">
            {location.pathname === "/"
              ? "Dashboard"
              : location.pathname.split("/").pop()}
          </h2>

          <Outlet />
        </div>
      </main>

      {/* =========================================
          MOBILE BOTTOM NAV (Hidden on Desktop)
          ========================================= */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] z-50 pointer-events-none">
        <div className="bg-card/85 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-2 flex items-center justify-around pointer-events-auto">
          {menuItems.map((item) => {
            // STRICT MATCHING applied to mobile as well
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.label}
                to={item.path}
                className="relative p-3 flex flex-col items-center gap-1 group w-16"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveIndicator"
                    className="absolute inset-0 bg-primary/15 rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon
                  size={24}
                  className={`transition-colors ${isActive ? "text-primary" : "text-foreground/50"}`}
                />
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider text-center ${isActive ? "text-primary" : "text-foreground/50"}`}
                >
                  {isActive ? item.label : ""}
                </span>
              </Link>
            );
          })}

          {/* Logout Floating Action Button for Mobile */}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white p-3.5 rounded-xl shadow-lg shadow-red-500/40 -translate-y-6 border-[5px] border-background hover:scale-105 transition-transform"
          >
            <LogOut size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};