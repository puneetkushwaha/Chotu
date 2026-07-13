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
      let cleanedKey = privateKey.trim();
      
      // Strip outer quotes if present in env var
      if (cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) {
        cleanedKey = cleanedKey.slice(1, -1);
      }
      if (cleanedKey.startsWith("'") && cleanedKey.endsWith("'")) {
        cleanedKey = cleanedKey.slice(1, -1);
      }

      console.log(`[Firebase Init] Key Length: ${cleanedKey.length}, Base64 structure: ${cleanedKey.substring(0, 15)}...`);

      // Check if it's base64 encoded, then decode
      let finalKey = cleanedKey;
      if (!cleanedKey.includes('-----BEGIN PRIVATE KEY-----')) {
        try {
          const buffer = Buffer.from(cleanedKey, 'base64');
          finalKey = buffer.toString('utf8');
          console.log(`[Firebase Init] Base64 Decoded successfully. New length: ${finalKey.length}`);
        } catch (e) {
          console.error('[Firebase Init] Failed to decode Base64 private key:', e);
        }
      } else {
        console.log('[Firebase Init] Key detected as raw text (contains header)');
      }

      // Final format replace just in case of non-base64 fallback
      finalKey = finalKey.replace(/\\n/g, '\n');
      
      console.log(`[Firebase Init] Final Key Starts with: ${finalKey.substring(0, 30)}`);

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: finalKey,
        }),
      });
      console.log('Firebase Admin SDK initialized successfully.');
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
