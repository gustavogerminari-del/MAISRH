import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Briefcase, 
  Building2, 
  DollarSign, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Edit3, 
  Trash2, 
  Eye, 
  X, 
  Download,
  AlertCircle,
  Plus
} from 'lucide-react';
import { ColaboradorCompleto } from '../types/dp';

interface CadastroColaboradoresProps {
  colaboradores: ColaboradorCompleto[];
  onSalvarColaborador: (colab: ColaboradorCompleto) => void;
  onExcluirColaborador?: (id: string) => void;
  companyId: string;
}

export const CadastroColaboradores: React.FC<CadastroColaboradoresProps> = ({
  colaboradores,
  onSalvarColaborador,
  onExcluirColaborador,
  companyId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedColaborador, setSelectedColaborador] = useState<ColaboradorCompleto | null>(null);
  
  // Modal de Adição / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColab, setEditingColab] = useState<Partial<ColaboradorCompleto> | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'pessoais' | 'profissionais' | 'trabalhistas'>('pessoais');

  // Modal de Detalhes / Perfil
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<'dados' | 'documentos' | 'ponto' | 'folhas'>('dados');

  const filtered = colaboradores.filter(c => {
    const matchesSearch = 
      c.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.pessoais.cpf.includes(searchTerm) ||
      c.profissionais.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'Todos' || c.profissionais.departamento === selectedDept;
    const matchesStatus = selectedStatus === 'Todos' || c.profissionais.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const departments = Array.from(new Set(colaboradores.map(c => c.profissionais.departamento)));

  const handleOpenNew = () => {
    setEditingColab({
      companyId,
      nomeCompleto: '',
      pessoais: {
        cpf: '',
        rg: '',
        dataNascimento: '1995-01-01',
        estadoCivil: 'Solteiro(a)',
        telefone: '',
        emailPessoal: '',
        endereco: { logradouro: '', numero: '', bairro: '', cidade: 'São Paulo', estado: 'SP', cep: '' }
      },
      profissionais: {
        cargo: 'Analista de RH',
        departamento: 'Recursos Humanos',
        centroCusto: 'CC-101',
        dataAdmissao: new Date().toISOString().split('T')[0],
        salarioBase: 4500.00,
        jornadaSemanalHours: 44,
        escalaTrabalho: '5x2 (08:00 às 18:00)',
        gestorResponsavel: 'Luciana Mello',
        status: 'Ativo',
        emailCorporativo: ''
      },
      trabalhistas: {
        pisPasep: '',
        ctpsNumero: '',
        ctpsSerie: '001-SP',
        ctpsUf: 'SP',
        dependentesCount: 0,
        sindicato: 'Sindicato Geral',
        tipoContrato: 'CLT',
        bancoAgenciaConta: 'Banco Itaú | Ag 0001 | C/C 12345-6',
        optanteValeTransporte: true
      },
      beneficiosAtivos: ['ben-vt-01', 'ben-vr-01']
    });
    setActiveFormTab('pessoais');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (colab: ColaboradorCompleto) => {
    setEditingColab(JSON.parse(JSON.stringify(colab)));
    setActiveFormTab('pessoais');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingColab || !editingColab.nomeCompleto) return;

    const saved: ColaboradorCompleto = {
      id: editingColab.id || `colab-${Date.now()}`,
      companyId: editingColab.companyId || companyId,
      nomeCompleto: editingColab.nomeCompleto,
      fotoUrl: editingColab.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      pessoais: editingColab.pessoais as any,
      profissionais: editingColab.profissionais as any,
      trabalhistas: editingColab.trabalhistas as any,
      beneficiosAtivos: editingColab.beneficiosAtivos || [],
      createdAt: editingColab.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSalvarColaborador(saved);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-[#2563EB]">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-[#1E293B]">Gestão de Colaboradores</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cadastro profissional centralizado, dados trabalhistas, contratos e acompanhamento individual.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Colaborador</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#1E293B] focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-[#1E293B] focus:outline-hidden"
          >
            <option value="Todos">Todos Departamentos</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-[#1E293B] focus:outline-hidden"
          >
            <option value="Todos">Todos Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Férias">Férias</option>
            <option value="Afastado">Afastado</option>
            <option value="Rescindido">Rescindido</option>
          </select>
        </div>
      </div>

      {/* Grid of Employees */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div 
            key={c.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={c.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={c.nomeCompleto}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-[#1E293B] text-sm leading-tight">{c.nomeCompleto}</h3>
                    <p className="text-xs font-medium text-[#2563EB] mt-0.5">{c.profissionais.cargo}</p>
                    <p className="text-[11px] text-slate-500">{c.profissionais.departamento}</p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  c.profissionais.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  c.profissionais.status === 'Férias' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {c.profissionais.status}
                </span>
              </div>

              <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    CPF:
                  </span>
                  <span className="font-mono font-medium text-[#1E293B]">{c.pessoais.cpf}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Admissão:
                  </span>
                  <span className="font-medium text-[#1E293B]">{c.profissionais.dataAdmissao}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    Salário Base:
                  </span>
                  <span className="font-bold text-slate-900">
                    {c.profissionais.salarioBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    Contrato:
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-[#2563EB] font-bold text-[10px]">
                    {c.trabalhistas.tipoContrato}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setSelectedColaborador(c);
                  setIsProfileOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-200"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Perfil Completo</span>
              </button>

              <button
                onClick={() => handleOpenEdit(c)}
                className="p-2 text-slate-500 hover:text-[#2563EB] hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                title="Editar Colaborador"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Colaborador */}
      {isModalOpen && editingColab && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#1E293B]">
                  {editingColab.id ? 'Editar Colaborador' : 'Novo Colaborador'}
                </h3>
                <p className="text-xs text-slate-500">Preencha as informações completas para o eSocial e DP.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200">
              <button
                onClick={() => setActiveFormTab('pessoais')}
                className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  activeFormTab === 'pessoais' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500'
                }`}
              >
                1. Dados Pessoais
              </button>
              <button
                onClick={() => setActiveFormTab('profissionais')}
                className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  activeFormTab === 'profissionais' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500'
                }`}
              >
                2. Dados Profissionais
              </button>
              <button
                onClick={() => setActiveFormTab('trabalhistas')}
                className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  activeFormTab === 'trabalhistas' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500'
                }`}
              >
                3. Dados Trabalhistas & Banco
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {activeFormTab === 'pessoais' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={editingColab.nomeCompleto || ''}
                      onChange={(e) => setEditingColab({ ...editingColab, nomeCompleto: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CPF *</label>
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={editingColab.pessoais?.cpf || ''}
                      onChange={(e) => setEditingColab({
                        ...editingColab,
                        pessoais: { ...editingColab.pessoais!, cpf: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">RG & Órgão Emissor</label>
                    <input
                      type="text"
                      value={editingColab.pessoais?.rg || ''}
                      onChange={(e) => setEditingColab({
                        ...editingColab,
                        pessoais: { ...editingColab.pessoais!, rg: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Data de Nascimento</label>
                    <input
                      type="date"
                      value={editingColab.pessoais?.dataNascimento || ''}
                      onChange={(e) => setEditingColab({
                        ...editingColab,
                        pessoais: { ...editingColab.pessoais!, dataNascimento: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      placeholder="(11) 99999-9999"
                      value={editingColab.pessoais?.telefone || ''}
                      onChange={(e) => setEditingColab({
                        ...editingColab,
                        pessoais: { ...editingColab.pessoais!, telefone: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">E-mail Pessoal</label>
                    <input
                      type="email"
                      value={editingColab.pessoais?.emailPessoal || ''}
                      onChange={(e) => setEditingColab({
                        ...editingColab,
                        pessoais: { ...editingColab.pessoais!, emailPessoal: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {activeFormTab === 'profissionais' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Cargo *</label>
                    <input
                      type="text"
                      required
                      value={editingColab.profissionais?.cargo || ''}
                      onChange={(e) => setEditingColab({
                        ...editingColab,
                        profissionais: { ...editingColab.profissionais!, cargo: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Departamento</label>
                    <input
                      type="text"
                      value={editingColab.profissionais?.departamento || ''}
                      onChange={(e) => setEditingColab({
                        ...editingColab,
                        profissionais: { ...editingColab.profissionais!, departamento: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Salário Base (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingColab.profissionais?.salarioBase || 0}
                      onChange={(e) => setEditingColab({
                        ...editingColab,
                        profissionais: { ...editingColab.profissionais!, salarioBase: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Data de Admissão</label>
                    <input
                      type="date"
                      value={editingColab.profissionais?.dataAdmissao || ''}
                      onChange={(e) => setEditingColab({
                        ...editingColab,
                        profissionais: { ...editingColab.profissionais!, dataAdmissao: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gestor Responsável</label>
                    <input
                      type="text"
                      value={editingColab.profissionais?.gestorResponsavel || ''}
                      onChange={(e) => setEditingColab({
                        ...editingColab,
                        profissionais: { ...editingColab.profissionais!, gestorResponsavel: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">E-mail Corporativo</label>
                    <input
                      type="email"
                      value={editingColab.profissionais?.emailCorporativo || ''}
                      onChange={(e) => setEditingColab({
                        ...editingColab,
                        profissionais: { ...editingColab.profissionais!, emailCorporativo: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {activeFormTab === 'trabalhistas' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">PIS / PASEP</label>
                    <input
                      type="text"
                      placeholder="000.00000.00-0"
                      value={editingColab.trabalhistas?.pisPasep || ''}
                      onChange={(e) => setEditingColab({
                        ...editingColab,
                        trabalhistas: { ...editingColab.trabalhistas!, pisPasep: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">CTPS Número / Série</label>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Número"
                        value={editingColab.trabalhistas?.ctpsNumero || ''}
                        onChange={(e) => setEditingColab({
                          ...editingColab,
                          trabalhistas: { ...editingColab.trabalhistas!, ctpsNumero: e.target.value }
                        })}
                        className="w-1/2 px-3 py-2 border border-slate-200 rounded-xl"
                      />
                      <input
                        type="text"
                        placeholder="Série"
                        value={editingColab.trabalhistas?.ctpsSerie || ''}
                        onChange={(e) => setEditingColab({
                          ...editingColab,
                          trabalhistas: { ...editingColab.trabalhistas!, ctpsSerie: e.target.value }
                        })}
                        className="w-1/2 px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tipo de Contrato</label>
                    <select
                      value={editingColab.trabalhistas?.tipoContrato || 'CLT'}
                      onChange={(e) => setEditingColab({
                        ...editingColab,
                        trabalhistas: { ...editingColab.trabalhistas!, tipoContrato: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    >
                      <option value="CLT">CLT (Consolidação das Leis do Trabalho)</option>
                      <option value="PJ">PJ (Prestador de Serviços)</option>
                      <option value="Estágio">Estágio Remunerado</option>
                      <option value="Aprendiz">Jovem Aprendiz</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Número de Dependentes (IRRF)</label>
                    <input
                      type="number"
                      value={editingColab.trabalhistas?.dependentesCount || 0}
                      onChange={(e) => setEditingColab({
                        ...editingColab,
                        trabalhistas: { ...editingColab.trabalhistas!, dependentesCount: parseInt(e.target.value) || 0 }
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Dados Bancários para Salário</label>
                    <input
                      type="text"
                      placeholder="Banco | Agência | Conta"
                      value={editingColab.trabalhistas?.bancoAgenciaConta || ''}
                      onChange={(e) => setEditingColab({
                        ...editingColab,
                        trabalhistas: { ...editingColab.trabalhistas!, bancoAgenciaConta: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Salvar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Profile Viewer */}
      {isProfileOpen && selectedColaborador && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedColaborador.fotoUrl}
                  alt={selectedColaborador.nomeCompleto}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#2563EB]"
                />
                <div>
                  <h3 className="text-lg font-bold text-[#1E293B]">{selectedColaborador.nomeCompleto}</h3>
                  <p className="text-xs font-medium text-[#2563EB]">{selectedColaborador.profissionais.cargo}</p>
                  <p className="text-xs text-slate-500">{selectedColaborador.profissionais.departamento} • Contrato {selectedColaborador.trabalhistas.tipoContrato}</p>
                </div>
              </div>

              <button 
                onClick={() => setIsProfileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Grid Detail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs border-b border-slate-200 pb-1">Dados Trabalhistas</h4>
                <p><strong>CPF:</strong> {selectedColaborador.pessoais.cpf}</p>
                <p><strong>PIS/PASEP:</strong> {selectedColaborador.trabalhistas.pisPasep || 'Não informado'}</p>
                <p><strong>CTPS:</strong> {selectedColaborador.trabalhistas.ctpsNumero} / Série {selectedColaborador.trabalhistas.ctpsSerie}</p>
                <p><strong>Dependentes:</strong> {selectedColaborador.trabalhistas.dependentesCount}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs border-b border-slate-200 pb-1">Contrato & Salário</h4>
                <p><strong>Salário Base:</strong> {selectedColaborador.profissionais.salarioBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                <p><strong>Admissão:</strong> {selectedColaborador.profissionais.dataAdmissao}</p>
                <p><strong>Escala:</strong> {selectedColaborador.profissionais.escalaTrabalho}</p>
                <p><strong>Gestor:</strong> {selectedColaborador.profissionais.gestorResponsavel}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsProfileOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
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
