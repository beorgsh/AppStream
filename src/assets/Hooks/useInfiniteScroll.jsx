import { useState, useEffect, useRef, useCallback } from "react";

export const useInfiniteScroll = (fetchFunction) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const loaderRef = useRef(null);

  // ✅ Fetch next page
  const loadMore = useCallback(async () => {
    if (loading) return;
    try {
      setLoading(true);
      const newData = await fetchFunction(page);

      if (newData.length === 0) {
        setHasMore(false);
      } else {
        // Deduplicate by `id`
        setData((prev) => {
          const map = new Map(
            [...prev, ...newData].map((item) => [item.id, item])
          );
          return Array.from(map.values());
        });
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, page, loading]);

  // ✅ Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [loadMore, hasMore, loading]);

  // ✅ First load
  useEffect(() => {
    loadMore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, loaderRef, hasMore };
};
