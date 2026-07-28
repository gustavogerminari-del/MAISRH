import React, { useState } from 'react';
import { X, Briefcase, Building2, DollarSign, Plus, Trash2 } from 'lucide-react';
import { UnifiedJob, OrigemProcesso, JobType } from '../../types/recruitment';

interface HeadhunterClientOption {
  id: string;
  nomeFantasia: string;
  razaoSocial?: string;
}

interface UnifiedJobFormModalProps {
  origemProcesso: OrigemProcesso;
  existingJob?: UnifiedJob | null;
  clients?: HeadhunterClientOption[];
  onClose: () => void;
  onSave: (jobData: UnifiedJob) => void;
}

export const UnifiedJobFormModal: React.FC<UnifiedJobFormModalProps> = ({
  origemProcesso,
  existingJob,
  clients = [],
  onClose,
  onSave
}) => {
  const isHeadhunter = origemProcesso === 'headhunter';

  const [titulo, setTitulo] = useState(existingJob?.titulo || existingJob?.title || '');
  const [clienteId, setClienteId] = useState(existingJob?.clienteId || (clients[0]?.id || ''));
  const [clienteNome, setClienteNome] = useState(existingJob?.clienteNome || (clients[0]?.nomeFantasia || ''));
  const [department, setDepartment] = useState(existingJob?.department || 'Tecnologia & Sistemas');
  const [gestorRequisitante, setGestorRequisitante] = useState(existingJob?.gestorRequisitante || 'Diretoria Executiva');
  const [centroCusto, setCentroCusto] = useState(existingJob?.centroCusto || 'RH-101');
  const [tipoContrato, setTipoContrato] = useState<JobType>(existingJob?.tipoContrato || existingJob?.type || 'CLT');
  const [location, setLocation] = useState(existingJob?.location || 'São Paulo - SP');
  const [salario, setSalario] = useState(existingJob?.salario || existingJob?.salaryRange || 'R$ 8.000 - R$ 12.000');
  const [quantidadeVagas, setQuantidadeVagas] = useState(existingJob?.quantidadeVagas || existingJob?.openings || 1);
  const [descricao, setDescricao] = useState(existingJob?.descricao || existingJob?.description || '');
  const [requisitosInput, setRequisitosInput] = useState((existingJob?.requisitos || existingJob?.requirements || []).join('\n'));
  
  // Headhunter exclusive fields
  const [valorNegociado, setValorNegociado] = useState(existingJob?.valorNegociado || existingJob?.valorCobrado || 15000);
  const [percentualComissao, setPercentualComissao] = useState(existingJob?.percentualComissao || 20);
  const [slaDias, setSlaDias] = useState(existingJob?.slaDias || 20);
  const [regraCobranca, setRegraCobranca] = useState(existingJob?.regraCobranca || 'Honorário Fixo na Contratação');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedClient = clients.find(c => c.id === clienteId);
    const finalClientName = selectedClient ? selectedClient.nomeFantasia : (clienteNome || 'Cliente Corporativo');

    const reqArray = requisitosInput
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);

    const comissaoCalc = isHeadhunter ? Math.round((valorNegociado * percentualComissao) / 100) : 0;

    const updatedJob: UnifiedJob = {
      id: existingJob?.id || `vaga-${Date.now()}`,
      empresaId: existingJob?.empresaId || 'emp-001',
      origemProcesso,
      titulo,
      title: titulo,
      clienteId: isHeadhunter ? clienteId : undefined,
      clienteNome: isHeadhunter ? finalClientName : undefined,
      department: !isHeadhunter ? department : undefined,
      gestorRequisitante: !isHeadhunter ? gestorRequisitante : undefined,
      centroCusto: !isHeadhunter ? centroCusto : undefined,
      descricao,
      description: descricao,
      requisitos: reqArray,
      requirements: reqArray,
      salario,
      salaryRange: salario,
      tipoContrato,
      type: tipoContrato,
      location,
      quantidadeVagas: Number(quantidadeVagas),
      openings: Number(quantidadeVagas),
      applicantsCount: existingJob?.applicantsCount || 0,
      status: existingJob?.status || 'Aberta',
      publicada: true,
      dataCriacao: existingJob?.dataCriacao || existingJob?.createdAt || new Date().toISOString().split('T')[0],
      createdAt: existingJob?.createdAt || new Date().toISOString().split('T')[0],

      // Headhunter extras
      valorNegociado: isHeadhunter ? Number(valorNegociado) : undefined,
      valorCobrado: isHeadhunter ? Number(valorNegociado) : undefined,
      percentualComissao: isHeadhunter ? Number(percentualComissao) : undefined,
      comissaoCalculada: isHeadhunter ? comissaoCalc : undefined,
      slaDias: isHeadhunter ? Number(slaDias) : undefined,
      regraCobranca: isHeadhunter ? regraCobranca : undefined,
    };

    onSave(updatedJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-xs ${
              isHeadhunter ? 'bg-indigo-600' : 'bg-slate-800'
            }`}>
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-slate-900">
              {existingJob ? 'Editar Vaga' : isHeadhunter ? 'Nova Vaga Corporativa (Headhunter)' : 'Nova Vaga de Recrutamento Interno'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Main Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Título do Cargo / Vaga *</label>
            <input
              required
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: Diretor de Tecnologia, Gerente de Vendas..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 font-bold text-slate-900"
            />
          </div>

          {/* Contextual Selector: Client (Headhunter) vs Depto/Gestor (Recrutamento) */}
          {isHeadhunter ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
              <div>
                <label className="block font-bold text-indigo-900 mb-1">Cliente Contratante *</label>
                {clients.length > 0 ? (
                  <select
                    value={clienteId}
                    onChange={e => {
                      setClienteId(e.target.value);
                      const c = clients.find(x => x.id === e.target.value);
                      if (c) setClienteNome(c.nomeFantasia);
                    }}
                    className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-bold"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.nomeFantasia}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    required
                    type="text"
                    value={clienteNome}
                    onChange={e => setClienteNome(e.target.value)}
                    placeholder="Nome do Cliente..."
                    className="w-full p-2 bg-white border border-indigo-200 rounded-xl"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-indigo-900 mb-1">Fee / Honorário Negociado (R$)</label>
                <input
                  type="number"
                  value={valorNegociado}
                  onChange={e => setValorNegociado(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-bold text-indigo-900"
                />
              </div>

              <div>
                <label className="block font-bold text-indigo-900 mb-1">Comissão (%)</label>
                <input
                  type="number"
                  value={percentualComissao}
                  onChange={e => setPercentualComissao(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-indigo-900 mb-1">SLA (Dias Úteis)</label>
                <input
                  type="number"
                  value={slaDias}
                  onChange={e => setSlaDias(Number(e.target.value))}
                  className="w-full p-2 bg-white border border-indigo-200 rounded-xl"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Departamento Interno</label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="Ex: Tecnologia, Vendas..."
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Gestor Requisitante</label>
                <input
                  type="text"
                  value={gestorRequisitante}
                  onChange={e => setGestorRequisitante(e.target.value)}
                  placeholder="Nome do gestor..."
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Centro de Custo</label>
                <input
                  type="text"
                  value={centroCusto}
                  onChange={e => setCentroCusto(e.target.value)}
                  placeholder="Ex: RH-101"
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>
          )}

          {/* Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tipo de Contrato</label>
              <select
                value={tipoContrato}
                onChange={e => setTipoContrato(e.target.value as JobType)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="CLT">CLT</option>
                <option value="PJ">PJ</option>
                <option value="Estágio">Estágio</option>
                <option value="Temporário">Temporário</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Localização</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ex: São Paulo - SP (Híbrido)"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Faixa Salarial</label>
              <input
                type="text"
                value={salario}
                onChange={e => setSalario(e.target.value)}
                placeholder="Ex: R$ 10.000 - R$ 15.000"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          {/* Quantidade de vagas e Descricao */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="block font-bold text-slate-700 mb-1">Quantidade de Vagas</label>
              <input
                type="number"
                min="1"
                value={quantidadeVagas}
                onChange={e => setQuantidadeVagas(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-bold text-slate-700 mb-1">Descrição Breve</label>
              <input
                type="text"
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                placeholder="Resumo do objetivo da posição..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Requisitos */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Requisitos Exigidos (1 por linha)</label>
            <textarea
              rows={3}
              value={requisitosInput}
              onChange={e => setRequisitosInput(e.target.value)}
              placeholder="Ex: Superior Completo&#10;Inglês Fluente&#10;Experiência prévia em Liderança"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-extrabold text-xs rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              Salvar Vaga
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
