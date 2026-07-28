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
  Eye, 
  EyeOff,
  Copy,
  X, 
  Download,
  AlertCircle,
  Plus,
  Key,
  Lock,
  Unlock,
  ShieldAlert,
  Send,
  History,
  Gift,
  Umbrella,
  FileCheck,
  UserCheck,
  UserX,
  RefreshCw,
  Award,
  TrendingUp,
  FileSpreadsheet,
  FileEdit,
  Save
} from 'lucide-react';
import { ColaboradorCompleto, HistoricoOcorrenciaColaborador } from '../types/dp';
import { useAuth } from '../../auth';

interface CadastroColaboradoresProps {
  colaboradores: ColaboradorCompleto[];
  onSalvarColaborador: (colab: ColaboradorCompleto) => void;
  onExcluirColaborador?: (id: string) => void;
  companyId: string;
}

export const CadastroColaboradores: React.FC<CadastroColaboradoresProps> = ({
  colaboradores,
  onSalvarColaborador,
  companyId
}) => {
  const { user } = useAuth();
  const userType = user?.tipoUsuario || (user?.role === 'Super Administrador' ? 'MASTER' : 'EMPRESA');
  const userCompanyId = user?.companyId || user?.empresaId || user?.tenantId || companyId;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedColaborador, setSelectedColaborador] = useState<ColaboradorCompleto | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Modal de Adição / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColab, setEditingColab] = useState<Partial<ColaboradorCompleto> | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'pessoais' | 'profissionais' | 'jornada' | 'trabalhistas' | 'acesso'>('pessoais');

  // Modal de Detalhes / Perfil Completo
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<'pessoais' | 'contratuais' | 'jornada' | 'beneficios' | 'ferias' | 'documentos' | 'historico' | 'anotacoes'>('pessoais');
  const [notesInput, setNotesInput] = useState('');

  // State para Acesso no Perfil e Modal
  const [showPasswordInForm, setShowPasswordInForm] = useState(false);
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [newOcorrenciaDesc, setNewOcorrenciaDesc] = useState('');
  const [newOcorrenciaTipo, setNewOcorrenciaTipo] = useState<HistoricoOcorrenciaColaborador['tipo']>('Promoção');

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const filtered = colaboradores.filter(c => {
    // Multi-tenant Security: Empresa A never sees Empresa B
    const matchesCompany = userType === 'MASTER' || !c.companyId || c.companyId === userCompanyId;
    
    // Role Security: Colaborador profile only views their own record
    if (userType === 'FUNCIONARIO') {
      const isSelf = c.pessoais?.emailPessoal === user?.email || 
                     c.profissionais?.emailCorporativo === user?.email || 
                     c.acessoColaborador?.loginUsername === user?.email;
      if (!isSelf) return false;
    }

    const matchesSearch = 
      c.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.pessoais.cpf.includes(searchTerm) ||
      c.profissionais.cargo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'Todos' || c.profissionais.departamento === selectedDept;
    const matchesStatus = selectedStatus === 'Todos' || c.profissionais.status === selectedStatus;
    return matchesCompany && matchesSearch && matchesDept && matchesStatus;
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
        genero: 'Não Informado',
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
        escalaTrabalho: '5x2 (Segunda a Sexta 08:00 - 18:00)',
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
        sindicato: 'Sindicato Geral dos Trabalhadores',
        tipoContrato: 'CLT',
        bancoAgenciaConta: 'Banco Itaú | Ag 0001 | C/C 12345-6',
        optanteValeTransporte: true
      },
      beneficiosAtivos: ['ben-vt-01', 'ben-vr-01'],
      acessoColaborador: {
        loginUsername: '',
        senhaProvisoria: 'MaisRH@2026',
        statusAcesso: 'Ativo',
        senhaCriada: true
      },
      historico: [
        {
          id: `hist-${Date.now()}`,
          data: new Date().toISOString().split('T')[0],
          tipo: 'Admissão',
          descricao: 'Cadastro de colaborador criado no sistema MAIS RH.',
          responsavel: 'Equipe de RH'
        }
      ]
    });
    setShowPasswordInForm(false);
    setActiveFormTab('pessoais');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (colab: ColaboradorCompleto) => {
    setEditingColab(JSON.parse(JSON.stringify(colab)));
    setShowPasswordInForm(false);
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
      acessoColaborador: editingColab.acessoColaborador || {
        loginUsername: editingColab.profissionais?.emailCorporativo || `${editingColab.nomeCompleto.toLowerCase().replace(/\s+/g, '.')}@maisrh.com.br`,
        statusAcesso: 'Ativo',
        senhaCriada: true
      },
      historico: editingColab.historico || [],
      createdAt: editingColab.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSalvarColaborador(saved);
    setIsModalOpen(false);
    showNotification(`Colaborador ${saved.nomeCompleto} salvo com sucesso!`);
  };

  // Funções de Gestão de Acesso do Colaborador
  const handleToggleStatusAcesso = (colab: ColaboradorCompleto) => {
    const currentStatus = colab.acessoColaborador?.statusAcesso || 'Pendente';
    const newStatus = currentStatus === 'Ativo' ? 'Bloqueado' : 'Ativo';
    
    const updated: ColaboradorCompleto = {
      ...colab,
      acessoColaborador: {
        ...(colab.acessoColaborador || { loginUsername: colab.profissionais.emailCorporativo, senhaCriada: true }),
        statusAcesso: newStatus
      }
    };

    onSalvarColaborador(updated);
    setSelectedColaborador(updated);
    showNotification(`Acesso de ${colab.nomeCompleto} alterado para: ${newStatus.toUpperCase()}`);
  };

  const handleRedefinirSenha = (colab: ColaboradorCompleto) => {
    if (!tempPassword) {
      showNotification('Por favor, informe uma senha provisória.');
      return;
    }

    const updated: ColaboradorCompleto = {
      ...colab,
      acessoColaborador: {
        ...(colab.acessoColaborador || { loginUsername: colab.profissionais.emailCorporativo, statusAcesso: 'Ativo' }),
        senhaProvisoria: tempPassword,
        statusAcesso: 'Ativo',
        senhaCriada: true
      }
    };

    onSalvarColaborador(updated);
    setSelectedColaborador(updated);
    setTempPassword('');
    showNotification(`Nova senha atribuída a ${colab.nomeCompleto}. Login liberado!`);
  };

  const handleEnviarRecuperacaoSenha = (colab: ColaboradorCompleto) => {
    showNotification(`E-mail com link de redefinição de senha enviado para ${colab.profissionais.emailCorporativo || colab.pessoais.emailPessoal}!`);
  };

  const handleAdicionarOcorrencia = () => {
    if (!selectedColaborador || !newOcorrenciaDesc) return;

    const novaOcorrencia: HistoricoOcorrenciaColaborador = {
      id: `hist-${Date.now()}`,
      data: new Date().toISOString().split('T')[0],
      tipo: newOcorrenciaTipo,
      descricao: newOcorrenciaDesc,
      responsavel: 'Gestor de RH'
    };

    const updated: ColaboradorCompleto = {
      ...selectedColaborador,
      historico: [novaOcorrencia, ...(selectedColaborador.historico || [])]
    };

    onSalvarColaborador(updated);
    setSelectedColaborador(updated);
    setNewOcorrenciaDesc('');
    showNotification(`Nova ocorrência (${newOcorrenciaTipo}) registrada no histórico!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed top-5 right-5 z-50 bg-[#1E293B] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-medium">{notificationMsg}</span>
        </div>
      )}

      {/* Top Banner & Stats */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-[#2563EB]">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-[#1E293B]">👥 Cadastro & Gestão de Colaboradores</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Hierarquia completa: Dados Pessoais, Profissionais, Cargo, Jornada, Documentos, Benefícios, Ponto, Folha, Férias, Histórico e Portal do Colaborador.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
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
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
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
                    <Key className="w-3.5 h-3.5 text-slate-400" />
                    Portal Colaborador:
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    c.acessoColaborador?.statusAcesso === 'Ativo' ? 'bg-emerald-50 text-emerald-700' :
                    c.acessoColaborador?.statusAcesso === 'Bloqueado' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {c.acessoColaborador?.statusAcesso || 'Pendente'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setSelectedColaborador(c);
                  setProfileTab('dados');
                  setIsProfileOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-200"
              >
                <Eye className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Perfil Completo</span>
              </button>

              <button
                onClick={() => handleOpenEdit(c)}
                className="p-2 text-slate-500 hover:text-[#2563EB] hover:bg-blue-50 rounded-xl transition-all cursor-pointer border border-slate-200"
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
                <p className="text-xs text-slate-500">Preencha as informações completas para eSocial, Ponto e Folha.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setActiveFormTab('pessoais')}
                className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
                  activeFormTab === 'pessoais' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500'
                }`}
              >
                1. Dados Pessoais
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('profissionais')}
                className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
                  activeFormTab === 'profissionais' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500'
                }`}
              >
                2. Profissionais & Cargo
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('jornada')}
                className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
                  activeFormTab === 'jornada' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500'
                }`}
              >
                3. Jornada de Trabalho
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('trabalhistas')}
                className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
                  activeFormTab === 'trabalhistas' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500'
                }`}
              >
                4. Trabalhistas & Banco
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('acesso')}
                className={`pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
                  activeFormTab === 'acesso' ? 'border-[#2563EB] text-[#2563EB]' : 'border-transparent text-slate-500'
                }`}
              >
                5. Acesso ao Portal
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
                    <label className="block font-bold text-slate-700 mb-1">Estado Civil</label>
                    <select
                      value={editingColab.pessoais?.estadoCivil || 'Solteiro(a)'}
                      onChange={(e) => setEditingColab({
                        ...editingColab,
                        pessoais: { ...editingColab.pessoais!, estadoCivil: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    >
                      <option value="Solteiro(a)">Solteiro(a)</option>
                      <option value="Casado(a)">Casado(a)</option>
                      <option value="Divorciado(a)">Divorciado(a)</option>
                      <option value="Viúvo(a)">Viúvo(a)</option>
                      <option value="União Estável">União Estável</option>
                    </select>
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

                  <div>
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
                    <label className="block font-bold text-slate-700 mb-1">Centro de Custo</label>
                    <input
                      type="text"
                      placeholder="Ex: CC-101 (Gente & Gestão)"
                      value={editingColab.profissionais?.centroCusto || ''}
                      onChange={(e) => setEditingColab({
                        ...editingColab,
                        profissionais: { ...editingColab.profissionais!, centroCusto: e.target.value }
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

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">E-mail Corporativo</label>
                    <input
                      type="email"
                      placeholder="nome.sobrenome@maisrh.com.br"
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

              {activeFormTab === 'jornada' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Carga Horária Semanal (Horas)</label>
                      <input
                        type="number"
                        value={editingColab.profissionais?.jornadaSemanalHours || 44}
                        onChange={(e) => setEditingColab({
                          ...editingColab,
                          profissionais: { ...editingColab.profissionais!, jornadaSemanalHours: parseInt(e.target.value) || 44 }
                        })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Escala / Horário de Trabalho</label>
                      <input
                        type="text"
                        placeholder="Ex: 5x2 (08:00 às 18:00 com 1h20 almoço)"
                        value={editingColab.profissionais?.escalaTrabalho || ''}
                        onChange={(e) => setEditingColab({
                          ...editingColab,
                          profissionais: { ...editingColab.profissionais!, escalaTrabalho: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Status Contratual</label>
                      <select
                        value={editingColab.profissionais?.status || 'Ativo'}
                        onChange={(e) => setEditingColab({
                          ...editingColab,
                          profissionais: { ...editingColab.profissionais!, status: e.target.value as any }
                        })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Férias">Férias</option>
                        <option value="Afastado">Afastado</option>
                        <option value="Rescindido">Rescindido</option>
                      </select>
                    </div>
                  </div>

                  {/* SEÇÃO: CONFIGURAÇÃO DE JORNADA INDIVIDUAL / EXCEÇÃO */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-[#1E293B] text-xs">Exceção de Regras de Jornada para este Colaborador</h4>
                        <p className="text-[10px] text-slate-500">Permite aplicar regras individuais diferentes das regras globais da empresa</p>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!(editingColab.regraJornadaIndividual?.usarRegraEmpresa ?? true)}
                          onChange={(e) => {
                            const customActive = e.target.checked;
                            setEditingColab({
                              ...editingColab,
                              regraJornadaIndividual: {
                                ...(editingColab.regraJornadaIndividual || {}),
                                usarRegraEmpresa: !customActive,
                                tipoControleIndividual: editingColab.regraJornadaIndividual?.tipoControleIndividual || 'Pagamento de hora extra'
                              }
                            });
                          }}
                          className="w-4 h-4 text-[#2563EB] rounded"
                        />
                        <span className="font-bold text-xs text-slate-700">Aplicar Regra Individual Personalizada</span>
                      </label>
                    </div>

                    {!(editingColab.regraJornadaIndividual?.usarRegraEmpresa ?? true) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-200/80">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Tipo de Controle Individual</label>
                          <select
                            value={editingColab.regraJornadaIndividual?.tipoControleIndividual || 'Pagamento de hora extra'}
                            onChange={(e) => setEditingColab({
                              ...editingColab,
                              regraJornadaIndividual: {
                                ...editingColab.regraJornadaIndividual!,
                                tipoControleIndividual: e.target.value as any
                              }
                            })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold"
                          >
                            <option value="Pagamento de hora extra">Pagamento de Hora Extra em Folha</option>
                            <option value="Banco de horas">Apenas Banco de Horas</option>
                            <option value="Modelo misto">Modelo Misto (Híbrido)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Escala Individual</label>
                          <select
                            value={editingColab.regraJornadaIndividual?.escalaIndividual || 'Segunda a sexta'}
                            onChange={(e) => setEditingColab({
                              ...editingColab,
                              regraJornadaIndividual: {
                                ...editingColab.regraJornadaIndividual!,
                                escalaIndividual: e.target.value as any
                              }
                            })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold"
                          >
                            <option value="Segunda a sexta">Segunda a Sexta (5x2)</option>
                            <option value="Segunda a sábado">Segunda a Sábado (6x1)</option>
                            <option value="12x36">Plantão 12x36</option>
                            <option value="Escala personalizada">Escala Flexível / Especial</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">Observações da Exceção Contratual</label>
                          <input
                            type="text"
                            placeholder="Ex: Acordo escrito individual autorizando HE 100% aos domingos e plantões fora da escala"
                            value={editingColab.regraJornadaIndividual?.regraCalculoIndividualObs || ''}
                            onChange={(e) => setEditingColab({
                              ...editingColab,
                              regraJornadaIndividual: {
                                ...editingColab.regraJornadaIndividual!,
                                regraCalculoIndividualObs: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                          />
                        </div>
                      </div>
                    )}
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
                    <label className="block font-bold text-slate-700 mb-1">Dependentes (IRRF)</label>
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

              {activeFormTab === 'acesso' && (
                <div className="space-y-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="bg-blue-50/70 border border-blue-200 p-3 rounded-xl flex items-start gap-2.5 text-[#1E293B]">
                    <Key className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs text-[#2563EB]">Acesso ao Portal do Colaborador MAIS RH</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Defina o login e a senha do colaborador para acesso ao Portal Self-Service (Marcação de Ponto Digital, Holerites, Solicitação de Férias e Documentos).
                      </p>
                    </div>
                  </div>

                  {/* Campo de Login */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Login do Colaborador (E-mail ou Usuário) *
                    </label>
                    <input
                      type="text"
                      placeholder="exemplo@maisrh.com.br"
                      value={
                        editingColab.acessoColaborador?.loginUsername !== undefined
                          ? editingColab.acessoColaborador.loginUsername
                          : (editingColab.profissionais?.emailCorporativo || editingColab.pessoais?.emailPessoal || '')
                      }
                      onChange={(e) => setEditingColab({
                        ...editingColab,
                        acessoColaborador: {
                          ...(editingColab.acessoColaborador || { senhaCriada: true }),
                          loginUsername: e.target.value,
                          senhaProvisoria: editingColab.acessoColaborador?.senhaProvisoria || 'MaisRH@2026',
                          statusAcesso: editingColab.acessoColaborador?.statusAcesso || 'Ativo'
                        }
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 font-medium text-slate-800"
                    />
                  </div>

                  {/* Campo de Senha */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700">
                        Senha Inicial / Senha de Acesso *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const randomPass = 'MaisRH@' + Math.floor(1000 + Math.random() * 9000);
                          setEditingColab({
                            ...editingColab,
                            acessoColaborador: {
                              ...(editingColab.acessoColaborador || { loginUsername: '', statusAcesso: 'Ativo', senhaCriada: true }),
                              senhaProvisoria: randomPass
                            }
                          });
                          showNotification(`Senha gerada: ${randomPass}`);
                        }}
                        className="text-[11px] font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Gerar Senha Automática</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showPasswordInForm ? 'text' : 'password'}
                        placeholder="Digite a senha do colaborador..."
                        value={
                          editingColab.acessoColaborador?.senhaProvisoria !== undefined
                            ? editingColab.acessoColaborador.senhaProvisoria
                            : 'MaisRH@2026'
                        }
                        onChange={(e) => setEditingColab({
                          ...editingColab,
                          acessoColaborador: {
                            ...(editingColab.acessoColaborador || { loginUsername: '', statusAcesso: 'Ativo', senhaCriada: true }),
                            senhaProvisoria: e.target.value
                          }
                        })}
                        className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 font-mono text-slate-800 font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordInForm(!showPasswordInForm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                        title={showPasswordInForm ? 'Ocultar Senha' : 'Exibir Senha'}
                      >
                        {showPasswordInForm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      🔒 O colaborador utilizará esta senha para o primeiro acesso e poderá redefini-la depois.
                    </p>
                  </div>

                  {/* Status de Acesso */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status de Acesso ao Portal</label>
                    <select
                      value={editingColab.acessoColaborador?.statusAcesso || 'Ativo'}
                      onChange={(e) => setEditingColab({
                        ...editingColab,
                        acessoColaborador: {
                          ...(editingColab.acessoColaborador || { loginUsername: editingColab.profissionais?.emailCorporativo || '', senhaCriada: true }),
                          statusAcesso: e.target.value as any
                        }
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-slate-800"
                    >
                      <option value="Ativo">🟢 Ativo (Acesso Liberado)</option>
                      <option value="Bloqueado">🔴 Bloqueado (Acesso Suspenso)</option>
                      <option value="Pendente">🟡 Pendente (Aguardando Primeiro Acesso)</option>
                    </select>
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

      {/* Modal Profile Viewer - Hierarquia Completa */}
      {isProfileOpen && selectedColaborador && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedColaborador.fotoUrl}
                  alt={selectedColaborador.nomeCompleto}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#2563EB] shrink-0"
                />
                <div>
                  <h3 className="text-lg font-bold text-[#1E293B]">{selectedColaborador.nomeCompleto}</h3>
                  <p className="text-xs font-medium text-[#2563EB]">{selectedColaborador.profissionais.cargo}</p>
                  <p className="text-xs text-slate-500">{selectedColaborador.profissionais.departamento} • Contrato {selectedColaborador.trabalhistas.tipoContrato}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(selectedColaborador)}
                  className="px-3 py-1.5 bg-blue-50 text-[#2563EB] hover:bg-blue-100 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button 
                  onClick={() => setIsProfileOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Hierarchical Profile Sub-Tabs */}
            <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: 'pessoais', label: 'Dados Pessoais', icon: UserCheck },
                { id: 'contratuais', label: 'Dados Contratuais', icon: Briefcase },
                { id: 'jornada', label: 'Jornada', icon: Clock },
                { id: 'beneficios', label: 'Benefícios', icon: Gift },
                { id: 'ferias', label: 'Férias', icon: Umbrella },
                { id: 'documentos', label: 'Documentos', icon: FileText },
                { id: 'historico', label: 'Histórico', icon: History },
                { id: 'anotacoes', label: 'Anotações', icon: FileEdit }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setProfileTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                    profileTab === tab.id 
                      ? 'bg-[#2563EB] text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB CONTENTS */}
            {profileTab === 'pessoais' && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <h4 className="font-bold text-[#1E293B] text-xs border-b border-slate-200 pb-2 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-[#2563EB]" />
                  <span>Dados Pessoais</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <p><strong>Nome Completo:</strong> {selectedColaborador.pessoais.nomeCompleto}</p>
                  <p><strong>CPF:</strong> {selectedColaborador.pessoais.cpf}</p>
                  <p><strong>RG:</strong> {selectedColaborador.pessoais.rg || 'Não informado'}</p>
                  <p><strong>Data de Nascimento:</strong> {selectedColaborador.pessoais.dataNascimento}</p>
                  <p><strong>Estado Civil:</strong> {selectedColaborador.pessoais.estadoCivil}</p>
                  <p><strong>Gênero / Sexo:</strong> {selectedColaborador.pessoais.genero || 'Não informado'}</p>
                  <p><strong>Telefone WhatsApp:</strong> {selectedColaborador.pessoais.telefone}</p>
                  <p><strong>E-mail Pessoal:</strong> {selectedColaborador.pessoais.emailPessoal}</p>
                  <p className="col-span-1 md:col-span-2"><strong>Endereço Completo:</strong> {selectedColaborador.pessoais.endereco.logradouro}, {selectedColaborador.pessoais.endereco.numero} - {selectedColaborador.pessoais.endereco.bairro}, {selectedColaborador.pessoais.endereco.cidade}/{selectedColaborador.pessoais.endereco.estado} (CEP: {selectedColaborador.pessoais.endereco.cep})</p>
                  <p><strong>Contato de Emergência:</strong> {selectedColaborador.pessoais.contatoEmergenciaNome || 'Não informado'} ({selectedColaborador.pessoais.contatoEmergenciaTelefone || 'Sem telefone'})</p>
                </div>
              </div>
            )}

            {profileTab === 'contratuais' && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <h4 className="font-bold text-[#1E293B] text-xs border-b border-slate-200 pb-2 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#2563EB]" />
                  <span>Dados Contratuais & Vínculo Empregatício</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <p><strong>Matrícula eSocial:</strong> <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded font-bold">{selectedColaborador.pessoais.cpf.replace(/\D/g,'').slice(0,6)}</span></p>
                  <p><strong>Cargo Profissional:</strong> {selectedColaborador.profissionais.cargo}</p>
                  <p><strong>Departamento:</strong> {selectedColaborador.profissionais.departamento}</p>
                  <p><strong>Centro de Custo:</strong> {selectedColaborador.profissionais.centroCusto}</p>
                  <p><strong>Data de Admissão:</strong> {selectedColaborador.profissionais.dataAdmissao}</p>
                  <p><strong>Regime de Contratação:</strong> <span className="font-bold text-blue-700">CLT Mensalista</span></p>
                  <p><strong>Salário Base:</strong> <span className="font-bold text-slate-900">{selectedColaborador.profissionais.salarioBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></p>
                  <p><strong>Gestor Responsável:</strong> {selectedColaborador.profissionais.gestorResponsavel}</p>
                  <p><strong>E-mail Corporativo:</strong> {selectedColaborador.profissionais.emailCorporativo}</p>
                  <p><strong>Dados Bancários para Folha:</strong> Banco Bradesco (237) | Ag. 1420 | C/C 48201-9</p>
                </div>
              </div>
            )}

            {profileTab === 'jornada' && (
              <div className="space-y-4 text-xs">
                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-2">
                  <h4 className="font-bold text-[#1E293B] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#2563EB]" />
                    <span>Jornada de Trabalho e Escala</span>
                  </h4>
                  <p><strong>Escala Atual:</strong> {selectedColaborador.profissionais.escalaTrabalho} ({selectedColaborador.profissionais.jornadaSemanalHours}h semanais)</p>
                  <p><strong>Horário Padrão:</strong> 08:00 às 12:00 | 13:00 às 18:00 (Segunda a Sexta)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[11px] text-slate-500">Saldo Banco de Horas</p>
                    <p className="text-lg font-bold text-emerald-600">+08h 45min</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[11px] text-slate-500">Carga Semanal Cumprida</p>
                    <p className="text-lg font-bold text-slate-900">44h / 44h</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[11px] text-slate-500">Atrasos / Faltas no Mês</p>
                    <p className="text-lg font-bold text-slate-900">00h 00min</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-3 py-2 font-bold text-slate-700 border-b border-slate-200">
                    Últimas Marcações do Ponto Eletrônico (REP-P)
                  </div>
                  <div className="divide-y divide-slate-100">
                    {[
                      { data: 'Hoje (27/07)', e1: '08:00', s1: '12:00', e2: '13:20', s2: '18:00', status: 'Normal' },
                      { data: 'Ontem (26/07)', e1: '07:55', s1: '12:00', e2: '13:15', s2: '18:10', status: 'Hora Extra +10m' },
                      { data: '25/07/2026', e1: '08:02', s1: '12:05', e2: '13:20', s2: '18:00', status: 'Normal' }
                    ].map((p, i) => (
                      <div key={i} className="p-3 flex items-center justify-between">
                        <span className="font-bold text-slate-800">{p.data}</span>
                        <div className="flex gap-2 font-mono text-slate-600">
                          <span>{p.e1}</span> → <span>{p.s1}</span> | <span>{p.e2}</span> → <span>{p.s2}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'documentos' && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">Gestão de Documentos Digitais</h4>
                    <p className="text-[11px] text-slate-500">Documentação aceita no eSocial e pasta funcional do colaborador.</p>
                  </div>
                  <button className="px-3 py-1.5 bg-[#2563EB] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload de Documento</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {[
                    { nome: 'RG e CPF Digitalizado', status: 'Verificado', data: '15/03/2022' },
                    { nome: 'Comprovante de Residência Atualizado', status: 'Verificado', data: '10/01/2026' },
                    { nome: 'ASO - Atestado de Saúde Ocupacional (Periódico)', status: 'Válido', data: '14/02/2026' },
                    { nome: 'Contrato de Trabalho Assinado', status: 'Verificado', data: '15/03/2022' },
                    { nome: 'Termo de Opção de Vale Transporte', status: 'Verificado', data: '15/03/2022' },
                    { nome: 'Carteira de Vacinação / Dependentes', status: 'Pendente Validação', data: '01/06/2025' }
                  ].map((doc, i) => (
                    <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-800">{doc.nome}</p>
                          <p className="text-[10px] text-slate-400">Atualizado em: {doc.data}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        doc.status.includes('Verificado') || doc.status.includes('Válido') ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profileTab === 'beneficios' && (
              <div className="space-y-4 text-xs">
                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#1E293B]">Benefícios Vinculados ao Colaborador</h4>
                    <p className="text-slate-600 mt-0.5">Gestão de pacotes corporativos e descontos em folha.</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full font-bold text-[11px]">
                    {selectedColaborador.beneficiosAtivos.length} Ativos
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { nome: 'Vale Transporte Corporativo', tipo: 'Desconto 6% em Folha', valor: 'R$ 480,00/mês' },
                    { nome: 'Ticket Refeição Restaurante', tipo: 'Subsidia 98% Empresa', valor: 'R$ 950,00/mês' },
                    { nome: 'Bradesco Saúde Top Nacional', tipo: 'Desconto 10% Titular', valor: 'R$ 890,00/mês' },
                    { nome: 'OdontoPrev Plano Dental Master', tipo: '100% Custeado Empresa', valor: 'R$ 48,00/mês' }
                  ].map((b, i) => (
                    <div key={i} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Gift className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="font-bold text-slate-800">{b.nome}</p>
                          <p className="text-[10px] text-slate-500">{b.tipo}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">{b.valor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profileTab === 'ponto' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[11px] text-slate-500">Saldo Banco de Horas</p>
                    <p className="text-lg font-bold text-emerald-600">+08h 45min</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[11px] text-slate-500">Carga Semanal Cumprida</p>
                    <p className="text-lg font-bold text-slate-900">44h / 44h</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-[11px] text-slate-500">Atrasos / Faltas no Mês</p>
                    <p className="text-lg font-bold text-slate-900">00h 00min</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-3 py-2 font-bold text-slate-700 border-b border-slate-200">
                    Últimas Marcações de Ponto (REP-P)
                  </div>
                  <div className="divide-y divide-slate-100">
                    {[
                      { data: 'Hoje (27/07)', e1: '08:00', s1: '12:00', e2: '13:20', s2: '18:00', status: 'Normal' },
                      { data: 'Ontem (26/07)', e1: '07:55', s1: '12:00', e2: '13:15', s2: '18:10', status: 'Hora Extra +10m' },
                      { data: '25/07/2026', e1: '08:02', s1: '12:05', e2: '13:20', s2: '18:00', status: 'Normal' }
                    ].map((p, i) => (
                      <div key={i} className="p-3 flex items-center justify-between">
                        <span className="font-bold text-slate-800">{p.data}</span>
                        <div className="flex gap-2 font-mono text-slate-600">
                          <span>{p.e1}</span> → <span>{p.s1}</span> | <span>{p.e2}</span> → <span>{p.s2}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'folha' && (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-800 text-xs border-b border-slate-200 pb-2">Demonstrativo de Pagamento (Último Holerite - Junho/2026)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-bold text-emerald-700 mb-1">Proventos (+)</p>
                      <p>Salário Base: {selectedColaborador.profissionais.salarioBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                      <p>Anuênio / DSR: R$ 0,00</p>
                    </div>
                    <div>
                      <p className="font-bold text-rose-700 mb-1">Descontos (-)</p>
                      <p>INSS Retido: R$ 850,20</p>
                      <p>IRRF Retido: R$ 620,15</p>
                      <p>Vale Transporte (6%): R$ 280,00</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                    <span>LÍQUIDO A RECEBER:</span>
                    <span className="text-emerald-600">
                      {(selectedColaborador.profissionais.salarioBase - 850.20 - 620.15 - 280.00).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'ferias' && (
              <div className="space-y-4 text-xs">
                <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200 space-y-2">
                  <h4 className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                    <Umbrella className="w-4 h-4 text-amber-600" />
                    <span>Período Aquisitivo Ativo</span>
                  </h4>
                  <p><strong>Aquisitivo:</strong> 15/03/2025 a 14/03/2026</p>
                  <p><strong>Saldo Disponível:</strong> <span className="font-bold text-amber-900">30 dias integrais</span></p>
                  <p><strong>Vencimento Limite das Férias:</strong> 14/02/2027 (Evita Férias em Dobro Art. 137 CLT)</p>
                </div>
              </div>
            )}

            {profileTab === 'historico' && (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs">Registrar Nova Ocorrência no Histórico</h4>
                  <div className="flex gap-2">
                    <select
                      value={newOcorrenciaTipo}
                      onChange={(e) => setNewOcorrenciaTipo(e.target.value as any)}
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      <option value="Promoção">Promoção</option>
                      <option value="Alteração Salarial">Alteração Salarial</option>
                      <option value="Mudança de Cargo/Depto">Mudança de Cargo/Depto</option>
                      <option value="Atestado Médico">Atestado Médico</option>
                      <option value="Advertência/Elogio">Advertência/Elogio</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Descrição detalhada da ocorrência..."
                      value={newOcorrenciaDesc}
                      onChange={(e) => setNewOcorrenciaDesc(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                    />

                    <button
                      onClick={handleAdicionarOcorrencia}
                      className="px-4 py-2 bg-[#2563EB] text-white font-bold rounded-xl hover:bg-blue-700 cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {(selectedColaborador.historico || []).length === 0 ? (
                    <p className="text-slate-400 italic text-center py-4">Nenhuma ocorrência registrada no histórico.</p>
                  ) : (
                    (selectedColaborador.historico || []).map((h) => (
                      <div key={h.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <History className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">{h.tipo}</span>
                              <span className="text-[10px] text-slate-400">• {h.data}</span>
                            </div>
                            <p className="text-slate-600 mt-1">{h.descricao}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">Resp: {h.responsavel}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {profileTab === 'anotacoes' && (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <FileEdit className="w-4 h-4 text-[#2563EB]" />
                    <span>Anotações Internas do Departamento Pessoal</span>
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Utilize este espaço para registrar observações internas sobre o colaborador (sigiloso, visível apenas para a equipe de RH).
                  </p>

                  <textarea
                    rows={4}
                    value={notesInput || (selectedColaborador as any).anotacoesRH || ''}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Escreva anotações, feedbacks ou observações sobre o funcionário..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                  />

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        const updated = { ...selectedColaborador, anotacoesRH: notesInput };
                        setSelectedColaborador(updated as any);
                        onSalvarColaborador(updated as any);
                        showNotification('Anotações salvas com sucesso!');
                      }}
                      className="px-4 py-2 bg-[#2563EB] text-white font-bold rounded-xl hover:bg-blue-700 cursor-pointer flex items-center gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Salvar Anotações</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsProfileOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                Fechar Perfil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
