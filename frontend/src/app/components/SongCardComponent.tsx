import React, { useState, useEffect } from "react";
import { SongCard } from "../../constants";
import "./SongCard.css";

interface Props {
  song: SongCard;
  onClick?: (attribute: string, value: string | number) => void;
}

const SongCardComponent: React.FC<Props> = ({ song, onClick }) => {
  // Use useEffect for client-side state initialization to avoid hydration errors
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClick = (attribute: string, value: string | number) => {
    if (onClick) {
      setSelectedProperty(attribute);
      onClick(attribute, value);
    }
  };

  // Only apply selected class on client-side to avoid hydration mismatch
  const cardClassName = `song-card`;

  return (
    <div className={cardClassName}>
      <div className="corner-icon top-left">🎵</div>
      <div className="corner-icon bottom-right">🎵</div>
      <h3 
        className={`song-title ${isMounted && selectedProperty === "name" ? "attribute-selected" : ""}`} 
        onClick={() => handleClick("name", song.name)}
      >
        {song.name}
      </h3>
      <p 
        className={`song-artist ${isMounted && selectedProperty === "artist" ? "attribute-selected" : ""}`} 
        onClick={() => handleClick("artist", song.artist)}
      >
        {song.artist} ({song.year})
      </p>
      <p 
        className={`song-genre ${isMounted && selectedProperty === "genre" ? "attribute-selected" : ""}`} 
        onClick={() => handleClick("genre", song.genre)}
      >
        Genre: {song.genre}
      </p>
      <p 
        className={`song-playtime ${isMounted && selectedProperty === "playtime" ? "attribute-selected" : ""}`} 
        onClick={() => handleClick("playtime", song.playtime)}
      >
        Playtime: {song.playtime} sec
      </p>
      <p 
        className={`song-year ${isMounted && selectedProperty === "year" ? "attribute-selected" : ""}`} 
        onClick={() => handleClick("year", song.year)}
      >
        Year: {song.year}
      </p>
    </div>
  );
};

export default SongCardComponent;