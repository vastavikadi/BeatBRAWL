import Link from 'next/link'
import { Music, User, Disc, Heart, Trophy, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-gray-900 to-black">
      {/* Header */}
      <header className="relative z-10 pt-6 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Music className="text-yellow-400 h-8 w-8" />
            <span className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-300">
              beatBRAWL
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* <Link 
              href="/dashboard" 
              className="px-4 py-2 rounded-full bg-purple-800 hover:bg-purple-700 transition duration-300 flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              <span>Dashboard</span>
            </Link> */}
            <Link 
              href="/login" 
              className="px-4 py-2 rounded-full bg-yellow-500 text-black hover:bg-yellow-400 transition duration-300"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-20 pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Play With <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-300">Music</span>, 
              Collect <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-300">Cards</span>
            </h1>
            <p className="text-lg text-gray-300">
              beatBRAWL is a turn-based musical card game built on the HIVE blockchain. 
              Choose cards for your deck, challenge friends, and compete to win in a musical fashion!
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                href="/login" 
                className="px-6 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-semibold hover:from-yellow-400 hover:to-amber-300 transition duration-300 shadow-lg shadow-amber-500/20"
              >
                Start Playing Now
              </Link>
              <Link 
                href="/how-to-play" 
                className="px-6 py-3 rounded-full bg-gray-800/70 border border-gray-700 hover:bg-gray-700/70 transition duration-300"
              >
                How to Play
              </Link>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative">
            {/* Card Stack Visual */}
            <div className="relative w-full h-96 perspective-1000">
              {[1, 2, 3, 4, 5].map((i, index) => (
                <div 
                  key={i}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-800 border-2 border-purple-400/30 shadow-xl transform transition-all duration-500 ease-out"
                  style={{ 
                    transform: `rotateY(${index * 5}deg) translateZ(${index * 10}px) translateX(${index * 5}px)`,
                    zIndex: 5 - index
                  }}
                >
                  <div className="absolute inset-0.5 rounded-xl bg-gray-900/90 flex flex-col items-center justify-center p-6">
                    <Music className="h-16 w-16 text-yellow-400 mb-4" />
                    <div className="text-center space-y-1">
                      <h3 className="text-xl font-bold text-white">Super Song Title</h3>
                      <p className="text-sm text-gray-400">Artist Name</p>
                    </div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-1 text-sm">
                      <Disc className="h-4 w-4 text-purple-400" />
                      <span>Pop</span>
                    </div>
                    <div className="absolute bottom-4 right-4 flex items-center gap-1 text-sm">
                      <Heart className="h-4 w-4 text-red-400" />
                      <span>92%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-300">beatBRAWL</span>?
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: <Music className="h-8 w-8 text-yellow-400" />, title: "Peaceful Card Game", desc: "Enjoy a relaxing card game experience with your favorite music" },
            { icon: <Disc className="h-8 w-8 text-purple-400" />, title: "Play with Melodies", desc: "Battle with and against melodies from different genres" },
            { icon: <Heart className="h-8 w-8 text-red-400" />, title: "Discover New Songs", desc: "Find new music in a fun and interactive way" },
            { icon: <Zap className="h-8 w-8 text-blue-400" />, title: "Build Your Deck", desc: "Create your own unbeatable deck of musical cards" },
            { icon: <User className="h-8 w-8 text-green-400" />, title: "Play with Friends", desc: "Create rooms and challenge your friends to musical battles" },
            { icon: <Trophy className="h-8 w-8 text-amber-400" />, title: "Weekly Rewards", desc: "Get new cards every week and grow your collection" }
          ].map((feature, index) => (
            <div 
              key={index} 
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Get Started Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-purple-900/60 to-indigo-900/60 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-purple-700/50 shadow-xl shadow-purple-900/20">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Start Your Musical Journey?</h2>
            <p className="text-lg text-gray-300">
              Sign up now and get 10 free cards to start your collection. 
              Challenge friends, discover new music, and climb the leaderboard!
            </p>
            <div className="pt-4">
              <Link 
                href="/tutorial" 
                className="px-8 py-4 rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-semibold text-lg hover:from-yellow-400 hover:to-amber-300 transition duration-300 shadow-lg shadow-amber-500/20"
              >
                Learn About Game
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Music className="text-yellow-400 h-6 w-6" />
            <span className="font-bold text-xl">beatBRAWL</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/about" className="text-gray-400 hover:text-white transition">About</Link>
            <Link href="/faq" className="text-gray-400 hover:text-white transition">FAQ</Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition">Terms</Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white transition">Privacy</Link>
            <Link href="/contact" className="text-gray-400 hover:text-white transition">Contact</Link>
          </div>
          <div className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} beatBRAWL. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}