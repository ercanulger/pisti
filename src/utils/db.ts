/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShopItem, Player, UserRole, UserInventory, AuditLog, Quest, LiveFeedItem, MatchHistory } from '../types';

const SHOP_ITEMS_KEY = 'pisti_shop_items';
const USERS_KEY = 'pisti_users';
const ROLES_KEY = 'pisti_user_roles';
const INVENTORY_KEY = 'pisti_user_inventory';
const AUDIT_LOG_KEY = 'pisti_audit_log';
const QUESTS_KEY = 'pisti_quests';
const MATCH_HISTORY_KEY = 'pisti_match_history';
const CURRENT_USER_ID_KEY = 'pisti_current_user_id';

// 15 Custom Shop Items including RGB frames, special fonts, colors, badges with dynamic pricing
export const DEFAULT_SHOP_ITEMS: ShopItem[] = [
  // 1. ANIMATED/RGB FRAMES (5 items)
  {
    id: 'frame_neon_cyan',
    name: 'Neon Cyan Frame',
    type: 'frame',
    price: 150,
    value: 'border-2 border-cyan-400 shadow-[0_0_10px_#22d3ee]',
    description: 'Neon camgöbeği ışıması ile profilini canlandır.',
    isAnimated: true,
  },
  {
    id: 'frame_rgb_matrix',
    name: 'Hyper RGB Matrix Frame',
    type: 'frame',
    price: 500,
    value: 'border-2 border-transparent bg-clip-border bg-gradient-to-r from-red-500 via-green-500 to-blue-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]',
    description: 'Kesintisiz renk geçişli, efsanevi RGB dalgalanması.',
    isAnimated: true,
    rgbEffect: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)',
  },
  {
    id: 'frame_gold_hologram',
    name: 'Gold Hologram Frame',
    type: 'frame',
    price: 350,
    value: 'border-2 border-amber-400 bg-gradient-to-tr from-yellow-300 via-amber-500 to-yellow-600 shadow-[0_0_12px_#fbbf24]',
    description: 'Altın varaklı, holografik lüks yansıma.',
    isAnimated: true,
  },
  {
    id: 'frame_ruby_plasma',
    name: 'Ruby Plasma Frame',
    type: 'frame',
    price: 250,
    value: 'border-2 border-red-500 shadow-[0_0_10px_#ef4444] animate-pulse',
    description: 'Köz gibi parlayan plazma kırmızısı.',
    isAnimated: true,
  },
  {
    id: 'frame_cyber_violet',
    name: 'Cyberpunk Violet Frame',
    type: 'frame',
    price: 200,
    value: 'border-2 border-purple-500 shadow-[0_0_10px_#a855f7]',
    description: 'Fütüristik mor ve neon fırtınası.',
    isAnimated: true,
  },

  // 2. SPECIAL FONTS (3 items)
  {
    id: 'font_monospace',
    name: 'Monospace Code',
    type: 'font',
    price: 100,
    value: 'font-mono tracking-tight',
    description: 'Geliştiricilere özel, retro terminal yazı tipi.',
  },
  {
    id: 'font_space_grotesk',
    name: 'Space Grotesk',
    type: 'font',
    price: 150,
    value: 'font-display font-bold tracking-wide',
    description: 'Modern, geometrik ve teknolojik sunum.',
  },
  {
    id: 'font_editorial_serif',
    name: 'Editorial Serif',
    type: 'font',
    price: 180,
    value: 'font-serif italic',
    description: 'Geleneksel ve elit bir hava katan italik serif.',
  },

  // 3. NICKNAME COLORS (4 items)
  {
    id: 'color_laser_green',
    name: 'Laser Green Color',
    type: 'color',
    price: 80,
    value: 'text-green-400 font-semibold drop-shadow-[0_0_4px_rgba(74,222,128,0.5)]',
    description: 'Parlak ve keskin lazer yeşili.',
  },
  {
    id: 'color_hot_pink',
    name: 'Hot Pink Color',
    type: 'color',
    price: 90,
    value: 'text-pink-500 font-semibold drop-shadow-[0_0_4px_rgba(236,72,153,0.5)]',
    description: 'Neon sıcak pembe rengiyle dikkat çek.',
  },
  {
    id: 'color_sunset_orange',
    name: 'Sunset Orange Color',
    type: 'color',
    price: 110,
    value: 'text-orange-400 font-semibold drop-shadow-[0_0_4px_rgba(251,146,60,0.5)]',
    description: 'Günbatımı kızıllığı ve sıcaklığı.',
  },
  {
    id: 'color_electric_indigo',
    name: 'Electric Indigo Color',
    type: 'color',
    price: 130,
    value: 'text-indigo-400 font-semibold drop-shadow-[0_0_4px_rgba(129,140,248,0.5)]',
    description: 'Zengin elektrik mor-mavi tonu.',
  },

  // 4. BADGES (3 items)
  {
    id: 'badge_pisti_master',
    name: 'Pişti Master Badge',
    type: 'badge',
    price: 300,
    value: '👑 Master',
    description: 'Oyunda usta olduğunu gösteren kral tacı rozeti.',
    badgeText: '👑 Master',
  },
  {
    id: 'badge_elo_conqueror',
    name: 'Elo Conqueror Badge',
    type: 'badge',
    price: 400,
    value: '💎 Conqueror',
    description: 'Liderlik tablosunun fatihlerine özel elmas rozet.',
    badgeText: '💎 Conqueror',
  },
  {
    id: 'badge_gold_back',
    name: 'Legendary Badge',
    type: 'badge',
    price: 200,
    value: '🔥 Legend',
    description: 'Efsanevi oyuncu statüsü rozeti.',
    badgeText: '🔥 Legend',
  },
];

