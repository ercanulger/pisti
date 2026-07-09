import { pickBotCard } from "./bot";
import { cardPointValue, createDeck, shuffleDeck } from "./deck";
import { BotLevel, Card, CaptureStats, GameEvent, MatchResult, Player } from "./types";

const HAND_SIZE = 4;
const PLAYER_COUNT = 4;

const createPlayers = (username: string): Player[] => {
  const levels: BotLevel[] = ["easy", "easy", Math.random() > 0.5 ? "medium" : "master"];

  return [
    { id: "player", name: username, isHuman: true },
    ...levels.map((level, index) => ({
      id: `bot-${index + 1}`,
      name: `Bot ${index + 1} (${level})`,
      isHuman: false,
      level,
    })),
  ];
};

export class GameEngine {
  readonly players: Player[];
  readonly events: GameEvent[] = [];
  private readonly hands = new Map<string, Card[]>();
  private readonly captures = new Map<string, CaptureStats>();

  private deck: Card[] = [];
  private table: Card[] = [];
  private turn = 0;
  private lastCapturer: string | null = null;
  private finished = false;

  constructor(username: string) {
    this.players = createPlayers(username);
    this.players.forEach((player) => {
      this.hands.set(player.id, []);
      this.captures.set(player.id, { cards: [], pistiCount: 0, captureCount: 0 });
    });

    this.start();
  }

  private start() {
    this.deck = shuffleDeck(createDeck());
    this.table = this.deck.splice(0, HAND_SIZE);
    this.dealHands();
    this.pushEvent("Oyun başladı.");
  }

  private dealHands() {
    this.players.forEach((player) => {
      const current = this.hands.get(player.id) ?? [];
      if (this.deck.length === 0 || current.length > 0) return;
      this.hands.set(player.id, this.deck.splice(0, HAND_SIZE));
    });
  }

  private pushEvent(text: string) {
    this.events.unshift({
      id: crypto.randomUUID(),
      text,
      createdAt: Date.now(),
    });
  }

  getState() {
    return {
      players: this.players,
      table: [...this.table],
      turn: this.turn,
      finished: this.finished,
      hands: new Map(this.hands),
      captures: new Map(this.captures),
      events: [...this.events],
      deckCount: this.deck.length,
    };
  }

  playHuman(cardId: string) {
    const player = this.players[this.turn];

    if (!player.isHuman || this.finished) {
      throw new Error("Hamle sırası sizde değil.");
    }

    const hand = this.hands.get(player.id) ?? [];
    const card = hand.find((item) => item.id === cardId);

    if (!card) {
      throw new Error("Geçersiz kart seçimi.");
    }

    this.resolveMove(player.id, card);
    this.runBotsUntilHuman();
  }

  private runBotsUntilHuman() {
    while (!this.finished) {
      const current = this.players[this.turn];
      if (current.isHuman) break;

      const hand = this.hands.get(current.id) ?? [];
      const selected = pickBotCard(
        hand,
        this.table.at(-1) ?? null,
        this.table.length,
        current.level ?? "easy",
      );

      this.resolveMove(current.id, selected);
    }
  }

  private resolveMove(playerId: string, card: Card) {
    const hand = this.hands.get(playerId) ?? [];
    this.hands.set(
      playerId,
      hand.filter((item) => item.id !== card.id),
    );

    const top = this.table.at(-1);
    const takesPile = top && (card.rank === "J" || card.rank === top.rank);

    if (takesPile) {
      const pile = [...this.table, card];
      const capture = this.captures.get(playerId);

      if (!capture) return;

      const isPisti = this.table.length === 1 && card.rank !== "J";
      this.captures.set(playerId, {
        cards: [...capture.cards, ...pile],
        pistiCount: capture.pistiCount + (isPisti ? 1 : 0),
        captureCount: capture.captureCount + 1,
      });

      this.lastCapturer = playerId;
      this.table = [];
      this.pushEvent(`${this.playerName(playerId)} eli topladı${isPisti ? " ve PİŞTİ yaptı" : ""}.`);
    } else {
      this.table.push(card);
      this.pushEvent(`${this.playerName(playerId)} ${card.rank}${card.suit} attı.`);
    }

    this.turn = (this.turn + 1) % PLAYER_COUNT;

    if (this.players.every((player) => (this.hands.get(player.id) ?? []).length === 0)) {
      if (this.deck.length > 0) {
        this.dealHands();
      }
    }

    if (this.deck.length === 0 && this.players.every((player) => (this.hands.get(player.id) ?? []).length === 0)) {
      this.finishMatch();
    }
  }

  private finishMatch() {
    if (this.lastCapturer && this.table.length > 0) {
      const capture = this.captures.get(this.lastCapturer);
      if (capture) {
        capture.cards.push(...this.table);
        this.captures.set(this.lastCapturer, capture);
      }
      this.table = [];
    }

    this.finished = true;
    this.pushEvent("Maç tamamlandı.");
  }

  private playerName(id: string) {
    return this.players.find((player) => player.id === id)?.name ?? "Oyuncu";
  }

  getMatchResult(): MatchResult {
    const scores = this.players.map((player) => {
      const stats = this.captures.get(player.id)!;
      return {
        playerId: player.id,
        pistiCount: stats.pistiCount,
        cardsCount: stats.cards.length,
        score:
          stats.cards.reduce((acc, card) => acc + cardPointValue(card), 0) +
          stats.pistiCount * 10,
      };
    });

    const maxCards = Math.max(...scores.map((item) => item.cardsCount));
    const withCardBonus = scores.map((item) => ({
      ...item,
      score: item.score + (item.cardsCount === maxCards ? 3 : 0),
    }));

    const winner = [...withCardBonus].sort((a, b) => b.score - a.score)[0];

    return {
      winnerId: winner.playerId,
      scoreboard: withCardBonus
        .sort((a, b) => b.score - a.score)
        .map((item, index) => ({
          playerId: item.playerId,
          score: item.score,
          pistiCount: item.pistiCount,
          trophiesDelta: item.playerId === winner.playerId ? 20 : Math.max(-12, -4 - index * 2),
          coinsDelta: item.playerId === winner.playerId ? 120 : 25,
        })),
    };
  }
}
