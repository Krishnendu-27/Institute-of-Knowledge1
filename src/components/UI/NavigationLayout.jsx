import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  GraduationCap,
  UserPlus,
  User,
  LogOut,
  ChevronRight,
  BadgePlus,
  IdCard,
  Newspaper,
  BookCheck,
  Form,
  Menu,
  X,
  Calendar,
  Layers,
} from "lucide-react";
import { Outlet, Link, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import { Image } from "../../assets/Image";
import toast from "react-hot-toast";
import { Breadcrumbs } from "./Breadcrumbs";

export const NavigationLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userRole = useAuthStore((state) => state.userRole);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  const roleMenus = {
    admin: [
      { path: "/", icon: Home, label: "Dashboard" },
      { path: "/batches", icon: Layers, label: "Batches" },
      { path: "/teachers", icon: Users, label: "Teachers" },
      { path: "/students", icon: GraduationCap, label: "Students" },
      { path: "/registeruser", icon: UserPlus, label: "Register New User" },
      { path: "/courses", icon: BadgePlus, label: "All Courses" },
      { path: "/attendance", icon: Calendar, label: "Attendance" },
      { path: "/profile", icon: User, label: "Profile" },
    ],
    teacher: [
      { path: "/", icon: Home, label: "Dashboard" },
      { path: "/batches", icon: Layers, label: "Batches" },
      { path: "/teachers", icon: Users, label: "Teachers" },
      { path: "/students", icon: GraduationCap, label: "Students" },
      { path: "/registeruser", icon: UserPlus, label: "Register New User" },
      { path: "/attendance", icon: Calendar, label: "Attendance" },
      { path: "/profile", icon: User, label: "Profile" },
    ],
    student: [
      { path: "/", icon: Home, label: "Dashboard" },
      { path: "/batches", icon: Layers, label: "My Batches" },
      { path: "/idcard", icon: IdCard, label: "ID Card" },
      { path: "/admit-card", icon: BookCheck, label: "Admit card" },
      { path: "/registration-form", icon: Form, label: "Registration form" },
      {
        path: "/course-certificate",
        icon: Newspaper,
        label: "Course Certificate",
      },
      { path: "/profile", icon: User, label: "Profile" },
    ],
  };

  const currentRole = userRole ? userRole.toLowerCase() : "student";
  const menuItems = roleMenus[currentRole] || roleMenus.student;

  const handleLogout = () => {
    try {
      logout();
      toast.success("Logging out...");
    } catch (_) {}
  };

  const getPageTitle = () => {
    if (location.pathname === "/") return "Dashboard";
    if (location.pathname === "/profile") return `${userRole} Profile`;
    if (location.pathname === "/registeruser") return `Register New User`;
    if (location.pathname.startsWith("/batches")) return `Class Batches`;
    return location.pathname.split("/").pop().replaceAll("-", " ");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground relative flex-col md:flex-row">
      {/* MOBILE HEADER */}
      <header className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <img src={Image.Logo} alt="Logo" className="w-8 h-8 object-contain" />
          <h1 className="font-bold text-sm leading-tight tracking-tight">
            Institute of Knowledge
          </h1>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-foreground/80 hover:text-primary transition-colors focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </header>

      {/* MOBILE DROPDOWN MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ ease: "linear", duration: 0.2 }}
            className="md:hidden fixed top-[68px] left-0 right-0 bg-card border-b border-border z-40 overflow-hidden shadow-lg"
          >
            <nav className="flex flex-col p-4 space-y-2">
              {menuItems.map((item) => {
                const isActive =
                  item.path === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center p-4 rounded-xl transition-all
                      ${isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-foreground/70 hover:bg-primary/10 hover:text-primary"}`}
                  >
                    <item.icon size={22} className="mr-4 shrink-0" />
                    <span className="font-medium text-base">{item.label}</span>
                  </Link>
                );
              })}

              {/* Mobile Logout Button with Nav Items */}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center p-4 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors w-full text-left"
              >
                <LogOut size={22} className="mr-4 shrink-0" />
                <span className="font-medium text-base">Logout</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR */}
      <motion.aside
        animate={{ width: isCollapsed ? "88px" : "260px" }}
        transition={{ ease: "linear", duration: 0.2 }}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
        className="hidden md:flex h-screen sticky top-0 left-0 bg-card border-r border-border flex-col p-4 z-40 overflow-hidden"
      >
        <div className="flex items-center px-2 mb-10 h-12">
          <img
            src={Image.Logo}
            alt="Logo"
            className="w-10 h-10 object-contain"
          />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ ease: "linear", duration: 0.2 }}
                className="ml-4 font-bold text-sm leading-tight tracking-tight whitespace-nowrap"
              >
                Institute of
                <br />
                Knowledge
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Links including Logout */}
        <nav
          className={`flex-1 space-y-2 overflow-y-auto overflow-x-hidden ${
            isCollapsed ? "no-scrollbar" : "custom-scrollbar"
          }`}
        >
          {menuItems.map((item) => {
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
                <item.icon size={22} className="shrink-0" />
                {!isCollapsed && (
                  <span className="ml-4 font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Desktop Logout Button with Nav Items */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors group mt-2"
            title="Logout"
          >
            <LogOut size={22} className="shrink-0" />
            {!isCollapsed && (
              <span className="ml-4 font-medium whitespace-nowrap">Logout</span>
            )}
          </button>
        </nav>

        {/* Footer Toggle */}
        <div className="mt-auto border-t border-border pt-4 flex flex-col gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center rounded-lg hover:bg-primary/5 text-foreground/40 hover:text-primary transition-colors"
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 0 : 180 }}
              transition={{ ease: "linear", duration: 0.2 }}
            >
              <ChevronRight size={20} />
            </motion.div>
          </button>
        </div>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 px-6 pb-6 md:px-10 md:pb-10 min-h-[calc(100vh-68px)] md:min-h-screen dark:bg-gray-900 transition-colors duration-300">
        <div className="sticky top-0 z-20 pt-6 md:pt-10 pb-4 bg-slate-50 dark:bg-gray-900 transition-colors duration-300 max-w-6xl mx-auto">
          {/* Fixed breadcrumbs component call */}
          <Breadcrumbs />
          <h1 className="w-fit text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 capitalize mt-2">
            {getPageTitle()}
          </h1>
        </div>
        <div className="max-w-6xl mx-auto mt-2">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
