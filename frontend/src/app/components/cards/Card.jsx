'use client'

import { useState } from 'react'
import { Music, Disc, Heart, Clock, User, Award } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Card({ card, isPlayable = false, onPlay, showBack = false, isSelected = false }) {
  const [isFlipped, setIsFlipped] = useState(showBack)
  
  const handleClick = () => {
    if (isPlayable && onPlay) {
      onPlay(card)
    } else if (!isPlayable) {
      setIsFlipped(!isFlipped)
    }
  }
  
  const genreColorMap = {
    'Pop': 'from-pink-500 to-purple-500',
    'Rock': 'from-red-500 to-orange-500',
    'Hip Hop': 'from-blue-500 to-purple-500',
    'Electronic': 'from-cyan-500 to-blue-500',
    'R&B': 'from-violet-500 to-purple-500',
    'Jazz': 'from-amber-500 to-yellow-500',
    'Country': 'from-green-500 to-emerald-500',
    'Classical': 'from-gray-500 to-slate-500',
    'Reggae': 'from-green-500 to-yellow-500',
    'Folk': 'from-orange-500 to-amber-500',
    'Metal': 'from-slate-800 to-gray-900',
    'Blues': 'from-blue-600 to-indigo-700',
  }
  
  const genreGradient = genreColorMap[card?.genre] || 'from-purple-500 to-indigo-500'
  
  const rarityBorderMap = {
    'Common': 'border-gray-400',
    'Rare': 'border-blue-400',
    'Epic': 'border-purple-400',
    'Legendary': 'border-yellow-400',
  }
  
  const rarityBorder = rarityBorderMap[card?.rarity] || 'border-gray-400'
  
  return (
    <motion.div 
      className={`relative w-64 h-96 cursor-pointer rounded-2xl perspective-1000 ${isSelected ? 'ring-2 ring-yellow-400 scale-105' : ''}`}
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.div 
        className="w-full h-full relative preserve-3d transition-all duration-500"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
      >
        {/* Front of Card */}
        <motion.div 
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${genreGradient} border-2 ${rarityBorder} shadow-xl backface-hidden`}
        >
          <div className="absolute inset-2 rounded-xl bg-gray-900/90 p-4 flex flex-col">
            {/* Card Header */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-1">
                <Disc className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">{card?.genre}</span>
              </div>
              <div className="bg-black/30 px-2 py-0.5 rounded text-xs font-semibold">
                {card?.rarity}
              </div>
            </div>
            
            {/* Card Image or Icon */}
            <div className="bg-black/20 rounded-lg h-32 flex items-center justify-center mb-3">
              <Music className="h-16 w-16 text-white/70" />
            </div>
            
            {/* Card Title */}
            <h3 className="text-lg font-bold line-clamp-2 mb-1">{card?.title}</h3>
            <p className="text-sm text-gray-300 mb-2 line-clamp-1">{card?.artist}</p>
            
            {/* Card Stats */}
            <div className="mt-auto grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4 text-blue-400" />
                <span>{card?.duration || '3:45'}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Award className="h-4 w-4 text-amber-400" />
                <span>{card?.releaseYear || '2023'}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Heart className="h-4 w-4 text-red-400" />
                <span>{card?.popularity || '85%'}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <User className="h-4 w-4 text-green-400" />
                <span>{card?.listeners || '4.2M'}</span>
              </div>
            </div>
            
            {/* Playable Indicator */}
            {isPlayable && (
              <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black p-1 rounded-full shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Back of Card */}
        <motion.div 
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-700 border-2 border-indigo-400 shadow-xl backface-hidden rotateY-180"
        >
          <div className="absolute inset-2 rounded-xl bg-gray-900/90 p-4 flex flex-col items-center justify-center">
            <Music className="h-16 w-16 text-yellow-400 mb-6" />
            <div className="text-center">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-300">beatBRAWL</h3>
              <p className="text-sm text-gray-400 mt-2">Turn-based musical card game</p>
            </div>
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <div className="text-xs text-gray-500">Tap to flip card</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}