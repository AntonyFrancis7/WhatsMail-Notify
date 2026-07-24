import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true
});

const gmailService = {
  getProfile: async () => {
    const res = await api.get("/gmail/profile");
    return res.data;
  },
  getMessages: async (q = "", pageToken = null) => {
    const params = {};
    if (q) params.q = q;
    if (pageToken) params.pageToken = pageToken;
    const res = await api.get("/gmail/messages", { params });
    return res.data;
  },
  getMessageDetail: async (id) => {
    const res = await api.get(`/gmail/message/${id}`);
    return res.data;
  }
};

export default gmailService;
