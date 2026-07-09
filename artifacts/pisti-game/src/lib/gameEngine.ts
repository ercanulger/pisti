export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string; // e.g. hearts-A
}

export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  hand: Card[];
  captured: Card[];
  pistis: number;
  score: number;
  avatarUrl?: string;
  color?: string;
}

export interface GameState {
  deck: Card[];
  tablePile: Card[];
  players: Player[];
  currentPlayerIndex: number;
  lastCapturerIndex: number | null;
  status: 'idle' | 'playing' | 'finished';
  round: number; // For dealing tracking
}

export interface ScoreResult {
  winnerIndex: number | null; // null if draw
  players: {
    id: string;
    name: string;
    score: number;
    pistis: number;
    capturedCount: number;
  }[];
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, id: `${suit}-${rank}` });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

export function isGameOver(state: GameState): boolean {
  if (state.deck.length > 0) return false;
  return state.players.every(p => p.hand.length === 0);
}

export function dealCards(state: GameState): GameState {
  const newState = { ...state, deck: [...state.deck], players: state.players.map(p => ({ ...p, hand: [...p.hand] })) };
  
  // Initial deal: 4 to table, 4 to each player
  if (newState.tablePile.length === 0 && newState.players.every(p => p.hand.length === 0) && newState.deck.length === 52) {
    // Deal to table until we don't have a Jack as the top card (if possible, though standard rules just say J can't be first)
    // Actually, rules: 4 cards to table. If last is J, swap with next.
    let tableCards = newState.deck.splice(0, 4);
    while (tableCards[3].rank === 'J' && newState.deck.length > 0) {
      const j = tableCards.pop()!;
      tableCards.unshift(j); // put it at bottom of table pile, draw new top
      tableCards.push(newState.deck.splice(0, 1)[0]);
    }
    newState.tablePile = tableCards;
    
    // Deal 4 to each player
    for (const player of newState.players) {
      player.hand = newState.deck.splice(0, 4);
    }
  } else if (newState.deck.length > 0) {
    // Deal 4 more to each player
    for (const player of newState.players) {
      player.hand = newState.deck.splice(0, 4);
    }
  }
  
  return newState;
}

export function playCard(state: GameState, playerIndex: number, cardIndex: number): { newState: GameState, isPisti: boolean, captured: Card[] } {
  const newState = {
    ...state,
    tablePile: [...state.tablePile],
    players: state.players.map(p => ({ ...p, hand: [...p.hand], captured: [...p.captured] }))
  };
  
  const player = newState.players[playerIndex];
  const card = player.hand.splice(cardIndex, 1)[0];
  
  let isPisti = false;
  let capturedCards: Card[] = [];
  
  if (newState.tablePile.length > 0) {
    const topCard = newState.tablePile[newState.tablePile.length - 1];
    
    // Check match or Jack
    if (card.rank === topCard.rank || card.rank === 'J') {
      // Capture
      capturedCards = [...newState.tablePile, card];
      
      // Check Pisti
      if (newState.tablePile.length === 1 && card.rank === topCard.rank && card.rank !== 'J') {
        isPisti = true;
        player.pistis += 1;
      }
      
      player.captured.push(...capturedCards);
      newState.tablePile = [];
      newState.lastCapturerIndex = playerIndex;
    } else {
      // No capture
      newState.tablePile.push(card);
    }
  } else {
    // Empty table
    newState.tablePile.push(card);
  }
  
  // Next turn
  newState.currentPlayerIndex = (playerIndex + 1) % newState.players.length;
  
  return { newState, isPisti, captured: capturedCards };
}

