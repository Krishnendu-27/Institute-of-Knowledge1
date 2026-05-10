import React, { useState, useEffect } from "react";
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
  HandCoins,
  Settings,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { Outlet, Link, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import useUiStateStore from "../../stores/useUiStateStore";
import { Image } from "../../assets/Image";
import toast from "react-hot-toast";
import { Breadcrumbs } from "./Breadcrumbs";
import { generateSlug } from "../../util/generateSlug";

export const NavigationLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("general");

  const theme = useUiStateStore((state) => state.theme);
  const setTheme = useUiStateStore((state) => state.setTheme);

  const user = useAuthStore((state) => state.user);
  const userRole = useAuthStore((state) => state.userRole);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(mediaQuery.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const roleMenus = {
    admin: [
      { path: "/", icon: Home, label: "Dashboard" },
      { path: "/teachers", icon: Users, label: "Teachers" },
      { path: "/students", icon: GraduationCap, label: "Students" },
      { path: "/registeruser", icon: UserPlus, label: "Register New User" },
      { path: "/batches", icon: Layers, label: "Batches" },
      { path: "/courses", icon: BadgePlus, label: "All Courses" },
      { path: "/fees", icon: HandCoins, label: "Fees Payment" },
      { path: "/attendance", icon: Calendar, label: "Attendance" },
      {
        path: `/profile/${generateSlug(user?.name)}`,
        icon: User,
        label: "Profile",
        state: { userId: user?._id },
      },
    ],
    teacher: [
      { path: "/", icon: Home, label: "Dashboard" },
      { path: "/teachers", icon: Users, label: "Teachers" },
      { path: "/students", icon: GraduationCap, label: "Students" },
      { path: "/registeruser", icon: UserPlus, label: "Register New User" },
      { path: "/batches", icon: Layers, label: "Batches" },
      { path: "/attendance", icon: Calendar, label: "Attendance" },
      { path: "/fees", icon: HandCoins, label: "Fees Payment" },
      {
        path: `/profile/${generateSlug(user?.name)}`,
        icon: User,
        label: "Profile",
        state: { userId: user?._id },
      },
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
      {
        path: `/profile/${generateSlug(user?.name)}`,
        icon: User,
        label: "Profile",
        state: { userId: user?._id },
      },
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
    if (location.pathname.startsWith("/profile")) return `${userRole} Profile`;
    if (location.pathname === "/registeruser") return `Register New User`;
    if (location.pathname.startsWith("/courses/createcourse"))
      return `Publish New Course`;
    if (location.pathname.startsWith("/batches/create"))
      return `Configure New Batch`;
    if (location.pathname.startsWith("/batches")) return `Batches`;
    return location.pathname.split("/").pop().replaceAll("-", " ");
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground relative flex-col md:flex-row">
      {/* SETTINGS MODAL */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
            onClick={() => setIsSettingsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[500px]"
            >
              <div className="w-full md:w-56 bg-muted/30 border-b md:border-b-0 md:border-r border-border p-6">
                <h2 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">
                  Settings
                </h2>
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveSettingsTab("general")}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      activeSettingsTab === "general"
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-foreground/70 hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    <Settings size={20} className="shrink-0" />
                    General
                  </button>
                </nav>
              </div>

              <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold">General Settings</h3>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {activeSettingsTab === "general" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold mb-1">Appearance</h4>
                      <p className="text-sm text-muted-foreground">
                        Customize how the application looks on your device.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <button
                        onClick={() => setTheme("system")}
                        className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                          theme === "system"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground bg-card"
                        }`}
                      >
                        <Monitor className="mb-3" size={28} />
                        <span className="font-medium">System</span>
                      </button>

                      <button
                        onClick={() => setTheme("light")}
                        className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                          theme === "light"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground bg-card"
                        }`}
                      >
                        <Sun className="mb-3" size={28} />
                        <span className="font-medium">Light</span>
                      </button>

                      <button
                        onClick={() => setTheme("dark")}
                        className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                          theme === "dark"
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground bg-card"
                        }`}
                      >
                        <Moon className="mb-3" size={28} />
                        <span className="font-medium">Dark</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    state={item.state}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center p-4 rounded-xl transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-foreground/70 hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    <item.icon size={22} className="mr-4 shrink-0" />
                    <span className="font-medium text-base">{item.label}</span>
                  </Link>
                );
              })}

              {/* Mobile Settings Button */}
              <button
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center p-4 rounded-xl text-foreground/70 hover:bg-primary/10 hover:text-primary transition-colors w-full text-left mt-2 border-t border-border"
              >
                <Settings className="mr-4 shrink-0" size={22} />
                <span className="font-medium text-base">Settings</span>
              </button>

              {/* Mobile Logout Button */}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center p-4 rounded-xl text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
              >
                <LogOut className="mr-4 shrink-0" size={22} />
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
        <div className="flex items-center px-2 mb-6 h-5">
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
                state={item.state}
                className={`w-full flex items-center p-3 rounded-xl transition-all group ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-foreground/60 hover:bg-primary/10 hover:text-primary"
                }`}
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
        </nav>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 px-6 pb-6 md:px-10 md:pb-10 min-h-[calc(100vh-68px)] md:min-h-screen">
        {/* DESKTOP NAVBAR & PAGE TITLE */}
        <div className="sticky top-0 z-20 pt-6 md:pt-10 pb-4 bg-background max-w-6xl mx-auto flex items-end justify-between">
          <div>
            <Breadcrumbs />
            <h1 className="w-fit text-3xl font-extrabold tracking-tight text-primary capitalize mt-2">
              {getPageTitle()}
            </h1>
          </div>

          {/* Desktop Top Navbar Actions (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-2 mb-1">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-xl border border-border bg-card text-foreground/70 hover:text-primary hover:border-primary/50 transition-all shadow-sm"
              title="Settings"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl border border-border bg-card text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all shadow-sm"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-2">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
