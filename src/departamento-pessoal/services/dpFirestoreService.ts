import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { 
  ColaboradorCompleto, 
  ItemBeneficio, 
  RegistroFeriasColaborador, 
  CalculoRescisorio, 
  AfastamentoColaborador, 
  DocumentoColaborador, 
  AjustePontoColaborador, 
  HistoricoEventoColaborador, 
  AdmissaoPending, 
  ConfiguracoesTrabalhistas 
} from '../types/dp';
import { 
  INITIAL_COLABORADORES, 
  INITIAL_BENEFICIOS, 
  INITIAL_FERIAS, 
  INITIAL_RESCISOES, 
  DEFAULT_CONFIG_TRABALHISTA 
} from '../data/dpMockData';

// Firestore Collection Constants
export const DP_COLLECTIONS = {
  COLABORADORES: 'colaboradores',
  CONTRATOS: 'contratos_trabalho',
  JORNADAS: 'jornadas',
  MARCACOES_PONTO: 'marcacoes_ponto',
  AJUSTES_PONTO: 'ajustes_ponto',
  BANCO_HORAS: 'banco_horas',
  BENEFICIOS: 'beneficios_colaboradores',
  FERIAS: 'ferias',
  AFASTAMENTOS: 'afastamentos',
  DOCUMENTOS: 'documentos_colaboradores',
  FOLHAS: 'folhas_pagamento',
  RESCISOES: 'rescisoes',
  HISTORICO: 'historico_colaborador',
  ADMISSOES: 'solicitacoes_admissao',
  CONFIGURACÕES: 'configuracoes_trabalhistas'
} as const;

/**
 * Normaliza o ID do cliente/empresa
 */
function normalizeCompanyId(companyId?: string): string {
  return companyId || 'emp-001';
}

// ==========================================
// 1. COLABORADORES
// ==========================================

export async function getColaboradoresFirestore(companyId: string): Promise<ColaboradorCompleto[]> {
  const empId = normalizeCompanyId(companyId);
  try {
    const q = query(
      collection(db, DP_COLLECTIONS.COLABORADORES),
      where('companyId', '==', empId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Seed initial data to Firestore if empty
      console.log(`[DP Firestore] Semeando colaboradores iniciais para empresa ${empId}...`);
      const initialForCompany = INITIAL_COLABORADORES.map(c => ({
        ...c,
        companyId: empId
      }));
      for (const colab of initialForCompany) {
        await setDoc(doc(db, DP_COLLECTIONS.COLABORADORES, colab.id), colab);
      }
      return initialForCompany;
    }

    const list: ColaboradorCompleto[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as ColaboradorCompleto);
    });
    return list;
  } catch (error) {
    console.warn('[DP Firestore] Erro ao buscar colaboradores:', error);
    return INITIAL_COLABORADORES.map(c => ({ ...c, companyId: empId }));
  }
}

