import React from "react";
import { Link } from "react-router-dom";
import { projectsData } from "../data/projects";

export default function Projects() {
  return (
    <div className="py-20 px-5 sm:px-10 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold m-10 text-white tracking-wider uppercase">
        Our Projects
      </h1>
      {projectsData.length === 0 ? (
        <p className="text-gray-500">No projects added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectsData.map((project) => {
            const projectId = project._id || project.id;
            return (
              <div
                key={projectId}
                className="border border-white/10 overflow-hidden group bg-[#090909]"
              >
                <div className="overflow-hidden h-64">
                  <img
                    src={project.coverImage}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <span className="text-primary text-xs uppercase tracking-widest font-semibold">
                    {project.category}
                  </span>
                  <h3 className="text-xl font-bold mt-2 text-white">
                    {project.title}
                  </h3>
                  <Link
                    to={`/project/${projectId}`}
                    className="mt-4 inline-block text-sm border-b border-primary text-primary pb-1 hover:text-white hover:border-white transition-colors"
                  >
                    VIEW DETAILS →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
