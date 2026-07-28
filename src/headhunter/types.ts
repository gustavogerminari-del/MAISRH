export type HeadhunterRole = 'MASTER' | 'Administrador' | 'Gestor' | 'Headhunter' | 'Recrutador' | 'Financeiro';

export type LeadStage = 'Lead' | 'Contato' | 'Proposta' | 'Negociação' | 'Cliente' | 'Perdido' | 'Ganho';

export type JobStatus = 'Aberta' | 'Em Andamento' | 'Fechada' | 'Cancelada';

export type CandidateStatus = 'Triagem' | 'Entrevista Headhunter' | 'Entrevista Cliente' | 'Proposta' | 'Contratado' | 'Reprovado';

export type CommissionType = 'Comissão fixa' | 'Comissão percentual' | 'Comissão compartilhada' | 'Comissão por equipe' | 'Comissão por recrutador';

export type CommissionStatus = 'Prevista' | 'Liberada' | 'Recebida' | 'Cancelada';

export type ExpenseCategory = 'Combustível' | 'Pedágio' | 'Alimentação' | 'Uber' | 'Hotel' | 'Passagens' | 'Material' | 'Internet' | 'Telefone' | 'Marketing' | 'Outros';

export interface HeadhunterBaseDoc {
  id: string;
  empresaId: string;
  criadoPor: string;
  criadoEm: string;
  atualizadoEm?: string;
  status: string;
}

export interface HeadhunterClient extends HeadhunterBaseDoc {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  segmento: string;
  porte: string;
  qtdFuncionarios: number;
  responsavel: string;
  cargoResponsavel: string;
  telefone: string;
  whatsapp: string;
  email: string;
  site: string;
  endereco: string;
  // Comercial
  valorPadraoVaga: number;
  comissaoNegociadaPercent: number;
  formaCobranca: string;
  prazoPagamentoDias: number;
  contratoAtivo: boolean;
  // Relacionamentos
  historico: Array<{ data: string; descricao: string; autor: string }>;
  reunioesCount: number;
  pendenciasCount: number;
  vagasCount: number;
}

export interface HeadhunterLead extends HeadhunterBaseDoc {
  empresa: string;
  contato: string;
  email: string;
  telefone: string;
  origem: string;
  consultor: string;
  etapa: LeadStage;
  valorPrevisto: number;
  probabilidadePercent: number;
  proximoContato: string;
  historico: Array<{ data: string; anotacao: string; autor: string }>;
  observacoes: string;
}

export interface HeadhunterJob extends HeadhunterBaseDoc {
  clienteId: string;
  clienteNome: string;
  consultorResponsavel: string;
  recrutador: string;
  cargo: string;
  descricao: string;
  requisitos: string[];
  salario: string;
  salarioValor: number;
  tipoContratacao: 'CLT' | 'PJ' | 'Executive' | 'Temporário';
  local: string;
  dataAbertura: string;
  dataPrevista: string;
  slaDias: number;
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  valorNegociado: number;
  valorVaga: number;
  percentualComissao: number;
  comissaoCalculada: number;
  qtdVagas: number;
  candidatosIds: string[];
  documentosCount: number;
  historico: Array<{ data: string; evento: string; autor: string }>;
}

export interface HeadhunterCandidate extends HeadhunterBaseDoc {
  vagaId?: string;
  vagaTitulo?: string;
  clienteNome?: string;
  nome: string;
  email: string;
  telefone: string;
  cargoAtual: string;
  salarioAtual: number;
  pretensaoSalarial: number;
  curriculoTexto: string;
  compatibilidadePercent: number;
  triagemIaScore: number;
  triagemIaParecer: string;
  triagemRhStatus: string;
  parecerTecnico: string;
  etapaPipeline: CandidateStatus;
  historico: Array<{ data: string; evento: string }>;
  linhaDoTempo: Array<{ data: string; titulo: string; detalhe: string }>;
}

export interface HeadhunterInterview extends HeadhunterBaseDoc {
  clienteNome: string;
  vagaTitulo: string;
  consultorNome: string;
  recrutadorNome: string;
  candidatoNome: string;
  dataHora: string;
  modalidade: 'Presencial' | 'Online (Meet)' | 'Online (Teams)' | 'Telefone';
  linkModalidade?: string;
  pauta: string;
  feedback: string;
  parecer: string;
  resultado: 'Aprovado' | 'Em Avaliação' | 'Reprovado' | 'Standby';
  proximaEtapa: string;
}

export interface HeadhunterHiring extends HeadhunterBaseDoc {
  candidatoId: string;
  candidatoNome: string;
  vagaId: string;
  vagaTitulo: string;
  clienteId: string;
  clienteNome: string;
  consultorNome: string;
  dataContratacao: string;
  salarioFinal: number;
  receitaGerada: number;
  comissaoGerada: number;
  faturamentoGerado: boolean;
}

export interface HeadhunterCommission extends HeadhunterBaseDoc {
  clienteNome: string;
  vagaTitulo: string;
  consultorNome: string;
  tipoComissao: CommissionType;
  valorRecebidoVaga: number;
  percentual: number;
  valorComissao: number;
  dataPrevista: string;
  dataPagamento?: string;
  situacao: CommissionStatus;
}

export interface HeadhunterFinanceItem extends HeadhunterBaseDoc {
  tipo: 'Receita' | 'Despesa';
  categoria: string;
  descricao: string;
  clienteNome?: string;
  vagaTitulo?: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  formaPagamento: 'PIX' | 'Boleto' | 'Transferência' | 'Cartão' | 'Nota Fiscal';
  centroCusto: string;
  statusFinanceiro: 'Pendente' | 'Pago' | 'Atrasado' | 'Cancelado';
}

export interface HeadhunterExpense extends HeadhunterBaseDoc {
  clienteId?: string;
  clienteNome?: string;
  vagaId?: string;
  vagaTitulo?: string;
  consultorNome: string;
  centroCusto: string;
  categoria: ExpenseCategory;
  data: string;
  valor: number;
  comprovanteUrl?: string;
  observacao: string;
}

export interface HeadhunterEvent extends HeadhunterBaseDoc {
  tipo: 'Reunião' | 'Entrevista' | 'Visita' | 'Follow-up' | 'Pendência' | 'Retorno' | 'Ligação';
  titulo: string;
  clienteNome?: string;
  candidatoNome?: string;
  dataHora: string;
  consultorNome: string;
  descricao: string;
  concluido: boolean;
}

export interface HeadhunterContract extends HeadhunterBaseDoc {
  clienteId: string;
  clienteNome: string;
  tituloContrato: string;
  tipo: 'Contrato Mãe' | 'Aditivo' | 'Tabela Comercial' | 'NDA' | 'Outros';
  dataInicio: string;
  dataVencimento: string;
  valorOuPercentual: string;
  assinado: boolean;
  documentoUrl?: string;
}
