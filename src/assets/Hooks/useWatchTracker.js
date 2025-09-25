// rename from hook to normal function
export function trackWatch(mediaType, id, season, episode, poster) {
  if (!id) return;

  const watchHistory = JSON.parse(localStorage.getItem("watchHistory")) || [];

  const exists = watchHistory.find(
    (item) =>
      item.id === id &&
      item.mediaType === mediaType &&
      item.season === season &&
      item.episode === episode
  );

  if (!exists) {
    watchHistory.push({
      id,
      mediaType,
      season,
      episode,
      poster,
      watchedAt: new Date().toISOString(),
    });

    localStorage.setItem("watchHistory", JSON.stringify(watchHistory));
  }
}
