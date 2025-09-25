import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/";
const POSTER_SIZE = "w342";

const tmdbApi = axios.create({
  baseURL: BASE_URL,
});

/* -----------------------------
   🔹 Movies
------------------------------ */
export const fetchPopularMovies = async (page = 1) => {
  try {
    const response = await tmdbApi.get("/movie/popular", {
      params: { api_key: API_KEY, language: "en-US", page },
    });
    return response.data.results;
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    throw error;
  }
};

export const getMovieDetails = async (tmdbId) => {
  try {
    const response = await tmdbApi.get(`/movie/${tmdbId}`, {
      params: { api_key: API_KEY, language: "en-US" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw error;
  }
};

/* -----------------------------
   🔹 TV Shows
------------------------------ */
export const fetchPopularTV = async (page = 1) => {
  try {
    const response = await tmdbApi.get("/tv/popular", {
      params: { api_key: API_KEY, language: "en-US", page },
    });
    return response.data.results;
  } catch (error) {
    console.error("Error fetching popular TV shows:", error);
    throw error;
  }
};

export const fetchTvShowDetails = async (tmdbId) => {
  try {
    const response = await tmdbApi.get(`/tv/${tmdbId}`, {
      params: { api_key: API_KEY, language: "en-US" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching TV show details:", error);
    throw error;
  }
};

/* -----------------------------
   🔹 Seasons
------------------------------ */
export const fetchSeasonDetails = async (tvId, seasonNumber) => {
  try {
    const response = await tmdbApi.get(`/tv/${tvId}/season/${seasonNumber}`, {
      params: { api_key: API_KEY, language: "en-US" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching season details:", error);
    throw error;
  }
};

/* -----------------------------
   🔹 Episodes
------------------------------ */
export const fetchEpisodeDetails = async (
  tvId,
  seasonNumber,
  episodeNumber
) => {
  try {
    const response = await tmdbApi.get(
      `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`,
      {
        params: { api_key: API_KEY, language: "en-US" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching episode details:", error);
    throw error;
  }
};

/* -----------------------------
   🔹 Image Helper
------------------------------ */
export const getImageUrl = (path, size = POSTER_SIZE) => {
  if (!path) return "https://via.placeholder.com/342x513?text=No+Image";
  return `${IMAGE_BASE_URL}${size}${path}`;
};

export const getTrending = async (mediaType = "movie", timeWindow = "week") => {
  try {
    const url = `${BASE_URL}/trending/${mediaType}/${timeWindow}?api_key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching trending data: ${response.statusText}`);
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Failed to fetch trending data:", error);
    return [];
  }
};

export const getMediaLogo = async (mediaType, id) => {
  try {
    const url = `${BASE_URL}/${mediaType}/${id}/images?api_key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const logo = data.logos.find(
      (l) => l.iso_639_1 === "en" || l.iso_639_1 === null
    );
    return logo ? logo.file_path : null;
  } catch (error) {
    console.error("Failed to fetch media logo:", error);
    return null;
  }
};

// export const fetchRecommended = async (mediaType, id) => {
//   try {
//     const response = await axios.get(
//       `${BASE_URL}/${mediaType}/${id}/recommendations?api_key=${API_KEY}&language=en-US&page=1`
//     );
//     return response.data;
//   } catch (err) {
//     console.error(err);
//     return { results: [] };
//   }
// };

// Fetch recommendations by genre
export const fetchRecommendations = async (mediaType, id) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/${mediaType}/${id}/recommendations`,
      {
        params: {
          api_key: API_KEY,
          language: "en-US",
          page: 1,
        },
      }
    );
    return response.data.results;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return [];
  }
};

// Search movies and TV shows
// Search movies & TV shows
export const searchMulti = async (query, cancelToken) => {
  if (!query) return [];
  try {
    const movieRes = await axios.get(`${BASE_URL}/search/movie`, {
      params: {
        api_key: API_KEY,
        query,
        language: "en-US",
        page: 1,
        include_adult: false,
      },
      cancelToken: cancelToken?.token,
    });

    const tvRes = await axios.get(`${BASE_URL}/search/tv`, {
      params: { api_key: API_KEY, query, language: "en-US", page: 1 },
      cancelToken: cancelToken?.token,
    });

    return [
      ...movieRes.data.results.map((m) => ({ ...m, media_type: "movie" })),
      ...tvRes.data.results.map((t) => ({ ...t, media_type: "tv" })),
    ];
  } catch (err) {
    if (!axios.isCancel(err))
      console.error("Error fetching search results:", err);
    return [];
  }
};
