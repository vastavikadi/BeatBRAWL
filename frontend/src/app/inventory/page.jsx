"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ShoppingCart,
  Play,
  Pause,
  Volume2,
  Award,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Swal from "sweetalert2";

const MusicInventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGenre, setFilterGenre] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [songsPerPage] = useState(5);
  const [isPlayingPreview, setIsPlayingPreview] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "title",
    direction: "asc",
  });
  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

  // Fetch songs from API
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${serverURL}/api/songs`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Transform API data to match the expected format
        const transformedSongs = data.map((song) => ({
          id: song._id,
          title: song.song,
          artist: song.artist,
          album: song.album || "Unknown Album",
          genre: song.genre,
          year: song.year,
          duration: song.formattedDuration,
          price: Math.floor(Math.random() * 4) + 3, // Mock price between 3-6 HIVE
          popularity: Math.floor(Math.random() * 100), // Mock popularity score
        }));

        setSongs(transformedSongs);
        setError(null);
      } catch (err) {
        console.error("Error fetching songs:", err);
        setError("Failed to load songs. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []);

  // Generate available genres and years for filtering from API data
  const getUniqueGenres = () => {
    const uniqueGenres = [...new Set(songs.map((song) => song.genre))];
    return ["All", ...uniqueGenres];
  };

  const getUniqueDecades = () => {
    if (songs.length === 0) return ["All"];

    const decades = songs.map((song) => {
      const year = parseInt(song.year);
      return `${Math.floor(year / 10) * 10}s`;
    });

    return ["All", ...new Set(decades)].sort();
  };

  // Filter and sort logic
  const filteredSongs = songs
    .filter((song) => {
      // Search term filter
      const matchesSearch =
        (song.title &&
          song.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (song.artist &&
          song.artist.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (song.album &&
          song.album.toLowerCase().includes(searchTerm.toLowerCase()));

      // Genre filter
      const matchesGenre = filterGenre === "All" || song.genre === filterGenre;

      // Year filter
      let matchesYear = true;
      if (filterYear !== "All") {
        const decade = filterYear.slice(0, -1);
        const startYear = parseInt(decade);
        matchesYear = song.year >= startYear && song.year < startYear + 10;
      }

      return matchesSearch && matchesGenre && matchesYear;
    })
    .sort((a, b) => {
      if (sortConfig.key) {
        const direction = sortConfig.direction === "asc" ? 1 : -1;
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return -1 * direction;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return 1 * direction;
        }
      }
      return 0;
    });

  // Pagination
  const indexOfLastSong = currentPage * songsPerPage;
  const indexOfFirstSong = indexOfLastSong - songsPerPage;
  const currentSongs = filteredSongs.slice(indexOfFirstSong, indexOfLastSong);
  const totalPages = Math.ceil(filteredSongs.length / songsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  // Sort handler
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Server-side update function - extracted from handlePurchase
  const handleServerSideUpdate = async (username, song, price) => {
    try {
      // Validate username
      if (!username || username.trim() === '') {
        throw new Error("Username is required for purchase");
      }
      
      setIsLoading(true);
      setError("");
      setSuccess("");

      console.log("Sending data to server:", {
        username,
        song: song.id,
        paymentAmount: price,
      });

      // Call your backend API to add the song to user's collection
      const upgradeResponse = await fetch(
        `${serverURL}/api/upgrade`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username, // Will map to hiveUsername on server
            song: song.id,
            paymentAmount: price,
          }),
        }
      );

      // For debugging - get the raw response text
      const responseText = await upgradeResponse.text();
      console.log("Raw server response:", responseText);
      
      // Try to parse as JSON if possible
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.log("Response is not valid JSON:", e);
        throw new Error(`Server error: ${responseText || upgradeResponse.status}`);
      }

      if (!upgradeResponse.ok) {
        throw new Error(`Server error: ${data.message || upgradeResponse.statusText}`);
      }

      if (data.success) {
        setSuccess(`Successfully purchased "${song.title}" by ${song.artist}`);
        Swal.fire({
          title: "Purchase Successful!",
          html: `You now own <strong>"${song.title}"</strong> by ${song.artist}`,
          icon: "success",
          confirmButtonColor: "#10b981",
          background: "#1f2937",
          color: "#fff"
        });
        return true;
      } else {
        throw new Error(data.message || "Purchase failed");
      }
    } catch (err) {
      console.error("Error processing purchase:", err);
      
      // Show specific error message
      Swal.fire({
        title: "Purchase Error",
        html: `<p>There was an issue completing your purchase:</p>
               <p class="text-red-500 mt-2">${err.message}</p>
               <p class="text-sm mt-2">Please try again or contact support.</p>`,
        icon: "error",
        confirmButtonColor: "#10b981",
        background: "#1f2937",
        color: "#fff"
      });
      
      setError(`Error recording purchase: ${err.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Purchase handler using Hive keychain - updated to use handleServerSideUpdate
  const handlePurchase = (song) => {
    const username = localStorage.getItem("hiveUsername");
    const price = song.price;
  
    if (!username) {
      Swal.fire({
        title: "Authentication Required",
        text: "Please log in first to purchase this song.",
        icon: "warning",
        confirmButtonColor: "#10b981",
        background: "#1f2937",
        color: "#fff",
      });
      return;
    }
  
    if (window.hive_keychain) {
      try {
        // Ensure this is properly formatted for Hive Keychain
        const receivingAccount = "vastavik.adi";
        
        // Format the amount correctly - must be a string with 3 decimal places at most
        const amount = parseFloat(price).toFixed(3);
        
        const memo = `Payment for MUSIC-HIVE: ${song.title} by ${song.artist}`;
        const currency = "HIVE";
  
        console.log("Transfer details:", {
          username,
          receivingAccount,
          amount,
          memo,
          currency,
        });
  
        // Show processing modal
        Swal.fire({
          title: "Processing Payment",
          text: "Please confirm the transaction in your Hive Keychain extension.",
          allowOutsideClick: false,
          showConfirmButton: false,
          background: "#1f2937",
          color: "#fff",
          didOpen: () => {
            Swal.showLoading();
          },
        });
  
        // Use setTimeout to ensure Keychain is ready
        setTimeout(() => {
          // Request transfer using Hive Keychain with properly formatted parameters
          window.hive_keychain.requestTransfer(
            username.trim(), // Ensure no whitespace
            receivingAccount.trim(), // Ensure no whitespace
            amount,
            memo,
            currency,
            async (response) => {
              // Log the full response for debugging
              console.log("Hive Keychain response:", response);
              
              if (response) {
                if (response.success) {
                  // Close the processing modal
                  Swal.close();
                  
                  // After payment success, call the server-side update function
                  await handleServerSideUpdate(username, song, price);
                } else {
                  // Display the specific error from Hive Keychain
                  const errorMessage = response.error || "The transaction could not be completed.";
                  console.error("Hive Keychain error:", errorMessage);
                  
                  Swal.fire({
                    title: "Payment Failed",
                    text: `${errorMessage} Please try again.`,
                    icon: "error",
                    confirmButtonColor: "#10b981",
                    background: "#1f2937",
                    color: "#fff",
                  });
                }
              } else {
                console.error("Hive Keychain returned null response.");
                Swal.fire({
                  title: "Error",
                  text: "Error processing payment. Please try again.",
                  icon: "error",
                  confirmButtonColor: "#10b981",
                  background: "#1f2937",
                  color: "#fff",
                });
              }
            },
            false // Ensure this is false for real transactions
          );
        }, 500); // Small delay to ensure Keychain is ready
      } catch (error) {
        console.error("Error processing payment:", error);
        Swal.fire({
          title: "Error",
          text: `Error processing payment: ${error.message}`,
          icon: "error",
          confirmButtonColor: "#10b981",
          background: "#1f2937",
          color: "#fff",
        });
      }
    } else {
      Swal.fire({
        title: "Hive Keychain Required",
        text: "Hive Keychain is not installed. Please install the extension to make purchases.",
        icon: "info",
        confirmButtonColor: "#10b981",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  // Simulate playing a preview
  const togglePreview = (songId) => {
    if (isPlayingPreview === songId) {
      setIsPlayingPreview(null);
    } else {
      setIsPlayingPreview(songId);
    }
  };

  // Skeleton loader for songs
  const SongSkeleton = () => (
    <div className="animate-pulse">
      {[...Array(songsPerPage)].map((_, index) => (
        <div key={index} className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-700 rounded-md"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="w-16 h-8 bg-gray-700 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen p-6 relative overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-green-500 rounded-full filter blur-3xl opacity-5 animate-blob"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl opacity-5 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header with glowing effect */}
      <div className="flex items-center justify-between mb-8 z-10 relative">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 drop-shadow-glow">
          Music Marketplace
        </h1>
      </div>

      {/* Search and filters */}
      <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl mb-6 shadow-xl transform transition-all duration-300 hover:shadow-green-900/10 border border-gray-700/50 z-10">
        <div className="flex items-center mb-4 relative">
          <Search className="w-5 h-5 absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search for songs, artists, or albums..."
            className="bg-gray-700/70 text-white w-full pl-10 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-300 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2 bg-gray-700/50 px-3 py-2 rounded-lg">
            <Filter className="w-4 h-4 text-green-400" />
            <span className="text-gray-300">Genre:</span>
            <select
              className="bg-transparent text-white border-none focus:outline-none focus:ring-0"
              value={filterGenre}
              onChange={(e) => {
                setFilterGenre(e.target.value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
            >
              {getUniqueGenres().map((genre) => (
                <option
                  key={genre}
                  value={genre}
                  className="bg-gray-800 text-white"
                >
                  {genre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-gray-700/50 px-3 py-2 rounded-lg">
            <Filter className="w-4 h-4 text-green-400" />
            <span className="text-gray-300">Era:</span>
            <select
              className="bg-transparent text-white border-none focus:outline-none focus:ring-0"
              value={filterYear}
              onChange={(e) => {
                setFilterYear(e.target.value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
            >
              {getUniqueDecades().map((year) => (
                <option
                  key={year}
                  value={year}
                  className="bg-gray-800 text-white"
                >
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results summary */}
      <div className="flex justify-between items-center mb-4 z-10">
        <p className="text-gray-300">
          {filteredSongs.length === 0
            ? "No songs found"
            : `Showing ${indexOfFirstSong + 1}-${Math.min(
                indexOfLastSong,
                filteredSongs.length
              )} of ${filteredSongs.length} songs`}
        </p>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => requestSort("title")}
            className="flex items-center text-gray-300 hover:text-green-400 transition-colors"
          >
            <span>Title</span>
            {sortConfig.key === "title" &&
              (sortConfig.direction === "asc" ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              ))}
          </button>

          <button
            onClick={() => requestSort("year")}
            className="flex items-center text-gray-300 hover:text-green-400 transition-colors"
          >
            <span>Year</span>
            {sortConfig.key === "year" &&
              (sortConfig.direction === "asc" ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              ))}
          </button>

          <button
            onClick={() => requestSort("popularity")}
            className="flex items-center text-gray-300 hover:text-green-400 transition-colors"
          >
            <span>Popularity</span>
            {sortConfig.key === "popularity" &&
              (sortConfig.direction === "asc" ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              ))}
          </button>
        </div>
      </div>

      {/* Song list with card-based design */}
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-gray-700/50 z-10">
        {isLoading ? (
          <SongSkeleton />
        ) : error ? (
          <div className="p-8 text-center text-red-400 bg-red-900/20 rounded-lg m-4">
            <div className="text-2xl mb-2">⚠️</div>
            {error}
          </div>
        ) : currentSongs.length > 0 ? (
          <div className="divide-y divide-gray-700/50">
            {currentSongs.map((song) => (
              <div
                key={song.id}
                className="p-4 hover:bg-gray-700/50 transition duration-300 transform hover:scale-[1.01]"
              >
                <div className="flex items-center">
                  {/* Song preview button */}
                  <button
                    onClick={() => togglePreview(song.id)}
                    className={`mr-4 p-2 rounded-full ${
                      isPlayingPreview === song.id
                        ? "bg-green-500 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {isPlayingPreview === song.id ? (
                      <Pause size={18} />
                    ) : (
                      <Play size={18} />
                    )}
                  </button>

                  {/* Song info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-lg text-white group-hover:text-green-400">
                          {song.title}
                        </h3>
                        <p className="text-gray-400 text-sm">{song.artist}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 text-sm">
                          {song.year}
                        </span>
                        <span className="text-gray-400 px-2">•</span>
                        <span className="text-gray-400 text-sm">
                          {song.genre}
                        </span>
                        <span className="text-gray-400 px-2">•</span>
                        <span className="text-gray-400 text-sm">
                          {song.duration}
                        </span>
                      </div>
                    </div>

                    {/* Additional song metadata - popularity bar */}
                    <div className="mt-2 flex items-center">
                      <span className="text-xs text-gray-500 mr-2">
                        Popularity:
                      </span>
                      <div className="h-1 bg-gray-700 flex-1 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                          style={{ width: `${song.popularity}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Preview player (if playing) */}
                    {isPlayingPreview === song.id && (
                      <div className="mt-3 py-2 px-3 bg-gray-700/50 rounded-lg flex items-center animate-fade-in">
                        <Volume2 size={14} className="text-green-400 mr-2" />
                        <div className="text-xs text-gray-300">
                          Now previewing "{song.title}"
                        </div>
                        <div className="ml-auto flex items-center space-x-1">
                          <div className="w-1 h-3 bg-green-400 rounded-full animate-equalizer-1"></div>
                          <div className="w-1 h-5 bg-green-400 rounded-full animate-equalizer-2"></div>
                          <div className="w-1 h-4 bg-green-400 rounded-full animate-equalizer-3"></div>
                          <div className="w-1 h-2 bg-green-400 rounded-full animate-equalizer-1"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price and purchase */}
                  <div className="ml-4 flex items-center">
                    <div className="text-green-400 font-medium mr-3 bg-green-900/20 py-1 px-3 rounded-full">
                      {song.price} HIVE
                    </div>
                    <button
                      onClick={() => handlePurchase(song)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-2 rounded-full shadow-lg shadow-green-900/20 transition-all duration-300 transform hover:scale-105"
                      disabled={isLoading}
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <div className="text-5xl mb-4">🎵</div>
            <p>No songs match your search criteria</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterGenre("All");
                setFilterYear("All");
              }}
              className="mt-4 text-green-400 hover:text-green-500 underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {filteredSongs.length > 0 && (
          <div className="p-4 flex justify-center items-center space-x-2 border-t border-gray-700/50">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-full ${
                currentPage === 1
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <ChevronLeft size={20} />
            </button>

            {[...Array(totalPages)].map((_, i) => {
              // Only show 5 page buttons at a time with ellipsis
              if (
                i === 0 || // Always show first page
                i === totalPages - 1 || // Always show last page
                (i >= currentPage - 2 && i <= currentPage + 1) // Show current page and neighbors
              ) {
                return (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentPage === i + 1
                        ? "bg-green-500 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              } else if (
                (i === 1 && currentPage > 3) ||
                (i === totalPages - 2 && currentPage < totalPages - 3)
              ) {
                // Show ellipsis
                return (
                  <span key={i} className="text-gray-500">
                    ...
                  </span>
                );
              }
              return null;
            })}

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-full ${
                currentPage === totalPages
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Hive keychain info */}
      <div className="mt-6 bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl text-center text-gray-300 shadow-xl border border-gray-700/50 z-10 flex flex-col md:flex-row items-center justify-center">
        <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 p-4 rounded-full mr-4 mb-4 md:mb-0">
          <Award className="w-10 h-10 text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-green-400 mb-1">
            Secure Blockchain Payments
          </h3>
          <p>
            All purchases are secured with Hive Keychain. HIVE tokens will be
            transferred directly to artists.
          </p>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.2));
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-equalizer-1 {
          animation: equalizer 1s ease-in-out infinite alternate;
        }

        .animate-equalizer-2 {
          animation: equalizer 0.8s ease-in-out infinite alternate;
        }

        .animate-equalizer-3 {
          animation: equalizer 1.2s ease-in-out infinite alternate;
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes equalizer {
          0% {
            height: 2px;
          }
          100% {
            height: 8px;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default MusicInventory;