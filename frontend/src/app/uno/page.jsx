'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, RotateCw, Ban, Plus, Volume2, VolumeX, RefreshCw } from 'lucide-react';

// Card colors
const COLORS = ['red', 'blue', 'green', 'yellow'];
// Card values
const VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', 'Draw Two', 'Wild', 'Wild Draw Four'];

// UNO Game Component
const UnoGame = () => {
  // Game state
  const [deck, setDeck] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [players, setPlayers] = useState([
    { id: 1, name: 'Player 1', cards: [], isActive: true, isComputer: false },
    { id: 2, name: 'Player 2', cards: [], isActive: false, isComputer: true }
  ]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [direction, setDirection] = useState(1); // 1 for clockwise, -1 for counter-clockwise
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [chooseColor, setChooseColor] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showUnoButton, setShowUnoButton] = useState(false);
  const [unoButtonPressed, setUnoButtonPressed] = useState(false);
  const [message, setMessage] = useState('Welcome to UNO! Press Start to begin.');
  const [animation, setAnimation] = useState({ active: false, type: '', card: null });

  // Audio references
  const cardPlaySound = useRef(null);
  const cardDrawSound = useRef(null);
  const gameWinSound = useRef(null);
  const unoCallSound = useRef(null);

  // Initialize sounds
  useEffect(() => {
    if (typeof window !== 'undefined') {
      cardPlaySound.current = new Audio('/card-play.mp3');
      cardDrawSound.current = new Audio('/card-draw.mp3');
      gameWinSound.current = new Audio('/game-win.mp3');
      unoCallSound.current = new Audio('/uno-call.mp3');
    }
  }, []);

  // Play sound effect
  const playSound = (sound) => {
    if (soundEnabled && sound.current) {
      sound.current.currentTime = 0;
      sound.current.play().catch(e => console.error("Error playing sound:", e));
    }
  };

  // Generate a card deck
  const generateDeck = () => {
    const newDeck = [];
    
    // Generate colored cards
    COLORS.forEach(color => {
      // One '0' card per color
      newDeck.push({ id: `${color}_0`, color, value: '0', special: false });
      
      // Two cards of each value 1-9, Skip, Reverse, Draw Two per color
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', 'Draw Two'].forEach(value => {
        const isSpecial = value === 'Skip' || value === 'Reverse' || value === 'Draw Two';
        newDeck.push({ id: `${color}_${value}_1`, color, value, special: isSpecial });
        newDeck.push({ id: `${color}_${value}_2`, color, value, special: isSpecial });
      });
    });
    
    // Add Wild and Wild Draw Four cards (4 of each)
    for (let i = 0; i < 4; i++) {
      newDeck.push({ id: `wild_${i}`, color: 'black', value: 'Wild', special: true });
      newDeck.push({ id: `wild_draw_four_${i}`, color: 'black', value: 'Wild Draw Four', special: true });
    }
    
    return newDeck;
  };

  // Shuffle the deck using Fisher-Yates algorithm
  const shuffleDeck = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Deal cards to players
  const dealCards = (deck, players) => {
    const newDeck = [...deck];
    const newPlayers = [...players];
    
    // Deal 7 cards to each player
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < newPlayers.length; j++) {
        if (newDeck.length > 0) {
          const card = newDeck.pop();
          newPlayers[j].cards.push(card);
        }
      }
    }
    
    // Select first card for discard pile (should not be a special card)
    let firstCard;
    do {
      firstCard = newDeck.pop();
    } while (firstCard.color === 'black' || firstCard.special);
    
    setCurrentCard(firstCard);
    const newDiscardPile = [firstCard];
    
    return { newDeck, newPlayers, newDiscardPile };
  };

  // Start a new game
  const startGame = () => {
    const newDeck = shuffleDeck(generateDeck());
    const { newDeck: updatedDeck, newPlayers, newDiscardPile } = dealCards(newDeck, players);
    
    setDeck(updatedDeck);
    setPlayers(newPlayers);
    setDiscardPile(newDiscardPile);
    setCurrentPlayer(0);
    setDirection(1);
    setGameStarted(true);
    setGameOver(false);
    setWinner(null);
    setMessage(`${players[0].name}'s turn`);
    
    // Check if first player has only one card
    if (newPlayers[0].cards.length === 1) {
      setShowUnoButton(true);
    }
  };

  // Draw a card
  const drawCard = (playerId) => {
    if (gameOver) return;
    
    const newDeck = [...deck];
    const newPlayers = [...players];
    
    // If deck is empty, shuffle discard pile
    if (newDeck.length === 0) {
      const currentCardOnTop = discardPile[discardPile.length - 1];
      const newDiscardPile = [currentCardOnTop];
      const cardsToShuffle = discardPile.slice(0, -1);
      const shuffledCards = shuffleDeck(cardsToShuffle);
      
      newDeck.push(...shuffledCards);
      setDiscardPile(newDiscardPile);
    }
    
    // Draw card
    if (newDeck.length > 0) {
      const card = newDeck.pop();
      newPlayers[playerId].cards.push(card);
      playSound(cardDrawSound);
      
      setAnimation({
        active: true,
        type: 'draw',
        card: card
      });
      
      setTimeout(() => setAnimation({ active: false, type: '', card: null }), 500);
    }
    
    setDeck(newDeck);
    setPlayers(newPlayers);
    
    // Check for UNO button
    if (newPlayers[playerId].cards.length === 2) {
      setShowUnoButton(false);
      setUnoButtonPressed(false);
    }
    
    // Move to next player if human player drew a card
    if (playerId === 0) {
      nextTurn();
    }
  };

  // Draw multiple cards (for Draw Two and Wild Draw Four)
  const drawMultipleCards = (playerId, count) => {
    let newDeck = [...deck];
    let newPlayers = [...players];
    
    for (let i = 0; i < count; i++) {
      // If deck is empty, shuffle discard pile
      if (newDeck.length === 0) {
        const currentCardOnTop = discardPile[discardPile.length - 1];
        const newDiscardPile = [currentCardOnTop];
        const cardsToShuffle = discardPile.slice(0, -1);
        const shuffledCards = shuffleDeck(cardsToShuffle);
        
        newDeck.push(...shuffledCards);
        setDiscardPile(newDiscardPile);
      }
      
      // Draw card
      if (newDeck.length > 0) {
        const card = newDeck.pop();
        newPlayers[playerId].cards.push(card);
      }
    }
    
    playSound(cardDrawSound);
    
    setDeck(newDeck);
    setPlayers(newPlayers);
    
    // Check for UNO button
    if (newPlayers[playerId].cards.length === 2) {
      setShowUnoButton(false);
      setUnoButtonPressed(false);
    }
  };

  // Check if a card can be played
  const canPlayCard = (card) => {
    if (!currentCard) return false;
    
    // Wild cards can always be played
    if (card.color === 'black') return true;
    
    // Match color or value
    return card.color === currentCard.color || card.value === currentCard.value;
  };

  // Play a card
  const playCard = (playerId, cardIndex) => {
    if (gameOver || (playerId !== currentPlayer) || chooseColor) return;
    
    const card = players[playerId].cards[cardIndex];
    
    if (!canPlayCard(card)) {
      setMessage("You can't play that card!");
      return;
    }
    
    // Remove card from player's hand
    const newPlayers = [...players];
    const playedCard = newPlayers[playerId].cards.splice(cardIndex, 1)[0];
    
    // Add card to discard pile
    const newDiscardPile = [...discardPile, playedCard];
    
    setPlayers(newPlayers);
    setDiscardPile(newDiscardPile);
    setCurrentCard(playedCard);
    
    // Play sound effect
    playSound(cardPlaySound);
    
    // Animate card play
    setAnimation({
      active: true,
      type: 'play',
      card: playedCard
    });
    
    setTimeout(() => setAnimation({ active: false, type: '', card: null }), 500);
    
    // Check if player has won
    if (newPlayers[playerId].cards.length === 0) {
      setGameOver(true);
      setWinner(newPlayers[playerId]);
      setMessage(`${newPlayers[playerId].name} wins!`);
      playSound(gameWinSound);
      return;
    }
    
    // Check for UNO
    if (newPlayers[playerId].cards.length === 1 && !unoButtonPressed) {
      setShowUnoButton(true);
    } else {
      setShowUnoButton(false);
      setUnoButtonPressed(false);
    }
    
    // Handle special cards
    if (playedCard.special) {
      handleSpecialCard(playedCard, playerId);
    } else {
      nextTurn();
    }
  };

  // Handle special cards effects
  const handleSpecialCard = (card, playerId) => {
    switch (card.value) {
      case 'Skip':
        setMessage(`${players[playerId].name} played Skip! ${players[getNextPlayer()].name}'s turn is skipped.`);
        nextTurn(true); // Skip next player
        break;
        
      case 'Reverse':
        setDirection(direction * -1);
        setMessage(`${players[playerId].name} played Reverse! Direction is reversed.`);
        nextTurn();
        break;
        
      case 'Draw Two':
        const nextPlayer = getNextPlayer();
        setMessage(`${players[playerId].name} played Draw Two! ${players[nextPlayer].name} draws 2 cards.`);
        drawMultipleCards(nextPlayer, 2);
        nextTurn(true); // Skip next player
        break;
        
      case 'Wild':
        if (playerId === 0) { // Human player
          setChooseColor(true);
          setMessage('Choose a color');
        } else { // Computer player
          // Computer chooses most frequent color in its hand
          const colorCounts = {};
          players[playerId].cards.forEach(c => {
            if (c.color !== 'black') {
              colorCounts[c.color] = (colorCounts[c.color] || 0) + 1;
            }
          });
          
          let maxColor = COLORS[0];
          let maxCount = 0;
          
          COLORS.forEach(color => {
            if (colorCounts[color] > maxCount) {
              maxCount = colorCounts[color];
              maxColor = color;
            }
          });
          
          const newDiscardPile = [...discardPile];
          newDiscardPile[newDiscardPile.length - 1] = { ...newDiscardPile[newDiscardPile.length - 1], color: maxColor };
          
          setDiscardPile(newDiscardPile);
          setCurrentCard({ ...currentCard, color: maxColor });
          setMessage(`${players[playerId].name} played Wild and chose ${maxColor}!`);
          nextTurn();
        }
        break;
        
      case 'Wild Draw Four':
        const nextPlayerIndex = getNextPlayer();
        
        if (playerId === 0) { // Human player
          setChooseColor(true);
          setMessage('Choose a color');
          // Store next player to draw after color is chosen
          window.nextPlayerToDraw = nextPlayerIndex;
        } else { // Computer player
          // Computer chooses most frequent color in its hand
          const colorCounts = {};
          players[playerId].cards.forEach(c => {
            if (c.color !== 'black') {
              colorCounts[c.color] = (colorCounts[c.color] || 0) + 1;
            }
          });
          
          let maxColor = COLORS[0];
          let maxCount = 0;
          
          COLORS.forEach(color => {
            if (colorCounts[color] > maxCount) {
              maxCount = colorCounts[color];
              maxColor = color;
            }
          });
          
          const newDiscardPile = [...discardPile];
          newDiscardPile[newDiscardPile.length - 1] = { ...newDiscardPile[newDiscardPile.length - 1], color: maxColor };
          
          setDiscardPile(newDiscardPile);
          setCurrentCard({ ...currentCard, color: maxColor });
          setMessage(`${players[playerId].name} played Wild Draw Four and chose ${maxColor}! ${players[nextPlayerIndex].name} draws 4 cards.`);
          
          drawMultipleCards(nextPlayerIndex, 4);
          nextTurn(true); // Skip next player
        }
        break;
        
      default:
        nextTurn();
    }
  };

  // Choose a color for Wild cards
  const chooseCardColor = (color) => {
    const newDiscardPile = [...discardPile];
    newDiscardPile[newDiscardPile.length - 1] = { ...newDiscardPile[newDiscardPile.length - 1], color };
    
    setDiscardPile(newDiscardPile);
    setCurrentCard({ ...currentCard, color });
    setChooseColor(false);
    
    // If this was a Wild Draw Four
    if (discardPile[discardPile.length - 1].value === 'Wild Draw Four' && window.nextPlayerToDraw !== undefined) {
      const nextPlayerIndex = window.nextPlayerToDraw;
      setMessage(`You played Wild Draw Four and chose ${color}! ${players[nextPlayerIndex].name} draws 4 cards.`);
      
      drawMultipleCards(nextPlayerIndex, 4);
      nextTurn(true); // Skip next player
      
      // Clean up temporary variable
      delete window.nextPlayerToDraw;
    } else {
      setMessage(`You played Wild and chose ${color}!`);
      nextTurn();
    }
  };

  // Get the index of the next player
  const getNextPlayer = () => {
    return (currentPlayer + direction + players.length) % players.length;
  };

  // Move to the next player's turn
  const nextTurn = (skip = false) => {
    let nextPlayerIndex = currentPlayer;
    
    // Advance once or twice depending on skip parameter
    for (let i = 0; i < (skip ? 2 : 1); i++) {
      nextPlayerIndex = (nextPlayerIndex + direction + players.length) % players.length;
    }
    
    setCurrentPlayer(nextPlayerIndex);
    
    // Update message for next player
    if (!gameOver) {
      setMessage(`${players[nextPlayerIndex].name}'s turn`);
    }
    
    // If next player is computer, play after a short delay
    if (players[nextPlayerIndex].isComputer && !gameOver) {
      setTimeout(() => computerPlay(nextPlayerIndex), 1000);
    }
  };

  // Computer's turn logic
  const computerPlay = (playerId) => {
    if (gameOver) return;
    
    const cards = players[playerId].cards;
    
    // Find a playable card
    let playableCardIndex = -1;
    let wildCardIndex = -1;
    let wildDrawFourIndex = -1;
    
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      
      if (card.color === 'black') {
        if (card.value === 'Wild') {
          wildCardIndex = i;
        } else if (card.value === 'Wild Draw Four') {
          wildDrawFourIndex = i;
        }
      } else if (canPlayCard(card)) {
        playableCardIndex = i;
        break;
      }
    }
    
    // Play a card if possible, otherwise draw
    if (playableCardIndex !== -1) {
      playCard(playerId, playableCardIndex);
    } else if (wildCardIndex !== -1) {
      playCard(playerId, wildCardIndex);
    } else if (wildDrawFourIndex !== -1) {
      playCard(playerId, wildDrawFourIndex);
    } else {
      setMessage(`${players[playerId].name} draws a card`);
      drawCard(playerId);
      
      // Check if the drawn card can be played
      const drawnCard = players[playerId].cards[players[playerId].cards.length - 1];
      if (canPlayCard(drawnCard)) {
        setTimeout(() => {
          setMessage(`${players[playerId].name} plays the drawn card`);
          playCard(playerId, players[playerId].cards.length - 1);
        }, 1000);
      }
    }
    
    // Computer automatically says UNO
    if (players[playerId].cards.length === 1) {
      setMessage(`${players[playerId].name} says UNO!`);
      playSound(unoCallSound);
    }
  };

  // Handle UNO button press
  const handleUnoButtonPress = () => {
    setUnoButtonPressed(true);
    setShowUnoButton(false);
    setMessage(`${players[currentPlayer].name} says UNO!`);
    playSound(unoCallSound);
  };

  // Toggle sound
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  // Card component
  const Card = ({ card, index, playable, onClick }) => {
    if (!card) return null;
    
    // Determine card background color
    let bgColor = 'bg-gray-800';
    
    if (card.color === 'red') bgColor = 'bg-red-600';
    else if (card.color === 'blue') bgColor = 'bg-blue-600';
    else if (card.color === 'green') bgColor = 'bg-green-600';
    else if (card.color === 'yellow') bgColor = 'bg-yellow-500';
    
    return (
      <div 
        className={`relative w-16 h-24 rounded-lg m-1 ${bgColor} shadow-lg transform transition-transform ${playable ? 'hover:-translate-y-2 cursor-pointer' : ''} ${animation.active && animation.card?.id === card.id ? 'animate-pulse' : ''}`}
        onClick={onClick}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-16 bg-white rounded-lg flex items-center justify-center">
            {card.value === 'Skip' ? (
              <Ban className="text-black" size={20} />
            ) : card.value === 'Reverse' ? (
              <RotateCw className="text-black" size={20} />
            ) : card.value === 'Draw Two' ? (
              <Plus className="text-black" size={20} />
            ) : card.value === 'Wild' || card.value === 'Wild Draw Four' ? (
              <div className="grid grid-cols-2 gap-1">
                <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              </div>
            ) : (
              <span className={`text-xl font-bold text-${card.color === 'black' ? 'black' : card.color}`}>{card.value}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Color picker component for Wild cards
  const ColorPicker = () => (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg z-10">
      <div className="text-center mb-4 text-gray-800 font-bold">Choose a color</div>
      <div className="grid grid-cols-2 gap-4">
        <button
          className="w-16 h-16 bg-red-600 rounded-lg"
          onClick={() => chooseCardColor('red')}
        ></button>
        <button
          className="w-16 h-16 bg-blue-600 rounded-lg"
          onClick={() => chooseCardColor('blue')}
        ></button>
        <button
          className="w-16 h-16 bg-green-600 rounded-lg"
          onClick={() => chooseCardColor('green')}
        ></button>
        <button
          className="w-16 h-16 bg-yellow-500 rounded-lg"
          onClick={() => chooseCardColor('yellow')}
        ></button>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 text-white flex flex-col items-center justify-between p-4">
      {/* Top section - Opponent's cards */}
      <div className="w-full flex flex-col items-center mb-8">
        <div className="mb-2 text-lg font-bold">
          {players[1].name} ({players[1].cards.length} cards)
        </div>
        <div className="flex flex-wrap justify-center">
          {players[1].cards.map((_, index) => (
            <div 
              key={index}
              className="w-12 h-18 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg m-1 shadow-lg"
            ></div>
          ))}
        </div>
      </div>
      
      {/* Middle section - Game info, discard pile, and deck */}
      <div className="flex flex-col items-center mb-8">
        <div className="text-xl font-bold mb-4">{message}</div>
        
        <div className="flex items-center justify-center mb-4">
          {/* Discard pile */}
          <div className="mx-4">
            {currentCard && (
              <Card card={currentCard} />
            )}
          </div>
          
          {/* Deck */}
          <div 
            className="w-16 h-24 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg shadow-lg cursor-pointer mx-4"
            onClick={() => currentPlayer === 0 && drawCard(0)}
          >
            <div className="h-full flex items-center justify-center">
              <span className="font-bold text-white">UNO</span>
            </div>
          </div>
        </div>
        
        {/* Game controls */}
        <div className="flex items-center space-x-4">
          {!gameStarted ? (
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
              onClick={startGame}
            >
              Start Game
            </button>
          ) : gameOver ? (
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
              onClick={startGame}
            >
              New Game
            </button>
          ) : (
            <>
              {showUnoButton && currentPlayer === 0 && (
                <button
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full animate-pulse"
                  onClick={handleUnoButtonPress}
                >
                  UNO!
                </button>
              )}
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-full"
                onClick={toggleSound}
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold p-2 rounded-full"
                onClick={() => startGame()}
              >
                <RefreshCw size={20} />
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Bottom section - Player's cards */}
      <div className="w-full flex flex-col items-center">
        <div className="mb-2 text-lg font-bold">
          {players[0].name} ({players[0].cards.length} cards)
        </div>
        <div className="flex flex-wrap justify-center">
          {players[0].cards.map((card, index) => (
            <Card 
              key={card.id} 
              card={card} 
              index={index}
              playable={currentPlayer === 0 && !chooseColor && canPlayCard(card)}
              onClick={() => currentPlayer === 0 && !chooseColor && playCard(0, index)}
            />
          ))}
        </div>
      </div>
      
      {/* Color picker */}
      {chooseColor && <ColorPicker />}
      
      {/* Winner message */}
      {gameOver && winner && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
          <div className="bg-white text-black p-8 rounded-lg text-center">
            <h2 className="text-3xl font-bold mb-4">{winner.name} Wins!</h2>
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full"
              onClick={startGame}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnoGame;