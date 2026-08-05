import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../lib/firebase';
import { sanitizeFirestoreData } from '../../lib/firestoreUtils';
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

// In-memory caches for synchronous immediate access
let receitasCache: HeadhunterReceita[] = [];
let despesasCache: HeadhunterExpense[] = [];
let comissoesCache: HeadhunterCommission[] = [];
let garantiasCache: HeadhunterGarantia[] = [];

// Sync function with Firestore
export async function syncHeadhunterFinanceWithFirestore(): Promise<void> {
  try {
    let recSnap = await getDocs(collection(db, COLLECTIONS.RECEITAS));
    if (recSnap.empty) {
      const altSnap = await getDocs(collection(db, 'financeiro_headhunter'));
      if (!altSnap.empty) recSnap = altSnap;
    }
    receitasCache = recSnap.docs.map(d => ({ id: d.id, ...d.data() } as HeadhunterReceita));
  } catch (err: any) {
    if (err?.code !== 'permission-denied') {
      console.warn('[HEADHUNTER FINANCE SYNC]', COLLECTIONS.RECEITAS, err?.message);
    }
  }

  try {
    const despSnap = await getDocs(collection(db, COLLECTIONS.DESPESAS));
    despesasCache = despSnap.docs.map(d => ({ id: d.id, ...d.data() } as HeadhunterExpense));
  } catch (err: any) {
    if (err?.code !== 'permission-denied') {
      console.warn('[HEADHUNTER FINANCE SYNC]', COLLECTIONS.DESPESAS, err?.message);
    }
  }

  try {
    const comSnap = await getDocs(collection(db, COLLECTIONS.COMISSOES));
    comissoesCache = comSnap.docs.map(d => ({ id: d.id, ...d.data() } as HeadhunterCommission));
  } catch (err: any) {
    if (err?.code !== 'permission-denied') {
      console.warn('[HEADHUNTER FINANCE SYNC]', COLLECTIONS.COMISSOES, err?.message);
    }
  }

  try {
    let garSnap = await getDocs(collection(db, COLLECTIONS.GARANTIAS));
    if (garSnap.empty) {
      const altGar = await getDocs(collection(db, 'garantias_headhunter'));
      if (!altGar.empty) garSnap = altGar;
    }
    garantiasCache = garSnap.docs.map(d => ({ id: d.id, ...d.data() } as HeadhunterGarantia));
  } catch (err: any) {
    if (err?.code !== 'permission-denied') {
      console.warn('[HEADHUNTER FINANCE SYNC]', COLLECTIONS.GARANTIAS, err?.message);
    }
  }
}

// Auto-sync on auth state ready
onAuthStateChanged(auth, (user) => {
  if (user) {
    syncHeadhunterFinanceWithFirestore();
  }
});
syncHeadhunterFinanceWithFirestore();

export class HeadhunterFinanceService {
  // RECEITAS
  static getReceitas(companyId?: string): HeadhunterReceita[] {
    return receitasCache.filter(r => !companyId || r.companyId === companyId || r.empresaId === companyId);
  }

