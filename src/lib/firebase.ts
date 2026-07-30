import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import firebaseAppletConfig from '../../firebase-applet-config.json';

const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('🔥 [Firebase Config Error] Configuração do Firebase incompleta:', firebaseConfig);
}

export const firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Always use standard default database getFirestore(firebaseApp)
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
export const storage = getStorage(firebaseApp);

if (metaEnv.DEV) {
  console.log('🔥 [Firebase Frontend Init]', {
    projectId: firebaseConfig.projectId,
    database: '(default)',
    env: metaEnv.MODE,
  });
}

// Test initial connection & diagnose
async function testConnection() {
  try {
    await getDocFromServer(doc(db, '_health', 'connection'));
    console.log('✅ [Firestore Connection] Conexão com banco (default) estabelecida com sucesso.');
  } catch (error: any) {
    const msg = error?.message || String(error);
    if (msg.includes("Database '(default)' not found") || msg.includes('not found')) {
      console.error('❌ [Firestore Critical] O banco de dados (default) não foi encontrado no projeto Firebase.');
    } else if (msg.includes('permission-denied') || msg.includes('Missing or insufficient permissions')) {
      console.warn('⚠️ [Firestore Warning] Permissão negada para checagem de saúde.');
    } else if (msg.includes('offline') || msg.includes('unreachable')) {
      console.warn('⚠️ [Firestore Warning] Conexão Firestore temporariamente indisponível.');
    } else {
      console.warn('⚠️ [Firestore Diagnostics]', msg);
    }
  }
}
testConnection();

