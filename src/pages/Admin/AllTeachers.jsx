import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  BookOpen,
  User,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import useUserStore from "../../stores/useUserStore";

const AllTeachers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const teachers = useUserStore((state) => state.teachers);
  const getTeachers = useUserStore((state) => state.getTeachers);
  const isLoading = useUserStore((state) => state.isLoading);
  const error = useUserStore((state) => state.error);

  useEffect(() => {
    if (!selectedTeacherId) {
      getTeachers();
    }
  }, [selectedTeacherId, getTeachers]);

  const filteredTeachers = Array.isArray(teachers)
    ? teachers.filter(
        (teacher) =>
          teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher?.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  const handleTeacherClick = (teacher) => {
    setSelectedTeacher(teacher);
    setSelectedTeacherId(teacher._id);
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

  if (selectedTeacherId) {
    return (
      <TeacherDetailsView
        teacher={selectedTeacher}
        onBack={() => {
          setSelectedTeacherId(null);
          setSelectedTeacher(null);
        }}
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
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Teachers</h1>
            <p className="text-slate-500 mt-1">
              Manage and view all teachers along with their assigned courses.
            </p>
          </div>

          <div className="relative group max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
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
              <p>Loading Teachers...</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No Teachers Found
              </h3>
              <p className="text-slate-500">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "No teachers available at the moment."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {filteredTeachers.map((teacher, index) => (
                  <motion.div
                    key={teacher._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleTeacherClick(teacher)}
                    className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                  >
                    <div className="p-6 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          {teacher.profilePic ? (
                            <img
                              src={teacher.profilePic}
                              alt={teacher.name}
                              className="w-14 h-14 rounded-full object-cover bg-slate-100"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                              {teacher.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900">
                              {teacher.name}
                            </h3>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
                              <div className="flex items-center gap-1">
                                <Mail size={16} className="text-slate-400" />
                                {teacher.email}
                              </div>
                              {teacher.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone size={16} className="text-slate-400" />
                                  {teacher.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-indigo-600">
                            {teacher.mainClasses?.length || 0}
                          </p>
                          <p className="text-xs text-slate-500">Classes</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

const TeacherDetailsView = ({ teacher, onBack }) => {
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 20 },
  };

  const pageTransition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.3,
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen bg-slate-50 p-6 md:p-8"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Teachers
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
          <div className="h-24 bg-gradient-to-r from-indigo-600 to-purple-600"></div>

          <div className="px-6 md:px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 -mt-12 mb-6">
              {teacher.profilePic ? (
                <img
                  src={teacher.profilePic}
                  alt={teacher.name}
                  className="w-24 h-24 rounded-2xl object-cover bg-slate-100 border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-lg">
                  {teacher.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 pt-2">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {teacher.name}
                </h1>
                <div className="flex flex-wrap gap-4 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-slate-400" />
                    {teacher.email}
                  </div>
                  {teacher.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={18} className="text-slate-400" />
                      {teacher.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <p className="text-sm font-medium text-indigo-600">
                      Total Classes
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-indigo-900">
                    {teacher.mainClasses?.length || 0}
                  </p>
                </div>

                {teacher.batches && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <p className="text-sm font-medium text-purple-600">
                        Total Batches
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-purple-900">
                      {teacher.batches.length || 0}
                    </p>
                  </div>
                )}

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    <p className="text-sm font-medium text-emerald-600">
                      Status
                    </p>
                  </div>
                  <p className="text-lg font-bold text-emerald-900">Active</p>
                </div>
              </div>

              {teacher.mainClasses && teacher.mainClasses.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    Assigned Classes
                  </h2>
                  <div className="space-y-3">
                    {teacher.mainClasses.map((mainClass) => (
                      <div
                        key={mainClass._id}
                        className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-indigo-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-slate-900">
                            {mainClass.name}
                          </h3>
                          <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                            ₹ {mainClass.fees}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                          <div>Duration: {mainClass.duration} hours</div>
                          <div>
                            Start:{" "}
                            {new Date(mainClass.startDate).toLocaleDateString()}
                          </div>
                          <div>
                            End:{" "}
                            {new Date(mainClass.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AllTeachers;
