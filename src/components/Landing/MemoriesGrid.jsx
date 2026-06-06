import React from "react";
import { motion } from "framer-motion";

export const MemoriesGrid = () => {
  const images = [
    "/src/assets/photos/memories/img7.jpeg",
    "/src/assets/photos/memories/img8.jpeg",
    "/src/assets/photos/memories/img9.jpeg",
    "/src/assets/photos/memories/img10.jpeg",
    "/src/assets/photos/memories/img11.jpeg",
    "/src/assets/photos/memories/img12.jpeg",
    "/src/assets/photos/memories/img13.jpeg",
    "/src/assets/photos/memories/img14.jpeg",
    "/src/assets/photos/memories/img15.jpeg",
    "/src/assets/photos/memories/img16.jpeg",
  ];

  return (
    <section className="py-24 px-6 max-w-6xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-black text-center mb-16 uppercase tracking-[0.2em]">
        Campus Memories
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.05 }}
            className="overflow-hidden rounded-2xl shadow-lg border border-border bg-card cursor-pointer group"
          >
            <div className="relative overflow-hidden h-64">
              <img
                src={src}
                alt={`Memory ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
