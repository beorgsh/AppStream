import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Carousel from "../Components/Carousel";
import { getTrending, getMediaLogo } from "../Services/TmdbApi";

export default function RootLayout() {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();

  // Show carousel only on home page
  const showCarousel = location.pathname === "/";

  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        const results = await getTrending("movie", "week");
        const top10 = results.slice(0, 10);

        const itemsWithLogos = await Promise.all(
          top10.map(async (item) => {
            const logoPath = await getMediaLogo("movie", item.id);
            return { ...item, logo_path: logoPath };
          })
        );

        setTrending(itemsWithLogos);
      } catch (err) {
        setError("Failed to fetch trending movies.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex flex-col bg-gray-900 text-gray-200 ">
      {/* Header with bottom margin */}
      <Header className="" />

      {/* Carousel full-screen, no extra margin */}
      {showCarousel && trending.length > 0 && (
        <div className="w-full">
          <Carousel
            slides={trending}
            options={{ align: "start", loop: true }}
          />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 container mx-auto p-4">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
