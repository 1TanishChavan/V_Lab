import { create } from "zustand";
import api from "../services/api";

const useFacultyStore = create((set) => ({
  faculty: [],
  departments: [],
  isLoading: false,
  error: null,

  // Fetch departments
  fetchDepartments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/departments");
      set({ departments: response.data });
    } catch (error) {
      set({ error: "Failed to fetch departments" });
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch faculty (optionally by department)
  fetchFaculty: async (department) => {
    set({ isLoading: true, error: null });
    try {
      const endpoint = department ? `/faculty/department/${department}` : "/faculty/all";
      const response = await api.get(endpoint);
      set({ faculty: response.data });
    } catch (error) {
      set({ error: "Failed to fetch faculty" });
    } finally {
      set({ isLoading: false });
    }
  },

  // Add a new faculty member
  addFaculty: async (newFaculty) => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/faculty", newFaculty);
      set((state) => ({
        faculty: [...state.faculty, newFaculty],
      }));
    } catch (error) {
      set({ error: "Failed to add faculty" });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useFacultyStore;