export async function saveColaboradorFirestore(colaborador: ColaboradorCompleto): Promise<void> {
  try {
    const docRef = doc(db, DP_COLLECTIONS.COLABORADORES, colaborador.id);
    await setDoc(docRef, {
      ...colaborador,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Registra evento no Histórico Único
    await addHistoricoEventoFirestore({
      empresaId: colaborador.companyId,
      colaboradorId: colaborador.id,
      moduloOrigem: 'Colaboradores',
      tipoEvento: 'Atualização Cadastral',
      descricao: `Dados do colaborador ${colaborador.nomeCompleto} atualizados no cadastro principal.`,
      dataHora: new Date().toISOString()
    });
  } catch (error) {
    console.error('[DP Firestore] Erro ao salvar colaborador:', error);
  }
}

// ==========================================
// 2. ADMISSÕES & INTEGRAÇÃO RECRUTAMENTO -> DP
// ==========================================

export async function getAdmissoesPendenteFirestore(companyId: string): Promise<AdmissaoPending[]> {
  const empId = normalizeCompanyId(companyId);
  try {
    const q = query(
      collection(db, DP_COLLECTIONS.ADMISSOES),
      where('empresaId', '==', empId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Create seed admissions from initial candidates/hires
      const defaultAdmissoes: AdmissaoPending[] = [
        {
          id: 'adm-001',
          empresaId: empId,
          candidatoId: 'cand-001',
          nomeCompleto: 'Mariana Duarte Silva',
          email: 'mariana.duarte@email.com',
          telefone: '(11) 98765-4321',
          cpf: '123.456.789-00',
          cargo: 'Analista de RH Senior',
          departamento: 'Recursos Humanos',
          salarioCombinado: 7500,
          tipoContrato: 'CLT',
          dataAdmissaoPrevista: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
          status: 'Pronto para Efetivação',
          checklist: [
            { item: 'Cópia do RG e CPF', concluido: true },
            { item: 'Comprovante de Residência', concluido: true },
            { item: 'Carteira de Trabalho (CTPS)', concluido: true },
            { item: 'Exame Admissional (ASO)', concluido: true },
            { item: 'Dados Bancários para Salário', concluido: false }
          ],
          createdAt: new Date().toISOString()
        }
      ];
      for (const adm of defaultAdmissoes) {
        await setDoc(doc(db, DP_COLLECTIONS.ADMISSOES, adm.id), adm);
      }
      return defaultAdmissoes;
    }

    const list: AdmissaoPending[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as AdmissaoPending);
    });
    return list;
  } catch (error) {
    console.warn('[DP Firestore] Erro ao buscar admissões:', error);
    return [];
  }
}

export async function concluirEfetivacaoAdmissao(
  admissao: AdmissaoPending,
  dadosAdicionais?: {
    gestor?: string;
    escala?: string;
    bancoAgencia?: string;
    rg?: string;
  }
): Promise<ColaboradorCompleto> {
  const companyId = admissao.empresaId || 'emp-001';
  
  // 1. Verifica duplicidade no Firestore
  const colabs = await getColaboradoresFirestore(companyId);
  const jaExiste = colabs.find(c => 
    (admissao.candidatoId && (c as any).candidatoId === admissao.candidatoId) ||
    (admissao.cpf && c.pessoais?.cpf === admissao.cpf)
  );

  if (jaExiste) {
    console.log(`[DP] Colaborador já existe para candidato ${admissao.nomeCompleto}`);
    return jaExiste;
  }

  // 2. Monta o novo ColaboradorCompleto
  const novoId = `colab-${Date.now()}`;
  const contratoId = `ct-${Date.now()}`;

  const novoColaborador: ColaboradorCompleto = {
    id: novoId,
    companyId: companyId,
    nomeCompleto: admissao.nomeCompleto,
    pessoais: {
      cpf: admissao.cpf || '000.000.000-00',
      rg: dadosAdicionais?.rg || '00.000.000-0',
      dataNascimento: '1992-05-15',
      estadoCivil: 'Solteiro(a)',
      endereco: {
        logradouro: 'Rua das Flores',
        numero: '100',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01000-000'
      },
      telefone: admissao.telefone || '(11) 90000-0000',
      emailPessoal: admissao.email
    },
    profissionais: {
      cargo: admissao.cargo,
      departamento: admissao.departamento || 'Geral',
      centroCusto: 'CC-100',
      dataAdmissao: admissao.dataAdmissaoPrevista || new Date().toISOString().split('T')[0],
      salarioBase: admissao.salarioCombinado || 5000,
      jornadaSemanalHours: 44,
      escalaTrabalho: dadosAdicionais?.escala || '5x2 (Segunda a Sexta 08:00 - 18:00)',
      gestorResponsavel: dadosAdicionais?.gestor || 'Diretoria de RH',
      status: 'Ativo',
      emailCorporativo: `${admissao.nomeCompleto.split(' ')[0].toLowerCase()}.${admissao.nomeCompleto.split(' ').slice(-1)[0].toLowerCase()}@empresa.com.br`
    },
    trabalhistas: {
      pisPasep: '123.45678.90-1',
      ctpsNumero: '123456',
      ctpsSerie: '001',
      ctpsUf: 'SP',
      dependentesCount: 0,
      sindicato: 'SINDRH SP',
      tipoContrato: admissao.tipoContrato || 'CLT',
      bancoAgenciaConta: dadosAdicionais?.bancoAgencia || 'Itaú / Ag 0123 / C/C 45678-9',
      optanteValeTransporte: true
    },
    beneficiosAtivos: ['Vale Transporte', 'Vale Refeição', 'Plano de Saúde'],
    acessoColaborador: {
      loginUsername: admissao.email,
      statusAcesso: 'Ativo',
      senhaCriada: false
    },
    historico: [
      {
        id: `h-${Date.now()}`,
        data: new Date().toISOString().split('T')[0],
        tipo: 'Admissão',
        descricao: `Contratação concluída via Módulo de Admissão/Recrutamento.`,
        responsavel: 'Sistema de RH'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Anexa metadados
  (novoColaborador as any).candidatoId = admissao.candidatoId;
  (novoColaborador as any).contratacaoId = admissao.id;
  (novoColaborador as any).contratoTrabalhoId = contratoId;

  // 3. Persiste no Firestore
  await saveColaboradorFirestore(novoColaborador);

  // 4. Salva o Contrato de Trabalho
  await setDoc(doc(db, DP_COLLECTIONS.CONTRATOS, contratoId), {
    id: contratoId,
    empresaId: companyId,
    colaboradorId: novoId,
    tipoContrato: admissao.tipoContrato || 'CLT',
    salarioBase: admissao.salarioCombinado,
    dataAdmissao: novoColaborador.profissionais.dataAdmissao,
    cargo: admissao.cargo,
    departamento: admissao.departamento,
    createdAt: new Date().toISOString()
  });

  // 5. Atualiza o status da Admissão para 'Efetivado'
  await setDoc(doc(db, DP_COLLECTIONS.ADMISSOES, admissao.id), {
    ...admissao,
    status: 'Efetivado',
    colaboradorIdCriado: novoId,
    dataEfetivacao: new Date().toISOString()
  }, { merge: true });

  return novoColaborador;
}

// ==========================================
// 3. BENEFÍCIOS
// ==========================================

export async function getBeneficiosFirestore(companyId: string): Promise<ItemBeneficio[]> {
  const empId = normalizeCompanyId(companyId);
  try {
    const q = query(
      collection(db, DP_COLLECTIONS.BENEFICIOS),
      where('companyId', '==', empId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const initialForCompany = INITIAL_BENEFICIOS.map(b => ({ ...b, companyId: empId }));
      for (const ben of initialForCompany) {
        await setDoc(doc(db, DP_COLLECTIONS.BENEFICIOS, ben.id), ben);
      }
      return initialForCompany;
    }

    const list: ItemBeneficio[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as ItemBeneficio);
    });
    return list;
  } catch (error) {
    console.warn('[DP Firestore] Erro ao buscar benefícios:', error);
    return INITIAL_BENEFICIOS.map(b => ({ ...b, companyId: empId }));
  }
}

export async function saveBeneficioFirestore(beneficio: ItemBeneficio): Promise<void> {
  try {
    const docRef = doc(db, DP_COLLECTIONS.BENEFICIOS, beneficio.id);
    await setDoc(docRef, beneficio, { merge: true });
  } catch (error) {
    console.error('[DP Firestore] Erro ao salvar benefício:', error);
  }
}

// ==========================================
// 4. FÉRIAS
// ==========================================

export async function getFeriasFirestore(companyId: string): Promise<RegistroFeriasColaborador[]> {
  const empId = normalizeCompanyId(companyId);
  try {
    const q = query(
      collection(db, DP_COLLECTIONS.FERIAS),
      where('companyId', '==', empId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const initialForCompany = INITIAL_FERIAS.map(f => ({ ...f, companyId: empId }));
      for (const fer of initialForCompany) {
        await setDoc(doc(db, DP_COLLECTIONS.FERIAS, fer.id), fer);
      }
      return initialForCompany;
    }

    const list: RegistroFeriasColaborador[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as RegistroFeriasColaborador);
    });
    return list;
  } catch (error) {
    console.warn('[DP Firestore] Erro ao buscar férias:', error);
    return INITIAL_FERIAS.map(f => ({ ...f, companyId: empId }));
  }
}

export async function saveFeriasFirestore(ferias: RegistroFeriasColaborador): Promise<void> {
  try {
    const docRef = doc(db, DP_COLLECTIONS.FERIAS, ferias.id);
    await setDoc(docRef, ferias, { merge: true });

    // Registra evento no Histórico do Colaborador
    if (ferias.colaboradorId) {
      await addHistoricoEventoFirestore({
        empresaId: ferias.companyId,
        colaboradorId: ferias.colaboradorId,
        moduloOrigem: 'Férias',
        tipoEvento: 'Programação de Férias',
        descricao: `Férias alteradas/programadas (${ferias.status}). Período: ${ferias.dataInicioGozo || 'A definir'} a ${ferias.dataFimGozo || 'A definir'}.`,
        dataHora: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('[DP Firestore] Erro ao salvar férias:', error);
  }
}

// ==========================================
// 5. AFASTAMENTOS
// ==========================================

export async function getAfastamentosFirestore(companyId: string): Promise<AfastamentoColaborador[]> {
  const empId = normalizeCompanyId(companyId);
  try {
    const q = query(
      collection(db, DP_COLLECTIONS.AFASTAMENTOS),
      where('empresaId', '==', empId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const mockAfastamentos: AfastamentoColaborador[] = [
        {
          id: 'afast-001',
          empresaId: empId,
          colaboradorId: 'colab-002',
          colaboradorNome: 'Carlos Eduardo Santos',
          tipo: 'Atestado médico',
          dataInicio: '2026-03-01',
          dataFim: '2026-03-03',
          diasAfastado: 3,
          cid: 'J11',
          medicoResponsavel: 'Dr. Roberto Lima',
          crmMedico: 'CRM/SP 123456',
          status: 'Ativo',
          createdAt: new Date().toISOString()
        }
      ];
      for (const af of mockAfastamentos) {
        await setDoc(doc(db, DP_COLLECTIONS.AFASTAMENTOS, af.id), af);
      }
      return mockAfastamentos;
    }

    const list: AfastamentoColaborador[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as AfastamentoColaborador);
    });
    return list;
  } catch (error) {
    console.warn('[DP Firestore] Erro ao buscar afastamentos:', error);
    return [];
  }
}

export async function saveAfastamentoFirestore(afastamento: AfastamentoColaborador): Promise<void> {
  try {
    const docRef = doc(db, DP_COLLECTIONS.AFASTAMENTOS, afastamento.id);
    await setDoc(docRef, afastamento, { merge: true });

    // Atualiza status do colaborador para 'Afastado' se for afastamento ativo
    if (afastamento.status === 'Ativo') {
      const colabRef = doc(db, DP_COLLECTIONS.COLABORADORES, afastamento.colaboradorId);
      const colabSnap = await getDoc(colabRef);
      if (colabSnap.exists()) {
        const cData = colabSnap.data() as ColaboradorCompleto;
        await setDoc(colabRef, {
          ...cData,
          profissionais: {
            ...cData.profissionais,
            status: 'Afastado'
          }
        }, { merge: true });
      }
    }

    // Histórico
    await addHistoricoEventoFirestore({
      empresaId: afastamento.empresaId,
      colaboradorId: afastamento.colaboradorId,
      moduloOrigem: 'Afastamentos',
      tipoEvento: 'Registro de Afastamento',
      descricao: `Afastamento do tipo "${afastamento.tipo}" de ${afastamento.dataInicio} a ${afastamento.dataFim} (${afastamento.diasAfastado} dias).`,
      dataHora: new Date().toISOString()
    });
  } catch (error) {
    console.error('[DP Firestore] Erro ao salvar afastamento:', error);
  }
}

// ==========================================
// 6. DOCUMENTOS
// ==========================================

export async function getDocumentosFirestore(companyId: string, colaboradorId?: string): Promise<DocumentoColaborador[]> {
  const empId = normalizeCompanyId(companyId);
  try {
    let q = query(
      collection(db, DP_COLLECTIONS.DOCUMENTOS),
      where('empresaId', '==', empId)
    );
    if (colaboradorId) {
      q = query(
        collection(db, DP_COLLECTIONS.DOCUMENTOS),
        where('empresaId', '==', empId),
        where('colaboradorId', '==', colaboradorId)
      );
    }
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const initialDocs: DocumentoColaborador[] = [
        {
          id: 'doc-001',
          empresaId: empId,
          colaboradorId: 'colab-001',
          colaboradorNome: 'Ana Paula Silva',
          categoria: 'Contratuais',
          tipoDocumento: 'Contrato de Trabalho CLT',
          nomeArquivo: 'Contrato_CLT_Ana_Silva.pdf',
          dataEmissao: '2023-01-15',
          status: 'Válido',
          criadoEm: '2023-01-15'
        },
        {
          id: 'doc-002',
          empresaId: empId,
          colaboradorId: 'colab-001',
          colaboradorNome: 'Ana Paula Silva',
          categoria: 'Saúde ocupacional',
          tipoDocumento: 'Atestado de Saúde Ocupacional (ASO Periodico)',
          nomeArquivo: 'ASO_Ana_Silva_2025.pdf',
          dataEmissao: '2025-01-10',
          dataValidade: '2026-01-10',
          status: 'Vencido',
          criadoEm: '2025-01-10'
        }
      ];
      for (const d of initialDocs) {
        await setDoc(doc(db, DP_COLLECTIONS.DOCUMENTOS, d.id), d);
      }
      return initialDocs.filter(d => !colaboradorId || d.colaboradorId === colaboradorId);
    }

    const list: DocumentoColaborador[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as DocumentoColaborador);
    });
    return list;
  } catch (error) {
    console.warn('[DP Firestore] Erro ao buscar documentos:', error);
    return [];
  }
}

export async function saveDocumentoFirestore(docData: DocumentoColaborador): Promise<void> {
  try {
    const docRef = doc(db, DP_COLLECTIONS.DOCUMENTOS, docData.id);
    await setDoc(docRef, docData, { merge: true });

    await addHistoricoEventoFirestore({
      empresaId: docData.empresaId,
      colaboradorId: docData.colaboradorId,
      moduloOrigem: 'Documentos',
      tipoEvento: 'Anexo de Documento',
      descricao: `Documento "${docData.tipoDocumento}" adicionado na categoria ${docData.categoria}.`,
      dataHora: new Date().toISOString()
    });
  } catch (error) {
    console.error('[DP Firestore] Erro ao salvar documento:', error);
  }
}

// ==========================================
// 7. AJUSTES DE PONTO
// ==========================================

export async function getAjustesPontoFirestore(companyId: string): Promise<AjustePontoColaborador[]> {
  const empId = normalizeCompanyId(companyId);
  try {
    const q = query(
      collection(db, DP_COLLECTIONS.AJUSTES_PONTO),
      where('empresaId', '==', empId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const mockAjustes: AjustePontoColaborador[] = [
        {
          id: 'aj-001',
          empresaId: empId,
          colaboradorId: 'colab-001',
          colaboradorNome: 'Ana Paula Silva',
          data: '2026-03-02',
          motivo: 'Esquecimento do registro no horário de saída',
          marcacoesOriginais: ['08:02', '12:00', '13:00'],
          marcacoesNovas: ['08:02', '12:00', '13:00', '18:00'],
          status: 'Pendente',
          createdAt: new Date().toISOString()
        }
      ];
      for (const aj of mockAjustes) {
        await setDoc(doc(db, DP_COLLECTIONS.AJUSTES_PONTO, aj.id), aj);
      }
      return mockAjustes;
    }

    const list: AjustePontoColaborador[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as AjustePontoColaborador);
    });
    return list;
  } catch (error) {
    console.warn('[DP Firestore] Erro ao buscar ajustes de ponto:', error);
    return [];
  }
}

