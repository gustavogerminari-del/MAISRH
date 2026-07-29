import { HRDocument } from './types';

export const MOCK_DOCUMENTS: HRDocument[] = [
  {
    id: 'doc-001',
    companyId: 'emp-001',
    version: 1,
    title: 'Contrato Individual de Trabalho CLT - Mariana Siqueira',
    fileName: 'contrato_clt_mariana_siqueira_v2.pdf',
    fileSize: '1.4 MB',
    category: 'Contrato de Trabalho',
    linkedEntityName: 'Mariana Costa Siqueira',
    linkedType: 'Colaborador',
    uploadedAt: '2026-07-01',
    signatureStatus: 'Assinado Digitalmente',
    signers: [
      { name: 'Mariana Costa Siqueira', email: 'mariana@email.com', role: 'Colaborador', signedAt: '2026-07-01 14:32', hasSigned: true },
      { name: 'Carlos Eduardo RH', email: 'carlos@maisrh.com', role: 'Representante Legal RH', signedAt: '2026-07-01 15:05', hasSigned: true }
    ],
    accessPermissions: { canView: true, canSign: true, canDownload: true, canDelete: false }
  },
  {
    id: 'doc-002',
    companyId: 'emp-001',
    version: 1,
    title: 'Termo de Confidencialidade e NDA Corporativo',
    fileName: 'nda_termo_confidencialidade_2026.pdf',
    fileSize: '850 KB',
    category: 'NDA / Sigilo',
    linkedEntityName: 'Rodrigo Albuquerque',
    linkedType: 'Candidato',
    uploadedAt: '2026-07-22',
    signatureStatus: 'Pendente de Assinatura',
    signers: [
      { name: 'Rodrigo Albuquerque', email: 'rodrigo@email.com', role: 'Colaborador', hasSigned: false },
      { name: 'Diretoria de RH', email: 'rh@maisrh.com', role: 'Representante Legal RH', hasSigned: true, signedAt: '2026-07-22 10:00' }
    ],
    accessPermissions: { canView: true, canSign: true, canDownload: true, canDelete: true }
  },
  {
    id: 'doc-003',
    companyId: 'emp-001',
    version: 1,
    title: 'Adesão ao Vale Refeição & Vale Transporte Flex',
    fileName: 'termo_opcao_beneficios_thiago.pdf',
    fileSize: '620 KB',
    category: 'Declaração de Benefícios',
    linkedEntityName: 'Thiago Oliveira',
    linkedType: 'Colaborador',
    uploadedAt: '2026-07-15',
    signatureStatus: 'Assinado Digitalmente',
    signers: [
      { name: 'Thiago Oliveira', email: 'thiago@email.com', role: 'Colaborador', signedAt: '2026-07-15 11:20', hasSigned: true }
    ],
    accessPermissions: { canView: true, canSign: false, canDownload: true, canDelete: false }
  }
];
