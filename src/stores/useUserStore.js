import { create } from "zustand";
import { api } from "../api/api";

const useUserStore = create((set, get) => ({
  isLoading: false,
  error: null,
  success: false,
  students: [],
  teachers: [],

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
