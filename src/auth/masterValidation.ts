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

  let firebaseUser = auth.currentUser;

  console.log('[MASTER AUTH CHECK]', {
    currentUser: firebaseUser,
    uid: firebaseUser?.uid,
    email: firebaseUser?.email,
    projectId: auth.app.options.projectId
  });

  // Read active session from AuthContext local storage if available
  const savedUserStr = localStorage.getItem('MAIS_RH_AUTH_USER');
  let localUser: any = null;
  if (savedUserStr) {
    try {
      localUser = JSON.parse(savedUserStr);
    } catch (err) {
      console.warn('Erro ao ler usuario local no masterValidation:', err);
    }
  }

  // Case 1: Firebase Auth User exists
  if (firebaseUser) {
    try {
      const userRef = doc(db, 'usuarios', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      const emailLower = (firebaseUser.email || localUser?.email || '').toLowerCase().trim();
      const isMasterEmail =
        emailLower === 'gustavo.germinari@gmail.com' ||
        emailLower === 'master@maisrh.com.br';

      if (!userSnap.exists()) {
        if (isMasterEmail) {
          return {
            autorizado: true,
            motivo: null,
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'MASTER',
            ativo: true,
            isMaster: true
          };
        }
        return {
          autorizado: false,
          motivo: 'Perfil não encontrado',
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: null,
          ativo: false,
          isMaster: false
        };
      }

      const data = userSnap.data();
      const role = String(data.role || data.tipoUsuario || '').trim().toUpperCase();
      const isMasterRole =
        role === 'MASTER' ||
        role === 'SUPER ADMINISTRADOR' ||
        role === 'SUPER_ADMIN' ||
        data.isMaster === true ||
        isMasterEmail;

      const ativo = data.ativo ?? true;
      const autorizado = ativo && isMasterRole;

      return {
        autorizado,
        motivo: autorizado ? null : 'Perfil sem permissão MASTER',
        uid: firebaseUser.uid,
        email: firebaseUser.email || data.email,
        role: role || 'N/A',
        ativo,
        isMaster: isMasterRole
      };
    } catch (err: any) {
      console.error('Erro ao consultar Firestore usuarios:', err);
      // Fallback check for master email if Firestore query throws permission error
      const emailLower = (firebaseUser.email || '').toLowerCase().trim();
      if (emailLower === 'gustavo.germinari@gmail.com' || emailLower === 'master@maisrh.com.br') {
        return {
          autorizado: true,
          motivo: null,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: 'MASTER',
          ativo: true,
          isMaster: true
        };
      }

      return {
        autorizado: false,
        motivo: `Erro ao consultar Firestore: ${err?.message || String(err)}`,
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        role: null,
        ativo: false,
        isMaster: false
      };
    }
  }

  // Case 2: No Firebase Auth user, but local authenticated session exists
  if (localUser) {
    const emailLower = (localUser.email || '').toLowerCase().trim();
    const isMasterSession =
      localUser.role === 'Super Administrador' ||
      localUser.tipoUsuario === 'MASTER' ||
      localUser.isMaster === true ||
      emailLower === 'gustavo.germinari@gmail.com' ||
      emailLower === 'master@maisrh.com.br';

    if (isMasterSession) {
      return {
        autorizado: true,
        motivo: null,
        uid: localUser.id || 'master-local',
        email: localUser.email,
        role: localUser.role || 'MASTER',
        ativo: true,
        isMaster: true
      };
    }
  }

  // Case 3: No user authenticated
  return {
    autorizado: false,
    motivo: 'Usuário não autenticado',
    uid: null,
    email: null,
    role: null,
    ativo: false,
    isMaster: false
  };
}



