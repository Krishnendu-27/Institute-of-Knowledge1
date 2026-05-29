import React, { useEffect, useMemo, useState } from "react";
import { Calendar, Loader2, Search, Users } from "lucide-react";
import { motion } from "framer-motion";
import useAttendanceStore from "../stores/useAttendanceStore";
import useAuthStore from "../stores/useAuthStore";
import { api } from "../api/api";
import BackButton from "../components/UI/Button";

const getMonthRange = (monthValue) => {
  const [year, month] = monthValue.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const startDate = start.toISOString().split("T")[0];
  const endDate = end.toISOString().split("T")[0];
  return { startDate, endDate };
};

const AttendanceStatus = () => {
  const userId = useAuthStore((state) => state.id);
  const userRole = useAuthStore((state) => state.userRole);
  const loadUser = useAuthStore((state) => state.loadUser);

  const {
    batches,
    getAllBatches,
    getTeacherBatches,
    isLoading: isBatchLoading,
  } = useAttendanceStore();

  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [students, setStudents] = useState([]);
  const [attendanceCounts, setAttendanceCounts] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!userRole || !userId) return;
    if (userRole === "Admin") {
      getAllBatches();
    } else {
      getTeacherBatches(userId);
    }
  }, [userRole, userId, getAllBatches, getTeacherBatches]);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedBatchId || !selectedMonth) return;
      setIsLoading(true);
      setError("");

      try {
        const batchResponse = await api.get(`/batch/show/${selectedBatchId}`);
        const batchData = batchResponse.data || batchResponse.data?.data;
        const pairs = batchData?.mainClassStudentPairs || [];

        const studentMap = new Map();
        pairs.forEach((pair) => {
          if (pair?.student?._id) {
            studentMap.set(pair.student._id, pair.student);
          }
        });

        const batchStudents =
          studentMap.size > 0
            ? Array.from(studentMap.values())
            : batchData?.students || [];

        const { startDate, endDate } = getMonthRange(selectedMonth);
        const attendanceResponse = await api.get(
          `/attendence/by-date-range/${selectedBatchId}`,
          {
            params: { startDate, endDate },
          },
        );

        const records =
          attendanceResponse.data?.data || attendanceResponse.data || [];

        const counts = {};
        batchStudents.forEach((student) => {
          const studentId = student._id || student.id || student.studentId;
          if (studentId) {
            counts[studentId] = { present: 0, absent: 0 };
          }
        });

        records.forEach((record) => {
          const presentList = record?.Present_students || [];
          const absentList = record?.Absent_students || [];

          presentList.forEach((student) => {
            const studentId = student?._id || student?.id;
            if (counts[studentId]) {
              counts[studentId].present += 1;
            }
          });

          absentList.forEach((student) => {
            const studentId = student?._id || student?.id;
            if (counts[studentId]) {
              counts[studentId].absent += 1;
            }
          });
        });

        setStudents(batchStudents);
        setAttendanceCounts(counts);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load attendance");
        setStudents([]);
        setAttendanceCounts({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedBatchId, selectedMonth]);

  const filteredStudents = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return students.filter((student) =>
      [student.name, student.email, student.phone]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(query)),
    );
  }, [students, searchTerm]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-background p-6 md:p-8 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <BackButton details="Monitor attendance summaries by batch and month." />

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Batch
              </label>
              <select
                value={selectedBatchId}
                onChange={(event) => setSelectedBatchId(event.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                disabled={isBatchLoading}
              >
                <option value="">Select a batch</option>
                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name} ({batch.startTime} - {batch.endTime})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Month
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Search Students
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name, email, phone"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mr-3" /> Loading
            attendance...
          </div>
        ) : selectedBatchId ? (
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Attendance Summary
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                      #
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                      Student ID
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                      Present
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                      Absent
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredStudents.map((student, index) => {
                    const studentId = student._id || student.id || student.studentId;
                    const counts = attendanceCounts[studentId] || {
                      present: 0,
                      absent: 0,
                    };
                    const total = counts.present + counts.absent;

                    return (
                      <tr key={studentId || index}>
                        <td className="px-4 py-3 text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {student.name || "Unnamed"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {student.adhar || studentId || "-"}
                        </td>
                        <td className="px-4 py-3 text-success font-semibold">
                          {counts.present}
                        </td>
                        <td className="px-4 py-3 text-destructive font-semibold">
                          {counts.absent}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {total}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredStudents.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No students matched this search.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl shadow-sm p-8 text-center text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-3 text-muted-foreground/60" />
            Select a batch and month to view attendance.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AttendanceStatus;
