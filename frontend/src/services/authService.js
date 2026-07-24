import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true
});

const authService = {
  login: () => {
    window.location.href = `${API_URL}/api/auth/google`;
  },
  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get("/auth/profile");
    return response.data;
  }
};

export default authService;
