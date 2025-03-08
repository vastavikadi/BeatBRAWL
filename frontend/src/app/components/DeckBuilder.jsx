"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CheckCircle,
  XCircle,
  Search,
  Music,
  Filter,
  Save,
  Play,
  RefreshCcw,
  Disc,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from "lucide-react";

// SongCard component
const SongCardComponent = ({ song, isSelected, onClick, showGameStats }) => {
  // Determine rarity colors
  const getRarityColor = (rarity = 'common') => {
    switch (rarity) {
      case 'legendary': return 'from-amber-400 to-yellow-600';
      case 'epic': return 'from-purple-500 to-indigo-700';
      case 'rare': return 'from-blue-400 to-indigo-600';
      case 'uncommon': return 'from-green-400 to-teal-600';
      default: return 'from-gray-400 to-slate-600'; // common
    }
  };
  
  return (
    <div
      onClick={onClick}
      className={`relative bg-gradient-to-br from-indigo-900/60 to-purple-900/60 backdrop-blur-md rounded-xl overflow-hidden border transition-all duration-300 shadow-lg h-full
        ${isSelected 
          ? 'border-primary shadow-primary/30 scale-105' 
          : 'border-white/10 hover:border-white/30 hover:scale-[1.02]'
        }`}
    >
      <div className="p-4 flex flex-col h-full">
        {showGameStats && (
          <div className="flex justify-between mb-3 font-mono text-xs">
            <div className="flex items-center text-red-400">
              <span>{song.power || 5}</span>
            </div>
            <div className="flex items-center text-blue-400">
              <span>{song.defense || 5}</span>
            </div>
          </div>
        )}
        
        <div className={`w-full aspect-square mb-4 rounded-lg overflow-hidden bg-gradient-to-br ${getRarityColor(song.rarity)}`}>
          {song.image ? (
            <img src={song.image} alt={song.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-12 h-12 text-white/80" />
            </div>
          )}
        </div>
        
        <div className="flex-grow">
          <h3 className="font-bold text-white text-lg line-clamp-1">{song.title}</h3>
          <p className="text-blue-200 text-sm line-clamp-1">{song.artist}</p>
        </div>
        
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-white">
            ✓
          </div>
        )}
      </div>
    </div>
  );
};

