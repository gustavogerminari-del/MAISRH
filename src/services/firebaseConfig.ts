import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseAppletConfig from '../../firebase-applet-config.json';

// Configuration from firebase-applet-config.json for project rl-rh-f0127
export const firebaseConfig = {
  apiKey: (firebaseAppletConfig?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || '').trim(),
  authDomain: (firebaseAppletConfig?.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim(),
  projectId: (firebaseAppletConfig?.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim(),
  storageBucket: (firebaseAppletConfig?.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim(),
  messagingSenderId: (firebaseAppletConfig?.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim(),
  appId: (firebaseAppletConfig?.appId || import.meta.env.VITE_FIREBASE_APP_ID || '').trim(),
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
  } else {
    console.log('✅ [Firebase Config] Inicializado com sucesso para o projeto:', firebaseConfig.projectId);
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
const firestoreDatabaseId = (firebaseAppletConfig as any)?.firestoreDatabaseId || (import.meta as any).env?.VITE_FIREBASE_DATABASE_ID;
export const db: Firestore = firestoreDatabaseId ? getFirestore(app, firestoreDatabaseId) : getFirestore(app);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);

// Configure browser persistence to keep user session logged in across tab refresh/reopens
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Aviso ao configurar persistência de Auth:', err);
});

export default app;
