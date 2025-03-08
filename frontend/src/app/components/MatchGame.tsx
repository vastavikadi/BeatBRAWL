"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Socket } from "socket.io-client";
import SongCardComponent from "./SongCardComponent";
import { SONG_CARDS, SongCard } from "../../constants";
import { getSocket } from "../../utils/socket.js";

const MatchGame: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams?.get("roomId");
  const [socketId, setSocketId] = useState<string>("");
  const [socket, setSocket] = useState<Socket | null>(null);

  const [players, setPlayers] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isHost, setIsHost] = useState(true);
  const [roomOwner, setRoomOwner] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Game play state
  const [selfCards, setSelfCards] = useState<SongCard[]>([]);
  const [centerCard, setCenterCard] = useState<SongCard | null>(null);
  const [deck, setDeck] = useState<SongCard[]>([]);

  const [currentTurn, setCurrentTurn] = useState<string>("");
  const [turnOf, setTurnOf] = useState<string>("");
  const [selectedPlayerCard, setSelectedPlayerCard] = useState<SongCard | null>(
    null
  );
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(
    null
  );
  const [selectedValue, setSelectedValue] = useState<string | number | null>(
    null
  );
  const [matchingInProgress, setMatchingInProgress] = useState<boolean>(false);

  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<string>("");
  const [isWinner, setIsWinner] = useState<boolean>(false);
  const [playerCardCounts, setPlayerCardCounts] = useState<
    Record<string, number>
  >({});

  // Background music control
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/music.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;

      if (gameStarted && !isMuted) {
        audioRef.current
          .play()
          .catch((e) => console.log("Audio play failed:", e));
      }

      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
        }
      };
    }
  }, [gameStarted, isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current
          .play()
          .catch((e) => console.log("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  };

  useEffect(() => {
    if (roomId) {
      const socketInstance = getSocket();
      setSocket(socketInstance);
      setSocketId(socketInstance.id!);
  
      console.log("Id socket is", socketInstance.id);
    
      socketInstance.emit('getRoomInfo', { roomId });
  
      socketInstance.on('roomInfo', (data) => {
        setPlayers(data.roomPlayers);
        setRoomOwner(data.roomOwner);
        setIsHost(data.roomOwner === socketInstance.id);
      });
  
      socketInstance.on('playerJoined', (data) => {
        setPlayers(data.roomPlayers);
      });
  
      socketInstance.on('joinedRoom', (data) => {
        setPlayers(data.roomPlayers);
        setRoomOwner(data.roomOwner);
      });
  
      socketInstance.on('startGame', (data) => {
        setGameStarted(true);
    
        if (socketInstance.id) {
            initializeGameState(data.gameState, socketInstance.id);
        } else {
            console.error("Socket ID is undefined!");
        }
    });

    socketInstance.on('updateGameState', (data) => {
      const id = socketInstance.id;
      setCenterCard(data.topCard);
      
      const myCards = data.playerCardsData[id!];
      setCurrentTurn(data.currentPlayer);
      
      socketInstance.id==data.currentPlayer? setTurnOf("Your Turn"): setTurnOf("Opponent's Turn");

      
      setSelfCards(myCards);
    });

    socketInstance.on('playerLeft', (data) => {
      setPlayers(data.roomPlayers);
      
      if (data.gameState) {
        setCenterCard(data.gameState.topCard);
        setCurrentTurn(data.gameState.currentPlayer);
        
        socketInstance.id === data.gameState.currentPlayer 
          ? setTurnOf("Your Turn") 
          : setTurnOf("Opponent's Turn");
        
        if (data.gameState.playerCardsData[socketInstance.id!]) {
          setSelfCards(data.gameState.playerCardsData[socketInstance.id!]);
        }
      }
      
      setMessage(`Player has left the game`);
      setTimeout(() => setMessage(''), 3000);
    });

    socketInstance.on('gameWon', (data) => {
      setGameOver(true);
      setWinner(data.winner);
      setIsWinner(data.winner === socketInstance.id);
      
      // Get card counts for each player
      const counts: Record<string, number> = {};
      Object.entries(data.playerCardsData).forEach(([playerId, cards]) => {
        counts[playerId] = (cards as any[]).length;
      });
      setPlayerCardCounts(counts);
      
      // Update message based on winner
      if (data.winner === socketInstance.id) {
        setMessage('Congratulations! You won the game! 🎉');
      } else {
        setMessage(`Game over! ${data.winner === roomOwner ? 'Host' : 'Player'} won the game.`);
      }
    });

    socketInstance.on('resetGame', (data) => {
      setMessage(data.message || 'Game has been reset');
      setGameStarted(false);
      setInitialized(false);
    });
    
      return () => {
        socketInstance.off('roomInfo');
        socketInstance.off('playerJoined');
        socketInstance.off('joinedRoom');
        socketInstance.off('startGame');
        socketInstance.off('playerLeft');
        socketInstance.off('resetGame'); 
        socketInstance.off('gameWon');
      };
    }
  }, [roomId]);

  const checkTurn = () =>{
    return currentTurn === socketId;
  }


  const startGame = () => {
    if (!isHost || players.length < 2) {
      setError('Need at least 2 players to start the game');
      setTimeout(() => setError(''), 3000);
      return;
    }
    socket?.emit('gameStart', { roomId });
  };

const initializeGameState = (data: any, socketId: string) => {
    if (!data || !data.playerCardsData) {
        console.error("ERROR: data or playerCardsData is undefined!");
        return;
    }

    const myCards = data.playerCardsData[socketId];

    if (!myCards) {
        console.error(`ERROR: No cards found for socketId: ${socketId}`);
        return;
    }
    
    setSelfCards(myCards);
    setCenterCard(data.topCard);
    setMessage('');
    setInitialized(true);
    setCurrentTurn(data.currentPlayer);
    
    socketId==data.currentPlayer? setTurnOf("Your Turn"): setTurnOf("Opponent's Turn");

};


  // Handle player card selection
  const handlePlayerCardSelect = (card: SongCard, attribute: string, value: string | number) => {
    if (matchingInProgress || !initialized || !gameStarted) return;

    setSelectedPlayerCard(card);
    setSelectedAttribute(attribute);
    setSelectedValue(value);
  };


  const handleCenterCardSelect = (attribute: string, value: string | number) => {
    if (!selectedPlayerCard || !selectedAttribute || matchingInProgress || !initialized || !centerCard || !gameStarted || !checkTurn) return;
    
    if (attribute !== selectedAttribute) {
      return;
    }

    setMatchingInProgress(true);
    
    if (selectedValue === value) {
      
      const oldCenterCard = centerCard;
      
      setCenterCard(selectedPlayerCard);
      
      setDeck(prev => [oldCenterCard, ...prev]);
    } 
    socket!.emit('playerMove', { selectedPlayerCard, socketId, roomId });
    
    setTimeout(() => {
      setSelectedPlayerCard(null);
      setSelectedAttribute(null);
      setSelectedValue(null);
      setMatchingInProgress(false);
    }, 1500);
  };

  const leaveGame = () => {
    if (socket && roomId) {
      socket.emit('leaveRoom', { roomId, socketId });
      
      setSelfCards([]);
      setCenterCard(null);
      setDeck([]);
      setGameStarted(false);
      setInitialized(false);
      setSelectedPlayerCard(null);
      setSelectedAttribute(null);
      setSelectedValue(null);
      
      router.push('/game-menu');
    }
  };

  const pullCard = () =>{
    socket!.emit('pullCard', { roomId, socketId });
  }

  const GameOverScreen = () => (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-purple-200">
        <div className="mb-2 flex justify-center">
          {isWinner ? (
            <div className="flex">
              <span className="animate-bounce text-4xl mx-1">🏆</span>
              <span className="animate-bounce text-4xl mx-1 delay-100">💫</span>
              <span className="animate-bounce text-4xl mx-1 delay-200">🎉</span>
            </div>
          ) : (
            <span className="text-4xl">🎮</span>
          )}
        </div>
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
          {isWinner ? "You Won!" : "Game Over"}
        </h2>
        <p className="text-xl text-center mb-6 text-gray-700">
          {isWinner
            ? "Congratulations on your victory!"
            : `Opponent won the game`}
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-indigo-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
              <path d="M3 8a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            Final Card Count:
          </h3>
          <ul className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
            {Object.entries(playerCardCounts).map(([playerId, count]) => (
              <li
                key={playerId}
                className="flex justify-between items-center py-2 border-b border-purple-100 last:border-0"
              >
                <span className="font-medium text-gray-700">
                  {playerId === socketId ? "You" : "Opponent"}:
                </span>
                <span
                  className={`px-3 py-1 rounded-full font-semibold text-white ${
                    playerId === socketId && isWinner
                      ? "bg-gradient-to-r from-green-500 to-teal-500"
                      : "bg-gradient-to-r from-indigo-500 to-purple-500"
                  }`}
                >
                  {count} card{count !== 1 ? "s" : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center">
          <button
            onClick={leaveGame}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 px-8 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-purple-100">
          <div className="flex justify-center items-center mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Loading game...
          </h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 max-w-md w-full border border-red-100">
          <div className="flex items-center justify-center mb-4 text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-red-600 mb-4 text-center">
            Error
          </h2>
          <p className="text-gray-700 mb-6 text-center">{error}</p>
          <button
            onClick={() => router.push("/game-menu")}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 max-w-md w-full border border-purple-100">
          <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Waiting Room
          </h2>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-6 flex items-center justify-between">
            <span className="text-gray-700 font-medium">Room ID:</span>
            <span className="font-mono bg-white px-3 py-1 rounded-md text-indigo-600 font-semibold border border-indigo-100 shadow-sm">
              {roomId}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-indigo-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              <span>Players Joined:</span>
              <span className="ml-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2.5 py-0.5 rounded-full text-sm font-medium">
                {players.length}
              </span>
            </h3>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3">
              {players.map((player) => (
                <div
                  key={player}
                  className="flex items-center py-3 px-4 rounded-md my-2 bg-white shadow-sm border border-purple-50"
                >
                  {player === socketId ? (
                    <span className="font-medium text-indigo-600">You</span>
                  ) : (
                    <span className="font-medium text-gray-700">Player</span>
                  )}
                  {player === roomOwner && (
                    <span className="ml-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                      Host
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            {isHost && (
              <button
                onClick={startGame}
                disabled={players.length < 2}
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex-1 transform hover:-translate-y-1 disabled:hover:transform-none"
              >
                <div className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Start Game
                </div>
              </button>
            )}

            <button
              onClick={leaveGame}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg flex-1 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414A1 1 0 0015.414 7L12 3.586A1 1 0 0011.414 3H3zm0 1h8.586L15 7.414V16H3V4z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M11 11a1 1 0 10-2 0v3a1 1 0 102 0v-3z"
                    clipRule="evenodd"
                  />
                </svg>
                Leave Room
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return initialized && gameStarted ? (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 flex flex-col">
      {gameOver && <GameOverScreen />}

      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 mb-6 flex flex-wrap items-center justify-between border border-purple-100">
        <div>
          <h2 className="text-xl font-semibold text-gray-700">Current Turn:</h2>
          <h2
            className={`text-2xl font-bold ${
              turnOf === "Your Turn"
                ? "bg-gradient-to-r from-green-500 to-teal-500"
                : "bg-gradient-to-r from-indigo-500 to-purple-500"
            } bg-clip-text text-transparent`}
          >
            {turnOf}
          </h2>
        </div>

        {message && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 px-4 py-2 rounded-lg my-2 animate-pulse font-medium border border-indigo-100 shadow-sm">
            {message}
          </div>
        )}

        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <button
            onClick={toggleMute}
            className="bg-gradient-to-r from-pink-400 to-red-400 hover:from-pink-500 hover:to-red-500 text-white p-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          <button
            onClick={leaveGame}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            Leave Room
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center mb-8">
        <div className="text-lg font-medium text-gray-700 mb-2 bg-white/50 px-4 py-1 rounded-full shadow-sm">
          Center Card
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-100 transform transition-all hover:scale-105 duration-300">
          {centerCard && (
            <SongCardComponent
              key={centerCard.id}
              song={centerCard}
              onClick={handleCenterCardSelect}
            />
          )}
        </div>

        <button
          onClick={pullCard}
          className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2.5 px-8 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center transform hover:-translate-y-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
              clipRule="evenodd"
            />
          </svg>
          Pull Card
        </button>
      </div>

      <div className="mt-auto">
        <div className="text-lg font-medium text-gray-700 mb-2 bg-white/50 px-4 py-1 rounded-full shadow-sm inline-block ml-4">
          Your Hand
        </div>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-100 overflow-x-auto">
          <div className="flex gap-6 min-w-max">
            {selfCards.map((card, index) => (
              <div
                key={`${card.id}-${index}`}
                className="transform transition-all duration-300 hover:-translate-y-4 hover:scale-105"
              >
                <SongCardComponent
                  song={card}
                  onClick={(attribute, value) =>
                    handlePlayerCardSelect(card, attribute, value)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default MatchGame;
