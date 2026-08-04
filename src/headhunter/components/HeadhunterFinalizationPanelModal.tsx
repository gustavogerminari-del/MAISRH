import React, { useState } from 'react';
import { 
  Building2, 
  UserCheck, 
  FileText, 
  CheckSquare, 
  Square, 
  ShieldCheck, 
  Send, 
  CheckCircle2, 
  X, 
  History
} from 'lucide-react';
import { doc, writeBatch } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { sanitizeFirestoreData } from '../../lib/firestoreUtils';
import { useAuth } from '../../auth';

export interface HeadhunterFinalizationPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: any;
  candidate: any;
  onRefresh?: () => Promise<void> | void;
}

export const HeadhunterFinalizationPanelModal: React.FC<HeadhunterFinalizationPanelModalProps> = ({
  isOpen,
  onClose,
  job,
  candidate,
  onRefresh
}) => {
  const { user } = useAuth();

  if (!isOpen || !job || !candidate) return null;

  const candidateName = candidate.name || candidate.nome || candidate.candidatoNome || 'Candidato';
  const jobTitle = job.titulo || job.title || candidate.role || candidate.vagaTitulo || 'Vaga Headhunter';
  const clientName = job.clienteNome || candidate.clienteNome || (candidate as any).clientName || 'Empresa Cliente';
  const candidateEmail = candidate.email || '';
  const candidatePhone = candidate.phone || candidate.telefone || '';

  // Form Fields
  const [empresaCliente, setEmpresaCliente] = useState(clientName);
  const [responsavelContratacao, setResponsavelContratacao] = useState(
    job.responsavelComercial || job.consultorResponsavel || user?.nome || 'Consultor RH'
  );
  const [cargo, setCargo] = useState(jobTitle);
  const [email, setEmail] = useState(candidateEmail);
  const [telefone, setTelefone] = useState(candidatePhone);
  const [dataPrevistaContratacao, setDataPrevistaContratacao] = useState(() => {
    return (candidate as any).dataPrevistaContratacao || job.deadline || new Date().toISOString().split('T')[0];
  });
  const [observacoes, setObservacoes] = useState((candidate as any).observacoes || '');

  // Status State
  const [statusProcesso, setStatusProcesso] = useState<string>(() => {
    return (candidate as any).statusEncaminhamento || (candidate as any).statusContratacao || 'Aguardando Encaminhamento';
  });

  // Selected Documents
  const [docsToSend, setDocsToSend] = useState({
    curriculo: true,
    parecerRH: true,
    parecerIA: true,
    historicoEntrevistas: true,
    cartaApresentacao: false,
    avaliacoes: true,
    outrosAnexos: false
  });

  // Client Confirmation State
  const [clienteConfirmou, setClienteConfirmou] = useState<boolean>(() => {
    return (candidate as any).clienteConfirmou === true || statusProcesso === 'Contratado pelo Cliente';
  });
  const [dataConfirmacao, setDataConfirmacao] = useState<string>(() => {
    return (candidate as any).dataConfirmacao || new Date().toISOString().split('T')[0];
  });
  const [prazoGarantiaDias, setPrazoGarantiaDias] = useState<number>(() => {
    return job.prazoGarantia || job.garantiaDias || 90;
  });

  // Timeline / History Logs
  const [historyLogs, setHistoryLogs] = useState<any[]>(() => {
    return candidate.timeline || (candidate as any).historicoEncaminhamento || [
      {
        dataHora: new Date().toISOString(),
        usuario: user?.nome || auth.currentUser?.displayName || 'Recrutador RH',
        acao: 'Candidato Aprovado',
        descricao: `Candidato ${candidateName} aprovado na etapa final de recrutamento.`
      }
    ];
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDoc = (key: keyof typeof docsToSend) => {
    setDocsToSend(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Compute Warranty Remaining Days
  const computedWarranty = React.useMemo(() => {
    if (!clienteConfirmou && statusProcesso !== 'Contratado pelo Cliente') return null;

    const start = new Date(dataConfirmacao);
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + prazoGarantiaDias);

    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const remainingDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    return {
      dataInicial: start.toLocaleDateString('pt-BR'),
      dataFinal: endDate.toLocaleDateString('pt-BR'),
      diasRestantes: remainingDays,
      status: remainingDays > 0 ? 'Em Garantia' : 'Garantia Concluída'
    };
  }, [clienteConfirmou, statusProcesso, dataConfirmacao, prazoGarantiaDias]);

  // Handler: Encaminhar ao Cliente
  const handleEncaminharAoCliente = async () => {
    setIsSubmitting(true);
    const now = new Date().toISOString();
    const usuarioResponsavel = user?.nome || auth.currentUser?.displayName || 'Consultor Headhunter';

    const selectedDocList = Object.entries(docsToSend)
      .filter(([_, value]) => value)
      .map(([key]) => {
        switch (key) {
          case 'curriculo': return 'Currículo';
          case 'parecerRH': return 'Parecer do RH';
          case 'parecerIA': return 'Parecer da IA';
          case 'historicoEntrevistas': return 'Histórico das entrevistas';
          case 'cartaApresentacao': return 'Carta de apresentação';
          case 'avaliacoes': return 'Avaliações';
          case 'outrosAnexos': return 'Outros anexos';
          default: return key;
        }
      });

    const newLog = {
      id: `log-${Date.now()}`,
      dataHora: now,
      usuario: usuarioResponsavel,
      acao: 'Encaminhamento ao Cliente',
      descricao: `Projeto encaminhado para ${empresaCliente}. Documentos enviados: ${selectedDocList.join(', ')}.`
    };

    const updatedLogs = [newLog, ...historyLogs];

    const contratacaoId = candidate.id.includes('_') ? candidate.id : `${job.id}_${candidate.candidateId || candidate.id}`;
    const candidaturaId = candidate.id;

    try {
      const appRef = doc(db, 'candidate_applications', candidaturaId);
      const contratacaoRef = doc(db, 'contratacoes', contratacaoId);

      const updateData = sanitizeFirestoreData({
        status: 'Concluído',
        statusRecrutamento: 'Concluído',
        statusContratacao: 'Aguardando contratação externa',
        statusEncaminhamento: 'Aguardando contratação externa',
        destino: 'Empresa Cliente',
        destinoContratacao: 'Empresa Cliente',
        isHeadhunter: true,
        origemProcesso: 'headhunter',
        empresaCliente,
        responsavelContratacao,
        cargo,
        email,
        telefone,
        dataPrevistaContratacao,
        dataEncaminhamento: new Date().toISOString().split('T')[0],
        documentosEnviados: selectedDocList,
        observacoes,
        timeline: updatedLogs,
        updatedAt: now
      });

      const batch = writeBatch(db);
      batch.set(appRef, updateData, { merge: true });
      batch.set(contratacaoRef, updateData, { merge: true });

      await batch.commit();

      setStatusProcesso('Aguardando contratação externa');
      setHistoryLogs(updatedLogs);

      alert(`✅ Processo do candidato ${candidateName} encaminhado ao cliente ${empresaCliente} com sucesso!`);
      if (onRefresh) await onRefresh();
    } catch (err: any) {
      console.error('Erro ao encaminhar candidato ao cliente:', err);
      alert(`Erro ao encaminhar processo: ${err?.message || 'Falha na operação'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Confirmar Contratação pelo Cliente
  const handleConfirmarContratacao = async () => {
    setIsSubmitting(true);
    const now = new Date().toISOString();
    const usuarioResponsavel = user?.nome || auth.currentUser?.displayName || 'Consultor Headhunter';

    const newLog = {
      id: `log-${Date.now()}`,
      dataHora: now,
      usuario: usuarioResponsavel,
      acao: 'Confirmação da Contratação pelo Cliente',
      descricao: `Contratação confirmada pelo cliente ${empresaCliente}. Garantia de ${prazoGarantiaDias} dias iniciada automaticamente.`
    };

    const updatedLogs = [newLog, ...historyLogs];

    const contratacaoId = candidate.id.includes('_') ? candidate.id : `${job.id}_${candidate.candidateId || candidate.id}`;
    const candidaturaId = candidate.id;

    try {
      const appRef = doc(db, 'candidate_applications', candidaturaId);
      const contratacaoRef = doc(db, 'contratacoes', contratacaoId);

      const updateData = sanitizeFirestoreData({
        status: 'Contratado pelo Cliente',
        statusContratacao: 'Contratado pelo Cliente',
        statusEncaminhamento: 'Contratado pelo Cliente',
        clienteConfirmou: true,
        dataConfirmacaoContratacao: dataConfirmacao,
        responsavelConfirmacao: usuarioResponsavel,
        garantiaIniciada: true,
        garantiaDias: prazoGarantiaDias,
        garantiaDataInicio: dataConfirmacao,
        garantiaStatus: 'Em Garantia',
        observacoes,
        timeline: updatedLogs,
        updatedAt: now
      });

      const batch = writeBatch(db);
      batch.set(appRef, updateData, { merge: true });
      batch.set(contratacaoRef, updateData, { merge: true });

      await batch.commit();

      setClienteConfirmou(true);
      setStatusProcesso('Contratado pelo Cliente');
      setHistoryLogs(updatedLogs);

      alert(`🎉 Contratação de ${candidateName} confirmada pelo cliente! Período de garantia iniciado.`);
      if (onRefresh) await onRefresh();
    } catch (err: any) {
      console.error('Erro ao confirmar contratação pelo cliente:', err);
      alert(`Erro ao confirmar contratação: ${err?.message || 'Falha na operação'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 border border-slate-200 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-block">
              Headhunter • Encerramento do Projeto
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Painel de Finalização & Encaminhamento ao Cliente
            </h2>
            <p className="text-xs text-slate-500">
              Vaga de origem Headhunter. Este processo é encaminhado diretamente ao cliente final sem vínculo com o Departamento Pessoal.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CANDIDATE & JOB SUMMARY BOX */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shrink-0">
              {candidateName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="text-sm font-black block">{candidateName}</span>
              <span className="text-xs text-slate-300 font-medium block">Vaga: {jobTitle}</span>
            </div>
          </div>

          <div className="bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700 text-right shrink-0">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Status Atual</span>
            <span className="text-xs font-black text-amber-400">{statusProcesso}</span>
          </div>
        </div>

        {/* SECTION 1: INFORMAÇÕES DO CLIENTE E CONTRATAÇÃO */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            Dados do Cliente & Contratação Externa
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Empresa Cliente *</label>
              <input
                type="text"
                value={empresaCliente}
                onChange={e => setEmpresaCliente(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Responsável pela Contratação *</label>
              <input
                type="text"
                value={responsavelContratacao}
                onChange={e => setResponsavelContratacao(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Cargo Pretendido *</label>
              <input
                type="text"
                value={cargo}
                onChange={e => setCargo(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">E-mail de Contato</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Data Prevista de Contratação</label>
              <input
                type="date"
                value={dataPrevistaContratacao}
                onChange={e => setDataPrevistaContratacao(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: DOCUMENTOS PARA ENVIO */}
        <div className="space-y-3 bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100">
          <h3 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              Documentos para Envio ao Cliente
            </span>
            <span className="text-[10px] text-indigo-700 font-bold">Marque quais anexos serão transmitidos</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            {[
              { key: 'curriculo', label: '✔ Currículo' },
              { key: 'parecerRH', label: '✔ Parecer do RH' },
              { key: 'parecerIA', label: '✔ Parecer da IA' },
              { key: 'historicoEntrevistas', label: '✔ Histórico das Entrevistas' },
              { key: 'cartaApresentacao', label: '✔ Carta de Apresentação' },
              { key: 'avaliacoes', label: '✔ Avaliações' },
              { key: 'outrosAnexos', label: '✔ Outros Anexos' }
            ].map(item => {
              const isChecked = docsToSend[item.key as keyof typeof docsToSend];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleDoc(item.key as any)}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition font-bold cursor-pointer ${
                    isChecked
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isChecked ? <CheckSquare className="w-4 h-4 text-amber-300 shrink-0" /> : <Square className="w-4 h-4 text-slate-400 shrink-0" />}
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <label className="block text-slate-700 font-bold mb-1 text-xs">Observações do Encaminhamento</label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              placeholder="Instruções ou destaques sobre o candidato enviados ao cliente..."
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleEncaminharAoCliente}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-amber-300" />
              <span>Encaminhar ao Cliente</span>
            </button>
          </div>
        </div>

        {/* SECTION 3: CONFIRMAÇÃO DA CONTRATACAO & GARANTIA */}
        <div className="p-5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                Confirmação de Contratação & Garantia Headhunter
              </h3>
            </div>

            {clienteConfirmou ? (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-3 py-1 rounded-full border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Contratação Confirmada pelo Cliente
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-3 py-1 rounded-full border border-amber-300">
                Aguardando Confirmação
              </span>
            )}
          </div>

          {!clienteConfirmou ? (
            <div className="space-y-3 text-xs">
              <p className="text-amber-900 font-medium">
                Quando a empresa cliente confirmar a admissão efetiva do candidato, marque a opção abaixo para ativar a contagem automática da garantia.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Data da Efetiva Contratação</label>
                  <input
                    type="date"
                    value={dataConfirmacao}
                    onChange={e => setDataConfirmacao(e.target.value)}
                    className="w-full p-2.5 bg-white border border-amber-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Prazo de Garantia do Projeto (Dias)</label>
                  <input
                    type="number"
                    value={prazoGarantiaDias}
                    onChange={e => setPrazoGarantiaDias(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-amber-200 rounded-xl font-medium outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleConfirmarContratacao}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Cliente Confirmou a Contratação</span>
                </button>
              </div>
            </div>
          ) : (
            computedWarranty && (
              <div className="bg-white p-4 rounded-xl border border-amber-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Dias Restantes</span>
                  <strong className="text-base font-black text-amber-600 block">{computedWarranty.diasRestantes} dias</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Data Inicial</span>
                  <strong className="font-bold block">{computedWarranty.dataInicial}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Data Final</span>
                  <strong className="font-bold block">{computedWarranty.dataFinal}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Status da Garantia</span>
                  <span className="inline-block bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-black text-[10px] border border-amber-200">
                    {computedWarranty.status}
                  </span>
                </div>
              </div>
            )
          )}
        </div>

        {/* SECTION 4: HISTÓRICO AUTOMÁTICO DO PROCESSO */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" />
            Histórico Registrado do Encaminhamento
          </h3>

          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {historyLogs.map((log: any, idx: number) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="text-indigo-700 font-black">{log.acao || 'Registro de Evento'}</span>
                  <span className="text-[10px] text-slate-400">{log.dataHora ? new Date(log.dataHora).toLocaleString('pt-BR') : ''}</span>
                </div>
                <p className="text-slate-700 text-[11px] font-medium">{log.descricao}</p>
                {log.usuario && <span className="text-[10px] text-slate-400 font-semibold block">Responsável: {log.usuario}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
