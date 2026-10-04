import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import { projectsData } from "../data/projects";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE_URL}/projects/${id}`);
        const data = await response.json();

        if (response.ok && data.success && data.data) {
          if (isMounted) {
            setProject(data.data);
          }
          return;
        }

        const localProject = projectsData.find(
          (item) => String(item.id) === String(id),
        );

        if (localProject && isMounted) {
          setProject({
            ...localProject,
            _id: String(localProject.id),
            images: localProject.images || [],
            renderImages: localProject.renderImages || [],
            floorPlans: localProject.floorPlans || [],
            videos: localProject.videos || [],
          });
          return;
        }

        throw new Error(data.message || "Unable to load project details.");
      } catch (requestError) {
        const fallbackProject = projectsData.find(
          (item) => String(item.id) === String(id),
        );

        if (fallbackProject && isMounted) {
          setProject({
            ...fallbackProject,
            _id: String(fallbackProject.id),
            images: fallbackProject.images || [],
            renderImages: fallbackProject.renderImages || [],
            floorPlans: fallbackProject.floorPlans || [],
            videos: fallbackProject.videos || [],
          });
          return;
        }

        if (isMounted) {
          setError(requestError.message || "Unable to load project details.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadProject();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const galleryImages = useMemo(() => {
    const items = [
      ...(project?.images || []),
      ...(project?.renderImages || []),
      ...(project?.floorPlans || []),
    ];
    return items.filter(Boolean);
  }, [project]);

  const projectSheet = useMemo(() => {
    const sheet = project?.projectSheet || {};
    return {
      client: sheet.client || project?.client || "",
      location: sheet.location || project?.location || "",
      year: sheet.year || project?.year || "",
      scale: sheet.scale || project?.scale || "",
      status: sheet.status || project?.status || "",
      area: sheet.area || project?.area || "",
      projectType: sheet.projectType || project?.projectType || "",
      category: project?.category || "",
    };
  }, [project]);

  const openLightbox = (idx) => {
    setActiveImgIdx(idx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const prevImage = (event) => {
    event.stopPropagation();
    if (!galleryImages.length) return;
    setActiveImgIdx(
      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length,
    );
  };

  const nextImage = (event) => {
    event.stopPropagation();
    if (!galleryImages.length) return;
    setActiveImgIdx((prev) => (prev + 1) % galleryImages.length);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark px-6 text-center">
        <div>
          <p className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-primary">
            Loading project
          </p>
          <p className="mt-3 text-sm text-gray-400">
            Fetching the latest project details from the database.
          </p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-dark px-6 text-center">
        <h2 className="mb-4 font-heading text-2xl font-bold text-white">
          Project Not Found
        </h2>
        <p className="max-w-md text-sm text-gray-400">
          {error || "The requested project could not be found."}
        </p>
        <Link
          to="/projects"
          className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-primary hover:underline"
        >
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-dark bg-grid-pattern py-24">
      <div className="mx-auto mt-12 max-w-7xl px-6 text-left">
        <Link
          to="/projects"
          className="mb-8 inline-block text-xs font-heading font-bold uppercase tracking-[0.3em] text-primary hover:underline"
        >
          ← Back to all projects
        </Link>

        <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="mb-3 font-heading text-xs font-bold uppercase tracking-[0.3em] text-primary">
              {project.category}
            </p>
            <h1 className="mb-6 font-heading text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              {project.title}
            </h1>
            <p className="text-sm leading-relaxed text-gray-400 sm:text-base">
              {project.description}
            </p>
          </div>

          <div className="glass-panel flex flex-col gap-4 self-start p-8">
            <h3 className="border-b border-primary/20 pb-3 font-heading text-sm font-bold uppercase tracking-[0.3em] text-white">
              Project Sheet
            </h3>
            <div className="flex flex-col gap-3 text-xs">
              {[
                ["Client", projectSheet.client],
                ["Location", projectSheet.location],
                ["Year", projectSheet.year],
                ["Scale", projectSheet.scale],
                ["Status", projectSheet.status],
                ["Area", projectSheet.area],
                ["Project Type", projectSheet.projectType],
              ]
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="font-bold uppercase text-gray-500">
                      {label}:
                    </span>
                    <span className="text-right font-medium text-white">
                      {value}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {project.videos?.length > 0 && (
          <div className="mb-20">
            <h2 className="mb-8 border-b border-dark-border/20 pb-4 font-heading text-2xl font-bold text-white">
              Project Walkthroughs
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {project.videos.map((video, index) => (
                <div
                  key={`${video}-${index}`}
                  className="relative aspect-video border border-dark-border/40 bg-black"
                >
                  <video
                    src={video}
                    controls
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-4 top-4 z-10 border border-primary/10 bg-dark/70 px-3 py-1 font-heading text-[10px] font-bold uppercase tracking-widest text-primary">
                    Clip {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="mb-8 border-b border-dark-border/20 pb-4 font-heading text-2xl font-bold text-white">
            Renders & Floorplans
          </h2>
          {galleryImages.length ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {galleryImages.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  onClick={() => openLightbox(index)}
                  className="group relative aspect-square cursor-pointer overflow-hidden border border-dark-border/40 bg-dark-card shadow-md"
                >
                  <img
                    src={image}
                    alt={`${project.title} - Media ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-dark/20 transition-colors duration-300 group-hover:bg-dark/45" />
                  <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-none bg-primary/90 px-4 py-2 text-[10px] font-heading font-extrabold uppercase tracking-widest text-dark opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Expand Media
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No media has been uploaded for this project yet.
            </p>
          )}
        </div>
      </div>

      {lightboxOpen && galleryImages.length > 0 && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 flex cursor-zoom-out flex-col justify-between bg-black/95 p-6"
        >
          <div className="z-10 flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-gray-500">
              {project.title} ({activeImgIdx + 1} / {galleryImages.length})
            </span>
            <button
              onClick={closeLightbox}
              className="flex h-10 w-10 items-center justify-center border border-white/20 text-white transition-colors duration-300 hover:border-primary hover:text-primary"
              aria-label="Close lightbox"
            >
              <FaTimes size={18} />
            </button>
          </div>

          <div className="relative my-6 flex flex-1 items-center justify-center">
            <img
              src={galleryImages[activeImgIdx]}
              alt={`${project.title} - Full media`}
              className="max-h-[80vh] max-w-[90vw] cursor-default object-contain"
              onClick={(event) => event.stopPropagation()}
            />

            <button
              onClick={prevImage}
              className="absolute left-4 flex h-12 w-12 items-center justify-center border border-white/20 bg-dark/40 text-white transition-all duration-300 hover:border-primary hover:text-primary"
              aria-label="Previous image"
            >
              <FaChevronLeft size={16} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 flex h-12 w-12 items-center justify-center border border-white/20 bg-dark/40 text-white transition-all duration-300 hover:border-primary hover:text-primary"
              aria-label="Next image"
            >
              <FaChevronRight size={16} />
            </button>
          </div>

          <div className="z-10 text-center">
            <span className="font-heading text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              {project.category} media
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
