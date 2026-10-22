import axios from "axios";
import { appStorage } from "@/utils/storage";
import { API_BASE_URL, TOKEN_KEY } from "@/constants/Config";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor para inyectar Bearer token desde SecureStore
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await appStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("[API Client] Error al obtener token de SecureStore:", e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para respuestas y manejo de 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("[API Client] Sesión caducada o no autorizada (401)");
      try {
        await appStorage.deleteItem(TOKEN_KEY);
      } catch (_) {}
    }
    return Promise.reject(error);
  }
);

export default apiClient;
