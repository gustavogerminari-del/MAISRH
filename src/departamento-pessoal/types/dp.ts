/**
 * Tipos e Interfaces para o Módulo de Departamento Pessoal (DP)
 * MAIS RH - Plataforma SaaS de Gestão de Pessoas
 */

export type TipoContrato = 'CLT' | 'PJ' | 'Estágio' | 'Aprendiz' | 'Temporário' | 'Diretor Estatutário';
export type EstadoCivil = 'Solteiro(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viúvo(a)' | 'União Estável';

export interface DadoPessoalColaborador {
  cpf: string;
  rg: string;
  dataNascimento: string;
  estadoCivil: EstadoCivil;
  genero?: string;
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  telefone: string;
  emailPessoal: string;
  nomeMae?: string;
}

export interface DadoProfissionalColaborador {
  cargo: string;
  departamento: string;
  centroCusto: string;
  dataAdmissao: string;
  salarioBase: number;
  jornadaSemanalHours: number; // ex: 44h
  escalaTrabalho: string; // ex: '5x2 (Segunda a Sexta 08:00 - 18:00)'
  gestorResponsavel: string;
  status: 'Ativo' | 'Férias' | 'Afastado' | 'Rescindido' | 'Aviso Prévio';
  emailCorporativo: string;
}

export interface DadoTrabalhistaColaborador {
  pisPasep: string;
  ctpsNumero: string;
  ctpsSerie: string;
  ctpsUf: string;
  dependentesCount: number;
  sindicato: string;
  tipoContrato: TipoContrato;
  bancoAgenciaConta: string;
  optanteValeTransporte: boolean;
}

export interface AcessoColaborador {
  loginUsername: string;
  senhaProvisoria?: string;
  statusAcesso: 'Ativo' | 'Bloqueado' | 'Pendente' | 'Sem acesso' | 'Convite enviado';
  dataUltimoAcesso?: string;
  dataLiberacao?: string;
  senhaCriada: boolean;
}

export interface HistoricoOcorrenciaColaborador {
  id: string;
  data: string;
  tipo: 'Admissão' | 'Alteração Salarial' | 'Promoção' | 'Mudança de Cargo/Depto' | 'Atestado Médico' | 'Advertência/Elogio';
  descricao: string;
  responsavel: string;
}

export interface ColaboradorCompleto {
  id: string;
  companyId: string;
  nomeCompleto: string;
  fotoUrl?: string;
  pessoais: DadoPessoalColaborador;
  profissionais: DadoProfissionalColaborador;
  trabalhistas: DadoTrabalhistaColaborador;
  beneficiosAtivos: string[]; // IDs ou nomes de benefícios
  acessoColaborador?: AcessoColaborador;
  regraJornadaIndividual?: RegraJornadaIndividualColaborador;
  historico?: HistoricoOcorrenciaColaborador[];
  createdAt: string;
  updatedAt: string;
}

export interface ItemBeneficio {
  id: string;
  companyId: string;
  nome: string;
  categoria: 'Vale Transporte' | 'Vale Refeição' | 'Vale Alimentação' | 'Plano de Saúde' | 'Plano Odontológico' | 'Seguro de Vida' | 'Auxílio Creche' | 'Outros';
  tipoCalculo: 'Valor Fixo' | 'Percentual Salário';
  valorBeneficio: number;
  percentualDescontoFuncionario: number; // ex: 6% VT, 20% VR
  custoEmpresaEstimado: number;
  ativo: boolean;
  fornecedor?: string;
}

export interface RegistroFeriasColaborador {
  id: string;
  companyId: string;
  colaboradorId: string;
  colaboradorNome: string;
  cargo: string;
  departamento: string;
  periodoAquisitivoInicio: string;
  periodoAquisitivoFim: string;
  diasAdquiridos: number;
  diasGozados: number;
  diasSaldo: number;
  dataInicioGozo?: string;
  dataFimGozo?: string;
  diasVendidosAbono?: number; // Abono pecuniário (até 10 dias)
  status: 'Em Aquisitivo' | 'Disponível' | 'Solicitado' | 'Aprovado' | 'Em Gozo' | 'Vencido';
  valorUmTercoConstitucional?: number;
  valorTotalLiquidoFerias?: number;
}

export type TipoRescisao = 
  | 'Demissão sem Justa Causa (Iniciativa do Empregador)' 
  | 'Pedido de Demissão (Iniciativa do Empregado)'
  | 'Demissão com Justa Causa'
  | 'Acordo Mútuo (Art. 484-A CLT)'
  | 'Término do Contrato de Experiência/Prazo Determinado';

