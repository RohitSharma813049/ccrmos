import { getApps, initializeApp, cert } from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';

if (!getApps().length) {
  try {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountBase64) {
      const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));
      initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      console.warn("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const adminMessaging = getApps().length ? getMessaging() : null;