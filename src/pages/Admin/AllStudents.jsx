import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Search, XCircle } from "lucide-react";
import useUserStore from "../../stores/useUserStore";
import useClassStore from "../../stores/useClassStore";
import { getStudentId } from "../../util/getStudentId";

const AllStudents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingKeys, setLoadingKeys] = useState({});

  const students = useUserStore((state) => state.students);
  const getStudents = useUserStore((state) => state.getStudents);
  const getStudentProgress = useUserStore((state) => state.getStudentProgress);
  const updateStudentProgress = useUserStore(
    (state) => state.updateStudentProgress,
  );
  const studentProgress = useUserStore((state) => state.studentProgress);
  const isLoading = useUserStore((state) => state.isLoading);
  const error = useUserStore((state) => state.error);

  const allClass = useClassStore((state) => state.allClass);
  const getClasses = useClassStore((state) => state.getClasses);

  useEffect(() => {
    getStudents();
    getClasses();
  }, [getStudents, getClasses]);

  useEffect(() => {
    if (!students?.length) return;

    const fetchProgress = async () => {
      const tasks = [];
      students.forEach((student) => {
        const classIds = (student.mainClasses || []).map(
          (cls) => cls._id || cls,
        );
        classIds.forEach((classId) => {
          const key = `${student._id}_${classId}`;
          if (!studentProgress[key]) {
            tasks.push(getStudentProgress(student._id, classId));
          }
        });
      });

      await Promise.all(tasks);
    };

    fetchProgress();
  }, [students, studentProgress, getStudentProgress]);

  const classMap = useMemo(() => {
    return new Map((allClass || []).map((cls) => [cls._id, cls.name]));
  }, [allClass]);

  const filteredStudents = Array.isArray(students)
    ? students.filter((student) => {
        const query = searchTerm.toLowerCase();
        return (
          student?.name?.toLowerCase().includes(query) ||
          student?.email?.toLowerCase().includes(query) ||
          student?.phone?.toLowerCase().includes(query)
        );
      })
    : [];

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

  const handleToggle = async (studentId, classId, fieldName, currentValue) => {
    const key = `${studentId}_${classId}_${fieldName}`;
    setLoadingKeys((prev) => ({ ...prev, [key]: true }));

    await updateStudentProgress(studentId, classId, {
      [fieldName]: !currentValue,
    });

    setLoadingKeys((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const renderStatusToggle = (studentId, classId, fieldName, label) => {
    const key = `${studentId}_${classId}`;
    const isChecked = studentProgress[key]?.[fieldName] || false;
    const isUpdating =
      loadingKeys[`${studentId}_${classId}_${fieldName}`] || false;

    return (
      <button
        type="button"
        onClick={() => handleToggle(studentId, classId, fieldName, isChecked)}
        disabled={isUpdating}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors disabled:opacity-60"
      >
        {isUpdating ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : isChecked ? (
          <CheckCircle2 className="w-4 h-4 text-success" />
        ) : (
          <XCircle className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="text-xs font-semibold text-muted-foreground">
          {label}
        </span>
      </button>
    );
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen bg-background p-6 md:p-8 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <p className="text-muted-foreground mt-1">
            Manage and view all students with course completion status.
          </p>
        </div>

        <div className="relative group max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-11 pr-4 py-3.5 bg-background border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-base"
          />
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive flex items-center gap-2 font-medium">
            <span>!</span> {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p>Loading Students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border border-dashed p-12 text-center text-muted-foreground">
            No students found.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                      #
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                      Student Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                      Student ID
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                      Father Name
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                      Village
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                      Mobile Number
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                      Course Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredStudents.map((student, index) => {
                    const studentId = getStudentId(student, students);
                    const classIds = (student.mainClasses || []).map(
                      (cls) => cls._id || cls,
                    );

                    return (
                      <tr key={student._id || index}>
                        <td className="px-4 py-3 text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {student.name || "Unnamed"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-mono">
                          {studentId || "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {student.fatherName || "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {student.address || "-"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {student.phone || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {classIds.length === 0 ? (
                            <div className="text-muted-foreground text-xs">
                              No courses assigned
                            </div>
                          ) : (
                            <div className="min-w-[320px]">
                              <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-muted-foreground mb-2">
                                <span>Course</span>
                                <span className="text-center">Course Complete</span>
                                <span className="text-center">Exam Complete</span>
                                <span className="text-center">
                                  Certificate Complete
                                </span>
                              </div>
                              <div className="space-y-2">
                                {classIds.map((classId) => (
                                  <div
                                    key={classId}
                                    className="grid grid-cols-4 gap-2 items-center"
                                  >
                                    <span className="text-xs font-medium text-foreground">
                                      {classMap.get(classId) || "Unknown"}
                                    </span>
                                    {renderStatusToggle(
                                      student._id,
                                      classId,
                                      "batchcompletion",
                                      "Course",
                                    )}
                                    {renderStatusToggle(
                                      student._id,
                                      classId,
                                      "examcompletion",
                                      "Exam",
                                    )}
                                    {renderStatusToggle(
                                      student._id,
                                      classId,
                                      "certificateIssued",
                                      "Certificate",
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AllStudents;