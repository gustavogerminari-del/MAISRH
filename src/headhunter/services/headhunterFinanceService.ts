import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  HeadhunterReceita, 
  HeadhunterExpense, 
  HeadhunterCommission, 
  HeadhunterGarantia,
  RentabilidadeVaga,
  ReceitaStatus,
  CommissionStatus,
  GarantiaStatus
} from '../types';

const COLLECTIONS = {
  RECEITAS: 'receitas',
  DESPESAS: 'despesas',
  COMISSOES: 'comissoes',
  GARANTIAS: 'garantias',
  AUDIT: 'historicos_financeiros'
};

// Mock Initial seed data for fallback
const INITIAL_RECEITAS: HeadhunterReceita[] = [
  {
    id: 'rec-101',
    empresaId: 'emp-001',
    criadoPor: 'Carlos Headhunter',
    criadoEm: '2026-02-22',
    status: 'Ativo',
    clienteId: 'cli-101',
    clienteNome: 'Grupo Nexus Tech',
    vagaId: 'job-303',
    vagaCodigo: 'VAGA-00303',
    vagaTitulo: 'Chief Technology Officer (CTO)',
    candidatoId: 'cand-406',
    candidatoNome: 'Alexandre Prado',
    contratacaoId: 'hir-601',
    propostaId: 'prop-101',
    contratoId: 'ctr-201',
    origemModulo: 'headhunter',
    origemTipo: 'contratacao',
    origemId: 'hir-601',
    tipoReceita: 'Principal',
    valorContratado: 90000,
    valorRecebido: 90000,
    saldo: 0,
    dataEmissao: '2026-02-22',
    dataVencimento: '2026-03-15',
    dataRecebimento: '2026-03-12',
    formaPagamento: 'PIX',
    numeroNotaFiscal: 'NF-2026-042',
    situacao: 'Recebida',
    observacoes: 'Honorários de Executive Search quitados antecipadamente.',
    parcelas: [
      { numero: 1, valor: 90000, vencimento: '2026-03-15', status: 'Pago', dataPagamento: '2026-03-12', formaPagamento: 'PIX' }
    ]
  },
  {
    id: 'rec-102',
    empresaId: 'emp-001',
    criadoPor: 'Carlos Headhunter',
    criadoEm: '2026-03-01',
    status: 'Ativo',
    clienteId: 'cli-101',
    clienteNome: 'Grupo Nexus Tech',
    vagaId: 'job-301',
    vagaCodigo: 'VAGA-00301',
    vagaTitulo: 'Head of Growth & Performance Marketing',
    candidatoId: 'cand-401',
    candidatoNome: 'Eduardo Albuquerque',
    contratacaoId: 'hir-602',
    propostaId: 'prop-101',
    contratoId: 'ctr-201',
    origemModulo: 'headhunter',
    origemTipo: 'contratacao',
    origemId: 'hir-602',
    tipoReceita: 'Principal',
    valorContratado: 56000,
    valorRecebido: 28000,
    saldo: 28000,
    dataEmissao: '2026-03-01',
    dataVencimento: '2026-04-15',
    formaPagamento: 'Boleto',
    situacao: 'Parcialmente Recebida',
    observacoes: 'Faturamento parcelado em 2x de R$ 28.000.',
    parcelas: [
      { numero: 1, valor: 28000, vencimento: '2026-03-15', status: 'Pago', dataPagamento: '2026-03-15', formaPagamento: 'Boleto' },
      { numero: 2, valor: 28000, vencimento: '2026-04-15', status: 'Pendente' }
    ]
  }
];

