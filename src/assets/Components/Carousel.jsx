import React from "react";
import { useNavigate } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";

const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/";

const genreMap = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  18: "Drama",
  14: "Fantasy",
  27: "Horror",
  10749: "Romance",
  878: "Sci-Fi",
  53: "Thriller",
  // add more if needed
};

const Carousel = ({ slides = [], options }) => {
  const [emblaRef] = useEmblaCarousel(options, [Autoplay()]);
  const navigate = useNavigate();

  // Play in Videasy fullscreen
  const handlePlay = (media) => {
    navigate(`/watch/${media.media_type || "movie"}/${media.id}`, {
      state: { fullscreen: true },
    });
  };

  // Navigate to detail page
  const handleDetails = (media) => {
    navigate(`/detail/${media.media_type || "movie"}/${media.id}`);
  };

  if (!slides || slides.length === 0) return null;

  return (
    <section className="embla">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((media) => {
            const imagePath = media.backdrop_path || media.poster_path;
            const imageUrl = imagePath
              ? `${BASE_IMAGE_URL}original${imagePath}`
              : "/fallback.jpg";

            const logoUrl = media.logo_path
              ? `${BASE_IMAGE_URL}w500${media.logo_path}`
              : null;

            return (
              <div
                className="embla__slide relative"
                key={media.id}
                style={{
                  backgroundImage: `url(${imageUrl})`,
                  minHeight: "400px",
                }}
              >
                <div className="overlay-content absolute inset-0 z-20 flex items-center p-8 md:p-16 text-white container mx-auto">
                  <div className="max-w-xl absolute top-1/2 -translate-y-1/2 left-0  p-10 md:p-0 sm:p-20">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={`${media.title || media.name} logo`}
                        className="w-64 mb-4"
                      />
                    ) : (
                      <h1 className="text-3xl md:text-5xl font-bold mb-4">
                        {media.title || media.name}
                      </h1>
                    )}

                    <p className="hidden md:block text-base md:text-lg mb-6 line-clamp-3">
                      {media.overview}
                    </p>

                    <div className="flex flex-wrap items-center space-x-2 mb-4">
                      <span className="text-xl font-semibold">
                        ⭐ {media.vote_average?.toFixed(1)}
                      </span>
                      <span className="text-sm">/ 10</span>
                      {media.genre_ids && (
                        <div className="flex flex-wrap ml-4">
                          {media.genre_ids.slice(0, 3).map((id) => (
                            <span
                              key={id}
                              className="text-xs bg-gray-700 px-2 py-1 rounded-full mr-2 mb-2"
                            >
                              {genreMap[id] || "Unknown"}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={() => handlePlay(media)}
                        className="px-6 py-2 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition"
                      >
                        ▶ Play
                      </button>
                      <button
                        onClick={() => handleDetails(media)}
                        className="px-6 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition"
                      >
                        ℹ Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Carousel;
