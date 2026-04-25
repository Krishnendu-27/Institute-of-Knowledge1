import { create } from "zustand";
import { api } from "../api/api";

const useUserStore = create((set) => ({
  isLoading: false,
  error: null,
  success: false,
  students: [],
  teachers: [],

  getTeachers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/user/students");
      set({
        teachers: response.data.students || [],
        isLoading: false,
      });
      // console.log(response.data);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch teachers";
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error("Get Students Error:", err);
      throw err;
    }
  },

  getTeachers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/user/teachers");
      set({
        teachers: response.data.teachers || [],
        isLoading: false,
      });
      // console.log(response.data);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch teachers";
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error("Get Teachers Error:", err);
      throw err;
    }
  },

  addUser: async (formData) => {
    set({ isLoading: true, error: null, success: false });
    try {
      const response = await api.post("/user/add", formData);
      set({ isLoading: false, success: true });
      console.log(response.data);
      return response.data;
    } catch (err) {
      set({
        isLoading: false,
        error: err.response?.data?.message || "Something went wrong",
      });
      console.log(err);
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

      console.error("Update User Error:", err);
      throw err;
    }
  },

  resetStatus: () => set({ success: false, error: null }),
}));

export default useUserStore;
