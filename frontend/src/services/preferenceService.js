import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true
});

const preferenceService = {
  getPreferences: async () => {
    const res = await api.get("/preferences");
    return res.data;
  },
  updatePreferences: async (preferences) => {
    const res = await api.put("/preferences", { preferences });
    return res.data;
  },
  getDefaultPreferences: async () => {
    const res = await api.get("/preferences/default");
    return res.data;
  },
  addCustomKeyword: async (keyword) => {
    const res = await api.post("/preferences/keywords", { keyword });
    return res.data;
  },
  deleteCustomKeyword: async (id) => {
    const res = await api.delete(`/preferences/keywords/${id}`);
    return res.data;
  },
  addTrustedSender: async (email, domain) => {
    const res = await api.post("/preferences/trusted", { email, domain });
    return res.data;
  },
  deleteTrustedSender: async (id) => {
    const res = await api.delete(`/preferences/trusted/${id}`);
    return res.data;
  },
  addBlockedSender: async (email, domain) => {
    const res = await api.post("/preferences/blocked", { email, domain });
    return res.data;
  },
  deleteBlockedSender: async (id) => {
    const res = await api.delete(`/preferences/blocked/${id}`);
    return res.data;
  }
};

export default preferenceService;
