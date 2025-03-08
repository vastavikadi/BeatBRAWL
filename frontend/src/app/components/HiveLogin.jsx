'use client'

import { useState } from 'react'
import { LogIn, Music, Disc, User, KeyRound, ExternalLink } from 'lucide-react'
import { toast } from './ui/Toaster'
import Button from './ui/Button'
import { useRouter } from 'next/navigation'

export default function HiveLogin({ onSuccess }) {
  const router = useRouter();
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";
  
  const handleHiveKeychainLogin = async (e) => {
    e.preventDefault();
    
    if (!username || username.trim() === '') {
      toast.error("Hive username is required for login");
      return;
    }
    
    setIsLoading(true);
    
    const hiveUsername = username.trim();
    
    window.hive_keychain.requestHandshake(() => {
      window.hive_keychain.requestSignBuffer(
        hiveUsername,
        "Login to beatBRAWL",
        "Posting",
        async (response) => {
          if (response.success) {
            localStorage.setItem("hiveUsername", hiveUsername);
            try {
              const res = await fetch(`${serverURL}/api/register`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ hiveUsername }),
              });

              if (res.ok) {
                const data = await res.json();
                if (data.token) {
                  localStorage.setItem("jwtToken", data.token);
                  const token = data.token;
                  
                  // Call the onSuccess callback with username and token
                  if (onSuccess) {
                    onSuccess(hiveUsername, token);
                  }
                  
                  toast.success(
                    "Hive Keychain login successful! Welcome to beatBRAWL."
                  );
                  router.push('/game-menu');
                }
              } else {
                const errorData = await res.json();
                toast.error(
                  errorData.message || "Authentication failed"
                );
              }
            } catch (error) {
              console.error("Error authenticating user:", error);
              toast.error("Network error during authentication");
            }
          } else {
            toast.error(response.error || "Hive Keychain login failed");
          }
          setIsLoading(false);
        }
      );
    });
  };
  
  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden bg-gradient-to-br from-gray-900/80 via-purple-900/30 to-gray-900/80 backdrop-blur-sm rounded-xl border border-purple-800/30 shadow-xl shadow-purple-900/10 p-8 transition-all hover:shadow-purple-800/20">
      {/* Decorative elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-400 opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-400 opacity-10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        {/* Header with icon */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-2.5 rounded-lg shadow-lg shadow-purple-900/20">
            <KeyRound className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-indigo-300">
            Connect Your Hive Account
          </h2>
        </div>
        
        <p className="text-gray-300 mb-8 leading-relaxed">
          Connect your Hive account to play beatBRAWL, collect music cards, and compete with other players in this turn-based musical card game.
        </p>
        
        <form onSubmit={handleHiveKeychainLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="hive-username" className="block text-sm font-medium text-gray-200 flex items-center gap-1.5">
              <User className="h-4 w-4 text-purple-400" />
              <span>Hive Username</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-purple-500">@</span>
              </div>
              <input
                id="hive-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your Hive username"
                className="bg-gray-800/70 border border-purple-700/30 focus:border-purple-500/50 text-white w-full pl-8 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-sm"
              />
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3 rounded-lg font-semibold text-lg shadow-lg shadow-purple-900/20 transform transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            loading={isLoading}
            disabled={isLoading}
          >
            <LogIn className="h-5 w-5" />
            <span>Connect with Hive Keychain</span>
          </Button>
        </form>
        
        {/* Visual card stack decoration */}
        <div className="flex justify-center my-8">
          <div className="relative h-12 w-28">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                style={{ transform: `rotate(${(i-1) * 8}deg)` }} 
                className={`absolute top-0 left-${i*2} right-0 h-12 bg-gradient-to-br ${
                  i === 0 ? 'from-purple-600 to-indigo-600 z-20' : 
                  i === 1 ? 'from-indigo-600 to-blue-600 z-10' : 
                  'from-blue-600 to-cyan-600 z-0'
                } rounded-md shadow-md border border-purple-500/30`}
              >
                <div className="h-full bg-gray-900/60 m-px rounded-md flex items-center justify-center">
                  <Music className={`h-5 w-5 ${
                    i === 0 ? 'text-purple-400' : 
                    i === 1 ? 'text-indigo-400' : 
                    'text-blue-400'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 p-5 bg-gray-800/40 border border-purple-800/20 rounded-lg">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Disc className="h-5 w-5 text-purple-400" />
            <span>Don't have Hive Keychain?</span>
          </h3>
          <p className="text-sm text-gray-300 mb-4">
            Hive Keychain is a browser extension that allows secure interaction with the Hive blockchain.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://chrome.google.com/webstore/detail/hive-keychain/jcacnejopjdphbnjgfaaobbfafkihpep', '_blank')}
              className="border-purple-700/50 hover:bg-purple-700/20 hover:border-purple-500 flex items-center gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Chrome Extension</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://addons.mozilla.org/en-US/firefox/addon/hive-keychain/', '_blank')}
              className="border-purple-700/50 hover:bg-purple-700/20 hover:border-purple-500 flex items-center gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Firefox Add-on</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://hive.io/', '_blank')}
              className="border-purple-700/50 hover:bg-purple-700/20 hover:border-purple-500 flex items-center gap-1.5"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Learn About Hive</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
