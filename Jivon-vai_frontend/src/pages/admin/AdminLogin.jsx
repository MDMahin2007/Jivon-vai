import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaRegCheckCircle,
  FaUserShield,
} from "react-icons/fa";
import { fetchAdminExists } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { signIn, signUp, token, initialized } = useAuth();
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [adminExists, setAdminExists] = useState(true);

  useEffect(() => {
    if (initialized && token) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    fetchAdminExists()
      .then((response) => {
        setAdminExists(response.exists);
        setMode(response.exists ? "login" : "register");
      })
      .catch(() => {
        setAdminExists(true);
        setMode("login");
      });
  }, [initialized, navigate, token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setError("");
    setInfo("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const payload = {
        name: formValues.name,
        email: formValues.email,
        password: formValues.password,
        rememberMe,
      };

      if (mode === "login") {
        await signIn({
          email: payload.email,
          password: payload.password,
          rememberMe,
        });
      } else {
        if (adminExists) {
          setError("Admin account already configured. Please log in.");
          setLoading(false);
          return;
        }
        await signUp({
          name: payload.name,
          email: payload.email,
          password: payload.password,
          rememberMe,
        });
      }

      navigate("/admin/dashboard");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to connect to the admin server.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#070707] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(239,224,189,0.16),transparent_28rem),radial-gradient(circle_at_80%_10%,rgba(212,175,55,0.1),transparent_22rem),linear-gradient(135deg,#050505,#111111_55%,#1a1711)]" />
      <div className="absolute inset-0 bg-grid-pattern opacity-35" />

      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-[1fr_460px]">
        <section className="hidden items-end px-12 py-14 lg:flex">
          <div className="max-w-xl">
            <p className="font-heading text-xs font-bold uppercase tracking-[0.35em] text-primary">
              Arcforma Admin
            </p>
            <h1 className="mt-5 font-heading text-5xl font-extrabold leading-tight">
              Manage a premium architecture portfolio with precision.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-gray-400">
              Projects, gallery assets, services, and enquiries are organized in
              one focused control center for day-to-day website management.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md border border-white/10 bg-black/50 p-8 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                <FaUserShield size={18} />
              </div>
              <div>
                <p className="font-heading text-[10px] font-bold uppercase tracking-[0.35em] text-primary">
                  Secure Access
                </p>
                <h2 className="font-heading text-2xl font-bold text-white">
                  {mode === "login" ? "Admin Login" : "Create Admin"}
                </h2>
              </div>
            </div>

            <div className="mb-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-xs text-white">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 rounded-full px-4 py-2 transition ${mode === "login" ? "bg-primary text-dark" : "text-gray-300 hover:text-white"}`}
              >
                Login
              </button>
              {!adminExists && (
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`flex-1 rounded-full px-4 py-2 transition ${mode === "register" ? "bg-primary text-dark" : "text-gray-300 hover:text-white"}`}
                >
                  Register
                </button>
              )}
            </div>

            {error && (
              <div className="mb-5 flex gap-3 rounded-3xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                <FaExclamationTriangle className="mt-1 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {info && (
              <div className="mb-5 flex gap-3 rounded-3xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                <FaRegCheckCircle className="mt-1 shrink-0 text-emerald-400" />
                <span>{info}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === "register" && (
                <label className="flex flex-col gap-2 font-heading text-xs uppercase tracking-widest text-gray-400">
                  Full Name
                  <div className="relative">
                    <FaEnvelope className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      required
                      type="text"
                      name="name"
                      value={formValues.name}
                      onChange={handleChange}
                      placeholder="Admin name"
                      className="w-full border border-white/10 bg-white/5 px-11 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-primary"
                    />
                  </div>
                </label>
              )}

              <label className="flex flex-col gap-2 font-heading text-xs uppercase tracking-widest text-gray-400">
                Email
                <div className="relative">
                  <FaEnvelope className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    required
                    type="email"
                    name="email"
                    value={formValues.email}
                    onChange={handleChange}
                    placeholder="admin@arcforma.studio"
                    className="w-full border border-white/10 bg-white/5 px-11 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-primary"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 font-heading text-xs uppercase tracking-widest text-gray-400">
                Password
                <div className="relative">
                  <FaLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formValues.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className="w-full border border-white/10 bg-white/5 px-11 py-3 pr-12 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </label>

              <label className="inline-flex cursor-pointer items-center gap-3 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-black text-primary focus:ring-primary"
                />
                Remember me
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex items-center justify-center gap-3 rounded-full bg-primary px-5 py-4 font-heading text-xs font-bold tracking-widest text-dark shadow-lg shadow-primary/15 transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "PROCESSING..."
                  : mode === "login"
                    ? "LOGIN"
                    : "CREATE ACCOUNT"}
                <FaArrowRight size={12} />
              </button>
            </form>

            <p className="mt-6 text-xs leading-relaxed text-gray-500">
              {adminExists
                ? "Admin account already configured. Please log in to continue."
                : "Create your first administrator account for Arcforma Studio."}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
