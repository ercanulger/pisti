import { Card, BotLevel } from "./types";

const rankWeight = (rank: string) => {
  if (rank === "J") return 100;
  if (rank === "A") return 40;
  if (rank === "10") return 35;
  if (rank === "2") return 30;
  return Number(rank) || 10;
};

export const pickBotCard = (
  hand: Card[],
  tableTop: Card | null,
  tableCount: number,
  level: BotLevel,
): Card => {
  if (hand.length === 1) return hand[0];

  const capturing = hand.filter(
    (card) => card.rank === "J" || (tableTop ? card.rank === tableTop.rank : false),
  );

  if (level === "easy") {
    return hand[Math.floor(Math.random() * hand.length)];
  }

  if (level === "medium") {
    if (capturing.length > 0) {
      return capturing.sort((a, b) => rankWeight(a.rank) - rankWeight(b.rank))[0];
    }

    return hand.sort((a, b) => rankWeight(a.rank) - rankWeight(b.rank))[0];
  }

  const pistiCard = capturing.find(
    (card) => tableCount === 1 && tableTop && card.rank === tableTop.rank && card.rank !== "J",
  );

  if (pistiCard) return pistiCard;

  if (capturing.length > 0) {
    return capturing.sort((a, b) => rankWeight(a.rank) - rankWeight(b.rank))[0];
  }

  const safeCards = hand.filter((card) => card.rank !== "J");

  if (safeCards.length > 0) {
    return safeCards.sort((a, b) => rankWeight(a.rank) - rankWeight(b.rank))[0];
  }

  return hand[0];
};
