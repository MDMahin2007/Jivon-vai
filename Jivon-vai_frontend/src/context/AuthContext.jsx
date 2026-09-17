import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const STORAGE_KEY = "jivonvai_admin_auth";

const client = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

function readStoredAuth() {
  const readFromStorage = (storage) => {
    try {
      return JSON.parse(storage.getItem(STORAGE_KEY) || "null");
    } catch (error) {
      return null;
    }
  };

  const localAuth = readFromStorage(localStorage);
  if (localAuth?.token) {
    return { auth: localAuth, rememberMe: true };
  }

  const sessionAuth = readFromStorage(sessionStorage);
  if (sessionAuth?.token) {
    return { auth: sessionAuth, rememberMe: false };
  }

  return null;
}

client.interceptors.request.use((config) => {
  const storedAuth = readStoredAuth();

  if (storedAuth?.auth?.token) {
    config.headers.Authorization = `Bearer ${storedAuth.auth.token}`;
  }

  return config;
});

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const persistAuth = (currentToken, currentAdmin, shouldRemember) => {
    if (shouldRemember) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: currentToken, admin: currentAdmin }),
      );
      sessionStorage.removeItem(STORAGE_KEY);
    } else {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token: currentToken, admin: currentAdmin }),
      );
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const saveAuth = ({ token: newToken, admin: newAdmin }, rememberMeOption) => {
    setToken(newToken);
    setAdmin(newAdmin);
    setRememberMe(rememberMeOption);
    persistAuth(newToken, newAdmin, rememberMeOption);
  };

  const clearAuth = () => {
    setToken(null);
    setAdmin(null);
    setRememberMe(false);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const loadStoredAuth = async () => {
    const storedAuth = readStoredAuth();

    if (!storedAuth?.auth?.token) {
      clearAuth();
      setInitialized(true);
      return;
    }

    try {
      const response = await client.get("/auth/me");
      const authenticatedAdmin = response.data?.admin || storedAuth.auth.admin;
      saveAuth(
        { token: storedAuth.auth.token, admin: authenticatedAdmin },
        storedAuth.rememberMe,
      );
    } catch (error) {
      clearAuth();
    } finally {
      setInitialized(true);
    }
  };

  useEffect(() => {
    void loadStoredAuth();
  }, []);

  const signIn = async ({ email, password, rememberMe: shouldRemember }) => {
    const response = await client.post("/auth/login", {
      email,
      password,
      rememberMe: shouldRemember,
    });
    const { token: newToken, admin: newAdmin } = response.data;
    if (!newToken) {
      throw new Error("Login response missing authentication token.");
    }
    saveAuth({ token: newToken, admin: newAdmin }, shouldRemember);
    return newAdmin;
  };

  const signUp = async ({
    name,
    email,
    password,
    rememberMe: shouldRemember,
  }) => {
    const response = await client.post("/auth/register", {
      name,
      email,
      password,
      rememberMe: shouldRemember,
    });
    const { token: newToken, admin: newAdmin } = response.data;
    if (!newToken) {
      throw new Error("Registration response missing authentication token.");
    }
    saveAuth({ token: newToken, admin: newAdmin }, shouldRemember);
    return newAdmin;
  };

  const signOut = async () => {
    try {
      await client.post("/auth/logout");
    } catch (error) {
      // ignore errors during logout to preserve client state
    }
    clearAuth();
  };

  const refreshAdmin = async () => {
    if (!token) return null;
    const response = await client.get("/auth/me");
    setAdmin(response.data.admin);
    return response.data.admin;
  };

  const contextValue = useMemo(
    () => ({
      admin,
      token,
      rememberMe,
      initialized,
      signIn,
      signUp,
      signOut,
      refreshAdmin,
    }),
    [admin, token, rememberMe, initialized],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
