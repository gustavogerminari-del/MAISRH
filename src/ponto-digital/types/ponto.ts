export type SubMenuPonto =
  | 'dashboard'
  | 'meu-ponto'
  | 'funcionarios'
  | 'escalas'
  | 'registro'
  | 'espelho'
  | 'ajustes'
  | 'banco-horas'
  | 'gestor'
  | 'relatorios'
  | 'configuracoes'
  | 'integracao-folha';

export type StatusPonto = 'Trabalhando' | 'Intervalo' | 'Ausente' | 'Finalizado';

export type TipoEscala = 'Administrativo' | '12x36' | '6x1' | 'Plantão' | 'Personalizada';

export interface RegistroPontoDoc {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  empresaId: string;
  data: string; // YYYY-MM-DD
  horaEntrada?: string; // HH:mm
  inicioIntervalo?: string; // HH:mm
  retornoIntervalo?: string; // HH:mm
  horaSaida?: string; // HH:mm
  latitude?: number;
  longitude?: number;
  dispositivo?: string;
  fotoRegistro?: string; // Base64 or URL
  status: StatusPonto;
  observacao?: string;
  horasTrabalhadasMinutos?: number;
  horasExtrasMinutos?: number;
  atrasoMinutos?: number;
  faltasMinutos?: number;
  saidaAntecipadaMinutos?: number;
  adicionalNoturnoMinutos?: number;
}

export interface EscalaTrabalhoDoc {
  id: string;
  empresaId: string;
  nome: string;
  tipo: TipoEscala;
  horarioEntrada: string; // "08:00"
  horarioSaida: string; // "17:00"
  intervalo: string; // "01:00"
  diasTrabalho: string[]; // ["seg", "ter", "qua", "qui", "sex"]
  toleranciaMinutos: number;
}

export interface AjustePontoDoc {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  empresaId: string;
  data: string;
  horarioEntradaProp: string;
  horarioSaidaProp: string;
  motivo: string;
  observacao?: string;
  anexoUrl?: string;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
  aprovadoPor?: string;
  dataAprovacao?: string;
}

export interface BancoHorasDoc {
  id: string;
  funcionarioId: string;
  funcionarioNome: string;
  empresaId: string;
  creditoMinutos: number;
  debitoMinutos: number;
  saldoMinutos: number;
  ultimaAtualizacao: string;
}

export interface FuncionarioPontoInfo {
  id: string;
  empresaId: string;
  nome: string;
  cpf: string;
  cargo: string;
  setor: string;
  email: string;
  telefone: string;
  escalaId: string;
  escalaNome?: string;
  gestorId?: string;
  gestorNome?: string;
  status: 'Ativo' | 'Inativo' | 'Afastado';
  statusLivePonto?: StatusPonto;
}

export interface ConfiguracoesPonto {
  empresaId: string;
  geofencingAtivo: boolean;
  latitudeCentro?: number;
  longitudeCentro?: number;
  raioPermitidoMetros: number;
  exigirFoto: boolean;
  toleranciaAtrasoMinutos: number;
  inicioAdicionalNoturno: string; // "22:00"
  fimAdicionalNoturno: string; // "05:00"
  sincronizarComFolha: boolean;
}
