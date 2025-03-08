import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  hiveAccount: {
    type: String,
    unique: true,
    sparse: true,
  },
  ownedSongs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  hasClaimedInitialSongs: {
    type: Boolean,
    default: false
  },
  // Embedded deck document - one per user
  deck: {
    songs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song'
    }],
    name: {
      type: String,
      default: 'My Deck'
    },
    createdAt: {
      type: Date
    },
    updatedAt: {
      type: Date
    }
  },
  // Flag to track if the user has created a deck
  hasDeck: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Pre-save middleware to update deck timestamps
userSchema.pre('save', function(next) {
  // If the deck is being modified and the user already has a deck
  if (this.isModified('deck') && this.hasDeck) {
    // Update the updatedAt timestamp
    this.deck.updatedAt = new Date();
  }
  
  // If a deck is being created for the first time
  if (this.isModified('deck') && !this.hasDeck && this.deck && this.deck.songs && this.deck.songs.length > 0) {
    // Set both createdAt and updatedAt timestamps
    const now = new Date();
    this.deck.createdAt = now;
    this.deck.updatedAt = now;
    this.hasDeck = true;
  }
  
  next();
});

const User = mongoose.model('User', userSchema);
export default User;