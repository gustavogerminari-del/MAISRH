import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  addDoc 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { sanitizeFirestoreData } from '../../lib/firestoreUtils';
import { 
  ProcessoRescisaoCompleto, 
  TipoDesligamento, 
  StatusRescisao,
  TipoAvisoPrevio,
  ItemMemoriaCalculo,
  AprovaRescisao,
  EntrevistaDesligamento,
  DadoElegibilidadeRehire,
  RegraDesligamentoEmpresa 
} from '../types/terminationTypes';
import { 
  ColaboradorCompleto, 
  BeneficioColaboradorIndividual 
} from '../types/dp';
import { 
  DP_COLLECTIONS, 
  addHistoricoEventoFirestore, 
  getEmployeeBenefitsFirestore, 
  updateEmployeeBenefitStatusFirestore 
} from './dpFirestoreService';

const TERMINATIONS_COLLECTION = 'terminations';
const TERMINATION_RULES_COLLECTION = 'termination_event_rules';

export async function listTerminationsFirestore(companyId: string): Promise<ProcessoRescisaoCompleto[]> {
  const empId = companyId || 'emp-001';
  try {
    const q = query(
      collection(db, TERMINATIONS_COLLECTION),
      where('companyId', '==', empId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

    const list: ProcessoRescisaoCompleto[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as ProcessoRescisaoCompleto);
    });

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (error) {
    console.warn('[Rescisão Firestore] Erro ao buscar rescisões:', error);
    return [];
  }
}

export async function saveTerminationFirestore(processo: ProcessoRescisaoCompleto): Promise<void> {
  try {
    const docRef = doc(db, TERMINATIONS_COLLECTION, processo.id);
    const sanitized = sanitizeFirestoreData({
      ...processo,
      companyId: processo.companyId || 'emp-001',
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, sanitized, { merge: true });

    // Registra auditoria
    await addAuditLogFirestore({
      companyId: processo.companyId,
      userId: processo.requestedBy || 'system',
      employeeId: processo.employeeId,
      terminationId: processo.id,
      entity: 'terminations',
      entityId: processo.id,
      action: 'Atualização do Processo',
      description: `Processo de desligamento de ${processo.employeeName} atualizado para status "${processo.status}".`,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Rescisão Firestore] Erro ao salvar rescisão:', error);
  }
}

export async function createTerminationRequestFirestore(
  data: Partial<ProcessoRescisaoCompleto>,
  colab: ColaboradorCompleto,
  user: { id: string; name: string; role: string }
): Promise<ProcessoRescisaoCompleto> {
  const companyId = colab.companyId || 'emp-001';
  const newId = `term-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  // Calculate default notice and initial memory items
  const salario = colab.profissionais.salarioBase || 3500;
  const dataAdm = new Date(colab.profissionais.dataAdmissao || '2023-01-01');
  const dataDesl = new Date(data.plannedTerminationDate || now.split('T')[0]);

  const diffYears = Math.max(0, Math.floor((dataDesl.getTime() - dataAdm.getTime()) / (1000 * 3600 * 24 * 365)));
  const noticeDays = Math.min(90, 30 + (diffYears * 3));

  const dayOfMonth = dataDesl.getDate();
  const valorSaldo = (salario / 30) * dayOfMonth;
  const isIndemnified = data.notice?.noticeType === 'Indenizado' || true;
  const valorAviso = isIndemnified ? (salario / 30) * noticeDays : 0;
  const mesAtual = dataDesl.getMonth() + 1;
  const valor13Prop = (salario / 12) * mesAtual;
  const valorFeriasProp = (salario / 12) * mesAtual;
  const umTercoFerias = valorFeriasProp / 3;

  const totalProventos = valorSaldo + valorAviso + valor13Prop + valorFeriasProp + umTercoFerias;
  const descInss = Math.min(908.85, totalProventos * 0.11);
  const descIrrf = Math.max(0, (totalProventos - descInss) * 0.15 - 381.44);
  const totalDescontos = descInss + descIrrf;

  const fgtsBalance = salario * 8 * 12;
  const typeStr = data.terminationType || 'Dispensa sem justa causa';
  const finePerc = typeStr.includes('sem justa causa') ? 40 : typeStr.includes('acordo') ? 20 : 0;
  const fineVal = (fgtsBalance * finePerc) / 100;

  const calculationItems: ItemMemoriaCalculo[] = [
    {
      id: `calc-1`,
      companyId,
      terminationId: newId,
      employeeId: colab.id,
      eventCode: '101',
      eventName: 'Saldo de Salário',
      type: 'Provento',
      calculationBase: salario,
      quantity: dayOfMonth,
      reference: `${dayOfMonth} dias`,
      grossValue: valorSaldo,
      discountValue: 0,
      netValue: valorSaldo,
      source: 'Calculado',
      manual: false,
      createdAt: now,
      updatedAt: now
    },
    {
      id: `calc-2`,
      companyId,
      terminationId: newId,
      employeeId: colab.id,
      eventCode: '102',
      eventName: 'Aviso-Prévio Indenizado',
      type: 'Provento',
      calculationBase: salario,
      quantity: noticeDays,
      reference: `${noticeDays} dias`,
      grossValue: valorAviso,
      discountValue: 0,
      netValue: valorAviso,
      source: 'Calculado',
      manual: false,
      createdAt: now,
      updatedAt: now
    },
    {
      id: `calc-3`,
      companyId,
      terminationId: newId,
      employeeId: colab.id,
      eventCode: '103',
      eventName: '13º Salário Proporcional',
      type: 'Provento',
      calculationBase: salario,
      quantity: mesAtual,
      reference: `${mesAtual}/12 avos`,
      grossValue: valor13Prop,
      discountValue: 0,
      netValue: valor13Prop,
      source: 'Calculado',
      manual: false,
      createdAt: now,
      updatedAt: now
    },
    {
      id: `calc-4`,
      companyId,
      terminationId: newId,
      employeeId: colab.id,
      eventCode: '104',
      eventName: 'Férias Proporcionais + 1/3',
      type: 'Provento',
      calculationBase: salario,
      quantity: mesAtual,
      reference: `${mesAtual}/12 avos`,
      grossValue: valorFeriasProp + umTercoFerias,
      discountValue: 0,
      netValue: valorFeriasProp + umTercoFerias,
      source: 'Calculado',
      manual: false,
      createdAt: now,
      updatedAt: now
    },
    {
      id: `calc-5`,
      companyId,
      terminationId: newId,
      employeeId: colab.id,
      eventCode: '201',
      eventName: 'Desconto INSS Rescisório',
      type: 'Desconto',
      calculationBase: totalProventos,
      quantity: 11,
      reference: 'Tabela INSS',
      grossValue: descInss,
      discountValue: descInss,
      netValue: -descInss,
      source: 'Calculado',
      manual: false,
      createdAt: now,
      updatedAt: now
    },
    {
      id: `calc-6`,
      companyId,
      terminationId: newId,
      employeeId: colab.id,
      eventCode: '202',
      eventName: 'Desconto IRRF Rescisório',
      type: 'Desconto',
      calculationBase: totalProventos - descInss,
      quantity: 15,
      reference: 'Tabela IRRF',
      grossValue: descIrrf,
      discountValue: descIrrf,
      netValue: -descIrrf,
      source: 'Calculado',
      manual: false,
      createdAt: now,
      updatedAt: now
    }
  ];

  const defaultChecklist = [
    {
      id: `chk-1`,
      companyId,
      terminationId: newId,
      title: 'Solicitação e Justificativa Aprovadas',
      description: 'Confirmação do gestor e RH quanto aos motivos do desligamento.',
      required: true,
      responsibleRole: 'RH',
      status: 'Concluído' as const,
      completedAt: now,
      completedBy: user.name
    },
    {
      id: `chk-2`,
      companyId,
      terminationId: newId,
      title: 'Comunicação do Aviso-Prévio Assinado',
      description: 'Entrega formal da notificação de aviso-prévio ao colaborador.',
      required: true,
      responsibleRole: 'RH',
      status: 'Pendente' as const
    },
    {
      id: `chk-3`,
      companyId,
      terminationId: newId,
      title: 'Exame Médico Demissional (ASO)',
      description: 'Realização de exame em clínica credenciada com ASO Apto emitido.',
      required: true,
      responsibleRole: 'Segurança e Saúde',
      status: 'Pendente' as const
    },
    {
      id: `chk-4`,
      companyId,
      terminationId: newId,
      title: 'Devolução de Equipamentos e Crachá',
      description: 'Recebimento de notebooks, celulares, crachás e periféricos fornecidos.',
      required: true,
      responsibleRole: 'TI / Gestor',
      status: 'Pendente' as const
    },
    {
      id: `chk-5`,
      companyId,
      terminationId: newId,
      title: 'Encerramento de Benefícios Ativos',
      description: 'Cancelamento dos planos de saúde, refeição, transporte e outros.',
      required: true,
      responsibleRole: 'RH / DP',
      status: 'Pendente' as const
    },
    {
      id: `chk-6`,
      companyId,
      terminationId: newId,
      title: 'Bloqueio de Acessos de Rede e Sistemas',
      description: 'Revogação de permissões no portal, e-mails e VPN corporativa.',
      required: true,
      responsibleRole: 'TI / Segurança',
      status: 'Pendente' as const
    },
    {
      id: `chk-7`,
      companyId,
      terminationId: newId,
      title: 'Entrevista de Desligamento Concluída',
      description: 'Aplicação do formulário de feedback de saída.',
      required: false,
      responsibleRole: 'RH',
      status: 'Pendente' as const
    }
  ];

  const defaultAssets = [
    {
      id: `ast-1`,
      companyId,
      terminationId: newId,
      assetId: `asset-nb-${colab.id}`,
      assetName: 'Notebook Corporativo',
      serialNumber: `BR-NB-${Math.floor(1000 + Math.random() * 9000)}`,
      conditionAtDelivery: 'Bom' as const,
      returned: false
    },
    {
      id: `ast-2`,
      companyId,
      terminationId: newId,
      assetId: `asset-crach-${colab.id}`,
      assetName: 'Crachá de Acesso & Chave',
      conditionAtDelivery: 'Novo' as const,
      returned: false
    }
  ];

  const newProcess: ProcessoRescisaoCompleto = {
    id: newId,
    companyId,
    employeeId: colab.id,
    employeeName: colab.nomeCompleto,
    employeeCpf: colab.pessoais?.cpf,
    employeeDepartment: colab.profissionais?.departamento,
    employeeRole: colab.profissionais?.cargo,
    salaryBase: salario,
    admissionDate: colab.profissionais?.dataAdmissao || '2023-01-01',

    terminationType: typeStr as TipoDesligamento,
    requestDate: now.split('T')[0],
    plannedTerminationDate: data.plannedTerminationDate || now.split('T')[0],
    lastWorkingDay: data.lastWorkingDay || data.plannedTerminationDate || now.split('T')[0],
    reason: data.reason || 'Desligamento solicitado conforme política corporativa.',
    requestedBy: user.id,
    requestedByName: user.name,
    managerId: colab.profissionais?.gestorResponsavel || user.id,
    notes: data.notes || '',
    status: 'Solicitada',

    approvals: [
      {
        id: `app-1`,
        approverId: user.id,
        approverName: user.name,
        approverRole: user.role || 'Analista RH',
        decision: 'Aprovado',
        reason: 'Solicitação inicial formalizada.',
        createdAt: now
      },
      {
        id: `app-2`,
        approverId: 'gestor-01',
        approverName: colab.profissionais?.gestorResponsavel || 'Gestor Direto',
        approverRole: 'Gestor Direto',
        decision: 'Aprovado',
        reason: 'Aprovação alinhada com diretoria.',
        createdAt: now
      }
    ],

    notice: {
      noticeType: (data.notice?.noticeType || 'Indenizado') as TipoAvisoPrevio,
      noticeStartDate: now.split('T')[0],
      noticeEndDate: data.plannedTerminationDate || now.split('T')[0],
      noticeDays,
      workedDays: data.notice?.noticeType === 'Trabalhado' ? noticeDays : 0,
      indemnifiedDays: data.notice?.noticeType === 'Indenizado' ? noticeDays : 0,
      employeeReleased: false,
      reductionOption: '2 horas diárias',
      observations: 'Aviso prévio alinhado conforme legislação.'
    },

    calculationItems,
    checklist: defaultChecklist,
    assets: defaultAssets,
    medicalExam: {
      needsExam: true,
      result: 'Pendente',
      notes: 'Agendamento de exame ASO demissional pendente.'
    },

    totalGross: totalProventos,
    totalDiscounts: totalDescontos,
    totalNet: totalProventos - totalDescontos,
    fgtsBalanceEstimate: fgtsBalance,
    fgtsFinePercentage: finePerc,
    fgtsFineValue: fineVal,

    createdAt: now,
    updatedAt: now
  };

  await saveTerminationFirestore(newProcess);

  // Registra no histórico do colaborador
  await addHistoricoEventoFirestore({
    empresaId: companyId,
    colaboradorId: colab.id,
    moduloOrigem: 'Rescisões',
    tipoEvento: 'Abertura de Solicitação de Desligamento',
    descricao: `Iniciado processo de desligamento (${newProcess.terminationType}). Data prevista: ${newProcess.plannedTerminationDate}. Solicitante: ${user.name}.`,
    dataHora: now
  });

  return newProcess;
}

export async function concluirDesligamentoCompletoFirestore(
  companyId: string,
  terminationId: string,
  user: { id: string; name: string }
): Promise<{ success: boolean; message: string }> {
  try {
    const docRef = doc(db, TERMINATIONS_COLLECTION, terminationId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { success: false, message: 'Processo de rescisão não encontrado.' };
    }

    const process = docSnap.data() as ProcessoRescisaoCompleto;

    // 1. Validar aprovações pendentes
    const hasPendingApprovals = process.approvals.some(a => a.decision === 'Pendente');
    if (hasPendingApprovals) {
      return { success: false, message: 'Existem aprovações pendentes na rescisão.' };
    }

    // 2. Validar checklist obrigatório
    const pendingRequiredChecklist = process.checklist.filter(c => c.required && c.status !== 'Concluído');
    if (pendingRequiredChecklist.length > 0) {
      return { 
        success: false, 
        message: `Existem ${pendingRequiredChecklist.length} itens obrigatórios do checklist pendentes (ex: ${pendingRequiredChecklist[0].title}).` 
      };
    }

    const now = new Date().toISOString();

    // 3. Atualizar o colaborador para status 'Rescindido' / 'DESLIGADO' e Bloquear acesso
    const colabRef = doc(db, DP_COLLECTIONS.COLABORADORES, process.employeeId);
    const colabSnap = await getDoc(colabRef);

    if (colabSnap.exists()) {
      const colabData = colabSnap.data() as ColaboradorCompleto;
      const updatedColab: ColaboradorCompleto = {
        ...colabData,
        profissionais: {
          ...colabData.profissionais,
          status: 'Rescindido'
        },
        acessoColaborador: {
          ...(colabData.acessoColaborador || { loginUsername: colabData.pessoais?.emailPessoal || '', senhaCriada: false }),
          statusAcesso: 'Bloqueado'
        },
        updatedAt: now
      };
      await setDoc(colabRef, sanitizeFirestoreData(updatedColab), { merge: true });
    }

    // 4. Encerrar benefícios ativos APENAS deste colaborador
    const activeBenefits = await getEmployeeBenefitsFirestore(companyId, process.employeeId);
    const benefitsToClose = activeBenefits.filter(b => b.status === 'Ativo' || b.status === 'Pendente');

    for (const ben of benefitsToClose) {
      await updateEmployeeBenefitStatusFirestore(
        companyId,
        ben.id,
        'Encerrado',
        user.id,
        user.name,
        `Benefício encerrado automaticamente pela conclusão do desligamento em ${process.lastWorkingDay}`
      );
    }

    // 5. Atualizar processo de rescisão para 'Concluída'
    const updatedProcess: ProcessoRescisaoCompleto = {
      ...process,
      status: 'Concluída',
      completedAt: now,
      completedBy: user.name,
      updatedAt: now
    };

    await setDoc(docRef, sanitizeFirestoreData(updatedProcess), { merge: true });

    // 6. Histórico e Auditoria
    await addHistoricoEventoFirestore({
      empresaId: companyId,
      colaboradorId: process.employeeId,
      moduloOrigem: 'Rescisões',
      tipoEvento: 'Conclusão de Desligamento',
      descricao: `Desligamento concluído por ${user.name}. Colaborador alterado para DESLIGADO, contrato encerrado, benefícios ativos encerrados e acessos revogados.`,
      dataHora: now
    });

    await addAuditLogFirestore({
      companyId,
      userId: user.id,
      employeeId: process.employeeId,
      terminationId,
      entity: 'terminations',
      entityId: terminationId,
      action: 'CONCLUIR DESLIGAMENTO',
      description: `Operação de encerramento do contrato de trabalho executada com sucesso.`,
      createdAt: now
    });

    return { success: true, message: 'Desligamento concluído com sucesso! Colaborador desligado, acessos bloqueados e benefícios encerrados.' };
  } catch (error) {
    console.error('[Rescisão Firestore] Erro ao concluir desligamento:', error);
    return { success: false, message: 'Erro ao executar a conclusão do desligamento.' };
  }
}

export async function cancelarRescisaoFirestore(
  companyId: string,
  terminationId: string,
  user: { id: string; name: string },
  reason: string
): Promise<void> {
  const docRef = doc(db, TERMINATIONS_COLLECTION, terminationId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const process = docSnap.data() as ProcessoRescisaoCompleto;
    const now = new Date().toISOString();

    const updated: ProcessoRescisaoCompleto = {
      ...process,
      status: 'Cancelada',
      canceledAt: now,
      canceledBy: user.name,
      cancellationReason: reason,
      updatedAt: now
    };

    await setDoc(docRef, sanitizeFirestoreData(updated), { merge: true });

    await addHistoricoEventoFirestore({
      empresaId: companyId,
      colaboradorId: process.employeeId,
      moduloOrigem: 'Rescisões',
      tipoEvento: 'Cancelamento de Rescisão',
      descricao: `Processo de desligamento cancelado por ${user.name}. Motivo: ${reason}`,
      dataHora: now
    });
  }
}

export async function reabrirRescisaoFirestore(
  companyId: string,
  terminationId: string,
  user: { id: string; name: string },
  reason: string
): Promise<void> {
  const docRef = doc(db, TERMINATIONS_COLLECTION, terminationId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const process = docSnap.data() as ProcessoRescisaoCompleto;
    const now = new Date().toISOString();

    const updated: ProcessoRescisaoCompleto = {
      ...process,
      status: 'Reaberta',
      reopenedAt: now,
      reopenedBy: user.name,
      reopenedReason: reason,
      updatedAt: now
    };

    await setDoc(docRef, sanitizeFirestoreData(updated), { merge: true });

    await addHistoricoEventoFirestore({
      empresaId: companyId,
      colaboradorId: process.employeeId,
      moduloOrigem: 'Rescisões',
      tipoEvento: 'Reabertura de Rescisão',
      descricao: `Processo de desligamento reaberto por ${user.name}. Motivo: ${reason}`,
      dataHora: now
    });
  }
}

export async function addAuditLogFirestore(log: {
  companyId: string;
  userId: string;
  employeeId?: string;
  terminationId?: string;
  entity: string;
  entityId: string;
  action: string;
  description: string;
  createdAt: string;
}): Promise<void> {
  try {
    const logId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    await setDoc(doc(db, DP_COLLECTIONS.AUDIT_LOGS, logId), sanitizeFirestoreData({
      ...log,
      id: logId
    }));
  } catch (err) {
    console.warn('[Audit Log] Erro ao gravar auditoria:', err);
  }
}
