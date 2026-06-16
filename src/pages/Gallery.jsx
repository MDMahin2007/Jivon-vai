import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsData } from '../data/projects';
import { FaChevronLeft, FaChevronRight, FaTimes, FaLink } from 'react-icons/fa';

export default function Gallery() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Flatten all project images with project information
  const galleryItems = projectsData.flatMap((project) =>
    project.images.map((img) => ({
      src: img,
      projectId: project.id,
      projectTitle: project.title,
      category: project.category
    }))
  );

  const categories = ['All', 'Residential', 'Commercial', 'Interior', 'Exterior'];

  // Filtered gallery items
  const filteredItems = galleryItems.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  const openLightbox = (idx) => {
    setActiveIndex(idx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % filteredItems.length);
  };

  return (
    <div className="py-24 bg-dark relative bg-grid-pattern min-h-screen">
      <div className="max-w-7xl mx-auto px-6 mt-12">
        
        {/* Page Header */}
        <div className="text-left mb-16">
          <p className="text-primary font-heading text-xs tracking-[0.3em] font-bold mb-3">GALLERY</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight font-heading">
            Photo Gallery
          </h1>
          <div className="h-1 w-20 bg-primary" />
        </div>

        {/* Categories Tabs */}
        <div className="flex flex-wrap gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`font-heading text-xs font-bold tracking-widest px-6 py-3 transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-primary text-dark shadow-md'
                  : 'bg-dark-card border border-dark-border/40 text-white hover:border-primary'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Masonry-Style Grid */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
          {filteredItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => openLightbox(idx)}
              className="break-inside-avoid relative overflow-hidden bg-dark-card border border-dark-border/40 cursor-pointer group shadow-lg"
            >
              <img
                src={item.src}
                alt={`${item.projectTitle} Render`}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-dark/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-left">
                <p className="text-primary text-[9px] tracking-widest font-heading font-bold uppercase mb-1">
                  {item.category}
                </p>
                <h3 className="text-sm font-bold font-heading text-white mb-2 leading-snug">
                  {item.projectTitle}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/project/${item.projectId}`);
                  }}
                  className="flex items-center gap-2 text-[10px] text-gray-400 hover:text-primary transition-colors font-heading tracking-widest uppercase font-bold"
                >
                  <FaLink size={10} /> View Project
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Viewer */}
        {lightboxOpen && filteredItems.length > 0 && (
          <div
            onClick={closeLightbox}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-6 cursor-zoom-out"
          >
            {/* Top panel */}
            <div className="flex justify-between items-center z-10">
              <span className="text-xs tracking-widest font-heading font-bold text-gray-500">
                {filteredItems[activeIndex].projectTitle} ({activeIndex + 1} / {filteredItems.length})
              </span>
              <button
                onClick={closeLightbox}
                className="text-white hover:text-primary transition-colors duration-300 w-10 h-10 border border-white/20 hover:border-primary flex items-center justify-center focus:outline-none"
                aria-label="Close lightbox"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Active Image container */}
            <div className="relative flex-1 flex items-center justify-center my-6">
              <img
                src={filteredItems[activeIndex].src}
                alt="Full Render View"
                className="max-h-[80vh] max-w-[90vw] object-contain cursor-default"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 w-12 h-12 border border-white/20 hover:border-primary text-white hover:text-primary transition-all duration-300 flex items-center justify-center bg-dark/40"
                aria-label="Previous image"
              >
                <FaChevronLeft size={16} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 w-12 h-12 border border-white/20 hover:border-primary text-white hover:text-primary transition-all duration-300 flex items-center justify-center bg-dark/40"
                aria-label="Next image"
              >
                <FaChevronRight size={16} />
              </button>
            </div>

            {/* Bottom Panel */}
            <div className="text-center z-10 flex flex-col gap-1 items-center">
              <span className="text-[10px] tracking-widest font-heading font-bold text-primary uppercase">
                {filteredItems[activeIndex].category} Render
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/project/${filteredItems[activeIndex].projectId}`);
                }}
                className="text-xs text-gray-400 hover:text-white font-heading font-semibold hover:underline"
              >
                Go to Project Detail page &rarr;
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
