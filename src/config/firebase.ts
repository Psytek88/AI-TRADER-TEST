import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCAn5y3HPlmy8bIKvl4WCkzUsdZp0s5xb8",
  authDomain: "ai-trader-d75b8.firebaseapp.com",
  projectId: "ai-trader-d75b8",
  storageBucket: "ai-trader-d75b8.firebasestorage.app",
  messagingSenderId: "510382297412",
  appId: "1:510382297412:web:5594422280743af0c9c711",
  measurementId: "G-22K5W35B0T"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);