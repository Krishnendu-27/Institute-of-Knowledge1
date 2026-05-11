import { create } from "zustand";
import { api } from "../api/api";

const useAttendanceStore = create((set, get) => ({
  isLoading: false,
  error: null,
  success: false,
  batches: [],
  selectedBatch: null,
  students: [],
  attendance: {},
  attendanceDate: new Date().toISOString().split("T")[0],

  // Fetch all batches (for admin)
  getAllBatches: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/batch");
      const batchesData = response.data?.data || response.data || [];

      set({
        isLoading: false,
        batches: batchesData,
      });
      return batchesData;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch batches";
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error("Get All Batches Error:", err);
      throw err;
    }
  },

  // Fetch teacher batches
  getTeacherBatches: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/user/details/${userId}`);
      const userData = response.data.data;

      // Get batches with full data
      let batchesData = [];
      if (userData.batches && Array.isArray(userData.batches)) {
        batchesData = userData.batches;
      } else if (userData.batches && typeof userData.batches === "object") {
        batchesData = [userData.batches];
      }

      set({
        isLoading: false,
        batches: batchesData,
      });
      return batchesData;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch teacher batches";
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error("Get Batches Error:", err);
      throw err;
    }
  },

  // Select batch and get students
  selectBatch: async (batch) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch full batch data with populated students
      const response = await api.get(`/batch/show/${batch._id}`);
      const fullBatchData = response.data || response.data.data;

      // Get students from mainClassStudentPairs
      let students = [];

      if (
        fullBatchData.mainClassStudentPairs &&
        Array.isArray(fullBatchData.mainClassStudentPairs)
      ) {
        // Extract unique students from pairs
        const studentMap = {};
        fullBatchData.mainClassStudentPairs.forEach((pair) => {
          if (pair.student && pair.student._id) {
            if (!studentMap[pair.student._id]) {
              studentMap[pair.student._id] = pair.student;
            }
          }
        });
        students = Object.values(studentMap);
      }

      // Fallback: use students array if mainClassStudentPairs is empty
      if (
        students.length === 0 &&
        fullBatchData.students &&
        Array.isArray(fullBatchData.students)
      ) {
        students = fullBatchData.students;
      }

      // Initialize attendance object
      const attendance = {};
      students.forEach((student) => {
        attendance[student._id] = true; // Default to present
      });

      set({
        isLoading: false,
        selectedBatch: fullBatchData,
        students: students,
        attendance: attendance,
      });

      return students;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to select batch";
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error("Select Batch Error:", err);
      throw err;
    }
  },

  // Toggle attendance for a student
  toggleAttendance: (studentId) => {
    set((state) => ({
      attendance: {
        ...state.attendance,
        [studentId]: !state.attendance[studentId],
      },
    }));
  },

  // Mark all present
  markAllPresent: () => {
    const { students } = get();
    const newAttendance = {};
    students.forEach((student) => {
      newAttendance[student._id] = true;
    });
    set({ attendance: newAttendance });
  },

  // Mark all absent
  markAllAbsent: () => {
    const { students } = get();
    const newAttendance = {};
    students.forEach((student) => {
      newAttendance[student._id] = false;
    });
    set({ attendance: newAttendance });
  },

  // Submit attendance to backend
  submitAttendance: async () => {
    const { selectedBatch, attendance, attendanceDate, students } = get();

    if (!selectedBatch) {
      throw new Error("No batch selected");
    }

    set({ isLoading: true, error: null });
    try {
      const presentStudentIds = students
        .filter((student) => attendance[student._id])
        .map((student) => student._id);

      const response = await api.post(`/attendence/mark/${selectedBatch._id}`, {
        presentStudentIds,
        date: attendanceDate,
      });

      set({
        isLoading: false,
        success: true,
        attendance: {},
      });

      setTimeout(() => set({ success: false }), 3000);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to submit attendance";
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error("Submit Attendance Error:", err);
      throw err;
    }
  },

  // Update attendance date
  setAttendanceDate: (date) => {
    set({ attendanceDate: date });
  },

  // Reset store
  resetStore: () => {
    set({
      isLoading: false,
      error: null,
      success: false,
      selectedBatch: null,
      students: [],
      attendance: {},
      attendanceDate: new Date().toISOString().split("T")[0],
    });
  },

  // Reset error
  clearError: () => set({ error: null }),
}));

export default useAttendanceStore;
