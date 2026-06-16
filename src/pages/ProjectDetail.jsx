import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsData } from '../data/projects';
import { FaChevronLeft, FaChevronRight, FaTimes, FaPlay, FaRegFolderOpen } from 'react-icons/fa';

export default function ProjectDetail() {
  const { id } = useParams();
  const project = projectsData.find((p) => p.id === parseInt(id));

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  if (!project) {
    return (
      <div className="py-36 bg-dark text-center min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold font-heading text-white mb-4">Project Not Found</h2>
        <Link to="/projects" className="text-primary hover:underline font-heading text-xs tracking-widest font-bold">
          BACK TO PROJECTS
        </Link>
      </div>
    );
  }

  const openLightbox = (idx) => {
    setActiveImgIdx(idx);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setActiveImgIdx((prev) => (prev - 1 + project.images.length) % project.images.length);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setActiveImgIdx((prev) => (prev + 1) % project.images.length);
  };

  // Mock details matching architectural plans
  const details = {
    client: 'Arcforma Private Clients',
    location: 'Dhaka, Bangladesh',
    year: '2025 - 2026',
    scale: project.category === 'Residential' ? '4,500 SFT Duplex' : '12,000 SFT Corporate site'
  };

  return (
    <div className="py-24 bg-dark relative bg-grid-pattern min-h-screen">
      <div className="max-w-7xl mx-auto px-6 mt-12 text-left">
        
        {/* Breadcrumb / Back Link */}
        <Link
          to="/projects"
          className="text-xs text-primary font-heading font-bold tracking-widest hover:underline mb-8 inline-block"
        >
          &larr; BACK TO ALL PROJECTS
        </Link>

        {/* Page Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          <div className="lg:col-span-2">
            <p className="text-primary font-heading text-xs tracking-[0.3em] font-bold mb-3 uppercase">
              {project.category}
            </p>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 font-heading">
              {project.title}
            </h1>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-sans">
              {project.description}
            </p>
          </div>

          {/* Project Details Panel */}
          <div className="glass-panel p-8 flex flex-col gap-4 self-start">
            <h3 className="text-md font-heading font-bold text-white border-b border-primary/20 pb-3 uppercase tracking-wider">
              Project Sheet
            </h3>
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">CLIENT:</span>
                <span className="text-white font-medium">{details.client}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">LOCATION:</span>
                <span className="text-white font-medium">{details.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">YEAR:</span>
                <span className="text-white font-medium">{details.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-bold">ZONING / SCALE:</span>
                <span className="text-white font-medium">{details.scale}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Videos Section (If project contains mp4 clips) */}
        {project.videos && project.videos.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl font-bold font-heading text-white mb-8 border-b border-dark-border/20 pb-4">
              Project Walkthroughs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {project.videos.map((vid, idx) => (
                <div key={idx} className="relative bg-black border border-dark-border/40 aspect-video">
                  <video
                    src={vid}
                    controls
                    className="w-full h-full object-cover focus:outline-none"
                    alt={`Walkthrough Clip ${idx + 1}`}
                  />
                  <div className="absolute top-4 left-4 bg-dark/70 text-[10px] text-primary tracking-widest font-heading font-bold px-3 py-1 uppercase z-10 border border-primary/10">
                    CLIP {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Gallery Grid */}
        <div>
          <h2 className="text-2xl font-bold font-heading text-white mb-8 border-b border-dark-border/20 pb-4">
            Renders & Floorplans
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {project.images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => openLightbox(idx)}
                className="group relative overflow-hidden bg-dark-card border border-dark-border/40 aspect-square cursor-pointer shadow-md"
              >
                <img
                  src={img}
                  alt={`${project.title} - Render ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-dark/20 group-hover:bg-dark/45 transition-colors duration-300" />
                
                {/* Expand overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary/90 text-dark font-heading text-[10px] tracking-widest font-extrabold px-4 py-2 rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 uppercase z-20">
                  EXPAND RENDER
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-6 cursor-zoom-out"
        >
          {/* Top panel */}
          <div className="flex justify-between items-center z-10">
            <span className="text-xs tracking-widest font-heading font-bold text-gray-500">
              {project.title} ({activeImgIdx + 1} / {project.images.length})
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
              src={project.images[activeImgIdx]}
              alt={`${project.title} - Full Render`}
              className="max-h-[80vh] max-w-[90vw] object-contain cursor-default"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
            />

            {/* Arrows inside the center screen */}
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

          {/* Bottom panel */}
          <div className="text-center z-10">
            <span className="text-[10px] tracking-widest font-heading font-bold text-primary uppercase">
              {project.category} RENDER
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
