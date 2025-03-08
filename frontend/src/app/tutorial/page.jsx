'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Music, ArrowLeft, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import Card from '../components/cards/Card'

export default function Tutorial() {
  const [step, setStep] = useState(0)
  
  const tutorialSteps = [
    {
      title: "Welcome to beatBRAWL",
      description: "This tutorial will guide you through the basics of playing beatBRAWL. Let's get started!",
      image: "/battleground/saiman.jpg"
    },
    {
      title: "Understanding Cards",
      description: "Each card represents a song and has attributes like genre, artist, duration, release year, and popularity rating.",
      component: (
        <div className="flex justify-center">
          <Card 
            card={{
              id: 'tutorial-1',
              title: 'Eternal Melody',
              artist: 'Luna Ray',
              genre: 'Pop',
              duration: '3:45',
              releaseYear: 2023,
              popularity: '92%',
              listeners: '4.2M',
              rarity: 'Rare'
            }}
          />
        </div>
      )
    },
    {
      title: "Building Your Deck",
      description: "Choose 10 cards from your collection to create your deck. Try to include cards with diverse attributes to increase your matching possibilities.",
      component: (
        <div className="flex justify-center gap-4 overflow-x-auto py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="transform" style={{ transform: `rotate(${(i - 2) * 5}deg)` }}>
              <Card 
                card={{
                  id: `tutorial-deck-${i}`,
                  title: ['Summer Vibes', 'Midnight Blues', 'Electric Dreams', 'Mountain Echo', 'Ocean Waves'][i],
                  artist: ['Luna Ray', 'The Echoes', 'Neon Knights', 'Silver Sound', 'Ocean Drift'][i],
                  genre: ['Pop', 'Rock', 'Electronic', 'Jazz', 'Hip Hop'][i],
                  duration: `${Math.floor(Math.random() * 4) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
                  releaseYear: Math.floor(Math.random() * 10) + 2015,
                  popularity: `${Math.floor(Math.random() * 40) + 60}%`,
                  listeners: `${(Math.random() * 10).toFixed(1)}M`,
                  rarity: ['Common', 'Common', 'Rare', 'Epic', 'Legendary'][i]
                }}
                showBack={false}
              />
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Game Start",
      description: "At the beginning of the game, each player draws 5 cards from their deck. The first player can play any card to start the game.",
      component: (
        <div className="relative flex flex-col items-center">
          <div className="w-64 h-96 border-2 border-dashed border-gray-700 rounded-2xl flex items-center justify-center mb-8">
            <p className="text-gray-500">Center - Play first card here</p>
          </div>
          
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="transform" style={{ transform: `rotate(${(i - 1) * 5}deg)` }}>
                <Card 
                  card={{
                    id: `tutorial-hand-${i}`,
                    title: ['Summer Vibes', 'Midnight Blues', 'Electric Dreams'][i],
                    artist: ['Luna Ray', 'The Echoes', 'Neon Knights'][i],
                    genre: ['Pop', 'Rock', 'Electronic'][i],
                    duration: `${Math.floor(Math.random() * 4) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
                    releaseYear: Math.floor(Math.random() * 10) + 2015,
                    popularity: `${Math.floor(Math.random() * 40) + 60}%`,
                    listeners: `${(Math.random() * 10).toFixed(1)}M`,
                    rarity: ['Common', 'Rare', 'Epic'][i]
                  }}
                  isPlayable={true}
                />
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Matching Cards",
      description: "On your turn, you must play a card that matches at least one attribute with the center card. In this example, both cards share the same genre: Pop.",
      component: (
        <div className="relative flex flex-col items-center">
          <div className="mb-8">
            <Card 
              card={{
                id: 'tutorial-center',
                title: 'Summer Vibes',
                artist: 'Luna Ray',
                genre: 'Pop',
                duration: '3:42',
                releaseYear: 2023,
                popularity: '88%',
                listeners: '3.8M',
                rarity: 'Common'
              }}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div>
              <Card 
                card={{
                  id: 'tutorial-match',
                  title: 'Crystal Dreams',
                  artist: 'Melody Masters',
                  genre: 'Pop',
                  duration: '4:12',
                  releaseYear: 2021,
                  popularity: '75%',
                  listeners: '2.5M',
                  rarity: 'Common'
                }}
                isPlayable={true}
              />
            </div>
            
            <div className="p-2 rounded-full bg-green-500">
              <Check className="h-6 w-6" />
            </div>
          </div>
          
          <div className="bg-green-900/20 border border-green-900/30 rounded-md px-3 py-2 mt-4">
            <p className="text-green-400 text-sm">Match found: Same genre (Pop)</p>
          </div>
        </div>
      )
    },
    {
      title: "Drawing Cards",
      description: "If you don't have a matching card, you must draw a card from your deck and skip your turn. The first player to play all their cards wins!",
      component: (
        <div className="flex flex-col items-center">
          <div className="bg-gray-800 p-4 rounded-lg text-center mb-6">
            <p className="text-yellow-400 mb-2">No playable cards</p>
            <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-md transition">
              Draw Card
            </button>
          </div>
          
          <div className="flex gap-4 justify-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="opacity-50">
                <Card 
                  card={{
                    id: `tutorial-noplay-${i}`,
                    title: ['Electronic Sunset', 'Midnight Drive', 'Urban Jungle'][i],
                    artist: ['Digital Dreams', 'Night Cruisers', 'City Sounds'][i],
                    genre: ['Electronic', 'Synthwave', 'Hip Hop'][i],
                    duration: `${Math.floor(Math.random() * 4) + 2}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
                    releaseYear: Math.floor(Math.random() * 10) + 2015,
                    popularity: `${Math.floor(Math.random() * 40) + 60}%`,
                    listeners: `${(Math.random() * 10).toFixed(1)}M`,
                    rarity: ['Common', 'Rare', 'Common'][i]
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "Winning the Game",
      description: "The first player to play all their cards wins the game! As you win games, you'll earn experience points and level up to unlock new features and rewards.",
      component: (
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-green-500/30 p-6 text-center">
          <h3 className="text-2xl font-bold text-green-400 mb-4">You Won!</h3>
          <p className="text-gray-300 mb-6">Congratulations on playing all your cards first!</p>
          
          <div className="flex justify-center space-x-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-yellow-400 text-xl font-bold">+25</p>
              <p className="text-sm text-gray-400">XP Gained</p>
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <p className="text-purple-400 text-xl font-bold">+15</p>
              <p className="text-sm text-gray-400">Rank Points</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Ready to Play?",
      description: "Now that you understand the basics, it's time to start your beatBRAWL journey! Sign up to get your first 10 cards and begin playing.",
      component: (
        <div className="flex flex-col items-center gap-6">
          <img src="/assets/images/tutorial/complete.svg" alt="Tutorial Complete" className="w-40 h-40" />
          
          <div className="flex gap-4">
            <Link 
              href="/auth/register" 
              className="px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-semibold transition shadow-lg shadow-amber-500/20"
            >
              Create Account
            </Link>
            <Link 
              href="/login" 
              className="px-6 py-3 rounded-full bg-gray-800 hover:bg-gray-700 transition"
            >
              Login
            </Link>
          </div>
        </div>
      )
    }
  ]
  
  const currentStep = tutorialSteps[step]
  
  const handleNext = () => {
    if (step < tutorialSteps.length - 1) {
      setStep(step + 1)
    }
  }
  
  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-gray-900 to-black">
      <header className="relative z-10 pt-6 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Music className="text-yellow-400 h-6 w-6" />
            <span className="font-bold text-xl">beatBRAWL</span>
          </Link>
          
          <Link 
            href="/how-to-play" 
            className="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 transition flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to How To Play</span>
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-8">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Progress</span>
                <span>{step + 1} / {tutorialSteps.length}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${((step + 1) / tutorialSteps.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {/* Step content */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{currentStep.title}</h2>
              <p className="text-gray-300 mb-8">{currentStep.description}</p>
              
              <div className="min-h-[400px] flex items-center justify-center">
                {currentStep.component || (
                  <img 
                    src={currentStep.image || "/assets/images/tutorial/placeholder.svg"} 
                    alt={currentStep.title}
                    className="max-h-80"
                  />
                )}
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handlePrev}
                disabled={step === 0}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  step === 0 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Previous</span>
              </button>
              
              <button
                onClick={handleNext}
                disabled={step === tutorialSteps.length - 1}
                className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                  step === tutorialSteps.length - 1 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                }`}
              >
                <span>Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Skip tutorial */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-gray-400 hover:text-white transition">
              Skip tutorial and return to home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}