const INITIAL_DESPESAS: HeadhunterExpense[] = [
  {
    id: 'exp-101',
    empresaId: 'emp-001',
    criadoPor: 'Carlos Headhunter',
    criadoEm: '2026-02-12',
    status: 'Ativo',
    tipoDespesa: 'vaga',
    clienteId: 'cli-101',
    clienteNome: 'Grupo Nexus Tech',
    vagaId: 'job-301',
    vagaTitulo: 'Head of Growth & Performance Marketing',
    consultorNome: 'Carlos Headhunter',
    responsavel: 'Carlos Headhunter',
    centroCusto: 'Viagens & Deslocamento',
    categoria: 'Deslocamento / Uber',
    descricao: 'Deslocamento para reunião presencial na sede do cliente na Av. Paulista.',
    data: '2026-02-12',
    valor: 145.80,
    situacao: 'Pago'
  },
  {
    id: 'exp-102',
    empresaId: 'emp-001',
    criadoPor: 'Mariana Souza',
    criadoEm: '2026-02-18',
    status: 'Ativo',
    tipoDespesa: 'vaga',
    clienteId: 'cli-102',
    clienteNome: 'Vanguard Pharma',
    vagaId: 'job-302',
    vagaTitulo: 'Diretor Industrial e Regulatório',
    consultorNome: 'Mariana Souza',
    responsavel: 'Mariana Souza',
    centroCusto: 'Alimentação & Relacionamento',
    categoria: 'Alimentação',
    descricao: 'Almoço de alinhamento estratégico com o Diretor Geral Roberto Alencar.',
    data: '2026-02-18',
    valor: 320.00,
    situacao: 'Pago'
  },
  {
    id: 'exp-103',
    empresaId: 'emp-001',
    criadoPor: 'Carlos Headhunter',
    criadoEm: '2026-03-01',
    status: 'Ativo',
    tipoDespesa: 'geral',
    consultorNome: 'Carlos Headhunter',
    responsavel: 'Financeiro Central',
    centroCusto: 'Operacional & Softwares',
    categoria: 'Plataforma / LinkedIn',
    descricao: 'Licença mensal do LinkedIn Recruiter Corporate',
    data: '2026-03-01',
    valor: 4200.00,
    situacao: 'Pendente',
    observacao: 'Despesa geral da consultoria (não vinculada a vaga individual).'
  }
];

const INITIAL_COMISSOES: HeadhunterCommission[] = [
  {
    id: 'com-101',
    empresaId: 'emp-001',
    criadoPor: 'Carlos Headhunter',
    criadoEm: '2026-02-22',
    status: 'Ativo',
    beneficiarioNome: 'Carlos Headhunter',
    clienteId: 'cli-101',
    clienteNome: 'Grupo Nexus Tech',
    vagaId: 'job-303',
    vagaTitulo: 'Chief Technology Officer (CTO)',
    consultorNome: 'Carlos Headhunter',
    tipoComissao: 'Percentual',
    valorRecebidoVaga: 90000,
    percentual: 20,
    valorComissao: 18000,
    valorPago: 18000,
    dataPrevista: '2026-03-20',
    dataLiberacao: '2026-03-12',
    dataPagamento: '2026-03-15',
    situacao: 'Paga',
    regraLiberacao: 'cliente_pagou',
    formaPagamento: 'PIX',
    observacoes: 'Comissão quitada após recebimento integral do cliente.'
  },
  {
    id: 'com-102',
    empresaId: 'emp-001',
    criadoPor: 'Mariana Souza',
    criadoEm: '2026-03-01',
    status: 'Ativo',
    beneficiarioNome: 'Mariana Souza',
    clienteId: 'cli-102',
    clienteNome: 'Vanguard Pharma',
    vagaId: 'job-302',
    vagaTitulo: 'Diretor Industrial e Regulatório',
    consultorNome: 'Mariana Souza',
    tipoComissao: 'Percentual',
    valorRecebidoVaga: 83600,
    percentual: 15,
    valorComissao: 12540,
    valorPago: 0,
    dataPrevista: '2026-04-15',
    situacao: 'Prevista',
    regraLiberacao: 'cliente_pagou',
    observacoes: 'Comissão estimada ao finalizar contratação.'
  }
];

const INITIAL_GARANTIAS: HeadhunterGarantia[] = [
  {
    id: 'gar-101',
    empresaId: 'emp-001',
    criadoPor: 'Carlos Headhunter',
    criadoEm: '2026-02-22',
    status: 'Ativo',
    clienteId: 'cli-101',
    clienteNome: 'Grupo Nexus Tech',
    vagaId: 'job-303',
    vagaTitulo: 'Chief Technology Officer (CTO)',
    candidatoId: 'cand-406',
    candidatoNome: 'Lucas Silveira',
    contratacaoId: 'hir-101',
    dataInicial: '2026-03-01',
    dataFinal: '2026-05-30',
    prazoDias: 90,
    situacao: 'Ativa',
    observacoes: 'Garantia contratual de 90 dias corrida com reposição gratuita.'
  }
];

