'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Card from './Card'
import { Plus, X, Save } from 'lucide-react'

export default function CardDeck({ userCards, savedDeck = [], onSaveDeck }) {
  const [selectedCards, setSelectedCards] = useState(savedDeck)
  const [isEditMode, setIsEditMode] = useState(false)
  
  const MAX_DECK_SIZE = 10
  
  const handleAddCard = (card) => {
    if (selectedCards.length >= MAX_DECK_SIZE) return
    if (selectedCards.some(c => c.id === card.id)) return
    
    setSelectedCards(prev => [...prev, card])
  }
  
  const handleRemoveCard = (cardId) => {
    setSelectedCards(prev => prev.filter(card => card.id !== cardId))
  }
  
  const handleSaveDeck = () => {
    if (onSaveDeck) {
      onSaveDeck(selectedCards)
    }
    setIsEditMode(false)
  }
  
  return (
    <div className="bg-gray-900/50 backdrop-blur rounded-xl border border-gray-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Deck</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className="px-3 py-1 rounded-md bg-purple-700 hover:bg-purple-600 transition"
          >
            {isEditMode ? 'Cancel' : 'Edit Deck'}
          </button>
          
          {isEditMode && (
            <button 
              onClick={handleSaveDeck}
              className="px-3 py-1 rounded-md bg-green-600 hover:bg-green-500 transition flex items-center gap-1"
              disabled={selectedCards.length === 0}
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="font-medium">Cards in deck:</span>
          <span className={`font-bold ${selectedCards.length === MAX_DECK_SIZE ? 'text-green-400' : 'text-yellow-400'}`}>
            {selectedCards.length} / {MAX_DECK_SIZE}
          </span>
        </div>
      </div>
      
      {selectedCards.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-xl">
          <p className="text-gray-500 mb-3">Your deck is empty</p>
          <button 
            onClick={() => setIsEditMode(true)}
            className="px-4 py-2 rounded-full bg-purple-700 hover:bg-purple-600 transition text-sm"
          >
            Add Cards to Deck
          </button>
        </div>
      ) : (
        <div className="relative overflow-x-auto pb-4">
          <div className="flex gap-4">
            <AnimatePresence>
              {selectedCards.map((card, index) => (
                <motion.div 
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, x: -50 }}
                  className="relative"
                  style={{ transformOrigin: 'center bottom' }}
                >
                  <div className="scale-[0.7] origin-top">
                    <Card card={card} />
                  </div>
                  
                  {isEditMode && (
                    <button 
                      onClick={() => handleRemoveCard(card.id)}
                      className="absolute -top-2 -right-2 z-10 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isEditMode && selectedCards.length < MAX_DECK_SIZE && (
              <div className="h-[210px] w-[140px] border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center">
                <Plus className="h-8 w-8 text-gray-500 mb-2" />
                <p className="text-gray-500 text-sm text-center px-3">
                  Select cards from your collection
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {isEditMode && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Your Collection</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {userCards.map(card => {
              const isInDeck = selectedCards.some(c => c.id === card.id)
              return (
                <div 
                  key={card.id} 
                  className={`relative cursor-pointer transition ${isInDeck ? 'opacity-50' : 'hover:scale-105'}`}
                  onClick={() => !isInDeck && handleAddCard(card)}
                >
                  <div className="scale-[0.7] origin-top">
                    <Card card={card} />
                  </div>
                  {!isInDeck && selectedCards.length < MAX_DECK_SIZE && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/70 p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}