import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile,
  type Auth,
  type User,
} from 'firebase/auth';
import {
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  getDocs,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';
import type { UserProfile, SubscriptionStatus } from '@/types';
import { FREE_TRIAL_DAYS, FREE_DAILY_LIMIT } from '@/types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_FIREBASE_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'your-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'your-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'your-app-id',
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

function getFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    // Chrome extensions need long polling — WebChannel fails in MV3 popups
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true,
    });
  }
  return { app, auth, db };
}

function createDefaultProfile(user: User): UserProfile {
  const now = Date.now();
  const trialEnd = now + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000;
  return {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    createdAt: now,
    trialStartDate: now,
    trialEndDate: trialEnd,
    subscriptionStatus: 'trial',
    dailyExplanationCount: 0,
    lastExplanationDate: new Date().toISOString().split('T')[0],
    streak: 0,
    longestStreak: 0,
    totalExplanations: 0,
    achievements: [],
    preferredMode: 'whatsapp',
    preferredLanguage: 'en',
    darkMode: false,
    onboardingComplete: false,
  };
}

export async function signUp(email: string, password: string, displayName: string): Promise<UserProfile> {
  const { auth: firebaseAuth, db: firestore } = getFirebase();
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  await updateProfile(credential.user, { displayName });
  await sendEmailVerification(credential.user);

  const profile = createDefaultProfile(credential.user);
  profile.displayName = displayName;
  await setDoc(doc(firestore, 'users', credential.user.uid), profile);
  return profile;
}

export async function signIn(email: string, password: string): Promise<UserProfile> {
  const { auth: firebaseAuth, db: firestore } = getFirebase();
  const credential = await signInWithEmailAndPassword(firebaseAuth, email, password);
  const profile = await getUserProfile(credential.user.uid);
  if (!profile) {
    const newProfile = createDefaultProfile(credential.user);
    await setDoc(doc(firestore, 'users', credential.user.uid), newProfile);
    return newProfile;
  }
  return profile;
}

export async function logOut(): Promise<void> {
  const { auth: firebaseAuth } = getFirebase();
  await signOut(firebaseAuth);
}

export async function resetPassword(email: string): Promise<void> {
  const { auth: firebaseAuth } = getFirebase();
  await sendPasswordResetEmail(firebaseAuth, email);
}

export async function getCurrentUser(): Promise<User | null> {
  const { auth: firebaseAuth } = getFirebase();
  return firebaseAuth.currentUser;
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  const { auth: firebaseAuth } = getFirebase();
  return onAuthStateChanged(firebaseAuth, callback);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const { db: firestore } = getFirebase();
  const docSnap = await getDoc(doc(firestore, 'users', uid));
  if (!docSnap.exists()) return null;
  return docSnap.data() as UserProfile;
}

export async function ensureUserProfile(uid: string): Promise<UserProfile> {
  const existing = await getUserProfile(uid);
  if (existing) return existing;

  const { auth: firebaseAuth, db: firestore } = getFirebase();
  const authUser = firebaseAuth.currentUser;
  if (!authUser || authUser.uid !== uid) {
    throw new Error('User profile not found. Please sign in again.');
  }

  const profile = createDefaultProfile(authUser);
  await setDoc(doc(firestore, 'users', uid), profile);
  return profile;
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const { db: firestore } = getFirebase();
  const userRef = doc(firestore, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await ensureUserProfile(uid);
  }
  await setDoc(userRef, updates, { merge: true });
}

export async function deleteUserAccount(uid: string): Promise<void> {
  const { auth: firebaseAuth, db: firestore } = getFirebase();
  await deleteDoc(doc(firestore, 'users', uid));
  const user = firebaseAuth.currentUser;
  if (user) await user.delete();
}

export function getSubscriptionStatus(profile: UserProfile): SubscriptionStatus {
  const now = Date.now();
  if (profile.subscriptionStatus === 'active' && profile.subscriptionExpiry && profile.subscriptionExpiry > now) {
    return 'active';
  }
  if (profile.subscriptionStatus === 'trial' && profile.trialEndDate > now) {
    return 'trial';
  }
  if (profile.trialEndDate > now) return 'trial';
  return 'expired';
}

