import { MatchResult } from "@/lib/game/types";

export type UserProfile = {
  id: string;
  username: string;
  email: string;
  avatar: string;
  trophies: number;
  coins: number;
  isAdmin: boolean;
  badges: string[];
};

export type InventoryItem = {
  id: string;
  type: "frame" | "font" | "color" | "badge";
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  animated?: boolean;
  basePrice: number;
};

export type AuditLogEntry = {
  id: string;
  type: "coin_transfer" | "password_reset";
  admin: string;
  target: string;
  amount?: number;
  createdAt: number;
};

const INVENTORY_KEY = "pisti.inventory";
const PROFILE_KEY = "pisti.profile";
const FEED_KEY = "pisti.feed";
const LEADERBOARD_KEY = "pisti.leaderboard";
const AUDIT_KEY = "pisti.audit";

const defaultProfile: UserProfile = {
  id: "local-user",
  username: "ercanulger",
  email: "player@pisti.game",
  avatar: "🃏",
  trophies: 1200,
  coins: 500,
  isAdmin: true,
  badges: ["Kurucu", "Admin"],
};

export const STORE_ITEMS: InventoryItem[] = Array.from({ length: 15 }).map((_, index) => ({
  id: `frame-${index + 1}`,
  type: "frame",
  name: `RGB Çerçeve #${index + 1}`,
  rarity:
    index < 6 ? "common" : index < 10 ? "rare" : index < 13 ? "epic" : "legendary",
  animated: true,
  basePrice: 150 + index * 85,
}));

const jsonParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const browser = () => typeof window !== "undefined";

export const getProfile = (): UserProfile => {
  if (!browser()) return defaultProfile;
  const stored = jsonParse<UserProfile | null>(localStorage.getItem(PROFILE_KEY), null);
  if (stored) return stored;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfile));
  return defaultProfile;
};

export const saveProfile = (profile: UserProfile) => {
  if (!browser()) return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
};

export const getLeaderboard = () =>
  browser()
    ? jsonParse<UserProfile[]>(localStorage.getItem(LEADERBOARD_KEY), [defaultProfile])
    : [defaultProfile];

export const saveLeaderboard = (players: UserProfile[]) => {
  if (!browser()) return;
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(players));
};

export const addMatchResult = (result: MatchResult, usernames: Record<string, string>) => {
  const profile = getProfile();
  const leaderboard = getLeaderboard();

  const updated = result.scoreboard.map((item) => {
    const username = usernames[item.playerId] ?? item.playerId;
    const existing = leaderboard.find((p) => p.username === username);

    if (existing) {
      return {
        ...existing,
        trophies: existing.trophies + item.trophiesDelta,
        coins: existing.coins + item.coinsDelta,
      };
    }

    return {
      ...defaultProfile,
      id: username,
      username,
      isAdmin: username === "ercanulger",
      badges: username === "ercanulger" ? ["Kurucu", "Admin"] : ["Oyuncu"],
      trophies: 1000 + item.trophiesDelta,
      coins: 100 + item.coinsDelta,
    };
  });

  const merged = [...leaderboard.filter((p) => !updated.some((u) => u.username === p.username)), ...updated]
    .sort((a, b) => b.trophies - a.trophies)
    .slice(0, 50);

  const playerRow = result.scoreboard.find((row) => row.playerId === "player");
  if (playerRow) {
    const nextProfile = {
      ...profile,
      trophies: profile.trophies + playerRow.trophiesDelta,
      coins: profile.coins + playerRow.coinsDelta,
    };
    saveProfile(nextProfile);
  }

  saveLeaderboard(merged);
};

export const getInventory = () =>
  browser() ? jsonParse<string[]>(localStorage.getItem(INVENTORY_KEY), []) : [];

export const unlockItem = (itemId: string) => {
  if (!browser()) return;
  const owned = new Set(getInventory());
  owned.add(itemId);
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(Array.from(owned)));
};

export const dynamicPrice = (item: InventoryItem, ownedCount: number) =>
  Math.round(item.basePrice * (1 + ownedCount * 0.04));

export const getLiveFeed = () =>
  browser()
    ? jsonParse<{ id: string; text: string; createdAt: number }[]>(localStorage.getItem(FEED_KEY), [])
    : [];

export const pushLiveFeed = (text: string) => {
  if (!browser()) return;
  const current = getLiveFeed();
  const next = [{ id: crypto.randomUUID(), text, createdAt: Date.now() }, ...current].slice(0, 20);
  localStorage.setItem(FEED_KEY, JSON.stringify(next));
};

export const getAudit = () => (browser() ? jsonParse<AuditLogEntry[]>(localStorage.getItem(AUDIT_KEY), []) : []);

export const addAudit = (entry: Omit<AuditLogEntry, "id" | "createdAt">) => {
  if (!browser()) return;
  const current = getAudit();
  current.unshift({ ...entry, id: crypto.randomUUID(), createdAt: Date.now() });
  localStorage.setItem(AUDIT_KEY, JSON.stringify(current.slice(0, 100)));
};
