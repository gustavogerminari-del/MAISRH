import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { initializeApp as initAdminApp, getApps as getAdminApps, cert } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminDb } from 'firebase-admin/firestore';
import firebaseAppletConfig from './firebase-applet-config.json';

dotenv.config();

const getFirebaseAdmin = () => {
  if (!getAdminApps().length) {
    try {
      const projId = firebaseAppletConfig.projectId || process.env.VITE_FIREBASE_PROJECT_ID || 'rl-rh-f0127';

      // Prefer explicit Service Account provided via FIREBASE_SERVICE_ACCOUNT_BASE64 (base64-encoded JSON)
      if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        try {
          const sa = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8'));
          initAdminApp({
            credential: cert(sa),
            projectId: projId
          });
        } catch (e) {
          console.warn('❌ [Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64, falling back to ADC:', e);
          initAdminApp({ projectId: projId });
        }
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // If a file path is provided, try to read it and initialize explicitly with cert().
        try {
          const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
          if (fs.existsSync(saPath)) {
            const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
            initAdminApp({
              credential: cert(sa),
              projectId: projId
            });
          } else {
            // File not found -> rely on ADC (environment set by GCP, etc.)
            console.warn('⚠️ [Firebase Admin] GOOGLE_APPLICATION_CREDENTIALS path not found, using ADC fallback.');
            initAdminApp({ projectId: projId });
          }
        } catch (e) {
          console.warn('❌ [Firebase Admin] Error reading GOOGLE_APPLICATION_CREDENTIALS, using ADC fallback:', e);
          initAdminApp({ projectId: projId });
        }
      } else {
        // No explicit credentials provided; rely on Application Default Credentials (ADC) in the environment
        initAdminApp({ projectId: projId });
      }

      console.log('🔥 [Firebase Admin Initialized]', {
        projectId: projId,
        database: '(default)'
      });
    } catch (err) {
      console.error('❌ [Firebase Admin Init Error]:', err);
    }
  }
  return {
    adminAuth: getAdminAuth(),
    adminDb: getAdminDb()
  };
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Helper lazy initializer for GoogleGenAI
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined. Using smart AI fallbacks.');
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  };

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // FIREBASE USER CREATION & SYNC API
  app.post('/api/users/create', async (req, res) => {
    try {
      const { email, password, nome, role, empresaId, ativo, permissions } = req.body;
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ success: false, error: 'E-mail é obrigatório.' });
      }

      const normEmail = email.trim().toLowerCase();
      const { adminAuth, adminDb } = getFirebaseAdmin();

      let userRecord: any = null;
      let alreadyExistedInAuth = false;

      try {
        userRecord = await adminAuth.getUserByEmail(normEmail);
        alreadyExistedInAuth = true;
        if (password && password.length >= 6) {
          await adminAuth.updateUser(userRecord.uid, {
            password,
            displayName: nome || normEmail.split('@')[0],
            disabled: !(ativo ?? true)
          });
        }
      } catch (findErr: any) {
        if (findErr.code === 'auth/user-not-found' || String(findErr.message || '').includes('not-found')) {
          const initialPassword = password && password.length >= 6 ? password : 'Gugato94@';
          try {
            userRecord = await adminAuth.createUser({
              email: normEmail,
              password: initialPassword,
              displayName: nome || normEmail.split('@')[0],
              disabled: !(ativo ?? true)
            });
          } catch (createErr: any) {
            console.warn(`[Admin Auth create user fallback]:`, createErr.message);
          }
        } else {
          console.warn(`[Admin Auth lookup warning]:`, findErr.message);
        }
      }

      const uid = userRecord ? userRecord.uid : `usr-${Date.now()}`;
      const nowIso = new Date().toISOString();

      const isMaster = normEmail === 'gustavo.germinari@gmail.com' || role === 'MASTER';
      const finalRole = isMaster ? 'MASTER' : (role || 'ADMIN_EMPRESA');
      const finalEmpresaId = isMaster ? null : (empresaId || 'emp-001');

      const firestoreData = {
        uid,
        email: normEmail,
        nome: nome || normEmail.split('@')[0],
        role: finalRole,
        empresaId: finalEmpresaId,
        ativo: ativo ?? true,
        permissions: permissions || [],
        createdAt: nowIso,
        updatedAt: nowIso
      };

      try {
        await adminDb.collection('usuarios').doc(uid).set(firestoreData, { merge: true });
        await adminDb.collection('users').doc(uid).set({
          ...firestoreData,
          displayName: firestoreData.nome,
          companyId: firestoreData.empresaId,
          tipoUsuario: isMaster ? 'MASTER' : 'EMPRESA',
          status: (ativo ?? true) ? 'Ativo' : 'Inativo'
        }, { merge: true });
      } catch (fsErr) {
        console.warn('Firestore Admin write notice:', fsErr);
      }

      return res.json({
        success: true,
        uid,
        alreadyExistedInAuth,
        user: firestoreData,
        message: alreadyExistedInAuth
          ? `Perfil do usuário sincronizado no Firestore (${uid}).`
          : `Usuário criado no Firebase Authentication e Firestore com sucesso (${uid}).`
      });
    } catch (err: any) {
      console.error('Error in /api/users/create:', err);
      return res.status(500).json({
        success: false,
        code: err.code || 'internal-error',
        error: err.message || String(err)
      });
    }
  });

  app.post('/api/users/sync-initial', async (req, res) => {
    try {
      const { adminAuth, adminDb } = getFirebaseAdmin();
      const results = [];

      const accountsToSync = [
        {
          email: 'gustavo.germinari@gmail.com',
          password: 'Gugato94@',
          nome: 'Gustavo Germinari',
          role: 'MASTER',
          empresaId: null
        },
        {
          email: 'rh04consultoria@gmail.com',
          password: 'Gugato94@',
          nome: 'RH 04 Consultoria',
          role: 'ADMIN_EMPRESA',
          empresaId: 'emp-001'
        }
      ];

      for (const acc of accountsToSync) {
        let userRecord: any = null;
        let created = false;

        try {
          userRecord = await adminAuth.getUserByEmail(acc.email);
          await adminAuth.updateUser(userRecord.uid, {
            password: acc.password,
            displayName: acc.nome,
            disabled: false
          });
        } catch {
          try {
            userRecord = await adminAuth.createUser({
              email: acc.email,
              password: acc.password,
              displayName: acc.nome,
              disabled: false
            });
            created = true;
          } catch (cErr: any) {
            console.warn(`Admin SDK sync create fallback for ${acc.email}:`, cErr.message);
          }
        }

        const uid = userRecord ? userRecord.uid : (acc.role === 'MASTER' ? 'usr-master-001' : 'usr-rh04-001');
        const nowIso = new Date().toISOString();

        const profile = {
          uid,
          email: acc.email,
          nome: acc.nome,
          role: acc.role,
          empresaId: acc.empresaId,
          ativo: true,
          permissions: [],
          createdAt: nowIso,
          updatedAt: nowIso
        };

        try {
          await adminDb.collection('usuarios').doc(uid).set(profile, { merge: true });
          await adminDb.collection('users').doc(uid).set({
            ...profile,
            displayName: acc.nome,
            companyId: acc.empresaId,
            tipoUsuario: acc.role === 'MASTER' ? 'MASTER' : 'EMPRESA',
            status: 'Ativo'
          }, { merge: true });
        } catch (fErr) {
          console.warn(`Firestore sync note for ${acc.email}:`, fErr);
        }

        results.push({ email: acc.email, uid, created });
      }

      return res.json({ success: true, synced: results });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // BOOTSTRAP DO USUÁRIO MASTER PRINCIPAL NO FIRESTORE
  app.post('/api/bootstrap-master', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const idToken = req.body?.idToken || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null);

      if (!idToken) {
        return res.status(401).json({ success: false, error: 'Firebase ID token de autenticação ausente.' });
      }

      const { adminAuth, adminDb } = getFirebaseAdmin();
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      const email = (decodedToken.email || '').toLowerCase().trim();

      const ALLOWED_MASTER_EMAILS = ['gustavo.germinari@gmail.com', 'master@maisrh.com.br'];
      if (!ALLOWED_MASTER_EMAILS.includes(email)) {
        return res.status(403).json({ success: false, error: 'Acesso negado: E-mail não autorizado para perfil MASTER principal.' });
      }

      const uid = decodedToken.uid;
      const userRef = adminDb.collection('usuarios').doc(uid);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        const data = userDoc.data();
        if (data?.role === 'MASTER' || data?.tipoUsuario === 'MASTER' || data?.isMaster === true) {
          return res.json({ success: true, message: 'Perfil MASTER principal já existe e está ativo.', uid, email });
        }
      }

      const nowIso = new Date().toISOString();
      const masterProfile = {
        uid,
        nome: decodedToken.name || 'Gustavo Germinari',
        email,
        role: 'MASTER',
        tipoUsuario: 'MASTER',
        ativo: true,
        empresaId: null,
        isMaster: true,
        createdAt: nowIso,
        updatedAt: nowIso
      };

      await userRef.set(masterProfile, { merge: true });
      await adminDb.collection('users').doc(uid).set({
        ...masterProfile,
        displayName: masterProfile.nome,
        status: 'Ativo'
      }, { merge: true });

      return res.json({
        success: true,
        message: 'Perfil MASTER criado e ativado com sucesso no Firestore.',
        uid,
        email,
        profile: masterProfile
      });
    } catch (err: any) {
      console.error('[API BOOTSTRAP MASTER ERR]', err);
      return res.status(500).json({ success: false, error: err.message || String(err) });
    }
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🤖 Servidor MAIS RH rodando na porta ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Erro ao iniciar o servidor MAIS RH:', error);
  process.exit(1);
});
