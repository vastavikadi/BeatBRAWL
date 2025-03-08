export type SongCard = {
    id: string;
    genre: string;
    artist: string;
    name: string;
    playtime: number;
    year: number;
  };
  
  export const SONG_CARDS: SongCard[] = [
    {
      id: "1",
      genre: "Pop",
      artist: "Olivia Rodrigo",
      name: "drivers license",
      playtime: 4,
      year: 2021,
    },
    {
      id: "2",
      genre: "Hip-Hop",
      artist: "Lil Nas X & Jack Harlow",
      name: "INDUSTRY BABY",
      playtime: 4,
      year: 2021,
    },
    {
      id: "3",
      genre: "R&B",
      artist: "SZA",
      name: "Kill Bill",
      playtime: 4,
      year: 2022,
    },
    {
      id: "4",
      genre: "Electronic",
      artist: "Fred again..",
      name: "Delilah (pull me out of this)",
      playtime: 4,
      year: 2022,
    },
    {
      id: "5",
      genre: "Latin",
      artist: "Bad Bunny",
      name: "Tití Me Preguntó",
      playtime: 4,
      year: 2022,
    },
  ];