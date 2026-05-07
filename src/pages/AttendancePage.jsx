import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Layers,
  Clock,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Check,
  X,
  Calendar,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../stores/useAuthStore";
import useAttendanceStore from "../stores/useAttendanceStore";
import toast from "react-hot-toast";
import BackButton from "../components/UI/Button";

const AttendancePage = () => {
  const navigate = useNavigate();

  const userData = useAuthStore((state) => state.user);
  const loadUser = useAuthStore((state) => state.loadUser);
  const userId = useAuthStore((state) => state.id);
  const userRole = useAuthStore((state) => state.userRole);

  const {
    batches,
    selectedBatch,
    students,
    attendance,
    attendanceDate,
    isLoading,
    error,
    success,
    getTeacherBatches,
    getAllBatches,
    selectBatch,
    toggleAttendance,
    markAllPresent,
    markAllAbsent,
    submitAttendance,
    setAttendanceDate,
    resetStore,
    clearError,
  } = useAttendanceStore();

  const [isBatchDropdownOpen, setIsBatchDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBatchSelection, setShowBatchSelection] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Load user and batches on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (userId && userRole) {
      if (userRole === "Admin") {
        getAllBatches();
      } else {
        getTeacherBatches(userId);
      }
    }
  }, [userId, userRole, getTeacherBatches, getAllBatches]);

  const handleSelectBatch = async (batch) => {
    try {
      await selectBatch(batch);
      setShowBatchSelection(false);
      setIsBatchDropdownOpen(false);
      toast.success(`Batch "${batch.name}" selected`);
    } catch (err) {
      toast.error("Failed to select batch");
    }
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();

    if (!selectedBatch) {
      toast.error("Please select a batch first");
      return;
    }

    if (students.length === 0) {
      toast.error("No students in this batch");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitAttendance();
      toast.success("Attendance submitted successfully!");
      resetStore();
      setShowBatchSelection(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit attendance");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate statistics
  const totalStudents = students.length;
  const presentCount = Object.values(attendance).filter((val) => val).length;
  const absentCount = totalStudents - presentCount;

  // Filter students by search term
  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.name?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower)
    );
  });

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  if (!userData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-primary/60 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50 to-slate-100 p-6 md:p-8"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <BackButton details={`Track and manage your batch attendance`} />
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl flex items-start gap-3 border bg-red-50 border-red-100 text-red-700"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{error}</p>
              <button
                onClick={clearError}
                className="text-xs mt-1 text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}

        {/* Success Alert */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl flex items-start gap-3 border bg-emerald-50 border-emerald-100 text-emerald-700"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="font-medium">Attendance submitted successfully!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        {isLoading && batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
            <p className="text-slate-600 font-medium">
              Loading your batches...
            </p>
          </div>
        ) : batches.length === 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center"
          >
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              No Batches Assigned
            </h2>
            <p className="text-slate-500">
              You don't have any batches assigned yet. Contact your admin to
              assign you a batch.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Batch Selection Card */}
            <motion.div
              variants={itemVariants}
              className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8"
            >
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Select Your Batch
              </h2>

              {/* Batch Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsBatchDropdownOpen(!isBatchDropdownOpen)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    isBatchDropdownOpen
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 bg-white hover:border-indigo-300"
                  }`}
                >
                  {selectedBatch ? (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-900">
                          {selectedBatch.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {selectedBatch.weekday} • {selectedBatch.startTime} -{" "}
                          {selectedBatch.endTime}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-500">
                      Click to select a batch...
                    </span>
                  )}
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      isBatchDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isBatchDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden"
                    >
                      {batches.map((batch) => (
                        <button
                          key={batch._id}
                          onClick={() => handleSelectBatch(batch)}
                          className="w-full text-left p-4 border-b border-slate-100 hover:bg-indigo-50 transition-colors last:border-b-0"
                        >
                          <p className="font-semibold text-slate-900">
                            {batch.name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {batch.weekday} • {batch.startTime} -{" "}
                            {batch.endTime}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {batch.students?.length || 0} students
                          </p>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Attendance Form */}
            {selectedBatch && students.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8"
              >
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Mark Attendance
                </h2>

                <form onSubmit={handleSubmitAttendance} className="space-y-6">
                  {/* Date Selection */}
                  <div className="space-y-2">
                    <label
                      htmlFor="attendanceDate"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Attendance Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="attendanceDate"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  {/* Student Search */}
                  <div className="space-y-2">
                    <label
                      htmlFor="searchStudents"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Search Students
                    </label>
                    <input
                      type="text"
                      id="searchStudents"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={markAllPresent}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-100 text-emerald-700 font-medium hover:bg-emerald-200 transition-colors"
                    >
                      Mark All Present
                    </button>
                    <button
                      type="button"
                      onClick={markAllAbsent}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-red-100 text-red-700 font-medium hover:bg-red-200 transition-colors"
                    >
                      Mark All Absent
                    </button>
                  </div>

                  {/* Students List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredStudents.length === 0 ? (
                      <p className="text-center text-slate-500 py-8">
                        No students found matching your search
                      </p>
                    ) : (
                      filteredStudents.map((student) => (
                        <motion.div
                          key={student._id}
                          className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all cursor-pointer"
                          onClick={() => toggleAttendance(student._id)}
                        >
                          <img
                            src={
                              student.profilePic ||
                              `https://ui-avatars.com/api/?name=${student.name}&background=e0e7ff&color=4f46e5`
                            }
                            alt={student.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {student.name}
                            </p>
                            <p className="text-sm text-slate-500 truncate">
                              {student.email}
                            </p>
                          </div>
                          <div className="shrink-0">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                attendance[student._id]
                                  ? "bg-emerald-500 text-white"
                                  : "bg-slate-200 text-slate-400"
                              }`}
                            >
                              {attendance[student._id] ? (
                                <Check className="w-5 h-5" />
                              ) : (
                                <X className="w-5 h-5" />
                              )}
                            </motion.div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || students.length === 0}
                    className="w-full py-3 px-6 bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Submit Attendance
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Statistics Footer */}
            {selectedBatch && students.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {/* Total Students */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 mb-1">
                        Total Students
                      </p>
                      <p className="text-3xl font-bold text-blue-900">
                        {totalStudents}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-200 text-blue-600 rounded-lg">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                </motion.div>

                {/* Present */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-linear-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-600 mb-1">
                        Present
                      </p>
                      <p className="text-3xl font-bold text-emerald-900">
                        {presentCount}
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        {((presentCount / totalStudents) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-200 text-emerald-600 rounded-lg">
                      <Check className="w-6 h-6" />
                    </div>
                  </div>
                </motion.div>

                {/* Absent */}
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-linear-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600 mb-1">
                        Absent
                      </p>
                      <p className="text-3xl font-bold text-red-900">
                        {absentCount}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        {((absentCount / totalStudents) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-3 bg-red-200 text-red-600 rounded-lg">
                      <X className="w-6 h-6" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AttendancePage;
