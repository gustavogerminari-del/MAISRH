/**
 * Mock Seed Data para o Módulo de Departamento Pessoal (DP)
 * MAIS RH - Plataforma SaaS Multiempresa
 */

import { 
  ColaboradorCompleto, 
  ItemBeneficio, 
  RegistroFeriasColaborador, 
  CalculoRescisorio, 
  ConfiguracoesTrabalhistas 
} from '../types/dp';

export const INITIAL_COLABORADORES: ColaboradorCompleto[] = [
  {
    id: 'colab-001',
    companyId: 'emp-001',
    nomeCompleto: 'Ana Paula Vasconcelos',
    fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    pessoais: {
      cpf: '234.567.890-11',
      rg: '12.345.678-9 SSP/SP',
      dataNascimento: '1990-05-14',
      estadoCivil: 'Casado(a)',
      genero: 'Feminino',
      telefone: '(11) 98765-4321',
      emailPessoal: 'ana.vasconcelos@gmail.com',
      endereco: {
        logradouro: 'Av. Paulista',
        numero: '1000, Apto 42',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-100'
      }
    },
    profissionais: {
      cargo: 'Coordenadora de Recursos Humanos',
      departamento: 'Recursos Humanos',
      centroCusto: 'CC-101 (Gente & Gestão)',
      dataAdmissao: '2022-03-15',
      salarioBase: 8500.00,
      jornadaSemanalHours: 44,
      escalaTrabalho: '5x2 (Segunda a Sexta 08:00 - 18:00 com 1h20 intervalo)',
      gestorResponsavel: 'Luciana Mello',
      status: 'Ativo',
      emailCorporativo: 'ana.paula@maisrh.com.br'
    },
    trabalhistas: {
      pisPasep: '123.45678.90-1',
      ctpsNumero: '123456',
      ctpsSerie: '001-SP',
      ctpsUf: 'SP',
      dependentesCount: 2,
      sindicato: 'SINSAUDEL - Sindicato dos Trabalhadores no Comércio',
      tipoContrato: 'CLT',
      bancoAgenciaConta: 'Banco Itaú | Ag 1234 | C/C 56789-0',
      optanteValeTransporte: true
    },
    beneficiosAtivos: ['ben-vt-01', 'ben-vr-01', 'ben-saude-01', 'ben-odonto-01'],
    createdAt: '2022-03-15',
    updatedAt: '2026-07-01'
  },
  {
    id: 'colab-002',
    companyId: 'emp-001',
    nomeCompleto: 'Lucas Silva Santos',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    pessoais: {
      cpf: '345.678.901-22',
      rg: '23.456.789-0 SSP/SP',
      dataNascimento: '1993-11-20',
      estadoCivil: 'Solteiro(a)',
      genero: 'Masculino',
      telefone: '(11) 97654-3210',
      emailPessoal: 'lucas.silva.dev@gmail.com',
      endereco: {
        logradouro: 'Rua Augusta',
        numero: '500',
        bairro: 'Consolação',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01305-000'
      }
    },
    profissionais: {
      cargo: 'Desenvolvedor Full Stack Senior',
      departamento: 'Tecnologia',
      centroCusto: 'CC-202 (Engenharia & TI)',
      dataAdmissao: '2023-01-10',
      salarioBase: 12500.00,
      jornadaSemanalHours: 40,
      escalaTrabalho: '5x2 (Segunda a Sexta 09:00 - 18:00 Remoto)',
      gestorResponsavel: 'Carlos Eduardo Silva',
      status: 'Ativo',
      emailCorporativo: 'lucas.santos@maisrh.com.br'
    },
    trabalhistas: {
      pisPasep: '234.56789.01-2',
      ctpsNumero: '234567',
      ctpsSerie: '002-SP',
      ctpsUf: 'SP',
      dependentesCount: 0,
      sindicato: 'SINDPD - Sindicato dos Trabalhadores em Processamento de Dados',
      tipoContrato: 'CLT',
      bancoAgenciaConta: 'Banco Bradesco | Ag 4321 | C/C 98765-4',
      optanteValeTransporte: false
    },
    beneficiosAtivos: ['ben-vr-01', 'ben-saude-01', 'ben-seguro-01'],
    createdAt: '2023-01-10',
    updatedAt: '2026-07-01'
  },
  {
    id: 'colab-003',
    companyId: 'emp-001',
    nomeCompleto: 'Fernanda Lima Oliveira',
    fotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    pessoais: {
      cpf: '456.789.012-33',
      rg: '34.567.890-1 SSP/RJ',
      dataNascimento: '1995-08-03',
      estadoCivil: 'União Estável',
      genero: 'Feminino',
      telefone: '(21) 98888-7777',
      emailPessoal: 'fernanda.lima.design@outlook.com',
      endereco: {
        logradouro: 'Rua Funchal',
        numero: '200',
        bairro: 'Vila Olímpia',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '04551-060'
      }
    },
    profissionais: {
      cargo: 'Product Designer (UI/UX)',
      departamento: 'Produto',
      centroCusto: 'CC-203 (Design & UX)',
      dataAdmissao: '2023-06-01',
      salarioBase: 9200.00,
      jornadaSemanalHours: 40,
      escalaTrabalho: '5x2 (Segunda a Sexta 09:00 - 18:00 Híbrido)',
      gestorResponsavel: 'Carlos Eduardo Silva',
      status: 'Férias',
      emailCorporativo: 'fernanda.lima@maisrh.com.br'
    },
    trabalhistas: {
      pisPasep: '345.67890.12-3',
      ctpsNumero: '345678',
      ctpsSerie: '003-RJ',
      ctpsUf: 'RJ',
      dependentesCount: 1,
      sindicato: 'SINDPD - Sindicato de Tecnologia',
      tipoContrato: 'CLT',
      bancoAgenciaConta: 'Nubank | Ag 0001 | C/C 1122334-5',
      optanteValeTransporte: true
    },
    beneficiosAtivos: ['ben-vt-01', 'ben-vr-01', 'ben-saude-01'],
    createdAt: '2023-06-01',
    updatedAt: '2026-07-01'
  },
  {
    id: 'colab-004',
    companyId: 'emp-001',
    nomeCompleto: 'Roberto Andrade Filho',
    fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    pessoais: {
      cpf: '567.890.123-44',
      rg: '45.678.901-2 SSP/SP',
      dataNascimento: '1988-02-28',
      estadoCivil: 'Casado(a)',
      genero: 'Masculino',
      telefone: '(11) 95555-4444',
      emailPessoal: 'roberto.andrade@gmail.com',
      endereco: {
        logradouro: 'Rua Vergueiro',
        numero: '1200',
        bairro: 'Vila Mariana',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '04102-000'
      }
    },
    profissionais: {
      cargo: 'Analista Financeiro Pleno',
      departamento: 'Financeiro & DP',
      centroCusto: 'CC-102 (Administrativo)',
      dataAdmissao: '2021-09-01',
      salarioBase: 6800.00,
      jornadaSemanalHours: 44,
      escalaTrabalho: '5x2 (Segunda a Sexta 08:30 - 18:00)',
      gestorResponsavel: 'Luciana Mello',
      status: 'Ativo',
      emailCorporativo: 'roberto.analista@maisrh.com.br'
    },
    trabalhistas: {
      pisPasep: '456.78901.23-4',
      ctpsNumero: '456789',
      ctpsSerie: '004-SP',
      ctpsUf: 'SP',
      dependentesCount: 3,
      sindicato: 'SECESP - Sindicato dos Empregados no Comércio',
      tipoContrato: 'CLT',
      bancoAgenciaConta: 'Banco Santander | Ag 0987 | C/C 65432-1',
      optanteValeTransporte: true
    },
    beneficiosAtivos: ['ben-vt-01', 'ben-vr-01', 'ben-saude-01', 'ben-odonto-01', 'ben-creche-01'],
    createdAt: '2021-09-01',
    updatedAt: '2026-07-01'
  }
];

