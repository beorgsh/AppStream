import React from "react";
import { motion } from "framer-motion";
import { fetchPopularMovies, getImageUrl } from "../Services/TmdbApi";
import { useInfiniteScroll } from "../Hooks/useInfiniteScroll";
import { Link } from "react-router-dom";

export default function Movies() {
  const {
    data: movies,
    loading,
    error,
    loaderRef,
    hasMore,
  } = useInfiniteScroll(fetchPopularMovies, "movie");

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">Error: {error.message}</div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="p-4 mt-15">
      <h1 className="text-3xl font-bold mb-6 text-white">Popular Movies</h1>
      <motion.div
        className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-7 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {movies.map((movie) => (
          <Link key={movie.id} to={`/watch/movie/${movie.id}`}>
            <motion.div
              className="relative bg-gray-800 rounded-lg shadow-lg overflow-hidden group"
              variants={itemVariants}
            >
              <img
                src={getImageUrl(movie.poster_path)}
                alt={movie.title}
                className="w-full h-auto object-cover group-hover:scale-110 transition duration-150 ease-in-out"
              />
              <div className="absolute flex items-end p-3 inset-0 bg-gradient-to-t from-black/100 via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="block w-full">
                  <div className="w-full ">
                    <h2 className="text-xs font-bold text-white mb-2">
                      {movie.title}
                    </h2>
                  </div>
                  <div className="flex items-center text-yellow-400 justify-between w-full">
                    <div className="flex items-center py-1 rounded-full text-white">
                      <span className="text-sm font-medium">⭐</span>
                      <span className="text-sm">
                        {movie.vote_average.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-300"> / 10</span>
                    </div>
                    <div className="flex justify-end">
                      <span className="text-sm text-gray-300"> Movie</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>
      {loading && (
        <div className="text-center text-white text-lg py-8">
          Loading more movies...
        </div>
      )}
      {hasMore && <div ref={loaderRef} style={{ height: "10px" }}></div>}
      {!hasMore && (
        <div className="text-center text-gray-400 text-lg py-8">
          You've reached the end of the list.
        </div>
      )}
    </div>
  );
}
