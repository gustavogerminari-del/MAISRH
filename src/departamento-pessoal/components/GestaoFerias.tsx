import React, { useState } from 'react';
import { 
  Sun, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  User, 
  DollarSign, 
  Search, 
  Filter, 
  Check, 
  X,
  Umbrella
} from 'lucide-react';
import { RegistroFeriasColaborador, ColaboradorCompleto } from '../types/dp';

interface GestaoFeriasProps {
  feriasList: RegistroFeriasColaborador[];
  colaboradores: ColaboradorCompleto[];
  onSalvarFerias: (ferias: RegistroFeriasColaborador) => void;
  companyId: string;
}

export const GestaoFerias: React.FC<GestaoFeriasProps> = ({
  feriasList,
  colaboradores,
  onSalvarFerias,
  companyId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFerias, setEditingFerias] = useState<Partial<RegistroFeriasColaborador> | null>(null);

  const filtered = feriasList.filter(f => {
    const matchesSearch = f.colaboradorNome.toLowerCase().includes(searchTerm.toLowerCase()) || f.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'Todos' || f.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOpenSolicitacao = (colab?: ColaboradorCompleto) => {
    const target = colab || colaboradores[0];
    const salario = target?.profissionais.salarioBase || 5000;
    const umTerco = salario / 3;
    const total = salario + umTerco;

    setEditingFerias({
      companyId,
      colaboradorId: target?.id || 'colab-001',
      colaboradorNome: target?.nomeCompleto || 'Colaborador',
      cargo: target?.profissionais.cargo || 'Cargo',
      departamento: target?.profissionais.departamento || 'Geral',
      periodoAquisitivoInicio: '2025-01-01',
      periodoAquisitivoFim: '2025-12-31',
      diasAdquiridos: 30,
      diasGozados: 0,
      diasSaldo: 30,
      dataInicioGozo: new Date().toISOString().split('T')[0],
      dataFimGozo: new Date(Date.now() + 29 * 86400000).toISOString().split('T')[0],
      status: 'Solicitado',
      valorUmTercoConstitucional: umTerco,
      valorTotalLiquidoFerias: total
    });
    setIsModalOpen(true);
  };

  const handleAprovar = (f: RegistroFeriasColaborador) => {
    const updated: RegistroFeriasColaborador = {
      ...f,
      status: 'Aprovado'
    };
    onSalvarFerias(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFerias) return;

    const saved: RegistroFeriasColaborador = {
      id: editingFerias.id || `fer-${Date.now()}`,
      companyId: editingFerias.companyId || companyId,
      colaboradorId: editingFerias.colaboradorId || 'colab-001',
      colaboradorNome: editingFerias.colaboradorNome || 'Colaborador',
      cargo: editingFerias.cargo || 'Cargo',
      departamento: editingFerias.departamento || 'Geral',
      periodoAquisitivoInicio: editingFerias.periodoAquisitivoInicio || '2025-01-01',
      periodoAquisitivoFim: editingFerias.periodoAquisitivoFim || '2025-12-31',
      diasAdquiridos: 30,
      diasGozados: 0,
      diasSaldo: 30,
      dataInicioGozo: editingFerias.dataInicioGozo,
      dataFimGozo: editingFerias.dataFimGozo,
      status: editingFerias.status as any || 'Solicitado',
      valorUmTercoConstitucional: editingFerias.valorUmTercoConstitucional || 0,
      valorTotalLiquidoFerias: editingFerias.valorTotalLiquidoFerias || 0
    };

    onSalvarFerias(saved);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Umbrella className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-[#1E293B]">Gestão e Programação de Férias</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Controle de períodos aquisitivos, abono pecuniário, cálculo do 1/3 constitucional e mapa de ausências.
          </p>
        </div>

        <button
          onClick={() => handleOpenSolicitacao()}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Programar Férias</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por colaborador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#1E293B] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-[#1E293B] focus:outline-hidden"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Disponível">Disponível</option>
            <option value="Solicitado">Solicitado</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Em Gozo">Em Gozo</option>
          </select>
        </div>
      </div>

      {/* Cards of Vacation Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(f => (
          <div key={f.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-[#1E293B] text-sm">{f.colaboradorNome}</h3>
                <p className="text-xs text-slate-500">{f.cargo} • {f.departamento}</p>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                f.status === 'Aprovado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                f.status === 'Em Gozo' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                f.status === 'Solicitado' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {f.status}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex justify-between">
                <span>Período Aquisitivo:</span>
                <span className="font-medium text-[#1E293B]">{f.periodoAquisitivoInicio} a {f.periodoAquisitivoFim}</span>
              </div>

              <div className="flex justify-between">
                <span>Saldo de Dias:</span>
                <span className="font-bold text-amber-600">{f.diasSaldo} Dias</span>
              </div>

              {f.dataInicioGozo && (
                <div className="flex justify-between border-t border-slate-200/60 pt-1.5">
                  <span>Data do Gozo:</span>
                  <span className="font-bold text-[#2563EB]">{f.dataInicioGozo} até {f.dataFimGozo}</span>
                </div>
              )}

              {f.valorUmTercoConstitucional && (
                <div className="flex justify-between">
                  <span>1/3 Constitucional:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {f.valorUmTercoConstitucional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              )}
            </div>

            {f.status === 'Solicitado' && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleAprovar(f)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Aprovar Férias</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Schedule Vacation */}
      {isModalOpen && editingFerias && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-[#1E293B] text-sm">Programação de Férias</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Colaborador</label>
                <select
                  value={editingFerias.colaboradorId}
                  onChange={(e) => {
                    const found = colaboradores.find(c => c.id === e.target.value);
                    if (found) {
                      const salario = found.profissionais.salarioBase;
                      setEditingFerias({
                        ...editingFerias,
                        colaboradorId: found.id,
                        colaboradorNome: found.nomeCompleto,
                        cargo: found.profissionais.cargo,
                        departamento: found.profissionais.departamento,
                        valorUmTercoConstitucional: salario / 3,
                        valorTotalLiquidoFerias: salario + (salario / 3)
                      });
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                >
                  {colaboradores.map(c => (
                    <option key={c.id} value={c.id}>{c.nomeCompleto} ({c.profissionais.cargo})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Início das Férias</label>
                  <input
                    type="date"
                    required
                    value={editingFerias.dataInicioGozo || ''}
                    onChange={(e) => setEditingFerias({ ...editingFerias, dataInicioGozo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fim das Férias</label>
                  <input
                    type="date"
                    required
                    value={editingFerias.dataFimGozo || ''}
                    onChange={(e) => setEditingFerias({ ...editingFerias, dataFimGozo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-700">Previsão de Cálculo de Férias:</p>
                <p>1/3 Constitucional: <strong className="text-emerald-700 font-mono">{(editingFerias.valorUmTercoConstitucional || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></p>
                <p>Total Bruto Férias: <strong className="text-[#2563EB] font-mono">{(editingFerias.valorTotalLiquidoFerias || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2563EB] text-white font-bold rounded-xl cursor-pointer"
                >
                  Salvar e Solicitar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
