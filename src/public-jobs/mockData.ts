import { PublicJob } from './types';

export const MOCK_PUBLIC_JOBS: PublicJob[] = [
  {
    id: 'pub-job-001',
    code: 'VAG-1029',
    title: 'Recrutador Sênior (Tech Recruitment)',
    companyName: 'MAIS RH Consultoria',
    department: 'Recrutamento & Seleção',
    location: 'São Paulo, SP',
    workMode: 'Híbrido',
    contractType: 'CLT',
    salaryRange: 'R$ 7.500 - R$ 9.000',
    description: 'Buscamos um Recrutador Sênior experiente em vagas de tecnologia, engenharia de software e cargos executivos para atuar na expansão do nosso time.',
    requirements: [
      'Superior Completo em Psicologia, Gestão de RH ou áreas correlatas',
      'Experiência sólida de no mínimo 4 anos em Tech Recruiting',
      'Domínio de técnicas de hunting via LinkedIn Recruiter',
      'Conhecimento de frameworks ágeis e sistemas ATS'
    ],
    benefits: [
      'Vale Refeição / Alimentação R$ 1.200/mês',
      'Plano de Saúde e Odontológico Bradesco',
      'Auxílio Home Office R$ 300/mês',
      'Seguro de Vida e Bônus Anual por Desempenho'
    ],
    publishedAt: '2026-07-20',
    deadline: '2026-08-20',
    featured: true
  },
  {
    id: 'pub-job-002',
    code: 'VAG-1030',
    title: 'Analista de Departamento Pessoal Pleno',
    companyName: 'Grupo Nexus Industrial',
    department: 'Operações de RH',
    location: 'Campinas, SP',
    workMode: 'Presencial',
    contractType: 'CLT',
    salaryRange: 'R$ 4.800 - R$ 5.500',
    description: 'Responsável pela folha de pagamento, cálculo de férias, rescisões, controle de ponto eletrônico e transmissão de obrigações eSocial.',
    requirements: [
      'Superior em Contabilidade, Administração ou Gestão de RH',
      'Experiência prévia em eSocial e sistemas ERP (TOTVS/Senior)',
      'Domínio das alterações recentes da CLT'
    ],
    benefits: [
      'Vale Transporte e Fretado no local',
      'Restaurante próprio na empresa',
      'Plano de Saúde Unimed com coparticipação zero',
      'Participação nos Lucros e Resultados (PLR)'
    ],
    publishedAt: '2026-07-22',
    featured: false
  },
  {
    id: 'pub-job-003',
    code: 'VAG-1031',
    title: 'Desenvolvedor Full Stack React / Node.js',
    companyName: 'TechVision Solutions',
    department: 'Tecnologia da Informação',
    location: 'Remoto - Todo o Brasil',
    workMode: 'Remoto',
    contractType: 'PJ',
    salaryRange: 'R$ 11.000 - R$ 13.500',
    description: 'Atuação na construção de plataformas SaaS web escaláveis de alta performance utilizando ecossistema TypeScript moderno.',
    requirements: [
      'Domínio de React, Node.js, Express, TypeScript e PostgreSQL/Firestore',
      'Familiaridade com arquitetura de microsserviços e Docker',
      'Postura autônoma, proativa e bom trabalho em equipe'
    ],
    benefits: [
      'Horário flexível e trabalho 100% remoto',
      'Verba anual de R$ 3.000 para cursos, livros e certificações',
      'Gympass corporativo'
    ],
    publishedAt: '2026-07-25',
    deadline: '2026-08-30',
    featured: true
  }
];
