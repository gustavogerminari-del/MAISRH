import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { sanitizeFirestoreData } from '../lib/firestoreUtils';

export interface SystemModule {
  id: string;
  key: string;
  nome: string;
  descricao: string;
  icone: string;
  categoria: string;
  ativo: boolean;
  ordem: number;
  rota?: string;
  comercializavel?: boolean;
  precoAdicional?: number;
  gratuito?: boolean;
  enterprise?: boolean;
  planosDisponiveis?: string[];
  permissions?: string[];
  dependencias?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface PlanConfig {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  modulos: string[];
  limites: {
    usuarios: number;
    vagas: number;
    colaboradores?: number;
  };
  updatedAt?: any;
}

export const INITIAL_SYSTEM_MODULES: SystemModule[] = [
  {
    id: "vagas",
    key: "vagas",
    nome: "Módulo de Vagas & Recrutamento",
    descricao: "Abertura, triagem e kanban de candidatos",
    icone: "Briefcase",
    categoria: "Recrutamento e Seleção",
    ativo: true,
    ordem: 1,
    rota: "/vagas",
    comercializavel: true,
    precoAdicional: 0,
    gratuito: false,
    enterprise: false,
    planosDisponiveis: ["essencial", "recrutamento", "profissional", "completo", "enterprise"]
  },
  {
    id: "bancoTalentos",
    key: "bancoTalentos",
    nome: "Banco de Talentos Inteligente",
    descricao: "Busca semântica e histórico de candidatos",
    icone: "Users",
    categoria: "Recrutamento e Seleção",
    ativo: true,
    ordem: 2,
    rota: "/banco-talentos",
    comercializavel: true,
    precoAdicional: 0,
    gratuito: false,
    enterprise: false,
    planosDisponiveis: ["essencial", "recrutamento", "profissional", "completo", "enterprise"]
  },
  {
    id: "entrevistas",
    key: "entrevistas",
    nome: "Agenda de Entrevistas & Scorecards",
    descricao: "Avaliações técnicas e feedbacks de gestores",
    icone: "Calendar",
    categoria: "Recrutamento e Seleção",
    ativo: true,
    ordem: 3,
    rota: "/entrevistas",
    comercializavel: true,
    precoAdicional: 0,
    gratuito: false,
    enterprise: false,
    planosDisponiveis: ["essencial", "recrutamento", "profissional", "completo", "enterprise"]
  },
  {
    id: "headhunter",
    key: "headhunter",
    nome: "Headhunter",
    descricao: "Prospecção ativa e busca estratégica de candidatos",
    icone: "UserSearch",
    categoria: "Recrutamento e Seleção",
    ativo: true,
    ordem: 4,
    rota: "/headhunter",
    comercializavel: true,
    precoAdicional: 149,
    gratuito: false,
    enterprise: false,
    planosDisponiveis: [
      "recrutamento",
      "profissional",
      "completo",
      "enterprise"
    ]
  },
  {
    id: "equipeInterna",
    key: "equipeInterna",
    nome: "Gestão da Equipe Interna de RH",
    descricao: "Cadastro de usuários e permissões por papel",
    icone: "ShieldCheck",
    categoria: "Gestão de Pessoas",
    ativo: true,
    ordem: 5,
    rota: "/equipe-interna",
    comercializavel: true,
    precoAdicional: 0,
    gratuito: false,
    enterprise: false,
    planosDisponiveis: ["essencial", "profissional", "completo", "enterprise"]
  },
  {
    id: "consultorRH",
    key: "consultorRH",
    nome: "Consultor de RH (IA Especializada)",
    descricao: "Geração de PDIs, descrições e testes técnicos",
    icone: "Sparkles",
    categoria: "Gestão de Pessoas",
    ativo: true,
    ordem: 6,
    rota: "/consultor-rh",
    comercializavel: true,
    precoAdicional: 199,
    gratuito: false,
    enterprise: false,
    planosDisponiveis: ["completo", "enterprise"]
  },
  {
    id: "feriasBeneficios",
    key: "feriasBeneficios",
    nome: "Gestão de Férias & Benefícios",
    descricao: "Escala de folgas e saldo de benefícios",
    icone: "HeartHandshake",
    categoria: "Departamento Pessoal",
    ativo: true,
    ordem: 7,
    rota: "/ferias-beneficios",
    comercializavel: true,
    precoAdicional: 0,
    gratuito: false,
    enterprise: false,
    planosDisponiveis: ["profissional", "completo", "enterprise"]
  },
  {
    id: "documentosAssinatura",
    key: "documentosAssinatura",
    nome: "Assinatura Digital de Documentos",
    descricao: "Envio e validação jurídica de documentos",
    icone: "FileCheck",
    categoria: "Departamento Pessoal",
    ativo: true,
    ordem: 8,
    rota: "/documentos",
    comercializavel: true,
    precoAdicional: 0,
    gratuito: false,
    enterprise: false,
    planosDisponiveis: ["profissional", "completo", "enterprise"]
  },
  {
    id: "auditoriaLogs",
    key: "auditoriaLogs",
    nome: "Auditoria & Logs de Segurança",
    descricao: "Histórico detalhado de ações dos usuários",
    icone: "Lock",
    categoria: "Segurança e Governança",
    ativo: true,
    ordem: 9,
    rota: "/auditoria",
    comercializavel: true,
    precoAdicional: 0,
    gratuito: false,
    enterprise: true,
    planosDisponiveis: ["completo", "enterprise"]
  },
  {
    id: "relatoriosAvancados",
    key: "relatoriosAvancados",
    nome: "Relatórios Avançados & Métricas",
    descricao: "Exportação CSV/PDF e BI do recrutamento",
    icone: "BarChart3",
    categoria: "Análise e BI",
    ativo: true,
    ordem: 10,
    rota: "/relatorios",
    comercializavel: true,
    precoAdicional: 0,
    gratuito: false,
    enterprise: false,
    planosDisponiveis: ["profissional", "completo", "enterprise"]
  },
  {
    id: "siteVagasPersonalizado",
    key: "siteVagasPersonalizado",
    nome: "Site Público de Vagas (Careers)",
    descricao: "Portal próprio da marca para atração de talentos",
    icone: "Globe",
    categoria: "Recrutamento e Seleção",
    ativo: true,
    ordem: 11,
    rota: "/careers",
    comercializavel: true,
    precoAdicional: 0,
    gratuito: true,
    enterprise: false,
    planosDisponiveis: ["essencial", "recrutamento", "profissional", "completo", "enterprise"]
  }
];

export const INITIAL_PLANS: PlanConfig[] = [
  {
    id: "essencial",
    nome: "Essencial",
    descricao: "Plano essencial para pequenas empresas em expansão",
    preco: 490,
    modulos: ["vagas", "bancoTalentos", "entrevistas", "equipeInterna", "siteVagasPersonalizado"],
    limites: { usuarios: 5, vagas: 5, colaboradores: 20 }
  },
  {
    id: "recrutamento",
    nome: "Recrutamento",
    descricao: "Plano focado em recrutadores e seleção ativa",
    preco: 890,
    modulos: ["vagas", "bancoTalentos", "entrevistas", "headhunter", "siteVagasPersonalizado"],
    limites: { usuarios: 10, vagas: 15, colaboradores: 50 }
  },
  {
    id: "profissional",
    nome: "Profissional",
    descricao: "Gestão completa de R&S, Departamento Pessoal e BI",
    preco: 1290,
    modulos: ["vagas", "bancoTalentos", "entrevistas", "headhunter", "equipeInterna", "feriasBeneficios", "documentosAssinatura", "relatoriosAvancados", "siteVagasPersonalizado"],
    limites: { usuarios: 15, vagas: 20, colaboradores: 100 }
  },
  {
    id: "completo",
    nome: "Completo",
    descricao: "Acesso total aos módulos com IA Gemini e Governança",
    preco: 2890,
    modulos: ["vagas", "bancoTalentos", "entrevistas", "headhunter", "equipeInterna", "consultorRH", "feriasBeneficios", "documentosAssinatura", "auditoriaLogs", "relatoriosAvancados", "siteVagasPersonalizado"],
    limites: { usuarios: 50, vagas: 100, colaboradores: 500 }
  },
  {
    id: "enterprise",
    nome: "Enterprise",
    descricao: "Solução sob medida para grandes corporações",
    preco: 4990,
    modulos: ["vagas", "bancoTalentos", "entrevistas", "headhunter", "equipeInterna", "consultorRH", "feriasBeneficios", "documentosAssinatura", "auditoriaLogs", "relatoriosAvancados", "siteVagasPersonalizado"],
    limites: { usuarios: 999, vagas: 999, colaboradores: 9999 }
  }
];

const MODULOS_COLLECTION = 'modulos';
const PLANOS_COLLECTION = 'planos';
const EMPRESA_MODULOS_COLLECTION = 'empresa_modulos';

/**
 * Consulta a coleção 'modulos' no Firestore.
 * Traz todos os módulos cadastrados (ou filtrados por ativo).
 * Se estiver vazia ou se headhunter não existir, garante a criação/seed.
 */
export async function fetchModulosFirestore(onlyActive = false): Promise<SystemModule[]> {
  try {
    const querySnapshot = await getDocs(collection(db, MODULOS_COLLECTION));
    
    if (querySnapshot.empty) {
      console.log(`⚡ Coleção "${MODULOS_COLLECTION}" vazia. Criando os módulos iniciais...`);
      for (const mod of INITIAL_SYSTEM_MODULES) {
        const docRef = doc(db, MODULOS_COLLECTION, mod.key);
        await setDoc(docRef, sanitizeFirestoreData({
          ...mod,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }), { merge: true });
      }
      const sorted = [...INITIAL_SYSTEM_MODULES].sort((a, b) => a.ordem - b.ordem);
      return onlyActive ? sorted.filter(m => m.ativo) : sorted;
    }

    const modules: SystemModule[] = [];
    let hasHeadhunter = false;

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as SystemModule;
      if (data) {
        const modKey = data.key || data.id || docSnap.id;
        if (modKey === 'headhunter') hasHeadhunter = true;
        
        const modItem: SystemModule = {
          ...data,
          id: data.id || docSnap.id,
          key: modKey,
          nome: data.nome || modKey,
          descricao: data.descricao || '',
          categoria: data.categoria || 'Geral',
          icone: data.icone || 'Briefcase',
          rota: data.rota || `/${modKey}`,
          ordem: typeof data.ordem === 'number' ? data.ordem : 99,
          ativo: data.ativo !== false,
          comercializavel: data.comercializavel !== false,
          precoAdicional: Number(data.precoAdicional) || 0,
          gratuito: !!data.gratuito,
          enterprise: !!data.enterprise,
          planosDisponiveis: Array.isArray(data.planosDisponiveis) ? data.planosDisponiveis : ["recrutamento", "profissional", "completo", "enterprise"],
          permissions: Array.isArray(data.permissions) ? data.permissions : [],
          dependencias: Array.isArray(data.dependencias) ? data.dependencias : []
        };

        if (!onlyActive || modItem.ativo) {
          modules.push(modItem);
        }
      }
    });

