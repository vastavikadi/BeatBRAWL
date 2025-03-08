// ----- server.js -----
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Routes
const authRoutes = require('./routes/auth');
const songRoutes = require('./routes/songs');
const userRoutes = require('./routes/users');
const transactionRoutes = require('./routes/transactions');

// Middleware
const { authenticateToken } = require('./middleware/auth');

// Config
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/transactions', authenticateToken, transactionRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Music Marketplace API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ----- .env -----
PORT=5000
MONGODB_URI=mongodb://localhost:27017/music-marketplace
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
HIVE_ACTIVE_WIF=your_hive_wif_key_for_server_wallet
HIVE_ACCOUNT=your_hive_account_name

// ----- models/User.js -----
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  dateAwarded: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: '/default-profile.jpg'
  },
  hiveUsername: {
    type: String,
    trim: true
  },
  ownedSongs: [{
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song'
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    transactionId: {
      type: String,
      required: true
    }
  }],
  achievements: [achievementSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;

// ----- models/Song.js -----
const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  album: {
    type: String,
    required: true,
    trim: true
  },
  genre: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  coverImage: {
    type: String,
    default: '/default-album-cover.jpg'
  },
  audioFile: {
    type: String,
    required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  timesDownloaded: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create an index for search
songSchema.index({ title: 'text', artist: 'text', album: 'text' });

const Song = mongoose.model('Song', songSchema);
module.exports = Song;

// ----- models/Transaction.js -----
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  hiveTransactionId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;

// ----- middleware/auth.js -----
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

module.exports = { authenticateToken };

// ----- routes/auth.js -----
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, hiveUsername } = req.body;
    
    // Check if user already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password,
      hiveUsername
    });
    
    const savedUser = await user.save();
    
    // Create and assign token
    const token = jwt.sign(
      { id: savedUser._id, username: savedUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        hiveUsername: savedUser.hiveUsername,
        profilePicture: savedUser.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    
    // Check password
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }
    
    // Create and assign token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        hiveUsername: user.hiveUsername,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

// ----- routes/songs.js -----
const router = require('express').Router();
const Song = require('../models/Song');
const { authenticateToken } = require('../middleware/auth');

// Get all songs with optional filtering
router.get('/', async (req, res) => {
  try {
    const { search, genre, decade, page = 1, limit = 20 } = req.query;
    const query = {};
    
    // Handle search
    if (search) {
      query.$text = { $search: search };
    }
    
    // Handle genre filter
    if (genre && genre !== 'All') {
      query.genre = genre;
    }
    
    // Handle decade filter
    if (decade && decade !== 'All') {
      const startYear = parseInt(decade);
      query.year = { $gte: startYear, $lt: startYear + 10 };
    }
    
    // Only show available songs
    query.available = true;
    
    const songs = await Song.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
      
    const count = await Song.countDocuments(query);
    
    res.status(200).json({
      songs,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get song by ID
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.status(200).json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new song (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Here you would add admin check
    const newSong = new Song(req.body);
    const savedSong = await newSong.save();
    res.status(201).json(savedSong);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update song (admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Here you would add admin check
    const updatedSong = await Song.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedSong) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.status(200).json(updatedSong);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete song (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Here you would add admin check
    const deletedSong = await Song.findByIdAndDelete(req.params.id);
    if (!deletedSong) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.status(200).json({ message: 'Song deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

// ----- routes/users.js -----
const router = require('express').Router();
const User = require('../models/User');

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('ownedSongs.song');
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { email, profilePicture, hiveUsername } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { email, profilePicture, hiveUsername },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's owned songs
router.get('/owned-songs', async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('ownedSongs')
      .populate('ownedSongs.song');
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user.ownedSongs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's achievements
router.get('/achievements', async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('achievements');
      
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user.achievements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

// ----- routes/transactions.js -----
const router = require('express').Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Song = require('../models/Song');
const { hivePayment } = require('../utils/hivePayment');

// Get user's transaction history
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .populate('song')
      .sort({ createdAt: -1 });
      
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Initiate a transaction
router.post('/initiate', async (req, res) => {
  try {
    const { songId } = req.body;
    
    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    // Check if user already owns the song
    const user = await User.findById(req.user.id);
    const alreadyOwns = user.ownedSongs.some(item => item.song.toString() === songId);
    
    if (alreadyOwns) {
      return res.status(400).json({ message: 'You already own this song' });
    }
    
    // Return the details needed for the frontend to initiate Hive Keychain payment
    res.status(200).json({
      songId,
      songTitle: song.title,
      price: song.price,
      receiverUsername: process.env.HIVE_ACCOUNT,
      memo: `Purchase of ${song.title} by ${song.artist}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Confirm a transaction after Hive Keychain payment
router.post('/confirm', async (req, res) => {
  try {
    const { songId, hiveTransactionId } = req.body;
    
    // Verify the transaction on the Hive blockchain (implementation detail omitted)
    // This would involve checking that the transaction exists and has the right amount
    const isValidTransaction = await hivePayment.verifyTransaction(hiveTransactionId);
    
    if (!isValidTransaction) {
      return res.status(400).json({ message: 'Invalid transaction' });
    }
    
    // Get the song
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    
    // Create transaction record
    const transaction = new Transaction({
      user: req.user.id,
      song: songId,
      amount: song.price,
      hiveTransactionId,
      status: 'completed'
    });
    
    const savedTransaction = await transaction.save();
    
    // Add song to user's owned songs
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        ownedSongs: {
          song: songId,
          transactionId: hiveTransactionId
        }
      }
    });
    
    // Increment song download count
    await Song.findByIdAndUpdate(songId, {
      $inc: { timesDownloaded: 1 }
    });
    
    // Check and award achievements
    await checkAndAwardAchievements(req.user.id);
    
    res.status(200).json({
      message: 'Transaction completed successfully',
      transaction: savedTransaction
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Function to check and award achievements
async function checkAndAwardAchievements(userId) {
  try {
    const user = await User.findById(userId).populate('ownedSongs.song');
    
    // Example achievement: First Purchase
    if (user.ownedSongs.length === 1) {
      const firstPurchaseExists = user.achievements.some(
        achievement => achievement.title === 'First Purchase'
      );
      
      if (!firstPurchaseExists) {
        await User.findByIdAndUpdate(userId, {
          $push: {
            achievements: {
              title: 'First Purchase',
              description: 'Purchased your first song',
              icon: '🎵'
            }
          }
        });
      }
    }
    
    // Example achievement: Collection Builder (3+ songs)
    if (user.ownedSongs.length >= 3) {
      const collectionBuilderExists = user.achievements.some(
        achievement => achievement.title === 'Collection Builder'
      );
      
      if (!collectionBuilderExists) {
        await User.findByIdAndUpdate(userId, {
          $push: {
            achievements: {
              title: 'Collection Builder',
              description: 'Owns more than 3 songs',
              icon: '🏆'
            }
          }
        });
      }
    }
    
    // Example achievement: Genre Explorer (songs from 3+ genres)
    const genres = new Set();
    user.ownedSongs.forEach(owned => {
      if (owned.song && owned.song.genre) {
        genres.add(owned.song.genre);
      }
    });
    
    if (genres.size >= 3) {
      const genreExplorerExists = user.achievements.some(
        achievement => achievement.title === 'Genre Explorer'
      );
      
      if (!genreExplorerExists) {
        await User.findByIdAndUpdate(userId, {
          $push: {
            achievements: {
              title: 'Genre Explorer',
              description: 'Owns songs from 3 different genres',
              icon: '🔍'
            }
          }
        });
      }
    }
  } catch (error) {
    console.error('Error in awarding achievements:', error);
  }
}

module.exports = router;

// ----- utils/hivePayment.js -----
const { Client } = require('@hiveio/dhive');

// Create a new dhive client
const client = new Client(['https://api.hive.blog', 'https://api.hivekings.com']);

const hivePayment = {
  // Verify that a transaction exists on the Hive blockchain
  verifyTransaction: async (transactionId) => {
    try {
      // Get the transaction from the blockchain
      const transaction = await client.database.getTransaction(transactionId);
      
      if (!transaction) {
        return false;
      }
      
      // Verify the transaction details
      // This is a simplified example - in production, you would check:
      // 1. That the payment is to the correct account
      // 2. That the amount matches the expected amount
      // 3. That the transaction type is a transfer
      // 4. That the memo matches your expected format
      
      // For this example, we'll just verify the transaction exists
      return !!transaction;
    } catch (error) {
      console.error('Error verifying Hive transaction:', error);
      return false;
    }
  },
  
  // Send tokens from the server's account (for refunds, etc.)
  sendTokens: async (toAccount, amount, memo) => {
    try {
      // Create the operation
      const operation = [
        'transfer',
        {
          from: process.env.HIVE_ACCOUNT,
          to: toAccount,
          amount: `${amount.toFixed(3)} HIVE`,
          memo
        }
      ];
      
      // Create and broadcast the transaction
      const privateKey = process.env.HIVE_ACTIVE_WIF;
      const result = await client.broadcast.sendOperations([operation], privateKey);
      
      return result;
    } catch (error) {
      console.error('Error sending Hive tokens:', error);
      throw error;
    }
  }
};

module.exports = { hivePayment };

// ----- package.json -----
{
  "name": "music-marketplace-backend",
  "version": "1.0.0",
  "description": "Backend for a music marketplace using Hive blockchain",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node scripts/seedDatabase.js"
  },
  "dependencies": {
    "@hiveio/dhive": "^1.0.0",
    "bcryptjs": "^2.4.3",
    "body-parser": "^1.19.0",
    "cors": "^2.8.5",
    "dotenv": "^10.0.0",
    "express": "^4.17.1",
    "jsonwebtoken": "^8.5.1",
    "mongoose": "^6.0.12"
  },
  "devDependencies": {
    "nodemon": "^2.0.14"
  }
}

// ----- scripts/seedDatabase.js -----
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Song = require('../models/Song');
const User = require('../models/User');

dotenv.config();

// Sample song data
const songs = [
  {
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    genre: "Pop",
    year: 2020,
    duration: "3:20",
    price: 5,
    coverImage: "/covers/blinding-lights.jpg",
    audioFile: "/audio/blinding-lights.mp3",
    available: true
  },
  {
    title: "Shape of You",
    artist: "Ed Sheeran",
    album: "÷",
    genre: "Pop",
    year: 2017,
    duration: "3:53",
    price: 4,
    coverImage: "/covers/shape-of-you.jpg",
    audioFile: "/audio/shape-of-you.mp3",
    available: true
  },
  // Add more songs here...
];

// Sample user data
const users = [
  {
    username: "demo_user",
    email: "demo@example.com",
    password: "password123",
    hiveUsername: "demo_hive_user",
    profilePicture: "/profiles/demo-user.jpg",
    achievements: [
      {
        title: "Early Adopter",
        description: "Joined during launch week",
        icon: "🌟"
      }
    ]
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Seed function
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Song.deleteMany({});
    await User.deleteMany({});
    
    // Add songs
    const createdSongs = await Song.insertMany(songs);
    console.log(`${createdSongs.length} songs added`);
    
    // Hash user passwords and add users
    const hashedUsers = [];
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      hashedUsers.push({
        ...user,
        password: hashedPassword
      });
    }
    
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`${createdUsers.length} users added`);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();