import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  FaBars,
  FaChartLine,
  FaCheckCircle,
  FaCog,
  FaEnvelopeOpenText,
  FaExclamationTriangle,
  FaEye,
  FaImages,
  FaMoon,
  FaPlus,
  FaProjectDiagram,
  FaRedo,
  FaRegTrashAlt,
  FaSearch,
  FaSignOutAlt,
  FaSun,
  FaTimes,
  FaTools,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: FaChartLine },
  { id: "projects", label: "Projects", icon: FaProjectDiagram },
  { id: "gallery", label: "Gallery", icon: FaImages },
  { id: "services", label: "Services", icon: FaTools },
  { id: "messages", label: "Contact Messages", icon: FaEnvelopeOpenText },
  { id: "settings", label: "Settings", icon: FaCog },
];

const projectCategories = [
  "Residential",
  "Commercial",
  "Interior",
  "Exterior",
  "Planning",
];

const emptyProjectForm = {
  title: "",
  category: "Residential",
  description: "",
  client: "",
  location: "",
  year: "",
  scale: "",
  area: "",
  projectType: "",
  status: "Published",
  featured: false,
};

const emptyServiceForm = {
  title: "",
  description: "",
};

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Request failed. Please try again.");
  }

  return data;
}

function authHeaders(extra = {}) {
  const stored =
    JSON.parse(localStorage.getItem("arcforma_admin_auth") || "null") ||
    JSON.parse(sessionStorage.getItem("arcforma_admin_auth") || "null");
  const token = stored?.token;
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

export default function AdminDashboard() {
  const { section = "dashboard" } = useParams();
  const navigate = useNavigate();
  const { admin, token, signOut, initialized } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const activeItem = navItems.find((item) => item.id === section);

  const galleryItems = useMemo(
    () =>
      projects.flatMap((project) => {
        const media = [
          ...(project.images || []),
          ...(project.renderImages || []),
          ...(project.floorPlans || []),
        ];

        return media.map((image, index) => ({
          id: `${project._id}-${index}`,
          projectId: project._id,
          title: `${project.title} - View ${index + 1}`,
          category: project.category,
          image,
          project,
        }));
      }),
    [projects],
  );

  const stats = useMemo(
    () => [
      {
        label: "Projects",
        value: projects.length,
        detail: `${projects.filter((item) => item.featured).length} featured`,
      },
      {
        label: "Gallery Assets",
        value: galleryItems.length,
        detail: "Project image library",
      },
      {
        label: "Services",
        value: services.length,
        detail: "Live service cards",
      },
      {
        label: "Messages",
        value: messages.length,
        detail: `${messages.length ? "Needs review" : "Inbox clear"}`,
      },
    ],
    [galleryItems.length, messages.length, projects, services.length],
  );

  const filteredProjects = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter((item) =>
      [item.title, item.category, item.client, item.location]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [projects, query]);

  const filteredServices = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return services;
    return services.filter((item) =>
      [item.title, item.description].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(term),
      ),
    );
  }, [services, query]);

  const filteredMessages = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return messages;
    return messages.filter((item) =>
      [item.name, item.email, item.phone, item.interest, item.message]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [messages, query]);

  const filteredGallery = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return galleryItems;
    return galleryItems.filter((item) =>
      [item.title, item.category].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(term),
      ),
    );
  }, [galleryItems, query]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [projectPayload, servicePayload, messagePayload] =
        await Promise.all([
          fetch(`${API_BASE_URL}/projects`, { headers: authHeaders() }).then(
            parseResponse,
          ),
          fetch(`${API_BASE_URL}/services`, { headers: authHeaders() }).then(
            parseResponse,
          ),
          fetch(`${API_BASE_URL}/contact/contacts`, {
            headers: authHeaders(),
          }).then(parseResponse),
        ]);

      setProjects(projectPayload.data || []);
      setServices(servicePayload.data || []);
      setMessages(messagePayload.data || messagePayload.messages || []);
    } catch (requestError) {
      setError(requestError.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!initialized) {
    return null;
  }

  if (!activeItem) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  const showToast = (type, message) => setToast({ type, message });

  const openProjectModal = (project = null) => {
    setModal({
      type: "project",
      title: project ? "Edit Project" : "Add Project",
      item: project,
      data: project
        ? {
            title: project.title || "",
            category: project.category || "Residential",
            description: project.description || "",
            client: project.client || "",
            location: project.location || "",
            year: project.year || "",
            scale: project.scale || "",
            area: project.area || "",
            projectType: project.projectType || "",
            status: project.status || "Published",
            featured: Boolean(project.featured),
          }
        : emptyProjectForm,
      coverFile: null,
      galleryFiles: [],
      renderFiles: [],
      floorPlanFiles: [],
      videoFiles: [],
      videoFile: null,
    });
  };

  const openServiceModal = (service = null) => {
    setModal({
      type: "service",
      title: service ? "Edit Service" : "Add Service",
      item: service,
      data: service
        ? {
            title: service.title || "",
            description: service.description || "",
          }
        : emptyServiceForm,
    });
  };

  const updateModalData = (name, value) => {
    setModal((prev) => ({
      ...prev,
      data: { ...prev.data, [name]: value },
    }));
  };

  const updateModalFiles = (name, files) => {
    setModal((prev) => ({
      ...prev,
      [name]: files,
    }));
  };

  const saveProject = async () => {
    if (!modal.item && !modal.coverFile) {
      showToast("error", "A cover image is required for new projects.");
      return;
    }

    const payload = new FormData();
    Object.entries(modal.data).forEach(([key, value]) => {
      payload.append(key, value);
    });

    if (modal.coverFile) payload.append("coverImage", modal.coverFile);
    modal.galleryFiles.forEach((file) => payload.append("images", file));
    modal.renderFiles.forEach((file) => payload.append("renderImages", file));
    modal.floorPlanFiles.forEach((file) => payload.append("floorPlans", file));
    modal.videoFiles.forEach((file) => payload.append("videos", file));
    if (modal.videoFile) payload.append("videoFile", modal.videoFile);

    const id = modal.item?._id;
    const response = await fetch(
      `${API_BASE_URL}/projects${id ? `/${id}` : ""}`,
      {
        method: id ? "PUT" : "POST",
        headers: authHeaders(),
        body: payload,
      },
    );
    await parseResponse(response);
  };

  const saveService = async () => {
    const id = modal.item?._id;
    const response = await fetch(
      `${API_BASE_URL}/services${id ? `/${id}` : ""}`,
      {
        method: id ? "PUT" : "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(modal.data),
      },
    );
    await parseResponse(response);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (modal.type === "project") {
        await saveProject();
        showToast("success", "Project saved successfully.");
      } else {
        await saveService();
        showToast("success", "Service saved successfully.");
      }

      setModal(null);
      await loadDashboardData();
    } catch (requestError) {
      showToast("error", requestError.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (label, onConfirm) => {
    setConfirmAction({ label, onConfirm });
  };

  const handleDelete = async (resource, id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${resource}/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      await parseResponse(response);
      showToast("success", "Item deleted successfully.");
      await loadDashboardData();
    } catch (requestError) {
      showToast("error", requestError.message || "Delete failed.");
    } finally {
      setConfirmAction(null);
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact/contacts/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      await parseResponse(response);
      showToast("success", "Message deleted successfully.");
      await loadDashboardData();
    } catch (requestError) {
      showToast("error", requestError.message || "Delete failed.");
    } finally {
      setConfirmAction(null);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/admin");
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "bg-[#070707] text-gray-100" : "bg-[#f4f0e8] text-gray-950"
      }`}
    >
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 border-r transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } ${
            darkMode
              ? "border-white/10 bg-[#090909]/95"
              : "border-black/10 bg-white/95"
          } backdrop-blur-2xl`}
        >
          <div className="flex h-full flex-col">
            <div
              className={`flex items-center justify-between border-b px-6 py-5 ${
                darkMode ? "border-white/10" : "border-black/10"
              }`}
            >
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/img/logo.png"
                  alt="Jivon Vai Studio"
                  className="h-12 w-12 rounded-full border border-primary/50 object-cover shadow-lg"
                />
                <div>
                  <p className="font-heading text-[10px] font-bold uppercase tracking-[0.28em] text-primary">
                    Jivon Vai
                  </p>
                  <p
                    className={`font-heading text-sm font-bold ${
                      darkMode ? "text-white" : "text-gray-950"
                    }`}
                  >
                    Admin Studio
                  </p>
                </div>
              </Link>
              <button
                type="button"
                className="p-2 text-gray-400 transition-colors hover:text-primary lg:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <FaTimes />
              </button>
            </div>

            <nav className="flex-1 space-y-2 px-4 py-6">
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
                        ? "bg-primary text-dark shadow-lg shadow-primary/10"
                        : darkMode
                          ? "text-gray-400 hover:bg-white/5 hover:text-white"
                          : "text-gray-600 hover:bg-black/5 hover:text-gray-950"
                    }`}
                  >
                    <Icon size={15} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div
              className={`border-t p-4 ${
                darkMode ? "border-white/10" : "border-black/10"
              }`}
            >
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-400 transition-colors hover:text-red-400"
              >
                <FaSignOutAlt size={15} />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
        )}

        <div className="min-w-0 flex-1">
          <header
            className={`sticky top-0 z-30 border-b backdrop-blur-xl ${
              darkMode
                ? "border-white/10 bg-black/55"
                : "border-black/10 bg-white/75"
            }`}
          >
            <div className="flex flex-col gap-4 px-5 py-4 sm:px-8 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className={`flex h-10 w-10 items-center justify-center border lg:hidden ${
                    darkMode
                      ? "border-white/10 text-white"
                      : "border-black/10 text-gray-950"
                  }`}
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <FaBars />
                </button>
                <div>
                  <p className="font-heading text-[10px] font-bold uppercase tracking-[0.32em] text-primary">
                    Jivon Vai Workspace
                  </p>
                  <h1
                    className={`font-heading text-xl font-bold sm:text-2xl ${
                      darkMode ? "text-white" : "text-gray-950"
                    }`}
                  >
                    {activeItem.label}
                  </h1>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label
                  className={`flex h-11 min-w-[240px] items-center gap-3 border px-4 ${
                    darkMode
                      ? "border-white/10 bg-white/5"
                      : "border-black/10 bg-white"
                  }`}
                >
                  <FaSearch className="text-gray-500" size={13} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search admin data..."
                    className={`w-full bg-transparent text-sm outline-none ${
                      darkMode
                        ? "text-white placeholder:text-gray-600"
                        : "text-gray-950 placeholder:text-gray-500"
                    }`}
                  />
                </label>

                <button
                  type="button"
                  onClick={loadDashboardData}
                  className={`flex h-11 items-center justify-center gap-2 border px-4 text-xs font-bold tracking-widest transition-colors ${
                    darkMode
                      ? "border-white/10 bg-white/5 text-white hover:border-primary"
                      : "border-black/10 bg-white text-gray-950 hover:border-primary"
                  }`}
                >
                  <FaRedo size={12} />
                  REFRESH
                </button>

                <button
                  type="button"
                  onClick={() => setDarkMode((value) => !value)}
                  className={`flex h-11 items-center justify-center gap-2 border px-4 text-xs font-bold tracking-widest transition-colors ${
                    darkMode
                      ? "border-white/10 bg-white/5 text-white hover:border-primary"
                      : "border-black/10 bg-white text-gray-950 hover:border-primary"
                  }`}
                >
                  {darkMode ? <FaMoon size={13} /> : <FaSun size={13} />}
                  {darkMode ? "DARK" : "LIGHT"}
                </button>
              </div>
            </div>
          </header>

          <main className="min-h-[calc(100vh-80px)] bg-[radial-gradient(circle_at_78%_0%,rgba(239,224,189,0.12),transparent_24rem)] p-5 sm:p-8">
            {loading ? (
              <LoadingState darkMode={darkMode} />
            ) : error ? (
              <ErrorState message={error} onRetry={loadDashboardData} />
            ) : (
              <>
                {section === "dashboard" && (
                  <DashboardHome
                    stats={stats}
                    projects={filteredProjects}
                    messages={filteredMessages}
                    darkMode={darkMode}
                    onAddProject={() => openProjectModal()}
                    onAddService={() => openServiceModal()}
                  />
                )}
                {section === "projects" && (
                  <ProjectsManagement
                    projects={filteredProjects}
                    darkMode={darkMode}
                    onAdd={() => openProjectModal()}
                    onEdit={openProjectModal}
                    onDelete={(project) =>
                      requestDelete(project.title, () =>
                        handleDelete("projects", project._id),
                      )
                    }
                  />
                )}
                {section === "gallery" && (
                  <GalleryManagement
                    galleryItems={filteredGallery}
                    darkMode={darkMode}
                    onAdd={() => openProjectModal()}
                    onEdit={(item) => openProjectModal(item.project)}
                    onDelete={(item) =>
                      requestDelete(item.title, () =>
                        handleDelete("projects", item.projectId),
                      )
                    }
                  />
                )}
                {section === "services" && (
                  <ServicesManagement
                    services={filteredServices}
                    darkMode={darkMode}
                    onAdd={() => openServiceModal()}
                    onEdit={openServiceModal}
                    onDelete={(service) =>
                      requestDelete(service.title, () =>
                        handleDelete("services", service._id),
                      )
                    }
                  />
                )}
                {section === "messages" && (
                  <MessagesManagement
                    messages={filteredMessages}
                    darkMode={darkMode}
                    onDelete={(message) =>
                      requestDelete(message.name, () =>
                        handleDeleteMessage(message._id),
                      )
                    }
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

      {modal && (
        <EditorModal
          modal={modal}
          darkMode={darkMode}
          saving={saving}
          onClose={() => setModal(null)}
          onSubmit={handleSave}
          onDataChange={updateModalData}
          onFilesChange={updateModalFiles}
        />
      )}

      {confirmAction && (
        <ConfirmDialog
          label={confirmAction.label}
          darkMode={darkMode}
          onCancel={() => setConfirmAction(null)}
          onConfirm={confirmAction.onConfirm}
        />
      )}

      {toast && <Toast toast={toast} />}
    </div>
  );
}

function DashboardHome({
  stats,
  projects,
  messages,
  darkMode,
  onAddProject,
  onAddService,
}) {
  return (
    <div className="space-y-8">
      <StatsGrid stats={stats} darkMode={darkMode} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Panel
            title="Recent Projects"
            subtitle="Latest published database entries"
            actionLabel="Add Project"
            onAction={onAddProject}
            darkMode={darkMode}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <TableHead
                  columns={["Project", "Category", "Meta", "Status"]}
                  darkMode={darkMode}
                />
                <tbody>
                  {projects.slice(0, 6).map((project) => (
                    <tr key={project._id} className={rowClass(darkMode)}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={project.coverImage}
                            alt={project.title}
                            className="h-12 w-16 border border-white/10 object-cover"
                          />
                          <div>
                            <p className={textClass(darkMode, "font-medium")}>
                              {project.title}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {project.location || "No location"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className={cellMutedClass(darkMode)}>
                        {project.category}
                      </td>
                      <td className={cellMutedClass(darkMode)}>
                        {project.year || "Draft meta"}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge
                          label={project.featured ? "Featured" : "Published"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <Panel
          title="Command Center"
          subtitle="Quick publishing actions"
          darkMode={darkMode}
        >
          <div className="space-y-3">
            <QuickAction
              label="Create project"
              detail="Upload cover, gallery and metadata"
              onClick={onAddProject}
            />
            <QuickAction
              label="Create service"
              detail="Add a new service card"
              onClick={onAddService}
            />
            <QuickAction
              label="Review inbox"
              detail={`${messages.length} messages visible`}
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ProjectsManagement({ projects, darkMode, onAdd, onEdit, onDelete }) {
  return (
    <Panel
      title="Projects Management"
      subtitle="Create, update and remove website projects"
      actionLabel="Add Project"
      onAction={onAdd}
      darkMode={darkMode}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <TableHead
            columns={["Project", "Category", "Client", "Year", "Actions"]}
            darkMode={darkMode}
          />
          <tbody>
            {projects.map((project) => (
              <tr key={project._id} className={rowClass(darkMode)}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="h-12 w-16 border border-white/10 object-cover"
                    />
                    <div>
                      <p className={textClass(darkMode, "font-medium")}>
                        {project.title}
                      </p>
                      <p className="mt-1 max-w-[300px] truncate text-xs text-gray-500">
                        {project.description || "No description"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className={cellMutedClass(darkMode)}>{project.category}</td>
                <td className={cellMutedClass(darkMode)}>
                  {project.client || "Not set"}
                </td>
                <td className={cellMutedClass(darkMode)}>
                  {project.year || "Not set"}
                </td>
                <td className="px-5 py-4">
                  <ActionButtons
                    darkMode={darkMode}
                    onView={() =>
                      window.open(`/project/${project._id}`, "_blank")
                    }
                    onEdit={() => onEdit(project)}
                    onDelete={() => onDelete(project)}
                  />
                </td>
              </tr>
            ))}
            {!projects.length && (
              <EmptyTableRow colSpan={5} label="No projects found." />
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function GalleryManagement({
  galleryItems,
  darkMode,
  onAdd,
  onEdit,
  onDelete,
}) {
  return (
    <Panel
      title="Gallery Management"
      subtitle="Manage gallery images from project records"
      actionLabel="Upload Images"
      onAction={onAdd}
      darkMode={darkMode}
    >
      {galleryItems.length ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className={`overflow-hidden border ${
                darkMode
                  ? "border-white/10 bg-white/[0.04]"
                  : "border-black/10 bg-white"
              }`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-44 w-full object-cover"
              />
              <div className="p-4">
                <p className={textClass(darkMode, "truncate font-medium")}>
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-gray-500">{item.category}</p>
                <div className="mt-4">
                  <ActionButtons
                    darkMode={darkMode}
                    onView={() => window.open(item.image, "_blank")}
                    onEdit={() => onEdit(item)}
                    onDelete={() => onDelete(item)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState label="No gallery images found." />
      )}
    </Panel>
  );
}

function ServicesManagement({ services, darkMode, onAdd, onEdit, onDelete }) {
  return (
    <Panel
      title="Services Management"
      subtitle="Maintain the services displayed on the website"
      actionLabel="Add Service"
      onAction={onAdd}
      darkMode={darkMode}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <TableHead
            columns={["Service", "Description", "Status", "Actions"]}
            darkMode={darkMode}
          />
          <tbody>
            {services.map((service) => (
              <tr key={service._id} className={rowClass(darkMode)}>
                <td className={cellTextClass(darkMode)}>{service.title}</td>
                <td className={`${cellMutedClass(darkMode)} max-w-xl`}>
                  <span className="line-clamp-2">{service.description}</span>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge label="Active" />
                </td>
                <td className="px-5 py-4">
                  <ActionButtons
                    darkMode={darkMode}
                    onEdit={() => onEdit(service)}
                    onDelete={() => onDelete(service)}
                  />
                </td>
              </tr>
            ))}
            {!services.length && (
              <EmptyTableRow colSpan={4} label="No services found." />
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function MessagesManagement({ messages, darkMode, onDelete }) {
  return (
    <Panel
      title="Contact Messages"
      subtitle="Review and clean up website enquiries"
      darkMode={darkMode}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <TableHead
            columns={["Sender", "Interest", "Message", "Date", "Action"]}
            darkMode={darkMode}
          />
          <tbody>
            {messages.map((message) => (
              <tr key={message._id} className={rowClass(darkMode)}>
                <td className="px-5 py-4">
                  <p className={textClass(darkMode, "font-medium")}>
                    {message.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{message.email}</p>
                  <p className="mt-1 text-xs text-gray-500">{message.phone}</p>
                </td>
                <td className={cellMutedClass(darkMode)}>
                  {message.interest || "General"}
                </td>
                <td className={`${cellMutedClass(darkMode)} max-w-md`}>
                  <span className="line-clamp-2">{message.message}</span>
                </td>
                <td className={cellMutedClass(darkMode)}>
                  {formatDate(message.createdAt)}
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => onDelete(message)}
                    className="flex h-9 w-9 items-center justify-center border border-red-500/30 text-red-400 transition-colors hover:bg-red-500 hover:text-white"
                    aria-label="Delete message"
                  >
                    <FaRegTrashAlt size={13} />
                  </button>
                </td>
              </tr>
            ))}
            {!messages.length && (
              <EmptyTableRow colSpan={5} label="No messages found." />
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function SettingsPanel({ darkMode }) {
  const { token, signOut } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "This will permanently remove the current admin account. Continue?",
      )
    ) {
      return;
    }

    setDeleting(true);
    setDeleteMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete the admin account.");
      }
      await signOut();
      window.location.assign("/admin");
    } catch (error) {
      setDeleteMessage(error.message || "Unable to delete the admin account.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Panel
        title="Studio Identity"
        subtitle="Brand and access details"
        darkMode={darkMode}
      >
        <div className="space-y-4">
          <ReadOnlyInput
            label="Studio Name"
            value="Jivon Vai Studio"
            darkMode={darkMode}
          />
          <ReadOnlyInput
            label="Contact Email"
            value="hello@jivonvai.com"
            darkMode={darkMode}
          />
          <ReadOnlyInput
            label="API Base URL"
            value={API_BASE_URL}
            darkMode={darkMode}
          />
          <ReadOnlyInput
            label="Admin Session"
            value={token ? "Logged in" : "Local session"}
            darkMode={darkMode}
          />
        </div>
      </Panel>

      <Panel
        title="Account Management"
        subtitle="Replace the current administrator safely"
        darkMode={darkMode}
      >
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full border border-red-500/30 bg-red-500/10 px-4 py-3 text-left text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting account..." : "Delete current admin account"}
          </button>
          {deleteMessage && (
            <p className="text-sm text-red-400">{deleteMessage}</p>
          )}
        </div>
      </Panel>

      <Panel
        title="Publishing Preferences"
        subtitle="Frontend management controls"
        darkMode={darkMode}
      >
        <div className="space-y-3">
          {[
            "Show featured projects",
            "Enable message notifications",
            "Use dark admin theme",
          ].map((label) => (
            <label
              key={label}
              className={`flex items-center justify-between border px-4 py-3 text-sm ${
                darkMode
                  ? "border-white/10 bg-black/25 text-gray-300"
                  : "border-black/10 bg-white text-gray-700"
              }`}
            >
              {label}
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 accent-primary"
              />
            </label>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function EditorModal({
  modal,
  darkMode,
  saving,
  onClose,
  onSubmit,
  onDataChange,
  onFilesChange,
}) {
  const isProject = modal.type === "project";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
      <div
        className={`my-8 w-full max-w-5xl border shadow-2xl ${
          darkMode
            ? "border-white/10 bg-[#090909] text-white"
            : "border-black/10 bg-white text-gray-950"
        }`}
      >
        <div
          className={`flex items-center justify-between border-b px-6 py-4 ${
            darkMode ? "border-white/10" : "border-black/10"
          }`}
        >
          <div>
            <p className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              Content Editor
            </p>
            <h2 className="font-heading text-xl font-bold">{modal.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 transition-colors hover:text-red-400"
            aria-label="Close modal"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <FormInput
                label={isProject ? "Project Title" : "Service Title"}
                value={modal.data.title}
                onChange={(value) => onDataChange("title", value)}
                darkMode={darkMode}
                required
              />

              {isProject ? (
                <label className="block text-xs uppercase tracking-widest text-gray-500">
                  Category
                  <select
                    value={modal.data.category}
                    onChange={(event) =>
                      onDataChange("category", event.target.value)
                    }
                    className={inputClass(darkMode)}
                  >
                    {projectCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <FormTextarea
                label="Description"
                value={modal.data.description}
                onChange={(value) => onDataChange("description", value)}
                darkMode={darkMode}
                required
              />

              {isProject && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormInput
                      label="Client"
                      value={modal.data.client}
                      onChange={(value) => onDataChange("client", value)}
                      darkMode={darkMode}
                    />
                    <FormInput
                      label="Location"
                      value={modal.data.location}
                      onChange={(value) => onDataChange("location", value)}
                      darkMode={darkMode}
                    />
                    <FormInput
                      label="Year"
                      value={modal.data.year}
                      onChange={(value) => onDataChange("year", value)}
                      darkMode={darkMode}
                    />
                    <FormInput
                      label="Scale"
                      value={modal.data.scale}
                      onChange={(value) => onDataChange("scale", value)}
                      darkMode={darkMode}
                    />
                    <FormInput
                      label="Area"
                      value={modal.data.area}
                      onChange={(value) => onDataChange("area", value)}
                      darkMode={darkMode}
                    />
                    <FormInput
                      label="Project Type"
                      value={modal.data.projectType}
                      onChange={(value) => onDataChange("projectType", value)}
                      darkMode={darkMode}
                    />
                    <FormInput
                      label="Status"
                      value={modal.data.status}
                      onChange={(value) => onDataChange("status", value)}
                      darkMode={darkMode}
                    />
                  </div>
                  <label
                    className={`flex items-center justify-between border px-4 py-3 text-sm ${
                      darkMode
                        ? "border-white/10 bg-black/25 text-gray-300"
                        : "border-black/10 bg-gray-50 text-gray-700"
                    }`}
                  >
                    Feature this project
                    <input
                      type="checkbox"
                      checked={modal.data.featured}
                      onChange={(event) =>
                        onDataChange("featured", event.target.checked)
                      }
                      className="h-4 w-4 accent-primary"
                    />
                  </label>
                </>
              )}
            </div>

            {isProject && (
              <div
                className={`space-y-5 border p-5 ${
                  darkMode
                    ? "border-white/10 bg-white/[0.03]"
                    : "border-black/10 bg-gray-50"
                }`}
              >
                <FileInput
                  label="Cover Image"
                  hint={
                    modal.item
                      ? "Leave empty to keep the current cover."
                      : "Required for new projects."
                  }
                  accept="image/*"
                  darkMode={darkMode}
                  onChange={(files) =>
                    onFilesChange("coverFile", files[0] || null)
                  }
                />

                {modal.item?.coverImage && (
                  <img
                    src={modal.item.coverImage}
                    alt="Current cover"
                    className="h-24 w-36 border border-white/10 object-cover"
                  />
                )}

                <FileInput
                  label="Gallery Images"
                  hint={`${modal.galleryFiles.length} selected. New uploads replace the gallery on update.`}
                  accept="image/*"
                  multiple
                  darkMode={darkMode}
                  onChange={(files) => onFilesChange("galleryFiles", files)}
                />

                <FileInput
                  label="Render Images"
                  hint={`${modal.renderFiles.length} selected.`}
                  accept="image/*"
                  multiple
                  darkMode={darkMode}
                  onChange={(files) => onFilesChange("renderFiles", files)}
                />

                <FileInput
                  label="Floor Plans"
                  hint={`${modal.floorPlanFiles.length} selected.`}
                  accept="image/*"
                  multiple
                  darkMode={darkMode}
                  onChange={(files) => onFilesChange("floorPlanFiles", files)}
                />

                <FileInput
                  label="Project Videos"
                  hint={`${modal.videoFiles.length} selected.`}
                  accept="video/*"
                  multiple
                  darkMode={darkMode}
                  onChange={(files) => onFilesChange("videoFiles", files)}
                />

                <FileInput
                  label="Project Video"
                  hint="Optional single video file."
                  accept="video/*"
                  darkMode={darkMode}
                  onChange={(files) =>
                    onFilesChange("videoFile", files[0] || null)
                  }
                />
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-3 text-xs font-bold tracking-widest ${
                darkMode
                  ? "border border-white/10 text-gray-300 hover:text-white"
                  : "border border-black/10 text-gray-700"
              }`}
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary px-6 py-3 text-xs font-bold tracking-widest text-dark transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "SAVING..." : "SAVE CHANGES"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatsGrid({ stats, darkMode }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`border p-5 shadow-xl ${
            darkMode
              ? "border-white/10 bg-white/[0.04]"
              : "border-black/10 bg-white"
          }`}
        >
          <p className="font-heading text-xs font-bold uppercase tracking-widest text-gray-500">
            {stat.label}
          </p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <span
              className={textClass(darkMode, "font-heading text-3xl font-bold")}
            >
              {stat.value}
            </span>
            <span className="text-right text-[11px] text-primary">
              {stat.detail}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function Panel({ title, subtitle, actionLabel, onAction, darkMode, children }) {
  return (
    <section
      className={`border shadow-xl shadow-black/10 ${
        darkMode
          ? "border-white/10 bg-white/[0.04]"
          : "border-black/10 bg-white"
      }`}
    >
      <div
        className={`flex flex-col gap-4 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
          darkMode ? "border-white/10" : "border-black/10"
        }`}
      >
        <div>
          <h2 className={textClass(darkMode, "font-heading text-lg font-bold")}>
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
        {actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="flex items-center justify-center gap-2 bg-primary px-4 py-3 text-xs font-bold tracking-widest text-dark transition-colors hover:bg-primary-hover"
          >
            <FaPlus size={12} />
            {actionLabel}
          </button>
        )}
      </div>
      <div className="p-0">{children}</div>
    </section>
  );
}

