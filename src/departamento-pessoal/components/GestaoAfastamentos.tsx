import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  Filter, 
  Heart, 
  Baby, 
  Stethoscope, 
  FileCheck, 
  UserX, 
  X, 
  Building2,
  Trash2,
  Edit3
} from 'lucide-react';
import { ColaboradorCompleto } from '../types/dp';

export type TipoAfastamento = 
  | 'Atestado Médico'
  | 'INSS'
  | 'Licença Maternidade'
  | 'Licença Paternidade'
  | 'Acidente de Trabalho (CAT)'
  | 'Falta Justificada'
  | 'Falta Injustificada'
  | 'Outros Afastamentos';

export interface RegistroAfastamento {
  id: string;
  companyId: string;
  colaboradorId: string;
  colaboradorNome: string;
  cargo: string;
  departamento: string;
  tipo: TipoAfastamento;
  dataInicio: string;
  dataFim: string;
  diasAfastado: number;
  cidCode?: string;
  medicoCrm?: string;
  status: 'Em Análise' | 'Aprovado' | 'Encaminhado INSS' | 'Concluído' | 'Indeferido';
  observacoes?: string;
  retornoTrabalhoPrevisto?: string;
}

interface GestaoAfastamentosProps {
  colaboradores: ColaboradorCompleto[];
  companyId: string;
}

const INITIAL_AFASTAMENTOS: RegistroAfastamento[] = [
  {
    id: 'afast-001',
    companyId: 'emp-001',
    colaboradorId: 'colab-001',
    colaboradorNome: 'Carlos Eduardo Silva',
    cargo: 'Analista de Sistemas Senior',
    departamento: 'Tecnologia da Informação',
    tipo: 'Atestado Médico',
    dataInicio: '2026-07-20',
    dataFim: '2026-07-22',
    diasAfastado: 3,
    cidCode: 'J11 (Gripe/Influenza)',
    medicoCrm: 'CRM/SP 148920 - Dr. Roberto Alves',
    status: 'Aprovado',
    observacoes: 'Atestado médico de 3 dias por infecção viral leve.',
    retornoTrabalhoPrevisto: '2026-07-23'
  },
  {
    id: 'afast-002',
    companyId: 'emp-001',
    colaboradorId: 'colab-002',
    colaboradorNome: 'Mariana Costa Oliveira',
    cargo: 'Coordenadora de Recursos Humanos',
    departamento: 'Recursos Humanos',
    tipo: 'Licença Maternidade',
    dataInicio: '2026-06-01',
    dataFim: '2026-09-28',
    diasAfastado: 120,
    status: 'Aprovado',
    observacoes: 'Licença maternidade de 120 dias iniciada antes do parto.',
    retornoTrabalhoPrevisto: '2026-09-29'
  },
  {
    id: 'afast-003',
    companyId: 'emp-001',
    colaboradorId: 'colab-003',
    colaboradorNome: 'Lucas Mendes Prado',
    cargo: 'Gerente Comercial',
    departamento: 'Vendas',
    tipo: 'INSS',
    dataInicio: '2026-05-10',
    dataFim: '2026-08-10',
    diasAfastado: 92,
    cidCode: 'M54.5 (Lumbago com ciática)',
    medicoCrm: 'CRM/SP 98210 - Dra. Patricia Lima',
    status: 'Encaminhado INSS',
    observacoes: 'Afastamento previdenciário temporário com perícia realizada.',
    retornoTrabalhoPrevisto: '2026-08-11'
  }
];

