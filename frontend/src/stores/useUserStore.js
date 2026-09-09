import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const useUserStore = create((set) => ({
  user: null,
  loading: false,
  isCheckingAuth: true,

  signUp: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });

    if (password !== confirmPassword) {
      set({ loading: false });
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await axiosInstance.post("/auth/signup", {
        name,
        email,
        password,
      });

      set({
        user: response.data.user,
        loading: false,
      });

      toast.success("Sign up successful");
    } catch (error) {
      set({ loading: false });

      toast.error(
        error.response?.data?.message || "Sign up failed"
      );
    }
  },

  login: async ({ email, password }) => {
    set({ loading: true });

    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      set({
        user: response.data.user,
        loading: false,
      });

      toast.success("Login successful");
    } catch (error) {
      set({ loading: false });

      toast.error(
        error.response?.data?.message || "Login failed"
      );
    }
  },

  logout: async () => {
    set({ loading: true });

    try {
      await axiosInstance.post("/auth/logout");

      set({
        user: null,
        loading: false,
      });

      toast.success("Logout successful");
    } catch (error) {
      set({ loading: false });

      toast.error(
        error.response?.data?.message || "Logout failed"
      );
    }
  },

  // Check if the user is still authenticated
  checkAuth: async () => {
    try {
      const response = await axiosInstance.get("/auth/profile");

      set({
        user: response.data.user,
        isCheckingAuth: false,
      });
    } catch (error) {
      // 401 simply means the user is not logged in.
      // Don't show an error toast here.
      set({
        user: null,
        isCheckingAuth: false,
      });
    }
  },
}));

// TODO: Impelement axios interceptor to handle token refresh and automatic logout on 401 errors.

export default useUserStore;

