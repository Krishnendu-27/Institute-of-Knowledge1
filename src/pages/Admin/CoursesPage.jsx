import React, { useState, useEffect } from "react";
import { Link, Navigate, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import CourseDetailsPage from "./CourseDetails";

const CoursesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const allClass = useClassStore((state) => state.allClass);
  const getClasses = useClassStore((state) => state.getClasses);
  const isLoading = useClassStore((state) => state.isLoading);
  const error = useClassStore((state) => state.error);

  useEffect(() => {
    if (!selectedCourseId) {
      getClasses();
    }
  }, [selectedCourseId, getClasses]);

  const filteredClasses = Array.isArray(allClass)
    ? allClass.filter(
        (item) =>
          item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item?.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  const getClassStatus = (startDate, endDate, isActive) => {
    if (!isActive)
      return {
        label: "Unavailable",
        styles: "bg-red-100 text-red-700 border-red-200",
      };
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (now < start)
      return {
        label: "Not Started",
        styles: "bg-amber-100 text-amber-700 border-amber-200",
      };
    else if (now > end)
      return {
        label: "Course Ended",
        styles: "bg-slate-100 text-slate-600 border-slate-200",
      };
    else
      return {
        label: "Available",
        styles: "bg-emerald-100 text-emerald-700 border-emerald-200",
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

  if (selectedCourseId) {
    return (
      <CourseDetailsPage
        courseId={selectedCourseId}
        onBack={() => setSelectedCourseId(null)}
      />
    );
  }

  return (
    <>
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="min-h-screen bg-slate-50 p-6 md:p-8"
      >
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-slate-500 mt-1">
                Overview of all active Courses, fees, and student allocations.
              </p>
            </div>

            <Link
              to="/courses/addnewstudent"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5"
            >
              <Plus size={20} />
              Add New Student
            </Link>

            <Link
              to="/courses/createcourse"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5"
            >
              <Plus size={20} />
              Create New Course
            </Link>
          </div>

          <div className="relative group max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by class name or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-base"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
              <p>Loading Courses...</p>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                No Courses found
              </h3>
              <p className="text-slate-500">
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
                    onClick={() => setSelectedCourseId(classItem._id)}
                    className="group bg-white rounded-2xl border border-slate-200 p-6 cursor-pointer hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 relative overflow-hidden flex flex-col"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-full">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {classItem?.name || "Unknown Course"}
                          </h3>
                          <span
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${status.styles} whitespace-nowrap`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-500">
                          Instructor: {classItem?.teacherName || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6 mt-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg text-xs font-medium text-slate-600 border border-slate-100">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {classItem?.duration || 0} Months
                      </div>
                      <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 rounded-lg text-xs font-medium text-slate-600 border border-slate-100">
                        <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                        {classItem?.fees || 0}
                      </div>
                    </div>

                    <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center text-slate-600 text-sm gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>
                          <strong className="text-slate-900">
                            {classItem?.students?.length || 0}
                          </strong>{" "}
                          Enrolled
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
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