export async function saveAjustePontoFirestore(ajuste: AjustePontoColaborador): Promise<void> {
  try {
    const docRef = doc(db, DP_COLLECTIONS.AJUSTES_PONTO, ajuste.id);
    await setDoc(docRef, ajuste, { merge: true });

    await addHistoricoEventoFirestore({
      empresaId: ajuste.empresaId,
      colaboradorId: ajuste.colaboradorId,
      moduloOrigem: 'Jornada',
      tipoEvento: 'Solicitação de Ajuste de Ponto',
      descricao: `Ajuste de ponto do dia ${ajuste.data} alterado para status "${ajuste.status}". Motivo: ${ajuste.motivo}`,
      dataHora: new Date().toISOString()
    });
  } catch (error) {
    console.error('[DP Firestore] Erro ao salvar ajuste de ponto:', error);
  }
}

// ==========================================
// 8. RESCISÕES
// ==========================================

export async function getRescisoesFirestore(companyId: string): Promise<CalculoRescisorio[]> {
  const empId = normalizeCompanyId(companyId);
  try {
    const q = query(
      collection(db, DP_COLLECTIONS.RESCISOES),
      where('companyId', '==', empId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const initialForCompany = INITIAL_RESCISOES.map(r => ({ ...r, companyId: empId }));
      for (const res of initialForCompany) {
        if (res.id) {
          await setDoc(doc(db, DP_COLLECTIONS.RESCISOES, res.id), res);
        }
      }
      return initialForCompany;
    }

    const list: CalculoRescisorio[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as CalculoRescisorio);
    });
    return list;
  } catch (error) {
    console.warn('[DP Firestore] Erro ao buscar rescisões:', error);
    return INITIAL_RESCISOES.map(r => ({ ...r, companyId: empId }));
  }
}

