import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { api } from "../api/api.js";
import { extractBearerToken } from "../util/bearerToken";

const useAuthStore = create(
  persist(
    (set, get) => ({
      // User informations

      user: null,
      token: null,
      userRole: null,

      // Authenciated states

      isAuthenticated: false,
      isOtpAuthenticated: false,
      isValidEmail: false,

      // Error states
      error: null,

      // Loaders States

      loginLoding: false,
      otpLoading: false,
      userLoading: false,

      login: async (userCredentails) => {
        set({
          loginLoding: false,
          error: null,
        });

        try {
          const response = await api.post("/auth/login", userCredentails);
          const { user, token, role } = response.data;
          set({
            user: user,
            token: extractBearerToken(token),
            userRole: role,
            isAuthenticated: true,
            loginLoding: false,
          });
        } catch (error) {
          set({
            error: err.response?.data?.message || "Login failed",
            loginLoding: false,
          });
        }
      },
      logout: () => {
        localStorage.removeItem("token");
        set({
          user: null,
          userRole: null,
          token: null,
          isAuthenticated: false,
          loginLoding: false,
        });
        return true;
      },

      loadUser: async () => {
        if (!get().token && !get.isAuthenticated) return;
        set({
          userLoading: true,
          error: null,
        });
        try {
          const response = await api.get(`/user/me`);

          const { data } = response.data;

          set({
            user: data,
            userRole: data.role,
            userLoading: false,
            isAuthenticated: true,
          });
        } catch (error) {
          get().logout();
        } finally {
          set({
            userLoading: false,
          });
        }
      },

      verifyCredentails: async (email) => {
        try {
          const response = await api.post("/auth/sendotp", email);
          set({
            isValidEmail: response.data.isValidEmail,
          });
        } catch (error) {
          set({
            error: err.response?.data?.message || "Email is not verified",
          });
        }
      },

      verifyOtp: async (userCredentails) => {
        try {
          const response = await api.post("/auth/verifyotp", userCredentails);
          set({
            isOtpAuthenticated: true,
          });
        } catch (error) {
          set({
            error: err.response?.data?.message || "Otp is not valid",
          });
        }
      },
    }),
    {
      name: "session-token",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export default useAuthStore;
