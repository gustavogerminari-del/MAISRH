import { doc, getDocFromServer } from 'firebase/firestore';
import {
  app as firebaseApp,
  db,
  auth,
  storage,
  firebaseConfig,
} from '../services/firebaseConfig';

export { firebaseApp, db, auth, storage, firebaseConfig };

const metaEnv = (import.meta as any).env || {};

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


