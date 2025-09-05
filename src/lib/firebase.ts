// Firebase configuration - maintain existing setup
// This file should mirror your existing Firebase setup exactly

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your existing Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyClO4_ws1wWVZyMb8o1OofNEOADBlgXqq4",
  authDomain: "copd-monitor.firebaseapp.com",
  projectId: "copd-monitor",
  storageBucket: "copd-monitor.firebasestorage.app",
  messagingSenderId: "806831690568",
  appId: "1:806831690568:web:e5b665347e5c7218d4d97d",
  measurementId: "G-0508D7FY89"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
