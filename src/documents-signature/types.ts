/**
 * MÓDULO ASSINATURA E GESTÃO DE DOCUMENTOS - Tipos TypeScript
 * MAIS RH - Sistema de Gestão de Pessoas
 */

export type DocumentCategory = 'Contrato de Trabalho' | 'Termo de Admissão' | 'NDA / Sigilo' | 'Declaração de Benefícios' | 'Atestado / Laudo' | 'Regulamento Interno';

export type SignatureStatus = 'Pendente de Assinatura' | 'Assinado Digitalmente' | 'Recusado' | 'Aguardando Validação';

export interface HRDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  category: DocumentCategory;
  linkedEntityName: string; // Ex: Nome do Colaborador, Candidato ou Vaga
  linkedType: 'Colaborador' | 'Candidato' | 'Vaga' | 'Empresa';
  uploadedAt: string;
  signatureStatus: SignatureStatus;
  signers: {
    name: string;
    email: string;
    role: 'Colaborador' | 'Testemunha' | 'Representante Legal RH';
    signedAt?: string;
    hasSigned: boolean;
  }[];
  accessPermissions: {
    canView: boolean;
    canSign: boolean;
    canDownload: boolean;
    canDelete: boolean;
  };
}