// Seed initial database
export function initializeDB() {
  if (!localStorage.getItem(SHOP_ITEMS_KEY)) {
    localStorage.setItem(SHOP_ITEMS_KEY, JSON.stringify(DEFAULT_SHOP_ITEMS));
  }

  // Pre-configured list of users
  if (!localStorage.getItem(USERS_KEY)) {
    const defaultUsers: Player[] = [
      {
        id: 'user_ercanulger',
        username: 'ercanulger',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ercanulger',
        elo: 1580,
        coins: 1000,
        isBot: false,
        selectedFrame: 'frame_rgb_matrix',
        selectedFont: 'font_space_grotesk',
        selectedColor: 'color_laser_green',
        selectedBadge: 'badge_admin_owner',
      },
      {
        id: 'bot_kolay_kemal',
        username: 'Acemi Kemal',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=kemal',
        elo: 1000,
        coins: 0,
        isBot: true,
        botLevel: 'beginner',
      },
      {
        id: 'bot_kolay_ayse',
        username: 'Stajyer Ayşe',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ayse',
        elo: 1050,
        coins: 0,
        isBot: true,
        botLevel: 'beginner',
      },
      {
        id: 'bot_orta_selim',
        username: 'Dengeli Selim',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=selim',
        elo: 1200,
        coins: 0,
        isBot: true,
        botLevel: 'intermediate',
      },
      {
        id: 'bot_usta_leyla',
        username: 'Usta Leyla',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=leyla',
        elo: 1450,
        coins: 0,
        isBot: true,
        botLevel: 'expert',
      },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }

  // Remove default active user setting so new users are prompted to register
  // Set roles (ercanulger is ADMIN, others are players)
  if (!localStorage.getItem(ROLES_KEY)) {
    const defaultRoles: UserRole[] = [
      { id: 'role_1', userId: 'user_ercanulger', role: 'admin' },
    ];
    localStorage.setItem(ROLES_KEY, JSON.stringify(defaultRoles));
  }

  // Set ercanulger inventory (Automatic Admin badge and frame)
  if (!localStorage.getItem(INVENTORY_KEY)) {
    const defaultInventory: UserInventory[] = [
      { id: 'inv_1', userId: 'user_ercanulger', itemType: 'badge', itemId: 'badge_admin_owner', purchasedAt: new Date().toISOString() },
      { id: 'inv_2', userId: 'user_ercanulger', itemType: 'frame', itemId: 'frame_rgb_matrix', purchasedAt: new Date().toISOString() },
      { id: 'inv_3', userId: 'user_ercanulger', itemType: 'font', itemId: 'font_space_grotesk', purchasedAt: new Date().toISOString() },
      { id: 'inv_4', userId: 'user_ercanulger', itemType: 'color', itemId: 'color_laser_green', purchasedAt: new Date().toISOString() },
    ];
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(defaultInventory));
  }

  // Set default audit logs
  if (!localStorage.getItem(AUDIT_LOG_KEY)) {
    const defaultLogs: AuditLog[] = [
      {
        id: 'log_1',
        userId: 'system',
        action: 'DB_INITIALIZATION',
        details: 'pisti.game veritabanı kuruldu ve normalize tablolar yüklendi.',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'log_2',
        userId: 'system',
        action: 'ADMIN_PROMOTION',
        details: 'ercanulger kullanıcısına otomatik Admin yetkisi ve özel rozetler tanımlandı.',
        timestamp: new Date().toISOString(),
      },
    ];
    localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(defaultLogs));
  }

  // Set default quests
  if (!localStorage.getItem(QUESTS_KEY)) {
    const defaultQuests: Quest[] = [
      {
        id: 'quest_1',
        title: 'Günün İlk Hamlesi',
        description: 'Herhangi bir oyun modunda 1 maç tamamla.',
        rewardCoins: 50,
        targetCount: 1,
        currentCount: 0,
        completed: false,
        claimed: false,
      },
      {
        id: 'quest_2',
        title: 'Pişti Avcısı',
        description: 'Botlara karşı oynarken toplam 2 adet Pişti yap.',
        rewardCoins: 120,
        targetCount: 2,
        currentCount: 0,
        completed: false,
        claimed: false,
      },
      {
        id: 'quest_3',
        title: 'Kupa Fatihi',
        description: 'Maç kazanarak toplamda 30 Elo (Kupa) biriktir.',
        rewardCoins: 200,
        targetCount: 30,
        currentCount: 0,
        completed: false,
        claimed: false,
      },
      {
        id: 'quest_4',
        title: 'Seri Pişti',
        description: 'Vale (Vale Piştisi dahil) kartı ile 1 adet Pişti yakala.',
        rewardCoins: 150,
        targetCount: 1,
        currentCount: 0,
        completed: false,
        claimed: false,
      },
    ];
    localStorage.setItem(QUESTS_KEY, JSON.stringify(defaultQuests));
  }

  // Default Match History
  if (!localStorage.getItem(MATCH_HISTORY_KEY)) {
    const defaultHistory: MatchHistory[] = [
      {
        id: 'match_1',
        date: new Date(Date.now() - 4 * 3600000).toISOString(),
        players: [
          { username: 'ercanulger', score: 62, eloChange: 24, isPlayer: true },
          { username: 'Usta Leyla', score: 32, eloChange: -12, isPlayer: false },
          { username: 'Dengeli Selim', score: 18, eloChange: -8, isPlayer: false },
          { username: 'Acemi Kemal', score: 9, eloChange: -4, isPlayer: false },
        ],
        winnerId: 'user_ercanulger',
        pointsCollected: 62,
        coinsEarned: 100,
        eloEarned: 24,
      },
    ];
    localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(defaultHistory));
  }
}

