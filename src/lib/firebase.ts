// Client-side Firebase config for the Chotu customer website
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBlaKIqDS15uSbSeRLDCSzuc5KFv2EgUdg",
  authDomain: "chotu-4d1e0.firebaseapp.com",
  projectId: "chotu-4d1e0",
  storageBucket: "chotu-4d1e0.firebasestorage.app",
  messagingSenderId: "947976549226",
  appId: "1:947976549226:android:bf8ee7d1e2371a3984eb13",
};

// Singleton initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/**
 * Returns the FCM messaging instance (only in browser).
 */
export function getFirebaseMessaging() {
  if (typeof window === 'undefined') return null;
  return getMessaging(app);
}

/**
 * Requests notification permission and returns the FCM token.
 * Registers the service worker for background push.
 */
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('[FCM] Notifications not supported in this environment.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[FCM] Notification permission denied.');
      return null;
    }

    const messaging = getFirebaseMessaging();
    if (!messaging) return null;

    const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const token = await getToken(messaging, {
      serviceWorkerRegistration: swReg,
    });

    console.log('[FCM Web] Token:', token);
    return token;
  } catch (err) {
    console.error('[FCM Web] Error getting token:', err);
    return null;
  }
}

/**
 * Listen to foreground messages on the web.
 */
export function onForegroundMessage(callback: (payload: unknown) => void) {
  const messaging = getFirebaseMessaging();
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
}
