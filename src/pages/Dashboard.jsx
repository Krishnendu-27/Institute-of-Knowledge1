import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  GraduationCap,
  Layers,
  IndianRupee,
  UserPlus,
  BookOpen,
  Calendar,
  Clock,
  ClipboardCheck,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Bell,
  Download,
  Loader2,
} from "lucide-react";
import useAuthStore from "../stores/useAuthStore";
import useUserStore from "../stores/useUserStore";
import useBatchStore from "../stores/useBatchStore";

// ==========================================
// REUSABLE UI COMPONENTS (CARDS)
// ==========================================

const KpiCard = ({
  title,
  value,
  icon: Icon,
  trend,
  colorType = "primary",
  isLoading,
}) => {
  // Map abstract color names to your semantic Tailwind variables
  const colorStyles = {
    primary: {
      bg: "bg-primary/10",
      text: "text-primary",
      border: "border-primary/20",
    },
    success: {
      bg: "bg-success/10",
      text: "text-success",
      border: "border-success/20",
    },
    warning: {
      bg: "bg-warning/10",
      text: "text-warning",
      border: "border-warning/20",
    },
    destructive: {
      bg: "bg-destructive/10",
      text: "text-destructive",
      border: "border-destructive/20",
    },
  };

  const style = colorStyles[colorType] || colorStyles.primary;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          {isLoading ? (
            <div className="h-8 w-20 bg-muted animate-pulse rounded-md mt-1"></div>
          ) : (
            <h3 className="text-3xl font-bold text-foreground">{value}</h3>
          )}
        </div>
        <div
          className={`p-3 rounded-xl border ${style.bg} ${style.border} ${style.text}`}
        >
          <Icon size={24} />
        </div>
      </div>
      {trend && !isLoading && (
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp size={16} className="text-success" />
          <span className="text-success font-medium">{trend.value}</span>
          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </motion.div>
  );
};

const SectionCard = ({ title, icon: Icon, children, action }) => (
  <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full transition-colors duration-300">
    <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={18} className="text-primary" />}
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
      {action && action}
    </div>
    <div className="p-5 flex-1 overflow-auto custom-scrollbar">{children}</div>
  </div>
);

// ==========================================
// ROLE-SPECIFIC DASHBOARDS
// ==========================================

