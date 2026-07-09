import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

const ADMIN_NICKNAME = 'ercanulger';

export interface UserProfile {
  uid: string;
  email: string;
  nickname: string;
  photoBase64: string | null;
  isAdmin: boolean;
  isEmailVerified: boolean;
  trophies: number;
  coins: number;
  gamesPlayed: number;
  gamesWon: number;
  createdAt: Timestamp | Date;
  ownedFrames: string[];
  ownedTables: string[];
  activeFrame: string | null;
  activeTable: string | null;
}

export interface PublicProfile {
  uid: string;
  nickname: string;
  photoBase64: string | null;
  isAdmin: boolean;
  trophies: number;
  gamesPlayed: number;
  gamesWon: number;
  activeFrame: string | null;
  activeTable: string | null;
}

export interface GameHistory {
  id?: string;
  uid: string;
  result: 'win' | 'loss' | 'draw';
  score: number;
  pistiCount: number;
  coinsEarned: number;
  trophiesEarned: number;
  playedAt: Timestamp | Date;
}

function isAdminIdentity(email?: string, nickname?: string): boolean {
  const normalizedNick = nickname?.trim().toLowerCase();
  const emailPrefix = email?.split('@')[0]?.toLowerCase();
  return normalizedNick === ADMIN_NICKNAME || emailPrefix === ADMIN_NICKNAME;
}

function toPublicProfile(profile: Partial<UserProfile>): Partial<PublicProfile> {
  return {
    uid: profile.uid!,
    nickname: profile.nickname || '',
    photoBase64: profile.photoBase64 || null,
    isAdmin: !!profile.isAdmin,
    trophies: profile.trophies || 0,
    gamesPlayed: profile.gamesPlayed || 0,
    gamesWon: profile.gamesWon || 0,
    activeFrame: profile.activeFrame || null,
    activeTable: profile.activeTable || 'table-classic',
  };
}

function toPublicPatch(data: Partial<UserProfile>): Partial<PublicProfile> {
  const patch: Partial<PublicProfile> = {};
  if (typeof data.nickname !== 'undefined') patch.nickname = data.nickname;
  if (typeof data.photoBase64 !== 'undefined') patch.photoBase64 = data.photoBase64;
  if (typeof data.isAdmin !== 'undefined') patch.isAdmin = data.isAdmin;
  if (typeof data.trophies !== 'undefined') patch.trophies = data.trophies;
  if (typeof data.gamesPlayed !== 'undefined') patch.gamesPlayed = data.gamesPlayed;
  if (typeof data.gamesWon !== 'undefined') patch.gamesWon = data.gamesWon;
  if (typeof data.activeFrame !== 'undefined') patch.activeFrame = data.activeFrame;
  if (typeof data.activeTable !== 'undefined') patch.activeTable = data.activeTable;
  return patch;
}

export const firestoreHelpers = {
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  },

  async getPublicProfile(uid: string): Promise<PublicProfile | null> {
    const docRef = doc(db, 'publicProfiles', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as PublicProfile;
    }
    return null;
  },

  async createUserProfile(uid: string, data: Partial<UserProfile>) {
    const userDocRef = doc(db, 'users', uid);
    const publicDocRef = doc(db, 'publicProfiles', uid);
    const admin = isAdminIdentity(data.email, data.nickname);
    const defaultProfile: Partial<UserProfile> = {
      uid,
      photoBase64: null,
      isAdmin: admin,
      trophies: 0,
      coins: 500,
      gamesPlayed: 0,
      gamesWon: 0,
      createdAt: new Date(),
      ownedFrames: [],
      ownedTables: ['table-classic'],
      activeFrame: null,
      activeTable: 'table-classic',
      ...data
    };
    await setDoc(userDocRef, defaultProfile, { merge: true });
    await setDoc(publicDocRef, toPublicProfile(defaultProfile), { merge: true });
    return defaultProfile;
  },

  async updateUserProfile(uid: string, data: Partial<UserProfile>) {
    const userDocRef = doc(db, 'users', uid);
    const publicDocRef = doc(db, 'publicProfiles', uid);
    const normalizedData = { ...data };
    if (typeof normalizedData.nickname !== 'undefined') {
      normalizedData.isAdmin = isAdminIdentity(undefined, normalizedData.nickname);
    }

    await updateDoc(userDocRef, normalizedData);
    const publicPatch = toPublicPatch(normalizedData);
    if (Object.keys(publicPatch).length > 0) {
      await setDoc(publicDocRef, { uid, ...publicPatch }, { merge: true });
    }
  },

  async isNicknameTaken(nickname: string): Promise<boolean> {
    const q = query(collection(db, 'users'), where('nickname', '==', nickname));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  },

  async getLeaderboard(limitCount: number = 100): Promise<PublicProfile[]> {
    const q = query(collection(db, 'publicProfiles'), orderBy('trophies', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as PublicProfile);
  },

  async saveGameResult(history: GameHistory) {
    const newDocRef = doc(collection(db, 'gameHistory'));
    await setDoc(newDocRef, {
      ...history,
      playedAt: new Date()
    });
    
    // Update user profile stats
    const userRef = doc(db, 'users', history.uid);
    const publicRef = doc(db, 'publicProfiles', history.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data() as UserProfile;
      const updatedStats = {
        gamesPlayed: (userData.gamesPlayed || 0) + 1,
        gamesWon: (userData.gamesWon || 0) + (history.result === 'win' ? 1 : 0),
        coins: (userData.coins || 0) + history.coinsEarned,
        trophies: Math.max(0, (userData.trophies || 0) + history.trophiesEarned)
      };

      await updateDoc(userRef, updatedStats);
      await setDoc(publicRef, { uid: history.uid, ...toPublicPatch(updatedStats) }, { merge: true });
    }
  },

  async getRecentGames(uid: string, limitCount: number = 5): Promise<GameHistory[]> {
    const q = query(collection(db, 'gameHistory'), where('uid', '==', uid), orderBy('playedAt', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GameHistory));
  }
};
