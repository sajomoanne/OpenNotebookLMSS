import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAYp8ca5ccQrrryYiJ3yUeqQF2JFjZPcYU',
  authDomain: 'opennote-isawesome.firebaseapp.com',
  databaseURL: 'https://opennote-isawesome-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'opennote-isawesome',
  storageBucket: 'opennote-isawesome.firebasestorage.app',
  messagingSenderId: '148212598717',
  appId: '1:148212598717:web:d8a1947e98519da328b4d4',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function signOutUser() {
  return signOut(auth);
}

/**
 * Auth-state wrapper that keeps users/{uid} in sync.
 * First sign-in creates the profile doc; later sign-ins only bump lastLoginAt.
 */
export function onUser(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        await ensureUserProfile(user);
      } catch (err) {
        console.error('Failed to sync user profile:', err);
      }
    }
    callback(user);
  });
}

async function ensureUserProfile(user) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      displayName: user.displayName || '',
      email: user.email || '',
      bio: '',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, { lastLoginAt: serverTimestamp() }, { merge: true });
  }
}
