import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  Search,
  XCircle,
  AlertCircle,
  User,
  Check,
  Award,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import useUserStore from "../../stores/useUserStore";
import useClassStore from "../../stores/useClassStore";
import useAuthStore from "../../stores/useAuthStore";
import useBatchStore from "../../stores/useBatchStore";
import { getStudentId } from "../../util/getStudentId";
import {
  filterStudentsForTeacher,
  filterBatchesForTeacher,
} from "../../util/teacherAccessControl";
import { useNavigate } from "react-router-dom";

const StudentRow = ({
  student,
  index,
  classMap,
  progressMap,
  allStudents,
  onProgressUpdate,
  onShowToast,
  isBuildingMap,
}) => {
  const navigate = useNavigate();
  const [loadingToggles, setLoadingToggles] = useState({});
  const patchStudentProgress = useClassStore(
    (state) => state.getStudentProgress,
  );

  const studentId = getStudentId(student);

  const allEnrolledClassIds = (student.mainClasses || []).map(
    (cls) => cls._id || cls,
  );

  const assignedClassIds = allEnrolledClassIds.filter(
    (clsId) => progressMap[`${student._id}_${clsId}`],
  );

  // --- Row Click Navigation Handler ---
  const handleRowClick = () => {
    navigate("/studentprofile", {
      state: {
        userId: student._id,
        studentId: student._id,
        userData: student,
      },
    });
  };

  const handleToggle = async (clsId, fieldName, currentValue, label) => {
    const progressDoc = progressMap[`${student._id}_${clsId}`];

    if (!progressDoc || !progressDoc._id) return;

    const key = `${student._id}_${clsId}_${fieldName}`;
    setLoadingToggles((prev) => ({ ...prev, [key]: true }));

    const newValue = !currentValue;

    try {
      await patchStudentProgress(progressDoc._id, {
        [fieldName]: newValue,
      });

      onProgressUpdate(student._id, clsId, { [fieldName]: newValue });

      const statusText = newValue
        ? "marked as Complete"
        : "marked as Incomplete";
      if (onShowToast) {
        onShowToast(`"${label}" for ${student.name} ${statusText}.`);
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
      if (onShowToast) {
        onShowToast(`Failed to update ${label} for ${student.name}.`, "error");
      }
    } finally {
      setLoadingToggles((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const renderStatusToggle = (clsId, fieldName, label) => {
    const progressDoc = progressMap[`${student._id}_${clsId}`];
    const isChecked = progressDoc?.[fieldName] || false;
    const isUpdating =
      loadingToggles[`${student._id}_${clsId}_${fieldName}`] || false;

    const isMissingData = !progressDoc;
    const isCertificate = fieldName === "certificateIssued";

    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (isMissingData) {
            if (onShowToast)
              onShowToast("The batch is not assigned yet.", "error");
            return;
          }
          if (isUpdating) return;
          handleToggle(clsId, fieldName, isChecked, label);
        }}
        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          isMissingData || isUpdating
            ? "opacity-50 cursor-not-allowed border-border bg-background"
            : isCertificate && isChecked
              ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-600 text-white shadow-sm"
              : "border-border bg-background hover:bg-muted/50 text-foreground"
        }`}
      >
        {isUpdating ? (
          <Loader2
            className={`w-4 h-4 animate-spin ${isCertificate && isChecked ? "text-white" : "text-primary"}`}
          />
        ) : isCertificate ? (
          isChecked ? (
            <Award className="w-4 h-4 text-white" />
          ) : (
            <Check className="w-4 h-4 text-muted-foreground" />
          )
        ) : isChecked ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        ) : (
          <XCircle className="w-4 h-4 text-muted-foreground" />
        )}

        <span
          className={`text-xs font-semibold ${isCertificate && isChecked ? "text-white" : "text-muted-foreground"}`}
        >
          {label}
        </span>
      </button>
    );
  };

  return (
    <tr
      onClick={handleRowClick}
      className="hover:bg-muted/40 transition-colors group cursor-pointer border-b border-border/50 last:border-0 bg-card"
    >
      <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
        {index + 1}
      </td>
      <td className="px-4 py-4 font-medium text-foreground whitespace-nowrap">
        <div className="flex items-center gap-3">
          {student.profilePic ? (
            <img
              src={student.profilePic}
              alt={student.name}
              className="w-10 h-10 rounded-full object-cover border border-border bg-muted shrink-0 group-hover:border-primary/50 transition-colors"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://ui-avatars.com/api/?name=" +
                  encodeURIComponent(student.name || "User") +
                  "&background=random";
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 font-bold text-sm uppercase group-hover:bg-primary/20 transition-colors">
              {student.name ? student.name.charAt(0) : <User size={18} />}
            </div>
          )}

          <div className="flex flex-col">
            <span className="group-hover:text-primary transition-colors">
              {student.name || "Unnamed"}
            </span>
            <span className="text-xs text-muted-foreground font-normal mt-0.5">
              {student.email}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-muted-foreground font-mono whitespace-nowrap">
        {studentId || "-"}
      </td>
      <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
        {student.fatherName || "-"}
      </td>
      <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
        {student.address || "-"}
      </td>
      <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
        {student.phone || "-"}
      </td>
      <td className="px-4 py-4">
        {isBuildingMap ? (
          <div className="flex items-center gap-2 text-muted-foreground text-xs italic">
            <Loader2 className="w-3 h-3 animate-spin text-primary" />
            Loading progress...
          </div>
        ) : assignedClassIds.length === 0 ? (
          <div className="text-muted-foreground text-xs italic">
            No active batches assigned
          </div>
        ) : (
          <div className="min-w-[420px]">
            <div className="grid grid-cols-4 gap-3 text-xs font-semibold text-muted-foreground mb-3 px-2">
              <span>Course Name</span>
              <span className="text-center">Course</span>
              <span className="text-center">Exam</span>
              <span className="text-center">Certificate</span>
            </div>
            <div className="space-y-3">
              {assignedClassIds.map((clsId) => (
                <div
                  key={clsId}
                  className="grid grid-cols-4 gap-3 items-center bg-muted/30 p-2 rounded-xl border border-border/50"
                >
                  <span
                    className="text-xs font-medium text-foreground truncate pr-2"
                    title={classMap.get(clsId)}
                  >
                    {classMap.get(clsId) || "Unknown"}
                  </span>
                  {renderStatusToggle(clsId, "batchcompletion", "Course")}
                  {renderStatusToggle(clsId, "examcompletion", "Exam")}
                  {renderStatusToggle(clsId, "certificateIssued", "Issued")}
                </div>
              ))}
            </div>
          </div>
        )}
      </td>
    </tr>
  );
};

const AllStudents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [progressMap, setProgressMap] = useState({});
  const [isBuildingMap, setIsBuildingMap] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Change to adjust how many rows appear per page

  // User Store
  const students = useUserStore((state) => state.students);
  const getStudents = useUserStore((state) => state.getStudents);
  const isLoadingStudents = useUserStore((state) => state.isLoading);
  const studentError = useUserStore((state) => state.error);

  // Auth Store - for teacher access control
  const userRole = useAuthStore((state) => state.userRole);
  const userData = useAuthStore((state) => state.user);

  // Class Store
  const allClass = useClassStore((state) => state.allClass);
  const getClasses = useClassStore((state) => state.getClasses);
  const getClassById = useClassStore((state) => state.getClassById);

  // Batch Store
  const batches = useBatchStore((state) => state.batches);
  const fetchBatches = useBatchStore((state) => state.fetchBatches);

  useEffect(() => {
    getStudents();
    getClasses();
    fetchBatches();
  }, [getStudents, getClasses, fetchBatches]);

  // Filter students based on teacher's batches
  const filteredStudentsForTeacher = useMemo(() => {
    if (userRole === "Teacher") {
      const teacherBatches = filterBatchesForTeacher(
        batches,
        userData?.batches || [],
        userRole,
        userData?.email,
      );
      return filterStudentsForTeacher(students, teacherBatches, userRole);
    }
    return students;
  }, [students, userRole, userData, batches]);

  useEffect(() => {
    if (!filteredStudentsForTeacher?.length) return;

    const buildProgressMap = async () => {
      setIsBuildingMap(true);
      const uniqueClassIds = new Set();
      filteredStudentsForTeacher.forEach((student) => {
        (student.mainClasses || []).forEach((cls) =>
          uniqueClassIds.add(cls._id || cls),
        );
      });

      const newProgressMap = {};

      const fetchPromises = Array.from(uniqueClassIds).map(async (clsId) => {
        try {
          const classData = await getClassById(clsId);
          if (classData && classData.studentsProgress) {
            classData.studentsProgress.forEach((prog) => {
              const stdId = prog.student?._id || prog.student;
              newProgressMap[`${stdId}_${clsId}`] = prog;
            });
          }
        } catch (error) {
          console.error(`Failed to fetch progress for class ${clsId}`, error);
        }
      });

      await Promise.allSettled(fetchPromises);
      setProgressMap(newProgressMap);
      setIsBuildingMap(false);
    };

    buildProgressMap();
  }, [filteredStudentsForTeacher, getClassById]);

  const triggerToast = (message, type = "success") => {
    const toastId = Date.now();
    setToastMessage({ message, type, id: toastId });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.id === toastId ? null : prev));
    }, 5000);
  };

  const handleProgressUpdate = (studentId, classId, updatedFields) => {
    setProgressMap((prev) => {
      const key = `${studentId}_classId`;
      return {
        ...prev,
        [key]: { ...prev[key], ...updatedFields },
      };
    });
  };

  const classMap = useMemo(() => {
    const validClasses = Array.isArray(allClass) ? allClass : [];
    return new Map(validClasses.map((cls) => [cls._id, cls.name]));
  }, [allClass]);

  // Reset to first page whenever search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredStudents = useMemo(() => {
    if (!Array.isArray(filteredStudentsForTeacher)) return [];
    const query = searchTerm.toLowerCase().trim();
    if (!query) return filteredStudentsForTeacher;

    return filteredStudentsForTeacher.filter(
      (student) =>
        student?.name?.toLowerCase().includes(query) ||
        student?.email?.toLowerCase().includes(query) ||
        student?.phone?.toLowerCase().includes(query),
    );
  }, [filteredStudentsForTeacher, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    in: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      variants={pageVariants}
      transition={{ duration: 0.3 }}
      // Changed to h-full flex flex-col to solve scrollbar issue
      className="h-full bg-background p-4 md:p-8 relative flex flex-col"
    >
      {/* Interactive Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 pl-4 pr-10 py-3 rounded-xl shadow-2xl border backdrop-blur-md font-medium text-sm ${
              toastMessage.type === "error"
                ? "bg-destructive/90 text-destructive-foreground border-destructive"
                : "bg-success/90 text-white border-success/20 dark:bg-emerald-600"
            }`}
          >
            {toastMessage.type === "error" ? (
              <AlertCircle size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}
            <span>{toastMessage.message}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-black/15 transition-colors focus:outline-none"
              aria-label="Close notification"
            >
              <X
                size={14}
                className="text-current opacity-80 hover:opacity-100"
              />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1600px] mx-auto w-full h-full flex flex-col gap-6">
        {/* HEADER SECTION - shrink-0 to prevent collapsing */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Student Directory
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage enrollments and track progress across all students.
            </p>
          </div>

          <div className="relative group w-full md:max-w-md shrink-0">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-11 pr-12 py-3 bg-card border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
            {/* INSTANT CLEAR BUTTON */}
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-destructive transition-colors focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {studentError && (
          <div className="shrink-0 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive flex items-center gap-3 font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{studentError}</p>
          </div>
        )}

        {isLoadingStudents ? (
          <div className="flex-1 flex flex-col items-center justify-center py-32 text-muted-foreground bg-card rounded-2xl border border-border shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="font-medium">Loading Student Database...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex-1 bg-card rounded-2xl border border-border border-dashed p-16 flex flex-col items-center justify-center text-muted-foreground">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">
              No students found
            </p>
            <p className="text-sm mt-1">
              {searchTerm
                ? "Try adjusting your search criteria."
                : "No students available at the moment."}
            </p>
          </div>
        ) : (
          /* TABLE SECTION - flex-1 min-h-0 makes it fill remaining space but scroll internally */
          <div className="flex-1 flex flex-col min-h-0 bg-card border border-border rounded-2xl shadow-sm overflow-hidden relative">
            {isBuildingMap && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary/10 overflow-hidden z-20">
                <div className="h-full bg-primary w-1/3 animate-[slide_1.5s_ease-in-out_infinite]" />
              </div>
            )}

            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-sm text-left">
                {/* sticky top-0 ensures header stays visible while scrolling rows */}
                <thead className="sticky top-0 z-10 bg-muted border-b border-border text-muted-foreground shadow-sm">
                  <tr>
                    <th className="px-4 py-4 font-semibold whitespace-nowrap">
                      #
                    </th>
                    <th className="px-4 py-4 font-semibold whitespace-nowrap">
                      Student Identity
                    </th>
                    <th className="px-4 py-4 font-semibold whitespace-nowrap">
                      Student ID
                    </th>
                    <th className="px-4 py-4 font-semibold whitespace-nowrap">
                      Father Name
                    </th>
                    <th className="px-4 py-4 font-semibold whitespace-nowrap">
                      Address
                    </th>
                    <th className="px-4 py-4 font-semibold whitespace-nowrap">
                      Mobile
                    </th>
                    <th className="px-4 py-4 font-semibold">
                      Course Progress Tracker
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedStudents.map((student, index) => (
                    <StudentRow
                      key={student._id || index}
                      student={student}
                      index={startIndex + index} // Adjusted to show correct row numbers across pages
                      classMap={classMap}
                      progressMap={progressMap}
                      allStudents={students}
                      onProgressUpdate={handleProgressUpdate}
                      onShowToast={triggerToast}
                      isBuildingMap={isBuildingMap}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGINATION SECTION - shrink-0 to stay anchored at bottom */}
        {!isLoadingStudents && totalPages > 1 && (
          <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
            <p className="text-sm text-muted-foreground order-2 sm:order-1">
              Showing{" "}
              <span className="font-medium text-foreground">
                {startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {Math.min(startIndex + itemsPerPage, filteredStudents.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {filteredStudents.length}
              </span>{" "}
              students
            </p>

            <div className="flex items-center gap-2 order-1 sm:order-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
                {getPageNumbers().map((number) => (
                  <button
                    key={number}
                    onClick={() => setCurrentPage(number)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors shadow-sm ${
                      currentPage === number
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-border bg-card text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AllStudents;
