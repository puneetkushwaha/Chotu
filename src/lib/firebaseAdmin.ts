import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';

const serviceAccountPath = path.join(process.cwd(), '../firebase_admin_key.json');

if (getApps().length === 0) {
  try {
    initializeApp({
      credential: cert(serviceAccountPath),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Firebase Admin SDK initialization failed:', error);
  }
}

export const adminMessaging = getMessaging();
export const adminAuth = getAuth();
