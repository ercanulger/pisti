import { Card, Rank, Suit } from "./types";

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

export const createDeck = (): Card[] =>
  SUITS.flatMap((suit) =>
    RANKS.map((rank) => ({
      id: `${rank}-${suit}`,
      suit,
      rank,
    })),
  );

export const shuffleDeck = (input: Card[]): Card[] => {
  const deck = [...input];

  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

export const cardPointValue = (card: Card): number => {
  if (card.rank === "A") return 1;
  if (card.rank === "J") return 1;
  if (card.rank === "2" && card.suit === "♣") return 2;
  if (card.rank === "10" && card.suit === "♦") return 3;
  return 0;
};