  static async saveReceita(receita: HeadhunterReceita): Promise<HeadhunterReceita> {
    const companyId = receita.companyId || receita.empresaId;
    if (!companyId || companyId === 'emp-001') {
      throw new Error("Não foi possível identificar a empresa do usuário.");
    }

    const id = receita.id || `rec-${Date.now()}`;
    const newReceita: HeadhunterReceita = {
      ...receita,
      id,
      companyId,
      empresaId: companyId,
      saldo: (receita.valorContratado || 0) - (receita.valorRecebido || 0),
      criadoEm: receita.criadoEm || new Date().toISOString().split('T')[0]
    };

    try {
      await setDoc(doc(db, COLLECTIONS.RECEITAS, id), sanitizeFirestoreData(newReceita), { merge: true });
      receitasCache = [newReceita, ...receitasCache.filter(r => r.id !== id)];
      return newReceita;
    } catch (err) {
      console.error('[HEADHUNTER] Erro real ao salvar receita:', err);
      throw err;
    }
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
  static getDespesas(companyId?: string): HeadhunterExpense[] {
    return despesasCache.filter(d => !companyId || d.companyId === companyId || d.empresaId === companyId);
  }

  static async saveDespesa(expense: HeadhunterExpense): Promise<HeadhunterExpense> {
    const companyId = expense.companyId || expense.empresaId;
    if (!companyId || companyId === 'emp-001') {
      throw new Error("Não foi possível identificar a empresa do usuário.");
    }

    const id = expense.id || `exp-${Date.now()}`;
    const newExpense: HeadhunterExpense = {
      ...expense,
      id,
      companyId,
      empresaId: companyId,
      criadoEm: expense.criadoEm || new Date().toISOString().split('T')[0]
    };

    try {
      await setDoc(doc(db, COLLECTIONS.DESPESAS, id), sanitizeFirestoreData(newExpense), { merge: true });
      despesasCache = [newExpense, ...despesasCache.filter(d => d.id !== id)];
      return newExpense;
    } catch (err) {
      console.error('[HEADHUNTER] Erro real ao salvar despesa:', err);
      throw err;
    }
  }

  // COMISSÕES
  static getComissoes(companyId?: string): HeadhunterCommission[] {
    return comissoesCache.filter(c => !companyId || c.companyId === companyId || c.empresaId === companyId);
  }

  static async saveComissao(commission: HeadhunterCommission): Promise<HeadhunterCommission> {
    const companyId = commission.companyId || commission.empresaId;
    if (!companyId || companyId === 'emp-001') {
      throw new Error("Não foi possível identificar a empresa do usuário.");
    }

    const id = commission.id || `com-${Date.now()}`;
    const newCom: HeadhunterCommission = {
      ...commission,
      id,
      companyId,
      empresaId: companyId,
      criadoEm: commission.criadoEm || new Date().toISOString().split('T')[0]
    };

    try {
      await setDoc(doc(db, COLLECTIONS.COMISSOES, id), sanitizeFirestoreData(newCom), { merge: true });
      comissoesCache = [newCom, ...comissoesCache.filter(c => c.id !== id)];
      return newCom;
    } catch (err) {
      console.error('[HEADHUNTER] Erro real ao salvar comissão:', err);
      throw err;
    }
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
  static getGarantias(companyId?: string): HeadhunterGarantia[] {
    const hoje = new Date();

    return garantiasCache
      .filter(g => !companyId || g.companyId === companyId || g.empresaId === companyId)
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
    const companyId = garantia.companyId || garantia.empresaId;
    if (!companyId || companyId === 'emp-001') {
      throw new Error("Não foi possível identificar a empresa do usuário.");
    }

    const id = garantia.id || `gar-${Date.now()}`;
    const newGar: HeadhunterGarantia = {
      ...garantia,
      id,
      companyId,
      empresaId: companyId,
      criadoEm: garantia.criadoEm || new Date().toISOString().split('T')[0]
    };

    try {
      await setDoc(doc(db, COLLECTIONS.GARANTIAS, id), sanitizeFirestoreData(newGar), { merge: true });
      garantiasCache = [newGar, ...garantiasCache.filter(g => g.id !== id)];
      return newGar;
    } catch (err) {
      console.error('[HEADHUNTER] Erro real ao salvar garantia:', err);
      throw err;
    }
  }

  // RENTABILIDADE CALCULATOR
  static calculateRentabilidadeVagas(vagas: any[], companyId?: string): RentabilidadeVaga[] {
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
    const resolvedCompanyId = vaga.companyId || vaga.empresaId;
    if (!resolvedCompanyId || resolvedCompanyId === 'emp-001') {
      throw new Error("Não foi possível identificar a empresa do usuário.");
    }

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
      companyId: resolvedCompanyId,
      empresaId: resolvedCompanyId,
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
      companyId: resolvedCompanyId,
      empresaId: resolvedCompanyId,
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
      companyId: resolvedCompanyId,
      empresaId: resolvedCompanyId,
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
