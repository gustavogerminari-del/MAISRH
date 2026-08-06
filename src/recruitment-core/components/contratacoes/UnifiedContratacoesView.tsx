import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  DollarSign, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  Briefcase, 
  Building2, 
  TrendingUp,
  Send,
  Eye,
  X,
  Clock,
  AlertTriangle,
  Check,
  Loader2,
  FileText,
  ExternalLink,
  History,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { 
  UnifiedHiring, 
  OrigemProcesso 
} from '../../types/recruitment';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../auth';
import { JobCandidateService } from '../../../services/JobCandidateService';
import { sanitizeFirestoreData } from '../../../lib/firestoreUtils';

export interface UnifiedContratacoesViewProps {
  hirings?: UnifiedHiring[];
  origemProcesso?: OrigemProcesso;
  companyId?: string;
  onOpenAiModal?: (type: string, data?: any) => void;
  onNavigateToTab?: (tab: string, admissionId?: string) => void;
}

export const UnifiedContratacoesView: React.FC<UnifiedContratacoesViewProps> = ({
  hirings = [],
  origemProcesso = 'recrutamento_interno',
  companyId,
  onOpenAiModal,
  onNavigateToTab
}) => {
  const { user, isModuleActive } = useAuth();
  const hasDpModule = isModuleActive('departamentoPessoal');
  const hasAdmissaoModule = isModuleActive('admissao');
  const hasHeadhunterModule = isModuleActive('headhunter');
  const hasFinanceiroModule = isModuleActive('financeiroHeadhunter');
  const [firestoreHirings, setFirestoreHirings] = useState<any[]>([]);
  const [admissoesMap, setAdmissoesMap] = useState<Record<string, any>>({});
  const [cobrancasMap, setCobrancasMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [openingAdmissionId, setOpeningAdmissionId] = useState<string | null>(null);
  const [openingFinancialId, setOpeningFinancialId] = useState<string | null>(null);

  // Modals state
  const [detailsItem, setDetailsItem] = useState<any | null>(null);
  const [filterTab, setFilterTab] = useState<'TODAS' | 'DP' | 'HEADHUNTER' | 'AGUARDANDO_ADMISSAO' | 'AGUARDANDO_COBRANCA' | 'FINALIZADAS'>('TODAS');

  const activeCompanyId = companyId || user?.empresaId || user?.companyId || user?.tenantId;
  const isMaster = user?.role === 'Super Administrador' || user?.role === 'MASTER' || user?.tipoUsuario === 'MASTER' || user?.isMaster === true;

  // Auto-migration effect for old hires erroneously classified as DP when company lacks DP module
  useEffect(() => {
    if (activeCompanyId && hasHeadhunterModule && !hasDpModule) {
      JobCandidateService.migrateIncompatibleHirings(activeCompanyId)
        .then((res) => {
          if (res.migratedCount > 0) {
            console.log(`[MIGRAÇÃO AUTOMÁTICA] ${res.migratedCount} contratação(ões) migrada(s) para Financeiro/Headhunter:`, res.details);
          }
        })
        .catch((err) => {
          console.warn('[MIGRAÇÃO AUTOMÁTICA] Erro ao executar migração:', err);
        });
    }
  }, [activeCompanyId, hasHeadhunterModule, hasDpModule]);

  const vincularContratacaoEFinanceiro = async (hiring: any, financialId: string, billingData: any) => {
    try {
      const now = new Date().toISOString();
      await setDoc(doc(db, 'contratacoes', hiring.id), sanitizeFirestoreData({
        destino: 'Headhunter',
        destinoProcesso: 'Financeiro / Headhunter',
        statusProcesso: billingData?.status || 'Aguardando Cobrança',
        cobrancaId: financialId,
        financeiroId: financialId,
        encaminhadoFinanceiro: true,
        encaminhadoFinanceiroEm: now,
        updatedAt: now
      }), { merge: true });

      await setDoc(doc(db, 'financeiro_cobrancas', financialId), sanitizeFirestoreData({
        contratacaoId: hiring.id,
        applicationId: hiring.applicationId || hiring.candidaturaId || hiring.id,
        candidateId: hiring.candidateId || hiring.candidatoId,
        candidatoId: hiring.candidateId || hiring.candidatoId,
        jobId: hiring.jobId || hiring.vagaId,
        vagaId: hiring.jobId || hiring.vagaId,
        clientId: hiring.clientId || hiring.clienteId,
        companyId: hiring.companyId || hiring.empresaId || activeCompanyId || 'emp-001',
        empresaId: hiring.companyId || hiring.empresaId || activeCompanyId || 'emp-001',
        updatedAt: now
      }), { merge: true });
    } catch (err) {
      console.error('[FINANCEIRO] Erro ao salvar vínculo entre contratação e financeiro:', err);
    }
  };

  const localizarCobrancaPorContratacao = async (hiring: any): Promise<string | null> => {
    const contrId = hiring.id;
    const candId = hiring.candidateId || hiring.candidatoId;
    const jobId = hiring.jobId || hiring.vagaId;

    // 1. Direct doc lookup cob_${contrId}
    try {
      const directRef = doc(db, 'financeiro_cobrancas', `cob_${contrId}`);
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        const foundId = directSnap.id;
        const foundData = directSnap.data();
        await vincularContratacaoEFinanceiro(hiring, foundId, foundData);
        return foundId;
      }
    } catch (e) {
      console.warn('[FINANCEIRO] Erro na busca direta por cob_ ID:', e);
    }

    // 2. Query financeiro_cobrancas by contratacaoId
    try {
      const q1 = query(collection(db, 'financeiro_cobrancas'), where('contratacaoId', '==', contrId));
      const snap1 = await getDocs(q1);
      if (!snap1.empty) {
        const docFound = snap1.docs[0];
        const foundId = docFound.id;
        const foundData = docFound.data();
        await vincularContratacaoEFinanceiro(hiring, foundId, foundData);
        return foundId;
      }
    } catch (e) {
      console.warn('[FINANCEIRO] Erro na busca por contratacaoId:', e);
    }

    // 3. Query receitas collection by contratacaoId
    try {
      const q2 = query(collection(db, 'receitas'), where('contratacaoId', '==', contrId));
      const snap2 = await getDocs(q2);
      if (!snap2.empty) {
        const docFound = snap2.docs[0];
        const foundId = docFound.id;
        const foundData = docFound.data();
        await vincularContratacaoEFinanceiro(hiring, foundId, foundData);
        return foundId;
      }
    } catch (e) {
      console.warn('[FINANCEIRO] Erro na busca em receitas por contratacaoId:', e);
    }

    // 4. Query financeiro_cobrancas by candidateId + jobId
    if (candId && jobId) {
      try {
        const q3 = query(
          collection(db, 'financeiro_cobrancas'),
          where('candidateId', '==', candId),
          where('jobId', '==', jobId)
        );
        const snap3 = await getDocs(q3);
        if (!snap3.empty) {
          const docFound = snap3.docs[0];
          const foundId = docFound.id;
          const foundData = docFound.data();
          await vincularContratacaoEFinanceiro(hiring, foundId, foundData);
          return foundId;
        }
      } catch (e) {
        console.warn('[FINANCEIRO] Erro na busca por candidateId + jobId:', e);
      }
    }

    return null;
  };

  const handleOpenFinancial = async (hiring: any) => {
    if (openingFinancialId) return;

    if (!hasHeadhunterModule || !hasFinanceiroModule) {
      alert('Acesso não autorizado: Sua empresa não possui os módulos de Headhunter / Financeiro contratados.');
      return;
    }

    const isRh = 
      hasDpModule &&
      (hiring.origemProcesso === 'recrutamento_interno' || hiring.origemProcesso === 'RH' || hiring.moduloOrigem === 'RH') &&
      hiring.origemProcesso !== 'headhunter' &&
      hiring.moduloOrigem !== 'headhunter' &&
      hiring.destinoContratacao !== 'headhunter' &&
      hiring.destino !== 'Financeiro' &&
      hiring.destino !== 'Headhunter' &&
      !hiring.isHeadhunter;

    if (isRh) {
      console.warn('[FINANCEIRO GUARDS] Contratação de RH não pode ser enviada para o Financeiro. Redirecionando para DP.');
      return handleOpenAdmission(hiring);
    }

    setOpeningFinancialId(hiring.id);

    console.log("[FINANCEIRO] Abrindo cobrança:", {
      contratacaoId: hiring.id,
      financeiroId: hiring.financeiroId || hiring.cobrancaId,
      candidateId: hiring.candidateId || hiring.candidatoId,
      applicationId: hiring.applicationId || hiring.candidaturaId || hiring.id,
      jobId: hiring.jobId || hiring.vagaId,
      companyId: hiring.companyId || hiring.empresaId
    });

    try {
      const cobDoc = cobrancasMap[hiring.id] || cobrancasMap[`${hiring.jobId}_${hiring.candidateId}`] || cobrancasMap[`${hiring.jobId}_${hiring.candidatoId}`];
      
      let financialId = hiring.financeiroId || hiring.cobrancaId || cobDoc?.id || `cob_${hiring.id}`;

      // Verify if billing doc exists
      const docRef = doc(db, 'financeiro_cobrancas', financialId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const recRef = doc(db, 'receitas', financialId);
        const recSnap = await getDoc(recRef);
        if (!recSnap.exists()) {
          const foundId = await localizarCobrancaPorContratacao(hiring);
          if (foundId) {
            financialId = foundId;
          } else {
            // Create single missing billing document for Headhunter hiring
            const cobrancaId = `cob_${hiring.id}`;
            const clientId = hiring.clientId || hiring.clienteId || '';
            const clientName = hiring.clienteNome || hiring.clientName || 'Cliente Headhunter';
            const candidateName = hiring.candidatoNome || hiring.candidateName || 'Candidato';
            const jobTitle = hiring.vagaTitulo || hiring.jobTitle || 'Vaga Corporativa';
            const isClientProvided = Boolean(clientId && clientId !== 'cli-001' && clientName !== 'Cliente Headhunter');
            const now = new Date().toISOString();

            const newBillingDoc = sanitizeFirestoreData({
              id: cobrancaId,
              companyId: activeCompanyId || hiring.companyId || hiring.empresaId || 'emp-001',
              empresaId: activeCompanyId || hiring.companyId || hiring.empresaId || 'emp-001',
              contratacaoId: hiring.id,
              candidateId: hiring.candidateId || hiring.candidatoId || '',
              candidatoId: hiring.candidateId || hiring.candidatoId || '',
              applicationId: hiring.applicationId || hiring.candidaturaId || hiring.id,
              candidaturaId: hiring.applicationId || hiring.candidaturaId || hiring.id,
              jobId: hiring.jobId || hiring.vagaId || '',
              vagaId: hiring.jobId || hiring.vagaId || '',
              clientId: clientId || 'cli-001',
              clienteId: clientId || 'cli-001',
              clienteNome: clientName,
              candidatoNome: candidateName,
              vagaTitulo: jobTitle,
              status: isClientProvided ? "Aguardando Cobrança" : "Pendente de Dados Comerciais",
              valor: hiring.salarioContratado || hiring.salarioFinal || hiring.salario || 0,
              dataContratacao: hiring.contratadoEm || hiring.dataContratacao || now,
              createdAt: hiring.createdAt || now,
              updatedAt: now
            });

            await setDoc(doc(db, 'financeiro_cobrancas', cobrancaId), newBillingDoc, { merge: true });
            await vincularContratacaoEFinanceiro(hiring, cobrancaId, newBillingDoc);
            financialId = cobrancaId;
          }
        } else {
          await vincularContratacaoEFinanceiro(hiring, financialId, recSnap.data());
        }
      } else {
        await vincularContratacaoEFinanceiro(hiring, financialId, docSnap.data());
      }

      localStorage.setItem('selectedFinancialId', financialId);
      localStorage.setItem('selectedBillingId', financialId);
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('selectedFinancialId', financialId);
        window.history.pushState({}, '', url.toString());
      } catch (err) {
        console.warn('Could not update window location params:', err);
      }

      if (onNavigateToTab) {
        onNavigateToTab('headhunter-financeiro', financialId);
      } else {
        window.location.hash = `headhunter-financeiro?id=${financialId}`;
      }
    } catch (error) {
      console.error("[FINANCEIRO] Erro ao abrir:", error);
      alert(error instanceof Error ? error.message : "Não foi possível localizar o processo vinculado a esta contratação.");
    } finally {
      setOpeningFinancialId(null);
    }
  };

  const vincularContratacaoEAdmissao = async (hiring: any, admissionId: string, admissionData: any) => {
    try {
      const now = new Date().toISOString();
      await setDoc(doc(db, 'contratacoes', hiring.id), sanitizeFirestoreData({
        destino: 'DP',
        admissaoId: admissionId,
        statusAdmissao: admissionData?.status || 'Aguardando Admissão',
        encaminhadoAdmissao: true,
        encaminhadoAdmissaoEm: now,
        updatedAt: now
      }), { merge: true });

      await setDoc(doc(db, 'solicitacoes_admissao', admissionId), sanitizeFirestoreData({
        contratacaoId: hiring.id,
        applicationId: hiring.applicationId || hiring.candidaturaId || hiring.id,
        candidateId: hiring.candidateId || hiring.candidatoId,
        jobId: hiring.jobId || hiring.vagaId,
        companyId: hiring.companyId || hiring.empresaId || activeCompanyId || 'emp-001',
        empresaId: hiring.companyId || hiring.empresaId || activeCompanyId || 'emp-001',
        updatedAt: now
      }), { merge: true });
    } catch (err) {
      console.error('[ADMISSÃO] Erro ao salvar vínculo entre contratação e admissão:', err);
    }
  };

  const localizarAdmissaoPorContratacao = async (hiring: any): Promise<string | null> => {
    const contrId = hiring.id;
    const candId = hiring.candidateId || hiring.candidatoId;
    const jobId = hiring.jobId || hiring.vagaId;

    // 1. Direct doc lookup adm_${contrId}
    try {
      const directRef = doc(db, 'solicitacoes_admissao', `adm_${contrId}`);
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        const foundId = directSnap.id;
        const foundData = directSnap.data();
        await vincularContratacaoEAdmissao(hiring, foundId, foundData);
        return foundId;
      }
    } catch (e) {
      console.warn('[ADMISSÃO] Erro na busca direta por ID:', e);
    }

    // 2. Query solicitacoes_admissao by contratacaoId
    try {
      const q1 = query(collection(db, 'solicitacoes_admissao'), where('contratacaoId', '==', contrId));
      const snap1 = await getDocs(q1);
      if (!snap1.empty) {
        const docFound = snap1.docs[0];
        const foundId = docFound.id;
        const foundData = docFound.data();
        await vincularContratacaoEAdmissao(hiring, foundId, foundData);
        return foundId;
      }
    } catch (e) {
      console.warn('[ADMISSÃO] Erro na busca por contratacaoId:', e);
    }

    // 3. Query solicitacoes_admissao by candidateId + jobId
    if (candId && jobId) {
      try {
        const q2 = query(
          collection(db, 'solicitacoes_admissao'),
          where('candidateId', '==', candId),
          where('jobId', '==', jobId)
        );
        const snap2 = await getDocs(q2);
        if (!snap2.empty) {
          const docFound = snap2.docs[0];
          const foundId = docFound.id;
          const foundData = docFound.data();
          await vincularContratacaoEAdmissao(hiring, foundId, foundData);
          return foundId;
        }
      } catch (e) {
        console.warn('[ADMISSÃO] Erro na busca por candidateId + jobId:', e);
      }

      try {
        const q3 = query(
          collection(db, 'solicitacoes_admissao'),
          where('candidatoId', '==', candId),
          where('vagaId', '==', jobId)
        );
        const snap3 = await getDocs(q3);
        if (!snap3.empty) {
          const docFound = snap3.docs[0];
          const foundId = docFound.id;
          const foundData = docFound.data();
          await vincularContratacaoEAdmissao(hiring, foundId, foundData);
          return foundId;
        }
      } catch (e) {
        console.warn('[ADMISSÃO] Erro na busca por candidatoId + vagaId:', e);
      }
    }

    return null;
  };

  const handleOpenAdmission = async (hiring: any) => {
    if (openingAdmissionId) return;

    if (!hasDpModule || !hasAdmissaoModule) {
      alert('Acesso não autorizado: Sua empresa não possui os módulos de Departamento Pessoal / Admissão contratados.');
      return;
    }

    const isHeadhunter = 
      hiring.origemProcesso === 'headhunter' ||
      hiring.moduloOrigem === 'headhunter' ||
      hiring.origem === 'headhunter' ||
      hiring.destinoContratacao === 'headhunter' ||
      hiring.destino === 'Financeiro' ||
      hiring.destino === 'Headhunter' ||
      hiring.encaminhadoPara === 'financeiro' ||
      hiring.isHeadhunter === true;

    if (isHeadhunter) {
      console.warn('[ADMISSÃO GUARDS] Contratação Headhunter não pode ser enviada para o DP. Redirecionando para o Financeiro.');
      return handleOpenFinancial(hiring);
    }

    setOpeningAdmissionId(hiring.id);

    console.log("[ADMISSÃO] Abrindo processo:", {
      contratacaoId: hiring.id,
      admissaoId: hiring.admissaoId,
      candidateId: hiring.candidateId || hiring.candidatoId,
      applicationId: hiring.applicationId || hiring.candidaturaId || hiring.id,
      jobId: hiring.jobId || hiring.vagaId,
      companyId: hiring.companyId || hiring.empresaId
    });

    try {
      const admDoc = admissoesMap[hiring.id] || admissoesMap[`${hiring.jobId}_${hiring.candidateId}`] || admissoesMap[`${hiring.jobId}_${hiring.candidatoId}`];
      
      let admissionId = hiring.admissaoId || admDoc?.id || `adm_${hiring.id}`;

      // Verify if admission doc exists, if not run locator
      const docRef = doc(db, 'solicitacoes_admissao', admissionId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const foundId = await localizarAdmissaoPorContratacao(hiring);
        if (foundId) {
          admissionId = foundId;
        } else {
          throw new Error("Não foi possível localizar a solicitação de admissão desta contratação.");
        }
      } else {
        await vincularContratacaoEAdmissao(hiring, admissionId, docSnap.data());
      }

      localStorage.setItem('selectedAdmissionId', admissionId);
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('selectedAdmissionId', admissionId);
        window.history.pushState({}, '', url.toString());
      } catch (err) {
        console.warn('Could not update window location params:', err);
      }

      if (onNavigateToTab) {
        onNavigateToTab('admissoes', admissionId);
      } else {
        window.location.hash = `admissoes?id=${admissionId}`;
      }
    } catch (error) {
      console.error("[ADMISSÃO] Erro ao abrir:", error);
      alert(error instanceof Error ? error.message : "Erro ao abrir a admissão.");
    } finally {
      setOpeningAdmissionId(null);
    }
  };

  // Real-time Firestore subscription to 'contratacoes', 'solicitacoes_admissao', and 'financeiro_cobrancas'
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'contratacoes'));

    const unsubscribeHirings = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs
          .map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
          }))
          .filter((item: any) => {
            if (isMaster || !activeCompanyId) return true;
            return (
              item.companyId === activeCompanyId ||
              item.empresaId === activeCompanyId ||
              (!item.companyId && !item.empresaId)
            );
          });
        setFirestoreHirings(list);
        setLoading(false);
      },
      (err) => {
        console.error('Erro ao buscar contratações no Firestore:', err);
        setLoading(false);
      }
    );

    // Subscribe to solicitacoes_admissao for DP status sync
    let qAdm;
    if (isMaster || !activeCompanyId) {
      qAdm = query(collection(db, 'solicitacoes_admissao'));
    } else {
      qAdm = query(collection(db, 'solicitacoes_admissao'), where('companyId', '==', activeCompanyId));
    }
    const unsubscribeAdm = onSnapshot(qAdm, (snap) => {
      const map: Record<string, any> = {};
      snap.docs.forEach(d => {
        const data = d.data();
        if (data.contratacaoId) map[data.contratacaoId] = data;
        if (data.candidatoId && data.jobId) map[`${data.jobId}_${data.candidatoId}`] = data;
        if (data.candidateId && data.jobId) map[`${data.jobId}_${data.candidateId}`] = data;
        map[d.id] = data;
      });
      setAdmissoesMap(map);
    }, err => console.warn('Aviso subscription solicitacoes_admissao:', err));

    // Subscribe to financeiro_cobrancas for Headhunter Financeiro status sync
    let qCob;
    if (isMaster || !activeCompanyId) {
      qCob = query(collection(db, 'financeiro_cobrancas'));
    } else {
      qCob = query(collection(db, 'financeiro_cobrancas'), where('companyId', '==', activeCompanyId));
    }
    const unsubscribeCob = onSnapshot(qCob, (snap) => {
      const map: Record<string, any> = {};
      snap.docs.forEach(d => {
        const data = d.data();
        if (data.contratacaoId) map[data.contratacaoId] = data;
        if (data.candidatoId && data.jobId) map[`${data.jobId}_${data.candidatoId}`] = data;
        map[d.id] = data;
      });
      setCobrancasMap(map);
    }, err => console.warn('Aviso subscription financeiro_cobrancas:', err));

    return () => {
      unsubscribeHirings();
      unsubscribeAdm();
      unsubscribeCob();
    };
  }, [activeCompanyId, isMaster]);

  // Combine Firestore list with prop list fallback
  const rawList = firestoreHirings.length > 0 ? firestoreHirings : hirings;

  // Format date helper
  const formatDate = (isoOrStr?: string) => {
    if (!isoOrStr) return 'Recente';
    try {
      const date = new Date(isoOrStr);
      if (isNaN(date.getTime())) return isoOrStr;
      return date.toLocaleDateString('pt-BR');
    } catch {
      return isoOrStr;
    }
  };

  const isHeadhunterView = origemProcesso === 'headhunter';

  // Calculate KPIs
  const totalContratacoes = rawList.length;
  const rhHirings = hasDpModule
    ? rawList.filter(h => 
        h.origemProcesso !== 'HEADHUNTER' &&
        h.origemProcesso !== 'headhunter' && 
        h.moduloOrigem !== 'headhunter' && 
        h.origem !== 'headhunter' &&
        h.destinoContratacao !== 'FINANCEIRO_HEADHUNTER' &&
        h.destinoContratacao !== 'headhunter' && 
        h.destino !== 'Financeiro' && 
        h.destino !== 'Financeiro / Headhunter' &&
        h.destino !== 'Headhunter' && 
        !h.isHeadhunter
      )
    : [];

  const headhunterHirings = hasDpModule
    ? rawList.filter(h => 
        h.origemProcesso === 'HEADHUNTER' ||
        h.origemProcesso === 'headhunter' || 
        h.moduloOrigem === 'headhunter' || 
        h.origem === 'headhunter' ||
        h.destinoContratacao === 'FINANCEIRO_HEADHUNTER' ||
        h.destinoContratacao === 'headhunter' || 
        h.destino === 'Financeiro' || 
        h.destino === 'Financeiro / Headhunter' ||
        h.destino === 'Headhunter' || 
        Boolean(h.isHeadhunter)
      )
    : rawList;

  const filteredList = rawList.filter(h => {
    const isHead = 
      !hasDpModule ||
      h.origemProcesso === 'HEADHUNTER' ||
      h.origemProcesso === 'headhunter' || 
      h.moduloOrigem === 'headhunter' || 
      h.origem === 'headhunter' ||
      h.destinoContratacao === 'FINANCEIRO_HEADHUNTER' ||
      h.destinoContratacao === 'headhunter' || 
      h.destino === 'Financeiro' || 
      h.destino === 'Financeiro / Headhunter' ||
      h.destino === 'Headhunter' || 
      Boolean(h.isHeadhunter);

    const admDoc = admissoesMap[h.id] || admissoesMap[`${h.jobId || h.vagaId}_${h.candidateId || h.candidatoId}`];
    const cobDoc = cobrancasMap[h.id] || cobrancasMap[`${h.jobId || h.vagaId}_${h.candidateId || h.candidatoId}`];

    const currentStatus = isHead 
      ? (cobDoc?.status || h.statusCobranca || h.statusFinanceiro || h.statusProcesso || 'Aguardando Cobrança')
      : (admDoc?.status || h.statusAdmissao || 'Aguardando Admissão');

    const statusLower = String(currentStatus).toLowerCase();

    if (filterTab === 'DP') return !isHead;
    if (filterTab === 'HEADHUNTER') return isHead;
    if (filterTab === 'AGUARDANDO_ADMISSAO') return !isHead && statusLower.includes('admissão');
    if (filterTab === 'AGUARDANDO_COBRANCA') return isHead && (statusLower.includes('cobrança') || statusLower.includes('aguardando'));
    if (filterTab === 'FINALIZADAS') {
      return statusLower.includes('concluíd') || statusLower.includes('finaliz') || statusLower.includes('admitid') || statusLower.includes('pago');
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isHeadhunterView ? 'Histórico de Contratações & Headhunter' : 'Central Única de Contratações'}
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {totalContratacoes} {totalContratacoes === 1 ? 'contratação' : 'contratações'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Central única de acompanhamento automático das contratações. Todos os processos são encaminhados e sincronizados em tempo real com o Departamento Pessoal ou Financeiro.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={`grid grid-cols-1 ${hasDpModule ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Total de Contratações</span>
          <p className="text-2xl font-black text-slate-900">{totalContratacoes}</p>
          <span className="text-[10px] text-slate-400 font-medium">Contratações concluídas</span>
        </div>

        {hasDpModule && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Encaminhadas para DP</span>
            <p className="text-2xl font-black text-emerald-600">{rhHirings.length}</p>
            <span className="text-[10px] text-emerald-600 font-bold">Fluxo RH / Departamento Pessoal</span>
          </div>
        )}

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Encaminhadas para Financeiro</span>
          <p className="text-2xl font-black text-indigo-600">{headhunterHirings.length}</p>
          <span className="text-[10px] text-indigo-600 font-bold">Fluxo Headhunter / Faturamento</span>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        {[
          { id: 'TODAS', label: 'Todas', count: rawList.length },
          ...(hasDpModule ? [{ id: 'DP', label: 'Departamento Pessoal', count: rhHirings.length }] : []),
          { id: 'HEADHUNTER', label: 'Financeiro / Headhunter', count: headhunterHirings.length },
          ...(hasDpModule ? [{ id: 'AGUARDANDO_ADMISSAO', label: 'Aguardando Admissão' }] : []),
          { id: 'AGUARDANDO_COBRANCA', label: 'Aguardando Cobrança' },
          { id: 'FINALIZADAS', label: 'Finalizadas' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterTab(tab.id as any)}
            className={`px-3.5 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === tab.id
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                filterTab === tab.id ? 'bg-slate-100 text-slate-800 font-bold' : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mr-2" />
          <span className="text-xs text-slate-600 font-bold">Carregando registro de contratações...</span>
        </div>
      )}

      {/* Hirings Cards List */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs font-medium">
              Nenhuma contratação encontrada para o filtro selecionado.
            </div>
          ) : (
            filteredList.map(h => {
              const itemKey = h.id;
              const isHeadhunter = 
                !hasDpModule ||
                h.origemProcesso === 'HEADHUNTER' ||
                h.origemProcesso === 'headhunter' || 
                h.moduloOrigem === 'headhunter' ||
                h.origem === 'headhunter' ||
                h.destinoContratacao === 'FINANCEIRO_HEADHUNTER' ||
                h.destinoContratacao === 'headhunter' ||
                h.destino === 'Financeiro' ||
                h.destino === 'Financeiro / Headhunter' ||
                h.destino === 'Headhunter' ||
                h.encaminhadoPara === 'financeiro' ||
                h.isHeadhunter === true;
              
              // Sincronização automática em tempo real dos status dos módulos DP e Financeiro
              const admDoc = admissoesMap[h.id] || admissoesMap[`${h.jobId}_${h.candidateId}`] || admissoesMap[`${h.jobId}_${h.candidatoId}`];
              const cobDoc = cobrancasMap[h.id] || cobrancasMap[`${h.jobId}_${h.candidateId}`] || cobrancasMap[`${h.jobId}_${h.candidatoId}`];

              const name = h.candidatoNome || h.candidateName || 'Candidato';
              const job = h.vagaTitulo || h.jobTitle || h.cargo || 'Vaga Corporativa';
              const dateStr = formatDate(h.contratadoEm || h.dataContratacao || h.createdAt);
              const salary = Number(h.salarioContratado || h.salarioFinal || h.salario || 0);

              const currentStatus = isHeadhunter
                ? (cobDoc?.status || h.statusFinanceiro || h.statusProcesso || h.statusEncaminhamento || 'Aguardando Cobrança')
                : (admDoc?.status || h.statusAdmissao || h.statusEncaminhamento || 'Aguardando Admissão');

              const destinationLabel = isHeadhunter ? 'Financeiro / Headhunter' : 'Departamento Pessoal';

              return (
                <div key={itemKey} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Card Verde: Contratação Concluída */}
                    <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-emerald-950">Contratação concluída</h4>
                          <p className="text-[11px] font-medium text-emerald-700">
                            Data: <strong className="text-emerald-900">{dateStr}</strong>
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Contratado
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-black text-slate-900">{name}</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Cargo/Vaga: <strong className="text-slate-800">{job}</strong>
                        {h.clienteNome && <span> | Cliente: <strong className="text-slate-800">{h.clienteNome}</strong></span>}
                      </p>
                    </div>

                    {/* Origem e Destino do Processo */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl text-xs border border-slate-100">
                      <div>
                        <span className="text-slate-400 font-medium block">Destino</span>
                        <strong className="text-slate-800 font-bold block mt-0.5">
                          {destinationLabel}
                        </strong>
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium block">Status do Processo</span>
                        <span className={`inline-block px-2 py-0.5 mt-0.5 text-[10px] font-extrabold rounded-md ${
                          isHeadhunter 
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {currentStatus}
                        </span>
                      </div>

                      <div className="col-span-2 pt-1 border-t border-slate-100/60 flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Remuneração:</span>
                        <strong className="text-slate-800 font-bold">
                          {salary > 0 ? `R$ ${salary.toLocaleString('pt-BR')}` : 'Não informada'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 gap-2">
                    <button
                      onClick={() => setDetailsItem({ ...h, admDoc, cobDoc, currentStatus })}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver detalhes</span>
                    </button>

                    {/* Botão de Encaminhamento Direto para o Módulo Correto */}
                    {isHeadhunter ? (
                      <button
                        type="button"
                        onClick={() => handleOpenFinancial(h)}
                        disabled={openingFinancialId === h.id}
                        className="px-4 py-2 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white"
                      >
                        {openingFinancialId === h.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Abrindo...</span>
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Finalizar e Encaminhar ao Cliente</span>
                            <ArrowRight className="w-3 h-3 ml-0.5" />
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenAdmission(h)}
                        disabled={openingAdmissionId === h.id}
                        className="px-4 py-2 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white"
                      >
                        {openingAdmissionId === h.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Abrindo...</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Abrir Admissão</span>
                            <ArrowRight className="w-3 h-3 ml-0.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL: Detalhes da Contratação & Auditoria Timeline */}
      {detailsItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-lg font-black text-slate-900">Detalhes & Linha do Tempo</h3>
                  <p className="text-xs text-slate-500 font-medium">Registro unificado de auditoria da contratação</p>
                </div>
              </div>
              <button 
                onClick={() => setDetailsItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Candidato</span>
                <strong className="text-slate-900 font-bold text-sm block mt-0.5">
                  {detailsItem.candidatoNome || detailsItem.candidateName}
                </strong>
                {detailsItem.cpf && <span className="text-slate-400 text-[10px]">CPF: {detailsItem.cpf}</span>}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Vaga / Cargo</span>
                <strong className="text-slate-900 font-bold text-sm block mt-0.5">
                  {detailsItem.vagaTitulo || detailsItem.jobTitle}
                </strong>
                {detailsItem.department && <span className="text-slate-400 text-[10px]">Depto: {detailsItem.department}</span>}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Data da Contratação</span>
                <strong className="text-slate-900 font-bold block mt-0.5">
                  {formatDate(detailsItem.contratadoEm || detailsItem.dataContratacao || detailsItem.createdAt)}
                </strong>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Remuneração Combinada</span>
                <strong className="text-emerald-700 font-black block mt-0.5">
                  {detailsItem.salarioContratado || detailsItem.salarioFinal
                    ? `R$ ${Number(detailsItem.salarioContratado || detailsItem.salarioFinal).toLocaleString('pt-BR')}`
                    : 'Não informada'}
                </strong>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Origem do Processo</span>
                <strong className="text-slate-900 font-bold block mt-0.5 capitalize">
                  {detailsItem.origemProcesso === 'headhunter' ? 'Headhunter (Cliente Externo)' : 'RH Interno / Empresa'}
                </strong>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Destino & Status Atual</span>
                <strong className="text-indigo-700 font-bold block mt-0.5">
                  {detailsItem.currentStatus}
                </strong>
              </div>
            </div>

            {/* Linha do Tempo e Auditoria Sincronizada */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <History className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Histórico de Auditoria & Timeline Sincronizada</h4>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {/* Timeline unificada */}
                {[
                  ...(detailsItem.timeline || []),
                  ...(detailsItem.admDoc?.historicoEtapas || []).map((e: any) => ({
                    id: e.id || `adm-evt-${e.dataHora}`,
                    title: e.acao || 'Atualização DP',
                    description: e.descricao || `Status: ${e.novoStatus || 'Sincronizado'}`,
                    date: e.dataHora ? e.dataHora.replace('T', ' ').substring(0, 16) : 'Recente',
                    by: e.usuario || 'Departamento Pessoal'
                  })),
                  ...(detailsItem.cobDoc?.historicoStatus || []).map((e: any) => ({
                    id: e.id || `cob-evt-${e.dataHora}`,
                    title: 'Atualização Financeiro',
                    description: e.descricao || `Status: ${e.novoStatus}`,
                    date: e.dataHora ? e.dataHora.replace('T', ' ').substring(0, 16) : 'Recente',
                    by: e.usuario || 'Financeiro'
                  }))
                ].length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Sem registros adicionais na linha do tempo.</p>
                ) : (
                  [
                    ...(detailsItem.timeline || []),
                    ...(detailsItem.admDoc?.historicoEtapas || []).map((e: any) => ({
                      id: e.id || `adm-evt-${e.dataHora}`,
                      title: e.acao || 'Atualização DP',
                      description: e.descricao || `Status: ${e.novoStatus || 'Sincronizado'}`,
                      date: e.dataHora ? e.dataHora.replace('T', ' ').substring(0, 16) : 'Recente',
                      by: e.usuario || 'Departamento Pessoal'
                    })),
                    ...(detailsItem.cobDoc?.historicoStatus || []).map((e: any) => ({
                      id: e.id || `cob-evt-${e.dataHora}`,
                      title: 'Atualização Financeiro',
                      description: e.descricao || `Status: ${e.novoStatus}`,
                      date: e.dataHora ? e.dataHora.replace('T', ' ').substring(0, 16) : 'Recente',
                      by: e.usuario || 'Financeiro'
                    }))
                  ].map((evt: any, idx: number) => (
                    <div key={evt.id || idx} className="flex gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 items-start">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                      <div className="space-y-0.5 flex-1">
                        <div className="flex justify-between items-center">
                          <strong className="text-slate-900 font-bold">{evt.title}</strong>
                          <span className="text-[10px] text-slate-400">{evt.date}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{evt.description}</p>
                        {evt.by && <span className="text-[10px] text-slate-400 block">Por: {evt.by}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDetailsItem(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
