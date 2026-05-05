import { create } from "zustand";
import { api } from "../api/api";

const useUserStore = create((set, get) => ({
  isLoading: false,
  error: null,
  success: false,
  students: [],
  teachers: [],
  studentProgress: {}, // Store progress data { studentId_mainClassId: { batchcompletion, examcompletion, certificateIssued } }

  getStudents: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/user/students");
      set({
        students: response.data?.data || response.data || [],
        isLoading: false,
      });
      return response.data;
    } catch (err) {}
  },

  getTeachers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/user/teachers");
      set({
        teachers: response.data?.data || response.data || [],
        isLoading: false,
      });
      return response.data;
    } catch (err) {}
  },

  // Fetch progress data for a specific student from a mainClass
  getStudentProgress: async (studentId, mainClassId) => {
    try {
      const response = await api.get(
        `/attendance/summary/mainclass/${mainClassId}/student/${studentId}`,
      );
      const data = response.data?.data || {};

      const key = `${studentId}_${mainClassId}`;
      set((state) => ({
        studentProgress: {
          ...state.studentProgress,
          [key]: {
            batchcompletion: data.batchcompletion || false,
            examcompletion: data.examcompletion || false,
            certificateIssued: data.certificateIssued || false,
          },
        },
      }));

      return data;
    } catch (err) {
      console.error("Error fetching student progress:", err);
      return null;
    }
  },

  // Update progress for a student in a mainClass
  updateStudentProgress: async (studentId, mainClassId, progressData) => {
    try {
      const response = await api.patch(
        `/attendance/update-progress/${studentId}/${mainClassId}`,
        progressData,
      );

      const key = `${studentId}_${mainClassId}`;
      set((state) => ({
        studentProgress: {
          ...state.studentProgress,
          [key]: {
            batchcompletion:
              progressData.batchcompletion !== undefined
                ? progressData.batchcompletion
                : state.studentProgress[key]?.batchcompletion || false,
            examcompletion:
              progressData.examcompletion !== undefined
                ? progressData.examcompletion
                : state.studentProgress[key]?.examcompletion || false,
            certificateIssued:
              progressData.certificateIssued !== undefined
                ? progressData.certificateIssued
                : state.studentProgress[key]?.certificateIssued || false,
          },
        },
      }));

      return response.data;
    } catch (err) {
      console.error("Error updating student progress:", err);
      set({ error: err.response?.data?.message || "Error updating progress" });
      return null;
    }
  },

  addUser: async (formData) => {
    set({ isLoading: true, error: null, success: false });
    try {
      const response = await api.post("/user/add", formData);
      set({ isLoading: false, success: true });
      return response.data;
    } catch (err) {
      set({
        isLoading: false,
        error: err.response?.data?.message || "Something went wrong",
      });
      throw err;
    }
  },

  updateUser: async (userId, formData) => {
    set({ isLoading: true, error: null, success: false });

    try {
      const response = await api.patch(`/user/edit/${userId}`, formData);

      set({ isLoading: false, success: true });
      setTimeout(() => set({ success: false }), 3000);

      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Something went wrong while updating the profile";
      set({ isLoading: false, error: errorMessage });

      setTimeout(() => set({ error: null }), 4000);
      throw err;
    }
  },

  resetStatus: () => set({ success: false, error: null }),
}));

export default useUserStore;
