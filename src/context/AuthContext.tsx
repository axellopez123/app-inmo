import React, { createContext, useContext, useState, useEffect } from "react";
import { appStorage } from "@/utils/storage";
import apiClient from "@/api/client";
import { TOKEN_KEY, USER_KEY } from "@/constants/Config";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "cliente" | "vendedor" | "agente" | "admin";
  phone?: string;
  profile_image?: string;
  email_verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isVendor: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (credential: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isVendor: false,
  login: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isVendor = Boolean(
    user && ["vendedor", "admin", "agente"].includes(user.role)
  );

  // Inicialización al abrir la app
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const savedToken = await appStorage.getItem(TOKEN_KEY);
        const savedUserJson = await appStorage.getItem(USER_KEY);

        if (savedToken) {
          setToken(savedToken);
          if (savedUserJson) {
            setUser(JSON.parse(savedUserJson));
          }
          // Verificar en backend
          try {
            const { data } = await apiClient.get("/auth/me");
            setUser(data);
            await appStorage.setItem(USER_KEY, JSON.stringify(data));
          } catch (err) {
            console.warn("[AuthContext] Token caducado o servidor inalcanzable");
          }
        }
      } catch (e) {
        console.error("[AuthContext] Error durante bootstrap:", e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { access_token, user: userData } = response.data;

      if (access_token) {
        await appStorage.setItem(TOKEN_KEY, access_token);
        setToken(access_token);

        if (userData) {
          await appStorage.setItem(USER_KEY, JSON.stringify(userData));
          setUser(userData);
        } else {
          // Obtener datos si el backend no los incluyó en body
          const meRes = await apiClient.get("/auth/me");
          await appStorage.setItem(USER_KEY, JSON.stringify(meRes.data));
          setUser(meRes.data);
        }
        return { success: true };
      }
      return { success: false, error: "No se recibió token de acceso" };
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Error al iniciar sesión. Revisa tus credenciales.";
      return { success: false, error: msg };
    }
  };

  const register = async (userDataPayload: any) => {
    try {
      const response = await apiClient.post("/auth/register", userDataPayload);
      const { access_token, user: userData } = response.data;

      if (access_token) {
        await appStorage.setItem(TOKEN_KEY, access_token);
        setToken(access_token);
        if (userData) {
          await appStorage.setItem(USER_KEY, JSON.stringify(userData));
          setUser(userData);
        }
      }
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Error al registrar cuenta.";
      return { success: false, error: msg };
    }
  };

  const loginWithGoogle = async (credential: string) => {
    try {
      const response = await apiClient.post("/auth/google", { credential });
      const { access_token, user: userData } = response.data;

      if (access_token) {
        await appStorage.setItem(TOKEN_KEY, access_token);
        setToken(access_token);

        if (userData) {
          await appStorage.setItem(USER_KEY, JSON.stringify(userData));
          setUser(userData);
        } else {
          const meRes = await apiClient.get("/auth/me");
          await appStorage.setItem(USER_KEY, JSON.stringify(meRes.data));
          setUser(meRes.data);
        }
        return { success: true };
      }
      return { success: false, error: "No se recibió token de acceso de Google" };
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Error al iniciar sesión con Google.";
      return { success: false, error: typeof msg === "string" ? msg : "Error con Google" };
    }
  };

    const logout = async () => {
    try {
      await apiClient.post("/auth/logout").catch(() => {});
    } catch (_) {}

    try {
      // If native Google Signin is available, sign out of Google session too
      const { Platform } = require('react-native');
      if (Platform.OS !== 'web') {
        const GoogleSigninModule = require('@react-native-google-signin/google-signin');
        if (GoogleSigninModule?.GoogleSignin) {
          await GoogleSigninModule.GoogleSignin.signOut().catch(() => {});
        }
      }
    } catch (_) {}

    try {
      await appStorage.deleteItem(TOKEN_KEY);
      await appStorage.deleteItem(USER_KEY);
    } catch (_) {}

    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await apiClient.get("/auth/me");
      setUser(data);
      await appStorage.setItem(USER_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("[AuthContext] Error refrescando usuario:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isVendor,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
