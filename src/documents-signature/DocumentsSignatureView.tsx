import React, { useState } from 'react';
import { 
  FileText, 
  PenTool, 
  Upload, 
  Download, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Search, 
  Filter, 
  Lock, 
  Trash2, 
  Eye, 
  UserCheck, 
  FilePlus, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { HRDocument, DocumentCategory } from './types';
import { MOCK_DOCUMENTS } from './mockData';
import { DocumentService } from '../services/DocumentService';
import { ContextualAiModal } from '../ai/components/ContextualAiModal';
import { documentsAiService } from '../ai/services/aiService';

export const DocumentsSignatureView: React.FC = () => {
  const [documents, setDocuments] = useState<HRDocument[]>(MOCK_DOCUMENTS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedDocForSigning, setSelectedDocForSigning] = useState<HRDocument | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  
  // New Document Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DocumentCategory>('Contrato de Trabalho');
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityType, setNewEntityType] = useState<'Colaborador' | 'Candidato' | 'Vaga' | 'Empresa'>('Colaborador');
  const [fileObj, setFileObj] = useState<File | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    DocumentService.list().then(data => {
      if (isMounted) {
        if (data && data.length > 0) setDocuments(data);
        setLoading(false);
      }
    }).catch(err => {
      console.warn('Erro ao carregar documentos do Firestore:', err);
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false; };
  }, []);

  // Digital Signature Simulator
  const handleSimulateDigitalSignature = async (docId: string) => {
    const targetDoc = documents.find(d => d.id === docId);
    if (targetDoc) {
      const updatedSigners = targetDoc.signers.map(s => ({
        ...s,
        hasSigned: true,
        signedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      }));
      await DocumentService.update(docId, {
        signatureStatus: 'Assinado Digitalmente',
        signers: updatedSigners
      });

      setDocuments(documents.map(d => {
        if (d.id === docId) {
          return {
            ...d,
            signatureStatus: 'Assinado Digitalmente',
            signers: updatedSigners
          };
        }
        return d;
      }));
    }
    setSelectedDocForSigning(null);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newEntityName) return;

    const newDocData: Partial<HRDocument> = {
      title: newTitle,
      fileName: fileObj ? fileObj.name : 'documento_novo.pdf',
      fileSize: fileObj ? `${(fileObj.size / (1024 * 1024)).toFixed(1)} MB` : '1.1 MB',
      category: newCategory,
      linkedEntityName: newEntityName,
      linkedType: newEntityType,
      signatureStatus: 'Pendente de Assinatura',
      signers: [
        { name: newEntityName, email: 'usuario@dominio.com.br', role: 'Colaborador', hasSigned: false }
      ],
      accessPermissions: { canView: true, canSign: true, canDownload: true, canDelete: true }
    };

    const savedDoc = await DocumentService.create(newDocData);

    setDocuments([savedDoc, ...documents]);
    setShowUploadModal(false);
    setNewTitle('');
    setNewEntityName('');
    setFileObj(null);
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.linkedEntityName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'Todas' || d.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Assinatura Digital & Criptografia ICP-Brasil
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Gestão Eletrônica de Documentos & Contratos</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Repositório seguro de NDAs, contratos de admissão e termos com validação jurídica e controle granular de permissões.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setShowAiModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Identificar Vencimentos com IA</span>
          </button>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <FilePlus className="w-4 h-4" />
            <span>Novo Documento / Contrato</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por título ou pessoa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Categoria:</span>
          {['Todas', 'Contrato de Trabalho', 'NDA / Sigilo', 'Declaração de Benefícios'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between hover:border-indigo-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                  {doc.category}
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  doc.signatureStatus === 'Assinado Digitalmente' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {doc.signatureStatus === 'Assinado Digitalmente' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {doc.signatureStatus}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">{doc.title}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Vínculo: <strong>{doc.linkedEntityName}</strong> ({doc.linkedType})
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Arquivo:</span>
                  <strong className="text-slate-800">{doc.fileName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tamanho:</span>
                  <span>{doc.fileSize}</span>
                </div>
                <div className="flex justify-between">
                  <span>Enviado em:</span>
                  <span>{doc.uploadedAt}</span>
                </div>
              </div>

              {/* Signers Status */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assinantes do Documento:</span>
                {doc.signers.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-800">{s.name} ({s.role})</span>
                    {s.hasSigned ? (
                      <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-1">
                        ✓ Assinado
                      </span>
                    ) : (
                      <span className="text-amber-600 text-[10px] font-bold">Pendente</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Document Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 text-slate-400">
                <Eye className="w-4 h-4 hover:text-indigo-600 cursor-pointer" title="Visualizar Documento" />
                <Download className="w-4 h-4 hover:text-indigo-600 cursor-pointer" title="Baixar PDF" />
              </div>

              {doc.signatureStatus === 'Pendente de Assinatura' ? (
                <button
                  onClick={() => setSelectedDocForSigning(doc)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1 transition-all"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  Assinar Digitalmente
                </button>
              ) : (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                  Validação ICP OK
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ASSINATURA DIGITAL SIMULADA */}
      {selectedDocForSigning && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Coletar Assinatura Digital</h3>
                <p className="text-xs text-slate-500">Certificado Digital & Carimbo do Tempo ICP-Brasil</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Você está prestes a assinar o documento <strong>"{selectedDocForSigning.title}"</strong> vinculado a <strong>{selectedDocForSigning.linkedEntityName}</strong>.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-700 space-y-1">
              <div><strong>HASH SHA-256:</strong> e3b0c44298fc1c149afbf4c8996fb924...719c8f00</div>
              <div><strong>IP REGISTRADO:</strong> 187.32.109.12 (Autenticado)</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDocForSigning(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSimulateDigitalSignature(selectedDocForSigning.id)}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmar Assinatura Eletrônica
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD NOVO DOCUMENTO */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Novo Documento / Contrato para Assinatura</h3>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Documento *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Contrato de Trabalho CLT - João Santos"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                >
                  <option value="Contrato de Trabalho">Contrato de Trabalho</option>
                  <option value="NDA / Sigilo">NDA / Sigilo</option>
                  <option value="Declaração de Benefícios">Declaração de Benefícios</option>
                  <option value="Termo de Admissão">Termo de Admissão</option>
                  <option value="Atestado / Laudo">Atestado / Laudo</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vínculo com *</label>
                  <select
                    value={newEntityType}
                    onChange={(e) => setNewEntityType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="Colaborador">Colaborador</option>
                    <option value="Candidato">Candidato</option>
                    <option value="Vaga">Vaga</option>
                    <option value="Empresa">Empresa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Pessoa / Entidade *</label>
                  <input
                    type="text"
                    required
                    value={newEntityName}
                    onChange={(e) => setNewEntityName(e.target.value)}
                    placeholder="Ex: Gabriel Lima"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Anexar Arquivo PDF *</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFileObj(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Enviar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ContextualAiModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        title="Análise de Vencimentos & Conformidade de Documentos"
        subtitle="Verificação automatizada de prazos de validade, NDAs e contratos do repositório"
        onExecute={() => documentsAiService.identifyExpiration({ documents })}
        confirmText="Anotar Prazos"
      />
    </div>
  );
};