export const INITIAL_BENEFICIOS: ItemBeneficio[] = [
  {
    id: 'ben-vt-01',
    companyId: 'emp-001',
    nome: 'Vale Transporte Corporativo',
    categoria: 'Vale Transporte',
    tipoCalculo: 'Percentual Salário',
    valorBeneficio: 480.00,
    percentualDescontoFuncionario: 6.0, // Teto da CLT
    custoEmpresaEstimado: 380.00,
    ativo: true,
    fornecedor: 'SPTrans / Ticket Transporte'
  },
  {
    id: 'ben-vr-01',
    companyId: 'emp-001',
    nome: 'Vale Refeição (Ticket Restaurante)',
    categoria: 'Vale Refeição',
    tipoCalculo: 'Valor Fixo',
    valorBeneficio: 950.00, // R$ 43,18 por dia
    percentualDescontoFuncionario: 2.0, // Coparticipação simbólica
    custoEmpresaEstimado: 931.00,
    ativo: true,
    fornecedor: 'Ticket Serviços / Pluxee'
  },
  {
    id: 'ben-va-01',
    companyId: 'emp-001',
    nome: 'Vale Alimentação Supermercado',
    categoria: 'Vale Alimentação',
    tipoCalculo: 'Valor Fixo',
    valorBeneficio: 500.00,
    percentualDescontoFuncionario: 0.0,
    custoEmpresaEstimado: 500.00,
    ativo: true,
    fornecedor: 'Sodexo Pass Alimentação'
  },
  {
    id: 'ben-saude-01',
    companyId: 'emp-001',
    nome: 'Plano de Saúde Bradesco Saúde Top Nacional',
    categoria: 'Plano de Saúde',
    tipoCalculo: 'Valor Fixo',
    valorBeneficio: 890.00,
    percentualDescontoFuncionario: 10.0,
    custoEmpresaEstimado: 801.00,
    ativo: true,
    fornecedor: 'Bradesco Saúde'
  },
  {
    id: 'ben-odonto-01',
    companyId: 'emp-001',
    nome: 'Plano Odontológico OdontoPrev Master',
    categoria: 'Plano Odontológico',
    tipoCalculo: 'Valor Fixo',
    valorBeneficio: 48.00,
    percentualDescontoFuncionario: 0.0,
    custoEmpresaEstimado: 48.00,
    ativo: true,
    fornecedor: 'OdontoPrev'
  },
  {
    id: 'ben-seguro-01',
    companyId: 'emp-001',
    nome: 'Seguro de Vida em Grupo Mongeral Aegon',
    categoria: 'Seguro de Vida',
    tipoCalculo: 'Valor Fixo',
    valorBeneficio: 35.00,
    percentualDescontoFuncionario: 0.0,
    custoEmpresaEstimado: 35.00,
    ativo: true,
    fornecedor: 'MAG Seguros'
  }
];

