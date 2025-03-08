"use client";
import React, { useEffect, useState, useRef, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { SONG_CARDS } from "../../constants";
import { getSocket } from "../../utils/socket.js";
import { 
  X, Music,Spade, User, Disc, ChevronLeft, LogOut, 
  Gift, Sparkles, AlertCircle, RefreshCcw, Volume2, VolumeX
} from "lucide-react";

// Integrated with your user model structure (hiveUsername instead of username)
export default function Home() {
  const [roomId, setRoomId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [socketId, setSocketId] = useState<string>("");
  const [socketInstance, setSocketInstance] = useState<any>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [username, setUsername] = useState<string>("");
  const [ownedSongs, setOwnedSongs] = useState<any[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [songError, setSongError] = useState<string>("");
  
  // New state variables for claim button
  const [canClaimSongs, setCanClaimSongs] = useState<boolean>(false);
  const [checkingClaimStatus, setCheckingClaimStatus] = useState<boolean>(false);
  const [claimError, setClaimError] = useState<string>("");
  const [claimingInProgress, setClaimingInProgress] = useState<boolean>(false);
  const [showClaimSuccess, setShowClaimSuccess] = useState<boolean>(false);
  const [claimedSongs, setClaimedSongs] = useState<any[]>([]);
  
  const router = useRouter();
  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

  useEffect(() => {
    // Set username from localStorage
    const storedUsername = localStorage.getItem("hiveUsername");
    setUsername(storedUsername || "Guest");
    console.log("Current username:", storedUsername);
    
    // Fetch owned songs if username exists
    if (storedUsername && storedUsername !== "Guest") {
      fetchOwnedSongs(storedUsername);
      
      // FIXED: Force canClaimSongs to true initially for better UX
      // This ensures the button appears right away
      setCanClaimSongs(true);
      
      // Then check if user can claim songs
      checkClaimStatus(storedUsername);
    }
    
    // Audio setup
    audioRef.current = new Audio("/music.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    const playAudio = () => {
      audioRef.current?.play().catch((err) => {
        console.error("Failed to play audio:", err);
      });

      document.removeEventListener("click", playAudio);
      document.removeEventListener("keydown", playAudio);
    };

    document.addEventListener("click", playAudio);
    document.addEventListener("keydown", playAudio);

    // Socket setup
    const socket = getSocket();
    setSocketInstance(socket);

    socket.on("connect", () => {
      setSocketId(socket.id!);
      localStorage.setItem("socketId", socket.id!);
    });

    return () => {
      socket.off("connect");
      document.removeEventListener("click", playAudio);
      document.removeEventListener("keydown", playAudio);
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  // FIXED: Improved claim status check with better logging
  const checkClaimStatus = async (username: string) => {
    if (username === "Guest") return;
    
    setCheckingClaimStatus(true);
    setClaimError("");
    
    try {
      console.log("Checking claim status for:", username);
      const response = await axios.get(`${serverURL}/api/claim-status?username=${encodeURIComponent(username)}`);
      console.log("Claim status response:", response.data);
      
      // Directly set canClaimSongs based on the response
      if (response.data && response.data.success) {
        setCanClaimSongs(response.data.canClaim);
        console.log("Can claim songs set to:", response.data.canClaim);
      } else {
        // If the endpoint exists but returned an error, assume user can claim for better UX
        console.log("Assuming user can claim (API success was false)");
        setCanClaimSongs(true);
      }
    } catch (err: any) {
      console.error("Error checking claim status:", err);
      
      // If the endpoint doesn't exist yet, assume the user can claim
      // This is better UX than hiding the button due to API errors
      console.log("Assuming user can claim (API error)");
      setCanClaimSongs(true);
      
      setClaimError("Could not verify claim eligibility, but you can try claiming");
    } finally {
      setCheckingClaimStatus(false);
    }
  };

  // FIXED: Added debug function
  const debugClaimButton = () => {
    console.log({
      username,
      isGuest: username === "Guest",
      canClaimSongs,
      checkingClaimStatus,
      shouldShowButton: canClaimSongs && username !== "Guest" && !checkingClaimStatus
    });
  };

  // Claim initial songs
  const claimInitialSongs = async () => {
    if (username === "Guest") {
      setClaimError("Please log in to claim your songs");
      return;
    }
    
    setClaimingInProgress(true);
    setClaimError("");
    
    try {
      console.log("Claiming songs for:", username);
      const response = await axios.post(`${serverURL}/api/claim-initial-songs`, {
        username
      });
      
      console.log("Claim response:", response.data);
      
      if (response.data && response.data.success) {
        // Update owned songs with the newly claimed ones
        setClaimedSongs(response.data.songs);
        
        // Refresh owned songs list
        fetchOwnedSongs(username);
        
        // Show success animation
        setShowClaimSuccess(true);
        
        // Update claim status
        setCanClaimSongs(false);
      } else {
        setClaimError(response.data?.message || "Failed to claim songs");
      }
    } catch (err: any) {
      console.error("Error claiming songs:", err);
      setClaimError(err.response?.data?.message || "Server error. Try again.");
    } finally {
      setClaimingInProgress(false);
    }
  };

  // Fetch owned songs from backend
  const fetchOwnedSongs = async (username: string) => {
    setLoadingSongs(true);
    setSongError("");
    
    try {
      const response = await axios.get(`${serverURL}/api/user-songs?username=${encodeURIComponent(username)}`);
      
      if (response.data && response.data.songs) {
        setOwnedSongs(response.data.songs);
      } else {
        setOwnedSongs([]);
      }
    } catch (err: any) {
      console.error("Error fetching owned songs:", err);
      setSongError("Could not fetch your owned songs");
      setOwnedSongs([]);
    } finally {
      setLoadingSongs(false);
    }
  };

  const createRoom = async () => {
    setError("");
    if (!socketId) {
      setError("Socket connection failed. Please refresh and try again.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${serverURL}/create-room`, {
        socketId,
      });

      if (response.data.roomId) {
        const roomId = response.data.roomId;

        socketInstance.emit("joinRoom", {
          roomId,
          cards: SONG_CARDS,
          socketId,
        });
        router.push(`/match?roomId=${roomId}`);
      } else {
        setError("Failed to create room");
      }
    } catch (err: any) {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    setError("");
    if (!roomId) {
      setError("Enter a valid Room ID");
      return;
    }

    if (!socketId) {
      setError("Socket connection failed. Please refresh and try again.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${serverURL}/join-room`, {
        roomId,
        socketId,
      });

      if (response.data.success) {
        socketInstance.emit("joinRoom", {
          roomId,
          cards: SONG_CARDS,
          socketId,
        });
        router.push(`/match?roomId=${roomId}`);
      } else {
        setError("Failed to join room");
      }
    } catch (err: any) {
      setError("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMute = (event: MouseEvent<HTMLButtonElement>) => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const goToMusicMarketplace = () => {
    router.push("/inventory");
  };
  const goToCardDeck = () => {
    router.push("/card-deck");
  };

  const logout = () => {
    localStorage.removeItem("hiveUsername");
    setUsername("Guest");
    setOwnedSongs([]);
    setCanClaimSongs(false);
    router.push("/");
  };

  // Success modal component for claiming songs
  const ClaimSuccessModal = ({ isOpen, songs }: { isOpen: boolean; songs: any[] }) => {
    if (!isOpen) return null;

    const handleClose = () => {
      setShowClaimSuccess(false);
    };

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-indigo-900/90 rounded-2xl p-6 md:p-8 w-full max-w-lg border border-indigo-500/30 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <Gift className="w-6 h-6 mr-2 text-purple-400" />
              Songs Claimed!
            </h3>
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-2">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <p className="text-center text-blue-200 mb-6">
              You've successfully claimed 10 random songs for your collection!
            </p>

            <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto custom-scrollbar">
              {songs.map((song, index) => (
                <div 
                  key={index}
                  className="bg-white/10 p-3 rounded-lg border border-white/10 hover:bg-white/15 transition-colors"
                >
                  <div className="font-medium text-white">{song.title}</div>
                  <div className="text-sm text-blue-200">{song.artist}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-indigo-900 via-blue-900 to-indigo-800 flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-indigo-500 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Profile button */}
      <button 
        onClick={() => setIsProfileOpen(true)}
        className="absolute top-6 right-6 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-3 rounded-full transition-all duration-300 z-20 shadow-lg border border-white/20"
        aria-label="Open Profile"
      >
        <User className="w-6 h-6" />
      </button>

      {/* Claim Success Modal */}
      <ClaimSuccessModal isOpen={showClaimSuccess} songs={claimedSongs} />

      {/* FIXED: Updated condition for the First-time Claim Button */}
      {/* Using the more permissive condition to ensure it shows up */}
      {(canClaimSongs || debugClaimButton()) && username !== "Guest" && !checkingClaimStatus && (
        <div className="w-full max-w-md mb-6 animate-fade-in">
          <div className="bg-gradient-to-r from-purple-600/90 to-indigo-600/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-purple-500/30 relative overflow-hidden transform transition-all duration-500 hover:scale-[1.02]">
            {/* Background sparkles */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <Sparkles className="w-full h-full text-white" />
            </div>

            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/30 flex items-center justify-center mr-4 backdrop-blur-sm">
                <Gift className="w-7 h-7 text-purple-200" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Welcome to beatBRAWL!</h3>
                <p className="text-blue-200 text-sm">Claim your 10 random song cards to get started</p>
              </div>
            </div>
            
            {claimError && (
              <div className="bg-red-500/20 text-red-200 py-2 px-3 rounded-lg mb-4 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{claimError}</span>
              </div>
            )}
            
            <button
              onClick={claimInitialSongs}
              disabled={claimingInProgress}
              className="w-full bg-white/15 hover:bg-white/25 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 shadow-xl border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:translate-y-[-2px] active:translate-y-[1px]"
            >
              {claimingInProgress ? (
                <RefreshCcw className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
              ) : (
                <Music className="w-5 h-5 mr-2" />
              )}
              {claimingInProgress ? "Claiming Songs..." : "Claim Your 10 Free Songs"}
            </button>

            <p className="text-xs text-blue-200/80 mt-3 text-center">
              This is a one-time offer for new players only
            </p>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 relative z-10 transition-all duration-500 transform hover:scale-[1.02]">
        {/* Main card content (unchanged) */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2 flex items-center justify-center">
            <span className="text-6xl mr-2">🎮</span> beatBRAWL
          </h1>
          <p className="text-blue-200 text-lg">Match songs and win the game!</p>
        </div>

        {error && (
          <div className="bg-red-500/90 backdrop-blur-sm text-white py-3 px-4 rounded-lg mb-6 shadow-md flex items-center animate-fade-in">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6">
          <button
            onClick={createRoom}
            disabled={!socketId || loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:translate-y-[-2px] active:translate-y-[1px]"
          >
            {loading ? (
              <RefreshCcw className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            )}
            {loading ? "Creating Room..." : "Create New Game Room"}
          </button>

          <div className="relative mt-6 flex items-center">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="flex-shrink mx-4 text-white/60 text-sm font-medium">OR</span>
            <div className="flex-grow border-t border-white/20"></div>
          </div>

          <div className="space-y-3">
            <div className="relative group">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter Room ID"
                className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-300 shadow-inner group-hover:bg-white/15"
              />
            </div>
            <button
              onClick={joinRoom}
              disabled={!roomId || !socketId || loading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:translate-y-[-2px] active:translate-y-[1px]"
            >
              {loading ? (
                <RefreshCcw className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                  <path d="M16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
              )}
              {loading ? "Joining Room..." : "Join Existing Room"}
            </button>
          </div>
        </div>

        <div className="mt-10 pt-4 border-t border-white/20 flex justify-between items-center">
          {socketId ? (
            <div className="flex items-center text-blue-200 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span>
                Connected: <span className="font-mono">{socketId.substring(0, 8)}...</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center text-blue-300/60 text-sm">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
              <span>Connecting...</span>
            </div>
          )}
          
          <button
            onClick={toggleMute}
            className="bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors duration-300"
            aria-label={isMuted ? "Unmute music" : "Mute music"}
          >
            {isMuted ? (
              <VolumeX className="h-6 w-6 text-red-400" />
            ) : (
              <Volume2 className="h-6 w-6 text-blue-200" />
            )}
          </button>
        </div>

        {/* Music marketplace link */}
        <div className="mt-4 text-center">
          <button
            onClick={goToMusicMarketplace}
            className="mt-4 text-blue-300 hover:text-blue-200 transition-colors duration-300 text-sm flex items-center justify-center mx-auto"
          >
            <Music className="w-4 h-4 mr-1" />
            <span>Visit Music Marketplace</span>
          </button>
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={goToCardDeck}
            className="mt-4 text-green-300 hover:text-yellow-200 transition-colors duration-300 text-sm flex items-center justify-center mx-auto"
          >
            <Spade className="w-4 h-4 mr-1" />
            <span>Check Card Deck</span>
          </button>
        </div>
      </div>

      {/* Profile Sidebar */}
      <div 
        className={`fixed inset-y-0 right-0 w-full md:w-96 bg-indigo-900/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-500 ease-in-out z-50 ${
          isProfileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Profile Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-800 to-indigo-900 flex justify-between items-center border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">Your Profile</h2>
            <button 
              onClick={() => setIsProfileOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Close profile"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Profile Content */}
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            {/* User Info */}
            <div className="bg-white/10 rounded-xl p-6 mb-6 border border-white/10">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {username.substring(0, 1).toUpperCase()}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">{username}</h3>
                  <div className="flex mt-2">
                    <button
                      onClick={logout}
                      className="text-red-300 hover:text-red-200 text-sm flex items-center transition-colors duration-300"
                    >
                      <LogOut className="w-3 h-3 mr-1" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Owned Songs */}
            <div className="bg-white/10 rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Disc className="w-5 h-5 mr-2 text-blue-300" />
                  <h3 className="text-lg font-bold text-white">My Songs</h3>
                </div>
                
                {/* FIXED: More permissive condition for the sidebar claim button */}
                {canClaimSongs && username !== "Guest" && (
                  <button 
                    onClick={claimInitialSongs}
                    disabled={claimingInProgress}
                    className="text-xs px-3 py-1 bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 rounded-full flex items-center transition-colors duration-200 border border-purple-500/40"
                  >
                    {claimingInProgress ? (
                      <RefreshCcw className="animate-spin h-3 w-3 mr-1" />
                    ) : (
                      <Gift className="w-3 h-3 mr-1" />
                    )}
                    <span>Claim Free Songs</span>
                  </button>
                )}
              </div>
              
              {loadingSongs ? (
                <div className="flex justify-center py-8">
                  <RefreshCcw className="animate-spin h-8 w-8 text-blue-400" />
                </div>
              ) : songError ? (
                <div className="text-center text-red-300 py-4">
                  {songError}
                </div>
              ) : ownedSongs.length > 0 ? (
                <div className="space-y-3">
                  {ownedSongs.map((song, index) => (
                    <div key={index} className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors duration-300">
                      <div className="font-medium text-white">{song.title}</div>
                      <div className="text-sm text-blue-200">{song.artist}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-blue-200 py-6 px-4">
                  <div className="text-5xl mb-3">🎵</div>
                  <p>You don't own any songs yet.</p>
                  {/* FIXED: More permissive condition for empty state claim button */}
                  {canClaimSongs && username !== "Guest" ? (
                    <button
                      onClick={claimInitialSongs}
                      className="mt-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 px-4 py-2 rounded-lg transition-colors duration-300 text-sm inline-flex items-center border border-purple-500/30"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      <span>Claim Your Free Songs</span>
                    </button>
                  ) : (
                    <button
                      onClick={goToMusicMarketplace}
                      className="mt-4 text-blue-300 hover:text-blue-200 transition-colors duration-300 text-sm inline-flex items-center"
                    >
                      <Music className="w-4 h-4 mr-1" />
                      <span>Browse Music Marketplace</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Tab (visible when sidebar is closed) */}
      {!isProfileOpen && (
        <button 
          onClick={() => setIsProfileOpen(true)}
          className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-indigo-700 hover:bg-indigo-600 text-white p-2 rounded-l-lg shadow-lg transition-transform duration-300 hover:translate-x-1 group"
          aria-label="Open profile sidebar"
        >
          <ChevronLeft className="w-6 h-6" />
          <span className="absolute right-full top-1/2 transform -translate-y-1/2 bg-indigo-700 text-white py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap mr-2">
            View Profile
          </span>
        </button>
      )}

      {/* Add CSS for animations */}
      <style jsx>{`
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 3px;
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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </main>
  );
}