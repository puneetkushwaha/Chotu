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
      // Reconstruct private key using JSON parsing to preserve exact formatting
      const rawPrivateKey = "-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCpVrub6yclGKZy\\nibMghTBCgnRc8rDYJBk3mFZsqxL8lku0Qo3K9IlEDFCsqbgBcjwHcJGMH0kpWMgW\\n9mrvg+hltz7k0LiyEOo5k76Fa8nuoYPJdXZGb85VuvOFgRMv7Y4IOe05Y1MWmb/Q\\nXcEoPTbbtzKYpc7j+DaoIB09hvJlI4yqQ8CF0CtVgXcxSGvyf2FtXkm2fjdMYPuT\\n5DOK2DM+KogIEA9UKACG6R+MkNMRq9L1PMvU4fpFRZN9D3q9jEHJgKOtmsB9dzSZ\\nu580hcT3RgZ3lwg9KNgaS3JQVL32ktKMAi+arjwtIbRMjMf9YRbC2DgVYvp3fKm0\\ntxm3tIhrAgMBAAECggEACmieuYkXwTZQV4P9SFzHcvR1K0LDpKrQs1PKztJ+ept7\\nuxsdf2x5L39Dn4lYb8ZSHZxJZf/aTbn7pTsE/Fny+VBCg8AMn5gIkvzGM4nvl0UY\\nRlQmWVKwBSGrrE4bHCa8RJHYR18X5rC7/evKtAAnP2l1qQpaut/b7t5NIyYIqjdj\\n6Q1JurrLtpn+SNHPffUr2v9REnpWW9ob3tArs7p54Pm/Ex/D20ew8ZSAjPg1Mtd4\\nqmsB9UH992MvwN5566kgkztyx62ZV+BVIlP5aWku3RlYNYDuk++HZzGZCP46v1se\\nCJ7gH9ky4N6xfySkvsq+ZL002A71fB3WQaRdiHhjiQKBgQDUlf5nBvfXSSrLlvYq\\nhqNJryHlCFkF3MXcbGouEHnF5iOWnZ2HhB63/7OWhON/uWDdVKvi9OJJ2hg17l4A\\nTwCuILORXbtOtk5yyV59J8uSsw4cNh+PnNXF+aoh8V0cbUa5EBM34HXO0Gyvk5wK\\nTzTyuQUkl1IGQ/2yw0Y6TuJeRQKBgQDL68bro0oN7W36q7Ttvat3wZfWTJzTU+kt\\ntkqvtppQ6IrI26k6HAc8ScU7/69kDiwbBdJdAY5oaers/GMMx0dqSWlGu4tos9bn\\nemqUajwja5W8yOzCA3oGynTbW/wd/kerLZ/oHJijSljj5hK0cB3fZSDzgpHR1kpM\\n6rUdNifO7wKBgQDKAg5RUKnKhdiIxdb96hrYNfd7cEdH7taF8u+i/jz49Qv0X6oF\\n0GJwbib1bSnRgRKuv3rmm9U8YGaJOQ1SNcBrtt9rzyniThKVuQx02Y/0wvkxjazI\\nBzyMeAZXYsgb7ys5SDE686x+7keZQCcTFNk3nOFqN/DVy14UtMLTPYqWEQKBgBK4\\n3fWKc2Ud9Gf8VcsyC8kd9BPPyuI4JQN2ZhsF19svznYsfLgCFMP7PemJSxAToQcG\\nM8/MlTxzIjfjzSAI1Vl0g2VcHI3eLad7aUcr9LMsN25UMtrSEvRULNHGbmjO+9C\\nbBkCbx0m2UxrNjJszMFS5piU11B9rSqsrd41t6fvAoGAbxnlfw36Tm+OqsI4kZKb\\nlOf7AGCMAboNNTKNWTH8SXcGbvnLFKCUeUBItvZz61lVeMHKm0Iy53uVJh9mgWpw\\nTQfHC8SIQx5yEXzut3jCaV7KYQt156NhyEBep4tZsrKK2utMmoCLoaihp1O5BVNG\\nZzjG/zqBn2n0YQVDC9P/jXM=\\n-----END PRIVATE KEY-----\\n";
      const finalKey = JSON.parse(`"${rawPrivateKey}"`);

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