    // Garantir que Headhunter exista
    if (!hasHeadhunter) {
      console.log('⚡ Módulo Headhunter não encontrado na coleção. Auto-cadastrando Headhunter...');
      const hh = INITIAL_SYSTEM_MODULES.find(m => m.key === 'headhunter')!;
      await setDoc(doc(db, MODULOS_COLLECTION, 'headhunter'), sanitizeFirestoreData({
        ...hh,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }), { merge: true });
      if (!onlyActive || hh.ativo) {
        modules.push(hh);
      }
    }

    modules.sort((a, b) => (a.ordem || 99) - (b.ordem || 99));
    return modules;
  } catch (err: any) {
    console.warn(`⚠️ [Firestore] Aviso ao consultar "${MODULOS_COLLECTION}": ${err?.message || err}. Usando catálogo inicial de fallback.`);
    const fallback = [...INITIAL_SYSTEM_MODULES].sort((a, b) => a.ordem - b.ordem);
    return onlyActive ? fallback.filter(m => m.ativo) : fallback;
  }
}

/**
 * Salva ou atualiza um módulo na coleção 'modulos/{moduleId}'.
 */
export async function saveModuloFirestore(moduleData: Partial<SystemModule>): Promise<SystemModule> {
  const modKey = (moduleData.key || moduleData.id || `mod-${Date.now()}`).toLowerCase().trim();
  const docRef = doc(db, MODULOS_COLLECTION, modKey);

  const fullData: SystemModule = {
    id: modKey,
    key: modKey,
    nome: moduleData.nome || 'Novo Módulo',
    descricao: moduleData.descricao || '',
    categoria: moduleData.categoria || 'Recrutamento e Seleção',
    icone: moduleData.icone || 'Briefcase',
    rota: moduleData.rota || `/${modKey}`,
    ordem: Number(moduleData.ordem) || 10,
    ativo: moduleData.ativo !== false,
    comercializavel: moduleData.comercializavel !== false,
    precoAdicional: Number(moduleData.precoAdicional) || 0,
    gratuito: !!moduleData.gratuito,
    enterprise: !!moduleData.enterprise,
    planosDisponiveis: Array.isArray(moduleData.planosDisponiveis) ? moduleData.planosDisponiveis : [],
    permissions: Array.isArray(moduleData.permissions) ? moduleData.permissions : [],
    dependencias: Array.isArray(moduleData.dependencias) ? moduleData.dependencias : [],
    updatedAt: serverTimestamp()
  };

  await setDoc(docRef, sanitizeFirestoreData(fullData), { merge: true });
  return fullData;
}

