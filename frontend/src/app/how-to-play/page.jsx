import Link from 'next/link'
import { Music, ArrowLeft, Disc, GitCompare, Clock, User, Heart, Award, Play, Plus } from 'lucide-react'

export default function HowToPlay() {
  const steps = [
    {
      title: "Getting Cards",
      description: "When you first start, you'll receive 10 free cards. You'll also get a free card each week. Want more? Subscribe to get an extra card weekly, or buy card packs from the shop.",
      icon: <Disc className="h-12 w-12 text-purple-400" />
    },
    {
      title: "Building Your Deck",
      description: "Create a deck of 10 cards from your collection. Choose cards wisely to maximize matching possibilities with different genres, artists, and durations.",
      icon: <Plus className="h-12 w-12 text-green-400" />
    },
    {
      title: "Creating a Game",
      description: "Start a game room and invite a friend using the room code. Once your friend joins, both players need to mark themselves as ready, then the host can start the game.",
      icon: <Play className="h-12 w-12 text-yellow-400" />
    },
    {
      title: "Playing Cards",
      description: "Players take turns placing cards that match the center card. Cards match if they share any attribute: same genre, artist, similar duration, release year, or popularity.",
      icon: <GitCompare className="h-12 w-12 text-blue-400" />
    },
    {
      title: "Winning the Game",
      description: "Be the first to play all your cards to win! If you can't play any cards on your turn, you must draw a card and skip your turn.",
      icon: <Award className="h-12 w-12 text-amber-400" />
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-gray-900 to-black">
      <header className="relative z-10 pt-6 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Music className="text-yellow-400 h-6 w-6" />
            <span className="font-bold text-xl">beatBRAWL</span>
          </Link>
          
          <Link 
            href="/" 
            className="px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700 transition flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How To Play</h1>
            <p className="text-lg text-gray-300">Learn the basics of beatBRAWL and start playing today!</p>
          </div>
          
          {/* Introduction */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 mb-12">
            <h2 className="text-2xl font-bold mb-4">Game Overview</h2>
            <p className="text-gray-300 mb-4">
              beatBRAWL is a turn-based card game where players match musical cards based on shared attributes. 
              The goal is to be the first player to play all your cards.
            </p>
            <p className="text-gray-300">
              Each card represents a song and has attributes like genre, artist, duration, release year, and popularity.
              To play a card, it must match at least one attribute with the card in the center.
            </p>
          </div>
          
          {/* Steps */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/5 flex justify-center">
                    <div className="bg-purple-900/30 p-4 rounded-full">
                      {step.icon}
                    </div>
                  </div>
                  <div className="md:w-4/5">
                    <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                    <p className="text-gray-300">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Card Matching Rules */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 mt-12">
            <h2 className="text-2xl font-bold mb-6">Card Matching Rules</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/70 p-4 rounded-lg flex items-center gap-3">
                <Disc className="h-6 w-6 text-purple-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Same Genre</h4>
                  <p className="text-sm text-gray-300">Cards with the same music genre match (e.g., Pop, Rock, Hip Hop)</p>
                </div>
              </div>
              <div className="bg-gray-800/70 p-4 rounded-lg flex items-center gap-3">
                <User className="h-6 w-6 text-blue-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Same Artist</h4>
                  <p className="text-sm text-gray-300">Cards by the same artist or band match</p>
                </div>
              </div>
              <div className="bg-gray-800/70 p-4 rounded-lg flex items-center gap-3">
                <Clock className="h-6 w-6 text-green-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Similar Duration</h4>
                  <p className="text-sm text-gray-300">Songs with durations within 30 seconds of each other match</p>
                </div>
              </div>
              <div className="bg-gray-800/70 p-4 rounded-lg flex items-center gap-3">
                <Heart className="h-6 w-6 text-red-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Similar Popularity</h4>
                  <p className="text-sm text-gray-300">Songs with popularity ratings within 10% of each other match</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Card Rarities */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 mt-12">
            <h2 className="text-2xl font-bold mb-6">Card Rarities</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2">
                <p className="text-gray-300 mb-4">
                  Cards come in different rarities, each with unique colors and chances of appearing in packs:
                </p>
              </div>
              
              <div className="bg-gray-800/30 border border-gray-700 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-gray-300">Common</h4>
                  <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                </div>
                <p className="text-sm text-gray-400">Most frequent cards, make up the majority of your collection</p>
              </div>
              
              <div className="bg-gray-800/30 border border-blue-700/30 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-blue-300">Rare</h4>
                  <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                </div>
                <p className="text-sm text-gray-400">Uncommon cards with better attributes, guaranteed in basic packs</p>
              </div>
              
              <div className="bg-gray-800/30 border border-purple-700/30 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-purple-300">Epic</h4>
                  <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
                </div>
                <p className="text-sm text-gray-400">Rare cards with excellent attributes, guaranteed in legendary packs</p>
              </div>
              
              <div className="bg-gray-800/30 border border-yellow-700/30 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-yellow-300">Legendary</h4>
                  <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                </div>
                <p className="text-sm text-gray-400">The rarest and most powerful cards, small chance in legendary packs</p>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-lg text-gray-300 mb-6">Ready to start your musical journey?</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/auth/register" 
                className="px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-semibold transition shadow-lg shadow-amber-500/20"
              >
                Create Account
              </Link>
              <Link 
                href="/tutorial" 
                className="px-6 py-3 rounded-full bg-gray-800 hover:bg-gray-700 transition"
              >
                Interactive Tutorial
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}