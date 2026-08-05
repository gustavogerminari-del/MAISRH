import { Job } from '../types/job';

/**
 * Normalizes any variation of job status to standard string ('aberta', 'em_andamento', 'concluida', 'cancelada')
 */
export function normalizeJobStatus(value: any): string {
  const status = String(value || "").trim().toLowerCase();

  if (["aberta", "ativa", "open"].includes(status)) {
    return "aberta";
  }

  if (["em andamento", "em_andamento", "andamento"].includes(status)) {
    return "em_andamento";
  }

  if (["concluída", "concluida", "fechada"].includes(status)) {
    return "concluida";
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
  const origin = String(value || "").trim().toLowerCase();

  if (["vaga_interna", "interna", "interno"].includes(origin)) {
    return "interna";
  }

  if (["cliente", "atendimento_cliente", "cliente_externo", "recrutamento_cliente"].includes(origin)) {
    return "cliente";
  }

  if (["headhunter", "executive_search", "busca_ativa"].includes(origin)) {
    return "headhunter";
  }

  return origin;
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

  const resolvedCompanyId = job.companyId || job.empresaId || 'emp-001';

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
    recruiterName: job.recruiterName || 'Recrutador RH',
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
