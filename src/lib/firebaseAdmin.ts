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
      // Decode private key from Base64 to bypass escape/newline formatting issues
      let cleanedKey = privateKey.trim();
      
      // Strip outer quotes if present in env var
      if (cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) {
        cleanedKey = cleanedKey.slice(1, -1);
      }
      if (cleanedKey.startsWith("'") && cleanedKey.endsWith("'")) {
        cleanedKey = cleanedKey.slice(1, -1);
      }

      // Check if it's base64 encoded, then decode
      let finalKey = cleanedKey;
      if (!cleanedKey.includes('-----BEGIN PRIVATE KEY-----')) {
        try {
          const buffer = Buffer.from(cleanedKey, 'base64');
          finalKey = buffer.toString('utf8');
        } catch (e) {
          console.error('Failed to decode Base64 private key, using raw value:', e);
        }
      }

      // Final format replace just in case of non-base64 fallback
      finalKey = finalKey.replace(/\\n/g, '\n');
      
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: finalKey,
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
