import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getImageUrl,
  getMovieDetails,
  fetchTvShowDetails,
  fetchSeasonDetails,
} from "../Services/TmdbApi";
import Recommended from "../Components/Recommended";

export default function DetailPage() {
  const {
    mediaType,
    id,
    seasonNumber: urlSeason,
    episodeNumber: urlEpisode,
  } = useParams();

  const [item, setItem] = useState(null);
  const [seasonData, setSeasonData] = useState(null);
  const [media, setMedia] = useState(null); // For Recommended
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchHistoryItem, setWatchHistoryItem] = useState(null);
  const [initialSeekTime, setInitialSeekTime] = useState(0);

  const iframeRef = useRef(null);
  const isInitialLoad = useRef(true);

  const isMovie = mediaType === "movie";
  const seasonNumber = parseInt(urlSeason) || 1;
  const episodeNumber = parseInt(urlEpisode) || 1;

  // Debounce function to limit how often we save to localStorage
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedUpdateHistory = useCallback(
    debounce((updatedEntry) => {
      setWatchHistoryItem(updatedEntry);

      const watchHistory =
        JSON.parse(localStorage.getItem("watchHistory")) || [];
      const existingIndex = watchHistory.findIndex(
        (i) =>
          i.id === updatedEntry.id &&
          i.mediaType === updatedEntry.mediaType &&
          (updatedEntry.mediaType === "movie" ||
            (i.season === updatedEntry.season &&
              i.episode === updatedEntry.episode))
      );

      if (existingIndex > -1) watchHistory.splice(existingIndex, 1);
      watchHistory.unshift(updatedEntry);
      if (watchHistory.length > 50) watchHistory.pop();
      localStorage.setItem("watchHistory", JSON.stringify(watchHistory));
    }, 1000),
    []
  );

  // Fetch item details and season data
  useEffect(() => {
    if (!mediaType || !id) {
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        let itemData,
          seasonDetails = null;

        if (isMovie) {
          itemData = await getMovieDetails(id);
        } else {
          itemData = await fetchTvShowDetails(id);
          if (itemData?.number_of_seasons > 0) {
            seasonDetails = await fetchSeasonDetails(id, seasonNumber);
            setSeasonData(seasonDetails);
          }
        }

        setItem(itemData);
        setMedia(itemData); // For Recommended component

        const watchHistory =
          JSON.parse(localStorage.getItem("watchHistory")) || [];
        const existingEntry = watchHistory.find(
          (i) =>
            i.mediaType === mediaType &&
            i.id === itemData.id &&
            (i.mediaType === "movie" ||
              (i.season === seasonNumber && i.episode === episodeNumber))
        );

        let savedTime = existingEntry?.currentTime || 0;
        const savedDuration = existingEntry?.duration || 0;
        const isCompleted =
          savedDuration > 0 && savedTime / savedDuration > 0.95;
        if (isCompleted) savedTime = 0;

        const posterToSave = getImageUrl(itemData?.poster_path);
        let thumbnailToSave = posterToSave;
        if (!isMovie && seasonDetails) {
          const currentEpisode = seasonDetails.episodes.find(
            (ep) => ep.episode_number === episodeNumber
          );
          thumbnailToSave =
            getImageUrl(currentEpisode?.still_path) || posterToSave;
        }

        const newItem = {
          id: itemData.id,
          mediaType,
          title: itemData.title || itemData.name,
          poster: posterToSave,
          thumbnail: thumbnailToSave,
          season: seasonNumber,
          episode: episodeNumber,
          progress: isCompleted ? 0 : existingEntry?.progress || 0,
          currentTime: savedTime,
          duration: savedDuration,
        };

        setWatchHistoryItem(newItem);
        setInitialSeekTime(savedTime);
        debouncedUpdateHistory(newItem);
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
        isInitialLoad.current = true;
      }
    };

    fetchDetails();
  }, [
    mediaType,
    id,
    isMovie,
    seasonNumber,
    episodeNumber,
    debouncedUpdateHistory,
  ]);

  // Listen for Videasy iframe messages
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== "https://player.videasy.net") return;
      try {
        const fullData = JSON.parse(event.data);
        if (fullData.type === "MEDIA_DATA" && fullData.data) {
          const historyData = JSON.parse(fullData.data);
          const key = isMovie ? `movie-${id}` : `tv-${id}`;
          const itemProgressData = historyData[key];
          if (itemProgressData) {
            setWatchHistoryItem((prev) => {
              const updatedTime = itemProgressData.progress.watched;
              const updatedDuration = itemProgressData.progress.duration;
              const updatedEntry = {
                ...prev,
                currentTime: updatedTime,
                duration: updatedDuration,
                progress: (updatedTime / updatedDuration) * 100,
              };
              debouncedUpdateHistory(updatedEntry);
              return updatedEntry;
            });
            window.dispatchEvent(new Event("watchHistoryUpdated"));
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    const handleLoad = () => {
      if (isInitialLoad.current && initialSeekTime > 0 && iframeRef.current) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ type: "SEEK", time: initialSeekTime }),
          "https://player.videasy.net"
        );
        isInitialLoad.current = false;
      }
    };

    window.addEventListener("message", handleMessage);
    if (iframeRef.current)
      iframeRef.current.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("message", handleMessage);
      if (iframeRef.current)
        iframeRef.current.removeEventListener("load", handleLoad);
    };
  }, [mediaType, id, isMovie, initialSeekTime, debouncedUpdateHistory]);

  if (loading)
    return <div className="text-center p-10 text-slate-200">Loading...</div>;
  if (error)
    return (
      <div className="text-center p-10 text-red-500">
        Error: {error.message}
      </div>
    );
  if (!item)
    return (
      <div className="text-center p-10 text-slate-200">No item found.</div>
    );

  const title = isMovie ? item.title : item.name;
  const embedUrl = isMovie
    ? `https://player.videasy.net/movie/${item.id}?color=0092b8&overlay=true`
    : `https://player.videasy.net/tv/${item.id}/${seasonNumber}/${episodeNumber}?episodeSelector=true&nextEpisode=true&autoPlay=true&color=0092b8&overlay=true`;
  const iframeKey = isMovie
    ? `movie-${id}`
    : `tv-${id}-${seasonNumber}-${episodeNumber}`;

  return (
    <div className="bg-gray-800 min-h-screen text-slate-200 mt-15">
      <div className="container mx-auto p-4 md:p-6">
        {/* Video Player */}
        <div className="relative w-full pt-[60.25%] mb-6 overflow-hidden">
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full rounded"
            frameBorder="0"
            allowFullScreen
            style={{
              transform: "scale(0.9)",
              transformOrigin: "top left",
              width: "111%",
              height: "111%",
              pointerEvents: "auto",
            }}
          ></iframe>
        </div>

        {/* Poster + Details */}
        <div className="flex flex-col md:flex-row mt-5 rounded overflow-hidden group relative p-4 ">
          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6 w-full md:w-auto flex justify-center">
            <img
              src={getImageUrl(item?.poster_path)}
              alt={title || "No Title"}
              className="h-auto w-48 object-cover rounded-lg shadow-md"
            />
          </div>
          <div className="w-full mt-4 md:mt-0">
            <h1 className="text-2xl md:text-3xl text-slate-200 font-bold">
              {title}
            </h1>
            <p className="mt-4 text-slate-200 text-sm md:text-base">
              {item.overview}
            </p>
            <p className="text-sm text-slate-200 mt-4">
              ⭐ {item.vote_average?.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Episodes List */}
        {!isMovie && item?.number_of_seasons > 0 && seasonData && (
          <div className="mt-6">
            <button
              className="btn border bg-gray-900 border-gray-700"
              popoverTarget="popover-1"
              style={{ anchorName: "--anchor-1" }}
            >
              Season {seasonNumber}
            </button>
            <ul
              className="dropdown menu w-52 rounded-box bg-gray-900 shadow-sm"
              popover="auto"
              id="popover-1"
              style={{ positionAnchor: "--anchor-1" }}
            >
              {Array.from(
                { length: item.number_of_seasons },
                (_, i) => i + 1
              ).map((sNum) => (
                <li key={sNum}>
                  <Link
                    to={`/watch/tv/${item.id}/${sNum}/1`}
                    className="block px-4 py-2 text-neutral-300 hover:bg-gray-800 transition-colors duration-300"
                  >
                    Season {sNum}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4">Episodes</h2>
              <div className="overflow-y-auto max-h-[50vh]">
                <div className="flex flex-col space-y-4">
                  {seasonData.episodes.map((episode) => (
                    <Link
                      key={episode.episode_number}
                      to={`/watch/tv/${item.id}/${seasonNumber}/${episode.episode_number}`}
                      className={`flex p-3 rounded-lg border bg-gray-900 ${
                        episode.episode_number === episodeNumber
                          ? "border-gray-300 bg-gray-800"
                          : "border-gray-700"
                      } hover:border-blue-500 transition-colors duration-300 cursor-pointer`}
                    >
                      <div className="relative flex-none w-32 h-20 ">
                        <img
                          src={getImageUrl(episode.still_path)}
                          alt={episode.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                        {episode.episode_number === episodeNumber && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                            <span className="absolute z-10 inset-0 flex items-center justify-center bg-black/40 rounded-lg text-white text-3xl font-bold opacity-100">
                              ▶
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center ml-4">
                        <h3 className="text-base font-semibold">
                          E{episode.episode_number}: {episode.name}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {episode.overview}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommended */}
        <Recommended video={{ ...item, mediaType }} />
      </div>
    </div>
  );
}
