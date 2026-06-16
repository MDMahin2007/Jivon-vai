import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaLock, FaUserShield } from 'react-icons/fa';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({ email: '', password: '' });

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#070707] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(239,224,189,0.16),transparent_28rem),radial-gradient(circle_at_80%_10%,rgba(212,175,55,0.1),transparent_22rem),linear-gradient(135deg,#050505,#111111_55%,#1a1711)]" />
      <div className="absolute inset-0 bg-grid-pattern opacity-35" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md border border-white/10 bg-black/45 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.55)] p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center text-primary">
              <FaUserShield size={18} />
            </div>
            <div>
              <p className="text-primary text-[10px] tracking-[0.35em] font-heading font-bold uppercase">Admin Panel</p>
              <h1 className="text-2xl font-heading font-bold text-white">Arcforma Control</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-xs font-heading tracking-widest text-gray-400 uppercase">
              Email
              <input
                type="email"
                value={formValues.email}
                onChange={(event) => setFormValues((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="admin@arcforma.studio"
                className="bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-primary focus:outline-none transition-colors"
              />
            </label>

            <label className="flex flex-col gap-2 text-xs font-heading tracking-widest text-gray-400 uppercase">
              Password
              <input
                type="password"
                value={formValues.password}
                onChange={(event) => setFormValues((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="Enter password"
                className="bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:border-primary focus:outline-none transition-colors"
              />
            </label>

            <button
              type="submit"
              className="mt-2 bg-primary text-dark font-heading text-xs tracking-widest font-bold px-5 py-4 flex items-center justify-center gap-3 hover:bg-primary-hover transition-all shadow-lg shadow-primary/10"
            >
              <FaLock size={12} />
              LOGIN
              <FaArrowRight size={12} />
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-6 leading-relaxed">
            This dashboard is prepared for website management workflows. Connect authentication and storage when backend services are ready.
          </p>
        </div>
      </div>
    </div>
  );
}
