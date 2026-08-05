import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

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

async function fixCompanyDoc() {
  const empresaId = 't-1785934776942';
  const ref = adminDb.collection('empresa_modulos').doc(empresaId);
  const snap = await ref.get();

  if (!snap.exists) {
    console.error(`Documento empresa_modulos/${empresaId} não existe!`);
    return;
  }

  const data = snap.data() || {};
  const existingModulos = data.modulos || data.modules || {};

  // Build normalized modules map keeping existing true/false values
  const modulesMap = {
    vagas: existingModulos.vagas ?? true,
    candidatos: existingModulos.candidatos ?? true,
    bancoTalentos: existingModulos.bancoTalentos ?? true,
    entrevistas: existingModulos.entrevistas ?? true,
    contratacoes: existingModulos.contratacoes ?? true,
    headhunter: existingModulos.headhunter ?? false,
    financeiroHeadhunter: existingModulos.financeiroHeadhunter ?? false,
    departamentoPessoal: existingModulos.departamentoPessoal ?? true,
    funcionarios: existingModulos.funcionarios ?? true,
    pontoEletronico: existingModulos.pontoEletronico ?? true,
    folhaPagamento: existingModulos.folhaPagamento ?? true,
    feriasBeneficios: existingModulos.feriasBeneficios ?? true,
    documentos: existingModulos.documentos ?? true,
    siteVagas: existingModulos.siteVagas ?? true,
    relatorios: existingModulos.relatorios ?? true,
    consultorRH: existingModulos.consultorRH ?? true,
    api: existingModulos.api ?? true,
    configuracoes: existingModulos.configuracoes ?? true,
    auditoria: existingModulos.auditoria ?? true,
    dashboard: existingModulos.dashboard ?? true,
    admissao: existingModulos.admissao ?? true,
    clientes: existingModulos.clientes ?? false,
    comercial: existingModulos.comercial ?? false,
    relatoriosAvancados: existingModulos.relatoriosAvancados ?? true,
    siteVagasPersonalizado: existingModulos.siteVagasPersonalizado ?? true,
    documentosAssinatura: existingModulos.documentosAssinatura ?? true,
    equipeInterna: existingModulos.equipeInterna ?? true
  };

  const updateData = {
    empresaId,
    companyId: empresaId,
    modules: modulesMap,
    modulos: modulesMap,
    updatedAt: FieldValue.serverTimestamp()
  };

  await ref.set(updateData, { merge: true });
  console.log('✅ Documento empresa_modulos/t-1785934776942 atualizado com sucesso!');

  // Also check if empresas/t-1785934776942 needs update
  const empRef = adminDb.collection('empresas').doc(empresaId);
  const empSnap = await empRef.get();
  if (empSnap.exists) {
    await empRef.set({
      empresaId,
      companyId: empresaId,
      rawTenantData: {
        ...(empSnap.data()?.rawTenantData || {}),
        modules: modulesMap
      }
    }, { merge: true });
    console.log('✅ Documento empresas/t-1785934776942 atualizado com sucesso!');
  }
}

fixCompanyDoc().catch(err => {
  console.error('Erro ao atualizar documento:', err);
});