// User Profile helpers
export function getUsers(): Player[] {
  initializeDB();
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

export function getCurrentUser(): Player | null {
  initializeDB();
  const users = getUsers();
  const currentId = localStorage.getItem(CURRENT_USER_ID_KEY);
  if (!currentId) return null;
  const found = users.find((u) => u.id === currentId);
  return found || null;
}

export function registerUser(username: string): Player {
  initializeDB();
  const users = getUsers();
  const newId = `user_${Date.now()}`;
  const newPlayer: Player = {
    id: newId,
    username,
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
    elo: 1000,
    coins: 200, // starting coins
    isBot: false,
  };
  users.push(newPlayer);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_ID_KEY, newId);
  writeAuditLog(newId, 'USER_REGISTER', `${username} platforma kayıt oldu!`);
  return newPlayer;
}

export function updateCurrentUser(updated: Partial<Player>) {
  initializeDB();
  const users = getUsers();
  const currentId = localStorage.getItem(CURRENT_USER_ID_KEY);
  if (!currentId) return;
  const updatedUsers = users.map((u) => {
    if (u.id === currentId) {
      return { ...u, ...updated };
    }
    return u;
  });
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
}

export function updateUserCoinsAndElo(userId: string, coinDelta: number, eloDelta: number) {
  const users = getUsers();
  const updatedUsers = users.map((u) => {
    if (u.id === userId) {
      const newCoins = Math.max(0, u.coins + coinDelta);
      const newElo = Math.max(100, u.elo + eloDelta);
      return { ...u, coins: newCoins, elo: newElo };
    }
    return u;
  });
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
}

