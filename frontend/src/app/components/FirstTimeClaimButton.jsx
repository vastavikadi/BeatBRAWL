// First-time Claim Button Component to be added to the Home component
import React, { useState, useEffect } from 'react';
import { Music, Gift, Sparkles, RefreshCcw } from 'lucide-react';
import axios from 'axios';

const ClaimSongsButton = ({ username, onClaimSuccess }) => {
  const [canClaim, setCanClaim] = useState(false);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

  useEffect(() => {
    if (!username || username === 'Guest') return;
    
    // Check if user can claim initial songs
    const checkClaimStatus = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${serverURL}/api/claim-status?username=${encodeURIComponent(username)}`);
        if (response.data.success) {
          setCanClaim(response.data.canClaim);
        }
      } catch (err) {
        console.error('Error checking claim status:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkClaimStatus();
  }, [username, serverURL]);

  const handleClaim = async () => {
    if (!username || username === 'Guest') {
      setError('Please log in to claim your songs');
      return;
    }
    
    setClaiming(true);
    setError('');
    
    try {
      const response = await axios.post(`${serverURL}/api/claim-initial-songs`, {
        username
      });
      
      if (response.data.success) {
        // Show success animation
        setShowAnimation(true);
        
        // After animation completes, hide the claim button and update parent component
        setTimeout(() => {
          setCanClaim(false);
          if (onClaimSuccess && response.data.songs) {
            onClaimSuccess(response.data.songs);
          }
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to claim songs');
      }
    } catch (err) {
      console.error('Error claiming songs:', err);
      setError(err.response?.data?.message || 'Failed to claim your songs. Please try again.');
    } finally {
      setTimeout(() => {
        setClaiming(false);
      }, 2000); // Keep showing animation for a bit
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center my-4">
        <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!canClaim) {
    return null;
  }

  return (
    <div className="relative w-full max-w-md mx-auto my-6">
      {showAnimation && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-30"></div>
            <div className="relative bg-primary text-primary-foreground rounded-full p-4">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>
          </div>
        </div>
      )}
      
      <div className={`bg-card backdrop-blur-md rounded-2xl p-6 border border-border card-glow ${showAnimation ? 'opacity-50' : ''}`}>
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
            <Gift className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Welcome to UNOSIC!</h3>
            <p className="text-muted-foreground text-sm">Claim your 10 random song cards to get started</p>
          </div>
        </div>
        
        {error && (
          <div className="bg-destructive/20 text-destructive-foreground p-3 rounded-lg mb-4 text-sm border border-destructive/30">
            {error}
          </div>
        )}
        
        <button
          onClick={handleClaim}
          disabled={claiming}
          className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all duration-300 flex items-center justify-center disabled:opacity-70 perspective-1000 group"
        >
          {claiming ? (
            <>
              <RefreshCcw className="w-5 h-5 mr-2 animate-spin" />
              Claiming Songs...
            </>
          ) : (
            <>
              <Music className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Claim Your 10 Free Songs
            </>
          )}
        </button>
        
        <p className="text-xs text-muted-foreground mt-3 text-center">
          This is a one-time offer for new players only!
        </p>
      </div>
    </div>
  );
};

export default ClaimSongsButton;