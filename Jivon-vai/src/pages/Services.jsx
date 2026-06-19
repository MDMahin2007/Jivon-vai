import React, { useState, useEffect } from "react";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/services")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setServices(data.data);
      })
      .catch((err) => console.error("Error loading services:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="text-center py-20 text-gray-400">Loading Services...</div>
    );

  return (
    <div className="py-20 px-5 sm:px-10 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-white tracking-wider uppercase">
        Our Services
      </h1>
      {services.length === 0 ? (
        <p className="text-gray-500">No services added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service) => (
            <div
              key={service._id}
              className="border border-white/10 p-8 bg-[#090909] hover:border-primary/50 transition-colors"
            >
              <h3 className="text-2xl font-bold text-white mb-4">
                {service.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
