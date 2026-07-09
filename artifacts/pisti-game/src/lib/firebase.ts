import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBeote8uw-kPawYRzjsfq2g-tGMp5xs7Ok",
  authDomain: "pistigame-2542a.firebaseapp.com",
  projectId: "pistigame-2542a",
  storageBucket: "pistigame-2542a.firebasestorage.app",
  messagingSenderId: "1088055147051",
  appId: "1:1088055147051:web:7b2c446e550b312914c86e",
  measurementId: "G-Y0HPTPFHJR"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics only in browser environments
isSupported().then((supported) => {
  if (supported) getAnalytics(app);
});
