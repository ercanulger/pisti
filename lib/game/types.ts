export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export type Card = {
  id: string;
  suit: Suit;
  rank: Rank;
};

export type BotLevel = "easy" | "medium" | "master";

export type Player = {
  id: string;
  name: string;
  isHuman: boolean;
  level?: BotLevel;
};

export type CaptureStats = {
  cards: Card[];
  pistiCount: number;
  captureCount: number;
};

export type GameEvent = {
  id: string;
  text: string;
  createdAt: number;
};

export type MatchResult = {
  winnerId: string;
  scoreboard: {
    playerId: string;
    score: number;
    pistiCount: number;
    trophiesDelta: number;
    coinsDelta: number;
  }[];
};
