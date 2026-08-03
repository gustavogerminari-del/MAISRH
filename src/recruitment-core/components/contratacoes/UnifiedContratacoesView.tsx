import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  DollarSign, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  Briefcase, 
  Building2, 
  TrendingUp,
  Send,
  Eye,
  X,
  Clock,
  AlertTriangle,
  Check,
  Loader2,
  FileText
} from 'lucide-react';
import { 
  UnifiedHiring, 
  OrigemProcesso 
} from '../../types/recruitment';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../auth';
import { JobCandidateService } from '../../../services/JobCandidateService';

interface UnifiedContratacoesViewProps {
  hirings?: UnifiedHiring[];
  origemProcesso?: OrigemProcesso;
  companyId?: string;
  onOpenAiModal?: (type: string, data?: any) => void;
}

export const UnifiedContratacoesView: React.FC<UnifiedContratacoesViewProps> = ({
  hirings = [],
  origemProcesso = 'recrutamento_interno',
  companyId,
  onOpenAiModal
}) => {
  const { user } = useAuth();
  const [firestoreHirings, setFirestoreHirings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [forwardingItem, setForwardingItem] = useState<any | null>(null);
  const [targetDestination, setTargetDestination] = useState<'departamento_pessoal' | 'headhunter'>('departamento_pessoal');
  const [isSubmittingForward, setIsSubmittingForward] = useState<boolean>(false);
  
  const [detailsItem, setDetailsItem] = useState<any | null>(null);

  const activeCompanyId = companyId || user?.empresaId || user?.companyId || user?.tenantId;
  const isMaster = user?.role === 'Super Administrador' || user?.role === 'MASTER' || user?.tipoUsuario === 'MASTER' || user?.isMaster === true;

  // Real-time Firestore subscription to 'contratacoes'
  useEffect(() => {
    setLoading(true);
    let q;
    if (isMaster || !activeCompanyId) {
      q = query(collection(db, 'contratacoes'));
    } else {
      q = query(collection(db, 'contratacoes'), where('companyId', '==', activeCompanyId));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setFirestoreHirings(list);
        setLoading(false);
      },
      (err) => {
        console.error('Erro ao buscar contratações no Firestore:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [activeCompanyId, isMaster]);

  // Combine Firestore list with any prop list as fallback
  const rawList = firestoreHirings.length > 0 ? firestoreHirings : hirings;

  // Format date helper
  const formatDate = (isoOrStr?: string) => {
    if (!isoOrStr) return 'Recente';
    try {
      const date = new Date(isoOrStr);
      if (isNaN(date.getTime())) return isoOrStr;
      return date.toLocaleDateString('pt-BR');
    } catch {
      return isoOrStr;
    }
  };

  const isHeadhunterView = origemProcesso === 'headhunter';

  const totalReceitaGerada = rawList.reduce((acc, h) => acc + (h.receitaGerada || h.faturamentoFee || 0), 0);
  const totalComissaoGerada = rawList.reduce((acc, h) => acc + (h.comissaoGerada || 0), 0);

  // Open forwarding modal
  const handleOpenForwardModal = (item: any) => {
    setForwardingItem(item);
    const origin = item.origemProcesso || (item.isHeadhunter ? 'headhunter' : 'recrutamento_interno');
    if (origin === 'headhunter') {
      setTargetDestination('headhunter');
    } else {
      setTargetDestination('departamento_pessoal');
    }
  };

  // Execute forwarding action
  const handleConfirmForwarding = async () => {
    if (!forwardingItem) return;

    setIsSubmittingForward(true);
    try {
      const res = await JobCandidateService.forwardHiring(forwardingItem, targetDestination);
      alert(res.message);
      setForwardingItem(null);
    } catch (err: any) {
      console.error('Erro ao executar encaminhamento:', err);
      alert(err?.message || 'Erro ao encaminhar candidato.');
    } finally {
      setIsSubmittingForward(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isHeadhunterView ? 'Histórico de Contratações & Placements Headhunter' : 'Histórico de Contratações & Admissões'}
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {rawList.length} {rawList.length === 1 ? 'contratação' : 'contratações'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Registro unificado da área de Contratações. Aloque candidatos aprovados e encaminhe para Headhunter ou Departamento Pessoal.
          </p>
        </div>

        {isHeadhunterView && totalReceitaGerada > 0 && (
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl text-xs font-bold text-emerald-900">
              Faturamento Total: <span className="text-emerald-700 font-black text-sm">R$ {totalReceitaGerada.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className={`grid grid-cols-1 ${isHeadhunterView ? 'sm:grid-cols-3' : 'sm:grid-cols-3'} gap-3`}>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Total de Contratações</span>
          <p className="text-2xl font-black text-slate-900">{rawList.length}</p>
          <span className="text-[10px] text-slate-400 font-medium">Cadastrados na empresa</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Encaminhados</span>
          <p className="text-2xl font-black text-emerald-600">
            {rawList.filter(h => h.statusEncaminhamento === 'Encaminhado').length}
          </p>
          <span className="text-[10px] text-emerald-600 font-bold">Enviados para DP/Headhunter</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Encaminhamento Pendente</span>
          <p className="text-2xl font-black text-amber-600">
            {rawList.filter(h => h.statusEncaminhamento !== 'Encaminhado').length}
          </p>
          <span className="text-[10px] text-amber-600 font-bold">Aguardando ação</span>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mr-2" />
          <span className="text-xs text-slate-600 font-bold">Carregando registro de contratações...</span>
        </div>
      )}

      {/* Hirings Cards List */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rawList.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
              Nenhuma contratação registrada.
            </div>
          ) : (
            rawList.map(h => {
              const name = h.candidatoNome || h.candidateName || 'Candidato';
              const job = h.vagaTitulo || h.jobTitle || h.cargo || 'Vaga Corporativa';
              const dateStr = formatDate(h.contratadoEm || h.dataContratacao || h.createdAt);
              const salary = Number(h.salarioContratado || h.salarioFinal || h.salario || 0);
              const forwardStatus = h.statusEncaminhamento || 'Pendente';
              const origin = h.origemProcesso || (isHeadhunterView ? 'headhunter' : 'recrutamento_interno');

              return (
                <div key={h.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                          <h3 className="text-base font-black text-slate-900">{name}</h3>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Admitido para: <strong className="text-slate-800">{job}</strong>
                          {h.clienteNome && <span> na <strong className="text-slate-800">{h.clienteNome}</strong></span>}
                        </p>
                      </div>

                      <span className="px-2.5 py-1 text-xs font-extrabold rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                        Contratado {dateStr}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl text-xs border border-slate-100">
                      <div>
                        <span className="text-slate-400 font-medium block">Remuneração Final</span>
                        <strong className="text-slate-800">
                          {salary > 0 ? `R$ ${salary.toLocaleString('pt-BR')}` : 'Não informada'}
                        </strong>
                      </div>

                      <div>
                        <span className="text-slate-400 font-medium block">Origem do Processo</span>
                        <strong className="text-slate-800 capitalize">
                          {origin === 'headhunter' ? 'Headhunter' : 'Recrutamento Interno'}
                        </strong>
                      </div>
                    </div>

                    {/* Forwarding Status Badge */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500 font-semibold">Status Encaminhamento:</span>
                      {forwardStatus === 'Encaminhado' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Check className="w-3.5 h-3.5" />
                          <span>Encaminhado ({h.encaminhadoPara === 'headhunter' ? 'Headhunter' : 'DP'})</span>
                        </span>
                      ) : forwardStatus === 'Erro no encaminhamento' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Erro no encaminhamento</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pendente</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 gap-2">
                    <button
                      onClick={() => setDetailsItem(h)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver detalhes</span>
                    </button>

                    <button
                      onClick={() => handleOpenForwardModal(h)}
                      className={`px-3.5 py-1.5 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                        forwardStatus === 'Encaminhado'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{forwardStatus === 'Encaminhado' ? 'Reencaminhar' : 'Encaminhar'}</span>
                    </button>

                    {onOpenAiModal && (
                      <button
                        onClick={() => onOpenAiModal('mensagemCandidato', { candidateName: name, jobTitle: job })}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                        title="Boas-Vindas IA"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL 1: Encaminhar Contratação */}
      {forwardingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-black text-slate-900">Encaminhar Contratação</h3>
              </div>
              <button 
                onClick={() => setForwardingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 text-xs text-slate-700">
              <p><strong>Candidato:</strong> {forwardingItem.candidatoNome || forwardingItem.candidateName}</p>
              <p><strong>Vaga:</strong> {forwardingItem.vagaTitulo || forwardingItem.jobTitle}</p>
              <p><strong>Origem:</strong> {forwardingItem.origemProcesso === 'headhunter' ? 'Headhunter' : 'Recrutamento Interno'}</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-800 block">
                Selecione o destino do encaminhamento:
              </label>

              <div className="grid grid-cols-1 gap-2">
                <label 
                  onClick={() => setTargetDestination('departamento_pessoal')}
                  className={`p-3.5 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                    targetDestination === 'departamento_pessoal'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="dest"
                    value="departamento_pessoal"
                    checked={targetDestination === 'departamento_pessoal'}
                    onChange={() => setTargetDestination('departamento_pessoal')}
                    className="accent-indigo-600"
                  />
                  <div>
                    <span className="text-xs font-bold block">Departamento Pessoal (DP)</span>
                    <span className="text-[11px] text-slate-500 font-normal block">Envia para a fila de admissão interna para coleta de documentos e CLT.</span>
                  </div>
                </label>

                <label 
                  onClick={() => setTargetDestination('headhunter')}
                  className={`p-3.5 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                    targetDestination === 'headhunter'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="dest"
                    value="headhunter"
                    checked={targetDestination === 'headhunter'}
                    onChange={() => setTargetDestination('headhunter')}
                    className="accent-indigo-600"
                  />
                  <div>
                    <span className="text-xs font-bold block">Headhunter / Placement Externo</span>
                    <span className="text-[11px] text-slate-500 font-normal block">Registra o placement de cliente externo no módulo Headhunter.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setForwardingItem(null)}
                disabled={isSubmittingForward}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmForwarding}
                disabled={isSubmittingForward}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSubmittingForward ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Encaminhando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirmar Encaminhamento</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Detalhes da Contratação */}
      {detailsItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-black text-slate-900">Detalhes da Contratação</h3>
              </div>
              <button 
                onClick={() => setDetailsItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Candidato</span>
                <strong className="text-slate-900 font-bold text-sm block mt-0.5">
                  {detailsItem.candidatoNome || detailsItem.candidateName}
                </strong>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Vaga / Cargo</span>
                <strong className="text-slate-900 font-bold text-sm block mt-0.5">
                  {detailsItem.vagaTitulo || detailsItem.jobTitle}
                </strong>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Data de Contratação</span>
                <strong className="text-slate-900 font-bold block mt-0.5">
                  {formatDate(detailsItem.contratadoEm || detailsItem.dataContratacao || detailsItem.createdAt)}
                </strong>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Remuneração Combinada</span>
                <strong className="text-emerald-700 font-black block mt-0.5">
                  {detailsItem.salarioContratado || detailsItem.salarioFinal
                    ? `R$ ${Number(detailsItem.salarioContratado || detailsItem.salarioFinal).toLocaleString('pt-BR')}`
                    : 'Não informada'}
                </strong>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Origem do Processo</span>
                <strong className="text-slate-900 font-bold block mt-0.5 capitalize">
                  {detailsItem.origemProcesso === 'headhunter' ? 'Headhunter (Cliente Externo)' : 'Recrutamento Interno'}
                </strong>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 font-medium block">Status do Encaminhamento</span>
                <strong className="text-indigo-700 font-bold block mt-0.5">
                  {detailsItem.statusEncaminhamento || 'Pendente'}
                  {detailsItem.encaminhadoPara && ` (${detailsItem.encaminhadoPara})`}
                </strong>
              </div>
            </div>

            {detailsItem.clienteNome && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-400 font-medium block">Cliente Headhunter</span>
                <strong className="text-slate-900 font-bold block mt-0.5">{detailsItem.clienteNome}</strong>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDetailsItem(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
