import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
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
  createdAt?: any;
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
    rota: "/vagas"
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
    rota: "/banco-talentos"
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
    rota: "/entrevistas"
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
    rota: "/headhunter"
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
    rota: "/equipe-interna"
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
    rota: "/consultor-rh"
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
    rota: "/ferias-beneficios"
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
    rota: "/documentos"
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
    rota: "/auditoria"
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
    rota: "/relatorios"
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
    rota: "/careers"
  }
];

const MODULOS_COLLECTION = 'modulos';
const EMPRESA_MODULOS_COLLECTION = 'empresa_modulos';

/**
 * Consulta a coleção 'modulos' no Firestore.
 * Traz somente os módulos ativos e ordenados por 'ordem'.
 * Se estiver vazia, efetua o seed idempotente inicial uma única vez.
 * Em caso de erro, lança exceção ou retorna [] conforme tratamento da UI.
 */
export async function fetchModulosFirestore(): Promise<SystemModule[]> {
  try {
    const querySnapshot = await getDocs(collection(db, MODULOS_COLLECTION));
    
    if (querySnapshot.empty) {
      console.log('Coleção "modulos" vazia. Semeando catálogo de módulos padrão...');
      // Seed inicial idempotente
      for (const mod of INITIAL_SYSTEM_MODULES) {
        const docRef = doc(db, MODULOS_COLLECTION, mod.key);
        await setDoc(docRef, sanitizeFirestoreData({
          ...mod,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }), { merge: true });
      }
      return [...INITIAL_SYSTEM_MODULES].sort((a, b) => a.ordem - b.ordem);
    }

    const modules: SystemModule[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as SystemModule;
      if (data && data.ativo !== false) {
        modules.push({
          ...data,
          id: data.id || docSnap.id,
          key: data.key || docSnap.id
        });
      }
    });

    // Se nenhum ativo retornado mas existem docs, garantir ordenação
    modules.sort((a, b) => (a.ordem || 99) - (b.ordem || 99));
    return modules;
  } catch (err) {
    console.error('Erro ao consultar coleção "modulos" no Firestore:', err);
    throw err;
  }
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
      if (data && data.modulos && typeof data.modulos === 'object') {
        return data.modulos as Record<string, boolean>;
      }
    }

    // Compatibilidade com docs legados (empresa_modulos/{empresaId}_{moduloId}) ou empresa/{empresaId}
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
  } catch (err) {
    console.warn(`Aviso ao buscar empresa_modulos para empresa ${empresaId}:`, err);
  }
  return {};
}

/**
 * Salva a liberação de módulos de uma empresa na estrutura oficial 'empresa_modulos/{empresaId}'.
 * { empresaId, modulos: { [key]: boolean }, updatedAt: serverTimestamp() }
 */
export async function saveCompanyReleasedModules(
  empresaId: string, 
  modulos: Record<string, boolean>
): Promise<void> {
  if (!empresaId) throw new Error('ID da empresa é obrigatório para salvar módulos.');

  const docRef = doc(db, EMPRESA_MODULOS_COLLECTION, empresaId);
  const data = {
    empresaId,
    modulos,
    updatedAt: serverTimestamp()
  };

  await setDoc(docRef, data, { merge: true });

  // Também sincroniza no documento da empresa para integridade
  try {
    const empresaRef = doc(db, 'empresas', empresaId);
    const empSnap = await getDoc(empresaRef);
    if (empSnap.exists()) {
      const existingData = empSnap.data();
      await setDoc(empresaRef, {
        rawTenantData: {
          ...(existingData?.rawTenantData || {}),
          modules: modulos
        }
      }, { merge: true });
    }
  } catch (syncErr) {
    console.warn('Aviso ao sincronizar módulos no doc da empresa:', syncErr);
  }
}
