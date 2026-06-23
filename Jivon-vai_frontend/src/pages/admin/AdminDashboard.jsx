import React, { useMemo, useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import axios from "axios";
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

  // Database live states
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [dbMessages, setDbMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal controls
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editItem, setEditItem] = useState(null);

  // Live Selected Asset States
  const [coverFile, setCoverFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [videoFile, setVideoFile] = useState(null);

  // Form Inputs
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    featured: false,
  });

  // 📋 PROJECT SHEET এর নতুন ৪টি স্টেট (ফিক্সড)
  const [clientText, setClientText] = useState("");
  const [locationText, setLocationText] = useState("");
  const [yearText, setYearText] = useState("");
  const [scaleText, setScaleText] = useState("");

  // Gallery view mappings
  const galleryItems = useMemo(() => {
    return projects.reduce((acc, p) => {
      if (p.images && p.images.length > 0) {
        p.images.forEach((img, idx) => {
          acc.push({
            id: `${p._id}-${idx}`,
            title: `${p.title} (View ${idx + 1})`,
            category: p.category,
            image: img,
          });
        });
      }
      return acc;
    }, []);
  }, [projects]);

  // Synchronize with database
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const resProj = await fetch("http://localhost:5000/api/projects");
        const dataProj = await resProj.json();
        if (dataProj.success) setProjects(dataProj.data || []);

        const resServ = await fetch("http://localhost:5000/api/services");
        const dataServ = await resServ.json();
        if (dataServ.success) setServices(dataServ.data || []);

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

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/contact/contacts/${messageId}`,
          { method: "DELETE" },
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

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setEditItem(item);
    setCoverFile(null);
    setGalleryFiles([]);
    setVideoFile(null);

    if (item) {
      setFormData({
        title: item.title || "",
        category: item.category || "",
        description: item.description || "",
        featured: item.featured || false,
      });
      // এডিট করার সময় আগের ডাটা লোড হবে
      setClientText(item.client || "");
      setLocationText(item.location || "");
      setYearText(item.year || "");
      setScaleText(item.scale || "");
    } else {
      setFormData({
        title: "",
        category: "",
        description: "",
        featured: false,
      });
      setClientText("");
      setLocationText("");
      setYearText("");
      setScaleText("");
    }
    setModalOpen(true);
  };

  const handleGallerySelection = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setGalleryFiles(selectedFiles);
    }
  };

  const handleRemoveSelectedImage = (index) => {
    setGalleryFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const isProject = modalType === "Project" || modalType === "Gallery";

    if (!isProject) {
      const apiUrl = "http://localhost:5000/api/services";
      const method = editItem ? "PUT" : "POST";
      const url = editItem
        ? `${apiUrl}/${editItem._id || editItem.id}`
        : apiUrl;
      try {
        const response = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const resData = await response.json();
        if (resData.success) {
          if (editItem) {
            setServices((prev) =>
              prev.map((s) => (s._id === editItem._id ? resData.data : s)),
            );
          } else {
            setServices((prev) => [resData.data, ...prev]);
          }
          alert("Service saved successfully!");
          setModalOpen(false);
        }
      } catch (err) {
        alert("Server error!");
      }
      return;
    }

    if (!editItem && !coverFile) {
      alert("Error: Project Cover Photo is required to publish a new project!");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("category", formData.category);
    data.append("description", formData.description);
    data.append("featured", formData.featured);

    // 📋 ক্লায়েন্ট ও অন্যান্য টেক্সট ডাটা FormData তে পুশ করা হলো
    data.append("client", clientText);
    data.append("location", locationText);
    data.append("year", yearText);
    data.append("scale", scaleText);

    if (coverFile) data.append("coverImage", coverFile);
    if (galleryFiles.length > 0) {
      galleryFiles.forEach((file) => data.append("images", file));
    }
    if (videoFile) data.append("videoFile", videoFile);

    const url = editItem
      ? `http://localhost:5000/api/projects/${editItem._id || editItem.id}`
      : "http://localhost:5000/api/projects";
    const method = editItem ? "put" : "post";

    try {
      const res = await axios({
        method: method,
        url: url,
        data: data,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        // রিয়েলটাইম ডাটা রিফ্রেশ
        const resProj = await fetch("http://localhost:5000/api/projects");
        const dataProj = await resProj.json();
        if (dataProj.success) setProjects(dataProj.data || []);

        alert("Project uploaded/updated successfully with all media!");
        setModalOpen(false);
      }
    } catch (error) {
      console.error("Upload error response:", error.response?.data);
      const backendMessage =
        error.response?.data?.message || "Check file sizes or format.";
      alert(`Upload failed: ${backendMessage}`);
    }
  };

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
          alert(`${type} successfully deleted!`);
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
                <FaSignOutAlt size={15} /> Logout
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
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
                    onAddClick={() => handleOpenModal("Project")}
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

      {/* মোডাল ফর্ম */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div
            className={`w-full max-w-4xl p-6 border shadow-2xl my-8 ${darkMode ? "bg-[#090909] border-white/10 text-white" : "bg-white border-black/10 text-gray-900"}`}
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

            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side Texts */}
                <div className="space-y-4">
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

                  {/* 📋 নতুন প্রোজেক্ট শিট ইনপুট এরিয়া (ফিক্সড) */}
                  {modalType === "Project" && (
                    <div className="p-4 border border-dashed border-primary/20 bg-primary/[0.02] space-y-3">
                      <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                        Project Sheet Information
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="text-[10px] uppercase text-gray-400">
                          Client
                          <input
                            type="text"
                            value={clientText}
                            onChange={(e) => setClientText(e.target.value)}
                            placeholder="e.g. Arcforma"
                            className={`w-full mt-1 p-2 text-xs border ${darkMode ? "bg-black/60 border-white/10 text-white" : "bg-gray-100 border-black/10"}`}
                          />
                        </label>
                        <label className="text-[10px] uppercase text-gray-400">
                          Location
                          <input
                            type="text"
                            value={locationText}
                            onChange={(e) => setLocationText(e.target.value)}
                            placeholder="e.g. Dhaka"
                            className={`w-full mt-1 p-2 text-xs border ${darkMode ? "bg-black/60 border-white/10 text-white" : "bg-gray-100 border-black/10"}`}
                          />
                        </label>
                        <label className="text-[10px] uppercase text-gray-400">
                          Year
                          <input
                            type="text"
                            value={yearText}
                            onChange={(e) => setYearText(e.target.value)}
                            placeholder="e.g. 2026"
                            className={`w-full mt-1 p-2 text-xs border ${darkMode ? "bg-black/60 border-white/10 text-white" : "bg-gray-100 border-black/10"}`}
                          />
                        </label>
                        <label className="text-[10px] uppercase text-gray-400">
                          Scale
                          <input
                            type="text"
                            value={scaleText}
                            onChange={(e) => setScaleText(e.target.value)}
                            placeholder="e.g. 1500 Sft"
                            className={`w-full mt-1 p-2 text-xs border ${darkMode ? "bg-black/60 border-white/10 text-white" : "bg-gray-100 border-black/10"}`}
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {(modalType === "Service" || modalType === "Project") && (
                    <label className="block text-xs uppercase tracking-widest text-gray-400">
                      Description
                      <textarea
                        required
                        rows="3"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className={`w-full mt-1 p-2.5 text-sm border focus:outline-none focus:border-primary ${darkMode ? "bg-black/40 border-white/10 text-white" : "bg-gray-50 border-black/10 text-gray-900"}`}
                      />
                    </label>
                  )}
                </div>

                {/* Right Side Assets Section */}
                {(modalType === "Project" || modalType === "Gallery") && (
                  <div className="p-5 bg-black/20 border border-white/5 rounded-lg space-y-5">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">
                        1. Project Cover Photo{" "}
                        {!editItem && <span className="text-red-500">*</span>}
                      </label>
                      {editItem?.coverImage && !coverFile && (
                        <div className="mb-2 relative w-24 h-16 border border-white/10">
                          <img
                            src={editItem.coverImage}
                            alt="Current"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setCoverFile(
                            e.target.files ? e.target.files[0] : null,
                          )
                        }
                        className={`w-full text-xs text-gray-400 border p-2 ${darkMode ? "bg-black/40 border-white/10" : "bg-gray-50 border-black/10"}`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">
                        2. Gallery Images
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGallerySelection}
                        className={`w-full text-xs text-gray-400 border p-2 ${darkMode ? "bg-black/40 border-white/10" : "bg-gray-50 border-black/10"}`}
                      />
                      {galleryFiles.length > 0 && (
                        <div className="mt-2 p-2 bg-black/30 rounded border border-white/5 max-h-[110px] overflow-y-auto space-y-1">
                          {galleryFiles.map((file, i) => (
                            <div
                              key={i}
                              className="flex justify-between items-center text-[11px] text-gray-400"
                            >
                              <span className="truncate flex-1">
                                ✓ {file.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSelectedImage(i)}
                                className="text-red-500 hover:text-red-400 ml-2"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">
                        3. Project Video File
                      </label>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          setVideoFile(
                            e.target.files ? e.target.files[0] : null,
                          )
                        }
                        className={`w-full text-xs text-gray-400 border p-2 ${darkMode ? "bg-black/40 border-white/10" : "bg-gray-50 border-black/10"}`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-dark font-bold text-xs tracking-widest py-3.5 hover:bg-primary-hover transition-colors shadow-lg"
              >
                SAVE & PUBLISH TO LIVE DATABASE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// নিচের বাকি DataTable, ActionButtons, DashboardHome কোডগুলো অপরিবর্তিত থাকবে...
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
      {" "}
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`border p-5 shadow-xl ${darkMode ? "border-white/10 bg-white/[0.04]" : "border-black/10 bg-white"}`}
        >
          {" "}
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            {stat.label}
          </p>{" "}
          <div className="mt-4 flex items-end justify-between">
            {" "}
            <span
              className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              {stat.value}
            </span>{" "}
            <span className="text-[11px] text-primary font-medium">
              {stat.change}
            </span>{" "}
          </div>{" "}
        </div>
      ))}{" "}
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
      {" "}
      {projects.map((project) => (
        <tr
          key={project._id}
          className={`border-t ${darkMode ? "border-white/10" : "border-black/10"}`}
        >
          {" "}
          <td className="px-5 py-4 flex items-center gap-3">
            {" "}
            <img
              src={project.coverImage || "/img/projects/p1.jpg"}
              alt=""
              className="h-10 w-14 object-cover border border-white/10"
            />{" "}
            <span
              className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              {project.title}
            </span>{" "}
          </td>{" "}
          <td
            className={`px-5 py-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            {project.category}
          </td>{" "}
          <td className="px-5 py-4">
            {" "}
            <ActionButtons
              darkMode={darkMode}
              onEdit={() => onEdit(project)}
              onDelete={() => onDelete(project._id)}
            />{" "}
          </td>{" "}
        </tr>
      ))}{" "}
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
      {" "}
      <div
        className={`flex justify-between items-center border-b pb-4 ${darkMode ? "border-white/10" : "border-black/10"}`}
      >
        {" "}
        <h2
          className={`text-lg font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
        >
          Gallery Collection
        </h2>{" "}
        <button
          onClick={onAddClick}
          className="bg-primary text-dark px-4 py-2.5 text-xs font-bold tracking-widest flex items-center gap-2"
        >
          <FaPlus /> UPLOAD IMAGE
        </button>{" "}
      </div>{" "}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {" "}
        {galleryItems.map((item) => (
          <div
            key={item.id}
            className={`border overflow-hidden shadow-sm ${darkMode ? "border-white/10 bg-white/[0.04]" : "border-black/10 bg-white"}`}
          >
            {" "}
            <img
              src={item.image}
              alt=""
              className="h-40 w-full object-cover"
            />{" "}
            <div className="p-4">
              {" "}
              <p
                className={`font-semibold text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {item.title}
              </p>{" "}
              <p className="text-xs text-gray-500 mt-1">{item.category}</p>{" "}
              <div className="mt-4">
                {" "}
                <ActionButtons
                  darkMode={darkMode}
                  onEdit={() => onEdit(item)}
                  onDelete={() => onDelete(item.id.split("-")[0])}
                />{" "}
              </div>{" "}
            </div>{" "}
          </div>
        ))}{" "}
      </div>{" "}
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
      {" "}
      {services.map((service) => (
        <tr
          key={service._id}
          className={`border-t ${darkMode ? "border-white/10" : "border-black/10"}`}
        >
          {" "}
          <td
            className={`px-5 py-4 font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            {service.title}
          </td>{" "}
          <td
            className={`px-5 py-4 text-xs max-w-sm truncate ${darkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            {service.description}
          </td>{" "}
          <td className="px-5 py-4">
            {" "}
            <ActionButtons
              darkMode={darkMode}
              onEdit={() => onEdit(service)}
              onDelete={() => onDelete(service._id)}
            />{" "}
          </td>{" "}
        </tr>
      ))}{" "}
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
      {" "}
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
            {" "}
            <td className="px-5 py-4">
              {" "}
              <p
                className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {message.name}
              </p>{" "}
              <p className="text-xs text-gray-400">
                {message.email} | {message.phone}
              </p>{" "}
              <p
                className={`text-xs p-2 mt-2 border-l-2 border-primary ${darkMode ? "bg-white/5 text-gray-300" : "bg-black/5 text-gray-700"}`}
              >
                {message.message}
              </p>{" "}
            </td>{" "}
            <td className="px-5 py-4 text-xs text-gray-500">
              {new Date(message.createdAt).toLocaleDateString()}
            </td>{" "}
            <td className="px-5 py-4">
              {" "}
              <button
                onClick={() => onDelete(message._id)}
                className="p-2.5 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all"
              >
                <FaRegTrashAlt size={14} />
              </button>{" "}
            </td>{" "}
          </tr>
        ))
      )}{" "}
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
          Studio Name
          <input
            defaultValue="Arcforma Studio"
            className={`w-full mt-1 p-2.5 text-sm border ${darkMode ? "bg-black/30 border-white/10 text-white" : "bg-gray-50 border-black/10 text-gray-900"}`}
          />
        </label>
        <label className="block text-xs uppercase text-gray-400">
          Contact Email
          <input
            defaultValue="contact@arcforma.com"
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
      {" "}
      <div
        className={`flex justify-between items-center px-5 py-4 border-b ${darkMode ? "border-white/10" : "border-black/10"}`}
      >
        {" "}
        <h2
          className={`text-base font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
        >
          {title}
        </h2>{" "}
        {actionLabel && (
          <button
            onClick={onActionClick}
            className="bg-primary text-dark px-4 py-2 text-xs font-bold tracking-widest flex items-center gap-2"
          >
            <FaPlus /> {actionLabel}
          </button>
        )}{" "}
      </div>{" "}
      <div className="overflow-x-auto">
        {" "}
        <table className="w-full text-left text-sm min-w-[600px]">
          {" "}
          <thead
            className={`text-[10px] uppercase tracking-wider ${darkMode ? "bg-black/40 text-gray-400" : "bg-gray-100 text-gray-600"}`}
          >
            {" "}
            <tr>
              {" "}
              {columns.map((col) => (
                <th key={col} className="px-5 py-3">
                  {col}
                </th>
              ))}{" "}
            </tr>{" "}
          </thead>{" "}
          <tbody>{children}</tbody>{" "}
        </table>{" "}
      </div>{" "}
    </div>
  );
}
function ActionButtons({ darkMode, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-2">
      {" "}
      <button
        onClick={onEdit}
        className={`px-3 py-1 text-xs border ${darkMode ? "border-white/10 text-white hover:bg-white/10" : "border-black/10 text-gray-900 hover:bg-black/5"} transition-colors`}
      >
        Edit
      </button>{" "}
      <button
        onClick={onDelete}
        className="px-3 py-1 text-xs border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
      >
        Delete
      </button>{" "}
    </div>
  );
}
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
        <p className="text-gray-900">{message}</p>
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
