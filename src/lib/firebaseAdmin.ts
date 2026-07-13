import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';

if (getApps().length === 0) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
      // Reconstruct credentials from direct individual environment variables
      const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey,
        }),
      });
      console.log('Firebase Admin SDK initialized successfully from individual environment variables.');
    } else {
      // Fallback to local file for development
      const serviceAccountPath = path.join(process.cwd(), '../firebase_admin_key.json');
      initializeApp({
        credential: cert(serviceAccountPath),
      });
      console.log('Firebase Admin SDK initialized successfully from local file.');
    }
  } catch (error) {
    console.error('Firebase Admin SDK initialization failed:', error);
  }
}

export const adminMessaging = getMessaging();
export const adminAuth = getAuth();
