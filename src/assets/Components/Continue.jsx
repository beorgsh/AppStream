import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Continue = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      const savedHistory =
        JSON.parse(localStorage.getItem("watchHistory")) || [];
      setHistory(savedHistory);
    }
  }, [isOpen]);

  const handleContinue = (item) => {
    navigate(`/watch/${item.mediaType}/${item.id}`, {
      state: { season: item.season, episode: item.episode },
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-gray-900 text-white rounded-xl shadow-lg w-11/12 md:w-3/4 lg:w-1/2 max-h-[80vh] overflow-y-auto p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-xl hover:text-red-500"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-6">Continue Watching</h2>

        {history.length === 0 ? (
          <p className="text-gray-400">No watch history found.</p>
        ) : (
          <div className="space-y-4">
            {history.map((item, index) => {
              const progress = Math.min(item.progress || 0, 100);

              return (
                <div
                  key={index}
                  className="flex items-center space-x-4 bg-gray-800 rounded-lg overflow-hidden shadow hover:bg-gray-700 transition cursor-pointer"
                  onClick={() => handleContinue(item)}
                >
                  {/* Thumbnail */}
                  <img
                    src={item.thumbnail || item.poster}
                    alt={item.title}
                    className="w-28 h-16 object-cover"
                  />

                  {/* Info */}
                  <div className="flex-1 p-3">
                    <h3 className="font-semibold text-lg">
                      {item.title}
                      {item.mediaType === "tv" &&
                        ` S${item.season}E${item.episode}`}
                    </h3>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-gray-600 rounded mt-2">
                      <div
                        className="h-2 bg-cyan-500 rounded"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <p className="text-xs text-gray-400 mt-1">
                      {Math.floor(item.progress)}% watched
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Continue;
