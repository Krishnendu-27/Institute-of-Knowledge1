import { create } from "zustand";
import toast from "react-hot-toast";
import { api } from "../api/api";

const useBatchStore = create((set, get) => ({
  batches: [],
  currentBatch: null,
  batchStudents: [],
  isLoading: false,
  error: null,

  // 1. Fetch all batches (Backend should ideally filter this if a Student requests it)
  fetchBatches: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/batch");
      set({ batches: response.data, isLoading: false });
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch batches";
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  // 2. Fetch single batch details
  fetchBatchById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/batch/show/${id}`);
      set({ currentBatch: response.data, isLoading: false });
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch batch details";
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  // 3. Fetch students in a batch
  fetchBatchStudents: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/batch/students/${id}`);
      set({ batchStudents: response.data, isLoading: false });
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch batch students";
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  // 4. Create a batch (Admin)
  createBatch: async (batchData, navigate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/batch/create", batchData);
      set((state) => ({
        batches: [...state.batches, response.data],
        isLoading: false,
      }));
      toast.success("Batch created successfully!");
      if (navigate) navigate("/batches");
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create batch";
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  // 5. Add student to batch (Admin/Teacher)
  addStudentToBatch: async (id, studentData) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/batch/add-student/${id}`, studentData);
      toast.success("Student added successfully!");
      // Optionally refresh batch details
      get().fetchBatchById(id);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add student";
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  // 6. Update batch (Admin)
  updateBatch: async (id, updatedData, navigate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(
        `/batch/edit/${id}`,
        updatedData,
      );
      toast.success("Batch updated successfully!");
      get().fetchBatchById(id); // Refresh current batch
      if (navigate) navigate(`/batches/${id}`);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update batch";
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },

  // 7. Delete batch (Admin)
  deleteBatch: async (id, navigate) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/batch/delete/${id}`);
      set((state) => ({
        batches: state.batches.filter((batch) => batch._id !== id),
        isLoading: false,
      }));
      toast.success("Batch deleted successfully!");
      if (navigate) navigate("/batches");
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete batch";
      set({ error: message, isLoading: false });
      toast.error(message);
    }
  },
}));

export default useBatchStore;
