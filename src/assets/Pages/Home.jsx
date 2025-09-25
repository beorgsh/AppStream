import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Carousel from "../Components/Carousel";
import "../../embla.css";
import Continue from "../Components/Continue";

export default function Home() {
  const [watchHistory, setWatchHistory] = useState([]);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ added
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const drag = useRef({ startX: 0, scrollLeft: 0, isMouseDown: false });

  const BASE_IMAGE_URL = "https://image.tmdb.org/t/p/w500";

  const OPTIONS = { align: "start", loop: true };
  const SLIDE_COUNT = 5;
  const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

  useEffect(() => {
    const handleHistoryUpdate = () => {
      setWatchHistory(JSON.parse(localStorage.getItem("watchHistory")) || []);
    };

    handleHistoryUpdate();

    window.addEventListener("watchHistoryUpdated", handleHistoryUpdate);

    return () => {
      window.removeEventListener("watchHistoryUpdated", handleHistoryUpdate);
    };
  }, []);

  const handleMouseDown = (e) => {
    drag.current.isMouseDown = true;
    drag.current.startX = e.pageX - sliderRef.current.offsetLeft;
    drag.current.scrollLeft = sliderRef.current.scrollLeft;
    setIsDragging(false);
    sliderRef.current.classList.add("cursor-grabbing");
  };

  const handleMouseMove = (e) => {
    if (!drag.current.isMouseDown) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - drag.current.startX) * 1.5;
    if (Math.abs(x - drag.current.startX) > 5) setIsDragging(true);
    sliderRef.current.scrollLeft = drag.current.scrollLeft - walk;
  };

  const handleMouseUp = () => {
    drag.current.isMouseDown = false;
    sliderRef.current.classList.remove("cursor-grabbing");
  };

  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const formatTimestamp = (seconds) => {
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    }
  };

  const groupedHistory = watchHistory.reduce((acc, item) => {
    if (item.mediaType === "movie") {
      const existing = acc.find(
        (i) => i.mediaType === "movie" && i.id === item.id
      );
      if (!existing) acc.push(item);
    } else {
      const existing = acc.find(
        (i) => i.mediaType === "tv" && i.id === item.id
      );
      if (!existing) {
        acc.push(item);
      } else if (
        item.season > existing.season ||
        (item.season === existing.season && item.episode > existing.episode)
      ) {
        Object.assign(existing, item);
      }
    }
    return acc;
  }, []);

  if (!groupedHistory.length)
    return <p className="text-gray-400 mt-4">No videos watched yet.</p>;

  return (
    <div>
      <div className="mt-6">
        <Continue isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        <div
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer flex gap-2 items-center text-xl font-bold text-slate-200 mb-3 rounded-lg"
        >
          Continue Watching
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </div>
        <div
          ref={sliderRef}
          className="flex space-x-4 -mx-2 p-2 cursor-grab select-none overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onMouseDown={handleMouseDown}
        >
          {groupedHistory.map((item, index) => {
            const watchLink =
              item.mediaType === "movie"
                ? `/watch/movie/${item.id}`
                : `/watch/tv/${item.id}/${item.season}/${item.episode}`;

            const progress = Math.min(item.progress || 0, 100);
            const currentTime = item.currentTime || 0;
            const duration = item.duration || 1;

            const posterPath =
              item.mediaType === "movie" ? item.poster : item.thumbnail;
            const imgSrc = posterPath
              ? `${BASE_IMAGE_URL}${posterPath}`
              : "/fallback.jpg";

            return (
              <div
                key={index}
                className="relative min-w-[200px] flex-shrink-0 group cursor-pointer rounded-lg"
                onClick={() => {
                  if (!isDragging) navigate(watchLink);
                }}
              >
                <img
                  src={imgSrc}
                  alt={item.title || "No Title"}
                  className="w-72 h-40 object-cover rounded-lg group-hover:brightness-75 transition"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                />
                <div className="absolute p-3 px-4 flex font-popin flex-col gap-[.4rem] z-20 w-full bottom-0 left-0 tracking-wide">
                  <div className="flex justify-between flex-grow">
                    <div className="flex gap-1 flex-col">
                      <span className="line-clamp-1 !leading-tight text-sm font-medium !capitalize"></span>
                      <p className="absolute z-10 bottom-8 mb-2 text-white text-sm font-medium">
                        {item.title}
                      </p>
                      <span className="text-[.7rem] !italic text-white">
                        {formatTimestamp(currentTime)} /{" "}
                        {formatTimestamp(duration)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/20 rounded-full overflow-hidden">
                    <hr
                      className="!border-cyan-500 !border-[.11rem]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="bg-green-900"></div>{" "}
                <span className="absolute z-40 top-2 left-2 text-sm text-white bg-black/50 px-1 rounded">
                  {item.mediaType === "movie"
                    ? "Movie"
                    : `S${item.season}E${item.episode}`}
                </span>
                <span className="absolute z-10 inset-0 flex items-center justify-center bg-black/40 rounded-lg text-white text-3xl font-bold opacity-100 group-hover:opacity-100 transition-opacity duration-300">
                  ▶
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
