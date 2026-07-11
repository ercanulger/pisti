/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card, Suit, Player, BotLevel } from '../types';

// Generate a shuffled standard deck of 52 cards
export function generateDeck(): Card[] {
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (let value = 1; value <= 13; value++) {
      let code = '';
      if (suit === 'spades') code = 'S';
      else if (suit === 'hearts') code = 'H';
      else if (suit === 'diamonds') code = 'D';
      else if (suit === 'clubs') code = 'C';

      code += value;

      deck.push({
        id: `${suit}_${value}`,
        suit,
        value,
        code,
      });
    }
  }

  // Shuffle (Fisher-Yates)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

// Calculate the score of captured cards for a player/team
export interface ScoreResult {
  totalScore: number;
  pistiCount: number;
  jackPistiCount: number;
  cardCount: number;
  details: {
    pistiPoints: number;
    mostCardsPoints: number;
    specialPoints: number;
  };
}

export function calculateScore(captured: Card[], pistisCount: number, jackPistisCount: number, hasMostCards: boolean): ScoreResult {
  let specialPoints = 0;

  for (const card of captured) {
    // Aces are 1 point
    if (card.value === 1) {
      specialPoints += 1;
    }
    // Jacks are 1 point
    if (card.value === 11) {
      specialPoints += 1;
    }
    // 2 of Clubs is 2 points
    if (card.value === 2 && card.suit === 'clubs') {
      specialPoints += 2;
    }
    // 10 of Diamonds is 3 points
    if (card.value === 10 && card.suit === 'diamonds') {
      specialPoints += 3;
    }
  }

  const pistiPoints = (pistisCount * 10) + (jackPistisCount * 20);
  const mostCardsPoints = hasMostCards ? 3 : 0;
  const totalScore = specialPoints + pistiPoints + mostCardsPoints;

  return {
    totalScore,
    pistiCount: pistisCount,
    jackPistiCount: jackPistisCount,
    cardCount: captured.length,
    details: {
      pistiPoints,
      mostCardsPoints,
      specialPoints,
    },
  };
}

// Select 3 random bot players based on criteria: "en az 2 tane kolay (beginner) olsun her elde"
export function selectOpponents(): Player[] {
  const allBots: Player[] = [
    {
      id: 'bot_kemal',
      username: 'Acemi Kemal',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=kemal',
      elo: 980,
      coins: 200,
      isBot: true,
      botLevel: 'beginner',
    },
    {
      id: 'bot_ayse',
      username: 'Stajyer Ayşe',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ayse',
      elo: 1040,
      coins: 150,
      isBot: true,
      botLevel: 'beginner',
    },
    {
      id: 'bot_can',
      username: 'Çaylak Can',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=can',
      elo: 950,
      coins: 100,
      isBot: true,
      botLevel: 'beginner',
    },
    {
      id: 'bot_selim',
      username: 'Dengeli Selim',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=selim',
      elo: 1220,
      coins: 450,
      isBot: true,
      botLevel: 'intermediate',
    },
    {
      id: 'bot_derya',
      username: 'Analitik Derya',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=derya',
      elo: 1280,
      coins: 600,
      isBot: true,
      botLevel: 'intermediate',
    },
    {
      id: 'bot_leyla',
      username: 'Usta Leyla',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=leyla',
      elo: 1490,
      coins: 1200,
      isBot: true,
      botLevel: 'expert',
    },
    {
      id: 'bot_pisti_robot',
      username: 'PİŞTİ-Tron 9000',
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=pistitron',
      elo: 1650,
      coins: 2500,
      isBot: true,
      botLevel: 'expert',
    },
  ];

  // Filter beginner bots and advanced bots
  const beginners = allBots.filter((b) => b.botLevel === 'beginner');
  const others = allBots.filter((b) => b.botLevel !== 'beginner');

  // We need 3 bots. At least 2 must be easy (beginner).
  // Strategy: Pick 2 beginners, and 1 from the remaining pool (could be beginner or other, totally randomized)
  const selectedBots: Player[] = [];

  // Shuffle beginners
  const shuffledBeginners = [...beginners].sort(() => Math.random() - 0.5);
  selectedBots.push(shuffledBeginners[0]);
  selectedBots.push(shuffledBeginners[1]);

  // Combined pool for the 3rd bot: remaining beginners + all others
  const remainingPool = [...shuffledBeginners.slice(2), ...others].sort(() => Math.random() - 0.5);
  selectedBots.push(remainingPool[0]);

  // Return exactly 3 shuffled bots
  return selectedBots.sort(() => Math.random() - 0.5);
}

