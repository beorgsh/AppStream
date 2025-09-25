import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getImageUrl, fetchRecommendations } from "../Services/TmdbApi";

export default function Recommended({ video }) {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (!video) return;

    const fetchData = async () => {
      try {
        const results = await fetchRecommendations(video.mediaType, video.id);
        setRecommendations(results);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };

    fetchData();
  }, [video]);

  if (!recommendations.length) return null;

  return (
    <div className="p-4 mt-8">
      <h2 className="text-2xl font-bold mb-6 text-white">Recommended</h2>
      <motion.div
        className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-7 gap-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }} // triggers when 20% of section is in view
        variants={{
          hidden: { opacity: 0, y: 50 },
          visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
        }}
      >
        {recommendations.map((rec) => (
          <motion.div
            key={rec.id}
            className="relative bg-gray-800 rounded-lg shadow-lg overflow-hidden group"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
            }}
          >
            <Link to={`/watch/${rec.media_type || video.mediaType}/${rec.id}`}>
              <img
                src={getImageUrl(rec.poster_path)}
                alt={rec.title || rec.name}
                className="w-full h-auto object-cover group-hover:scale-110 transition duration-150 ease-in-out"
              />
              <div className="absolute flex items-end p-3 inset-0 bg-gradient-to-t from-black/100 via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="block w-full">
                  <h3 className="text-xs font-bold text-white mb-2">
                    {rec.title || rec.name}
                  </h3>
                  <div className="flex items-center text-yellow-400 justify-between w-full">
                    <div className="flex items-center py-1 rounded-full text-white">
                      <span className="text-sm font-medium">⭐</span>
                      <span className="text-sm">
                        {rec.vote_average?.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-300"> / 10</span>
                    </div>
                    <div className="flex justify-end">
                      <span className="text-sm text-gray-300">
                        {rec.media_type === "tv" ? "TV Show" : "Movie"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
