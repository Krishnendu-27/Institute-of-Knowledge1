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
import useTradeStore from "../../stores/useTradeStore";

const CreateBatch = () => {
  const navigate = useNavigate();
  const { createBatch, isLoading, error } = useBatchStore();
  const trades = useTradeStore((state) => state.trades);

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
  const [selectedTradeId, setSelectedTradeId] = useState("");

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

    await createBatch(payload, navigate, selectedTradeId);
  };

  // --- Helper Components & Functions ---

  const getInitials = (nameStr) =>
    nameStr ? nameStr.charAt(0).toUpperCase() : "U";

  const Avatar = ({
    src,
    name,
    icon: Icon = User,
    bgColor = "bg-primary",
    textColor = "text-primary-foreground",
  }) => (
    <div
      className={`w-8 h-8 rounded-full ${bgColor} ${textColor} flex items-center justify-center font-bold shrink-0 overflow-hidden shadow-inner`}
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
      <div className="p-5 sm:p-8 rounded-3xl bg-card border border-border shadow-2xl transition-colors duration-300">
        <BackButton
          details={`Set up core details, schedule, and enroll members to provision a
              new learning batch.`}
        />
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 mt-6">
          {/* SECTION 1: Core Details */}
          <div className="bg-muted/30 p-5 sm:p-6 rounded-2xl border border-border/50 space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              <Briefcase size={20} className="text-primary" />
              Core Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Batch Name */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Batch Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm placeholder:text-muted-foreground"
                  placeholder="e.g. Morning Physics A"
                />
              </div>

              {/* Teacher Assignment */}
              <div className="md:col-span-1 relative" ref={teacherRef}>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Assign Lead Teacher
                </label>
                <div
                  className="relative flex items-center w-full min-h-[50px] px-4 py-2 rounded-xl border border-border bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm cursor-text"
                  onClick={() => setActiveDropdown("teacher")}
                >
                  {selectedTeacher ? (
                    <div className="flex items-center gap-2 bg-primary/10 px-2 py-1.5 rounded-lg w-full">
                      <Avatar
                        src={selectedTeacher.profilePic}
                        name={selectedTeacher.name || selectedTeacher.email}
                      />
                      <span className="text-sm font-medium text-primary truncate flex-1">
                        {selectedTeacher.name || "Selected Teacher"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTeacher(null);
                        }}
                        className="text-primary/70 hover:text-primary ml-1 p-1 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Search
                        size={18}
                        className="text-muted-foreground mr-2 shrink-0"
                      />
                      <input
                        type="text"
                        placeholder="Search teacher by name or email..."
                        value={searchQueries.teacher}
                        onChange={(e) =>
                          handleSearchChange("teacher", e.target.value)
                        }
                        className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm w-full truncate"
                      />
                    </>
                  )}
                  {!selectedTeacher && (
                    <ChevronDown
                      className="absolute right-4 text-muted-foreground pointer-events-none"
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
                      className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
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
                            className="px-4 py-3 hover:bg-muted/50 cursor-pointer flex items-center gap-3 transition-colors border-b last:border-0 border-border/50"
                          >
                            <Avatar
                              src={teacher.profilePic}
                              name={teacher.name || teacher.email}
                            />
                            <div className="flex-1 overflow-hidden">
                              <p className="text-sm font-medium text-foreground truncate">
                                {teacher.name || "Unknown Name"}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {teacher.email}
                              </p>
                            </div>
                          </div>
                        ))}
                      {availableTeachers?.length === 0 && (
                        <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                          No available teachers found.
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Trade Selection */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Trade
                </label>
                <div className="relative">
                  <select
                    value={selectedTradeId}
                    onChange={(event) =>
                      setSelectedTradeId(event.target.value)
                    }
                    className="w-full px-4 py-3 appearance-none rounded-xl border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                  >
                    <option value="">Unassigned</option>
                    {trades.map((trade) => (
                      <option key={trade.id} value={trade.id}>
                        {trade.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-3.5 text-muted-foreground pointer-events-none"
                    size={18}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* SECTION 3: Schedule */}
          <div className="bg-muted/30 p-5 sm:p-6 rounded-2xl border border-border/50 space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              <Calendar size={20} className="text-primary" />
              Schedule Timing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Weekday
                </label>
                <div className="relative">
                  <select
                    value={weekday}
                    onChange={(e) => setWeekday(e.target.value)}
                    className="w-full px-4 py-3 appearance-none rounded-xl border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
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
                    className="absolute right-4 top-3.5 text-muted-foreground pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Clock size={14} className="text-muted-foreground" /> Start
                  Time
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Clock size={14} className="text-muted-foreground" /> End Time
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
          {/* SECTION 2: Enrollments */}
          <div className="bg-muted/30 p-5 sm:p-6 rounded-2xl border border-border/50 space-y-8">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-2">
              <Users size={20} className="text-primary" />
              Courses and Students
            </h2>

            {/* MAIN CLASSES (Multi Select) */}
            <div className="relative" ref={classRef}>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Select Courses
              </label>

              <div
                className="w-full min-h-[52px] p-2 rounded-xl border border-border bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm flex flex-wrap gap-2 items-center cursor-text"
                onClick={() => setActiveDropdown("class")}
              >
                <AnimatePresence>
                  {selectedClasses.map((cls, index) => (
                    <motion.span
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      key={cls._id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                    >
                      <BookOpen size={14} />
                      {index + 1}. {cls.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClasses((prev) =>
                            prev.filter((i) => i._id !== cls._id),
                          );
                        }}
                        className="hover:text-primary p-0.5 rounded-full hover:bg-primary/20 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>

                <div className="flex-1 min-w-[150px] flex items-center ml-2">
                  <Search
                    size={16}
                    className="text-muted-foreground mr-2 shrink-0"
                  />
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
                    className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm truncate"
                  />
                </div>
              </div>

              <AnimatePresence>
                {activeDropdown === "class" && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
                  >
                    {availableClasses
                      ?.filter((c) =>
                        c.name
                          ?.toLowerCase()
                          .includes(searchQueries.class.toLowerCase()),
                      )
                      .map((cls, index) => (
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
                          className="px-4 py-3 hover:bg-muted/50 cursor-pointer flex items-center gap-3 transition-colors border-b last:border-0 border-border/50"
                        >
                          <Avatar
                            icon={BookOpen}
                            bgColor="bg-primary/20"
                            textColor="text-primary"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {index + 1}. {cls.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {cls.code}
                            </p>
                          </div>
                        </div>
                      ))}
                    {availableClasses?.length === 0 && (
                      <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                        All classes selected or none found.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STUDENTS (Multi Select) */}
            <div className="relative" ref={studentRef}>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Select Enroll Students
              </label>

              <div
                className="w-full min-h-[52px] p-2 rounded-xl border border-border bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm flex flex-wrap gap-2 items-center cursor-text"
                onClick={() => setActiveDropdown("student")}
              >
                <AnimatePresence>
                  {selectedStudents.map((std, index) => (
                    <motion.span
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      key={std._id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted text-foreground text-sm font-medium border border-border shadow-sm"
                    >
                      <img
                        src={
                          std.profilePic ||
                          `https://ui-avatars.com/api/?name=${std.name || "S"}&background=random`
                        }
                        alt={std.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      {index + 1}. {std.name || std.email.split("@")[0]}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudents((prev) =>
                            prev.filter((i) => i._id !== std._id),
                          );
                        }}
                        className="hover:text-destructive ml-1 p-0.5 rounded-full hover:bg-destructive/10 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>

                <div className="flex-1 min-w-[150px] flex items-center ml-2">
                  <Search
                    size={16}
                    className="text-muted-foreground mr-2 shrink-0"
                  />
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
                    className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm truncate"
                  />
                </div>
              </div>

              <AnimatePresence>
                {activeDropdown === "student" && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
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
                      .map((student, index) => (
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
                          className="px-4 py-3 hover:bg-muted/50 cursor-pointer flex items-center gap-3 transition-colors border-b last:border-0 border-border/50"
                        >
                          <Avatar
                            src={student.profilePic}
                            name={student.name || student.email}
                            icon={GraduationCap}
                          />
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-foreground truncate">
                              {index + 1}. {student.name || "Unknown Student"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    {availableStudents?.length === 0 && (
                      <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                        All students enrolled or none found.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="pt-4 sm:pt-6 border-t border-border">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground text-lg font-bold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.99] flex justify-center items-center gap-2"
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
