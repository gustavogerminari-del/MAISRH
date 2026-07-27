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

export interface ColaboradorCompleto {
  id: string;
  companyId: string;
  nomeCompleto: string;
  fotoUrl?: string;
  pessoais: DadoPessoalColaborador;
  profissionais: DadoProfissionalColaborador;
  trabalhistas: DadoTrabalhistaColaborador;
  beneficiosAtivos: string[]; // IDs ou nomes de benefícios
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

export interface ConfiguracoesTrabalhistas {
  companyId: string;
  toleranciaPontoMinutos: number; // ex: 10 min diários (Art. 58 CLT)
  adicionalHorasExtrasSemanaPercent: number; // ex: 50%
  adicionalHorasExtrasDomingoFeriadoPercent: number; // ex: 100%
  adicionalNoturnoPercent: number; // ex: 20% (CLT Urbana)
  horarioNoturnoInicio: string; // 22:00
  horarioNoturnoFim: string; // 05:00
  aliquotaFgtsPercent: number; // 8% geral, 2% aprendiz
  
  // Tabelas Progressivas de INSS e IRRF (Ano Vigente 2026)
  tabelaInss: { ate: number; aliquota: number; deducao: number }[];
  tabelaIrrf: { ate: number; aliquota: number; deducao: number; deducaoDependente: number }[];
}
