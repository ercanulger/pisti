/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db, collection, doc, setDoc, getDoc, getDocs, updateDoc, addDoc, query, orderBy, limit, onSnapshot } from './firebase';
import { Player, UserInventory, AuditLog, MatchHistory, UserRole } from '../types';

// Storage keys corresponding to localStorage
const USERS_KEY = 'pisti_users';
const INVENTORY_KEY = 'pisti_user_inventory';
const AUDIT_LOG_KEY = 'pisti_audit_log';
const MATCH_HISTORY_KEY = 'pisti_match_history';
const ROLES_KEY = 'pisti_user_roles';

/**
 * Push a local player profile to Firestore
 */
export async function syncUserToFirestore(player: Player) {
  try {
    const userRef = doc(db, 'users', player.id);
    await setDoc(userRef, {
      id: player.id,
      username: player.username,
      email: player.email || '',
      avatarUrl: player.avatarUrl,
      elo: player.elo,
      coins: player.coins,
      isBot: player.isBot,
      botLevel: player.botLevel || null,
      selectedFrame: player.selectedFrame || null,
      selectedFont: player.selectedFont || null,
      selectedColor: player.selectedColor || null,
      selectedBadge: player.selectedBadge || null,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore User Sync Error:', err);
  }
}

/**
 * Push an inventory purchase item to Firestore
 */
export async function syncInventoryToFirestore(inv: UserInventory) {
  try {
    const invRef = doc(db, 'user_inventory', inv.id);
    await setDoc(invRef, {
      id: inv.id,
      userId: inv.userId,
      itemType: inv.itemType,
      itemId: inv.itemId,
      purchasedAt: inv.purchasedAt
    });
  } catch (err) {
    console.warn('Firestore Inventory Sync Error:', err);
  }
}

/**
 * Push an audit log to Firestore
 */
export async function syncLogToFirestore(log: AuditLog) {
  try {
    const logRef = doc(db, 'audit_log', log.id);
    await setDoc(logRef, {
      id: log.id,
      userId: log.userId,
      action: log.action,
      details: log.details,
      timestamp: log.timestamp
    });
  } catch (err) {
    console.warn('Firestore Log Sync Error:', err);
  }
}

/**
 * Push a match history item to Firestore
 */
export async function syncMatchToFirestore(match: MatchHistory) {
  try {
    const matchRef = doc(db, 'match_history', match.id);
    await setDoc(matchRef, {
      id: match.id,
      date: match.date,
      players: match.players,
      winnerId: match.winnerId,
      pointsCollected: match.pointsCollected,
      coinsEarned: match.coinsEarned,
      eloEarned: match.eloEarned
    });
  } catch (err) {
    console.warn('Firestore Match Sync Error:', err);
  }
}

/**
 * Push a role to Firestore
 */
export async function syncRoleToFirestore(role: UserRole) {
  try {
    const roleRef = doc(db, 'user_roles', role.id);
    await setDoc(roleRef, {
      id: role.id,
      userId: role.userId,
      role: role.role
    });
  } catch (err) {
    console.warn('Firestore Role Sync Error:', err);
  }
}

/**
 * Fetch all documents from Firestore and sync with localStorage.
 * Runs in background on startup to populate/update database.
 */
export async function loadAllFromFirestore() {
  try {
    // 1. Fetch Users
    const usersSnap = await getDocs(collection(db, 'users'));
    if (!usersSnap.empty) {
      const dbUsers: Player[] = [];
      usersSnap.forEach((doc) => {
        const data = doc.data();
        dbUsers.push({
          id: data.id,
          username: data.username,
          email: data.email,
          avatarUrl: data.avatarUrl,
          elo: data.elo,
          coins: data.coins,
          isBot: data.isBot,
          botLevel: data.botLevel || undefined,
          selectedFrame: data.selectedFrame || undefined,
          selectedFont: data.selectedFont || undefined,
          selectedColor: data.selectedColor || undefined,
          selectedBadge: data.selectedBadge || undefined,
        });
      });

      // Maintain bots if not present in Firestore
      const localUsers: Player[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const localBots = localUsers.filter(u => u.isBot);
      
      // Combine Firestore users and local bots
      const mergedUsers = [...dbUsers];
      localBots.forEach((bot) => {
        if (!mergedUsers.some(u => u.id === bot.id)) {
          mergedUsers.push(bot);
        }
      });

      localStorage.setItem(USERS_KEY, JSON.stringify(mergedUsers));
    }

    // 2. Fetch User Inventory
    const invSnap = await getDocs(collection(db, 'user_inventory'));
    if (!invSnap.empty) {
      const dbInv: UserInventory[] = [];
      invSnap.forEach((doc) => {
        const data = doc.data();
        dbInv.push({
          id: data.id,
          userId: data.userId,
          itemType: data.itemType,
          itemId: data.itemId,
          purchasedAt: data.purchasedAt
        });
      });
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(dbInv));
    }

    // 3. Fetch User Roles
    const rolesSnap = await getDocs(collection(db, 'user_roles'));
    if (!rolesSnap.empty) {
      const dbRoles: UserRole[] = [];
      rolesSnap.forEach((doc) => {
        const data = doc.data();
        dbRoles.push({
          id: data.id,
          userId: data.userId,
          role: data.role
        });
      });
      localStorage.setItem(ROLES_KEY, JSON.stringify(dbRoles));
    }

    // 4. Fetch Match History
    const matchSnap = await getDocs(collection(db, 'match_history'));
    if (!matchSnap.empty) {
      const dbMatch: MatchHistory[] = [];
      matchSnap.forEach((doc) => {
        const data = doc.data();
        dbMatch.push({
          id: data.id,
          date: data.date,
          players: data.players,
          winnerId: data.winnerId,
          pointsCollected: data.pointsCollected,
          coinsEarned: data.coinsEarned,
          eloEarned: data.eloEarned
        });
      });
      // Sort newest first
      dbMatch.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(dbMatch));
    }

    // 5. Fetch Audit Logs
    const logSnap = await getDocs(collection(db, 'audit_log'));
    if (!logSnap.empty) {
      const dbLogs: AuditLog[] = [];
      logSnap.forEach((doc) => {
        const data = doc.data();
        dbLogs.push({
          id: data.id,
          userId: data.userId,
          action: data.action,
          details: data.details,
          timestamp: data.timestamp
        });
      });
      dbLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(dbLogs));
    }

    console.log('pisti.game: Firestore Database fully synchronized successfully!');
  } catch (err) {
    console.warn('Firestore loader background synchronization is offline or waiting:', err);
  }
}