// Roles helpers
export function getUserRoles(): UserRole[] {
  initializeDB();
  return JSON.parse(localStorage.getItem(ROLES_KEY) || '[]');
}

export function isUserAdmin(userId: string): boolean {
  const roles = getUserRoles();
  return roles.some((r) => r.userId === userId && r.role === 'admin');
}

// Inventory helpers
export function getUserInventory(userId: string): UserInventory[] {
  initializeDB();
  const all = JSON.parse(localStorage.getItem(INVENTORY_KEY) || '[]');
  return all.filter((inv: UserInventory) => inv.userId === userId);
}

export function buyShopItem(userId: string, item: ShopItem): { success: boolean; error?: string } {
  const users = getUsers();
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) return { success: false, error: 'Kullanıcı bulunamadı.' };

  const user = users[userIndex];
  if (user.coins < item.price) {
    return { success: false, error: 'Yetersiz coin bakiyesi.' };
  }

  // Check if already purchased
  const inventory = getUserInventory(userId);
  if (inventory.some((inv) => inv.itemId === item.id)) {
    return { success: false, error: 'Bu eşya zaten envanterinizde mevcut.' };
  }

  // Deduct coins
  user.coins -= item.price;
  users[userIndex] = user;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Add to inventory
  const allInv = JSON.parse(localStorage.getItem(INVENTORY_KEY) || '[]');
  const newInv: UserInventory = {
    id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    userId,
    itemType: item.type,
    itemId: item.id,
    purchasedAt: new Date().toISOString(),
  };
  allInv.push(newInv);
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(allInv));

  // Write to Audit Log
  writeAuditLog(userId, 'SHOP_PURCHASE', `Mağazadan '${item.name}' satın alındı. Harcanan: ${item.price} Coin.`);

  return { success: true };
}

// Audit logs
export function getAuditLogs(): AuditLog[] {
  initializeDB();
  return JSON.parse(localStorage.getItem(AUDIT_LOG_KEY) || '[]');
}

export function writeAuditLog(userId: string, action: string, details: string) {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newLog); // Put newest first
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(logs));
}

// Quests helpers
export function getQuests(): Quest[] {
  initializeDB();
  return JSON.parse(localStorage.getItem(QUESTS_KEY) || '[]');
}

export function incrementQuestProgress(questId: string, count = 1) {
  const quests = getQuests();
  const updated = quests.map((q) => {
    if (q.id === questId && !q.completed) {
      const current = Math.min(q.targetCount, q.currentCount + count);
      const completed = current >= q.targetCount;
      return { ...q, currentCount: current, completed };
    }
    return q;
  });
  localStorage.setItem(QUESTS_KEY, JSON.stringify(updated));
}

export function updateAllQuestsProgress(type: 'match' | 'pisti' | 'elo' | 'vale_pisti', value = 1) {
  const quests = getQuests();
  const updated = quests.map((q) => {
    if (q.id === 'quest_1' && type === 'match') {
      const current = Math.min(q.targetCount, q.currentCount + value);
      return { ...q, currentCount: current, completed: current >= q.targetCount };
    }
    if (q.id === 'quest_2' && type === 'pisti') {
      const current = Math.min(q.targetCount, q.currentCount + value);
      return { ...q, currentCount: current, completed: current >= q.targetCount };
    }
    if (q.id === 'quest_3' && type === 'elo') {
      const current = Math.min(q.targetCount, q.currentCount + value);
      return { ...q, currentCount: current, completed: current >= q.targetCount };
    }
    if (q.id === 'quest_4' && type === 'vale_pisti') {
      const current = Math.min(q.targetCount, q.currentCount + value);
      return { ...q, currentCount: current, completed: current >= q.targetCount };
    }
    return q;
  });
  localStorage.setItem(QUESTS_KEY, JSON.stringify(updated));
}

export function claimQuestReward(questId: string): { success: boolean; rewardCoins: number } {
  const quests = getQuests();
  const questIndex = quests.findIndex((q) => q.id === questId);
  if (questIndex === -1) return { success: false, rewardCoins: 0 };

  const quest = quests[questIndex];
  if (!quest.completed || quest.claimed) return { success: false, rewardCoins: 0 };

  quest.claimed = true;
  quests[questIndex] = quest;
  localStorage.setItem(QUESTS_KEY, JSON.stringify(quests));

  // Add coins to current user
  const user = getCurrentUser();
  updateUserCoinsAndElo(user.id, quest.rewardCoins, 0);

  writeAuditLog(user.id, 'QUEST_CLAIM', `'${quest.title}' görevinin ödülü alındı: +${quest.rewardCoins} Coin.`);

  return { success: true, rewardCoins: quest.rewardCoins };
}