// In-memory caches for synchronous immediate access
let receitasCache: HeadhunterReceita[] = [...INITIAL_RECEITAS];
let despesasCache: HeadhunterExpense[] = [...INITIAL_DESPESAS];
let comissoesCache: HeadhunterCommission[] = [...INITIAL_COMISSOES];
let garantiasCache: HeadhunterGarantia[] = [...INITIAL_GARANTIAS];

// Sync function with Firestore
export async function syncHeadhunterFinanceWithFirestore(): Promise<void> {
  try {
    const recSnap = await getDocs(collection(db, COLLECTIONS.RECEITAS));
    if (!recSnap.empty) {
      receitasCache = recSnap.docs.map(d => ({ id: d.id, ...d.data() } as HeadhunterReceita));
    }

    const despSnap = await getDocs(collection(db, COLLECTIONS.DESPESAS));
    if (!despSnap.empty) {
      despesasCache = despSnap.docs.map(d => ({ id: d.id, ...d.data() } as HeadhunterExpense));
    }

    const comSnap = await getDocs(collection(db, COLLECTIONS.COMISSOES));
    if (!comSnap.empty) {
      comissoesCache = comSnap.docs.map(d => ({ id: d.id, ...d.data() } as HeadhunterCommission));
    }

    const garSnap = await getDocs(collection(db, COLLECTIONS.GARANTIAS));
    if (!garSnap.empty) {
      garantiasCache = garSnap.docs.map(d => ({ id: d.id, ...d.data() } as HeadhunterGarantia));
    }
  } catch (err) {
    console.warn('Headhunter Finance Firestore Sync Note:', err);
  }
}

// Initial auto-sync
syncHeadhunterFinanceWithFirestore();

export class HeadhunterFinanceService {
  // RECEITAS
  static getReceitas(companyId: string = 'emp-001'): HeadhunterReceita[] {
    return receitasCache.filter(r => !companyId || r.empresaId === companyId || companyId === 'emp-001');
  }

  static async saveReceita(receita: HeadhunterReceita): Promise<HeadhunterReceita> {
    const id = receita.id || `rec-${Date.now()}`;
    const newReceita: HeadhunterReceita = {
      ...receita,
      id,
      empresaId: receita.empresaId || 'emp-001',
      saldo: (receita.valorContratado || 0) - (receita.valorRecebido || 0),
      criadoEm: receita.criadoEm || new Date().toISOString().split('T')[0]
    };

    receitasCache = [newReceita, ...receitasCache.filter(r => r.id !== id)];

    try {
      await setDoc(doc(db, COLLECTIONS.RECEITAS, id), newReceita, { merge: true });
    } catch (err) {
      console.error('Error saving receita in Firestore:', err);
    }

    return newReceita;
  }

  static async registrarPagamentoReceita(receitaId: string, valorPago: number, formaPagamento: string, dataPagamento: string, observacoes?: string): Promise<HeadhunterReceita | null> {
    const receita = receitasCache.find(r => r.id === receitaId);
    if (!receita) return null;

    const novoValorRecebido = (receita.valorRecebido || 0) + valorPago;
    const novoSaldo = Math.max(0, receita.valorContratado - novoValorRecebido);
    const novaSituacao: ReceitaStatus = novoSaldo === 0 ? 'Recebida' : 'Parcialmente Recebida';

    const historicoAtual = receita.historico || [];
    historicoAtual.push({
      data: new Date().toISOString().split('T')[0],
      alteracao: `Baixa de R$ ${valorPago.toLocaleString('pt-BR')} via ${formaPagamento}`,
      usuario: 'Gestor Financeiro',
      valorAnterior: receita.valorRecebido,
      valorNovo: novoValorRecebido,
      motivo: observacoes || 'Recebimento de cliente'
    });

    const receitaAtualizada: HeadhunterReceita = {
      ...receita,
      valorRecebido: novoValorRecebido,
      saldo: novoSaldo,
      situacao: novaSituacao,
      formaPagamento: formaPagamento as any,
      dataRecebimento: dataPagamento,
      historico: historicoAtual
    };

    return this.saveReceita(receitaAtualizada);
  }

