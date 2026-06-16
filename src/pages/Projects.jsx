import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsData } from '../data/projects';
import { FaSearch, FaPlus } from 'react-icons/fa';

export default function Projects() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Residential', 'Commercial', 'Interior', 'Exterior'];

  // Filter projects by category and search query
  const filteredProjects = projectsData.filter((project) => {
    const matchesCategory = selectedCategory === 'All' || project.category === selectedCategory;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="py-24 bg-dark relative bg-grid-pattern min-h-screen">
      <div className="max-w-7xl mx-auto px-6 mt-12">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
          <div className="text-left">
            <p className="text-primary font-heading text-xs tracking-[0.3em] font-bold mb-3">WORK</p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight font-heading">
              Our Projects
            </h1>
            <div className="h-1 w-20 bg-primary" />
          </div>
          
          {/* Search bar */}
          <div className="relative mt-6 md:mt-0 max-w-xs w-full">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-card border border-dark-border/60 focus:border-primary text-sm text-white px-5 py-3 pr-10 focus:outline-none transition-colors duration-300"
            />
            <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
          </div>
        </div>

        {/* Filter Tabs */}
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

        {/* Grid List */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="group relative overflow-hidden bg-dark-card border border-dark-border/40 h-[320px] cursor-pointer shadow-lg"
              >
                <img
                  src={project.coverImage}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />
                
                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-left z-20">
                  <p className="text-primary text-[10px] tracking-widest font-heading font-bold uppercase mb-1">
                    {project.category}
                  </p>
                  <h3 className="text-lg font-bold font-heading text-white group-hover:text-primary transition-colors duration-300 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Plus hover icon */}
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-dark/80 border border-primary/40 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <FaPlus size={12} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 glass-panel border-dashed border-dark-border">
            <p className="text-gray-500 font-heading text-sm uppercase tracking-wider">No projects match your criteria.</p>
          </div>
        )}

      </div>
    </div>
  );
}