const AdminDashboard = ({
  navigate,
  students,
  teachers,
  batches,
  isLoading,
}) => {
  // Get recent 4 students
  const recentStudents = students?.slice(0, 4) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KpiCard
          isLoading={isLoading}
          title="Total Students"
          value={students?.length || 0}
          icon={GraduationCap}
          colorType="primary"
          trend={{ value: "Active", label: "currently enrolled" }}
        />
        <KpiCard
          isLoading={isLoading}
          title="Active Faculty"
          value={teachers?.length || 0}
          icon={Users}
          colorType="success"
        />
        <KpiCard
          isLoading={isLoading}
          title="Running Batches"
          value={batches?.length || 0}
          icon={Layers}
          colorType="warning"
        />
        <KpiCard
          isLoading={isLoading}
          title="Est. Revenue"
          value="₹ --"
          icon={IndianRupee}
          colorType="success"
        />
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate("/register")}
          className="flex items-center gap-2 bg-primary hover:opacity-90 text-primary-foreground px-5 py-2.5 rounded-xl font-semibold shadow-sm shadow-primary/20 transition-all active:scale-95"
        >
          <UserPlus size={18} /> Register User
        </button>
        <button
          onClick={() => navigate("/batches/create")}
          className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground border border-border px-5 py-2.5 rounded-xl font-semibold transition-all active:scale-95"
        >
          <Layers size={18} /> Create Batch
        </button>
        <button
          onClick={() => navigate("/fees")}
          className="flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground border border-border px-5 py-2.5 rounded-xl font-semibold transition-all active:scale-95"
        >
          <IndianRupee size={18} /> Process Fees
        </button>
      </div>

      {/* Data Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard title="Recent Enrollments" icon={Users}>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
              </div>
            ) : recentStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="pb-3 font-semibold">Student Name</th>
                      <th className="pb-3 font-semibold">Email</th>
                      <th className="pb-3 font-semibold">Phone</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {recentStudents.map((student) => (
                      <tr
                        key={student._id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 text-foreground font-medium flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {student.name?.charAt(0)}
                          </div>
                          {student.name}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {student.email}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {student.phone}
                        </td>
                        <td className="py-3">
                          <span className="px-2.5 py-1 text-xs font-medium bg-success/10 text-success rounded-lg border border-success/20">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recent enrollments found.
              </div>
            )}
          </SectionCard>
        </div>
        <div className="lg:col-span-1">
          <SectionCard title="System Alerts" icon={AlertCircle}>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/20 rounded-xl">
                <AlertCircle
                  className="text-warning shrink-0 mt-0.5"
                  size={18}
                />
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Fee Collection Cycle
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Remember to send fee reminders to batches ending this month.
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </motion.div>
  );
};

const TeacherDashboard = ({ navigate, user, batches, isLoading }) => {
  // Filter batches for this teacher
  const myBatches =
    batches?.filter((b) => b.teacherEmail === user?.email) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <KpiCard
          isLoading={isLoading}
          title="My Active Batches"
          value={myBatches.length}
          icon={Layers}
          colorType="primary"
        />
        <KpiCard
          isLoading={isLoading}
          title="Total Students"
          value={myBatches.reduce(
            (acc, curr) => acc + (curr.students?.length || 0),
            0,
          )}
          icon={Users}
          colorType="success"
        />
        <KpiCard
          isLoading={isLoading}
          title="Pending Actions"
          value="0"
          icon={AlertCircle}
          colorType="warning"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate("/attendance")}
          className="flex items-center gap-2 bg-primary hover:opacity-90 text-primary-foreground px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all active:scale-95"
        >
          <ClipboardCheck size={18} /> Mark Attendance
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Quick Batch Access" icon={BookOpen}>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-primary w-8 h-8" />
            </div>
          ) : myBatches.length > 0 ? (
            <div className="space-y-3">
              {myBatches.map((batch) => (
                <div
                  key={batch._id}
                  onClick={() =>
                    navigate(`/batches/${batch._id}`, {
                      state: { batchId: batch._id },
                    })
                  }
                  className="p-4 border border-border rounded-xl hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {batch.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock size={12} /> {batch.weekday} • {batch.startTime}{" "}
                        - {batch.endTime}
                      </p>
                    </div>
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20">
                      {batch.students?.length || 0} Students
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No assigned batches found.
            </div>
          )}
        </SectionCard>
      </div>
    </motion.div>
  );
};

const StudentDashboard = ({ navigate, user, batches, isLoading }) => {
  // Mock data for student until specific endpoint exists
  const myBatches =
    batches?.filter((b) => b.students?.some((s) => s._id === user?._id)) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <KpiCard
          isLoading={isLoading}
          title="Active Courses"
          value={myBatches.length}
          icon={BookOpen}
          colorType="primary"
        />
        <KpiCard
          isLoading={isLoading}
          title="Overall Attendance"
          value="--%"
          icon={CheckCircle2}
          colorType="success"
        />
        <KpiCard
          isLoading={isLoading}
          title="Fee Status"
          value="Active"
          icon={IndianRupee}
          colorType="success"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate("/fees")}
          className="flex items-center gap-2 bg-primary hover:opacity-90 text-primary-foreground px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all active:scale-95"
        >
          <IndianRupee size={18} /> Pay Fees
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard title="My Class Schedule" icon={Calendar}>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
              </div>
            ) : myBatches.length > 0 ? (
              <div className="space-y-3">
                {myBatches.map((batch) => (
                  <div
                    key={batch._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 border border-border rounded-xl shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex flex-col items-center justify-center font-bold border border-primary/20">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">
                          {batch.name}
                        </h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock size={12} /> {batch.weekday} •{" "}
                          {batch.startTime} - {batch.endTime}
                        </p>
                      </div>
                    </div>
                    <span className="mt-3 sm:mt-0 px-3 py-1 bg-background border border-border text-foreground text-xs font-bold rounded-lg text-center">
                      Instructor: {batch.teacherEmail?.split("@")[0]}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                You are not enrolled in any upcoming classes.
              </div>
            )}
          </SectionCard>
        </div>

        <div className="lg:col-span-1">
          <SectionCard title="Notice Board" icon={Bell}>
            <div className="space-y-4">
              <div className="p-3 bg-muted/30 border border-border rounded-xl">
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md mb-2 inline-block border border-primary/20">
                  WELCOME
                </span>
                <h4 className="text-sm font-bold text-foreground mb-1">
                  Welcome to the Portal
                </h4>
                <p className="text-xs text-muted-foreground">
                  Keep an eye on this board for official announcements and
                  updates.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// MAIN DASHBOARD WRAPPER
// ==========================================

export default function Dashboard() {
  const navigate = useNavigate();

  // Stores
  const user = useAuthStore((state) => state.user);
  const role = user?.role || "Student";

  const {
    students,
    teachers,
    getStudents,
    getTeachers,
    isLoading: userLoading,
  } = useUserStore();
  const { batches, fetchBatches, isLoading: batchLoading } = useBatchStore();

  const isLoading = userLoading || batchLoading;

  // Fetch critical dashboard data on mount
  useEffect(() => {
    if (role === "Admin") {
      getStudents();
      getTeachers();
    }
    fetchBatches();
  }, [role, getStudents, getTeachers, fetchBatches]);

  // Page entry animations
  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -15 },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="min-h-screen bg-background text-foreground p-4 md:p-8 transition-colors duration-300"
    >
      {/* Dynamic Header based on Role */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2 capitalize">
          Welcome back, {user?.name?.split(" ")[0] || "User"} 👋
        </h1>
        <p className="text-muted-foreground font-medium">
          Here is what's happening in your {role.toLowerCase()} portal today.
        </p>
      </div>

      {/* Conditional Rendering based on Role */}
      {role === "Admin" && (
        <AdminDashboard
          navigate={navigate}
          students={students}
          teachers={teachers}
          batches={batches}
          isLoading={isLoading}
        />
      )}
      {role === "Teacher" && (
        <TeacherDashboard
          navigate={navigate}
          user={user}
          batches={batches}
          isLoading={isLoading}
        />
      )}
      {role === "Student" && (
        <StudentDashboard
          navigate={navigate}
          user={user}
          batches={batches}
          isLoading={isLoading}
        />
      )}
    </motion.div>
  );
}