export function canUseFeature(profile: UserProfile | null, _isPremiumMode = false): { allowed: boolean; reason?: string } {
  if (!profile) {
    return { allowed: false, reason: 'Please sign in to use Explain Like WhatsApp' };
  }

  const status = getSubscriptionStatus(profile);
  if (status === 'active') return { allowed: true };

  if (status === 'expired') {
    return { allowed: false, reason: 'Your trial has expired. Upgrade to continue!' };
  }

  const today = new Date().toISOString().split('T')[0];
  const count = profile.lastExplanationDate === today ? profile.dailyExplanationCount : 0;
  if (count >= FREE_DAILY_LIMIT) {
    return { allowed: false, reason: `Daily limit reached (${FREE_DAILY_LIMIT}/day). Upgrade for unlimited!` };
  }

  // Trial users get full access to all modes (including GenZ, Exam Notes, etc.)
  return { allowed: true };
}

export async function incrementUsageLocal(uid: string): Promise<void> {
  const { getLocalProfile, saveLocalProfile } = await import('@/services/storage/indexed-db');
  const profile = await getLocalProfile();
  if (!profile || profile.uid !== uid) return;

  const today = new Date().toISOString().split('T')[0];
  const isNewDay = profile.lastExplanationDate !== today;
  const dailyCount = profile.dailyExplanationCount as number;
  const newCount = isNewDay ? 1 : dailyCount + 1;

  let newStreak = profile.streak as number;
  if (isNewDay) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    newStreak = profile.lastExplanationDate === yesterdayStr ? (profile.streak as number) + 1 : 1;
  }

  await saveLocalProfile({
    ...profile,
    dailyExplanationCount: newCount,
    lastExplanationDate: today,
    streak: newStreak,
    longestStreak: Math.max(profile.longestStreak as number, newStreak),
    totalExplanations: (profile.totalExplanations as number) + 1,
  });
}

/** Sync local profile to Firestore — call from popup where user is authenticated */
export async function syncProfileToFirestore(uid: string): Promise<void> {
  const { getLocalProfile } = await import('@/services/storage/indexed-db');
  const local = await getLocalProfile();
  if (!local || local.uid !== uid) return;

  await updateUserProfile(uid, {
    dailyExplanationCount: local.dailyExplanationCount as number,
    lastExplanationDate: local.lastExplanationDate as string,
    streak: local.streak as number,
    longestStreak: local.longestStreak as number,
    totalExplanations: local.totalExplanations as number,
    onboardingComplete: local.onboardingComplete as boolean,
    preferredMode: local.preferredMode as UserProfile['preferredMode'],
  });
}

export async function saveExplanationHistorySafe(
  uid: string,
  record: { originalText: string; explanation: string; mode: string; url: string; pageTitle: string },
): Promise<void> {
  try {
    await saveExplanationHistory(uid, record);
  } catch {
    // History is optional — never block explanations
  }
}

export async function incrementUsage(uid: string): Promise<void> {
  const profile = (await getUserProfile(uid)) ?? (await ensureUserProfile(uid));

  const today = new Date().toISOString().split('T')[0];
  const isNewDay = profile.lastExplanationDate !== today;
  const newCount = isNewDay ? 1 : profile.dailyExplanationCount + 1;

  let newStreak = profile.streak;
  if (isNewDay) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    newStreak = profile.lastExplanationDate === yesterdayStr ? profile.streak + 1 : 1;
  }

  await updateUserProfile(uid, {
    dailyExplanationCount: newCount,
    lastExplanationDate: today,
    streak: newStreak,
    longestStreak: Math.max(profile.longestStreak, newStreak),
    totalExplanations: profile.totalExplanations + 1,
  });
}

export async function activateSubscription(
  uid: string,
  razorpaySubscriptionId: string,
  expiryDate: number,
): Promise<void> {
  await updateUserProfile(uid, {
    subscriptionStatus: 'active',
    subscriptionExpiry: expiryDate,
    razorpaySubscriptionId,
  });
}

export async function saveExplanationHistory(
  uid: string,
  record: { originalText: string; explanation: string; mode: string; url: string; pageTitle: string },
): Promise<void> {
  const { db: firestore } = getFirebase();
  await setDoc(doc(collection(firestore, 'users', uid, 'explanations')), {
    ...record,
    timestamp: serverTimestamp(),
  });
}

export async function getExplanationHistory(uid: string, limit = 50) {
  const { db: firestore } = getFirebase();
  const q = query(collection(firestore, 'users', uid, 'explanations'));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .slice(0, limit);
}

export async function sendOtpVerification(): Promise<void> {
  const user = await getCurrentUser();
  if (user && !user.emailVerified) {
    await sendEmailVerification(user);
  }
}

export { getFirebase };