export function calculateScores(state: GameState): ScoreResult {
  // Give remaining table cards to last capturer
  const players = state.players.map(p => ({
    id: p.id,
    name: p.name,
    score: 0,
    pistis: p.pistis,
    capturedCount: p.captured.length,
    captured: [...p.captured]
  }));
  
  if (state.tablePile.length > 0 && state.lastCapturerIndex !== null) {
    players[state.lastCapturerIndex].captured.push(...state.tablePile);
    players[state.lastCapturerIndex].capturedCount += state.tablePile.length;
  }
  
  // Calculate points
  let maxCapturedCount = -1;
  let maxCapturedPlayers: number[] = [];
  
  players.forEach((p, idx) => {
    // Count max cards
    if (p.capturedCount > maxCapturedCount) {
      maxCapturedCount = p.capturedCount;
      maxCapturedPlayers = [idx];
    } else if (p.capturedCount === maxCapturedCount) {
      maxCapturedPlayers.push(idx);
    }
    
    // Base points
    p.score += p.pistis * 10;
    
    for (const card of p.captured) {
      if (card.rank === 'A') p.score += 1;
      else if (card.rank === 'J') p.score += 1;
      else if (card.suit === 'clubs' && card.rank === '2') p.score += 2;
      else if (card.suit === 'diamonds' && card.rank === '10') p.score += 3; // Karo 10 = 3 puan (doğru kural)
    }
  });
  
  // Award 3 points for most cards (only if one player has strict majority)
  if (maxCapturedPlayers.length === 1) {
    players[maxCapturedPlayers[0]].score += 3;
  }
  
  // Find winner
  let maxScore = -1;
  let winners: number[] = [];
  
  players.forEach((p, idx) => {
    if (p.score > maxScore) {
      maxScore = p.score;
      winners = [idx];
    } else if (p.score === maxScore) {
      winners.push(idx);
    }
  });
  
  return {
    winnerIndex: winners.length === 1 ? winners[0] : null, // null if draw
    players: players.map(p => ({
      id: p.id,
      name: p.name,
      score: p.score,
      pistis: p.pistis,
      capturedCount: p.capturedCount
    }))
  };
}

export function chooseBotCard(botPlayer: Player, state: GameState, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): number {
  if (botPlayer.hand.length === 1) return 0;
  
  const hand = botPlayer.hand;
  const topCard = state.tablePile.length > 0 ? state.tablePile[state.tablePile.length - 1] : null;
  
  // Always check for direct match (best move)
  if (topCard) {
    const matchIndex = hand.findIndex(c => c.rank === topCard.rank);
    if (matchIndex !== -1) return matchIndex;
  }
  
  // Use Jack if there are cards to capture
  const jackIndex = hand.findIndex(c => c.rank === 'J');
  if (jackIndex !== -1 && state.tablePile.length > 0) {
    // In easy, just play it randomly. In medium/hard, only play if table is "worth it"
    if (difficulty === 'easy') return jackIndex;
    
    let tablePoints = 0;
    state.tablePile.forEach(c => {
      if (c.rank === 'A' || c.rank === 'J') tablePoints += 1;
      if (c.suit === 'clubs' && c.rank === '2') tablePoints += 2;
      if (c.suit === 'diamonds' && c.rank === '10') tablePoints += 3; // Karo 10 bot AI için doğru değerlendirme
    });
    
    // Play J if there are points, or if table is getting big
    if (tablePoints > 0 || state.tablePile.length >= 3 || (difficulty === 'hard' && state.deck.length < 10)) {
      return jackIndex;
    }
  }
  
  // Play a safe card (not a J if possible)
  const nonJacks = hand.map((c, i) => ({ card: c, index: i })).filter(item => item.card.rank !== 'J');
  if (nonJacks.length > 0) {
    // Pick randomly among safe cards
    return nonJacks[Math.floor(Math.random() * nonJacks.length)].index;
  }
  
  // Fallback to random
  return Math.floor(Math.random() * hand.length);
}

export const BOT_NAMES = [
  "Ahmet K.", "Mehmet Y.", "Fatma S.", "Ayşe D.", "Ali R.", "Zeynep K.", 
  "Mustafa B.", "Hatice T.", "İbrahim Ç.", "Emine A.", "Hasan K.", "Meryem Y.", 
  "Ömer F.", "Büşra N.", "Yusuf T.", "Elif M.", "Emre S.", "Selin Y.", 
  "Burak A.", "Gizem K.", "Tolga D.", "Merve R.", "Serkan T.", "Pınar B.", 
  "Volkan A.", "KartUstası", "PiştiKral", "AsBey", "DamlaTaşı", "KoziKuralı", 
  "TuzKurusu", "PapazYok"
];

export function getRandomBotName() {
  return BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#d946ef', '#f43f5e'];

export function getDeterministicColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}
