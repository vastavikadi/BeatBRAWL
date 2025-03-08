'use client'

import { useState } from 'react'
import Card from './Card'

export default function CardGrid({ cards, selectable = false, onSelect, maxSelections = 0 }) {
  const [selectedCards, setSelectedCards] = useState([])
  
  const handleCardClick = (card) => {
    if (!selectable) return
    
    setSelectedCards(prev => {
      // If card is already selected, remove it
      if (prev.some(c => c.id === card.id)) {
        const filtered = prev.filter(c => c.id !== card.id)
        if (onSelect) onSelect(filtered)
        return filtered
      }
      
      // If max selections reached, don't add
      if (maxSelections > 0 && prev.length >= maxSelections) {
        return prev
      }
      
      // Add card to selection
      const newSelected = [...prev, card]
      if (onSelect) onSelect(newSelected)
      return newSelected
    })
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cards.map(card => (
        <div key={card.id} onClick={() => handleCardClick(card)}>
          <Card 
            card={card} 
            isSelected={selectedCards.some(c => c.id === card.id)}
          />
        </div>
      ))}
    </div>
  )
}