export async function concluirRescisaoEBloquearColaborador(rescisao: CalculoRescisorio): Promise<void> {
  const companyId = rescisao.companyId || 'emp-001';
  const resId = rescisao.id || `resc-${Date.now()}`;

  try {
    // 1. Salva a Rescisão no Firestore
    await setDoc(doc(db, DP_COLLECTIONS.RESCISOES, resId), {
      ...rescisao,
      id: resId,
      status: 'Homologado'
    }, { merge: true });

    // 2. Atualiza o status do Colaborador para 'Rescindido' e Bloqueia Acesso ao Portal
    const colabRef = doc(db, DP_COLLECTIONS.COLABORADORES, rescisao.colaboradorId);
    const colabSnap = await getDoc(colabRef);

    if (colabSnap.exists()) {
      const cData = colabSnap.data() as ColaboradorCompleto;

      const colabAtualizado: ColaboradorCompleto = {
        ...cData,
        profissionais: {
          ...cData.profissionais,
          status: 'Rescindido'
        },
        acessoColaborador: {
          ...(cData.acessoColaborador || { loginUsername: cData.pessoais.emailPessoal, senhaCriada: false }),
          statusAcesso: 'Bloqueado'
        },
        updatedAt: new Date().toISOString()
      };

      await setDoc(colabRef, colabAtualizado, { merge: true });
    }

    // 3. Encerra Benefícios Ativos do Colaborador no Firestore
    const benList = await getBeneficiosFirestore(companyId);
    const colabBen = benList.filter(b => b.companyId === companyId && b.ativo);
    for (const b of colabBen) {
      await setDoc(doc(db, DP_COLLECTIONS.BENEFICIOS, b.id), {
        ...b,
        ativo: false,
        observacoes: `Encerrado automaticamente devido a desligamento em ${rescisao.dataDesligamento}`
      }, { merge: true });
    }

    // 4. Registra no Histórico Único do Colaborador
    await addHistoricoEventoFirestore({
      empresaId: companyId,
      colaboradorId: rescisao.colaboradorId,
      moduloOrigem: 'Rescisões',
      tipoEvento: 'Desligamento e Rescisão Contratual',
      descricao: `Rescisão concluída (${rescisao.tipoRescisao}). Valor líquido: R$ ${rescisao.valorLiquidoRescisao.toLocaleString('pt-BR')}. Acesso ao portal e ponto bloqueados.`,
      dataHora: new Date().toISOString()
    });

  } catch (error) {
    console.error('[DP Firestore] Erro ao concluir rescisão:', error);
  }
}

