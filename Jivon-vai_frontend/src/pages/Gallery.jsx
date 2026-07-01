import React, { useEffect, useState } from "react";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/projects");
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load gallery images.");
        }

        const galleryData = (data.data || []).flatMap((project) => {
          const media = [
            ...(project.images || []),
            ...(project.renderImages || []),
            ...(project.floorPlans || []),
          ];

          return media.filter(Boolean).map((image, index) => ({
            id: `${project._id}-${index}`,
            title: project.title,
            category: project.category,
            image,
          }));
        });

        setImages(galleryData);
      } catch (requestError) {
        setError(requestError.message || "Unable to load gallery images.");
      } finally {
        setLoading(false);
      }
    };

    void loadGallery();
  }, []);

  if (loading) {
    return (
      <div className="py-20 px-5 text-center text-gray-400 sm:px-10">
        Loading Gallery...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-20 sm:px-10">
      <h1 className="mb-10 text-4xl font-bold uppercase tracking-wider text-white">
        Visual Gallery
      </h1>
      {error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : images.length === 0 ? (
        <p className="text-gray-500">No gallery images available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {images.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square overflow-hidden border border-white/5 bg-[#090909]"
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
