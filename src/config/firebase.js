import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA4KFdLVKVy6WdAfTGuLWDJsV_tcuNp7kw",
  authDomain: "run-log-31420.firebaseapp.com",
  projectId: "run-log-31420",
  storageBucket: "run-log-31420.firebasestorage.app",
  messagingSenderId: "325067679087",
  appId: "1:325067679087:web:727201211a34ac6c1fb49a",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
