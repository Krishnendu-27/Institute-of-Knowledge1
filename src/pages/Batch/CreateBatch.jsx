import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  Check,
  X,
  BookOpen,
  User,
  Calendar,
  Clock,
  Users,
  GraduationCap,
  Briefcase,
  ArrowLeft,
} from "lucide-react";
import useBatchStore from "../../stores/useBatchStore";
import useUserStore from "../../stores/useUserStore";
import useClassStore from "../../stores/useClassStore";
import toast from "react-hot-toast";
import BackButton from "../../components/UI/Button";
import { getReadableError } from "../../util/Error/Error";

const CreateBatch = () => {
  const navigate = useNavigate();
  const { createBatch, isLoading, error } = useBatchStore();

  // Store connections
  const { teachers, students, getTeachers, getStudents } = useUserStore();
  const { allClass: mainClasses = [], getClasses } = useClassStore();

  // Core Form State
  const [name, setName] = useState("");
  const [weekday, setWeekday] = useState("Monday");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Relational Data State
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  // UI / Search State
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQueries, setSearchQueries] = useState({
    teacher: "",
    class: "",
    student: "",
  });

  // Isolated Refs for accurate click-outside detection
  const teacherRef = useRef(null);
  const classRef = useRef(null);
  const studentRef = useRef(null);

  useEffect(() => {
    getTeachers();
    getStudents();
    getClasses();
  }, [getTeachers, getStudents, getClasses]);

  // Handle clicking outside to close specific dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activeDropdown === "teacher" &&
        teacherRef.current &&
        !teacherRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
      if (
        activeDropdown === "class" &&
        classRef.current &&
        !classRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
      if (
        activeDropdown === "student" &&
        studentRef.current &&
        !studentRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !selectedTeacher ||
      selectedClasses.length === 0 ||
      selectedStudents.length === 0
    ) {
      toast.error(
        "Please select a teacher, at least one class, and at least one student.",
      );
      return;
    }

    const mainClassStudentPairs = [];

    selectedClasses.forEach((cls) => {
      selectedStudents.forEach((std) => {
        mainClassStudentPairs.push({
          mainClass: cls._id,
          student: std._id,
        });
      });
    });

    const payload = {
      name,
      weekday,
      startTime,
      endTime,
      teacherEmail: selectedTeacher.email,
      mainClasses: selectedClasses.map((c) => c._id),
      students: selectedStudents.map((s) => s._id),
      mainClassStudentPairs,
    };

    await createBatch(payload, navigate);
  };

  // --- Helper Components & Functions ---

  const getInitials = (nameStr) =>
    nameStr ? nameStr.charAt(0).toUpperCase() : "U";

  const Avatar = ({
    src,
    name,
    icon: Icon = User,
    bgColor = "from-indigo-500 to-purple-500",
  }) => (
    <div
      className={`w-8 h-8 rounded-full bg-gradient-to-tr ${bgColor} flex items-center justify-center text-white font-bold shrink-0 overflow-hidden shadow-inner`}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : name ? (
        <span className="text-xs">{getInitials(name)}</span>
      ) : (
        <Icon size={14} />
      )}
    </div>
  );

  const handleSearchChange = (field, value) => {
    setSearchQueries((prev) => ({ ...prev, [field]: value }));
    setActiveDropdown(field); // Auto-open dropdown when typing
  };

  // Derived filtered lists (excludes already selected items)
  const availableTeachers = teachers?.filter(
    (t) => t._id !== selectedTeacher?._id,
  );
  const availableClasses = mainClasses?.filter(
    (c) => !selectedClasses.some((sc) => sc._id === c._id),
  );
  const availableStudents = students?.filter(
    (s) => !selectedStudents.some((ss) => ss._id === s._id),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl"
    >
      <div className="p-5 sm:p-8 rounded-3xl bg-white/80 dark:bg-card/80 backdrop-blur-2xl border border-gray-200 dark:border-border shadow-2xl">
        <BackButton
          details={`Set up core details, schedule, and enroll members to provision a
              new learning batch.`}
        />
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* SECTION 1: Core Details */}
          <div className="bg-gray-50/50 dark:bg-muted/30 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-border/50 space-y-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-card-foreground flex items-center gap-2 mb-4">
              <Briefcase size={20} className="text-indigo-500" />
              Core Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Batch Name */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Batch Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-border bg-white dark:bg-card text-gray-900 dark:text-card-foreground focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                  placeholder="e.g. Morning Physics A"
                />
              </div>

              {/* Teacher Assignment */}
              <div className="md:col-span-1 relative" ref={teacherRef}>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Assign Lead Teacher
                </label>
                <div
                  className="relative flex items-center w-full min-h-[50px] px-4 py-2 rounded-xl border border-gray-300 dark:border-border bg-white dark:bg-card focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-sm cursor-text"
                  onClick={() => setActiveDropdown("teacher")}
                >
                  {selectedTeacher ? (
                    <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1.5 rounded-lg w-full">
                      <Avatar
                        src={selectedTeacher.profilePic}
                        name={selectedTeacher.name || selectedTeacher.email}
                      />
                      <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200 truncate flex-1">
                        {selectedTeacher.name || "Selected Teacher"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTeacher(null);
                        }}
                        className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 ml-1 p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Search
                        size={18}
                        className="text-gray-400 mr-2 shrink-0"
                      />
                      <input
                        type="text"
                        placeholder="Search teacher by name or email..."
                        value={searchQueries.teacher}
                        onChange={(e) =>
                          handleSearchChange("teacher", e.target.value)
                        }
                        className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-card-foreground text-sm w-full truncate"
                      />
                    </>
                  )}
                  {!selectedTeacher && (
                    <ChevronDown
                      className="absolute right-4 text-gray-400 pointer-events-none"
                      size={18}
                    />
                  )}
                </div>

                <AnimatePresence>
                  {activeDropdown === "teacher" && !selectedTeacher && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute z-50 w-full mt-2 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
                    >
                      {availableTeachers
                        ?.filter(
                          (t) =>
                            t.name
                              ?.toLowerCase()
                              .includes(searchQueries.teacher.toLowerCase()) ||
                            t.email
                              ?.toLowerCase()
                              .includes(searchQueries.teacher.toLowerCase()),
                        )
                        .map((teacher) => (
                          <div
                            key={teacher._id || teacher.email}
                            onClick={() => {
                              setSelectedTeacher(teacher);
                              setSearchQueries((prev) => ({
                                ...prev,
                                teacher: "",
                              }));
                              setActiveDropdown(null);
                            }}
                            className="px-4 py-3 hover:bg-indigo-50 dark:hover:bg-muted cursor-pointer flex items-center gap-3 transition-colors"
                          >
                            <Avatar
                              src={teacher.profilePic}
                              name={teacher.name || teacher.email}
                            />
                            <div className="flex-1 overflow-hidden">
                              <p className="text-sm font-medium text-gray-900 dark:text-card-foreground truncate">
                                {teacher.name || "Unknown Name"}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-muted-foreground truncate">
                                {teacher.email}
                              </p>
                            </div>
                          </div>
                        ))}
                      {availableTeachers?.length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-muted-foreground text-center">
                          No available teachers found.
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* SECTION 2: Enrollments */}
          <div className="bg-gray-50/50 dark:bg-muted/30 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-border/50 space-y-8">
            <h2 className="text-lg font-bold text-gray-800 dark:text-card-foreground flex items-center gap-2 mb-2">
              <Users size={20} className="text-blue-500" />
              Courses and Students
            </h2>

            {/* MAIN CLASSES (Multi Select) */}
            <div className="relative" ref={classRef}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select Courses
              </label>

              <div
                className="w-full min-h-[52px] p-2 rounded-xl border border-gray-300 dark:border-border bg-white dark:bg-card focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-sm flex flex-wrap gap-2 items-center cursor-text"
                onClick={() => setActiveDropdown("class")}
              >
                <AnimatePresence>
                  {selectedClasses.map((cls) => (
                    <motion.span
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      key={cls._id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-medium"
                    >
                      <BookOpen size={14} />
                      {cls.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClasses((prev) =>
                            prev.filter((i) => i._id !== cls._id),
                          );
                        }}
                        className="hover:text-blue-900 dark:hover:text-blue-100 p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>

                <div className="flex-1 min-w-[150px] flex items-center ml-2">
                  <Search size={16} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder={
                      selectedClasses.length === 0
                        ? "Search and map classes..."
                        : "Add another class..."
                    }
                    value={searchQueries.class}
                    onChange={(e) =>
                      handleSearchChange("class", e.target.value)
                    }
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-card-foreground text-sm truncate"
                  />
                </div>
              </div>

              <AnimatePresence>
                {activeDropdown === "class" && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute z-50 w-full mt-2 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
                  >
                    {availableClasses
                      ?.filter((c) =>
                        c.name
                          ?.toLowerCase()
                          .includes(searchQueries.class.toLowerCase()),
                      )
                      .map((cls) => (
                        <div
                          key={cls._id}
                          onClick={() => {
                            setSelectedClasses([...selectedClasses, cls]);
                            setSearchQueries((prev) => ({
                              ...prev,
                              class: "",
                            }));
                            setActiveDropdown(null);
                          }}
                          className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-muted cursor-pointer flex items-center gap-3 transition-colors"
                        >
                          <Avatar
                            icon={BookOpen}
                            bgColor="from-blue-400 to-cyan-500"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-card-foreground">
                              {cls.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-muted-foreground">
                              {cls.code}
                            </p>
                          </div>
                        </div>
                      ))}
                    {availableClasses?.length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-muted-foreground text-center">
                        All classes selected or none found.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STUDENTS (Multi Select) */}
            <div className="relative" ref={studentRef}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select Enroll Students
              </label>

              <div
                className="w-full min-h-[52px] p-2 rounded-xl border border-gray-300 dark:border-border bg-white dark:bg-card focus-within:ring-2 focus-within:ring-indigo-500 transition-all shadow-sm flex flex-wrap gap-2 items-center cursor-text"
                onClick={() => setActiveDropdown("student")}
              >
                <AnimatePresence>
                  {selectedStudents.map((std) => (
                    <motion.span
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      key={std._id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-100 dark:bg-muted text-gray-800 dark:text-card-foreground text-sm font-medium border border-gray-200 dark:border-border shadow-sm"
                    >
                      <img
                        src={
                          std.profilePic ||
                          `https://ui-avatars.com/api/?name=${std.name || "S"}&background=random`
                        }
                        alt={std.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      {std.name || std.email.split("@")[0]}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudents((prev) =>
                            prev.filter((i) => i._id !== std._id),
                          );
                        }}
                        className="hover:text-red-500 ml-1 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>

                <div className="flex-1 min-w-[150px] flex items-center ml-2">
                  <Search size={16} className="text-gray-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder={
                      selectedStudents.length === 0
                        ? "Search students..."
                        : "Add another student..."
                    }
                    value={searchQueries.student}
                    onChange={(e) =>
                      handleSearchChange("student", e.target.value)
                    }
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-card-foreground text-sm truncate"
                  />
                </div>
              </div>

              <AnimatePresence>
                {activeDropdown === "student" && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute z-50 w-full mt-2 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
                  >
                    {availableStudents
                      ?.filter(
                        (s) =>
                          s.name
                            ?.toLowerCase()
                            .includes(searchQueries.student.toLowerCase()) ||
                          s.email
                            ?.toLowerCase()
                            .includes(searchQueries.student.toLowerCase()),
                      )
                      .map((student) => (
                        <div
                          key={student._id}
                          onClick={() => {
                            setSelectedStudents([...selectedStudents, student]);
                            setSearchQueries((prev) => ({
                              ...prev,
                              student: "",
                            }));
                            setActiveDropdown(null);
                          }}
                          className="px-4 py-3 hover:bg-indigo-50 dark:hover:bg-muted cursor-pointer flex items-center gap-3 transition-colors"
                        >
                          <Avatar
                            src={student.profilePic}
                            name={student.name || student.email}
                            icon={GraduationCap}
                          />
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-gray-900 dark:text-card-foreground truncate">
                              {student.name || "Unknown Student"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-muted-foreground truncate">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    {availableStudents?.length === 0 && (
                      <div className="px-4 py-3 text-sm text-gray-500 dark:text-muted-foreground text-center">
                        All students enrolled or none found.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* SECTION 3: Schedule */}
          <div className="bg-gray-50/50 dark:bg-muted/30 p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-border/50 space-y-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-card-foreground flex items-center gap-2 mb-4">
              <Calendar size={20} className="text-purple-500" />
              Schedule Timing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Weekday
                </label>
                <div className="relative">
                  <select
                    value={weekday}
                    onChange={(e) => setWeekday(e.target.value)}
                    className="w-full px-4 py-3 appearance-none rounded-xl border border-gray-300 dark:border-border bg-white dark:bg-card text-gray-900 dark:text-card-foreground focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                  >
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-3.5 text-gray-400 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" /> Start Time
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-border bg-white dark:bg-card text-gray-900 dark:text-card-foreground focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" /> End Time
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-border bg-white dark:bg-card text-gray-900 dark:text-card-foreground focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 sm:pt-6 border-t border-gray-200 dark:border-border">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-primary to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-indigo-400 disabled:to-purple-400 text-white text-lg font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 active:scale-[0.99] flex justify-center items-center gap-2"
            >
              {isLoading ? (
                "Provisioning Batch..."
              ) : (
                <>
                  <Check size={22} />
                  Finalize & Create Batch
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CreateBatch;
