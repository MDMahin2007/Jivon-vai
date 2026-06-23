import React, { useState, useEffect } from "react";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Projects theke shob image list akare dore neya
          const galleryData = data.data.map((p) => ({
            id: p._id,
            title: p.title,
            category: p.category,
            image: p.coverImage,
          }));
          setImages(galleryData);
        }
      })
      .catch((err) => console.error("Error loading gallery:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="text-center py-20 text-gray-400">Loading Gallery...</div>
    );

  return (
    <div className="py-20 px-5 sm:px-10 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-white tracking-wider uppercase">
        Visual Gallery
      </h1>
      {images.length === 0 ? (
        <p className="text-gray-500">No gallery images available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((item) => (
            <div
              key={item.id}
              className="relative group overflow-hidden border border-white/5 bg-[#090909] aspect-square"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <span className="text-[10px] text-primary uppercase font-bold tracking-widest">
                  {item.category}
                </span>
                <h4 className="text-white font-bold text-sm mt-1">
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