/**
 * Exclui um módulo da coleção 'modulos/{moduleId}'.
 */
export async function deleteModuloFirestore(moduleId: string): Promise<void> {
  if (!moduleId) return;
  const docRef = doc(db, MODULOS_COLLECTION, moduleId);
  await deleteDoc(docRef);
}

/**
 * Alterna o status 'ativo' do módulo no Firestore.
 */
export async function toggleModuloStatusFirestore(moduleId: string, currentStatus: boolean): Promise<boolean> {
  const newStatus = !currentStatus;
  const docRef = doc(db, MODULOS_COLLECTION, moduleId);
  await setDoc(docRef, {
    ativo: newStatus,
    updatedAt: serverTimestamp()
  }, { merge: true });
  return newStatus;
}

/**
 * Duplica um módulo existente criando uma cópia no Firestore.
 */
export async function duplicateModuloFirestore(sourceModule: SystemModule): Promise<SystemModule> {
  const newKey = `${sourceModule.key}_copia_${Math.floor(Math.random() * 1000)}`;
  const duplicateData: SystemModule = {
    ...sourceModule,
    id: newKey,
    key: newKey,
    nome: `${sourceModule.nome} (Cópia)`,
    ordem: sourceModule.ordem + 1,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  return saveModuloFirestore(duplicateData);
}

// ============================================================================
// SERVIÇOS DE PLANOS (coleção 'planos')
// ============================================================================

/**
 * Busca todos os planos cadastrados na coleção 'planos'.
 * Se estiver vazia, efetua o seed inicial dos planos padrão.
 */
export async function fetchPlansFirestore(): Promise<PlanConfig[]> {
  try {
    const snap = await getDocs(collection(db, PLANOS_COLLECTION));
    if (snap.empty) {
      console.log(`⚡ Coleção "${PLANOS_COLLECTION}" vazia. Semeando planos padrão...`);
      for (const plan of INITIAL_PLANS) {
        const docRef = doc(db, PLANOS_COLLECTION, plan.id);
        await setDoc(docRef, sanitizeFirestoreData({
          ...plan,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }), { merge: true });
      }
      return INITIAL_PLANS;
    }

    const plans: PlanConfig[] = [];
    snap.forEach(docSnap => {
      const data = docSnap.data() as PlanConfig;
      if (data) {
        plans.push({
          ...data,
          id: data.id || docSnap.id,
          nome: data.nome || docSnap.id,
          preco: Number(data.preco) || 0,
          modulos: Array.isArray(data.modulos) ? data.modulos : [],
          limites: data.limites || { usuarios: 10, vagas: 10 }
        });
      }
    });

    return plans;
  } catch (err) {
    console.error('🔥 [Firestore Error] Erro ao buscar coleção "planos":', err);
    return INITIAL_PLANS;
  }
}

/**
 * Salva a alteração da matriz de módulos do plano em 'planos/{planId}'.
 */
export async function savePlanModulesFirestore(planId: string, modulos: string[]): Promise<void> {
  if (!planId) return;
  const docRef = doc(db, PLANOS_COLLECTION, planId);
  await setDoc(docRef, {
    modulos,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

/**
 * Salva um plano completo no Firestore.
 */
export async function savePlanFirestore(plan: PlanConfig): Promise<void> {
  const docRef = doc(db, PLANOS_COLLECTION, plan.id);
  await setDoc(docRef, sanitizeFirestoreData({
    ...plan,
    updatedAt: serverTimestamp()
  }), { merge: true });
}

/**
 * Consulta os módulos liberados de uma empresa na coleção 'empresa_modulos/{empresaId}'.
 */
export async function fetchCompanyReleasedModules(empresaId: string): Promise<Record<string, boolean>> {
  if (!empresaId) return {};
  try {
    const docRef = doc(db, EMPRESA_MODULOS_COLLECTION, empresaId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      if (data && data.modulos && typeof data.modulos === 'object' && Object.keys(data.modulos).length > 0) {
        return data.modulos as Record<string, boolean>;
      }
    }

    // Compatibilidade com docs legados
    const legacySnap = await getDocs(collection(db, EMPRESA_MODULOS_COLLECTION));
    const result: Record<string, boolean> = {};
    legacySnap.forEach(d => {
      const data = d.data();
      if (data && data.empresaId === empresaId && data.moduloId) {
        result[data.moduloId] = !!data.ativo;
      }
    });

    if (Object.keys(result).length > 0) {
      return result;
    }

    // Fallback doc empresas
    const empSnap = await getDoc(doc(db, 'empresas', empresaId));
    if (empSnap.exists()) {
      const empData = empSnap.data();
      if (empData?.rawTenantData?.modules) {
        return empData.rawTenantData.modules as Record<string, boolean>;
      }
    }

    // Fallback localStorage
    if (typeof window !== 'undefined') {
      const rawLocal = localStorage.getItem('mais_rh_master_tenants');
      if (rawLocal) {
        const parsed = JSON.parse(rawLocal);
        if (Array.isArray(parsed)) {
          const found = parsed.find((t: any) => t.id === empresaId);
          if (found && found.modules) {
            return found.modules as Record<string, boolean>;
          }
        }
      }
    }
  } catch (err) {
    console.warn(`Aviso ao buscar empresa_modulos para empresa ${empresaId}:`, err);
  }

  // Se não houver registro prévio, disponibilizar padrão de ambiente de teste
  return {
    vagas: true,
    headhunter: true,
    bancoTalentos: true,
    entrevistas: true,
    equipeInterna: true,
    consultorRH: true,
    feriasBeneficios: true,
    documentosAssinatura: true,
    auditoriaLogs: true,
    relatoriosAvancados: true,
    siteVagasPersonalizado: true,
    folha: true,
    ponto: true
  };
}

/**
 * Salva a liberação de módulos de uma empresa na estrutura oficial 'empresa_modulos/{empresaId}'.
 */
export async function saveCompanyReleasedModules(
  empresaId: string, 
  modulos: Record<string, boolean>
): Promise<void> {
  if (!empresaId) throw new Error('ID da empresa é obrigatório para salvar módulos.');

  const path = `${EMPRESA_MODULOS_COLLECTION}/${empresaId}`;

  // 1. Obter estado atual para fusão incremental
  let existing: Record<string, boolean> = {};
  try {
    const existingSnap = await getDoc(doc(db, EMPRESA_MODULOS_COLLECTION, empresaId));
    if (existingSnap.exists() && existingSnap.data()?.modulos) {
      existing = existingSnap.data()?.modulos;
    }
  } catch (readErr) {
    console.warn('Erro ao ler módulos existentes antes de salvar:', readErr);
  }

  const mergedModulos = {
    ...existing,
    ...modulos
  };

  console.log('[Salvar módulos empresa]', {
    empresaId,
    path,
    usuarioUid: auth.currentUser?.uid,
    usuarioEmail: auth.currentUser?.email,
    modulosFinais: mergedModulos
  });

  // 2. Grava no Firestore cliente
  const docRef = doc(db, EMPRESA_MODULOS_COLLECTION, empresaId);
  const data = {
    empresaId,
    modulos: mergedModulos,
    updatedAt: serverTimestamp()
  };

  await setDoc(docRef, data, { merge: true });

  // 3. Sincroniza no documento da empresa em 'empresas'
  try {
    const empresaRef = doc(db, 'empresas', empresaId);
    const empSnap = await getDoc(empresaRef);
    if (empSnap.exists()) {
      const existingData = empSnap.data();
      await setDoc(empresaRef, {
        rawTenantData: {
          ...(existingData?.rawTenantData || {}),
          modules: mergedModulos
        }
      }, { merge: true });
    }
  } catch (syncErr) {
    console.warn('Aviso ao sincronizar módulos no doc da empresa:', syncErr);
  }

  // 4. Sincroniza via API Backend (Server Admin DB)
  try {
    await fetch('/api/company/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ empresaId, modulos: mergedModulos })
    });
  } catch (apiErr) {
    console.warn('Aviso na sincronização de módulos via API backend:', apiErr);
  }

  // 5. Sincroniza localStorage local 'mais_rh_master_tenants'
  if (typeof window !== 'undefined') {
    try {
      const rawLocal = localStorage.getItem('mais_rh_master_tenants');
      if (rawLocal) {
        const parsed = JSON.parse(rawLocal);
        if (Array.isArray(parsed)) {
          const updated = parsed.map((t: any) => {
            if (t.id === empresaId) {
              return {
                ...t,
                modules: {
                  ...(t.modules || {}),
                  ...mergedModulos
                }
              };
            }
            return t;
          });
          localStorage.setItem('mais_rh_master_tenants', JSON.stringify(updated));
        }
      }
      
      // Emitir evento global de atualização
      window.dispatchEvent(new CustomEvent('company_modules_updated', {
        detail: { empresaId, modulos: mergedModulos }
      }));
    } catch (lsErr) {
      console.warn('Aviso ao atualizar localStorage de tenants:', lsErr);
    }
  }
}