// Bot AI card selection decision engine
export function makeBotMove(
  hand: Card[],
  boardPile: Card[],
  botLevel: BotLevel,
  playedCardsHistory: Card[]
): Card {
  if (hand.length === 0) {
    throw new Error('Bot hand is empty, cannot make move!');
  }

  // 1. If only 1 card in hand, must play it
  if (hand.length === 1) {
    return hand[0];
  }

  const topCard = boardPile.length > 0 ? boardPile[boardPile.length - 1] : null;

  // 2. Acemi (Beginner) Bot Logic
  if (botLevel === 'beginner') {
    // Beginner plays random card mostly. If they have a matching card, they have a 30% chance to play it.
    if (topCard) {
      const matchingCards = hand.filter((c) => c.value === topCard.value || c.value === 11);
      if (matchingCards.length > 0 && Math.random() < 0.3) {
        return matchingCards[Math.floor(Math.random() * matchingCards.length)];
      }
    }
    // Otherwise play random card, but avoid throwing Jacks if possible (unless it's the only option or they just throw randomly)
    const nonJacks = hand.filter((c) => c.value !== 11);
    if (nonJacks.length > 0 && Math.random() < 0.8) {
      return nonJacks[Math.floor(Math.random() * nonJacks.length)];
    }
    return hand[Math.floor(Math.random() * hand.length)];
  }

  // 3. Dengeli (Intermediate) Bot Logic
  if (botLevel === 'intermediate') {
    if (topCard) {
      // Always capture if they have a direct value match
      const matchingValue = hand.find((c) => c.value === topCard.value);
      if (matchingValue) return matchingValue;

      // If they have a Jack and the pile is juicy (e.g., has some point cards or has >= 2 cards), capture with Jack
      const hasJack = hand.find((c) => c.value === 11);
      const isJuicyPile = boardPile.length >= 2 || boardPile.some(c => c.value === 1 || c.value === 10 || (c.value === 2 && c.suit === 'clubs'));
      if (hasJack && isJuicyPile) return hasJack;
    }

    // No matching or capturing card played: play a card that is not a Jack, and prefer the lowest value card or cards that don't have high points
    const nonJacks = hand.filter((c) => c.value !== 11);
    if (nonJacks.length > 0) {
      // Find cards with 0 points (not Ace, 10 of Diamonds, 2 of Clubs)
      const zeroPointsCards = nonJacks.filter(
        (c) => c.value !== 1 && !(c.value === 10 && c.suit === 'diamonds') && !(c.value === 2 && c.suit === 'clubs')
      );
      if (zeroPointsCards.length > 0) {
        return zeroPointsCards[Math.floor(Math.random() * zeroPointsCards.length)];
      }
      return nonJacks[Math.floor(Math.random() * nonJacks.length)];
    }

    return hand[Math.floor(Math.random() * hand.length)];
  }

  // 4. Usta (Expert) Bot Logic
  // Expert tracks history, saves Jacks, tries to avoid being Pişti'd
  if (botLevel === 'expert') {
    if (topCard) {
      // Direct value match is highest priority
      const matchingValue = hand.find((c) => c.value === topCard.value);
      if (matchingValue) return matchingValue;

      // Use Jack to capture if pile has points or pile size >= 3
      const hasJack = hand.find((c) => c.value === 11);
      const pilePoints = boardPile.reduce((acc, c) => {
        if (c.value === 1 || c.value === 11) return acc + 1;
        if (c.value === 2 && c.suit === 'clubs') return acc + 2;
        if (c.value === 10 && c.suit === 'diamonds') return acc + 3;
        return acc;
      }, 0);

      if (hasJack && (pilePoints >= 2 || boardPile.length >= 3)) {
        return hasJack;
      }
    }

    // No immediate capture. Choose a card to throw safely.
    // Safe card strategy:
    // - Never throw a Jack (11) unless it's the last card in hand
    // - Prefer throwing card values that have been played a lot (e.g. 3 cards of that value already played, so opponent cannot match/pişti)
    // - Avoid throwing values where opponent can easily capture and get a Pişti
    const nonJacks = hand.filter((c) => c.value !== 11);
    if (nonJacks.length > 0) {
      // Count frequency of played cards to find safest card
      const frequencyMap: { [val: number]: number } = {};
      playedCardsHistory.forEach((c) => {
        frequencyMap[c.value] = (frequencyMap[c.value] || 0) + 1;
      });

      // Sort hand by safety (higher frequency played = safer because fewer remaining in deck)
      const sortedBySafety = [...nonJacks].sort((a, b) => {
        const freqA = frequencyMap[a.value] || 0;
        const freqB = frequencyMap[b.value] || 0;
        return freqB - freqA; // descending safety
      });

      // Avoid playing high scoring cards (Ace, Diamond 10, Club 2) if pile is empty and opponent might match
      if (boardPile.length === 0) {
        const saferEmptyBoardCards = sortedBySafety.filter(
          (c) => c.value !== 1 && !(c.value === 10 && c.suit === 'diamonds') && !(c.value === 2 && c.suit === 'clubs')
        );
        if (saferEmptyBoardCards.length > 0) {
          return saferEmptyBoardCards[0];
        }
      }

      return sortedBySafety[0];
    }

    return hand[Math.floor(Math.random() * hand.length)];
  }

  // Fallback
  return hand[Math.floor(Math.random() * hand.length)];
}