export interface CalculoRescisorio {
  id?: string;
  companyId: string;
  colaboradorId: string;
  colaboradorNome: string;
  cargo: string;
  salarioBase: number;
  dataAdmissao: string;
  dataDesligamento: string;
  tipoRescisao: TipoRescisao;
  avisoPrevio: 'Trabalhado' | 'Indenizado' | 'Dispensado';
  diasAvisoPrevio: number;
  
  // Proventos
  saldoSalarioDias: number;
  valorSaldoSalario: number;
  valorAvisoPrevioIndenizado: number;
  meses13Proporcional: number;
  valor13Proporcional: number;
  mesesFeriasProporcionais: number;
  valorFeriasProporcionais: number;
  valorFeriasVencidas: number;
  valorUmTercoFerias: number;
  
  // Descontos
  descontoInss: number;
  descontoIrrf: number;
  descontoFaltasAtrasos: number;
  descontoAvisoPrevioNaoCumprido: number;
  
  // Totais e FGTS
  totalProventos: number;
  totalDescontos: number;
  valorLiquidoRescisao: number;
  saldoFgtsEstimado: number;
  multaFgtsPercentual: number; // 40% ou 20% em acordo
  valorMultaFgts: number;
  
  status: 'Simulação' | 'Aprovado RH' | 'Homologado' | 'Pago';
  dataHomologacao?: string;
}

export type TipoControleJornada = 'Pagamento de hora extra' | 'Banco de horas' | 'Modelo misto';
export type JornadaSemanalTipo = '44h' | '40h' | 'Personalizada';
export type EscalaTrabalhoTipo = 'Segunda a sexta' | 'Segunda a sábado' | '12x36' | 'Escala personalizada';
export type PrazoCompensacaoBH = '3 meses' | '6 meses' | '12 meses' | 'Personalizado';
export type FormaAprovacaoBH = 'Automática' | 'Aprovação do Gestor' | 'Aprovação do RH';

export interface RegraJornadaEmpresa {
  tipoControle: TipoControleJornada;
  jornadaSemanal: JornadaSemanalTipo;
  jornadaSemanalHorasCustom?: number;
  jornadaDiariaHoras: number; // ex: 8.8, 8.0
  escalaPadrao: EscalaTrabalhoTipo;
  horariosPadrao: {
    entrada: string; // "08:00"
    intervaloSaida: string; // "12:00"
    intervaloRetorno: string; // "13:00"
    saida: string; // "17:00"
  };
  
  // Configuração de Hora Extra
  pagaHoraExtra: boolean; // SIM -> Envia pra folha, NÃO -> Envia pro banco
  horaExtraDiaUtilPercent: number; // ex: 50%
  horaExtraDomingoFeriadoPercent: number; // ex: 100%
  adicionalNoturnoPercent: number; // ex: 20%
  percentuaisPersonalizados?: { descricao: string; percentual: number }[];
  
  // Configuração de Banco de Horas
  ativarBancoHoras: boolean;
  prazoCompensacao: PrazoCompensacaoBH;
  limiteSaldoPositivoHoras: number; // ex: 20 horas (+20:00)
  limiteSaldoNegativoHoras: number; // ex: 5 horas (-05:00)
  formaAprovacao: FormaAprovacaoBH;
  
  // Regra do Modelo Misto
  modeloMistoRegra?: {
    limiteDiarioBancoHoras: number; // ex: até 2h extras vão pro banco, excedente pra folha
    limiteMensalBancoHoras: number; // ex: até 20h no mês pro banco, excedente pra folha
  };
}

export interface RegraJornadaIndividualColaborador {
  usarRegraEmpresa: boolean;
  tipoControleIndividual?: TipoControleJornada;
  jornadaSemanalIndividualHoras?: number;
  escalaIndividual?: EscalaTrabalhoTipo;
  horariosIndividuais?: {
    entrada: string;
    intervaloSaida: string;
    intervaloRetorno: string;
    saida: string;
  };
  regraCalculoIndividualObs?: string;
}

export interface ConfiguracoesTrabalhistas {
  companyId: string;
  toleranciaPontoMinutos: number; // ex: 10 min diários (Art. 58 CLT)
  adicionalHorasExtrasSemanaPercent: number; // ex: 50%
  adicionalHorasExtrasDomingoFeriadoPercent: number; // ex: 100%
  adicionalNoturnoPercent: number; // ex: 20% (CLT Urbana)
  horarioNoturnoInicio: string; // 22:00
  horarioNoturnoFim: string; // 05:00
  aliquotaFgtsPercent: number; // 8% geral, 2% aprendiz
  
  // Regras de Jornada, Banco de Horas e Hora Extra por Empresa
  regrasJornada: RegraJornadaEmpresa;
  
  // Tabelas Progressivas de INSS e IRRF (Ano Vigente 2026)
  tabelaInss: { ate: number; aliquota: number; deducao: number }[];
  tabelaIrrf: { ate: number; aliquota: number; deducao: number; deducaoDependente: number }[];
}