export const GestaoAfastamentos: React.FC<GestaoAfastamentosProps> = ({
  colaboradores,
  companyId
}) => {
  const [afastamentos, setAfastamentos] = useState<RegistroAfastamento[]>(() => {
    const saved = localStorage.getItem(`MAIS_RH_AFASTAMENTOS_${companyId}`);
    return saved ? JSON.parse(saved) : INITIAL_AFASTAMENTOS;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<RegistroAfastamento> | null>(null);

  useEffect(() => {
    localStorage.setItem(`MAIS_RH_AFASTAMENTOS_${companyId}`, JSON.stringify(afastamentos));
  }, [afastamentos, companyId]);

  const handleOpenNew = () => {
    const firstColab = colaboradores[0];
    const today = new Date().toISOString().split('T')[0];
    setEditingItem({
      companyId,
      colaboradorId: firstColab?.id || '',
      colaboradorNome: firstColab?.nomeCompleto || '',
      cargo: firstColab?.profissionais.cargo || '',
      departamento: firstColab?.profissionais.departamento || '',
      tipo: 'Atestado Médico',
      dataInicio: today,
      dataFim: today,
      diasAfastado: 1,
      status: 'Aprovado',
      cidCode: '',
      medicoCrm: '',
      observacoes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: RegistroAfastamento) => {
    setEditingItem({ ...item });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este registro de afastamento?')) {
      setAfastamentos(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.colaboradorId) return;

    const colab = colaboradores.find(c => c.id === editingItem.colaboradorId);
    const inicio = new Date(editingItem.dataInicio || new Date());
    const fim = new Date(editingItem.dataFim || new Date());
    const diffTime = Math.max(1, Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const saved: RegistroAfastamento = {
      id: editingItem.id || `afast-${Date.now()}`,
      companyId: editingItem.companyId || companyId,
      colaboradorId: editingItem.colaboradorId,
      colaboradorNome: colab?.nomeCompleto || editingItem.colaboradorNome || 'Colaborador',
      cargo: colab?.profissionais.cargo || editingItem.cargo || 'Cargo',
      departamento: colab?.profissionais.departamento || editingItem.departamento || 'Geral',
      tipo: editingItem.tipo as TipoAfastamento || 'Atestado Médico',
      dataInicio: editingItem.dataInicio || new Date().toISOString().split('T')[0],
      dataFim: editingItem.dataFim || new Date().toISOString().split('T')[0],
      diasAfastado: diffTime,
      cidCode: editingItem.cidCode || '',
      medicoCrm: editingItem.medicoCrm || '',
      status: editingItem.status || 'Aprovado',
      observacoes: editingItem.observacoes || '',
      retornoTrabalhoPrevisto: editingItem.dataFim
    };

    setAfastamentos(prev => {
      const exists = prev.some(a => a.id === saved.id);
      if (exists) return prev.map(a => a.id === saved.id ? saved : a);
      return [saved, ...prev];
    });

    setIsModalOpen(false);
  };

  const filteredAfastamentos = afastamentos.filter(a => {
    const matchesSearch = a.colaboradorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedFilterCategory === 'Todos' || a.tipo === selectedFilterCategory;
    return matchesSearch && matchesCat;
  });

  // KPIs
  const totalAfastados = afastamentos.filter(a => a.status === 'Aprovado' || a.status === 'Encaminhado INSS').length;
  const totalInss = afastamentos.filter(a => a.tipo === 'INSS').length;
  const totalLicencas = afastamentos.filter(a => a.tipo.includes('Licença')).length;
  const totalAtestados = afastamentos.filter(a => a.tipo === 'Atestado Médico').length;

  const categoryOptions: TipoAfastamento[] = [
    'Atestado Médico',
    'INSS',
    'Licença Maternidade',
    'Licença Paternidade',
    'Acidente de Trabalho (CAT)',
    'Falta Justificada',
    'Falta Injustificada',
    'Outros Afastamentos'
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-[#1E293B]">Gestão de Afastamentos & Licenças</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Controle consolidado de atestados médicos, licenças previdenciárias INSS, CAT e ausências justificadas.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar Afastamento</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">Afastamentos Ativos</span>
            <div className="text-2xl font-black text-[#1E293B] mt-0.5">{totalAfastados}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Atualmente ausentes</p>
          </div>
          <span className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <UserX className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">Atestados no Mês</span>
            <div className="text-2xl font-black text-blue-600 mt-0.5">{totalAtestados}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Comprovantes anexados</p>
          </div>
          <span className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Stethoscope className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">Licenças Maternidade/Paternidade</span>
            <div className="text-2xl font-black text-purple-600 mt-0.5">{totalLicencas}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Em andamento</p>
          </div>
          <span className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Baby className="w-5 h-5" />
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">Casos INSS / Perícia</span>
            <div className="text-2xl font-black text-rose-600 mt-0.5">{totalInss}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Acima de 15 dias</p>
          </div>
          <span className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Building2 className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por colaborador ou tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#1E293B] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedFilterCategory('Todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedFilterCategory === 'Todos' ? 'bg-[#2563EB] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos
          </button>
          {categoryOptions.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedFilterCategory === cat ? 'bg-[#2563EB] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Afastamentos Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-[#1E293B] text-sm">Registros de Afastamento Registrados</h3>
          <span className="text-xs text-slate-500">Histórico de Ausências Trabalhistas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <th className="p-3.5">Colaborador</th>
                <th className="p-3.5">Tipo de Afastamento</th>
                <th className="p-3.5">Período / Duração</th>
                <th className="p-3.5">CID / Médico</th>
                <th className="p-3.5">Retorno Previsto</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[#1E293B]">
              {filteredAfastamentos.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <p className="font-bold text-[#1E293B]">{item.colaboradorNome}</p>
                    <p className="text-[11px] text-slate-500">{item.cargo} • {item.departamento}</p>
                  </td>

                  <td className="p-3.5">
                    <span className="font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {item.tipo}
                    </span>
                  </td>

                  <td className="p-3.5 font-medium">
                    <p>{item.dataInicio} até {item.dataFim}</p>
                    <p className="text-[11px] font-bold text-amber-600">{item.diasAfastado} {item.diasAfastado === 1 ? 'dia' : 'dias'}</p>
                  </td>

                  <td className="p-3.5 text-slate-600">
                    <p className="font-bold text-slate-800">{item.cidCode || 'N/A'}</p>
                    <p className="text-[10px] text-slate-400">{item.medicoCrm || 'Sem CRM'}</p>
                  </td>

                  <td className="p-3.5 font-bold text-[#2563EB]">
                    {item.retornoTrabalhoPrevisto || item.dataFim}
                  </td>

                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'Aprovado' || item.status === 'Concluído'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.status === 'Encaminhado INSS'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>

                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg cursor-pointer"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredAfastamentos.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    Nenhum registro de afastamento encontrado para este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Afastamento */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-[#1E293B] text-sm">
                {editingItem.id ? 'Editar Afastamento' : 'Lançar Novo Afastamento / Atestado'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Colaborador *</label>
                <select
                  required
                  value={editingItem.colaboradorId || ''}
                  onChange={(e) => {
                    const found = colaboradores.find(c => c.id === e.target.value);
                    setEditingItem({
                      ...editingItem,
                      colaboradorId: e.target.value,
                      colaboradorNome: found?.nomeCompleto || '',
                      cargo: found?.profissionais.cargo || '',
                      departamento: found?.profissionais.departamento || ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                >
                  <option value="">Selecione um colaborador...</option>
                  {colaboradores.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nomeCompleto} — {c.profissionais.cargo} ({c.profissionais.departamento})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Afastamento *</label>
                  <select
                    value={editingItem.tipo || 'Atestado Médico'}
                    onChange={(e) => setEditingItem({ ...editingItem, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status do Registro</label>
                  <select
                    value={editingItem.status || 'Aprovado'}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="Aprovado">🟢 Aprovado</option>
                    <option value="Em Análise">🟡 Em Análise</option>
                    <option value="Encaminhado INSS">🔴 Encaminhado INSS (&gt;15 dias)</option>
                    <option value="Concluído">⚪ Concluído / Retornou</option>
                    <option value="Indeferido">❌ Indeferido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data Início *</label>
                  <input
                    type="date"
                    required
                    value={editingItem.dataInicio || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, dataInicio: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data Fim *</label>
                  <input
                    type="date"
                    required
                    value={editingItem.dataFim || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, dataFim: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Código CID (Opcional)</label>
                  <input
                    type="text"
                    placeholder="ex: J11 ou M54.5"
                    value={editingItem.cidCode || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, cidCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Médico / CRM (Opcional)</label>
                  <input
                    type="text"
                    placeholder="CRM/SP 00000 - Nome"
                    value={editingItem.medicoCrm || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, medicoCrm: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações / Justificativa</label>
                <textarea
                  rows={2}
                  placeholder="Detalhes adicionais sobre o afastamento ou atestado..."
                  value={editingItem.observacoes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, observacoes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Salvar Afastamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