  static async estornarReceita(receitaId: string, motivo: string): Promise<HeadhunterReceita | null> {
    const receita = receitasCache.find(r => r.id === receitaId);
    if (!receita) return null;

    const historicoAtual = receita.historico || [];
    historicoAtual.push({
      data: new Date().toISOString().split('T')[0],
      alteracao: 'Estorno total do lançamento de receita',
      usuario: 'Gestor Financeiro',
      valorAnterior: receita.valorRecebido,
      valorNovo: 0,
      motivo
    });

    const receitaEstornada: HeadhunterReceita = {
      ...receita,
      situacao: 'Estornada',
      valorRecebido: 0,
      saldo: receita.valorContratado,
      historico: historicoAtual
    };

    return this.saveReceita(receitaEstornada);
  }

  // DESPESAS
  static getDespesas(companyId: string = 'emp-001'): HeadhunterExpense[] {
    return despesasCache.filter(d => !companyId || d.empresaId === companyId || companyId === 'emp-001');
  }

  static async saveDespesa(expense: HeadhunterExpense): Promise<HeadhunterExpense> {
    const id = expense.id || `exp-${Date.now()}`;
    const newExpense: HeadhunterExpense = {
      ...expense,
      id,
      empresaId: expense.empresaId || 'emp-001',
      criadoEm: expense.criadoEm || new Date().toISOString().split('T')[0]
    };

    despesasCache = [newExpense, ...despesasCache.filter(d => d.id !== id)];

    try {
      await setDoc(doc(db, COLLECTIONS.DESPESAS, id), newExpense, { merge: true });
    } catch (err) {
      console.error('Error saving expense in Firestore:', err);
    }

    return newExpense;
  }

  // COMISSÕES
  static getComissoes(companyId: string = 'emp-001'): HeadhunterCommission[] {
    return comissoesCache.filter(c => !companyId || c.empresaId === companyId || companyId === 'emp-001');
  }

  static async saveComissao(commission: HeadhunterCommission): Promise<HeadhunterCommission> {
    const id = commission.id || `com-${Date.now()}`;
    const newCom: HeadhunterCommission = {
      ...commission,
      id,
      empresaId: commission.empresaId || 'emp-001',
      criadoEm: commission.criadoEm || new Date().toISOString().split('T')[0]
    };

    comissoesCache = [newCom, ...comissoesCache.filter(c => c.id !== id)];

    try {
      await setDoc(doc(db, COLLECTIONS.COMISSOES, id), newCom, { merge: true });
    } catch (err) {
      console.error('Error saving commission in Firestore:', err);
    }

    return newCom;
  }

  static async liberarComissao(commissionId: string, observacao?: string): Promise<HeadhunterCommission | null> {
    const com = comissoesCache.find(c => c.id === commissionId);
    if (!com) return null;

    const hist = com.historico || [];
    hist.push({ data: new Date().toISOString().split('T')[0], acao: 'Comissão liberada para pagamento', usuario: 'Gestor Financeiro' });

    const updated: HeadhunterCommission = {
      ...com,
      situacao: 'Liberada',
      dataLiberacao: new Date().toISOString().split('T')[0],
      observacoes: observacao ? `${com.observacoes || ''} [Liberada: ${observacao}]` : com.observacoes,
      historico: hist
    };

    return this.saveComissao(updated);
  }

  static async registrarPagamentoComissao(commissionId: string, valorPago: number, formaPagamento: string, dataPagamento: string, observacoes?: string): Promise<HeadhunterCommission | null> {
    const com = comissoesCache.find(c => c.id === commissionId);
    if (!com) return null;

    const totalPago = (com.valorPago || 0) + valorPago;
    const novaSituacao: CommissionStatus = totalPago >= com.valorComissao ? 'Paga' : 'Liberada';

    const hist = com.historico || [];
    hist.push({ data: new Date().toISOString().split('T')[0], acao: `Pagamento de R$ ${valorPago.toLocaleString('pt-BR')} via ${formaPagamento}`, usuario: 'Gestor Financeiro' });

    const updated: HeadhunterCommission = {
      ...com,
      valorPago: totalPago,
      situacao: novaSituacao,
      dataPagamento: dataPagamento,
      formaPagamento,
      observacoes: observacoes ? `${com.observacoes || ''} [Pagamento: ${observacoes}]` : com.observacoes,
      historico: hist
    };

    return this.saveComissao(updated);
  }