export const INITIAL_FERIAS: RegistroFeriasColaborador[] = [
  {
    id: 'fer-001',
    companyId: 'emp-001',
    colaboradorId: 'colab-001',
    colaboradorNome: 'Ana Paula Vasconcelos',
    cargo: 'Coordenadora de RH',
    departamento: 'Recursos Humanos',
    periodoAquisitivoInicio: '2025-03-15',
    periodoAquisitivoFim: '2026-03-14',
    diasAdquiridos: 30,
    diasGozados: 0,
    diasSaldo: 30,
    status: 'Disponível',
    valorUmTercoConstitucional: 2833.33,
    valorTotalLiquidoFerias: 10450.00
  },
  {
    id: 'fer-002',
    companyId: 'emp-001',
    colaboradorId: 'colab-003',
    colaboradorNome: 'Fernanda Lima Oliveira',
    cargo: 'Product Designer',
    departamento: 'Produto',
    periodoAquisitivoInicio: '2024-06-01',
    periodoAquisitivoFim: '2025-05-31',
    diasAdquiridos: 30,
    diasGozados: 15,
    diasSaldo: 15,
    dataInicioGozo: '2026-07-15',
    dataFimGozo: '2026-07-29',
    status: 'Em Gozo',
    valorUmTercoConstitucional: 1533.33,
    valorTotalLiquidoFerias: 5680.00
  },
  {
    id: 'fer-003',
    companyId: 'emp-001',
    colaboradorId: 'colab-004',
    colaboradorNome: 'Roberto Andrade Filho',
    cargo: 'Analista Financeiro',
    departamento: 'Financeiro & DP',
    periodoAquisitivoInicio: '2024-09-01',
    periodoAquisitivoFim: '2025-08-31',
    diasAdquiridos: 30,
    diasGozados: 0,
    diasSaldo: 30,
    dataInicioGozo: '2026-09-01',
    dataFimGozo: '2026-09-30',
    status: 'Solicitado',
    valorUmTercoConstitucional: 2266.67,
    valorTotalLiquidoFerias: 8380.00
  }
];

