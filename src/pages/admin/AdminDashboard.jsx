import React, { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  FaBars,
  FaChartLine,
  FaCog,
  FaEnvelopeOpenText,
  FaEdit,
  FaEye,
  FaImages,
  FaMoon,
  FaPlus,
  FaProjectDiagram,
  FaRegTrashAlt,
  FaSignOutAlt,
  FaSun,
  FaTools,
  FaTimes,
} from 'react-icons/fa';
import { projectsData, servicesData } from '../../data/projects';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: FaChartLine },
  { id: 'projects', label: 'Projects', icon: FaProjectDiagram },
  { id: 'gallery', label: 'Gallery', icon: FaImages },
  { id: 'services', label: 'Services', icon: FaTools },
  { id: 'messages', label: 'Contact Messages', icon: FaEnvelopeOpenText },
  { id: 'settings', label: 'Settings', icon: FaCog },
];

const messages = [
  { id: 1, name: 'Rahman Group', email: 'contact@rahmangroup.com', interest: 'Commercial design', status: 'New', date: 'Jun 16, 2026' },
  { id: 2, name: 'Nusrat Karim', email: 'nusrat@example.com', interest: 'Interior concept', status: 'Read', date: 'Jun 14, 2026' },
  { id: 3, name: 'Urban Build Ltd', email: 'hello@urbanbuild.com', interest: '3D walkthrough', status: 'New', date: 'Jun 12, 2026' },
];

const galleryItems = projectsData.slice(0, 8).map((project) => ({
  id: project.id,
  title: project.title,
  category: project.category,
  image: project.coverImage,
}));

