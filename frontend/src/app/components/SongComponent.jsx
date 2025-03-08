"use client";
import React from 'react';
import { Music, Clock, Tag, Star, Shield, Zap } from 'lucide-react';

const SongCard = ({ song, isSelected = false, onClick, showGameStats = true }) => {
  // Determine rarity colors
  const getRarityColor = (rarity = 'common') => {
    switch (rarity) {
      case 'legendary':
        return 'from-amber-400 to-yellow-600';
      case 'epic':
        return 'from-purple-500 to-indigo-700';
      case 'rare':
        return 'from-blue-400 to-indigo-600';
      case 'uncommon':
        return 'from-green-400 to-teal-600';
      default: // common
        return 'from-gray-400 to-slate-600';
    }
  };
  
  // Calculate stats if not provided
  const defaultPower = song.power ?? Math.floor(Math.random() * 10) + 1;
  const defaultDefense = song.defense ?? Math.floor(Math.random() * 10) + 1;
  
  return (
    <div
      onClick={onClick}
      className={`relative bg-gradient-to-br from-indigo-900/60 to-purple-900/60 backdrop-blur-md rounded-xl overflow-hidden border transition-all duration-300 shadow-lg perspective-1000 h-full
        ${isSelected 
          ? 'border-primary shadow-primary/30 card-glow scale-105' 
          : 'border-white/10 hover:border-white/30 hover:scale-[1.02]'
        }`}
    >
      {/* Card inner content */}
      <div className="p-4 flex flex-col h-full">
        {/* Top stats bar - conditionally shown */}
        {showGameStats && (
          <div className="flex justify-between mb-3 font-mono text-xs">
            <div className="flex items-center text-red-400">
              <Zap className="w-3 h-3 mr-1" />
              <span>{defaultPower}</span>
            </div>
            <div className="flex items-center text-blue-400">
              <Shield className="w-3 h-3 mr-1" />
              <span>{defaultDefense}</span>
            </div>
          </div>
        )}
        
        {/* Song artwork/placeholder */}
        <div className={`w-full aspect-square mb-4 rounded-lg overflow-hidden bg-gradient-to-br ${getRarityColor(song.rarity)}`}>
          {song.image ? (
            <img src={song.image} alt={song.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-12 h-12 text-white/80" />
            </div>
          )}
        </div>
        
        {/* Song title and artist */}
        <div className="flex-grow">
          <h3 className="font-bold text-white text-lg line-clamp-1">{song.title}</h3>
          <p className="text-blue-200 text-sm line-clamp-1">{song.artist}</p>
          
          {/* Stats row */}
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {song.duration && (
              <div className="bg-white/10 px-2 py-1 rounded-full flex items-center">
                <Clock className="w-3 h-3 mr-1 text-blue-300" />
                <span className="text-white/80">{song.duration}</span>
              </div>
            )}
            
            {song.genre && (
              <div className="bg-white/10 px-2 py-1 rounded-full flex items-center">
                <Tag className="w-3 h-3 mr-1 text-blue-300" />
                <span className="text-white/80">{song.genre}</span>
              </div>
            )}
            
            {song.rarity && (
              <div className="bg-white/10 px-2 py-1 rounded-full flex items-center">
                <Star className="w-3 h-3 mr-1 text-yellow-400" />
                <span className="text-white/80 capitalize">{song.rarity}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center border-2 border-white">
            ✓
          </div>
        )}
        
        {/* Special ability - conditionally shown */}
        {showGameStats && song.special && (
          <div className="mt-4 text-xs bg-white/5 p-2 rounded border border-white/10">
            <span className="text-yellow-300 font-semibold">Special: </span>
            <span className="text-white/80">{song.special}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongCard;