import { create } from "zustand";
import { api } from "../api/api";

const useClassStore = create((set) => ({
  isLoading: false,
  error: null,
  success: false,
  // teachers: [],

  // Get all teachers for the dropdown
  // getTeachers: async () => {
  //   set({ isLoading: true, error: null });
  //   try {
  //     const response = await api.get("/user/teachers");
  //     set({
  //       teachers: response.data.teachers || [],
  //       isLoading: false,
  //     });
  //     // console.log(response.data);
  //     return response.data;
  //   } catch (err) {
  //     const errorMessage =
  //       err.response?.data?.message || "Failed to fetch teachers";
  //     set({
  //       isLoading: false,
  //       error: errorMessage,
  //     });
  //     console.error("Get Teachers Error:", err);
  //     throw err;
  //   }
  // },

  // Get all classes
  getClasses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/mainclass");
      set({ isLoading: false });
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch classes";
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error("Get Classes Error:", err);
      throw err;
    }
  },

  createClass: async (classData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/mainclass/create", classData);
      set({ isLoading: false });
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch classes";
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error("Get Classes Error:", err);
      throw err;
    }
  },

  // Add new class with features
  addStudentInClass: async (studentClassData) => {
    set({ isLoading: true, error: null, success: false });
    try {
      const response = await api.post(
        "/mainclass/add-student",
        studentClassData,
      );
      set({ isLoading: false, success: true });
      setTimeout(() => set({ success: false }), 3000);
      // console.log(response.data);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Something went wrong";
      set({
        isLoading: false,
        error: errorMessage,
      });
      setTimeout(() => set({ error: null }), 4000);
      console.error("Add Class Error:", err);
      throw err;
    }
  },

  removeStudentInClass: async (studentClassData) => {
    set({ isLoading: true, error: null, success: false });
    try {
      const response = await api.delete(
        "/mainclass/remove-student",
        studentClassData,
      );
      set({ isLoading: false, success: true });
      setTimeout(() => set({ success: false }), 3000);
      // console.log(response.data);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Something went wrong";
      set({
        isLoading: false,
        error: errorMessage,
      });
      setTimeout(() => set({ error: null }), 4000);
      console.error("Add Class Error:", err);
      throw err;
    }
  },

  // Get single class with features
  getClass: async (classId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/mainclass/show/${classId}`);
      set({ isLoading: false });
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch class";
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error("Get Class Error:", err);
      throw err;
    }
  },

  // Update class
  updateClass: async (classId, classData) => {
    set({ isLoading: true, error: null, success: false });
    try {
      const response = await api.patch(`/class/edit/${classId}`, classData);
      set({ isLoading: false, success: true });
      setTimeout(() => set({ success: false }), 3000);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to update class";
      set({
        isLoading: false,
        error: errorMessage,
      });
      setTimeout(() => set({ error: null }), 4000);
      console.error("Update Class Error:", err);
      throw err;
    }
  },

  // Delete class
  deleteClass: async (classId) => {
    set({ isLoading: true, error: null, success: false });
    try {
      const response = await api.delete(`/class/delete/${classId}`);
      set({ isLoading: false, success: true });
      setTimeout(() => set({ success: false }), 3000);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete class";
      set({
        isLoading: false,
        error: errorMessage,
      });
      setTimeout(() => set({ error: null }), 4000);
      console.error("Delete Class Error:", err);
      throw err;
    }
  },

  // Add feature to class
  addFeature: async (classId, featureData) => {
    set({ isLoading: true, error: null, success: false });
    try {
      const response = await api.post(
        `/class/${classId}/feature/add`,
        featureData,
      );
      set({ isLoading: false, success: true });
      setTimeout(() => set({ success: false }), 3000);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to add feature";
      set({
        isLoading: false,
        error: errorMessage,
      });
      setTimeout(() => set({ error: null }), 4000);
      console.error("Add Feature Error:", err);
      throw err;
    }
  },

  // Remove feature from class
  removeFeature: async (classId, featureId) => {
    set({ isLoading: true, error: null, success: false });
    try {
      const response = await api.delete(
        `/class/${classId}/feature/${featureId}`,
      );
      set({ isLoading: false, success: true });
      setTimeout(() => set({ success: false }), 3000);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to remove feature";
      set({
        isLoading: false,
        error: errorMessage,
      });
      setTimeout(() => set({ error: null }), 4000);
      console.error("Remove Feature Error:", err);
      throw err;
    }
  },

  // Reset status
  resetStatus: () => set({ success: false, error: null }),
}));

export default useClassStore;
