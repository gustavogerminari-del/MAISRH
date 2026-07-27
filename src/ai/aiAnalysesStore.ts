import { IaAnalise } from './types';

const STORAGE_KEY = 'mais_rh_ia_analises';

// Initial mock data for ia_analises
const INITIAL_ANALYSES: IaAnalise[] = [
  {
    id: 'ana-001',
    empresaId: 'emp-001',
    vagaId: 'vaga-001',
    candidatoId: 'cand-001',
    candidatoNome: 'Lucas Andrade Ferreira',
    vagaTitulo: 'Desenvolvedor Senior Full Stack',
    pontuacao: 92,
    analise: 'O candidato possui excelente alinhamento técnico com a vaga de Full Stack, com forte domínio em React, Node.js e TypeScript.',
    parecer: 'Apresenta grande maturidade técnica e comportamental. Recomendamos agendamento imediato de entrevista técnica.',
    pontosFortes: [
      'Sólida experiência com TypeScript e React há mais de 5 anos',
      'Atuação comprovada em arquiteturas distribuídas e microsserviços',
      'Boa comunicação verbal e capacidade de mentoria técnica'
    ],
    pontosAtencao: [
      'Pouca vivência direta com soluções de cloud GCP (mais focado em AWS)'
    ],
    recomendacao: 'Altamente Recomendado',
    dataCriacao: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: 'ana-002',
    empresaId: 'emp-001',
    vagaId: 'vaga-001',
    candidatoId: 'cand-002',
    candidatoNome: 'Mariana Costa e Silva',
    vagaTitulo: 'Gerente de Produto (Product Manager)',
    pontuacao: 88,
    analise: 'Perfil analítico consistente com histórico relevante na gestão de produtos B2B SaaS e métricas de crescimento.',
    parecer: 'A candidata tem ótima bagagem de mercado. Vale avançar para a fase de alinhamento cultural.',
    pontosFortes: [
      'Metodologia ágil estruturada (Scrum/Kanban)',
      'Forte orientação a dados e Product Analytics',
      'Excelente didática e liderança situacional'
    ],
    pontosAtencao: [
      'Experiência prévia em times predominantemente presenciais'
    ],
    recomendacao: 'Recomendado',
    dataCriacao: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: 'ana-003',
    empresaId: 'emp-001',
    vagaId: 'vaga-002',
    candidatoId: 'cand-003',
    candidatoNome: 'Gabriel Santos Nogueira',
    vagaTitulo: 'Designer UX/UI Pleno',
    pontuacao: 78,
    analise: 'Portfólio bem estruturado com protótipos de alta fidelidade e design system.',
    parecer: 'Perfeita aderência visual. Requer validação prática referente a pesquisas com usuários (UX Research).',
    pontosFortes: [
      'Portfólio visual atraente no Figma',
      'Experiência na construção e manutenção de Design Systems'
    ],
    pontosAtencao: [
      'Experiência com métricas de usabilidade ainda em desenvolvimento'
    ],
    recomendacao: 'Em Avaliação',
    dataCriacao: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

export function getIaAnalises(): IaAnalise[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ANALYSES));
      return INITIAL_ANALYSES;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading ia_analises from localStorage:', err);
    return INITIAL_ANALYSES;
  }
}

export function saveIaAnalise(analiseData: Omit<IaAnalise, 'id' | 'dataCriacao'>): IaAnalise {
  const currentList = getIaAnalises();
  
  // Check if analysis already exists for this vaga + candidato
  const existingIndex = currentList.findIndex(
    item => item.vagaId === analiseData.vagaId && item.candidatoId === analiseData.candidatoId
  );

  const newAnalise: IaAnalise = {
    ...analiseData,
    id: existingIndex >= 0 ? currentList[existingIndex].id : `ana-${Date.now()}`,
    dataCriacao: new Date().toISOString()
  };

  let updated: IaAnalise[];
  if (existingIndex >= 0) {
    updated = [...currentList];
    updated[existingIndex] = newAnalise;
  } else {
    updated = [newAnalise, ...currentList];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error saving ia_analise to localStorage:', err);
  }

  return newAnalise;
}

export function getAnaliseByCandidatoEVaga(candidatoId: string, vagaId?: string): IaAnalise | undefined {
  const list = getIaAnalises();
  if (vagaId) {
    return list.find(item => item.candidatoId === candidatoId && item.vagaId === vagaId);
  }
  return list.find(item => item.candidatoId === candidatoId);
}

export function getAnalisesByVaga(vagaId: string): IaAnalise[] {
  const list = getIaAnalises();
  return list.filter(item => item.vagaId === vagaId);
}