const DeckBuilder = ({ onStartGame, onClose }) => {
  // State
  const [allSongs, setAllSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    genre: "",
    rarity: "",
    sort: "title", // title, artist, power, defense
  });
  const [saving, setSaving] = useState(false);
  const [savedDecks, setSavedDecks] = useState([]);
  const [currentDeck, setCurrentDeck] = useState("");
  const [showSavedDecks, setShowSavedDecks] = useState(false);
  const [username, setUsername] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  // Constants
  const MAX_DECK_SIZE = 10;
  const MIN_DECK_SIZE = 5;
  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

  // Get username on component mount
  useEffect(() => {
    const storedUsername = localStorage.getItem("hiveUsername");
    console.log("Username from localStorage:", storedUsername);
    setUsername(storedUsername || "Guest");
  }, []);

  // Fetch user's songs when username changes
  useEffect(() => {
    const fetchData = async () => {
      if (!username || username === "Guest") {
        console.log("No username or user is Guest, skipping fetch");
        setLoading(false);
        return;
      }

      await Promise.all([
        fetchSongs(),
        fetchDecks()
      ]);
    };

    fetchData();
  }, [username]);

  // Fetch songs from API
  const fetchSongs = async () => {
    setLoading(true);
    setError("");
    setDebugInfo("Fetching songs...");

    try {
      console.log(`Fetching songs for user: ${username}`);
      const response = await axios.get(`${serverURL}/api/user-songs?username=${encodeURIComponent(username)}`);

      console.log("Songs API response:", response.data);
      setDebugInfo(`Songs API response status: ${response.status}`);

      if (response.data && response.data.songs && response.data.songs.length > 0) {
        // Add game stats if not present
        const songsWithStats = response.data.songs.map((song) => ({
          ...song,
          power: song.power || Math.floor(Math.random() * 10) + 1,
          defense: song.defense || Math.floor(Math.random() * 10) + 1,
          genre: song.genre || getRandomGenre(),
          rarity: song.rarity || getRandomRarity(),
          duration:
            song.duration ||
            `${Math.floor(Math.random() * 4) + 2}:${Math.floor(
              Math.random() * 60
            )
              .toString()
              .padStart(2, "0")}`,
        }));

        console.log(`Processed ${songsWithStats.length} songs with stats`);
        setAllSongs(songsWithStats);
        setDebugInfo(`Loaded ${songsWithStats.length} songs successfully`);
      } else {
        console.log("No songs found in response");
        setAllSongs([]);
        setError("No songs found in your collection");
        setDebugInfo("No songs found in API response");
      }
    } catch (err) {
      console.error("Error fetching songs:", err);
      setError(`Could not fetch your songs: ${err.message}`);
      setDebugInfo(`API Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved decks
  const fetchDecks = async () => {
    try {
      console.log(`Fetching decks for user: ${username}`);
      const response = await axios.get(
        `${serverURL}/api/user-decks?username=${encodeURIComponent(username)}`
      );

      console.log("Decks API response:", response.data);

      if (response.data && response.data.decks) {
        setSavedDecks(response.data.decks);
        console.log(`Loaded ${response.data.decks.length} decks`);
      } else {
        console.log("No decks found");
        setSavedDecks([]);
      }
    } catch (err) {
      console.error("Error fetching decks:", err);
      // Don't set an error for decks, just log it
    }
  };

  // Helper functions for random data when missing
  const getRandomGenre = () => {
    const genres = [
      "Pop",
      "Rock",
      "Hip Hop",
      "Electronic",
      "R&B",
      "Jazz",
      "Country",
      "Classical",
    ];
    return genres[Math.floor(Math.random() * genres.length)];
  };

  const getRandomRarity = () => {
    const rarities = [
      "common",
      "common",
      "common",
      "uncommon",
      "uncommon",
      "rare",
      "rare",
      "epic",
      "legendary",
    ];
    return rarities[Math.floor(Math.random() * rarities.length)];
  };

  // Handle toggling a song in the deck
  const toggleSongSelection = (song) => {
    if (selectedSongs.some((s) => s.id === song.id)) {
      // Remove song
      setSelectedSongs(selectedSongs.filter((s) => s.id !== song.id));
    } else {
      // Add song if not at max capacity
      if (selectedSongs.length < MAX_DECK_SIZE) {
        setSelectedSongs([...selectedSongs, song]);
      }
    }
  };

  // Save the current deck
  const saveDeck = async () => {
    if (selectedSongs.length < MIN_DECK_SIZE) {
      setError(`Your deck must contain at least ${MIN_DECK_SIZE} songs`);
      return;
    }

    const deckName = prompt(
      "Enter a name for your deck:",
      `Deck ${savedDecks.length + 1}`
    );

    if (!deckName) return;

    setSaving(true);
    setError("");

    try {
      const songIds = selectedSongs.map((song) => song.id);

      const response = await axios.post(`${serverURL}/api/save-deck`, {
        username,
        name: deckName,
        songs: songIds,
      });

      console.log("Save deck response:", response.data);

      if (response.data && response.data.success) {
        // Update saved decks list
        setSavedDecks([...savedDecks, response.data.deck]);
        setCurrentDeck(response.data.deck.id);
        alert(`Deck "${deckName}" saved successfully!`);
      } else {
        setError("Failed to save deck");
      }
    } catch (err) {
      console.error("Error saving deck:", err);
      setError(`Server error when saving deck: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Load a saved deck
  const loadDeck = async (deckId) => {
    setLoading(true);
    setError("");

    try {
      console.log(`Loading deck with ID: ${deckId}`);
      const response = await axios.get(`${serverURL}/api/deck?id=${deckId}`);

      console.log("Load deck response:", response.data);

      if (response.data && response.data.deck) {
        const deckSongs = response.data.deck.songs;
        console.log("Deck songs:", deckSongs);
        console.log("All songs available:", allSongs);
        
        // Find the full song objects from our allSongs array
        const selectedSongObjects = allSongs.filter((song) =>
          deckSongs.includes(song.id)
        );

        console.log("Found matching songs:", selectedSongObjects);

        setSelectedSongs(selectedSongObjects);
        setCurrentDeck(deckId);
      } else {
        setError("Failed to load deck");
      }
    } catch (err) {
      console.error("Error loading deck:", err);
      setError(`Server error when loading deck: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort songs
  const filteredSongs = allSongs.filter((song) => {
    const matchesSearch =
      searchTerm === "" ||
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGenre = filters.genre === "" || song.genre === filters.genre;
    const matchesRarity =
      filters.rarity === "" || song.rarity === filters.rarity;

    return matchesSearch && matchesGenre && matchesRarity;
  });

  // Sort songs
  const sortedSongs = [...filteredSongs].sort((a, b) => {
    switch (filters.sort) {
      case "artist":
        return a.artist.localeCompare(b.artist);
      case "power":
        return (b.power || 0) - (a.power || 0);
      case "defense":
        return (b.defense || 0) - (a.defense || 0);
      default: // title
        return a.title.localeCompare(b.title);
    }
  });

  // Get unique genres and rarities for filter options
  const genres = [...new Set(allSongs.map((song) => song.genre))].filter(
    Boolean
  );
  const rarities = [...new Set(allSongs.map((song) => song.rarity))].filter(
    Boolean
  );

  // Force refresh songs button handler
  const handleForceRefresh = () => {
    fetchSongs();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Deck Builder</h1>

          <div className="flex gap-2">
            <button
              onClick={handleForceRefresh}
              className="p-2 rounded-lg bg-primary/30 hover:bg-primary/50 text-white transition-colors"
              title="Refresh Songs"
            >
              <RefreshCcw className="w-6 h-6" />
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/20 text-red-200 py-3 px-4 rounded-lg mb-6 flex items-center">
            <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Debug info - you can remove this in production */}
        {debugInfo && (
          <div className="bg-blue-500/20 text-blue-200 py-3 px-4 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>Debug: {debugInfo}</span>
          </div>
        )}

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left side - Selected Deck */}
          <div className="lg:col-span-1 bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Disc className="w-5 h-5 mr-2 text-primary" />
                Your Deck
              </h2>

              <div className="text-blue-200 text-sm">
                {selectedSongs.length}/{MAX_DECK_SIZE}
              </div>
            </div>

            {/* Selected songs list */}
            {selectedSongs.length === 0 ? (
              <div className="text-center py-8 text-blue-200">
                <Music className="w-12 h-12 mx-auto mb-2 text-blue-300/50" />
                <p>Select songs for your deck</p>
                <p className="text-xs text-blue-300/70 mt-1">
                  You need at least {MIN_DECK_SIZE} songs to create a deck
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                {selectedSongs.map((song) => (
                  <div
                    key={song.id}
                    className="bg-white/5 hover:bg-white/10 rounded-lg p-3 flex items-center justify-between group transition-colors border border-white/10"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-3">
                        <Music className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white text-sm line-clamp-1">
                          {song.title}
                        </h3>
                        <p className="text-blue-200 text-xs line-clamp-1">
                          {song.artist}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSongSelection(song)}
                      className="p-1.5 rounded-full bg-red-500/0 hover:bg-red-500/20 text-red-400/50 hover:text-red-400 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={saveDeck}
                disabled={selectedSongs.length < MIN_DECK_SIZE || saving}
                className="py-2 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Deck
              </button>

              <button
                onClick={() => setShowSavedDecks(!showSavedDecks)}
                className="py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center justify-center transition-colors"
              >
                {showSavedDecks ? (
                  <ChevronUp className="w-4 h-4 mr-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 mr-2" />
                )}
                Saved Decks
              </button>
            </div>

            {/* Saved decks section */}
            {showSavedDecks && (
              <div className="mt-4 bg-black/30 rounded-lg p-3 border border-white/10">
                <h3 className="text-sm font-medium text-white mb-2">
                  Saved Decks
                </h3>

                {savedDecks.length === 0 ? (
                  <p className="text-xs text-blue-200 py-2">
                    No saved decks found
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                    {savedDecks.map((deck) => (
                      <div
                        key={deck._id || deck.id}
                        className={`flex items-center justify-between text-sm p-2 rounded-lg transition-colors cursor-pointer ${
                          currentDeck === (deck._id || deck.id)
                            ? "bg-primary/20 border border-primary/40"
                            : "bg-white/5 hover:bg-white/10 border border-white/10"
                        }`}
                        onClick={() => loadDeck(deck._id || deck.id)}
                      >
                        <div className="flex items-center">
                          <Disc
                            className={`w-4 h-4 mr-2 ${
                              currentDeck === (deck._id || deck.id)
                                ? "text-primary"
                                : "text-blue-300"
                            }`}
                          />
                          <span className="text-white">{deck.name}</span>
                        </div>
                        <span className="text-xs text-blue-200">
                          {deck.songs?.length || 0} songs
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {onStartGame && selectedSongs.length >= MIN_DECK_SIZE && (
                  <button
                    onClick={() => onStartGame(currentDeck)}
                    className="mt-3 w-full py-2 px-4 bg-green-600/70 hover:bg-green-600 text-white rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play with Current Deck
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right side - Song Collection */}
          <div className="lg:col-span-2 bg-black/20 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-3">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Music className="w-5 h-5 mr-2 text-blue-400" />
                Your Song Collection {allSongs.length > 0 && `(${allSongs.length})`}
              </h2>

              {/* Search and filters */}
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search songs..."
                    className="w-full md:w-64 bg-white/5 border border-white/20 text-white pl-9 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
                </div>

                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center bg-white/10 hover:bg-white/15 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            {/* Filter options */}
            {filterOpen && (
              <div className="mb-4 bg-black/30 rounded-lg p-3 grid grid-cols-1 md:grid-cols-3 gap-3 border border-white/10">
                {/* Genre filter */}
                <div>
                  <label className="block text-xs font-medium text-blue-300 mb-1">
                    Genre
                  </label>
                  <select
                    value={filters.genre}
                    onChange={(e) =>
                      setFilters({ ...filters, genre: e.target.value })
                    }
                    className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">All Genres</option>
                    {genres.map((genre) => (
                      <option key={genre} value={genre}>
                        {genre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rarity filter */}
                <div>
                  <label className="block text-xs font-medium text-blue-300 mb-1">
                    Rarity
                  </label>
                  <select
                    value={filters.rarity}
                    onChange={(e) =>
                      setFilters({ ...filters, rarity: e.target.value })
                    }
                    className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">All Rarities</option>
                    {rarities.map((rarity) => (
                      <option
                        key={rarity}
                        value={rarity}
                        className="capitalize"
                      >
                        {rarity}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort options */}
                <div>
                  <label className="block text-xs font-medium text-blue-300 mb-1">
                    Sort By
                  </label>
                  <select
                    value={filters.sort}
                    onChange={(e) =>
                      setFilters({ ...filters, sort: e.target.value })
                    }
                    className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="title">Title</option>
                    <option value="artist">Artist</option>
                    <option value="power">Power (High to Low)</option>
                    <option value="defense">Defense (High to Low)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Songs grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <RefreshCcw className="w-10 h-10 text-blue-400 animate-spin" />
              </div>
            ) : sortedSongs.length === 0 ? (
              <div className="text-center py-12 text-blue-200">
                <SlidersHorizontal className="w-12 h-12 mx-auto mb-2 text-blue-300/50" />
                {allSongs.length > 0 ? (
                  <>
                    <p className="text-lg">No songs match your filters</p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilters({ genre: "", rarity: "", sort: "title" });
                      }}
                      className="mt-3 text-primary hover:text-primary/80 text-sm"
                    >
                      Clear filters
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-lg">No songs found in your collection</p>
                    <button
                      onClick={handleForceRefresh}
                      className="mt-3 px-4 py-2 bg-primary/50 hover:bg-primary/70 text-white rounded-lg flex items-center justify-center mx-auto"
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Refresh Songs
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedSongs.map((song) => (
                  <SongCardComponent
                    key={song.id}
                    song={song}
                    isSelected={selectedSongs.some((s) => s.id === song.id)}
                    onClick={() => toggleSongSelection(song)}
                    showGameStats={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckBuilder;