  // GARANTIAS
  static getGarantias(companyId: string = 'emp-001'): HeadhunterGarantia[] {
    const hoje = new Date();

    return garantiasCache
      .filter(g => !companyId || g.empresaId === companyId || companyId === 'emp-001')
      .map(g => {
        const dataFim = new Date(g.dataFinal);
        const diffMs = dataFim.getTime() - hoje.getTime();
        const diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        let situacao: GarantiaStatus = g.situacao;
        if (situacao === 'Ativa' && diasRestantes <= 15 && diasRestantes > 0) {
          situacao = 'Próxima do Vencimento';
        } else if (situacao === 'Ativa' && diasRestantes <= 0) {
          situacao = 'Encerrada';
        }

        return { ...g, situacao, diasRestantes };
      });
  }

  static async saveGarantia(garantia: HeadhunterGarantia): Promise<HeadhunterGarantia> {
    const id = garantia.id || `gar-${Date.now()}`;
    const newGar: HeadhunterGarantia = {
      ...garantia,
      id,
      empresaId: garantia.empresaId || 'emp-001',
      criadoEm: garantia.criadoEm || new Date().toISOString().split('T')[0]
    };

    garantiasCache = [newGar, ...garantiasCache.filter(g => g.id !== id)];

    try {
      await setDoc(doc(db, COLLECTIONS.GARANTIAS, id), newGar, { merge: true });
    } catch (err) {
      console.error('Error saving garantia in Firestore:', err);
    }

    return newGar;
  }

  // RENTABILIDADE CALCULATOR
  static calculateRentabilidadeVagas(vagas: any[], companyId: string = 'emp-001'): RentabilidadeVaga[] {
    const receitas = this.getReceitas(companyId);
    const despesas = this.getDespesas(companyId).filter(d => d.tipoDespesa === 'vaga');
    const comissoes = this.getComissoes(companyId);

    return vagas.map(vaga => {
      const recs = receitas.filter(r => r.vagaId === vaga.id && r.situacao !== 'Cancelada' && r.situacao !== 'Estornada');
      const valorContratado = recs.reduce((acc, r) => acc + (r.valorContratado || 0), 0) || vaga.valorNegociado || vaga.valorVaga || 0;
      const valorRecebido = recs.reduce((acc, r) => acc + (r.valorRecebido || 0), 0);

      const desps = despesas.filter(d => d.vagaId === vaga.id && d.situacao !== 'Cancelado');
      const totalDespesasVaga = desps.reduce((acc, d) => acc + d.valor, 0);

      const coms = comissoes.filter(c => c.vagaId === vaga.id && c.situacao !== 'Cancelada');
      const totalComissao = coms.reduce((acc, c) => acc + c.valorComissao, 0);

      const lucroLiquido = valorContratado - totalDespesasVaga - totalComissao;
      const margemPercentual = valorContratado > 0 ? (lucroLiquido / valorContratado) * 100 : 0;

      return {
        vagaId: vaga.id,
        vagaTitulo: vaga.titulo || vaga.cargo || 'Vaga Sem Título',
        clienteId: vaga.clienteId || '',
        clienteNome: vaga.clienteNome || 'Cliente Não Informado',
        valorContratado,
        valorRecebido,
        despesasVaga: totalDespesasVaga,
        comissao: totalComissao,
        outrosCustos: 0,
        lucroLiquido,
        margemPercentual
      };
    });
  }

