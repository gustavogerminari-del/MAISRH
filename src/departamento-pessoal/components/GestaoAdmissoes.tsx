import React, { useState } from 'react';
import { 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  FileText, 
  DollarSign, 
  Briefcase, 
  Calendar, 
  Building2, 
  AlertCircle, 
  Plus, 
  Check, 
  X, 
  Sparkles,
  Search,
  UserCheck
} from 'lucide-react';
import { AdmissaoPending, ColaboradorCompleto, TipoContrato } from '../types/dp';

interface GestaoAdmissoesProps {
  admissoes: AdmissaoPending[];
  colaboradores: ColaboradorCompleto[];
  onEfetivarAdmissao: (
    admissao: AdmissaoPending, 
    dadosAdicionais?: { gestor?: string; escala?: string; bancoAgencia?: string; rg?: string }
  ) => Promise<void>;
  companyId: string;
}

export const GestaoAdmissoes: React.FC<GestaoAdmissoesProps> = ({
  admissoes,
  colaboradores,
  onEfetivarAdmissao,
  companyId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmissao, setSelectedAdmissao] = useState<AdmissaoPending | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form para modal de efetivação
  const [formGestor, setFormGestor] = useState('Diretoria de Operações');
  const [formEscala, setFormEscala] = useState('5x2 (Segunda a Sexta 08:00 - 18:00)');
  const [formBanco, setFormBanco] = useState('Banco Itaú / Ag 0123 / C/C 45678-9');
  const [formRg, setFormRg] = useState('12.345.678-9');

  const filtered = admissoes.filter(a => {
    const term = searchTerm.toLowerCase().trim();
    return !term || 
      a.nomeCompleto.toLowerCase().includes(term) ||
      a.cargo.toLowerCase().includes(term) ||
      a.email.toLowerCase().includes(term);
  });

  const handleOpenEfetivar = (adm: AdmissaoPending) => {
    setSelectedAdmissao(adm);
    setShowConfirmModal(true);
  };

  const handleConfirmarEfetivacao = async () => {
    if (!selectedAdmissao) return;
    setIsSubmitting(true);
    try {
      await onEfetivarAdmissao(selectedAdmissao, {
        gestor: formGestor,
        escala: formEscala,
        bancoAgencia: formBanco,
        rg: formRg
      });
      setShowConfirmModal(false);
      setSelectedAdmissao(null);
    } catch (error) {
      console.error('Erro ao efetivar admissão:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Processo de Admissão & Integração
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-full border border-emerald-200">
              {admissoes.length} registros
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Transferência direta de candidatos contratados do Recrutamento para o Cadastro Oficial de Colaboradores.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar contratado ou cargo..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
          />
        </div>
      </div>

      {/* Admissões List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            Nenhuma admissão pendente encontrada.
          </div>
        ) : (
          filtered.map(adm => {
            const jaEfetivado = adm.status === 'Efetivado' || colaboradores.some(c => (c as any).candidatoId === adm.candidatoId);

            return (
              <div 
                key={adm.id}
                className={`bg-white p-5 rounded-2xl border transition-all space-y-4 shadow-2xs ${
                  jaEfetivado ? 'border-slate-200 opacity-75' : 'border-emerald-200 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">{adm.nomeCompleto}</h3>
                      <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase ${
                        jaEfetivado 
                          ? 'bg-slate-100 text-slate-700' 
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {jaEfetivado ? 'Efetivado em DP' : adm.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Admitido para: <strong className="text-slate-800">{adm.cargo}</strong> ({adm.departamento || 'Geral'})
                    </p>
                  </div>

                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                    R$ {adm.salarioCombinado.toLocaleString('pt-BR')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px]">E-mail / Contato</span>
                    <strong className="text-slate-800 truncate block">{adm.email}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px]">Data Prevista Admissão</span>
                    <strong className="text-slate-800">{adm.dataAdmissaoPrevista || 'A definir'}</strong>
                  </div>
                </div>

                {/* Checklist Summary */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                    Checklist de Admissão ({adm.checklist.filter(c => c.concluido).length}/{adm.checklist.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {adm.checklist.map((chk, idx) => (
                      <span 
                        key={idx}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 border ${
                          chk.concluido 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {chk.concluido ? <Check className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-slate-400" />}
                        <span>{chk.item}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">Contrato: {adm.tipoContrato || 'CLT'}</span>

                  {jaEfetivado ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-black">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Cadastrado no Colaborador</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleOpenEfetivar(adm)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Concluir contratação e criar colaborador</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation & Completion Modal */}
      {showConfirmModal && selectedAdmissao && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-emerald-600" />
                <h3 className="text-lg font-black text-slate-900">Efetivação de Colaborador</h3>
              </div>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100 text-xs space-y-1">
              <p className="font-extrabold text-emerald-950">Confirmar criação de registro oficial no DP:</p>
              <p className="text-emerald-800">
                <strong>{selectedAdmissao.nomeCompleto}</strong> • {selectedAdmissao.cargo} (R$ {selectedAdmissao.salarioCombinado.toLocaleString('pt-BR')})
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Gestor / Liderança Responsável</label>
                <input
                  type="text"
                  value={formGestor}
                  onChange={e => setFormGestor(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-700 block mb-1">Escala / Jornada de Trabalho</label>
                <input
                  type="text"
                  value={formEscala}
                  onChange={e => setFormEscala(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">RG do Colaborador</label>
                  <input
                    type="text"
                    value={formRg}
                    onChange={e => setFormRg(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Dados Bancários para Salário</label>
                  <input
                    type="text"
                    value={formBanco}
                    onChange={e => setFormBanco(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleConfirmarEfetivacao}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Criando Colaborador...' : 'Confirmar e Efetivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