// ==========================================
// 9. HISTÓRICO ÚNICO DO COLABORADOR
// ==========================================

export async function addHistoricoEventoFirestore(evento: {
  empresaId: string;
  colaboradorId: string;
  moduloOrigem: 'Colaboradores' | 'Admissões' | 'Jornada' | 'Benefícios' | 'Férias' | 'Afastamentos' | 'Documentos' | 'Folha' | 'Rescisões';
  tipoEvento: string;
  descricao: string;
  valorAnterior?: string;
  valorNovo?: string;
  usuarioId?: string;
  usuarioNome?: string;
  dataHora?: string;
}): Promise<void> {
  try {
    const id = `hist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const eventDoc: HistoricoEventoColaborador = {
      id,
      empresaId: evento.empresaId,
      colaboradorId: evento.colaboradorId,
      moduloOrigem: evento.moduloOrigem,
      tipoEvento: evento.tipoEvento,
      descricao: evento.descricao,
      valorAnterior: evento.valorAnterior,
      valorNovo: evento.valorNovo,
      usuarioId: evento.usuarioId || 'rh-system',
      usuarioNome: evento.usuarioNome || 'Analista DP',
      dataHora: evento.dataHora || new Date().toISOString()
    };
    await setDoc(doc(db, DP_COLLECTIONS.HISTORICO, id), eventDoc);
  } catch (error) {
    console.error('[DP Firestore] Erro ao registrar histórico:', error);
  }
}

export async function getHistoricoColaboradorFirestore(companyId: string, colaboradorId: string): Promise<HistoricoEventoColaborador[]> {
  const empId = normalizeCompanyId(companyId);
  try {
    const q = query(
      collection(db, DP_COLLECTIONS.HISTORICO),
      where('empresaId', '==', empId),
      where('colaboradorId', '==', colaboradorId)
    );
    const snapshot = await getDocs(q);

    const list: HistoricoEventoColaborador[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as HistoricoEventoColaborador);
    });

    list.sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime());
    return list;
  } catch (error) {
    console.warn('[DP Firestore] Erro ao buscar histórico:', error);
    return [];
  }
}

// ==========================================
// 10. CONFIGURAÇÕES TRABALHISTAS
// ==========================================

export async function getConfigTrabalhistaFirestore(companyId: string): Promise<ConfiguracoesTrabalhistas> {
  const empId = normalizeCompanyId(companyId);
  try {
    const docRef = doc(db, DP_COLLECTIONS.CONFIGURACÕES, empId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as ConfiguracoesTrabalhistas;
    } else {
      const defaultConfig = {
        ...DEFAULT_CONFIG_TRABALHISTA,
        companyId: empId
      };
      await setDoc(docRef, defaultConfig);
      return defaultConfig;
    }
  } catch (error) {
    console.warn('[DP Firestore] Erro ao buscar configurações:', error);
    return { ...DEFAULT_CONFIG_TRABALHISTA, companyId: empId };
  }
}

export async function saveConfigTrabalhistaFirestore(config: ConfiguracoesTrabalhistas): Promise<void> {
  try {
    const docRef = doc(db, DP_COLLECTIONS.CONFIGURACÕES, config.companyId);
    await setDoc(docRef, config, { merge: true });
  } catch (error) {
    console.error('[DP Firestore] Erro ao salvar configurações:', error);
  }
}
