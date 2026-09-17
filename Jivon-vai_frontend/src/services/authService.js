import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const AUTH_STORAGE_KEY = "jivonvai_admin_auth";
const LEGACY_AUTH_STORAGE_KEY = "arcforma_admin_auth";

const client = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

client.interceptors.request.use((config) => {
    const stored = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null") ||
        JSON.parse(sessionStorage.getItem(AUTH_STORAGE_KEY) || "null") ||
        JSON.parse(localStorage.getItem(LEGACY_AUTH_STORAGE_KEY) || "null") ||
        JSON.parse(sessionStorage.getItem(LEGACY_AUTH_STORAGE_KEY) || "null");
    const token = stored?.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export async function fetchAdminExists() {
    const { data } = await client.get("/auth/admin-exists");
    return data;
}

export async function loginAdmin(payload) {
    const { data } = await client.post("/auth/login", payload);
    return data;
}

export async function registerAdmin(payload) {
    const { data } = await client.post("/auth/register", payload);
    return data;
}

export async function fetchCurrentAdmin() {
    const { data } = await client.get("/auth/me");
    return data;
}

export async function logoutAdmin() {
    const { data } = await client.post("/auth/logout");
    return data;
}

export async function requestPasswordReset(email) {
    const { data } = await client.post("/auth/forgot-password", { email });
    return data;
}

export async function resetPassword(token, password) {
    const { data } = await client.post(`/auth/reset-password/${token}`, { password });
    return data;
}
