import React, { useMemo, useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  FaBars,
  FaChartLine,
  FaCog,
  FaEnvelopeOpenText,
  FaEdit,
  FaImages,
  FaMoon,
  FaPlus,
  FaProjectDiagram,
  FaRegTrashAlt,
  FaSignOutAlt,
  FaSun,
  FaTools,
  FaTimes,
} from "react-icons/fa";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: FaChartLine },
  { id: "projects", label: "Projects", icon: FaProjectDiagram },
  { id: "gallery", label: "Gallery", icon: FaImages },
  { id: "services", label: "Services", icon: FaTools },
  { id: "messages", label: "Contact Messages", icon: FaEnvelopeOpenText },
  { id: "settings", label: "Settings", icon: FaCog },
];

export default function AdminDashboard() {
  const { section = "dashboard" } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // 🌟 ডাটাবেজ থেকে আসা রিয়েল ডাটার স্টেটসমূহ
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [dbMessages, setDbMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // মোডাল বা পপআপ ফর্ম হ্যান্ডেল করার স্টেট
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editItem, setEditItem] = useState(null);

  // ফর্মের ইনপুট স্টেট
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    coverImage: "",
    description: "",
    featured: false,
  });

  // গ্যালারি আইটেম তৈরি (প্রজেক্ট ডাটা থেকে ম্যাপ করা)
  const galleryItems = useMemo(() => {
    return projects.map((p) => ({
      id: p._id,
      title: p.title,
      category: p.category,
      image: p.coverImage,
    }));
  }, [projects]);

  // 🌟 ডাটাবেজ থেকে সমস্ত ডাটা ফেচ করার useEffect
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // প্রজেক্ট ফেচ
        const resProj = await fetch("http://localhost:5000/api/projects");
        const dataProj = await resProj.json();
        if (dataProj.success) setProjects(dataProj.data || []);

        // সার্ভিস ফেচ
        const resServ = await fetch("http://localhost:5000/api/services");
        const dataServ = await resServ.json();
        if (dataServ.success) setServices(dataServ.data || []);

        // মেসেজ ফেচ
        const resMsg = await fetch(
          "http://localhost:5000/api/contact/contacts",
        );
        const dataMsg = await resMsg.json();
        if (dataMsg.success)
          setDbMessages(dataMsg.data || dataMsg.messages || []);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // কন্টাক্ট মেসেজ ডিলিট করার ফাংশন
  const handleDeleteMessage = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/contact/contacts/${messageId}`,
          {
            method: "DELETE",
          },
        );
        if (response.ok) {
          setDbMessages((prev) =>
            prev.filter((msg) => (msg._id || msg.id) !== messageId),
          );
          alert("Message deleted successfully!");
        }
      } catch (error) {
        alert("Error deleting message.");
      }
    }
  };

  // মোডাল ওপেন করার ফাংশন
  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setEditItem(item);
    if (item) {
      setFormData({
        title: item.title || "",
        category: item.category || "",
        coverImage: item.coverImage || item.image || "",
        description: item.description || "",
        featured: item.featured || false,
      });
    } else {
      setFormData({
        title: "",
        category: "",
        coverImage: "",
        description: "",
        featured: false,
      });
    }
    setModalOpen(true);
  };

  // 🌟 ডাটাবেজে সাবমিট (CREATE & UPDATE API CALL)
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const isProject = modalType === "Project" || modalType === "Gallery";
    const apiUrl = isProject
      ? "http://localhost:5000/api/projects"
      : "http://localhost:5000/api/services";
    const method = editItem ? "PUT" : "POST";
    const url = editItem ? `${apiUrl}/${editItem._id || editItem.id}` : apiUrl;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const resData = await response.json();

      if (resData.success) {
        if (isProject) {
          if (editItem) {
            setProjects((prev) =>
              prev.map((p) => (p._id === editItem._id ? resData.data : p)),
            );
          } else {
            setProjects((prev) => [resData.data, ...prev]);
          }
        } else {
          if (editItem) {
            setServices((prev) =>
              prev.map((s) => (s._id === editItem._id ? resData.data : s)),
            );
          } else {
            setServices((prev) => [resData.data, ...prev]);
          }
        }
        alert(`${modalType} saved successfully in Database!`);
      } else {
        alert(resData.message || "Failed to save data.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Server error occurred!");
    }

    setModalOpen(false);
    setEditItem(null);
  };

  // 🌟 ডাটাবেজ থেকে রিয়েল ডিলিট (DELETE API CALL)
  const handleItemDelete = async (type, id) => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete this ${type}?`,
      )
    ) {
      const isProject = type === "Project" || type === "Gallery Item";
      const apiUrl = isProject
        ? "http://localhost:5000/api/projects"
        : "http://localhost:5000/api/services";

      try {
        const response = await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
        const resData = await response.json();

        if (resData.success) {
          if (isProject) {
            setProjects((prev) => prev.filter((p) => p._id !== id));
          } else {
            setServices((prev) => prev.filter((s) => s._id !== id));
          }
          alert(`${type} successfully deleted from Database!`);
        }
      } catch (error) {
        alert("Server error during delete.");
      }
    }
  };

  const activeItem = navItems.find((item) => item.id === section);

  const stats = useMemo(
    () => [
      {
        label: "Total Projects",
        value: projects.length,
        change: "Database Live",
      },
      {
        label: "Gallery Assets",
        value: galleryItems.length,
        change: "Database Live",
      },
      { label: "Services", value: services.length, change: "Database Live" },
      { label: "Messages", value: dbMessages.length, change: "Database Live" },
    ],
    [projects, galleryItems, services, dbMessages],
  );

  if (!activeItem) return <Navigate to="/admin/dashboard" replace />;

  return (
    <div
      className={`${darkMode ? "dark bg-[#070707] text-gray-100" : "bg-[#f5f2eb] text-gray-900"} min-h-screen relative transition-colors duration-200`}
    >
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 border-r ${darkMode ? "border-white/10 bg-[#090909]" : "border-black/10 bg-white"} transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex h-full flex-col">
            <div
              className={`flex items-center justify-between border-b px-6 py-5 ${darkMode ? "border-white/10" : "border-black/10"}`}
            >
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/img/logo.png"
                  alt="Logo"
                  className="h-11 w-11 rounded-full object-cover border border-primary/50"
                />
                <div>
                  <p className="text-[10px] tracking-[0.28em] text-primary font-bold uppercase">
                    Arcforma
                  </p>
                  <p
                    className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Admin Panel
                  </p>
                </div>
              </Link>
              <button
                className="lg:hidden text-gray-400 hover:text-red-500 p-2"
                onClick={() => setSidebarOpen(false)}
              >
                <FaTimes size={18} />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    to={`/admin/${item.id}`}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${item.id === section ? "bg-primary text-dark font-bold shadow-lg shadow-primary/10" : darkMode ? "text-gray-400 hover:bg-white/5 hover:text-white" : "text-gray-600 hover:bg-black/5 hover:text-gray-950"}`}
                  >
                    <Icon size={15} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div
              className={`border-t p-4 ${darkMode ? "border-white/10" : "border-black/10"}`}
            >
              <Link
                to="/admin"
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-red-500"
              >
                <FaSignOutAlt size={15} />
                Logout
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 relative z-10">
          <header
            className={`sticky top-0 z-30 border-b backdrop-blur-xl ${darkMode ? "border-white/10 bg-black/50" : "border-black/10 bg-white/70"}`}
          >
            <div className="flex items-center justify-between gap-4 px-5 sm:px-8 py-4">
              <div className="flex items-center gap-4">
                <button
                  className={`lg:hidden h-10 w-10 border flex items-center justify-center ${darkMode ? "border-white/10 text-white" : "border-black/10 text-gray-900"}`}
                  onClick={() => setSidebarOpen(true)}
                >
                  <FaBars />
                </button>
                <h1
                  className={`text-xl sm:text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                >
                  {activeItem.label}
                </h1>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`h-10 px-4 border text-xs tracking-widest flex items-center gap-2 transition-colors ${darkMode ? "border-white/10 bg-white/5 text-white" : "border-black/10 bg-black/5 text-gray-900"}`}
              >
                {darkMode ? <FaMoon /> : <FaSun />}{" "}
                {darkMode ? "DARK" : "LIGHT"}
              </button>
            </div>
          </header>

          <main className="p-5 sm:p-8">
            {loading ? (
              <div className="text-center py-12 text-gray-400">
                Connecting Database and synchronizing...
              </div>
            ) : (
              <>
                {section === "dashboard" && (
                  <DashboardHome
                    stats={stats}
                    projects={projects}
                    darkMode={darkMode}
                    onEdit={(item) => handleOpenModal("Project", item)}
                    onDelete={(id) => handleItemDelete("Project", id)}
                    onAddClick={() => handleOpenModal("Project")}
                  />
                )}
                {section === "projects" && (
                  <ProjectsManagement
                    projects={projects}
                    darkMode={darkMode}
                    onEdit={(item) => handleOpenModal("Project", item)}
                    onDelete={(id) => handleItemDelete("Project", id)}
                    onAddClick={() => handleOpenModal("Project")}
                  />
                )}
                {section === "gallery" && (
                  <GalleryManagement
                    galleryItems={galleryItems}
                    darkMode={darkMode}
                    onEdit={(item) => handleOpenModal("Gallery", item)}
                    onDelete={(id) => handleItemDelete("Gallery Item", id)}
                    onAddClick={() => handleOpenModal("Gallery")}
                  />
                )}
                {section === "services" && (
                  <ServicesManagement
                    services={services}
                    darkMode={darkMode}
                    onEdit={(item) => handleOpenModal("Service", item)}
                    onDelete={(id) => handleItemDelete("Service", id)}
                    onAddClick={() => handleOpenModal("Service")}
                  />
                )}
                {section === "messages" && (
                  <MessagesManagement
                    messages={dbMessages}
                    onDelete={handleDeleteMessage}
                    loading={loading}
                    darkMode={darkMode}
                  />
                )}
                {section === "settings" && (
                  <SettingsPanel darkMode={darkMode} />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* 🌟 ডায়নামিক ফর্ম মোডাল */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div
            className={`w-full max-w-md p-6 border shadow-2xl ${darkMode ? "bg-[#090909] border-white/10 text-white" : "bg-white border-black/10 text-gray-900"}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">
                {editItem ? "Edit" : "Add New"} {modalType}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-red-500"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <label className="block text-xs uppercase tracking-widest text-gray-400">
                Title / Name
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={`w-full mt-1 p-2.5 text-sm border focus:outline-none focus:border-primary ${darkMode ? "bg-black/40 border-white/10 text-white" : "bg-gray-50 border-black/10 text-gray-900"}`}
                />
              </label>
              <label className="block text-xs uppercase tracking-widest text-gray-400">
                Category
                <input
                  required
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className={`w-full mt-1 p-2.5 text-sm border focus:outline-none focus:border-primary ${darkMode ? "bg-black/40 border-white/10 text-white" : "bg-gray-50 border-black/10 text-gray-900"}`}
                />
              </label>
              <label className="block text-xs uppercase tracking-widest text-gray-400">
                Image URL Path
                <input
                  required
                  type="text"
                  placeholder="/img/projects/p1.jpg"
                  value={formData.coverImage}
                  onChange={(e) =>
                    setFormData({ ...formData, coverImage: e.target.value })
                  }
                  className={`w-full mt-1 p-2.5 text-sm border focus:outline-none focus:border-primary ${darkMode ? "bg-black/40 border-white/10 text-white" : "bg-gray-50 border-black/10 text-gray-900"}`}
                />
              </label>
              {modalType === "Service" && (
                <label className="block text-xs uppercase tracking-widest text-gray-400">
                  Description
                  <textarea
                    required
                    rows="3"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className={`w-full mt-1 p-2.5 text-sm border focus:outline-none focus:border-primary ${darkMode ? "bg-black/40 border-white/10 text-white" : "bg-gray-50 border-black/10 text-gray-900"}`}
                  />
                </label>
              )}
              <button
                type="submit"
                className="w-full bg-primary text-dark font-bold text-xs tracking-widest py-3 hover:bg-primary-hover transition-colors"
              >
                SAVE TO DATABASE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// সাব-কম্পোনেন্টসমূহ
function DashboardHome({
  stats,
  projects,
  darkMode,
  onEdit,
  onDelete,
  onAddClick,
}) {
  return (
    <div className="space-y-8">
      <StatsGrid stats={stats} darkMode={darkMode} />
      <DataTable
        title="Recent Projects"
        columns={["Project", "Category", "Status", "Action"]}
        darkMode={darkMode}
        onActionClick={onAddClick}
        actionLabel="Add Project"
      >
        {projects.slice(0, 5).map((project) => (
          <tr
            key={project._id}
            className={`border-t ${darkMode ? "border-white/10" : "border-black/10"}`}
          >
            <td
              className={`px-5 py-4 ${darkMode ? "text-white" : "text-gray-900 font-medium"}`}
            >
              {project.title}
            </td>
            <td
              className={`px-5 py-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              {project.category}
            </td>
            <td className="px-5 py-4">
              <span className="border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] text-primary uppercase font-bold tracking-widest">
                Published
              </span>
            </td>
            <td className="px-5 py-4">
              <ActionButtons
                darkMode={darkMode}
                onEdit={() => onEdit(project)}
                onDelete={() => onDelete(project._id)}
              />
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}

function StatsGrid({ stats, darkMode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`border p-5 shadow-xl ${darkMode ? "border-white/10 bg-white/[0.04]" : "border-black/10 bg-white"}`}
        >
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            {stat.label}
          </p>
          <div className="mt-4 flex items-end justify-between">
            <span
              className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              {stat.value}
            </span>
            <span className="text-[11px] text-primary font-medium">
              {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectsManagement({
  projects,
  darkMode,
  onEdit,
  onDelete,
  onAddClick,
}) {
  return (
    <DataTable
      title="Projects List"
      columns={["Project", "Category", "Actions"]}
      actionLabel="Add Project"
      darkMode={darkMode}
      onActionClick={onAddClick}
    >
      {projects.map((project) => (
        <tr
          key={project._id}
          className={`border-t ${darkMode ? "border-white/10" : "border-black/10"}`}
        >
          <td className="px-5 py-4 flex items-center gap-3">
            <img
              src={project.coverImage}
              alt=""
              className="h-10 w-14 object-cover border border-white/10"
            />
            <span
              className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              {project.title}
            </span>
          </td>
          <td
            className={`px-5 py-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            {project.category}
          </td>
          <td className="px-5 py-4">
            <ActionButtons
              darkMode={darkMode}
              onEdit={() => onEdit(project)}
              onDelete={() => onDelete(project._id)}
            />
          </td>
        </tr>
      ))}
    </DataTable>
  );
}

function GalleryManagement({
  galleryItems,
  darkMode,
  onEdit,
  onDelete,
  onAddClick,
}) {
  return (
    <div className="space-y-5">
      <div
        className={`flex justify-between items-center border-b pb-4 ${darkMode ? "border-white/10" : "border-black/10"}`}
      >
        <h2
          className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
        >
          Gallery Collection
        </h2>
        <button
          onClick={onAddClick}
          className="bg-primary text-dark px-4 py-2.5 text-xs font-bold tracking-widest flex items-center gap-2"
        >
          <FaPlus /> UPLOAD IMAGE
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {galleryItems.map((item) => (
          <div
            key={item.id}
            className={`border overflow-hidden shadow-sm ${darkMode ? "border-white/10 bg-white/[0.04]" : "border-black/10 bg-white"}`}
          >
            <img src={item.image} alt="" className="h-40 w-full object-cover" />
            <div className="p-4">
              <p
                className={`font-semibold text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {item.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">{item.category}</p>
              <div className="mt-4">
                <ActionButtons
                  darkMode={darkMode}
                  onEdit={() => onEdit(item)}
                  onDelete={() => onDelete(item.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServicesManagement({
  services,
  darkMode,
  onEdit,
  onDelete,
  onAddClick,
}) {
  return (
    <DataTable
      title="Services List"
      columns={["Service", "Description", "Actions"]}
      actionLabel="Add Service"
      darkMode={darkMode}
      onActionClick={onAddClick}
    >
      {services.map((service) => (
        <tr
          key={service._id}
          className={`border-t ${darkMode ? "border-white/10" : "border-black/10"}`}
        >
          <td
            className={`px-5 py-4 font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            {service.title}
          </td>
          <td
            className={`px-5 py-4 text-xs max-w-sm truncate ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            {service.description}
          </td>
          <td className="px-5 py-4">
            <ActionButtons
              darkMode={darkMode}
              onEdit={() => onEdit(service)}
              onDelete={() => onDelete(service._id)}
            />
          </td>
        </tr>
      ))}
    </DataTable>
  );
}

function MessagesManagement({ messages, onDelete, loading, darkMode }) {
  if (loading)
    return (
      <div className="text-center py-12 text-gray-400">Loading messages...</div>
    );
  return (
    <DataTable
      title="Contact Messages"
      columns={["Sender & Message", "Date", "Actions"]}
      darkMode={darkMode}
    >
      {messages.length === 0 ? (
        <tr>
          <td colSpan="3" className="px-5 py-8 text-center text-gray-500">
            No messages found.
          </td>
        </tr>
      ) : (
        messages.map((message) => (
          <tr
            key={message._id}
            className={`border-t ${darkMode ? "border-white/10" : "border-black/10"}`}
          >
            <td className="px-5 py-4">
              <p
                className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {message.name}
              </p>
              <p className="text-xs text-gray-400">
                {message.email} | {message.phone}
              </p>
              <p
                className={`text-xs p-2 mt-2 border-l-2 border-primary ${darkMode ? "bg-white/5 text-gray-300" : "bg-black/5 text-gray-700"}`}
              >
                {message.message}
              </p>
            </td>
            <td className="px-5 py-4 text-xs text-gray-500">
              {new Date(message.createdAt).toLocaleDateString()}
            </td>
            <td className="px-5 py-4">
              <button
                onClick={() => onDelete(message._id)}
                className="p-2.5 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all"
              >
                <FaRegTrashAlt size={14} />
              </button>
            </td>
          </tr>
        ))
      )}
    </DataTable>
  );
}

function SettingsPanel({ darkMode }) {
  return (
    <div
      className={`border p-6 max-w-md ${darkMode ? "border-white/10 bg-white/[0.04]" : "border-black/10 bg-white"}`}
    >
      <h2
        className={`text-lg font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
      >
        Website Identity
      </h2>
      <div className="space-y-4">
        <label className="block text-xs uppercase text-gray-400">
          Studio Name{" "}
          <input
            defaultValue="Arcforma Studio"
            className={`w-full mt-1 p-2.5 text-sm border ${darkMode ? "bg-black/30 border-white/10 text-white" : "bg-gray-50 border-black/10 text-gray-900"}`}
          />
        </label>
        <label className="block text-xs uppercase text-gray-400">
          Contact Email{" "}
          <input
            defaultValue="arcforma@gmail.com"
            className={`w-full mt-1 p-2.5 text-sm border ${darkMode ? "bg-black/30 border-white/10 text-white" : "bg-gray-50 border-black/10 text-gray-900"}`}
          />
        </label>
      </div>
    </div>
  );
}

function DataTable({
  title,
  columns,
  actionLabel,
  darkMode,
  onActionClick,
  children,
}) {
  return (
    <div
      className={`border shadow-xl overflow-hidden ${darkMode ? "border-white/10 bg-white/[0.04]" : "border-black/10 bg-white"}`}
    >
      <div
        className={`flex justify-between items-center px-5 py-4 border-b ${darkMode ? "border-white/10" : "border-black/10"}`}
      >
        <h2
          className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
        >
          {title}
        </h2>
        {actionLabel && (
          <button
            onClick={onActionClick}
            className="bg-primary text-dark px-4 py-2 text-xs font-bold tracking-widest flex items-center gap-2"
          >
            <FaPlus /> {actionLabel}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[600px]">
          <thead
            className={`text-[10px] uppercase tracking-wider ${darkMode ? "bg-black/40 text-gray-400" : "bg-gray-100 text-gray-600"}`}
          >
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-5 py-3">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function ActionButtons({ darkMode, onEdit, onDelete }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onEdit}
        className={`p-2 border transition-all ${darkMode ? "border-white/10 text-gray-300 hover:border-primary hover:text-primary" : "border-black/10 text-gray-700 hover:border-primary hover:text-primary"}`}
        title="Edit"
      >
        <FaEdit size={13} />
      </button>
      <button
        onClick={onDelete}
        className={`p-2 border transition-all ${darkMode ? "border-white/10 text-gray-300 hover:border-red-400 hover:text-red-400" : "border-black/10 text-gray-700 hover:border-red-500 hover:text-red-500"}`}
        title="Delete"
      >
        <FaRegTrashAlt size={13} />
      </button>
    </div>
  );
}
