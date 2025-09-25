import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiMenu, HiX, HiSearch } from "react-icons/hi";
import { searchMulti, getImageUrl } from "../Services/TmdbApi"; // your API function

export default function Header() {
  const location = useLocation();
  const url = location.pathname;

  const [search, setSearch] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Movies", href: "/movies" },
    { name: "TV Show", href: "/tv" },
    { name: "About", href: "/about" },
  ];

  // open/close functions
  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
    setSearch("");
    setSearchResults([]);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Live search effect
  useEffect(() => {
    if (search.trim() === "") {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const results = await searchMulti(search);
        setSearchResults(results);
      } catch (err) {
        console.error("Error searching:", err);
      }
    }, 300); // debounce 300ms

    return () => clearTimeout(delayDebounce);
  }, [search]);

  return (
    <>
      <header className="fixed top-0 z-50 w-full">
        <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 p-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
            {/* Logo */}
            <Link
              to="/"
              className="text-xl font-bold text-white flex items-center"
            >
              <svg
                width="50"
                height="40"
                viewBox="0 0 160 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="5"
                  y="5"
                  width="150"
                  height="150"
                  rx="12"
                  fill="#1F2937"
                />

                <polygon points="50,50 50,110 120,80" fill="#FFFFFF" />

                <path
                  d="M20 130 C50 110, 110 110, 140 130"
                  stroke="#9CA3AF"
                  stroke-width="3"
                  fill="none"
                  stroke-linecap="round"
                />
                <path
                  d="M30 140 C60 120, 100 120, 130 140"
                  stroke="#9CA3AF"
                  stroke-width="3"
                  fill="none"
                  stroke-linecap="round"
                />
              </svg>
              AppStream
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden xl:flex items-center space-x-6">
              {navLinks.map((link) => {
                const isActive = url === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`relative inline-block text-neutral-300 transition-colors duration-300 ${
                      isActive ? "text-white" : "hover:text-white"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              {/* Desktop Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="ml-4 w-48 rounded-full border border-white/30 bg-neutral-800 py-1 pl-4 pr-10 text-neutral-200 placeholder-neutral-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={openSearchModal}
                />
                <HiSearch className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              </div>
            </nav>

            {/* Mobile Buttons */}
            <div className="flex items-center xl:hidden space-x-4">
              <button
                onClick={openSearchModal}
                className="text-neutral-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <HiSearch className="h-6 w-6" />
              </button>
              <button
                onClick={toggleMobileMenu}
                className="focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {isMobileMenuOpen ? (
                  <HiX className="h-6 w-6 text-neutral-300" />
                ) : (
                  <HiMenu className="h-6 w-6 text-neutral-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-neutral-900/90 backdrop-blur-md p-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2 text-lg font-medium text-neutral-300 hover:text-white`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Search Modal */}
      {isSearchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4"
          onClick={closeSearchModal} // click outside modal closes it
        >
          {/* Modal Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

          {/* Modal Content */}
          <div
            className="relative w-full max-w-lg bg-neutral-900/90 rounded-xl border border-white/20 p-4 shadow-lg mt-20"
            onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
          >
            <input
              type="text"
              placeholder="Search movies or series..."
              className="w-full rounded-md border border-white/30 bg-neutral-800 py-3 pl-4 pr-4 text-neutral-200 placeholder-neutral-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />

            <div className="mt-4 max-h-80 overflow-y-auto">
              {searchResults.length === 0 && search && (
                <p className="text-gray-400 text-sm">No results found.</p>
              )}

              {searchResults.map((item) => (
                <Link
                  key={item.id}
                  to={`/watch/${item.media_type}/${item.id}`}
                  className="flex items-center space-x-2 p-2 rounded hover:bg-gray-800 transition-colors"
                  onClick={closeSearchModal}
                >
                  <img
                    src={getImageUrl(item.poster_path)}
                    alt={item.title || item.name}
                    className="w-10 h-14 object-cover rounded"
                  />
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {item.title || item.name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {item.media_type.toUpperCase()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
