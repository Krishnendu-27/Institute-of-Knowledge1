import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Layers,
  FileText,
  Plus,
  Activity,
  Calendar,
  Loader2,
} from "lucide-react";
import useAuthStore from "../stores/useAuthStore";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const userData = useAuthStore((state) => state.user);
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (!userData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-primary/60 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Active Batches",
      value: userData.batches?.length || 0,
      icon: Layers,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Main Classes",
      value: userData.mainClasses?.length || 0,
      icon: BookOpen,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      label: "Total Documents",
      value: userData.documents?.length || 0,
      icon: FileText,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "System Users",
      value: "—",
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

        <div className="relative z-10">
          <p className="text-sm font-medium text-primary mb-1 uppercase tracking-wider">
            Welcome back
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
            {userData.name}
          </h1>
          <p className="text-foreground/60 mt-2 flex items-center gap-2 text-sm">
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-xs">
              {userData.role}
            </span>
            <span>•</span>
            {userData.email}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link
            to="/createuser"
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
          >
            <Plus size={18} />
            <span>Quick Add</span>
          </Link>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="bg-card p-6 rounded-3xl border border-border shadow-sm flex flex-col hover:border-primary/30 transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}
              >
                <stat.icon className={stat.color} size={24} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black text-foreground">
                {stat.value}
              </h3>
              <p className="text-sm font-medium text-foreground/60 mt-1">
                {stat.label}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm min-h-[300px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Activity className="text-primary" size={20} />
                Recent Activity
              </h3>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-2xl bg-background/50">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                <Calendar className="text-primary/40" size={32} />
              </div>
              <h4 className="text-foreground font-semibold mb-1">
                No recent activity
              </h4>
              <p className="text-sm text-foreground/50 max-w-sm mx-auto">
                Once you start creating batches, adding students, or uploading
                documents, your activity timeline will appear here.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
            <h3 className="text-lg font-bold mb-4">Account Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-1">
                  Account ID
                </p>
                <p className="text-sm font-mono text-foreground/80 bg-background px-3 py-2 rounded-lg border border-border">
                  {userData._id}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-1">
                  Member Since
                </p>
                <p className="text-sm text-foreground font-medium">
                  {userData.createdAt
                    ? new Date(userData.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
