import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';

if (getApps().length === 0) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (projectId && clientEmail) {
      // Decode absolute verified Base64 private key string
      const base64Key = "LS0tLS1CRUdJTiBQUklWQVRFIEtFWS0tLS0tCk1JSUV2UUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktjd2dnU2pBZ0VBQW9JQkFRQ3BWcnViNnljbEdLWnkKaWJNZ2hUQkNnblJjOHJEWUpCazNtRlpzcXhMOGxrdTBRbzNLOUlsRURGQ3NxYmdCY2p3SGNKR01IMGtwV01nVwo5bXJ2ZytobHR6N2swTGl5RU9vNWs3NkZhOG51b1lQSmRYWkdiODVWdXZPRmdSTXY3WTRJT2UwNVkxTVdtYi9RClhjRW9QVGJidHpLWXBjN2orRGFvSUIwOWh2SmxJNHlxUThDRjBDdFZnWGN4U0d2eWYyRnRYa20yZmpkTVlQdVQKNURPSzJETStLb2dJRUE5VUtBQ0c2UitNa05NUnE5TDFQTXZVNGZwRlJaTjlEM3E5akVISmdLT3Rtc0I5ZHpTWgp1NTgwaGNUM1JnWjNsd2c5S05nYVMzSlFWTDMya3RLTUFpK2Fyand0SWJSTWpNZjlZUmJDMkRnVll2cDNmS20wCnR4bTN0SWhyQWdNQkFBRUNnZ0VBQ21pZXVZa1h3VFpRVjRQOVNGekhjdlIxSzBMRHBLclFzMVBLenRKK2VwdDcKdXhzZGYyeDVMMzlEbjRsWWI4WlNIWnhKWmYvYVRibjdwVHNFL0ZueStWQkNnOEFNbjVnSWt2ekdNNG52bDBVWQpSbFFtV1ZLd0JTR3JyRTRiSENhOFJKSFlSMThYNXJDNy9ldkt0QUFuUDJsMXFRcGF1dC9iN3Q1Tkl5WUlxamRqCjZRMUp1cnJMdHBuK1NOSFBmZlVyMnY5UkVucFdXOW9iM3RBcnM3cDU0UG0vRXgvRDIwZXc4WlNBalBnMU10ZDQKcW1zQjlVSDk5Mk12d041NTY2a2drenR5eDYyWlYrQlZJbFA1YVdrdTNSbFlOWUR1aysrSFp6R1pDUDQ2djFzZQpDSjdnSDlreTRONnhmeVNrdnNxK1pMMDAyQTcxZkIzV1FhUmRpSGhqaVFLQmdRRFVsZjVuQnZmWFNTckxsdllxCmhxTkpyeUhsQ0ZrRjNNWGNiR291RUhuRjVpT1duWjJIaEI2My83T1doT04vdVdEZFZLdmk5T0pKMmhnMTdsNEEKVHdDdUlMT1JYYnRPdGs1eXlWNTlKOHVTc3c0Y05oK1BuTlhGK2FvaDhWMGNiVWE1RUJNMzRIWE8wR3l2azV3SwpUelR5dVFVa2wxSUdRLzJ5dzBZNlR1SmVSUUtCZ1FETDY4YnJvMG9ON1czNnE3VHR2YXQzd1pmV1RKelRVK2t0CnRrcXZ0cHBRNklySTI2azZIQWM4U2NVNy82OWtEaXdiQmRKZEFZNW9hZXJzL0dNTXgwZHFTV2xHdTR0b3M5Ym4KZW1xVWFqd2phNVc4eU96Q0Ezb0d5blRiVy93ZC9rZXJMWi9vSEppalNsamo1aEswY0IzZlpTRHpncEhSMWtwTQo2clVkTmlmTzd3S0JnUURLQWc1UlVLbktoZGlJeGRiOTZocllOZmQ3Y0VkSDd0YUY4dStpL2p6NDlRdjBYNm9GCjBHSndiaWIxYlNuUmdSS3V2M3JtbTlVOFlHYUpPUTFTTmNCcnR0OXJ6eW5pVGhLVnVReDAyWS8wd3ZreGphekkKQnp5TWVBWlhZc2diN3lzNVNERTY4NngrN2tlWlFDY1RGTmszbk9GcU4vRFZ5MTRVdE1MVFBZcVdFUUtCZ0JLNAozZldLYzJVZDlHZjhWY3N5QzhrZDlCUFB5dUk0SlFOMlpoc0YxOXN2em5Zc2ZMZ0NGTVA3UGVtSlN4QVRvUWNHCkhNOC9NbFR4eklqZmp6U0FJMVZsMGcyVmNISTNlTGFkN2FVY3I5TE1zTjI1VU10clNFdlJVTE5IR2Jtak8rOUMKYkJrQ2J4MG0yVXhyTmpKc3pNRlM1cGlVMTFCOXJTcXNyZDQxdDZmdkFvR0FieG5sZnczNlRtK09xc0k0a1pLYgpsT2Y3QUdDTUFib05OVEtOV1RIOFNYY0didm5MRktDVWVVQkl0dlp6NjFsVmVNSEttMEl5NTN1VkpoOW1nV3B3ClRRZkhDOFNJUXg1eUVYenV0M2pDYVY3S1lRdDE1Nk5oeUVCZXA0dFpzcktLMnV0TW1vQ0xvYWlocDFPNUJWTkcKWnpqRy96cUJuMm4wWVFWDC5PXC0tLS0tRU5EIFBSSVZBVEUgS0VZLS0tLS0K";
      
      const cleanB64 = base64Key.replace(/[^A-Za-z0-9+/=]/g, "");
      const finalKey = Buffer.from(cleanB64, 'base64').toString('utf8');

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