export default function AdminDashboard() {
  const { section = 'dashboard' } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const activeItem = navItems.find((item) => item.id === section);

  const stats = useMemo(() => [
    { label: 'Total Projects', value: projectsData.length, change: '+4 this month' },
    { label: 'Gallery Assets', value: galleryItems.length, change: 'Curated visuals' },
    { label: 'Services', value: servicesData.length, change: 'Active offers' },
    { label: 'Messages', value: messages.length, change: '2 unread' },
  ], []);

  if (!activeItem) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className={`${darkMode ? 'dark bg-[#070707] text-gray-100' : 'bg-[#f5f2eb] text-gray-950'} min-h-screen`}>
      <div className="flex min-h-screen">
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-[#090909]/95 backdrop-blur-2xl transition-transform duration-300 lg:static lg:translate-x-0`}>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/img/logo.png"
                  alt="Arcforma Studio"
                  className="h-11 w-11 rounded-full border border-primary/50 object-cover shadow-lg shadow-black/40"
                />
                <div>
                  <p className="text-[10px] tracking-[0.28em] text-primary font-heading font-bold uppercase">Arcforma</p>
                  <p className="text-sm font-heading font-bold text-white">Admin Dashboard</p>
                </div>
              </Link>
              <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
                <FaTimes />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === section;
                return (
                  <Link
                    key={item.id}
                    to={`/admin/${item.id}`}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary text-dark shadow-lg shadow-primary/10'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={15} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-white/10 p-4">
              <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all">
                <FaSignOutAlt size={15} />
                Logout
              </Link>
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-5 sm:px-8 py-4">
              <div className="flex items-center gap-4">
                <button
                  className="lg:hidden h-10 w-10 border border-white/10 flex items-center justify-center text-white hover:border-primary transition-colors"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <FaBars />
                </button>
                <div>
                  <p className="text-[10px] tracking-[0.3em] text-primary font-heading font-bold uppercase">Website Management</p>
                  <h1 className="text-xl sm:text-2xl font-heading font-bold text-white">{activeItem.label}</h1>
                </div>
              </div>

              <button
                onClick={() => setDarkMode((prev) => !prev)}
                className="h-10 px-4 border border-white/10 bg-white/5 text-xs font-heading tracking-widest text-white flex items-center gap-2 hover:border-primary transition-colors"
              >
                {darkMode ? <FaMoon size={13} /> : <FaSun size={13} />}
                {darkMode ? 'DARK' : 'LIGHT'}
              </button>
            </div>
          </header>

          <main className="p-5 sm:p-8 bg-[radial-gradient(circle_at_80%_0%,rgba(239,224,189,0.1),transparent_24rem)]">
            {section === 'dashboard' && <DashboardHome stats={stats} />}
            {section === 'projects' && <ProjectsManagement />}
            {section === 'gallery' && <GalleryManagement />}
            {section === 'services' && <ServicesManagement />}
            {section === 'messages' && <MessagesManagement />}
            {section === 'settings' && <SettingsPanel />}
          </main>
        </div>
      </div>
    </div>
  );
}

function DashboardHome({ stats }) {
  return (
    <div className="space-y-8">
      <StatsGrid stats={stats} />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <DataTable title="Recent Projects" columns={['Project', 'Category', 'Status', 'Action']}>
            {projectsData.slice(0, 5).map((project) => (
              <tr key={project.id} className="border-t border-white/10">
                <td className="px-5 py-4 text-white">{project.title}</td>
                <td className="px-5 py-4 text-gray-400">{project.category}</td>
                <td className="px-5 py-4"><StatusBadge label="Published" /></td>
                <td className="px-5 py-4"><ActionButtons /></td>
              </tr>
            ))}
          </DataTable>
        </div>
        <div className="border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-black/20">
          <p className="text-[10px] tracking-[0.3em] text-primary font-heading font-bold uppercase mb-3">Quick Actions</p>
          <h2 className="text-xl font-heading font-bold text-white mb-6">Manage Content</h2>
          <div className="space-y-3">
            {['Add Project', 'Upload Gallery Image', 'Create Service', 'Review Messages'].map((label) => (
              <button key={label} className="w-full flex items-center justify-between border border-white/10 bg-black/30 px-4 py-3 text-sm text-gray-300 hover:border-primary hover:text-white transition-colors">
                {label}
                <FaPlus size={12} className="text-primary" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {stats.map((stat) => (
        <div key={stat.label} className="border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/20">
          <p className="text-xs text-gray-500 font-heading tracking-widest uppercase">{stat.label}</p>
          <div className="mt-4 flex items-end justify-between gap-3">
            <span className="text-3xl font-heading font-bold text-white">{stat.value}</span>
            <span className="text-[11px] text-primary">{stat.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectsManagement() {
  return (
    <DataTable title="Projects Management" columns={['Project', 'Category', 'Featured', 'Actions']} actionLabel="Add Project">
      {projectsData.map((project) => (
        <tr key={project.id} className="border-t border-white/10">
          <td className="px-5 py-4">
            <div className="flex items-center gap-3">
              <img src={project.coverImage} alt={project.title} className="h-12 w-16 object-cover border border-white/10" />
              <span className="text-white font-medium">{project.title}</span>
            </div>
          </td>
          <td className="px-5 py-4 text-gray-400">{project.category}</td>
          <td className="px-5 py-4"><StatusBadge label={project.featured ? 'Yes' : 'No'} /></td>
          <td className="px-5 py-4"><ActionButtons /></td>
        </tr>
      ))}
    </DataTable>
  );
}

function GalleryManagement() {
  return (
    <div className="space-y-5">
      <SectionHeader title="Gallery Management" actionLabel="Upload Image" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {galleryItems.map((item) => (
          <div key={item.id} className="border border-white/10 bg-white/[0.04] overflow-hidden">
            <img src={item.image} alt={item.title} className="h-44 w-full object-cover" />
            <div className="p-4">
              <p className="text-white font-heading font-semibold text-sm">{item.title}</p>
              <p className="text-xs text-gray-500 mt-1">{item.category}</p>
              <div className="mt-4"><ActionButtons /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServicesManagement() {
  return (
    <DataTable title="Services Management" columns={['Service', 'Description', 'Status', 'Actions']} actionLabel="Add Service">
      {servicesData.map((service) => (
        <tr key={service.id} className="border-t border-white/10">
          <td className="px-5 py-4 text-white font-medium">{service.title}</td>
          <td className="px-5 py-4 text-gray-400 max-w-xl">{service.description}</td>
          <td className="px-5 py-4"><StatusBadge label="Active" /></td>
          <td className="px-5 py-4"><ActionButtons /></td>
        </tr>
      ))}
    </DataTable>
  );
}

function MessagesManagement() {
  return (
    <DataTable title="Contact Messages" columns={['Sender', 'Interest', 'Status', 'Date', 'Actions']}>
      {messages.map((message) => (
        <tr key={message.id} className="border-t border-white/10">
          <td className="px-5 py-4">
            <p className="text-white font-medium">{message.name}</p>
            <p className="text-xs text-gray-500 mt-1">{message.email}</p>
          </td>
          <td className="px-5 py-4 text-gray-400">{message.interest}</td>
          <td className="px-5 py-4"><StatusBadge label={message.status} /></td>
          <td className="px-5 py-4 text-gray-500">{message.date}</td>
          <td className="px-5 py-4"><ActionButtons /></td>
        </tr>
      ))}
    </DataTable>
  );
}

function SettingsPanel() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="border border-white/10 bg-white/[0.04] p-6">
        <p className="text-[10px] tracking-[0.3em] text-primary font-heading font-bold uppercase mb-3">Brand Settings</p>
        <h2 className="text-xl font-heading font-bold text-white mb-6">Website Identity</h2>
        <div className="space-y-4">
          <AdminInput label="Studio Name" value="Arcforma Studio" />
          <AdminInput label="Contact Email" value="arcformastudio@gmail.com" />
          <AdminInput label="Phone" value="+8801882111979" />
        </div>
      </div>
      <div className="border border-white/10 bg-white/[0.04] p-6">
        <p className="text-[10px] tracking-[0.3em] text-primary font-heading font-bold uppercase mb-3">Publishing</p>
        <h2 className="text-xl font-heading font-bold text-white mb-6">Dashboard Preferences</h2>
        <div className="space-y-4">
          {['Enable contact notifications', 'Show featured projects', 'Dark dashboard mode'].map((label) => (
            <label key={label} className="flex items-center justify-between border border-white/10 bg-black/30 px-4 py-3 text-sm text-gray-300">
              {label}
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function DataTable({ title, columns, actionLabel, children }) {
  return (
    <div className="border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20 overflow-hidden">
      <SectionHeader title={title} actionLabel={actionLabel} />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-black/35 text-[10px] uppercase tracking-[0.24em] text-gray-500 font-heading">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-5 py-4 font-bold">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function SectionHeader({ title, actionLabel }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
      <h2 className="text-lg font-heading font-bold text-white">{title}</h2>
      {actionLabel && (
        <button className="inline-flex items-center justify-center gap-2 bg-primary text-dark px-4 py-3 text-xs font-heading font-bold tracking-widest hover:bg-primary-hover transition-colors">
          <FaPlus size={12} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function ActionButtons() {
  return (
    <div className="flex items-center gap-2">
      <button className="h-9 w-9 border border-white/10 text-gray-300 hover:border-primary hover:text-primary transition-colors" aria-label="View">
        <FaEye size={13} className="mx-auto" />
      </button>
      <button className="h-9 w-9 border border-white/10 text-gray-300 hover:border-primary hover:text-primary transition-colors" aria-label="Edit">
        <FaEdit size={13} className="mx-auto" />
      </button>
      <button className="h-9 w-9 border border-white/10 text-gray-300 hover:border-red-400 hover:text-red-400 transition-colors" aria-label="Delete">
        <FaRegTrashAlt size={13} className="mx-auto" />
      </button>
    </div>
  );
}

function StatusBadge({ label }) {
  return (
    <span className="inline-flex items-center border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-heading font-bold uppercase tracking-widest text-primary">
      {label}
    </span>
  );
}

function AdminInput({ label, value }) {
  return (
    <label className="flex flex-col gap-2 text-xs font-heading tracking-widest text-gray-500 uppercase">
      {label}
      <input
        defaultValue={value}
        className="bg-black/30 border border-white/10 px-4 py-3 text-sm text-white focus:border-primary focus:outline-none transition-colors"
      />
    </label>
  );
}
