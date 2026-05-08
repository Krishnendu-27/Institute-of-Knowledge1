// import { create } from "zustand";
// import { api } from "../api/api";

// const useClassStore = create((set) => ({
//   isLoading: false,
//   error: null,
//   success: false,
//   studentProgressLoading: false,
//   allClass: [],

//   // Get all classes
//   getClasses: async () => {
//     set({ isLoading: true, error: null });
//     try {
//       const response = await api.get("/mainclass");
//       set({ isLoading: false, allClass: response.data });
//       return response.data;
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message || "Failed to fetch classes";
//       set({
//         isLoading: false,
//         error: errorMessage,
//       });
//       console.error("Get Classes Error:", err);
//       throw err;
//     }
//   },

//   getClassById: async (classId) => {
//     set({ isLoading: true, error: null });
//     try {
//       const response = await api.get(`/mainclass/show/${classId}`);
//       set({ isLoading: false });
//       return response.data;
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message || "Failed to fetch class";
//       set({
//         isLoading: false,
//         error: errorMessage,
//       });
//       console.error("Get Class Error:", err);
//       throw err;
//     }
//   },

//   createClass: async (classData) => {
//     set({ isLoading: true, error: null });
//     try {
//       const response = await api.post("/mainclass/create", classData);
//       set({ isLoading: false });
//       return response.data;
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message || "Failed to fetch classes";
//       set({
//         isLoading: false,
//         error: errorMessage,
//       });
//       console.error("Get Classes Error:", err);
//       throw err;
//     }
//   },

//   getStudentProgress: async (studentBatchId, updatedData) => {
//     set({ studentProgressLoading: true, error: null });
//     try {
//       const response = await api.patch(
//         `/mainclass/${studentBatchId}`,
//         updatedData,
//       );
//       set({ studentProgressLoading: false, allClass: response.data });
//       return response.data;
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message || "Failed to fetch classes";
//       set({
//         isLoading: studentProgressLoading,
//         error: errorMessage,
//       });
//       console.error("Get Classes Error:", err);
//       throw err;
//     }
//   },

//   addStudentInClass: async (studentClassData) => {
//     set({ isLoading: true, error: null, success: false });
//     try {
//       const response = await api.post(
//         "/mainclass/add-student",
//         studentClassData,
//       );
//       set({ isLoading: false, success: true });
//       setTimeout(() => set({ success: false }), 3000);
//       // console.log(response.data);
//       return response.data;
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message || "Something went wrong";
//       set({
//         isLoading: false,
//         error: errorMessage,
//       });
//       setTimeout(() => set({ error: null }), 4000);
//       console.error("Add Class Error:", err);
//       throw err;
//     }
//   },

//   removeStudentInClass: async (studentClassData) => {
//     set({ isLoading: true, error: null, success: false });
//     try {
//       const response = await api.delete("/mainclass/remove-student", {
//         data: studentClassData,
//       });

//       set({ isLoading: false, success: true });
//       setTimeout(() => set({ success: false }), 3000);
//       return response.data;
//     } catch (err) {
//       const errorMessage =
//         err.response?.data?.message || "Something went wrong";
//       set({
//         isLoading: false,
//         error: errorMessage,
//       });
//       setTimeout(() => set({ error: null }), 4000);
//       console.error("Remove Student Error:", err);
//       throw err;
//     }
//   },

//   // Reset status
//   resetStatus: () => set({ success: false, error: null }),
// }));

// export default useClassStore;

import { create } from "zustand";
import { api } from "../api/api";

const useClassStore = create((set) => ({
  isLoading: false,
  error: null,
  success: false,
  studentProgressLoading: false,
  allClass: [],

  // Get all classes
  getClasses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/mainclass");
      set({ isLoading: false, allClass: response.data });
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to fetch classes";
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error("Get Classes Error:", err);
      throw err;
    }
  },

  getClassById: async (classId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/mainclass/show/${classId}`);
      set({ isLoading: false });
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to fetch class";
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error("Get Class Error:", err);
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
        err.response?.data?.error || "Failed to create class";
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error("Create Class Error:", err);
      throw err;
    }
  },

  // NEW: Edit an existing main class
  updateClass: async (classId, updatedData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch(
        `/mainclass/edit/${classId}`,
        updatedData,
      );
      set({ isLoading: false });
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to update class";
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error("Update Class Error:", err);
      throw err;
    }
  },

  // NEW: Delete a main class
  deleteClass: async (classId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(`/mainclass/delete/${classId}`);
      set({ isLoading: false });
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to delete class";
      set({
        isLoading: false,
        error: errorMessage,
      });
      console.error("Delete Class Error:", err);
      throw err;
    }
  },

  getStudentProgress: async (studentBatchId, updatedData) => {
    set({ studentProgressLoading: true, error: null });
    try {
      const response = await api.patch(
        `/mainclass/${studentBatchId}`,
        updatedData,
      );
      set({ studentProgressLoading: false, allClass: response.data });
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to update progress";
      set({
        studentProgressLoading: false,
        error: errorMessage,
      });
      console.error("Get Progress Error:", err);
      throw err;
    }
  },

  addStudentInClass: async (studentClassData) => {
    set({ isLoading: true, error: null, success: false });
    try {
      const response = await api.post(
        "/mainclass/add-student",
        studentClassData,
      );
      set({ isLoading: false, success: true });
      setTimeout(() => set({ success: false }), 3000);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Something went wrong";
      set({
        isLoading: false,
        error: errorMessage,
      });
      setTimeout(() => set({ error: null }), 4000);
      console.error("Add Student Error:", err);
      throw err;
    }
  },

  removeStudentInClass: async (studentClassData) => {
    set({ isLoading: true, error: null, success: false });
    try {
      const response = await api.delete("/mainclass/remove-student", {
        data: studentClassData,
      });

      set({ isLoading: false, success: true });
      setTimeout(() => set({ success: false }), 3000);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Something went wrong";
      set({
        isLoading: false,
        error: errorMessage,
      });
      setTimeout(() => set({ error: null }), 4000);
      console.error("Remove Student Error:", err);
      throw err;
    }
  },

  // Reset status
  resetStatus: () => set({ success: false, error: null }),
}));

export default useClassStore;