import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseAppletConfig from '../../firebase-applet-config.json';

const metaEnv = (import.meta as any).env || {};

const getApiKey = (): string => {
  const envKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.startsWith('AIza')) {
    return envKey.trim();
  }
  if (firebaseAppletConfig?.apiKey && firebaseAppletConfig.apiKey.startsWith('AIza')) {
    return firebaseAppletConfig.apiKey.trim();
  }
  return firebaseAppletConfig?.apiKey || '';
};

const getVal = (envKey: string | undefined, configKey: string | undefined): string => {
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 0 && envKey !== 'undefined' && !envKey.includes('MY_FIREBASE')) {
    return envKey.trim();
  }
  if (configKey && typeof configKey === 'string' && configKey.trim().length > 0) {
    return configKey.trim();
  }
  return '';
};

export const firebaseConfig = {
  apiKey: getApiKey(),
  authDomain: getVal(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, firebaseAppletConfig?.authDomain),
  projectId: getVal(import.meta.env.VITE_FIREBASE_PROJECT_ID, firebaseAppletConfig?.projectId),
  storageBucket: getVal(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, firebaseAppletConfig?.storageBucket),
  messagingSenderId: getVal(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, firebaseAppletConfig?.messagingSenderId),
  appId: getVal(import.meta.env.VITE_FIREBASE_APP_ID, firebaseAppletConfig?.appId),
};

/**
 * Validates whether all required Firebase configuration keys are provided.
 */
export function validateFirebaseConfig(): { valid: boolean; missingKeys: string[] } {
  const requiredKeys: (keyof typeof firebaseConfig)[] = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);

  if (missingKeys.length > 0) {
    console.error(
      `🔥 [Firebase Config Error] As seguintes chaves de configuração do Firebase estão ausentes: ${missingKeys.join(
        ', '
      )}`
    );
  }

  return {
    valid: missingKeys.length === 0,
    missingKeys,
  };
}

// Run validation upon module import
validateFirebaseConfig();

// Initialize or get existing Firebase App
export const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

export const firebaseApp: FirebaseApp = app;

// Initialize services
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);

export default app;
