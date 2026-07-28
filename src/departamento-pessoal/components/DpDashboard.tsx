import React from 'react';
import { 
  Users, 
  UserPlus, 
  Clock, 
  Gift, 
  Umbrella, 
  LogOut, 
  FileText, 
  ShieldAlert, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Cake,
  ArrowRight,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { 
  ColaboradorCompleto, 
  RegistroFeriasColaborador, 
  CalculoRescisorio, 
  AfastamentoColaborador, 
  DocumentoColaborador, 
  AjustePontoColaborador, 
  AdmissaoPending 
} from '../types/dp';

interface DpDashboardProps {
  colaboradores: ColaboradorCompleto[];
  ferias: RegistroFeriasColaborador[];
  rescisoes: CalculoRescisorio[];
  afastamentos: AfastamentoColaborador[];
  documentos: DocumentoColaborador[];
  ajustesPonto: AjustePontoColaborador[];
  admissoes: AdmissaoPending[];
  onNavigateSubTab: (subTab: string, filter?: string) => void;
  onOpenColaboradorProfile?: (colab: ColaboradorCompleto) => void;
}

export const DpDashboard: React.FC<DpDashboardProps> = ({
  colaboradores,
  ferias,
  rescisoes,
  afastamentos,
  documentos,
  ajustesPonto,
  admissoes,
  onNavigateSubTab,
  onOpenColaboradorProfile
}) => {
  // Metric Calculations from Real Firebase Data
  const colaboradoresAtivos = colaboradores.filter(c => c.profissionais?.status === 'Ativo');
  const admissoesPendentes = admissoes.filter(a => a.status !== 'Efetivado' && a.status !== 'Cancelado');
  
  // Períodos de Experiência Vencendo nos próximos 30 dias
  const hoje = new Date();
  const em30Dias = new Date(hoje.getTime() + 30 * 86400000);
  const experienciaVencendo = colaboradoresAtivos.filter(c => {
    if (!c.profissionais?.dataAdmissao) return false;
    const admDate = new Date(c.profissionais.dataAdmissao);
    const exp45 = new Date(admDate.getTime() + 45 * 86400000);
    const exp90 = new Date(admDate.getTime() + 90 * 86400000);
    return (exp45 >= hoje && exp45 <= em30Dias) || (exp90 >= hoje && exp90 <= em30Dias);
  });

  const feriasVencidasOuVencendo = ferias.filter(f => f.status === 'Vencido' || f.status === 'Disponível');
  const feriasProgramadas = ferias.filter(f => f.status === 'Aprovado' || f.status === 'Solicitado');
  const afastamentosAtivos = afastamentos.filter(a => a.status === 'Ativo');
  const documentosPendentesOuVencidos = documentos.filter(d => d.status === 'Vencido' || d.status === 'Pendente');
  const ajustesPontoPendentes = ajustesPonto.filter(a => a.status === 'Pendente');
  const rescisoesEmAndamento = rescisoes.filter(r => r.status === 'Simulação' || r.status === 'Aprovado RH');

  // Aniversariantes do Mês
  const mesAtual = hoje.getMonth();
  const aniversariantesMes = colaboradores.filter(c => {
    if (!c.pessoais?.dataNascimento) return false;
    const dob = new Date(c.pessoais.dataNascimento);
    return dob.getMonth() === mesAtual;
  });

  return (
    <div className="space-y-6">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs font-black px-3 py-1 rounded-full border border-indigo-400/30">
            <Users className="w-3.5 h-3.5" />
            <span>Departamento Pessoal Integrado MAIS RH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Visão Geral & Indicadores de RH</h1>
          <p className="text-xs text-slate-300 font-medium max-w-2xl">
            Acompanhe o ciclo de vida do colaborador, admissões vindas do recrutamento, vigência de férias, atestados e ajustes de jornada em tempo real.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ativos */}
        <div 
          onClick={() => onNavigateSubTab('colaboradores')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Colaboradores Ativos</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-slate-900">{colaboradoresAtivos.length}</p>
            <span className="text-xs font-bold text-slate-400">Total no quadro</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 pt-1 border-t border-slate-100">
            <span>Ver cadastro completo</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Admissões Pendentes */}
        <div 
          onClick={() => onNavigateSubTab('admissoes')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Admissões Pendentes</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-emerald-700">{admissoesPendentes.length}</p>
            <span className="text-xs font-bold text-emerald-600">Vindos do Recrutamento</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 pt-1 border-t border-slate-100">
            <span>Efetivar novos funcionários</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Ajustes de Ponto Pendentes */}
        <div 
          onClick={() => onNavigateSubTab('ponto-digital')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Ajustes de Ponto</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-amber-700">{ajustesPontoPendentes.length}</p>
            <span className="text-xs font-bold text-amber-600">Pendentes de aprovação</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 pt-1 border-t border-slate-100">
            <span>Analisar e aprovar espelho</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Férias a Vencer */}
        <div 
          onClick={() => onNavigateSubTab('ferias')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer group space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Férias a Vencer</span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Umbrella className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-sky-700">{feriasVencidasOuVencendo.length}</p>
            <span className="text-xs font-bold text-sky-600">Período concessivo</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-sky-600 pt-1 border-t border-slate-100">
            <span>Programar concessão</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Secondary Operational Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Alerts & Pendencies */}
        <div className="lg:col-span-2 space-y-6">
          {/* Admissões Prontas para Efetivação */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Novas Admissões a Efetivar</h3>
              </div>
              <button 
                onClick={() => onNavigateSubTab('admissoes')}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Ver todas ({admissoes.length})
              </button>
            </div>

            {admissoesPendentes.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Nenhuma admissão pendente no momento.
              </div>
            ) : (
              <div className="space-y-3">
                {admissoesPendentes.slice(0, 3).map(adm => (
                  <div key={adm.id} className="flex items-center justify-between p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-slate-900">{adm.nomeCompleto}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Cargo: <strong className="text-slate-700">{adm.cargo}</strong> • Salário: R$ {adm.salarioCombinado.toLocaleString('pt-BR')}
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigateSubTab('admissoes')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Efetivar Colaborador
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Afastamentos e Atestados Ativos */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-black text-slate-900">Afastamentos & Atestados Ativos</h3>
              </div>
              <button 
                onClick={() => onNavigateSubTab('afastamentos')}
                className="text-xs font-bold text-rose-700 hover:underline cursor-pointer"
              >
                Gerenciar Afastamentos
              </button>
            </div>

            {afastamentosAtivos.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Nenhum colaborador afastado atualmente.
              </div>
            ) : (
              <div className="space-y-3">
                {afastamentosAtivos.map(af => (
                  <div key={af.id} className="flex items-center justify-between p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-slate-900">{af.colaboradorNome}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Motivo: <strong className="text-rose-800">{af.tipo}</strong> • Período: {af.dataInicio} a {af.dataFim} ({af.diasAfastado} dias)
                      </p>
                    </div>

                    <span className="px-2.5 py-1 bg-rose-100 text-rose-800 font-black text-[10px] rounded-full">
                      Ativo
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Status & Birthdays */}
        <div className="space-y-6">
          {/* Aniversariantes do Mês */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Cake className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-black text-slate-900">Aniversariantes do Mês</h3>
            </div>

            {aniversariantesMes.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-xs">
                Nenhum aniversariante registrado para este mês.
              </div>
            ) : (
              <div className="space-y-2.5">
                {aniversariantesMes.map(colab => (
                  <div key={colab.id} className="flex items-center justify-between p-2.5 bg-amber-50/60 rounded-xl border border-amber-100/80">
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{colab.nomeCompleto}</h4>
                      <span className="text-[10px] text-slate-500 font-medium">{colab.profissionais?.cargo}</span>
                    </div>
                    <span className="text-xs font-black text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-lg">
                      {colab.pessoais?.dataNascimento ? new Date(colab.pessoais.dataNascimento).getDate() : '--'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Rescisões Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <LogOut className="w-5 h-5 text-slate-600" />
                <h3 className="text-base font-black text-slate-900">Rescisões em Processamento</h3>
              </div>
              <button 
                onClick={() => onNavigateSubTab('rescisao')}
                className="text-xs font-bold text-slate-600 hover:underline cursor-pointer"
              >
                Ver
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-600">Simulações de Desligamento</span>
                <strong className="text-slate-900 font-black">{rescisoesEmAndamento.length}</strong>
              </div>
              <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-600">Rescisões Homologadas</span>
                <strong className="text-emerald-700 font-black">
                  {rescisoes.filter(r => r.status === 'Homologado' || r.status === 'Pago').length}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
