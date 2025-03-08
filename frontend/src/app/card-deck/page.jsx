"use client";
import React from "react";
import DeckBuilder from "../components/DeckBuilder";
import { useRouter } from "next/navigation";

export default function CardDeckPage() {
  const router = useRouter();

  const handleStartGame = (deckId) => {
    // Navigate to the game page with the selected deck
    router.push(`/game?deckId=${deckId}`);
  };

  const handleClose = () => {
    // Navigate back to home or another page
    router.push('/');
  };

  return (
    <DeckBuilder 
      onStartGame={handleStartGame} 
      onClose={handleClose} 
    />
  );
}
