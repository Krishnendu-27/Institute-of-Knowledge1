import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useBatchStore from "../../stores/useBatchStore";
import useAuthStore from "../../stores/useAuthStore";
import useUserStore from "../../stores/useUserStore";
import {
  Loader2,
  Trash2,
  AlertTriangle,
  X,
  BookOpen,
  Clock,
  Calendar,
  Users,
  Search,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import BackButton from "../../components/UI/Button";
import { generateSlug } from "../../util/generateSlug";
import { canTeacherAccessBatch } from "../../util/teacherAccessControl";

// --- Reusable Confirmation Modal ---
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-border"
        >
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">{title}</h3>
            </div>
            <p className="text-muted-foreground mb-6">{message}</p>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-foreground hover:bg-muted transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-destructive hover:opacity-90 text-destructive-foreground shadow-sm shadow-destructive/20 hover:-translate-y-0.5 transition-all font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- Main Component ---
const BatchDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { batchName } = useParams();

  const id = location.state?.batchId;
  const fallbackName =
    location.state?.batchName ||
    (batchName ? batchName.replace(/-/g, " ") : "Batch Details");

  const [isAdding, setIsAdding] = useState(false);

  const {
    currentBatch,
    fetchBatchById,
    addStudentToBatch,
    removeStudentFromBatch,
    deleteBatch,
    isLoading,
  } = useBatchStore();
  const { user: authUser } = useAuthStore();
  const userRole = useAuthStore((state) => state.userRole);

  const { students, getStudents } = useUserStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    getStudents();
  }, [getStudents]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStudents =
    students?.filter((student) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        student.name?.toLowerCase().includes(searchLower) ||
        student.email?.toLowerCase().includes(searchLower)
      );
    }) || [];

  const handleSelectStudent = (student) => {
    setStudentEmail(student.email);
    setSearchQuery(`${student.name} (${student.email})`);
    setIsDropdownOpen(false);
  };

  const [studentEmail, setStudentEmail] = useState("");
  const [mainClassId, setMainClassId] = useState("");

  // Modal States
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  useEffect(() => {
    if (id) {
      fetchBatchById(id);
    } else {
      navigate("/batches");
    }
  }, [id, fetchBatchById, navigate]);

  useEffect(() => {
    if (currentBatch && id) {
      if (userRole === "Teacher") {
        const teacherBatches = authUser?.batches || [];
        const hasAccess = canTeacherAccessBatch(
          id,
          teacherBatches,
          userRole,
          currentBatch.teacherEmail,
          authUser?.email,
        );

        if (!hasAccess) {
          toast.error("You can only view batches assigned to you");
          navigate("/access-denied");
        }
      }
    }
  }, [currentBatch, id, userRole, authUser, navigate]);

  const handleAddStudent = async (e) => {
    e.preventDefault();

    // Teachers cannot add students to batches
    if (userRole === "Teacher") {
      toast.error("Teachers cannot modify batch students");
      return;
    }

    if (!studentEmail || !mainClassId) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsAdding(true);
    try {
      await addStudentToBatch(id, { studentEmail, mainClassId });
      setStudentEmail("");
      setMainClassId("");
      setSearchQuery("");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteBatch = async () => {
    // Teachers cannot delete batches
    if (userRole === "Teacher") {
      toast.error("Teachers cannot delete batches");
      return;
    }
    await deleteBatch(id, navigate);
  };

  // UPDATED handleRemoveStudent Function
  const handleRemoveStudent = async () => {
    if (studentToDelete) {
      // Find the student's assigned mainClassId from the batch's relationships
      const pair = currentBatch.mainClassStudentPairs?.find(
        (p) => p.student?._id === studentToDelete._id,
      );
      const studentMainClassId = pair?.mainClass?._id;

      if (!studentMainClassId) {
        toast.error(
          "Could not find the main class associated with this student.",
        );
        setStudentToDelete(null);
        return;
      }

      await removeStudentFromBatch(id, studentToDelete._id, studentMainClassId);
      setStudentToDelete(null);
    }
  };

  if (!id || (isLoading && !isAdding) || !currentBatch) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-muted-foreground gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-lg capitalize">Loading {fallbackName}...</p>
      </div>
    );
  }

  const isStaff = authUser?.role === "Admin" || authUser?.role === "Teacher";

  const getStudentClassInfo = (studentId) => {
    const pair = currentBatch.mainClassStudentPairs?.find(
      (p) => p.student?._id === studentId,
    );
    return pair ? pair.mainClass.name : "Unassigned";
  };

  const displayBatchName = currentBatch?.name?.trim() || fallbackName;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 py-8 max-w-6xl min-h-screen bg-background text-foreground transition-colors duration-300"
    >
      {/* Batch Delete Modal */}
      <ConfirmModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onConfirm={handleDeleteBatch}
        title="Delete Batch"
        message={`Are you sure you want to delete "${displayBatchName}"? This action cannot be undone and will remove all associated student records from this batch.`}
      />

      {/* Student Remove Modal */}
      <ConfirmModal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleRemoveStudent}
        title="Remove Student"
        message={`Are you sure you want to remove ${studentToDelete?.name} from this batch?`}
        confirmText="Remove"
      />

      {/* Header Card */}
      <BackButton details={`Detailed view of the batch`} />
      <div className="p-8 rounded-3xl bg-card border border-border shadow-sm mb-8 mt-6 transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-extrabold text-foreground capitalize">
                {displayBatchName}
              </h1>
            </div>
            <p className="text-lg text-muted-foreground font-medium flex items-center gap-2">
              <Users className="w-5 h-5 opacity-70" />
              Instructor: {currentBatch.teacherEmail}
            </p>
          </div>

          {authUser?.role === "Admin" && (
            <div className="flex gap-3">
              <button
                onClick={() =>
                  navigate(`/batches/edit`, { state: { batchId: id } })
                }
                className="px-5 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors border border-border"
              >
                Edit
              </button>
              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold transition-colors flex items-center gap-2 border border-destructive/20"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Day
            </p>
            <p className="font-semibold text-foreground text-lg">
              {currentBatch.weekday}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <Clock className="w-4 h-4" /> Time
            </p>
            <p className="font-semibold text-foreground text-lg">
              {currentBatch.startTime} - {currentBatch.endTime}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <BookOpen className="w-4 h-4" /> Total Classes
            </p>
            <p className="font-semibold text-foreground text-lg">
              {currentBatch.mainClasses?.length || 0}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <Users className="w-4 h-4" /> Total Students
            </p>
            <p className="font-semibold text-foreground text-lg">
              {currentBatch.students?.length || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Classes & Students */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Classes Section */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Associated Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentBatch.mainClasses?.map((cls) => (
                <div
                  key={cls._id}
                  onClick={() =>
                    navigate(`/courses/${generateSlug(cls.name)}`, {
                      state: {
                        courseId: cls._id,
                        courseName: cls.name,
                      },
                    })
                  }
                  className="p-5 bg-card border border-border hover:border-primary/50 transition-colors rounded-2xl shadow-sm cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-foreground">{cls.name}</h3>
                    <span className="text-sm font-bold text-success bg-success/10 px-2 py-1 rounded-lg">
                      ₹{cls.fees}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Instructor: {cls.teacherName || "TBA"}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    {new Date(cls.startDate).toLocaleDateString()} -{" "}
                    {new Date(cls.endDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Enrolled Students List */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Enrolled Students
            </h2>
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              {currentBatch.students?.length > 0 ? (
                <ul className="divide-y divide-border">
                  {currentBatch.students.map((student) => (
                    <li
                      key={student._id}
                      className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-inner">
                          {student.name?.charAt(0).toUpperCase() ||
                            student.email?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">
                            {student.name || "Student"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {student.email} • {student.phone}
                          </p>
                          <p className="text-xs font-medium text-primary mt-1">
                            Class: {getStudentClassInfo(student._id)}
                          </p>
                        </div>
                      </div>

                      {isStaff && (
                        <button
                          onClick={() => setStudentToDelete(student)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                          title="Remove Student"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-10 text-center flex flex-col items-center">
                  <Users className="w-12 h-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground font-medium">
                    No students enrolled yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Admin/Teacher Control Panel */}
        {isStaff && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-card border border-border shadow-sm sticky top-8">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  +
                </span>
                Add New Student
              </h3>

              <form onSubmit={handleAddStudent} className="space-y-5">
                {/* Searchable Student Dropdown */}
                <div ref={dropdownRef} className="relative">
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Search & Select Student
                  </label>

                  <div className="relative">
                    {/* Input Field */}
                    <div className="relative flex items-center">
                      <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setStudentEmail("");
                          setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        className="w-full pl-11 pr-10 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                        placeholder="Search by name or email..."
                      />
                      {/* Dynamic Avatar for Selected Student */}
                      {studentEmail && (
                        <div className="absolute right-3 w-7 h-7 rounded-full bg-muted overflow-hidden flex items-center justify-center border border-border">
                          {students?.find((u) => u.email === studentEmail)
                            ?.profilePicture ? (
                            <img
                              src={
                                students.find((u) => u.email === studentEmail)
                                  .profilePicture
                              }
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Check className="w-4 h-4 text-success" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dropdown Results List */}
                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-card rounded-xl border border-border shadow-2xl max-h-60 overflow-y-auto">
                        {filteredStudents.length > 0 ? (
                          <ul className="py-2">
                            {filteredStudents.map((student) => (
                              <li
                                key={student._id}
                                onClick={() => handleSelectStudent(student)}
                                className={`px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                                  studentEmail === student.email
                                    ? "bg-primary/10"
                                    : ""
                                }`}
                              >
                                {/* Student Avatar in List */}
                                <div className="w-8 h-8 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs overflow-hidden">
                                  {student.profilePicture ? (
                                    <img
                                      src={student.profilePicture}
                                      alt="pic"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    (
                                      student.name?.charAt(0) ||
                                      student.email?.charAt(0)
                                    ).toUpperCase()
                                  )}
                                </div>
                                <div className="overflow-hidden">
                                  <p className="font-semibold text-sm text-foreground truncate">
                                    {student.name || "Unknown Name"}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {student.email}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No students found.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Enroll Course (Main Class) */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">
                    Enroll in Course
                  </label>
                  <select
                    required
                    value={mainClassId}
                    onChange={(e) => setMainClassId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      Select a Class...
                    </option>
                    {currentBatch.mainClasses?.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} (₹{cls.fees})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!studentEmail || !mainClassId || isAdding}
                  className="w-full py-3 bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground font-bold rounded-xl transition-all shadow-md hover:-translate-y-0.5 mt-4 flex items-center justify-center gap-2"
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    "Enroll Student"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BatchDetails;
