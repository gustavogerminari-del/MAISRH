import { Job } from '../types/job';

/**
 * Normalizes any variation of job status to standard string ('aberta', 'em_andamento', 'preenchida', 'pausada', 'cancelada')
 */
export function normalizeJobStatus(value: any): string {
  const status = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

  if (["aberta", "ativa", "open"].includes(status)) {
    return "aberta";
  }

  if (["em_andamento", "andamento", "em_processo"].includes(status)) {
    return "em_andamento";
  }

  if (["preenchida", "preenchido", "concluida", "concluída", "fechada"].includes(status)) {
    return "preenchida";
  }

  if (["pausada", "pausado"].includes(status)) {
    return "pausada";
  }

  if (["cancelada", "cancelado"].includes(status)) {
    return "cancelada";
  }

  return status;
}

/**
 * Normalizes any variation of job origin to standard string ('interna', 'cliente', 'headhunter')
 */
export function normalizeJobOrigin(value: any): string {
  const origin = String(value || "")
    .trim()
    .toLowerCase();

  if (["vaga_interna", "interna", "interno"].includes(origin)) {
    return "interna";
  }

  if (["cliente", "clientes", "atendimento_cliente", "recrutamento_cliente"].includes(origin)) {
    return "cliente";
  }

  if (["headhunter", "executive_search", "busca_ativa"].includes(origin)) {
    return "headhunter";
  }

  return origin;
}

/**
 * Normalizes a Firestore document or raw job object so ID is document.id
 */
export function normalizeJobDocument(document: any): Job {
  if (!document) return document;
  const data = typeof document.data === 'function' ? document.data() : document;
  const docId = document.id || data.id;

  return normalizeJobData({
    ...data,
    id: docId,
    legacyId: data.id || null
  });
}

/**
 * Deterministic Candidate to Job Match score calculator (0-100)
 */
export interface CandidateJobMatch {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
}

export function calculateCandidateJobMatch(job: any, candidate: any): CandidateJobMatch {
  if (!job || !candidate) {
    return {
      score: 50,
      matchedSkills: [],
      missingSkills: [],
      summary: 'Dados insuficientes para cálculo de compatibilidade.'
    };
  }

  let baseScore = 50;
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  const candidateSkills = (candidate.skills || candidate.competencias || []).map((s: string) => String(s).toLowerCase().trim());
  const jobRequirements = (job.requirements || job.requisitos || []).map((r: string) => String(r).toLowerCase().trim());

  jobRequirements.forEach((req: string) => {
    const isMatched = candidateSkills.some((skill: string) => req.includes(skill) || skill.includes(req));
    if (isMatched) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  if (jobRequirements.length > 0) {
    const ratio = matchedSkills.length / jobRequirements.length;
    baseScore += Math.round(ratio * 40);
  } else {
    baseScore += 20;
  }

  const candidateRole = String(candidate.role || candidate.cargoAtual || candidate.cargoDesejado || '').toLowerCase();
  const jobTitle = String(job.title || job.titulo || '').toLowerCase();
  if (candidateRole && jobTitle && (jobTitle.includes(candidateRole) || candidateRole.includes(jobTitle))) {
    baseScore += 10;
  }

  const score = Math.min(100, Math.max(0, baseScore));

  const summary = matchedSkills.length > 0
    ? `Análise básica: Candidato atende a ${matchedSkills.length} requisito(s) alinhado(s) à vaga.`
    : `Análise básica: Compatibilidade preliminar baseada no perfil e localização.`;

  return {
    score,
    matchedSkills,
    missingSkills,
    summary
  };
}

/**
 * Normalizes an entire Job object for legacy compatibility and consistency
 */
export function normalizeJobData(job: any): Job {
  if (!job) return job;

  const title = job.title || job.titulo || 'Vaga Sem Título';
  const description = job.description || job.descricao || '';
  const companyName = job.companyName || job.nomeEmpresa || 'MAIS RH Brasil';
  const location = job.location || (job.cidade ? `${job.cidade} - ${job.estado || ''}` : 'São Paulo - SP');
  const contractType = job.type || job.tipoContrato || 'CLT';
  const salaryRange = job.salaryRange || job.salario || 'A combinar';
  const origin = normalizeJobOrigin(job.origem || job.origemProcesso || job.tipoProcesso);
  const status = normalizeJobStatus(job.status);

  const resolvedCompanyId = job.companyId || job.empresaId || '';

  return {
    ...job,
    id: job.id,
    title,
    titulo: title,
    description,
    descricao: description,
    companyName,
    nomeEmpresa: companyName,
    department: job.department || 'Geral',
    location,
    locationType: job.locationType || job.modalidade || 'Híbrido',
    type: contractType as any,
    tipoContrato: contractType as any,
    salaryRange,
    salario: salaryRange,
    openings: job.openings || job.quantidadeVagas || 1,
    quantidadeVagas: job.openings || job.quantidadeVagas || 1,
    applicantsCount: (job.applicantsCount !== undefined && job.applicantsCount > 0)
      ? job.applicantsCount
      : (job.candidatosCount || 0),
    requirements: job.requirements || job.requisitos || [],
    requisitos: job.requirements || job.requisitos || [],
    benefits: job.benefits || job.beneficios || [],
    beneficios: job.benefits || job.beneficios || [],
    recruiterName: job.recruiterName || job.recrutadorResponsavel || 'Recrutador RH',
    deadline: job.deadline || '2026-12-31',
    createdAt: job.createdAt || job.dataCriacao || new Date().toISOString().split('T')[0],
    companyId: resolvedCompanyId,
    empresaId: resolvedCompanyId,
    origem: origin,
    origemProcesso: job.origemProcesso || (origin === 'interna' ? 'vaga_interna' : origin === 'cliente' ? 'recrutamento_cliente' : 'headhunter'),
    status: status as any,
    publicada: job.publicada !== false && job.publicado !== false,
    publicado: job.publicado !== false && job.publicada !== false,
    ativo: job.ativo !== false,
  };
}

