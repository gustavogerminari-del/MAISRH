import React, { useState, useEffect } from 'react';
import { 
  User, 
  Clock, 
  FileText, 
  Umbrella, 
  DollarSign, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Download, 
  Send, 
  Upload, 
  Plus, 
  FileCheck, 
  Building2, 
  Briefcase, 
  Award, 
  LogOut, 
  Phone, 
  Mail, 
  Home, 
  ChevronRight,
  Eye,
  RefreshCw,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../auth';
import { ColaboradorCompleto } from '../types/dp';
import { INITIAL_COLABORADORES } from '../data/dpMockData';

interface PortalColaboradorViewProps {
  initialTab?: 'perfil' | 'ponto' | 'documentos' | 'ferias' | 'folha';
}

export const PortalColaboradorView: React.FC<PortalColaboradorViewProps> = ({
  initialTab = 'ponto'
}) => {
  const { user, logout } = useAuth();
  const companyId = user?.companyId || user?.empresaId || 'emp-001';

  // Active Tab State
  const [activeTab, setActiveTab] = useState<'perfil' | 'ponto' | 'documentos' | 'ferias' | 'folha'>(initialTab);

  // Load colaboradores or fallback to initial mock
  const [colaboradores, setColaboradores] = useState<ColaboradorCompleto[]>(() => {
    const saved = localStorage.getItem(`MAIS_RH_COLABORADORES_${companyId}`);
    return saved ? JSON.parse(saved) : INITIAL_COLABORADORES;
  });

  // Current employee profile matching user or defaulting to first
  const currentColab: ColaboradorCompleto = colaboradores.find(
    c => c.id === user?.colaboradorId || c.pessoais?.emailPessoal === user?.email || c.profissionais?.emailCorporativo === user?.email
  ) || colaboradores[0];

  // Current real-time digital clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Time punches state
  const [pontoHoje, setPontoHoje] = useState<{ id: string; tipo: string; hora: string; status: string }[]>([
    { id: '1', tipo: 'Entrada', hora: '08:02:15', status: 'Confirmado (GPS)' },
    { id: '2', tipo: 'Intervalo Saída', hora: '12:01:40', status: 'Confirmado (GPS)' },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Adjust point modal
  const [showAjusteModal, setShowAjusteModal] = useState(false);
  const [ajusteForm, setAjusteForm] = useState({ data: '', hora: '', tipo: 'Entrada', motivo: '' });

  // Vacation request modal
  const [showFeriasModal, setShowFeriasModal] = useState(false);
  const [feriasForm, setFeriasForm] = useState({ dataInicio: '', dias: '30', adiantar13: false, abonoPecuniario: false });

  // Upload document modal
  const [showDocModal, setShowDocModal] = useState(false);
  const [docForm, setDocForm] = useState({ titulo: '', categoria: 'Atestado Médico', arquivo: null as File | null, observacao: '' });

  // Holerite Selected Month
  const [selectedMesHolerite, setSelectedMesHolerite] = useState('07/2026');

  // Handle Punching Clock
  const handleBaterPonto = (tipo: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR');
    const newEntry = {
      id: String(Date.now()),
      tipo,
      hora: timeStr,
      status: 'Confirmado (GPS ±12m)'
    };
    setPontoHoje(prev => [...prev, newEntry]);
    setToastMessage(`Ponto de ${tipo} registrado com sucesso às ${timeStr}!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Adjust Submit
  const handleAjusteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAjusteModal(false);
    setToastMessage(`Solicitação de ajuste de ponto enviada para aprovação do RH!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Vacation Submit
  const handleFeriasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowFeriasModal(false);
    setToastMessage(`Solicitação de férias de ${feriasForm.dias} dias registrada para análise do RH!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Document Submit
  const handleDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDocModal(false);
    setToastMessage(`Documento enviado com sucesso para o Departamento Pessoal!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#1E293B] text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Colaborador Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-white font-black flex items-center justify-center text-lg shadow-sm">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-900 tracking-tight">
                  MAIS<span className="text-[#2563EB]">RH</span>
                </span>
                <span className="bg-blue-50 text-[#2563EB] text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-blue-200/60">
                  Portal do Colaborador
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {user?.companyName || (currentColab as any).empresaNome || 'Grupo Alpha Logística S/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <img
                src={currentColab.fotoUrl || user?.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
                alt={currentColab.nomeCompleto}
                className="w-8 h-8 rounded-full object-cover border border-blue-500"
              />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">{currentColab.nomeCompleto}</p>
                <p className="text-[10px] text-slate-500">{currentColab.profissionais?.cargo || 'Colaborador(a)'}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        
        {/* Banner Welcome */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-no-repeat bg-cover pointer-events-none" style={{ backgroundImage: `url(${currentColab.fotoUrl})` }} />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Acesso Ativo
                </span>
                <span className="text-slate-400 text-xs font-mono">
                  CPF: {currentColab.pessoais?.cpf || '000.000.000-00'}
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Olá, {currentColab.nomeCompleto.split(' ')[0]} 👋
              </h1>
              <p className="text-xs text-slate-300 font-medium max-w-xl">
                Bem-vindo ao seu portal self-service. Aqui você pode bater ponto digital, consultar seu banco de horas, visualizar e baixar holerites, solicitar férias e enviar documentos ao RH.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-center gap-4 text-xs shrink-0">
              <div className="text-center border-r border-white/20 pr-4">
                <span className="block text-[10px] text-slate-300 font-bold uppercase tracking-wider">Jornada Semanal</span>
                <span className="text-sm font-black text-white">{currentColab.profissionais?.jornadaSemanalHours ? `${currentColab.profissionais.jornadaSemanalHours} Horas` : '44 Horas'}</span>
              </div>
              <div className="text-center pr-2">
                <span className="block text-[10px] text-slate-300 font-bold uppercase tracking-wider">Saldo Banco</span>
                <span className="text-sm font-black text-emerald-400">+04h 15m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-2xs flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ponto')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ponto'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Meu Ponto & Frequência</span>
          </button>

          <button
            onClick={() => setActiveTab('folha')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'folha'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Minha Folha / Holerites</span>
          </button>

          <button
            onClick={() => setActiveTab('ferias')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ferias'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Umbrella className="w-4 h-4" />
            <span>Minhas Férias</span>
          </button>

          <button
            onClick={() => setActiveTab('documentos')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'documentos'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Meus Documentos</span>
          </button>

          <button
            onClick={() => setActiveTab('perfil')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'perfil'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Meu Perfil</span>
          </button>
        </div>

        {/* TAB 1: MEU PONTO */}
        {activeTab === 'ponto' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Clock Widget Card */}
              <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#2563EB]" /> Horário Oficial de Brasília
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      GPS + SSL Válido
                    </span>
                  </div>

                  <div className="text-center py-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-inner">
                    <span className="text-4xl font-black tracking-wider font-mono text-emerald-400">
                      {currentTime.toLocaleTimeString('pt-BR')}
                    </span>
                    <p className="text-[11px] text-slate-400 capitalize mt-1">
                      {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-800 text-center mb-2">Registrar Batida de Ponto Agora:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleBaterPonto('Entrada')}
                      className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Entrada (08:00)
                    </button>
                    <button
                      onClick={() => handleBaterPonto('Saída Almoço')}
                      className="p-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Intervalo (12:00)
                    </button>
                    <button
                      onClick={() => handleBaterPonto('Retorno Almoço')}
                      className="p-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Retorno (13:00)
                    </button>
                    <button
                      onClick={() => handleBaterPonto('Saída')}
                      className="p-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Saída (17:00)
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowAjusteModal(true)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Solicitar Ajuste / Correção de Ponto</span>
                </button>
              </div>

              {/* Marcações do Dia & Banco de Horas */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Registros de Hoje */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#2563EB]" />
                      Marcações Registradas Hoje
                    </h3>
                    <span className="text-xs font-semibold text-slate-500">
                      Escala Prevista: 08:00 - 12:00 / 13:00 - 17:00
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {pontoHoje.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{item.tipo}</span>
                          <p className="text-lg font-black font-mono text-slate-900">{item.hora}</p>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-2 inline-block">
                          {item.status}
                        </span>
                      </div>
                    ))}
                    {pontoHoje.length < 4 && (
                      <div className="p-3 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-xs font-semibold">
                        Aguardando próxima marcação...
                      </div>
                    )}
                  </div>
                </div>

                {/* Resumo Espelho de Ponto & Banco de Horas */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Resumo de Frequência & Banco de Horas</h3>
                      <p className="text-xs text-slate-500">Acompanhamento mensal atualizado</p>
                    </div>
                    <button 
                      onClick={() => setToastMessage('Iniciando download do Espelho de Ponto assinado em PDF...')}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#2563EB] border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Baixar Espelho PDF
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-2xl">
                      <span className="text-[10px] font-bold text-blue-700 uppercase">Horas Trabalhadas</span>
                      <p className="text-base font-black text-slate-900 mt-0.5">142h 30m</p>
                    </div>
                    <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">Saldo Banco</span>
                      <p className="text-base font-black text-emerald-600 mt-0.5">+04h 15m</p>
                    </div>
                    <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-2xl">
                      <span className="text-[10px] font-bold text-purple-700 uppercase">Horas Extras 50%</span>
                      <p className="text-base font-black text-purple-900 mt-0.5">02h 00m</p>
                    </div>
                    <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-2xl">
                      <span className="text-[10px] font-bold text-amber-700 uppercase">Atrasos / Faltas</span>
                      <p className="text-base font-black text-slate-900 mt-0.5">00h 00m</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MINHA FOLHA / HOLERITE */}
        {activeTab === 'folha' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Demonstrativo de Pagamento (Holerite Digital)</h3>
                <p className="text-xs text-slate-500">Consulte proventos, descontos e valor líquido a receber</p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedMesHolerite}
                  onChange={(e) => setSelectedMesHolerite(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="07/2026">Mês Vigente: Julho / 2026</option>
                  <option value="06/2026">Junho / 2026</option>
                  <option value="05/2026">Maio / 2026</option>
                  <option value="04/2026">Abril / 2026</option>
                </select>

                <button 
                  onClick={() => setToastMessage(`Gerando PDF do Holerite referente a ${selectedMesHolerite}...`)}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" /> Imprimir Holerite PDF
                </button>
              </div>
            </div>

            {/* Holerite Display Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400">EMPREGADOR: GRUPO ALPHA LOGÍSTICA S/A • CNPJ: 12.345.678/0001-90</span>
                  <p className="text-sm font-bold text-white">{currentColab.nomeCompleto} • CTPS: {currentColab.trabalhistas?.ctpsNumero || '002931-SP'}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Mês de Referência</span>
                  <span className="text-sm font-black text-emerald-400">{selectedMesHolerite}</span>
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50">
                {/* Proventos */}
                <div className="space-y-2">
                  <h4 className="font-bold text-emerald-700 text-xs border-b border-emerald-200 pb-1">PROVENTOS (VENCIMENTOS)</h4>
                  <div className="space-y-1.5 font-medium text-slate-700">
                    <div className="flex justify-between">
                      <span>001 - Salário Base Mensal</span>
                      <span className="font-mono font-bold text-slate-900">R$ {currentColab.profissionais?.salarioBase?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '8.500,00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>012 - Horas Extras 50% (02h)</span>
                      <span className="font-mono font-bold text-slate-900">R$ 115,90</span>
                    </div>
                    <div className="flex justify-between">
                      <span>020 - DSR sobre Horas Extras</span>
                      <span className="font-mono font-bold text-slate-900">R$ 23,18</span>
                    </div>
                  </div>
                </div>

                {/* Descontos */}
                <div className="space-y-2">
                  <h4 className="font-bold text-rose-700 text-xs border-b border-rose-200 pb-1">DESCONTOS</h4>
                  <div className="space-y-1.5 font-medium text-slate-700">
                    <div className="flex justify-between">
                      <span>101 - INSS Retido na Fonte</span>
                      <span className="font-mono font-bold text-slate-900">R$ 908,85</span>
                    </div>
                    <div className="flex justify-between">
                      <span>105 - IRRF Imposto de Renda</span>
                      <span className="font-mono font-bold text-slate-900">R$ 1.120,40</span>
                    </div>
                    <div className="flex justify-between">
                      <span>201 - Vale Transporte (6%)</span>
                      <span className="font-mono font-bold text-slate-900">R$ 510,00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Prominent Net Salary Totals */}
              <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
                <div className="flex items-center gap-6 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Proventos</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">R$ 8.639,08</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Descontos</span>
                    <span className="font-mono font-bold text-rose-400 text-sm">R$ 2.539,25</span>
                  </div>
                </div>

                <div className="bg-emerald-500/20 border border-emerald-500/40 px-5 py-2.5 rounded-2xl text-right">
                  <span className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider block">Valor Líquido a Receber</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">R$ 6.099,83</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MINHAS FÉRIAS */}
        {activeTab === 'ferias' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <span className="text-[10px] font-bold uppercase text-slate-500">Período Aquisitivo Ativo</span>
                <p className="text-sm font-black text-slate-900">15/03/2025 a 14/03/2026</p>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-[#2563EB] h-2.5 rounded-full" style={{ width: '100%' }} />
                </div>
                <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 30 Dias de Férias Adquiridos
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                <span className="text-[10px] font-bold uppercase text-slate-500">Saldo Disponível</span>
                <p className="text-2xl font-black text-emerald-600">30 Dias</p>
                <p className="text-[11px] text-slate-500">Limite legal de gozo até 14/01/2027</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Programar Férias</span>
                  <p className="text-xs text-slate-600 mt-1">Envie sua solicitação para análise do RH e da sua liderança.</p>
                </div>
                <button
                  onClick={() => setShowFeriasModal(true)}
                  className="w-full py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-3"
                >
                  <Calendar className="w-4 h-4" /> Solicitar Agendamento de Férias
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: MEUS DOCUMENTOS */}
        {activeTab === 'documentos' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Seus Documentos & Atestados</h3>
                <p className="text-xs text-slate-500">Documentos trabalhistas e upload de comprovantes para o RH</p>
              </div>
              <button
                onClick={() => setShowDocModal(true)}
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Upload className="w-4 h-4" /> Enviar Novo Documento / Atestado
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Contrato de Trabalho Individual</p>
                    <span className="text-[10px] text-slate-500">Assinado em 15/03/2023 • Digital e Válido</span>
                  </div>
                </div>
                <button 
                  onClick={() => setToastMessage('Baixando Contrato de Trabalho PDF...')}
                  className="p-2 text-[#2563EB] hover:bg-blue-100 rounded-lg cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Termo de Opção Vale Transporte</p>
                    <span className="text-[10px] text-slate-500">Atualizado para 2026</span>
                  </div>
                </div>
                <button 
                  onClick={() => setToastMessage('Baixando Termo VT PDF...')}
                  className="p-2 text-[#2563EB] hover:bg-blue-100 rounded-lg cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MEU PERFIL */}
        {activeTab === 'perfil' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-200 pb-3">Ficha de Dados Cadastrais</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-[#2563EB] uppercase text-[11px] tracking-wider">Dados Pessoais</h4>
                <div className="space-y-1.5 text-slate-700">
                  <p><strong>Nome Completo:</strong> {currentColab.nomeCompleto}</p>
                  <p><strong>CPF:</strong> {currentColab.pessoais?.cpf || '000.000.000-00'}</p>
                  <p><strong>RG:</strong> {currentColab.pessoais?.rg || 'SSP-SP'}</p>
                  <p><strong>Data de Nascimento:</strong> {currentColab.pessoais?.dataNascimento || '15/05/1992'}</p>
                  <p><strong>E-mail Pessoal:</strong> {currentColab.pessoais?.emailPessoal || user?.email}</p>
                  <p><strong>Telefone:</strong> {currentColab.pessoais?.telefone || '(11) 98888-7777'}</p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-[#2563EB] uppercase text-[11px] tracking-wider">Dados Profissionais & Contratuais</h4>
                <div className="space-y-1.5 text-slate-700">
                  <p><strong>Cargo:</strong> {currentColab.profissionais?.cargo || 'Coordenador(a)'}</p>
                  <p><strong>Departamento:</strong> {currentColab.profissionais?.departamento || 'Recursos Humanos'}</p>
                  <p><strong>Data de Admissão:</strong> {currentColab.profissionais?.dataAdmissao || '15/03/2023'}</p>
                  <p><strong>Gestor Responsável:</strong> {currentColab.profissionais?.gestorResponsavel || 'Luciana Mello'}</p>
                  <p><strong>Tipo de Contrato:</strong> {currentColab.trabalhistas?.tipoContrato || 'CLT'}</p>
                  <p><strong>E-mail Corporativo:</strong> {currentColab.profissionais?.emailCorporativo || user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: SOLICITAR AJUSTE DE PONTO */}
      {showAjusteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-extrabold text-slate-900">Solicitar Ajuste / Inclusão de Ponto</h3>
            <form onSubmit={handleAjusteSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Data da Ocorrência *</label>
                <input type="date" required value={ajusteForm.data} onChange={e => setAjusteForm({ ...ajusteForm, data: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Horário Correto *</label>
                  <input type="time" required value={ajusteForm.hora} onChange={e => setAjusteForm({ ...ajusteForm, hora: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo *</label>
                  <select value={ajusteForm.tipo} onChange={e => setAjusteForm({ ...ajusteForm, tipo: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl">
                    <option value="Entrada">Entrada</option>
                    <option value="Intervalo Saída">Intervalo Saída</option>
                    <option value="Intervalo Retorno">Intervalo Retorno</option>
                    <option value="Saída">Saída</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Justificativa / Motivo *</label>
                <textarea required rows={3} placeholder="Explique o motivo do ajuste..." value={ajusteForm.motivo} onChange={e => setAjusteForm({ ...ajusteForm, motivo: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAjusteModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl font-bold hover:bg-slate-100">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#2563EB] text-white font-bold rounded-xl hover:bg-blue-700">Enviar Solicitação</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SOLICITAR FÉRIAS */}
      {showFeriasModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-extrabold text-slate-900">Solicitação de Agendamento de Férias</h3>
            <form onSubmit={handleFeriasSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Data de Início das Férias *</label>
                <input type="date" required value={feriasForm.dataInicio} onChange={e => setFeriasForm({ ...feriasForm, dataInicio: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantidade de Dias *</label>
                <select value={feriasForm.dias} onChange={e => setFeriasForm({ ...feriasForm, dias: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold">
                  <option value="30">30 Dias Integrais</option>
                  <option value="20">20 Dias (Vender 10 dias de abono)</option>
                  <option value="15">15 Dias (1º Período Fracionado)</option>
                  <option value="10">10 Dias (Fracionado)</option>
                </select>
              </div>
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input type="checkbox" checked={feriasForm.adiantar13} onChange={e => setFeriasForm({ ...feriasForm, adiantar13: e.target.checked })} className="w-4 h-4 text-[#2563EB] rounded" />
                  <span>Solicitar adiantamento da 1ª parcela do 13º salário</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowFeriasModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl font-bold hover:bg-slate-100">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#2563EB] text-white font-bold rounded-xl hover:bg-blue-700">Confirmar Solicitação</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ENVIAR DOCUMENTO */}
      {showDocModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-extrabold text-slate-900">Enviar Documento ou Atestado ao RH</h3>
            <form onSubmit={handleDocSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Categoria do Documento *</label>
                <select value={docForm.categoria} onChange={e => setDocForm({ ...docForm, categoria: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold">
                  <option value="Atestado Médico">Atestado Médico / Licença</option>
                  <option value="Comprovante de Residência">Comprovante de Residência</option>
                  <option value="Certidão de Casamento/Nascimento">Certidão de Casamento / Nascimento</option>
                  <option value="Outros">Outros Documentos</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Anexar Arquivo (PDF, JPG, PNG) *</label>
                <input type="file" required onChange={e => setDocForm({ ...docForm, arquivo: e.target.files ? e.target.files[0] : null })} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Observações para o RH</label>
                <textarea rows={2} value={docForm.observacao} onChange={e => setDocForm({ ...docForm, observacao: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowDocModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl font-bold hover:bg-slate-100">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#2563EB] text-white font-bold rounded-xl hover:bg-blue-700">Enviar ao RH</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
