/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, query, orderBy, limit, addDoc, onSnapshot } from 'firebase/firestore';

// Load values from firebase-applet-config.json or use provided defaults
const firebaseConfig = {
  apiKey: "AIzaSyAPkdiuja_P4KMlrVMiLdSkLNOMbYssRws",
  authDomain: "game-afc20.firebaseapp.com",
  databaseURL: "https://game-afc20-default-rtdb.firebaseio.com",
  projectId: "game-afc20",
  storageBucket: "game-afc20.firebasestorage.app",
  messagingSenderId: "888100403899",
  appId: "1:888100403899:web:acb9685f731493deb3079e", // From firebase-applet-config.json
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID from config
export const db = getFirestore(app, "ai-studio-pistigame-02a9a1d8-0505-4259-a903-8da03f1bc01a");

export { collection, doc, setDoc, getDoc, getDocs, updateDoc, query, orderBy, limit, addDoc, onSnapshot };
