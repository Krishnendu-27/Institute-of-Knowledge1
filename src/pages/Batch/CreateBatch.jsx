import { useState, useEffect } from "react";
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
  Plus,
  Trash2,
} from "lucide-react";
import useBatchStore from "../../stores/useBatchStore";
import useUserStore from "../../stores/useUserStore";
import useClassStore from "../../stores/useClassStore";
import toast from "react-hot-toast";
import BackButton from "../../components/UI/Button";
import { TRADES } from "../../constants/trades";
import useTradeStore from "../../stores/useTradeStore";

const CreateBatch = () => {
  const navigate = useNavigate();
  const { createBatch, isLoading } = useBatchStore();

  // Store connections
  const { teachers, students, getTeachers, getStudents } = useUserStore();
  const { allClass: mainClasses = [], getClasses } = useClassStore();

  // Core Form State
  const [name, setName] = useState("");
  const [weekday, setWeekday] = useState("Monday");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedTradeId, setSelectedTradeId] = useState("");

  // Relational Data State
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const assignTradeToBatch = useTradeStore((state) => state.assignTradeToBatch);

  // Pairs State: [{ id, mainClass, student }]
  const [pairs, setPairs] = useState([
    { id: Date.now(), mainClass: null, student: null },
  ]);

  // UI / Search State
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQueries, setSearchQueries] = useState({
    teacher: "",
    class: "",
    student: "",
  });

  useEffect(() => {
    getTeachers();
    getStudents();
    getClasses();
  }, [getTeachers, getStudents, getClasses]);

  // Handle clicking outside to close active dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest(".dropdown-container")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  // Handle Teacher Selection
  const handleTeacherSelect = (teacher) => {
    setSelectedTeacher(teacher);
    // Reset pairs when teacher changes to clear invalid classes
    setPairs([{ id: Date.now(), mainClass: null, student: null }]);
    setActiveDropdown(null);
    setSearchQueries({ teacher: "", class: "", student: "" });
  };

  // Pair Management Functions
  const addPair = () => {
    setPairs([...pairs, { id: Date.now(), mainClass: null, student: null }]);
  };

  const removePair = (id) => {
    if (pairs.length > 1) {
      setPairs(pairs.filter((p) => p.id !== id));
    }
  };

  const updatePair = (id, field, value) => {
    setPairs(
      pairs.map((p) => {
        if (p.id === id) {
          const newPair = { ...p, [field]: value };
          // If class changes, reset the student since they must match the new class
          if (field === "mainClass") {
            newPair.student = null;
          }
          return newPair;
        }
        return p;
      }),
    );
    setActiveDropdown(null);
    setSearchQueries({ teacher: "", class: "", student: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validPairs = pairs.filter((p) => p.mainClass && p.student);

    if (!selectedTeacher || validPairs.length === 0) {
      toast.error(
        "Please select a teacher and create at least one valid course-student pair.",
      );
      return;
    }

    // Extract unique classes and students from the valid pairs
    const mainClassesSet = new Set(validPairs.map((p) => p.mainClass._id));
    const studentsSet = new Set(validPairs.map((p) => p.student._id));

    const mainClassStudentPairs = validPairs.map((p) => ({
      mainClass: p.mainClass._id,
      student: p.student._id,
    }));

    const payload = {
      name,
      weekday,
      startTime,
      endTime,
      teacherEmail: selectedTeacher.email,
      teacherName: selectedTeacher.name || selectedTeacher.email,
      teachers: [selectedTeacher._id],
      mainClasses: Array.from(mainClassesSet),
      students: Array.from(studentsSet),
      mainClassStudentPairs,
      tradeId: selectedTradeId || undefined,
    };

    try {
      const createdBatch = await createBatch(
        payload,
        navigate,
        selectedTradeId,
      );
      if (createdBatch?._id && selectedTradeId) {
        assignTradeToBatch(createdBatch._id, selectedTradeId);
      }
    } catch (err) {
      console.error("Failed to create batch:", err);
    }
  };

  // --- Helpers & Derivations ---

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

  const handleSearchChange = (field, value, activeKey) => {
    setSearchQueries((prev) => ({ ...prev, [field]: value }));
    setActiveDropdown(activeKey);
  };

  // Filter classes based on selected teacher's assigned classes
  const getAvailableClasses = () => {
    if (!selectedTeacher || !selectedTeacher.mainClasses) return [];
    return mainClasses.filter((cls) =>
      selectedTeacher.mainClasses.some((tc) => (tc._id || tc) === cls._id),
    );
  };

  // Filter students based on the selected class AND exclude those already selected in other pairs
  const getAvailableStudents = (selectedClassId, currentPairId) => {
    if (!selectedClassId) return [];

    // Get an array of student IDs already selected in OTHER pairs
    const alreadySelectedStudentIds = pairs
      .filter((p) => p.id !== currentPairId && p.student)
      .map((p) => p.student._id);

    return students?.filter((std) => {
      // 1. Check if the student belongs to the selected class
      const belongsToClass = std.mainClasses?.some(
        (sc) => (sc._id || sc) === selectedClassId,
      );
      // 2. Check if the student is NOT already selected in another pair
      const isNotSelectedYet = !alreadySelectedStudentIds.includes(std._id);

      return belongsToClass && isNotSelectedYet;
    });
  };

  const availableClasses = getAvailableClasses();
  const availableTeachers = teachers?.filter(
    (t) => t._id !== selectedTeacher?._id,
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
              <div className="md:col-span-1 relative dropdown-container">
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
                          handleTeacherSelect(null);
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
                          handleSearchChange(
                            "teacher",
                            e.target.value,
                            "teacher",
                          )
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
                            onClick={() => handleTeacherSelect(teacher)}
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
                    onChange={(event) => setSelectedTradeId(event.target.value)}
                    className="w-full px-4 py-3 appearance-none rounded-xl border border-border bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                  >
                    <option value="">Unassigned</option>
                    {TRADES.map((trade) => (
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

          {/* SECTION 2: Schedule */}
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

          {/* SECTION 3: Enrollments (Paired System) */}
          <div
            className={`bg-muted/30 p-5 sm:p-6 rounded-2xl border border-border/50 space-y-6 transition-opacity ${
              !selectedTeacher
                ? "opacity-50 pointer-events-none"
                : "opacity-100"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Users size={20} className="text-primary" />
                Courses and Students
              </h2>
              {!selectedTeacher && (
                <span className="text-xs text-destructive bg-destructive/10 px-3 py-1 rounded-full font-medium">
                  Select a teacher first
                </span>
              )}
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {pairs.map((pair, index) => (
                  <motion.div
                    key={pair.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 items-start"
                  >
                    {/* Course Selection for Pair */}
                    <div className="relative dropdown-container">
                      <div
                        className="relative flex items-center w-full min-h-[50px] px-4 py-2 rounded-xl border border-border bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm cursor-text"
                        onClick={() => setActiveDropdown(`class-${pair.id}`)}
                      >
                        {pair.mainClass ? (
                          <div className="flex items-center gap-2 bg-primary/10 px-2 py-1.5 rounded-lg w-full">
                            <Avatar
                              icon={BookOpen}
                              bgColor="bg-primary/20"
                              textColor="text-primary"
                            />
                            <span className="text-sm font-medium text-primary truncate flex-1">
                              {pair.mainClass.name}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updatePair(pair.id, "mainClass", null);
                              }}
                              className="text-primary/70 hover:text-primary ml-1 p-1 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Search
                              size={16}
                              className="text-muted-foreground mr-2 shrink-0"
                            />
                            <input
                              type="text"
                              placeholder="Select Course..."
                              value={
                                activeDropdown === `class-${pair.id}`
                                  ? searchQueries.class
                                  : ""
                              }
                              onChange={(e) =>
                                handleSearchChange(
                                  "class",
                                  e.target.value,
                                  `class-${pair.id}`,
                                )
                              }
                              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm w-full truncate"
                            />
                          </>
                        )}
                        {!pair.mainClass && (
                          <ChevronDown
                            className="absolute right-4 text-muted-foreground pointer-events-none"
                            size={18}
                          />
                        )}
                      </div>

                      <AnimatePresence>
                        {activeDropdown === `class-${pair.id}` &&
                          !pair.mainClass && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
                            >
                              {availableClasses
                                .filter((c) =>
                                  c.name
                                    ?.toLowerCase()
                                    .includes(
                                      searchQueries.class.toLowerCase(),
                                    ),
                                )
                                .map((cls) => (
                                  <div
                                    key={cls._id}
                                    onClick={() =>
                                      updatePair(pair.id, "mainClass", cls)
                                    }
                                    className="px-4 py-3 hover:bg-muted/50 cursor-pointer flex items-center gap-3 transition-colors border-b last:border-0 border-border/50"
                                  >
                                    <Avatar
                                      icon={BookOpen}
                                      bgColor="bg-primary/20"
                                      textColor="text-primary"
                                    />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-foreground">
                                        {cls.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {cls.code}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              {availableClasses.length === 0 && (
                                <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                                  No matching classes for this teacher.
                                </div>
                              )}
                            </motion.div>
                          )}
                      </AnimatePresence>
                    </div>

                    {/* Student Selection for Pair */}
                    <div className="relative dropdown-container">
                      <div
                        className={`relative flex items-center w-full min-h-[50px] px-4 py-2 rounded-xl border border-border transition-all shadow-sm ${
                          pair.mainClass
                            ? "bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary cursor-text"
                            : "bg-muted/50 cursor-not-allowed"
                        }`}
                        onClick={() => {
                          if (pair.mainClass)
                            setActiveDropdown(`student-${pair.id}`);
                        }}
                      >
                        {pair.student ? (
                          <div className="flex items-center gap-2 bg-muted px-2 py-1.5 rounded-lg w-full border border-border shadow-sm">
                            <img
                              src={
                                pair.student.profilePic ||
                                `https://ui-avatars.com/api/?name=${pair.student.name || "S"}&background=random`
                              }
                              alt={pair.student.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-sm font-medium text-foreground truncate flex-1">
                              {pair.student.name ||
                                pair.student.email.split("@")[0]}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updatePair(pair.id, "student", null);
                              }}
                              className="text-muted-foreground hover:text-destructive ml-1 p-1 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Search
                              size={16}
                              className="text-muted-foreground mr-2 shrink-0"
                            />
                            <input
                              type="text"
                              disabled={!pair.mainClass}
                              placeholder={
                                pair.mainClass
                                  ? "Select Student..."
                                  : "Select Course first"
                              }
                              value={
                                activeDropdown === `student-${pair.id}`
                                  ? searchQueries.student
                                  : ""
                              }
                              onChange={(e) =>
                                handleSearchChange(
                                  "student",
                                  e.target.value,
                                  `student-${pair.id}`,
                                )
                              }
                              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm w-full truncate disabled:cursor-not-allowed"
                            />
                          </>
                        )}
                        {!pair.student && (
                          <ChevronDown
                            className="absolute right-4 text-muted-foreground pointer-events-none"
                            size={18}
                          />
                        )}
                      </div>

                      <AnimatePresence>
                        {activeDropdown === `student-${pair.id}` &&
                          !pair.student &&
                          pair.mainClass && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar"
                            >
                              {getAvailableStudents(pair.mainClass._id, pair.id)
                                .filter(
                                  (s) =>
                                    s.name
                                      ?.toLowerCase()
                                      .includes(
                                        searchQueries.student.toLowerCase(),
                                      ) ||
                                    s.email
                                      ?.toLowerCase()
                                      .includes(
                                        searchQueries.student.toLowerCase(),
                                      ),
                                )
                                .map((student) => (
                                  <div
                                    key={student._id}
                                    onClick={() =>
                                      updatePair(pair.id, "student", student)
                                    }
                                    className="px-4 py-3 hover:bg-muted/50 cursor-pointer flex items-center gap-3 transition-colors border-b last:border-0 border-border/50"
                                  >
                                    <Avatar
                                      src={student.profilePic}
                                      name={student.name || student.email}
                                      icon={GraduationCap}
                                    />
                                    <div className="flex-1 overflow-hidden">
                                      <p className="text-sm font-medium text-foreground truncate">
                                        {student.name || "Unknown Student"}
                                      </p>
                                      <p className="text-xs text-muted-foreground truncate">
                                        {student.email}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              {getAvailableStudents(pair.mainClass._id, pair.id)
                                .length === 0 && (
                                <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                                  No available students (or all are already
                                  assigned).
                                </div>
                              )}
                            </motion.div>
                          )}
                      </AnimatePresence>
                    </div>

                    {/* Remove Pair Button */}
                    <button
                      type="button"
                      onClick={() => removePair(pair.id)}
                      disabled={pairs.length === 1}
                      className="mt-1 sm:mt-0 p-3.5 rounded-xl border border-border bg-background text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button
              type="button"
              onClick={addPair}
              className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-lg hover:bg-primary/10"
            >
              <Plus size={16} /> Add More
            </button>
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