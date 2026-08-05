import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function normalizePrivateKey(value?: string): string | undefined {
  if (!value) return undefined;
  return value.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing env vars for Firebase Admin');
  process.exit(1);
}

const adminApp = getApps().length > 0
  ? getApps()[0]
  : initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId
    });

const adminDb = getFirestore(adminApp);

async function inspect() {
  const docs = [
    { coll: 'empresa_modulos', id: 't-1785934776942' },
    { coll: 'empresas', id: 't-1785934776942' },
    { coll: 'users', id: 'MIGh7QKAAIZslRG76wfaXdmbysV2' },
    { coll: 'usuarios', id: 'MIGh7QKAAIZslRG76wfaXdmbysV2' },
  ];

  for (const item of docs) {
    console.log(`\n========================================`);
    console.log(`CONSULTANDO: ${item.coll}/${item.id}`);
    try {
      const snap = await adminDb.collection(item.coll).doc(item.id).get();
      if (!snap.exists) {
        console.log(`STATUS: NÃO EXISTE (snap.exists = false)`);
      } else {
        const data = snap.data();
        console.log(`STATUS: EXISTE`);
        console.log(`empresaId:`, data.empresaId);
        console.log(`companyId:`, data.companyId);
        console.log(`modules:`, data.modules);
        console.log(`modulos:`, data.modulos);
        console.log(`role:`, data.role);
        console.log(`ativo:`, data.ativo);
        console.log(`status:`, data.status);

        const directBooleans: Record<string, boolean> = {};
        for (const [k, v] of Object.entries(data)) {
          if (typeof v === 'boolean') {
            directBooleans[k] = v;
          }
        }
        console.log(`campos booleanos diretos:`, directBooleans);
        console.log(`DATA COMPLETA:`, JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      console.error(`ERRO AO BUSCAR ${item.coll}/${item.id}:`, err?.message || err);
    }
  }
}

inspect();
