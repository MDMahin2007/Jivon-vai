import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import { projectsData } from "../data/projects";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        const data = await response.json();

        let galleryData = [];
        if (response.ok && data.success && Array.isArray(data.data)) {
          galleryData = (data.data || []).flatMap((project) => {
            const media = [
              ...(project.images || []),
              ...(project.renderImages || []),
              ...(project.floorPlans || []),
            ];

            return media.filter(Boolean).map((image, index) => ({
              id: `${project._id || project.id}-${index}`,
              title: project.title,
              category: project.category,
              image,
            }));
          });
        }

        if (!galleryData.length) {
          galleryData = projectsData.flatMap((project) =>
            (project.images || []).filter(Boolean).map((image, index) => ({
              id: `${project.id}-${index}`,
              title: project.title,
              category: project.category,
              image,
            })),
          );
        }

        setImages(galleryData);
      } catch (requestError) {
        setError(requestError.message || "Unable to load gallery images.");
        setImages(
          projectsData.flatMap((project) =>
            (project.images || []).filter(Boolean).map((image, index) => ({
              id: `${project.id}-${index}`,
              title: project.title,
              category: project.category,
              image,
            })),
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    void loadGallery();
  }, []);

  const openLightbox = (index) => {
    setActiveImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const showPreviousImage = (event) => {
    event.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const showNextImage = (event) => {
    event.stopPropagation();
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="py-20 px-5 text-center text-gray-400 sm:px-10">
        Loading Gallery...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-10">
      <h1 className="mt-8 text-4xl font-bold uppercase tracking-wider text-white">
        Visual Gallery
      </h1>
      {error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : images.length === 0 ? (
        <p className="text-gray-500">No gallery images available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openLightbox(index)}
              className="group relative aspect-square overflow-hidden border border-white/5 bg-[#090909] text-left"
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-black/70 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {item.category}
                </span>
                <h4 className="mt-1 text-sm font-bold text-white">
                  {item.title}
                </h4>
              </div>
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && images[activeImageIndex] && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 p-6"
        >
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold uppercase tracking-[0.3em] text-gray-400">
              {images[activeImageIndex].title} ({activeImageIndex + 1} /{" "}
              {images.length})
            </span>
            <button
              type="button"
              onClick={closeLightbox}
              className="flex h-10 w-10 items-center justify-center border border-white/20 text-white transition-colors hover:border-primary hover:text-primary"
              aria-label="Close gallery preview"
            >
              <FaTimes size={18} />
            </button>
          </div>

          <div className="relative my-6 flex flex-1 items-center justify-center">
            <img
              src={images[activeImageIndex].image}
              alt={images[activeImageIndex].title}
              className="max-h-[80vh] max-w-[90vw] cursor-default object-contain"
              onClick={(event) => event.stopPropagation()}
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPreviousImage}
                  className="absolute left-4 flex h-12 w-12 items-center justify-center border border-white/20 bg-black/30 text-white transition-all hover:border-primary hover:text-primary"
                  aria-label="Previous gallery image"
                >
                  <FaChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  className="absolute right-4 flex h-12 w-12 items-center justify-center border border-white/20 bg-black/30 text-white transition-all hover:border-primary hover:text-primary"
                  aria-label="Next gallery image"
                >
                  <FaChevronRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