function TableHead({ columns, darkMode }) {
  return (
    <thead
      className={`font-heading text-[10px] uppercase tracking-[0.22em] ${
        darkMode ? "bg-black/35 text-gray-500" : "bg-gray-100 text-gray-600"
      }`}
    >
      <tr>
        {columns.map((column) => (
          <th key={column} className="px-5 py-4 font-bold">
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function ActionButtons({ darkMode, onView, onEdit, onDelete }) {
  const buttonClass = `flex h-9 w-9 items-center justify-center border transition-colors ${
    darkMode
      ? "border-white/10 text-gray-300 hover:border-primary hover:text-primary"
      : "border-black/10 text-gray-600 hover:border-primary hover:text-gray-950"
  }`;

  return (
    <div className="flex items-center gap-2">
      {onView && (
        <button
          type="button"
          onClick={onView}
          className={buttonClass}
          aria-label="View"
        >
          <FaEye size={13} />
        </button>
      )}
      <button
        type="button"
        onClick={onEdit}
        className={buttonClass}
        aria-label="Edit"
      >
        <FaCog size={13} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="flex h-9 w-9 items-center justify-center border border-red-500/30 text-red-400 transition-colors hover:bg-red-500 hover:text-white"
        aria-label="Delete"
      >
        <FaRegTrashAlt size={13} />
      </button>
    </div>
  );
}

function QuickAction({ label, detail, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between border border-white/10 bg-black/20 px-4 py-3 text-left transition-colors hover:border-primary"
    >
      <span>
        <span className="block text-sm font-medium text-white">{label}</span>
        <span className="mt-1 block text-xs text-gray-500">{detail}</span>
      </span>
      <FaPlus className="text-primary" size={12} />
    </button>
  );
}

function ConfirmDialog({ label, darkMode, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div
        className={`w-full max-w-md border p-6 shadow-2xl ${
          darkMode
            ? "border-white/10 bg-[#090909] text-white"
            : "border-black/10 bg-white text-gray-950"
        }`}
      >
        <div className="mb-4 flex items-center gap-3 text-red-400">
          <FaExclamationTriangle />
          <h2 className="font-heading text-lg font-bold">Delete item?</h2>
        </div>
        <p className="text-sm text-gray-500">
          This will permanently remove "{label}" from the website database.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="border border-white/10 px-4 py-2 text-sm text-gray-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-red-500 px-4 py-2 text-sm font-bold text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ toast }) {
  const isSuccess = toast.type === "success";
  return (
    <div className="fixed right-5 top-5 z-[80] flex max-w-sm items-center gap-3 border border-white/10 bg-black/85 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-xl">
      {isSuccess ? (
        <FaCheckCircle className="text-green-400" />
      ) : (
        <FaExclamationTriangle className="text-red-400" />
      )}
      <span>{toast.message}</span>
    </div>
  );
}

function LoadingState({ darkMode }) {
  return (
    <div
      className={`flex min-h-[360px] flex-col items-center justify-center border ${
        darkMode
          ? "border-white/10 bg-white/[0.04]"
          : "border-black/10 bg-white"
      }`}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="mt-4 text-sm text-gray-500">
        Synchronizing dashboard data...
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center border border-red-500/20 bg-red-500/5 p-6 text-center">
      <FaExclamationTriangle className="text-red-400" size={28} />
      <h2 className="mt-4 font-heading text-xl font-bold text-white">
        Backend connection failed
      </h2>
      <p className="mt-2 max-w-md text-sm text-gray-400">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 flex items-center gap-2 bg-primary px-5 py-3 text-xs font-bold tracking-widest text-dark"
      >
        <FaRedo size={12} />
        RETRY
      </button>
    </div>
  );
}

function StatusBadge({ label }) {
  return (
    <span className="inline-flex border border-primary/30 bg-primary/10 px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-widest text-primary">
      {label}
    </span>
  );
}

function EmptyTableRow({ colSpan, label }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-5 py-10 text-center text-sm text-gray-500"
      >
        {label}
      </td>
    </tr>
  );
}

function EmptyState({ label }) {
  return (
    <div className="px-5 py-16 text-center text-sm text-gray-500">{label}</div>
  );
}

function ReadOnlyInput({ label, value, darkMode }) {
  return (
    <label className="block text-xs uppercase tracking-widest text-gray-500">
      {label}
      <input value={value} readOnly className={inputClass(darkMode)} />
    </label>
  );
}

function FormInput({ label, value, onChange, darkMode, required = false }) {
  return (
    <label className="block text-xs uppercase tracking-widest text-gray-500">
      {label}
      <input
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass(darkMode)}
      />
    </label>
  );
}

function FormTextarea({ label, value, onChange, darkMode, required = false }) {
  return (
    <label className="block text-xs uppercase tracking-widest text-gray-500">
      {label}
      <textarea
        required={required}
        rows="5"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass(darkMode)} resize-none`}
      />
    </label>
  );
}

function FileInput({
  label,
  hint,
  accept,
  multiple = false,
  darkMode,
  onChange,
}) {
  return (
    <label className="block text-xs uppercase tracking-widest text-gray-500">
      {label}
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(event) => onChange(Array.from(event.target.files || []))}
        className={`mt-2 block w-full border p-3 text-xs ${
          darkMode
            ? "border-white/10 bg-black/30 text-gray-400"
            : "border-black/10 bg-white text-gray-600"
        }`}
      />
      {hint && (
        <span className="mt-2 block text-[11px] normal-case tracking-normal text-gray-500">
          {hint}
        </span>
      )}
    </label>
  );
}

function inputClass(darkMode) {
  return `mt-2 w-full border px-4 py-3 text-sm outline-none transition-colors focus:border-primary ${
    darkMode
      ? "border-white/10 bg-black/30 text-white placeholder:text-gray-600"
      : "border-black/10 bg-white text-gray-950 placeholder:text-gray-400"
  }`;
}

function rowClass(darkMode) {
  return `border-t ${darkMode ? "border-white/10" : "border-black/10"}`;
}

function textClass(darkMode, extra = "") {
  return `${darkMode ? "text-white" : "text-gray-950"} ${extra}`;
}

function cellTextClass(darkMode) {
  return `px-5 py-4 font-medium ${darkMode ? "text-white" : "text-gray-950"}`;
}

function cellMutedClass(darkMode) {
  return `px-5 py-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`;
}

function formatDate(value) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
