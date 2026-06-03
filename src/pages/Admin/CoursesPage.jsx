import React, { useState, useEffect } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Users,
  BookOpen,
  ChevronRight,
  Loader2,
  Calendar,
  IndianRupee,
} from "lucide-react";
import useClassStore from "../../stores/useClassStore";
import useTradeStore from "../../stores/useTradeStore";
import { TRADES } from "../../constants/trades";

const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTradeId, setSelectedTradeId] = useState("");
  const navigate = useNavigate();

  const allClass = useClassStore((state) => state.allClass);
  const getClasses = useClassStore((state) => state.getClasses);
  const isLoading = useClassStore((state) => state.isLoading);
  const error = useClassStore((state) => state.error);
  const courseTradeMap = useTradeStore((state) => state.courseTradeMap);
  const getTradeLabel = useTradeStore((state) => state.getTradeLabel);
  const getTradeFromCourseName = useTradeStore(
    (state) => state.getTradeFromCourseName,
  );

  useEffect(() => {
    getClasses();
  }, [getClasses]);

  const filteredClasses = Array.isArray(allClass)
    ? allClass.filter((item) => {
        const matchesSearch =
          item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item?.teacherName?.toLowerCase().includes(searchTerm.toLowerCase());

        const tradeId =
          courseTradeMap[item?._id] ||
          item?.tradeId ||
          getTradeFromCourseName(item?.name) ||
          "";
        const matchesTrade =
          selectedTradeId === ""
            ? true
            : selectedTradeId === "unassigned"
              ? !tradeId
              : tradeId === selectedTradeId;

        return matchesSearch && matchesTrade;
      })
    : [];

  const getClassStatus = (startDate, endDate, isActive) => {
    if (!isActive)
      return {
        label: "Unavailable",
        styles: "bg-destructive/10 text-destructive border-destructive/20",
      };
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start)
      return {
        label: "Not Started",
        styles: "bg-warning/10 text-warning border-warning/20",
      };
    else if (now > end)
      return {
        label: "Course Ended",
        styles: "bg-muted text-muted-foreground border-border",
      };
    else
      return {
        label: "Available",
        styles: "bg-success/10 text-success border-success/20",
      };
  };

  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 },
  };

  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3,
  };

  const handleCourseClick = (classItem) => {
    const safeUrlSlug = (classItem.name || "course")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    navigate(`/courses/${safeUrlSlug}`, {
      state: {
        courseId: classItem._id,
        courseName: classItem.name,
      },
    });
  };

  return (
    <>
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="min-h-screen bg-background p-6 md:p-8 transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-muted-foreground mt-1">
                Overview of all active Courses, fees, and student allocations.
              </p>
            </div>

            <Link
              to="/courses/addnewstudent"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              <Plus size={20} />
              Add New Student
            </Link>

            <Link
              to="/courses/createcourse"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              <Plus size={20} />
              Create New Course
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-4 items-end">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search by class name or instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-base"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-foreground/80 mb-2">
                Trade
              </label>
              <select
                value={selectedTradeId}
                onChange={(e) => setSelectedTradeId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="">All Trades</option>
                <option value="unassigned">Unassigned</option>
                {TRADES.map((trade) => (
                  <option key={trade.id} value={trade.id}>
                    {trade.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive flex items-center gap-2 font-medium">
              <span>⚠️</span> {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p>Loading Courses...</p>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border border-dashed p-12 text-center">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">
                No Courses found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search query."
                  : "Get started by creating your first class."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((classItem) => {
                if (!classItem) return null;

                const status = getClassStatus(
                  classItem?.startDate,
                  classItem?.endDate,
                  classItem?.isActive,
                );

                return (
                  <div
                    key={classItem?._id || Math.random()}
                    onClick={() => handleCourseClick(classItem)}
                    className="group bg-card rounded-2xl border border-border p-6 cursor-pointer hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden flex flex-col"
                  >
                    {/* Hover Top Accent Bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="flex justify-between items-start mb-4">
                      <div className="w-full">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {classItem?.name || "Unknown Course"}
                          </h3>
                          <span
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${status.styles} whitespace-nowrap`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Instructor: {classItem?.teacherName || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6 mt-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 rounded-lg text-xs font-medium text-primary border border-primary/20">
                        {getTradeLabel(
                          courseTradeMap[classItem?._id] ||
                            classItem?.tradeId ||
                            getTradeFromCourseName(classItem?.name),
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground border border-border/50">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                        {classItem?.duration || 0} Months
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-1.5 bg-muted/50 rounded-lg text-xs font-medium text-muted-foreground border border-border/50">
                        <IndianRupee className="w-3.5 h-3.5 text-muted-foreground/70" />
                        {classItem?.fees || 0}
                      </div>
                    </div>

                    <div className="pt-4 mt-auto border-t border-border flex items-center justify-between">
                      <div className="flex items-center text-muted-foreground text-sm gap-2">
                        <Users className="w-4 h-4 text-muted-foreground/70" />
                        <span>
                          <strong className="text-foreground">
                            {classItem?.students?.length || 0}
                          </strong>{" "}
                          Enrolled
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
      <Outlet />
    </>
  );
};

export default CoursesPage;
