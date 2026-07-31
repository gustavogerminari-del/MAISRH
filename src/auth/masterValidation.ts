import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
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
  // Wait for Firebase Auth initialization if currentUser is initially null
  if (!auth.currentUser) {
    if (typeof (auth as any).authStateReady === 'function') {
      try {
        await (auth as any).authStateReady();
      } catch (e) {
        console.warn('Aviso ao aguardar authStateReady:', e);
      }
    } else {
      await new Promise<void>((resolve) => {
        let unsubscribe: (() => void) | null = null;
        const timer = setTimeout(() => {
          if (unsubscribe) unsubscribe();
          resolve();
        }, 1500);

        unsubscribe = onAuthStateChanged(auth, () => {
          clearTimeout(timer);
          if (unsubscribe) unsubscribe();
          resolve();
        });
      });
    }
  }

  const firebaseUser = auth.currentUser;
  let storedUser: any = null;
  try {
    const raw = localStorage.getItem('MAIS_RH_AUTH_USER');
    if (raw) storedUser = JSON.parse(raw);
  } catch (e) {}

  const activeEmail = (firebaseUser?.email || storedUser?.email || '').toLowerCase().trim();
  const activeUid = firebaseUser?.uid || storedUser?.id || storedUser?.uid || (activeEmail === 'gustavo.germinari@gmail.com' ? 'cTvCNCMkMnT09mhmfmMgDC6ZI133' : null);

  console.log('[MASTER AUTH CHECK]', {
    currentUser: firebaseUser ? firebaseUser.email : (storedUser ? storedUser.email : null),
    uid: activeUid,
    email: activeEmail,
    projectId: auth.app.options.projectId
  });

  if (!firebaseUser && !storedUser && !activeUid) {
    return {
      autorizado: false,
      motivo: 'Acesso negado: nenhum usuário autenticado no Firebase Authentication (currentUser is null)',
      uid: null,
      email: null,
      role: null,
      ativo: false,
      isMaster: false
    };
  }

  const isMasterEmail =
    activeEmail === 'gustavo.germinari@gmail.com' ||
    activeEmail === 'master@maisrh.com.br';

  const isStoredMaster =
    storedUser?.tipoUsuario === 'MASTER' ||
    storedUser?.role === 'MASTER' ||
    storedUser?.role === 'Super Administrador' ||
    storedUser?.isMaster === true;

  if (activeUid) {
    try {
      const userRef = doc(db, 'usuarios', activeUid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        const role = String(data.role || '').trim().toUpperCase();
        const tipoUsuario = String(data.tipoUsuario || '').trim().toUpperCase();

        const isMasterRole =
          role === 'MASTER' ||
          role === 'SUPER ADMINISTRADOR' ||
          role === 'SUPER_ADMIN' ||
          tipoUsuario === 'MASTER' ||
          tipoUsuario === 'SUPER_ADMIN' ||
          data.isMaster === true ||
          isMasterEmail ||
          isStoredMaster;

        const ativo = data.ativo !== false && data.status !== 'Inativo' && data.status !== 'Bloqueado';
        const autorizado = ativo && isMasterRole;

        return {
          autorizado,
          motivo: autorizado ? null : 'Acesso negado: perfil do usuário não possui permissão MASTER (role/tipoUsuario != MASTER)',
          uid: activeUid,
          email: activeEmail || data.email,
          role: role || tipoUsuario || 'MASTER',
          ativo,
          isMaster: isMasterRole
        };
      }
    } catch (err: any) {
      console.warn('Aviso ao consultar Firestore usuarios por UID em validarAcessoMaster:', err);
    }
  }

  if (isMasterEmail || isStoredMaster) {
    return {
      autorizado: true,
      motivo: null,
      uid: activeUid || 'cTvCNCMkMnT09mhmfmMgDC6ZI133',
      email: activeEmail || 'gustavo.germinari@gmail.com',
      role: 'MASTER',
      ativo: true,
      isMaster: true
    };
  }

  return {
    autorizado: false,
    motivo: `Acesso negado: perfil do usuário não localizado no Firestore (usuarios/${activeUid})`,
    uid: activeUid,
    email: activeEmail,
    role: storedUser?.role || null,
    ativo: false,
    isMaster: false
  };
}



