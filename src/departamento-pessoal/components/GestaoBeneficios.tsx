import React, { useState } from 'react';
import { 
  Gift, 
  Plus, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Building2, 
  CreditCard, 
  Edit3, 
  Trash2, 
  Percent, 
  HeartHandshake, 
  ShieldCheck, 
  X 
} from 'lucide-react';
import { ItemBeneficio, ColaboradorCompleto } from '../types/dp';

interface GestaoBeneficiosProps {
  beneficios: ItemBeneficio[];
  colaboradores: ColaboradorCompleto[];
  onSalvarBeneficio: (beneficio: ItemBeneficio) => void;
  companyId: string;
}

export const GestaoBeneficios: React.FC<GestaoBeneficiosProps> = ({
  beneficios,
  colaboradores,
  onSalvarBeneficio,
  companyId
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBen, setEditingBen] = useState<Partial<ItemBeneficio> | null>(null);

  const handleOpenNew = () => {
    setEditingBen({
      companyId,
      nome: '',
      categoria: 'Vale Refeição',
      tipoCalculo: 'Valor Fixo',
      valorBeneficio: 800.00,
      percentualDescontoFuncionario: 0,
      custoEmpresaEstimado: 800.00,
      ativo: true,
      fornecedor: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ben: ItemBeneficio) => {
    setEditingBen({ ...ben });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBen || !editingBen.nome) return;

    const saved: ItemBeneficio = {
      id: editingBen.id || `ben-${Date.now()}`,
      companyId: editingBen.companyId || companyId,
      nome: editingBen.nome,
      categoria: editingBen.categoria as any || 'Outros',
      tipoCalculo: editingBen.tipoCalculo as any || 'Valor Fixo',
      valorBeneficio: Number(editingBen.valorBeneficio) || 0,
      percentualDescontoFuncionario: Number(editingBen.percentualDescontoFuncionario) || 0,
      custoEmpresaEstimado: Number(editingBen.custoEmpresaEstimado) || 0,
      ativo: editingBen.ativo ?? true,
      fornecedor: editingBen.fornecedor || ''
    };

    onSalvarBeneficio(saved);
    setIsModalOpen(false);
  };

  // Calculations for KPI Cards
  const totalBeneficiosContratados = beneficios.length;
  const custoTotalEmpresaMensal = beneficios.reduce((acc, b) => acc + (b.custoEmpresaEstimado * colaboradores.length), 0);

  return (
    <div className="space-y-6">
      {/* Header & KPIs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Gift className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-[#1E293B]">Gestão de Benefícios Corporativos</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure VT, VR, VA, planos de saúde e coparticipações com integração direta na folha.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Benefício</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Benefícios Ativos</span>
          <div className="text-2xl font-black text-[#1E293B] mt-1">{totalBeneficiosContratados} Categorias</div>
          <p className="text-[11px] text-slate-400 mt-1">Disponíveis para os colaboradores</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Custo Médio p/ Funcionário</span>
          <div className="text-2xl font-black text-purple-600 mt-1">
            {(custoTotalEmpresaMensal / (colaboradores.length || 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Investimento médio em benefícios</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Investimento Total Folha</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {custoTotalEmpresaMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Previsão mensal da empresa</p>
        </div>
      </div>

      {/* Benefits Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-[#1E293B] text-sm">Catálogo de Benefícios Oferecidos</h3>
          <span className="text-xs text-slate-500">Módulo de Atração e Retenção DP</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="p-3.5">Nome do Benefício</th>
                <th className="p-3.5">Categoria</th>
                <th className="p-3.5">Valor do Benefício</th>
                <th className="p-3.5">Desconto Func. (%)</th>
                <th className="p-3.5">Custo Empresa/Func.</th>
                <th className="p-3.5">Fornecedor</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1E293B]">
              {beneficios.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    {b.nome}
                  </td>
                  <td className="p-3.5 text-slate-600 font-medium">{b.categoria}</td>
                  <td className="p-3.5 font-mono font-bold">
                    {b.valorBeneficio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="p-3.5 text-slate-600 font-medium">
                    {b.percentualDescontoFuncionario > 0 ? `${b.percentualDescontoFuncionario}% em folha` : 'Isento (100% Empresa)'}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-emerald-700">
                    {b.custoEmpresaEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="p-3.5 text-slate-500">{b.fornecedor || 'Interno'}</td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit Benefit */}
      {isModalOpen && editingBen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-[#1E293B] text-sm">
                {editingBen.id ? 'Editar Benefício' : 'Novo Benefício Corporativo'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome do Benefício *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Vale Refeição Ticket"
                  value={editingBen.nome || ''}
                  onChange={(e) => setEditingBen({ ...editingBen, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Categoria</label>
                  <select
                    value={editingBen.categoria || 'Vale Refeição'}
                    onChange={(e) => setEditingBen({ ...editingBen, categoria: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="Vale Transporte">Vale Transporte</option>
                    <option value="Vale Refeição">Vale Refeição</option>
                    <option value="Vale Alimentação">Vale Alimentação</option>
                    <option value="Plano de Saúde">Plano de Saúde</option>
                    <option value="Plano Odontológico">Plano Odontológico</option>
                    <option value="Seguro de Vida">Seguro de Vida</option>
                    <option value="Auxílio Creche">Auxílio Creche</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valor Total Benefício (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingBen.valorBeneficio || 0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const pct = editingBen.percentualDescontoFuncionario || 0;
                      const custoEmp = val - (val * (pct / 100));
                      setEditingBen({ ...editingBen, valorBeneficio: val, custoEmpresaEstimado: custoEmp });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Desconto Colaborador (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingBen.percentualDescontoFuncionario || 0}
                    onChange={(e) => {
                      const pct = parseFloat(e.target.value) || 0;
                      const val = editingBen.valorBeneficio || 0;
                      const custoEmp = val - (val * (pct / 100));
                      setEditingBen({ ...editingBen, percentualDescontoFuncionario: pct, custoEmpresaEstimado: custoEmp });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Custo Empresa Resultante</label>
                  <input
                    type="number"
                    disabled
                    value={editingBen.custoEmpresaEstimado || 0}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fornecedor / Operadora</label>
                <input
                  type="text"
                  placeholder="ex: Bradesco Saúde / Ticket"
                  value={editingBen.fornecedor || ''}
                  onChange={(e) => setEditingBen({ ...editingBen, fornecedor: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
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
                  Salvar Benefício
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
