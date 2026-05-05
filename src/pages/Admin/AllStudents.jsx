import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Search,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  User,
  ArrowLeft,
  Check,
  Calendar,
  BookOpen,
  FileText,
  Filter,
  X,
} from "lucide-react";
import useUserStore from "../../stores/useUserStore";

const AllStudents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    selectedClass: null,
    selectedBatch: null,
    courseComplete: false,
    examComplete: false,
    certificateComplete: false,
  });
  const [loadingProgress, setLoadingProgress] = useState({});

  const students = useUserStore((state) => state.students);
  const getStudents = useUserStore((state) => state.getStudents);
  const getStudentProgress = useUserStore((state) => state.getStudentProgress);
  const updateStudentProgress = useUserStore(
    (state) => state.updateStudentProgress,
  );
  const studentProgress = useUserStore((state) => state.studentProgress);
  const isLoading = useUserStore((state) => state.isLoading);
  const error = useUserStore((state) => state.error);

  useEffect(() => {
    if (!selectedStudentId) {
      getStudents();
    }
  }, [selectedStudentId, getStudents]);

  // Fetch progress data for all students and their classes
  useEffect(() => {
    if (Array.isArray(students) && students.length > 0) {
      students.forEach((student) => {
        if (student.mainClasses && student.mainClasses.length > 0) {
          student.mainClasses.forEach((mainClass) => {
            const key = `${student._id}_${mainClass._id}`;
            if (!studentProgress[key]) {
              getStudentProgress(student._id, mainClass._id);
            }
          });
        }
      });
    }
  }, [students, studentProgress, getStudentProgress]);

  // Extract unique classes and batches from students data
  const classes = Array.isArray(students)
    ? [
        ...new Map(
          students.flatMap((s) => s.mainClasses || []).map((c) => [c._id, c]),
        ).values(),
      ]
    : [];

  const batches = Array.isArray(students)
    ? [
        ...new Map(
          students.flatMap((s) => s.batches || []).map((b) => [b._id, b]),
        ).values(),
      ]
    : [];

  const filteredStudents = Array.isArray(students)
    ? students.filter((student) => {
        const matchesSearch =
          student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student?.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesClass =
          !filters.selectedClass ||
          student?.mainClasses?.some((c) => c._id === filters.selectedClass);

        const matchesBatch =
          !filters.selectedBatch ||
          student?.batches?.some((b) => b._id === filters.selectedBatch);

        // Check progress filters
        const studentClassProgress =
          student.mainClasses?.map((mc) => {
            const key = `${student._id}_${mc._id}`;
            return studentProgress[key];
          }) || [];

        const matchesCourseComplete =
          !filters.courseComplete ||
          studentClassProgress.some((p) => p?.batchcompletion === true);

        const matchesExamComplete =
          !filters.examComplete ||
          studentClassProgress.some((p) => p?.examcompletion === true);

        const matchesCertificateComplete =
          !filters.certificateComplete ||
          studentClassProgress.some((p) => p?.certificateIssued === true);

        return (
          matchesSearch &&
          matchesClass &&
          matchesBatch &&
          matchesCourseComplete &&
          matchesExamComplete &&
          matchesCertificateComplete
        );
      })
    : [];

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setSelectedStudentId(student._id);
  };

  const toggleProgressCheckbox = async (studentId, mainClassId, field) => {
    const key = `${studentId}_${mainClassId}`;
    const currentProgress = studentProgress[key] || {};
    const newValue =
      !currentProgress[
        field === "courseComplete"
          ? "batchcompletion"
          : field === "examComplete"
            ? "examcompletion"
            : "certificateIssued"
      ];

    // Show loading state
    setLoadingProgress((prev) => ({
      ...prev,
      [`${key}_${field}`]: true,
    }));

    const progressData = {
      batchcompletion:
        field === "courseComplete" ? newValue : currentProgress.batchcompletion,
      examcompletion:
        field === "examComplete" ? newValue : currentProgress.examcompletion,
      certificateIssued:
        field === "certificateComplete"
          ? newValue
          : currentProgress.certificateIssued,
    };

    try {
      const result = await updateStudentProgress(
        studentId,
        mainClassId,
        progressData,
      );

      if (result) {
        const fieldLabel =
          field === "courseComplete"
            ? "Course"
            : field === "examComplete"
              ? "Exam"
              : "Certificate";
        toast.success(`${fieldLabel} status updated successfully!`);
      } else {
        toast.error("Failed to update progress. Please try again.");
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Error updating progress. Please try again.");
    } finally {
      setLoadingProgress((prev) => ({
        ...prev,
        [`${key}_${field}`]: false,
      }));
    }
  };

  const getStudentProgressStats = (student) => {
    let totalClasses = student.mainClasses?.length || 0;
    let courseCompleteCount = 0;
    let examCompleteCount = 0;
    let certificateCount = 0;

    student.mainClasses?.forEach((mainClass) => {
      const key = `${student._id}_${mainClass._id}`;
      const progress = studentProgress[key];
      if (progress?.batchcompletion) courseCompleteCount++;
      if (progress?.examcompletion) examCompleteCount++;
      if (progress?.certificateIssued) certificateCount++;
    });

    return {
      totalClasses,
      courseCompleteCount,
      examCompleteCount,
      certificateCount,
    };
  };

  const handleFilterChange = (key, value) => {
    if (value === filters[key]) {
      setFilters((prev) => ({ ...prev, [key]: null }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
  };

  const hasActiveFilters =
    filters.selectedClass ||
    filters.selectedBatch ||
    filters.courseComplete ||
    filters.examComplete ||
    filters.certificateComplete;

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

  if (selectedStudentId) {
    return (
      <StudentDetailsView
        student={selectedStudent}
        studentProgress={studentProgress}
        onProgressChange={(mainClassId, field) =>
          toggleProgressCheckbox(selectedStudent._id, mainClassId, field)
        }
        loadingProgress={loadingProgress}
        onBack={() => {
          setSelectedStudentId(null);
          setSelectedStudent(null);
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
            <h1 className="text-3xl font-bold text-slate-900">Students</h1>
            <p className="text-slate-500 mt-1">
              Manage and track all students along with their progress and course
              enrollment.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative group">
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

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all w-fit ${
                showFilters || hasActiveFilters
                  ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300"
              }`}
            >
              <Filter size={18} />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                  {Object.values(filters).filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6"
              >
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">
                    Filter by Class
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {classes.map((mainClass) => (
                      <button
                        key={mainClass._id}
                        onClick={() =>
                          handleFilterChange("selectedClass", mainClass._id)
                        }
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          filters.selectedClass === mainClass._id
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {mainClass.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">
                    Filter by Batch
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {batches.map((batch) => (
                      <button
                        key={batch._id}
                        onClick={() =>
                          handleFilterChange("selectedBatch", batch._id)
                        }
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          filters.selectedBatch === batch._id
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {batch.name} ({batch.weekday})
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">
                    Filter by Progress
                  </h3>
                  <div className="space-y-2">
                    {[
                      { key: "courseComplete", label: "Course Complete" },
                      { key: "examComplete", label: "Exam Complete" },
                      {
                        key: "certificateComplete",
                        label: "Certificate Complete",
                      },
                    ].map(({ key, label }) => (
                      <label
                        key={key}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters[key]}
                          onChange={() => {
                            setFilters((prev) => ({
                              ...prev,
                              [key]: !prev[key],
                            }));
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-slate-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setFilters({
                        selectedClass: null,
                        selectedBatch: null,
                        courseComplete: false,
                        examComplete: false,
                        certificateComplete: false,
                      });
                    }}
                    className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
                  >
                    <X size={16} />
                    Clear Filters
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
              <p>Loading Students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No Students Found
              </h3>
              <p className="text-slate-500">
                {searchTerm || hasActiveFilters
                  ? "Try adjusting your search or filter criteria."
                  : "No students available at the moment."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {filteredStudents.map((student, index) => {
                  const stats = getStudentProgressStats(student);
                  return (
                    <motion.div
                      key={student._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div
                            onClick={() => handleStudentClick(student)}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-center gap-4">
                              {student.profilePic ? (
                                <img
                                  src={student.profilePic}
                                  alt={student.name}
                                  className="w-14 h-14 rounded-full object-cover bg-slate-100"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                  {student.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                  {student.name}
                                </h3>
                                <div className="flex flex-wrap gap-4 mt-1 text-sm text-slate-600">
                                  <div className="flex items-center gap-1">
                                    <Mail
                                      size={14}
                                      className="text-slate-400"
                                    />
                                    {student.email}
                                  </div>
                                  {student.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone
                                        size={14}
                                        className="text-slate-400"
                                      />
                                      {student.phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            onClick={() => handleStudentClick(student)}
                            className="cursor-pointer ml-4"
                          >
                            <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>

                        <div className="space-y-3 border-t border-slate-200 pt-4">
                          <div className="flex flex-wrap gap-2">
                            {student.mainClasses &&
                              student.mainClasses.length > 0 && (
                                <div className="flex items-center gap-1 text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg">
                                  <BookOpen size={14} />
                                  {student.mainClasses.length} classes
                                </div>
                              )}
                            {student.batches && student.batches.length > 0 && (
                              <div className="flex items-center gap-1 text-sm bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg">
                                <Calendar size={14} />
                                {student.batches.length} batches
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="bg-blue-50 rounded-lg p-2 text-center">
                              <div className="font-bold text-blue-700">
                                {stats.courseCompleteCount}/{stats.totalClasses}
                              </div>
                              <div className="text-blue-600">Course</div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-2 text-center">
                              <div className="font-bold text-purple-700">
                                {stats.examCompleteCount}/{stats.totalClasses}
                              </div>
                              <div className="text-purple-600">Exam</div>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-2 text-center">
                              <div className="font-bold text-emerald-700">
                                {stats.certificateCount}/{stats.totalClasses}
                              </div>
                              <div className="text-emerald-600">Cert</div>
                            </div>
                          </div>

                          {student.mainClasses &&
                            student.mainClasses.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {student.mainClasses.map((mainClass) => {
                                  const key = `${student._id}_${mainClass._id}`;
                                  const progress = studentProgress[key] || {};
                                  return (
                                    <div
                                      key={mainClass._id}
                                      className="text-xs bg-slate-50 rounded-lg p-2"
                                    >
                                      <div className="font-medium text-slate-700 mb-1">
                                        {mainClass.name}
                                      </div>
                                      <div className="flex gap-1">
                                        {[
                                          {
                                            key: "courseComplete",
                                            field: "batchcompletion",
                                            icon: BookOpen,
                                          },
                                          {
                                            key: "examComplete",
                                            field: "examcompletion",
                                            icon: FileText,
                                          },
                                          {
                                            key: "certificateComplete",
                                            field: "certificateIssued",
                                            icon: Check,
                                          },
                                        ].map(
                                          ({
                                            key: fieldKey,
                                            field,
                                            icon: Icon,
                                          }) => (
                                            <button
                                              key={fieldKey}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleProgressCheckbox(
                                                  student._id,
                                                  mainClass._id,
                                                  fieldKey,
                                                );
                                              }}
                                              disabled={
                                                loadingProgress[
                                                  `${key}_${fieldKey}`
                                                ]
                                              }
                                              className={`p-1.5 rounded transition-all ${
                                                progress[field]
                                                  ? "bg-emerald-100 text-emerald-700"
                                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                              } disabled:opacity-50`}
                                              title={fieldKey}
                                            >
                                              <Icon size={12} />
                                            </button>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

const StudentDetailsView = ({
  student,
  studentProgress,
  onProgressChange,
  loadingProgress,
  onBack,
}) => {
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
          Back to Students
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
          <div className="h-24 bg-gradient-to-r from-indigo-600 to-purple-600"></div>

          <div className="px-6 md:px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 -mt-12 mb-6">
              {student.profilePic ? (
                <img
                  src={student.profilePic}
                  alt={student.name}
                  className="w-24 h-24 rounded-2xl object-cover bg-slate-100 border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-lg">
                  {student.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 pt-2">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {student.name}
                </h1>
                <div className="flex flex-wrap gap-4 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-slate-400" />
                    {student.email}
                  </div>
                  {student.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={18} className="text-slate-400" />
                      {student.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {student.mainClasses && student.mainClasses.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    Enrolled Classes & Progress
                  </h2>
                  <div className="space-y-4">
                    {student.mainClasses.map((mainClass) => {
                      const key = `${student._id}_${mainClass._id}`;
                      const progress = studentProgress[key] || {};
                      return (
                        <div
                          key={mainClass._id}
                          className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-indigo-300 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-slate-900">
                                {mainClass.name}
                              </h3>
                              <div className="flex flex-wrap gap-4 mt-1 text-sm text-slate-600">
                                <div>Duration: {mainClass.duration} hours</div>
                                <div>
                                  Start:{" "}
                                  {new Date(
                                    mainClass.startDate,
                                  ).toLocaleDateString()}
                                </div>
                                <div>
                                  End:{" "}
                                  {new Date(
                                    mainClass.endDate,
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                              ₹ {mainClass.fees}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            {[
                              {
                                key: "courseComplete",
                                field: "batchcompletion",
                                icon: BookOpen,
                                label: "Course Complete",
                                color: "indigo",
                              },
                              {
                                key: "examComplete",
                                field: "examcompletion",
                                icon: FileText,
                                label: "Exam Complete",
                                color: "purple",
                              },
                              {
                                key: "certificateComplete",
                                field: "certificateIssued",
                                icon: Check,
                                label: "Certificate Issued",
                                color: "emerald",
                              },
                            ].map(
                              ({
                                key: fieldKey,
                                field,
                                icon: Icon,
                                label,
                                color,
                              }) => {
                                const isComplete = progress[field];
                                const colorClass =
                                  color === "indigo"
                                    ? "from-indigo-50 to-indigo-100 border-indigo-200"
                                    : color === "purple"
                                      ? "from-purple-50 to-purple-100 border-purple-200"
                                      : "from-emerald-50 to-emerald-100 border-emerald-200";
                                const textColorClass =
                                  color === "indigo"
                                    ? "text-indigo-600"
                                    : color === "purple"
                                      ? "text-purple-600"
                                      : "text-emerald-600";

                                return (
                                  <button
                                    key={fieldKey}
                                    onClick={() =>
                                      onProgressChange(mainClass._id, fieldKey)
                                    }
                                    disabled={
                                      loadingProgress[`${key}_${fieldKey}`]
                                    }
                                    className={`relative rounded-xl p-3 border-2 transition-all ${
                                      isComplete
                                        ? `bg-gradient-to-br ${colorClass} border-${color}-300`
                                        : "bg-white border-slate-200 hover:border-slate-300"
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                  >
                                    <div className="flex flex-col items-center gap-2">
                                      <div
                                        className={`p-2 rounded-lg ${
                                          isComplete
                                            ? `bg-${color}-100`
                                            : "bg-slate-100"
                                        }`}
                                      >
                                        <Icon
                                          size={20}
                                          className={
                                            isComplete
                                              ? textColorClass
                                              : "text-slate-400"
                                          }
                                        />
                                      </div>
                                      <p
                                        className={`font-medium text-xs text-center ${
                                          isComplete
                                            ? textColorClass
                                            : "text-slate-600"
                                        }`}
                                      >
                                        {label}
                                      </p>
                                      {isComplete && (
                                        <div className="bg-green-500 text-white rounded-full p-1 absolute top-2 right-2">
                                          <Check size={12} />
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                );
                              },
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {student.batches && student.batches.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    Assigned Batches
                  </h2>
                  <div className="space-y-3">
                    {student.batches.map((batch) => (
                      <div
                        key={batch._id}
                        className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:border-purple-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {batch.name}
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">
                              {batch.weekday} • {batch.startTime} -{" "}
                              {batch.endTime}
                            </p>
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

export default AllStudents;
