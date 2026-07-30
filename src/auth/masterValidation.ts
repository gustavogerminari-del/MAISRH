import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface MasterValidationResult {
  autorizado: boolean;
  motivo: string | null;
  uid?: string | null;
  email?: string | null;
  role?: string | null;
  ativo?: boolean | null;
  isMaster?: boolean | null;
}

export async function validarAcessoMaster(): Promise<MasterValidationResult> {
  const firebaseUser = auth.currentUser;

  console.log('[MASTER AUTH CHECK]', {
    currentUser: firebaseUser,
    uid: firebaseUser?.uid,
    email: firebaseUser?.email,
    projectId: auth.app.options.projectId
  });

  if (!firebaseUser) {
    return {
      autorizado: false,
      motivo: 'firebase-user-null'
    };
  }

  const userRef = doc(db, 'usuarios', firebaseUser.uid);
  let userSnap = await getDoc(userRef);

  const emailLower = (firebaseUser.email || '').toLowerCase().trim();
  const isMasterAccount = 
    emailLower === 'gustavo.germinari@gmail.com' ||
    emailLower === 'master@maisrh.com.br';

  if (!userSnap.exists() && isMasterAccount) {
    console.log('[MASTER AUTO-CREATE] Bootstrap do documento MASTER em usuarios/' + firebaseUser.uid);
    try {
      const masterProfile = {
        uid: firebaseUser.uid,
        nome: firebaseUser.displayName || 'Gustavo Germinari',
        email: firebaseUser.email,
        role: 'MASTER',
        tipoUsuario: 'MASTER',
        ativo: true,
        empresaId: null,
        isMaster: true,
        updatedAt: serverTimestamp()
      };
      await setDoc(userRef, masterProfile, { merge: true });
      userSnap = await getDoc(userRef);
    } catch (err) {
      console.error('[MASTER AUTO-CREATE ERR]', err);
    }
  }

  if (!userSnap.exists()) {
    return {
      autorizado: false,
      motivo: 'perfil-firestore-nao-encontrado'
    };
  }

  const data = userSnap.data();

  const role = String(
    data.role ||
    data.tipoUsuario ||
    ''
  ).trim().toUpperCase();

  const autorizado =
    data.ativo === true &&
    (
      role === 'MASTER' ||
      role === 'SUPER ADMINISTRADOR' ||
      role === 'SUPER_ADMIN' ||
      data.isMaster === true
    );

  return {
    autorizado,
    motivo: autorizado ? null : 'perfil-sem-permissao-master',
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    role,
    ativo: data.ativo,
    isMaster: data.isMaster
  };
}
