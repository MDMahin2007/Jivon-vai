import React from "react";
import { servicesData } from "../data/projects";

export default function Services() {
  return (
    <div className="py-20 px-5 sm:px-10 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold m-10 text-white tracking-wider uppercase">
        Our Services
      </h1>
      {servicesData.length === 0 ? (
        <p className="text-gray-500">No services added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {servicesData.map((service) => {
            const serviceId = service._id || service.id;
            return (
              <div
                key={serviceId}
                className="border border-white/10 p-8 bg-[#090909] hover:border-primary/50 transition-colors"
              >
                <h3 className="text-2xl font-bold text-white mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