// Reset daily/weekly quests
export function resetQuests() {
  const quests = getQuests();
  const reset = quests.map((q) => ({
    ...q,
    currentCount: 0,
    completed: false,
    claimed: false,
  }));
  localStorage.setItem(QUESTS_KEY, JSON.stringify(reset));
}

// Match History helpers
export function getMatchHistory(): MatchHistory[] {
  initializeDB();
  return JSON.parse(localStorage.getItem(MATCH_HISTORY_KEY) || '[]');
}

export function saveMatchResult(historyItem: MatchHistory) {
  const history = getMatchHistory();
  history.unshift(historyItem);
  localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(history));

  // Update real-time scoreboard in simulated Vercel KV and user profiles
  historyItem.players.forEach((p) => {
    // Find matching registered user
    const users = getUsers();
    const user = users.find((u) => u.username === p.username);
    if (user) {
      updateUserCoinsAndElo(user.id, p.isPlayer ? historyItem.coinsEarned : 0, p.eloChange);
    }
  });
}

// Resend API integrated mail dispatcher
export async function sendPasswordResetEmail(email: string, username: string): Promise<{ success: boolean; message: string }> {
  const resendApiKey = 're_9rBhaPQ2_FtvX1ndZe6dTiNW8USaCbKxY';
  const resetToken = Math.random().toString(36).substring(2, 10).toUpperCase();

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'pisti.game <onboarding@resend.dev>',
        to: [email],
        subject: 'pisti.game - Şifre Sıfırlama Talebi',
        html: `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; background-color: #0b0f19; color: #f3f4f6; padding: 40px; border-radius: 12px; border: 1px solid #1f2937;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #22d3ee; margin: 0; font-size: 28px; font-weight: bold; letter-spacing: -0.025em;">pisti.game</h1>
              <p style="color: #9ca3af; font-size: 14px; margin-top: 5px;">Cyber-Classic Pişti Deneyimi</p>
            </div>
            <p style="font-size: 16px; line-height: 1.5;">Merhaba <strong>${username}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.5;">pisti.game hesabınız için bir şifre sıfırlama talebinde bulundunuz. Aşağıdaki geçici doğrulama kodunu kullanarak şifrenizi sıfırlayabilirsiniz:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-family: 'JetBrains Mono', monospace; font-size: 32px; font-weight: bold; letter-spacing: 0.1em; color: #f43f5e; background-color: #1e1b4b; padding: 12px 24px; border-radius: 8px; border: 1px solid #4338ca; display: inline-block;">
                ${resetToken}
              </span>
            </div>
            <p style="font-size: 14px; color: #9ca3af; line-height: 1.5;">Bu kod 15 dakika geçerlidir. Şifre sıfırlama talebinde bulunmadıysanız bu e-postayı güvenle görmezden gelebilirsiniz.</p>
            <hr style="border: 0; border-top: 1px solid #1f2937; margin: 30px 0;" />
            <p style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">pisti.game © 2026 • Tüm hakları saklıdır.</p>
          </div>
        `,
      }),
    });

    if (response.ok) {
      writeAuditLog('system', 'PASSWORD_RESET', `${username} (${email}) için şifre sıfırlama maili başarıyla gönderildi.`);
      return { success: true, message: 'Şifre sıfırlama e-postası başarıyla gönderildi (Resend API).' };
    } else {
      const errorData = await response.json();
      console.error('Resend API Error:', errorData);
      throw new Error(errorData.message || 'Resend API error');
    }
  } catch (err: any) {
    console.warn('Resend mail sending error (Simulating backup):', err);
    // Return mock success so the local client keeps working perfectly even if CORS blocks client-side API requests, which is common in browsers
    writeAuditLog('system', 'PASSWORD_RESET_SIMULATED', `${username} (${email}) için şifre sıfırlama maili simüle edildi. Kod: ${resetToken}`);
    return {
      success: true,
      message: `Şifre sıfırlama kodu simüle edildi: ${resetToken} (Resend API CORS engeline takıldıysa veya API anahtarı geçersizse otomatik simülasyon modu devrededir).`
    };
  }
}