export const INITIAL_RESCISOES: CalculoRescisorio[] = [
  {
    id: 'resc-001',
    companyId: 'emp-001',
    colaboradorId: 'colab-old-01',
    colaboradorNome: 'Marcelo Ribeiro de Souza',
    cargo: 'Analista de Sistemas Pleno',
    salarioBase: 7800.00,
    dataAdmissao: '2022-01-10',
    dataDesligamento: '2026-06-30',
    tipoRescisao: 'Demissão sem Justa Causa (Iniciativa do Empregador)',
    avisoPrevio: 'Indenizado',
    diasAvisoPrevio: 42, // 30 dias + 3 por ano trabalhado (4 anos = +12)
    
    // Proventos
    saldoSalarioDias: 30,
    valorSaldoSalario: 7800.00,
    valorAvisoPrevioIndenizado: 10920.00,
    meses13Proporcional: 6,
    valor13Proporcional: 3900.00,
    mesesFeriasProporcionais: 6,
    valorFeriasProporcionais: 3900.00,
    valorFeriasVencidas: 7800.00,
    valorUmTercoFerias: 3900.00,
    
    // Descontos
    descontoInss: 908.85,
    descontoIrrf: 1245.30,
    descontoFaltasAtrasos: 0,
    descontoAvisoPrevioNaoCumprido: 0,
    
    totalProventos: 38220.00,
    totalDescontos: 2154.15,
    valorLiquidoRescisao: 36065.85,
    saldoFgtsEstimado: 38400.00,
    multaFgtsPercentual: 40,
    valorMultaFgts: 15360.00,
    
    status: 'Homologado',
    dataHomologacao: '2026-07-05'
  }
];

export const DEFAULT_CONFIG_TRABALHISTA: ConfiguracoesTrabalhistas = {
  companyId: 'emp-001',
  toleranciaPontoMinutos: 10, // Art. 58 § 1º da CLT
  adicionalHorasExtrasSemanaPercent: 50,
  adicionalHorasExtrasDomingoFeriadoPercent: 100,
  adicionalNoturnoPercent: 20,
  horarioNoturnoInicio: '22:00',
  horarioNoturnoFim: '05:00',
  aliquotaFgtsPercent: 8,
  
  // Tabela INSS 2026 (Oficial Vigorante)
  tabelaInss: [
    { ate: 1412.00, aliquota: 7.5, deducao: 0 },
    { ate: 2666.68, aliquota: 9.0, deducao: 21.18 },
    { ate: 4000.03, aliquota: 12.0, deducao: 101.18 },
    { ate: 7786.02, aliquota: 14.0, deducao: 181.18 }
  ],
  
  // Tabela IRRF 2026 (Com isenção e dedução por dependente de R$ 189,59)
  tabelaIrrf: [
    { ate: 2259.20, aliquota: 0, deducao: 0, deducaoDependente: 189.59 },
    { ate: 2826.65, aliquota: 7.5, deducao: 169.44, deducaoDependente: 189.59 },
    { ate: 3751.05, aliquota: 15.0, deducao: 381.44, deducaoDependente: 189.59 },
    { ate: 4664.68, aliquota: 22.5, deducao: 662.77, deducaoDependente: 189.59 },
    { ate: 999999.00, aliquota: 27.5, deducao: 896.00, deducaoDependente: 189.59 }
  ]
};
