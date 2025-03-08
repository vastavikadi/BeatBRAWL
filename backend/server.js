import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import User from "./models/user.js";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
dotenv.config();

connectDB();
dotenv.config();

const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    headers: ["Content-Type"],
    credentials: true,
  })
);
app.options("*", cors());

app.use(express.json());

app.post("/api/register", async (req, res) => {
  const { hiveUsername } = req.body;
  const hiveAccount = hiveUsername;
  console.log(hiveAccount);
  if (!hiveAccount) {
    return res.status(400).json({ message: "Hive username is required" });
  }

  try {
    const existingUser = await User.findOne({ hiveAccount });

    if (existingUser) {
      const token = jwt.sign(
        { username: hiveUsername },
        process.env.SECRET_KEY,
        { expiresIn: process.env.TOKEN_EXPIRY }
      );
      res.status(201).json({ message: "Welcome back! Access Granted.", token });
    } else {
      const newUser = new User({ hiveAccount });
      await newUser.save();
      const token = jwt.sign(
        { username: hiveUsername },
        process.env.SECRET_KEY,
        { expiresIn: process.env.TOKEN_EXPIRY }
      );

      res.status(201).json({
        message: "Registered successfully. Now, You're one of us.",
        token,
      });
    }
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
});


const SongSchema = new mongoose.Schema({}, { strict: false });
const Song = mongoose.model("Song", SongSchema, "song_list");
const formatDuration = (milliseconds) => {
  let minutes = Math.floor(milliseconds / 60000);
  let seconds = Math.floor((milliseconds % 60000) / 1000);

  return seconds >= 30 ? `${minutes + 1} mins` : `${minutes} mins`;
};

app.get("/api/songs", async (req, res) => {
  try {
    let songs = await Song.find();
    songs = songs.map((song) => ({
      _id: song._id,
      artist: song.artist,
      song: song.song,
      genre: song.genre,
      year: song.year,
      duration_ms: song.duration_ms,
      formattedDuration: formatDuration(song.duration_ms),
    }));
    if (songs.length === 0) {
      console.log("No songs found in the database.");
    }

    res.json(songs);
  } catch (err) {
    console.error("Error fetching songs:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/user-songs", async (req, res) => {
  try {
    const { username } = req.query;
    console.log("GET /api/user-songs - Username:", username);

    if (!username) {
      console.log("Username missing in request");
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    try {
      // Try to find user in DB
      const user = await User.findOne({ hiveAccount: username });

      if (!user) {
        console.log(`User not found: ${username}`);

        return res.status(200).json({
          success: true,
          message: "User not found",
          songs: [],
        });
      }

      // User exists - check for owned songs
      if (!user.ownedSongs || user.ownedSongs.length === 0) {
        console.log(`User has no songs: ${username}`);
        return res.status(200).json({
          success: true,
          message: "User has no songs",
          songs: [],
        });
      }


      // Find all songs owned by the user
      const songs = await Song.find({
        _id: { $in: user.ownedSongs },
      }).select("_id song artist genre year");

      console.log(`Found ${songs.length} songs for user ${username}`);

      // Transform the data
      const transformedSongs = songs.map((song) => ({
        id: song._id,
        title: song.song,
        artist: song.artist,
        genre: song.genre,
        year: song.year,
      }));

      return res.status(200).json({
        success: true,
        songs: transformedSongs,
      });
    } catch (dbError) {
      console.error("Database error:", dbError);

      // If DB fails, fall back to sample data
      if (global.sampleUser && global.sampleUser.username === username) {
        console.log("Falling back to sample data due to DB error");

        const sampleSongsData = global.sampleSongs.map((song) => ({
          id: song._id,
          title: song.song,
          artist: song.artist,
          genre: song.genre,
          year: song.year,
        }));

        return res.status(200).json({
          success: true,
          message: "Using sample data (DB error)",
          songs: sampleSongsData,
        });
      }

      throw dbError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error("Error fetching user songs:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

app.post("/api/claim-initial-songs", async (req, res) => {
  const { username } = req.body;
  const hiveAccount = username;
  if (!username) {
    return res
      .status(400)
      .json({ success: false, message: "Username is required" });
  }

  try {
    // Find user by username
    let user = await User.findOne({ hiveAccount });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Login First. No Account Exists.",
      });
    }

    // Check if user has already claimed initial songs
    if (user.hasClaimedInitialSongs) {
      return res.status(400).json({
        success: false,
        message: "You have already claimed your initial songs",
      });
    }

    // Get 10 random songs
    const randomSongs = await Song.aggregate([{ $sample: { size: 10 } }]);

    const songIds = randomSongs.map((song) => song._id);

    // Add songs to user's collection
    user.ownedSongs = [...(user.ownedSongs || []), ...songIds];

    // Mark as claimed
    user.hasClaimedInitialSongs = true;

    // Save user
    await user.save();

    // Populate song details for response
    const populatedSongs = await Song.find({ _id: { $in: songIds } });

    // Return success with song details
    return res.json({
      success: true,
      message: "Successfully claimed initial songs",
      songs: populatedSongs.map((song) => ({
        id: song._id,
        title: song.song || song.title || "Unknown Track",
        artist: song.artist || "Unknown Artist",
      })),
    });
  } catch (error) {
    console.error("Error claiming initial songs:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get user's claim status
app.get("/api/claim-status", async (req, res) => {
  const { username } = req.query;
  const hiveAccount = username;
  
  if (!hiveAccount) {
    return res
      .status(400)
      .json({ success: false, message: "Username is required" });
  }

  console.log("API: Checking claim status for hiveAccount:", hiveAccount);

  try {
    const user = await User.findOne({ hiveAccount });
    console.log("API: User found:", user ? "Yes" : "No");

    if (!user) {
      // If user doesn't exist, they can claim songs (they're a new user)
      console.log("API: New user, can claim songs");
      return res.json({
        success: true,
        canClaim: true, // Fixed: for new users, they can claim
        hasClaimedInitialSongs: false,
        isNewUser: true,
      });
    }

    // User exists, check if they've claimed songs
    console.log("API: Existing user, hasClaimedInitialSongs:", user.hasClaimedInitialSongs);
    return res.json({
      success: true,
      canClaim: !user.hasClaimedInitialSongs, // If they haven't claimed, they can claim
      hasClaimedInitialSongs: user.hasClaimedInitialSongs,
      isNewUser: false,
    });
  } catch (error) {
    console.error("Error checking claim status:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/upgrade", async (req, res) => {
  console.log("Received upgrade request:", req.body);
  const { username, song, paymentAmount } = req.body;

  // Check for missing username
  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Username is required",
    });
  }

  try {
    // First check if the song exists
    const songExists = await Song.findById(song);
    if (!songExists) {
      return res.status(404).json({
        success: false,
        message: "Song not found.",
      });
    }

    // Find or create user, correctly using hiveUsername field
    let user = await User.findOne({ hiveUsername: username });

    if (!user) {
      // Create a new user with required username
      user = new User({
        hiveUsername: username,
        ownedSongs: [song],
      });
      await user.save();
    } else {
      // Check if user already owns the song
      if (user.ownedSongs && user.ownedSongs.includes(song)) {
        return res.status(400).json({
          success: false,
          message: "You already own this song.",
        });
      }

      // Add song to existing user's collection
      if (!user.ownedSongs) {
        user.ownedSongs = []; // Initialize if undefined
      }
      user.ownedSongs.push(song);
      await user.save();
    }

    // Return success message with song details
    res.json({
      success: true,
      message: `Successfully purchased "${songExists.song}" by ${songExists.artist}`,
      user,
    });
  } catch (err) {
    console.error("Detailed error in upgrade API:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error: " + err.message,
    });
  }
});

// Get user's deck
app.get('/api/user-deck', async (req, res) => {
  const { username } = req.query;
  const hiveUsername = username;
  console.log(hiveUsername);
  if (!username) {
    return res.status(400).json({ success: false, message: 'Username is required' });
  }
  
  try {
    // Find the user and populate the songs in their deck
    const user = await User.findOne({ hiveAccount: hiveUsername })
      .populate('deck.songs');
    
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      // If user has no deck, return an empty deck structure
      if (user.hasDeck) {
        return res.json({
          success: true,
          deck: {
            name: "My Deck",
            songs: [],
            createdAt: null,
            updatedAt: null
          }
        });
      }
    
    return res.json({
      success: true,
      deck: user.deck
    });
  } catch (error) {
    console.error('Error fetching user deck:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create or update a user's deck
app.post('/api/save-deck', async (req, res) => {
  const { username, name, songs } = req.body;
  
  if (!username || !name || !songs || !Array.isArray(songs)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username, deck name, and songs array are required' 
    });
  }
  
  try {
    // Find the user
    const user = await User.findOne({ hiveAccount: username });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update user's deck
    user.deck = {
      songs: songs,
      name: name
      // Timestamps will be handled by the pre-save middleware
    };
    
    await user.save();
    
    return res.json({
      success: true,
      message: 'Deck saved successfully',
      deck: user.deck
    });
  } catch (error) {
    console.error('Error saving deck:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update an existing deck
app.put('/api/update-deck', async (req, res) => {
  const { username, name, songs } = req.body;
  
  if (!username || !name || !songs || !Array.isArray(songs)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username, deck name, and songs array are required' 
    });
  }
  
  try {
    // Find the user
    const user = await User.findOne({ hiveAccount: username });
    
    if (!user || !user.hasDeck) {
      return res.status(404).json({ success: false, message: 'User or deck not found' });
    }
    
    // Update user's deck
    user.deck.name = name;
    user.deck.songs = songs;
    // updatedAt will be set by pre-save middleware
    
    await user.save();
    
    return res.json({
      success: true,
      message: 'Deck updated successfully',
      deck: user.deck
    });
  } catch (error) {
    console.error('Error updating deck:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete a user's deck
app.delete('/api/delete-deck', async (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ success: false, message: 'Username is required' });
  }
  
  try {
    // Find the user
    const user = await User.findOne({ hiveAccount: username });
    
    if (!user || !user.hasDeck) {
      return res.status(404).json({ success: false, message: 'User or deck not found' });
    }
    
    // Reset deck
    user.deck = {
      songs: [],
      name: 'My Deck'
    };
    user.hasDeck = false;
    
    await user.save();
    
    return res.json({
      success: true,
      message: 'Deck deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting deck:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get active deck for match
app.get('/api/match-deck', async (req, res) => {
  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({ success: false, message: 'Username is required' });
  }
  
  try {
    // Find the user and populate their deck's songs
    const user = await User.findOne({ hiveAccount: username })
      .populate('deck.songs');
    
    if (!user || !user.hasDeck) {
      return res.status(404).json({ success: false, message: 'User or deck not found' });
    }
    
    // Process song data for the game
    const gameReadySongs = user.deck.songs.map(song => ({
      id: song._id,
      title: song.title || song.song,
      artist: song.artist,
      power: song.power || Math.floor(Math.random() * 10) + 1,
      defense: song.defense || Math.floor(Math.random() * 10) + 1,
      special: song.special || null,
      rarity: song.rarity || 'common'
    }));
    
    return res.json({
      success: true,
      deckName: user.deck.name,
      songs: gameReadySongs
    });
  } catch (error) {
    console.error('Error fetching match deck:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

const SONG_CARDS = [
  {
    id: "1",
    genre: "Pop",
    artist: "Olivia Rodrigo",
    name: "drivers license",
    playtime: 4,
    year: 2021,
  },
  {
    id: "2",
    genre: "Hip-Hop",
    artist: "Lil Nas X & Jack Harlow",
    name: "INDUSTRY BABY",
    playtime: 3,
    year: 2021,
  },
  {
    id: "3",
    genre: "R&B",
    artist: "SZA",
    name: "Kill Bill",
    playtime: 4,
    year: 2022,
  },
  {
    id: "4",
    genre: "Electronic",
    artist: "Fred again..",
    name: "Delilah (pull me out of this)",
    playtime: 3,
    year: 2022,
  },
  {
    id: "5",
    genre: "Latin",
    artist: "Bad Bunny",
    name: "Tití Me Preguntó",
    playtime: 4,
    year: 2022,
  },
];

const cleanupRoom = (roomId) => {
  if (rooms[roomId]) {
    console.log(`Cleaning up room: ${roomId}`);
    delete rooms[roomId];
    io.to(roomId).emit("roomClosed");
  }
};

const initialGameState = {
  playerCardsData: {},
  currentPlayer: null,
  AllCards: [],
  topCard: null,
  winner: null,
};

const checkWin = (roomId, room) => {
  const { playerCardsData } = room.gameState;

  for (const [playerId, cards] of Object.entries(playerCardsData)) {
    if (cards.length === 0) {
      room.gameState.winner = playerId;
      console.log(`Player ${playerId} wins!`);

      io.to(roomId).emit("gameWon", {
        winner: room.gameState.winner,
        playerCardsData: room.gameState.playerCardsData,
      });

      setTimeout(() => cleanupRoom(roomId), 30000);
      return;
    }
  }
};

const rooms = {};

app.post("/create-room", (req, res) => {
  console.log("Creating room...");
  const roomId = uuidv4().slice(0, 6);
  const roomOwner = req.body.socketId;

  rooms[roomId] = {
    players: [roomOwner],
    roomOwner: roomOwner,
    gameStarted: false,
    gameState: { ...initialGameState },
  };

  res.json({ roomId });
});

app.post("/join-room", (req, res) => {
  console.log("Joining room...");
  const { roomId } = req.body;

  if (!rooms[roomId]) {
    return res.status(404).json({ error: "Room not found" });
  }
  rooms[roomId].players.push(req.body.socketId);
  res.json({ success: true });
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  let currentRoomId = null;

  socket.on("joinRoom", ({ roomId, cards, socketId }) => {
    console.log("Socket join room called");
    if (!rooms[roomId]) {
      socket.emit("error", "Room not found");
      return;
    }
    const room = rooms[roomId];
    room.gameState.playerCardsData[socketId] = cards;
    room.gameState.AllCards.push(...cards);
    currentRoomId = roomId;
    socket.join(roomId);
    console.log("room players are", room.players);

    socket.emit("joinedRoom", {
      roomPlayers: room.players,
      roomOwner: room.roomOwner,
    });

    io.to(roomId).emit("playerJoined", {
      roomPlayers: room.players,
      roomOwner: room.roomOwner,
    });
  });

  socket.on("getRoomInfo", ({ roomId }) => {
    if (rooms[roomId]) {
      const roomPlayers = rooms[roomId].players;
      const roomOwner = rooms[roomId].roomOwner;
      socket.emit("roomInfo", { roomPlayers, roomOwner });
    }
  });

  socket.on("gameStart", ({ roomId }) => {
    const room = rooms[roomId];
    room.gameStarted = true;
    room.gameState.currentPlayer = room.players[0];
    room.gameState.topCard =
      room.gameState.AllCards[
        Math.floor(Math.random() * room.gameState.AllCards.length)
      ];

    room.players.forEach((playerId) => {
      const shuffledCards = [...room.gameState.AllCards].sort(
        () => 0.5 - Math.random()
      );
      room.gameState.playerCardsData[playerId] = shuffledCards.slice(0, 3);
    });

    io.to(roomId).emit("startGame", { gameState: room.gameState });
    console.log("Game started for room:", roomId);
  });

  socket.on("pullCard", ({ roomId, socketId }) => {
    const room = rooms[roomId];
    const card =
      room.gameState.AllCards[
        Math.floor(Math.random() * room.gameState.AllCards.length)
      ];
    room.gameState.playerCardsData[socketId].push(card);
    const players = room.players; // Array of socket IDs
    const currentPlayer = room.gameState.currentPlayer;
    const currentIndex = players.indexOf(currentPlayer);
    const nextIndex = (currentIndex + 1) % players.length; // Wrap around if needed
    room.gameState.currentPlayer = players[nextIndex];
    io.to(roomId).emit("updateGameState", room.gameState);
  });

  socket.on("playerMove", (data) => {
    if (!data.roomId) {
      console.error("Error: No room assigned for this player.");
      socket.emit("error", "You are not part of a room.");
      return;
    }

    const roomId = data.roomId;
    const room = rooms[roomId];

    const currentPlayer = room.gameState.currentPlayer;

    if (data.socketId !== currentPlayer) {
      console.error(`Invalid move: Not this player's turn.`);
      socket.emit("invalidMove", "It's not your turn.");
      return;
    }

    room.gameState.playerCardsData[data.socketId] =
      room.gameState.playerCardsData[data.socketId].filter((card, index) => {
        return (
          index !==
          room.gameState.playerCardsData[data.socketId].findIndex(
            (c) => c.id === data.selectedPlayerCard.id
          )
        );
      });
    room.gameState.topCard = data.selectedPlayerCard;

    checkWin(roomId, room);

    if (!room.gameState.winner) {
      const players = room.players; // Array of socket IDs
      const currentIndex = players.indexOf(currentPlayer);
      const nextIndex = (currentIndex + 1) % players.length; // Wrap around if needed
      room.gameState.currentPlayer = players[nextIndex];

      io.to(roomId).emit("updateGameState", room.gameState);
    }
  });

  socket.on("leaveRoom", ({ roomId, socketId }) => {
    console.log(`Player ${socketId} leaving room ${roomId}`);

    if (rooms[roomId]) {
      const room = rooms[roomId];

      room.players = room.players.filter((playerId) => playerId !== socketId);

      if (room.gameStarted && room.gameState.playerCardsData[socketId]) {
        delete room.gameState.playerCardsData[socketId];

        if (room.gameState.currentPlayer === socketId) {
          const players = room.players;
          if (players.length > 0) {
            room.gameState.currentPlayer = players[0];
          }
        }
      }

      socket.to(roomId).emit("playerLeft", {
        roomPlayers: room.players,
        leftPlayer: socketId,
        gameState: room.gameState,
      });

      socket.leave(roomId);

      if (room.players.length < 2) {
        io.to(roomId).emit("resetGame", {
          message: "Not enough players to continue",
        });
        setTimeout(() => cleanupRoom(roomId), 30000); // 30 seconds
      } else if (room.gameStarted) {
        io.to(roomId).emit("updateGameState", room.gameState);
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);

    if (currentRoomId && rooms[currentRoomId]) {
      const room = rooms[currentRoomId];
      room.players = room.players.filter((p) => p !== socket.id);

      if (room.players.length < 2) {
        io.to(currentRoomId).emit("resetGame");
        setTimeout(() => cleanupRoom(currentRoomId), 30000);
      }
    } else {
      Object.keys(rooms).forEach((roomId) => {
        const room = rooms[roomId];
        const playerIndex = room.players.indexOf(socket.id);
        if (playerIndex !== -1) {
          room.players.splice(playerIndex, 1);
          if (room.players.length < 2) {
            io.to(roomId).emit("resetGame");
            setTimeout(() => cleanupRoom(roomId), 30000); // 30 seconds
          }
        }
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
