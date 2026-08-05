import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

const app = initializeApp(config);
const db = getFirestore(app);
const auth = getAuth(app);

async function inspect() {
  // Let's try signing in if possible or reading directly
  console.log('Firebase client initialized.');

  // Check if we can sign in or read
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
      const snap = await getDoc(doc(db, item.coll, item.id));
      if (!snap.exists()) {
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
