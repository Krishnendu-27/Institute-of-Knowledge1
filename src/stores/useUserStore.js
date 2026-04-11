import { create } from "zustand";
import axios from "axios";
import { api } from "../api/api";

const useUserStore = create((set) => ({
  isLoading: false,
  error: null,
  success: false,

  addUser: async (formData) => {
    set({ isLoading: true, error: null, success: false });
    try {
      const response = await api.post("/user/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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

  resetStatus: () => set({ success: false, error: null }),
}));

export default useUserStore;
