/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export interface Card {
  id: string;
  suit: Suit;
  value: number; // 1 = Ace, 11 = Jack (Vale), 12 = Queen (Kız), 13 = King (Papaz)
  code: string; // e.g. "S1", "H11"
  playedBy?: string; // Player ID who played the card
}

export type BotLevel = 'beginner' | 'intermediate' | 'expert';

export type TabType = 'home' | 'leaderboard' | 'shop' | 'quests' | 'profile';

export interface Player {
  id: string;
  username: string;
  avatarUrl: string;
  elo: number;
  coins: number;
  isBot: boolean;
  botLevel?: BotLevel;
  selectedFrame?: string; // Shop Item ID
  selectedFont?: string; // Shop Item ID
  selectedColor?: string; // Shop Item ID
  selectedBadge?: string; // Shop Item ID
}

export interface GameLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

export interface MatchHistory {
  id: string;
  date: string;
  players: { username: string; score: number; eloChange: number; isPlayer: boolean }[];
  winnerId: string;
  pointsCollected: number;
  coinsEarned: number;
  eloEarned: number;
}

// Database normalization tables matching User constraints
export interface UserRole {
  id: string;
  userId: string;
  role: 'admin' | 'player';
}

export interface UserInventory {
  id: string;
  userId: string;
  itemType: 'frame' | 'font' | 'color' | 'badge';
  itemId: string;
  purchasedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  claimed: boolean;
}

export interface LiveFeedItem {
  id: string;
  message: string;
  time: string;
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'frame' | 'font' | 'color' | 'badge';
  price: number;
  value: string; // CSS style or custom parameter
  description: string;
  isAnimated?: boolean;
  rgbEffect?: string; // style string or preset
  badgeText?: string;
}
