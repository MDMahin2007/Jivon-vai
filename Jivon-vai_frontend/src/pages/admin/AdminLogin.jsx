import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaExclamationTriangle,
  FaLock,
  FaUserShield,
} from "react-icons/fa";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Check your credentials.");
      }

      localStorage.setItem("arcforma_admin_token", data.token || "");
      localStorage.setItem(
        "arcforma_admin_user",
        JSON.stringify(data.admin || { email: formValues.email }),
      );
      navigate("/admin/dashboard");
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to connect to the admin server. Please try again.",
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
              Projects, gallery assets, services, and enquiries are organized
              in one focused control center for day-to-day website management.
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
                  Secure Login
                </p>
                <h2 className="font-heading text-2xl font-bold text-white">
                  Admin Dashboard
                </h2>
              </div>
            </div>

            {error && (
              <div className="mb-5 flex gap-3 border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                <FaExclamationTriangle className="mt-0.5 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-2 font-heading text-xs uppercase tracking-widest text-gray-400">
                Email
                <input
                  required
                  type="email"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                  placeholder="admin@arcforma.studio"
                  className="border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-primary"
                />
              </label>

              <label className="flex flex-col gap-2 font-heading text-xs uppercase tracking-widest text-gray-400">
                Password
                <input
                  required
                  type="password"
                  name="password"
                  value={formValues.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  className="border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-primary"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex items-center justify-center gap-3 bg-primary px-5 py-4 font-heading text-xs font-bold tracking-widest text-dark shadow-lg shadow-primary/10 transition-all hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaLock size={12} />
                {loading ? "SIGNING IN..." : "LOGIN"}
                <FaArrowRight size={12} />
              </button>
            </form>

            <p className="mt-6 text-xs leading-relaxed text-gray-500">
              Use an admin account created through the backend admin register
              route. The session token is stored locally for dashboard requests.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