  // FINALIZATION AUTOMATION
  static async finalizarVagaComercial(data: {
    vaga: any;
    candidatoContratado: any;
    dataContratacao: string;
    dataPrevistaAdmissao: string;
    salarioFinal: number;
    valorFinalCobrado: number;
    formaCobranca: string;
    dataPrevistaRecebimento: string;
    beneficiarioComissao: string;
    tipoComissao: any;
    percentualComissao?: number;
    valorFixoComissao?: number;
    prazoGarantiaDias: number;
    numeroNotaFiscal?: string;
    observacoes?: string;
  }): Promise<{
    receita: HeadhunterReceita;
    comissao: HeadhunterCommission;
    garantia: HeadhunterGarantia;
  }> {
    const { vaga, candidatoContratado, dataContratacao, valorFinalCobrado, formaCobranca, dataPrevistaRecebimento, beneficiarioComissao, tipoComissao, percentualComissao, valorFixoComissao, prazoGarantiaDias, numeroNotaFiscal, observacoes } = data;

    // 1. Calculate Commission
    let valorComissao = 0;
    if (tipoComissao === 'Percentual' && percentualComissao) {
      valorComissao = (valorFinalCobrado * percentualComissao) / 100;
    } else if (tipoComissao === 'Valor Fixo' && valorFixoComissao) {
      valorComissao = valorFixoComissao;
    } else if (tipoComissao === 'Personalizado' && valorFixoComissao) {
      valorComissao = valorFixoComissao;
    }

    // 2. Create Revenue Record
    const newReceita: HeadhunterReceita = {
      id: `rec-${vaga.id}-${Date.now()}`,
      empresaId: vaga.empresaId || 'emp-001',
      criadoPor: 'Headhunter',
      criadoEm: new Date().toISOString().split('T')[0],
      status: 'Ativo',
      clienteId: vaga.clienteId || '',
      clienteNome: vaga.clienteNome || 'Cliente',
      vagaId: vaga.id,
      vagaTitulo: vaga.titulo || vaga.cargo,
      contratacaoId: `hir-${Date.now()}`,
      candidatoNome: candidatoContratado.nome,
      valorContratado: valorFinalCobrado,
      valorRecebido: 0,
      saldo: valorFinalCobrado,
      dataEmissao: new Date().toISOString().split('T')[0],
      dataVencimento: dataPrevistaRecebimento || new Date().toISOString().split('T')[0],
      formaPagamento: (formaCobranca.includes('PIX') ? 'PIX' : formaCobranca.includes('Boleto') ? 'Boleto' : 'Nota Fiscal') as any,
      numeroNotaFiscal,
      observacoes,
      situacao: 'Aguardando'
    };

    // 3. Create Commission Record
    const newCommission: HeadhunterCommission = {
      id: `com-${vaga.id}-${Date.now()}`,
      empresaId: vaga.empresaId || 'emp-001',
      criadoPor: 'Headhunter',
      criadoEm: new Date().toISOString().split('T')[0],
      status: 'Ativo',
      beneficiarioNome: beneficiarioComissao || 'Consultor Responsável',
      clienteId: vaga.clienteId || '',
      clienteNome: vaga.clienteNome || 'Cliente',
      vagaId: vaga.id,
      vagaTitulo: vaga.titulo || vaga.cargo,
      consultorNome: beneficiarioComissao || vaga.consultorResponsavel || 'Consultor',
      tipoComissao: tipoComissao || 'Percentual',
      valorRecebidoVaga: valorFinalCobrado,
      percentual: percentualComissao,
      valorFixo: valorFixoComissao,
      valorComissao,
      valorPago: 0,
      dataPrevista: dataPrevistaRecebimento || new Date().toISOString().split('T')[0],
      situacao: 'Prevista',
      regraLiberacao: 'cliente_pagou',
      observacoes: `Comissão gerada na contratação de ${candidatoContratado.nome}`
    };

    // 4. Create Guarantee Record
    const dataInicial = dataContratacao || new Date().toISOString().split('T')[0];
    const dataFimObj = new Date(dataInicial);
    dataFimObj.setDate(dataFimObj.getDate() + (prazoGarantiaDias || 90));
    const dataFinal = dataFimObj.toISOString().split('T')[0];

    const newGarantia: HeadhunterGarantia = {
      id: `gar-${vaga.id}-${Date.now()}`,
      empresaId: vaga.empresaId || 'emp-001',
      criadoPor: 'Headhunter',
      criadoEm: new Date().toISOString().split('T')[0],
      status: 'Ativo',
      clienteId: vaga.clienteId || '',
      clienteNome: vaga.clienteNome || 'Cliente',
      vagaId: vaga.id,
      vagaTitulo: vaga.titulo || vaga.cargo,
      candidatoId: candidatoContratado.id || '',
      candidatoNome: candidatoContratado.nome,
      contratacaoId: `hir-${Date.now()}`,
      dataInicial,
      dataFinal,
      prazoDias: prazoGarantiaDias || 90,
      situacao: 'Ativa',
      observacoes: `Garantia contratual de ${prazoGarantiaDias || 90} dias`
    };

    const savedReceita = await this.saveReceita(newReceita);
    const savedComissao = await this.saveComissao(newCommission);
    const savedGarantia = await this.saveGarantia(newGarantia);

    return {
      receita: savedReceita,
      comissao: savedComissao,
      garantia: savedGarantia
    };
  }
}