/**
 * Listen to Firestore collections in real-time and trigger onUpdate callback when anything changes.
 */
export function setupRealtimeListeners(onUpdate: () => void): () => void {
  try {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const dbUsers: Player[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        dbUsers.push({
          id: data.id,
          username: data.username,
          email: data.email,
          avatarUrl: data.avatarUrl,
          elo: data.elo,
          coins: data.coins,
          isBot: data.isBot,
          botLevel: data.botLevel || undefined,
          selectedFrame: data.selectedFrame || undefined,
          selectedFont: data.selectedFont || undefined,
          selectedColor: data.selectedColor || undefined,
          selectedBadge: data.selectedBadge || undefined,
        });
      });

      // Keep bot accounts in local users
      const localUsers: Player[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const localBots = localUsers.filter(u => u.isBot);

      const mergedUsers = [...dbUsers];
      localBots.forEach((bot) => {
        if (!mergedUsers.some(u => u.id === bot.id)) {
          mergedUsers.push(bot);
        }
      });

      localStorage.setItem(USERS_KEY, JSON.stringify(mergedUsers));
      onUpdate();
    });

    const unsubMatches = onSnapshot(collection(db, 'match_history'), (snapshot) => {
      const dbMatch: MatchHistory[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        dbMatch.push({
          id: data.id,
          date: data.date,
          players: data.players,
          winnerId: data.winnerId,
          pointsCollected: data.pointsCollected,
          coinsEarned: data.coinsEarned,
          eloEarned: data.eloEarned
        });
      });
      dbMatch.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      localStorage.setItem(MATCH_HISTORY_KEY, JSON.stringify(dbMatch));
      onUpdate();
    });

    return () => {
      unsubUsers();
      unsubMatches();
    };
  } catch (err) {
    console.warn('Real-time listeners setup failed:', err);
    return () => {};
  }
}

/**
 * Creates a verification code in Firestore under 'verifications' collection
 */
export async function createVerificationInFirestore(email: string, username: string, type: 'register' | 'login'): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes expiry

  const ref = doc(db, 'verifications', email.toLowerCase());
  await setDoc(ref, {
    email: email.toLowerCase(),
    username,
    code,
    type,
    expiresAt,
    verified: false,
    createdAt: new Date().toISOString()
  });

  return code;
}

/**
 * Verifies the code in Firestore
 */
export async function verifyCodeInFirestore(email: string, code: string): Promise<boolean> {
  try {
    const ref = doc(db, 'verifications', email.toLowerCase());
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;

    const data = snap.data();
    if (data.code === code && new Date(data.expiresAt).getTime() > Date.now()) {
      await setDoc(ref, { verified: true }, { merge: true });
      return true;
    }
    return false;
  } catch (err) {
    console.error('Verify code in firestore failed:', err);
    return false;
  }
}


