import React from 'react';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Calendar, 
  Award, 
  Sparkles, 
  Receipt, 
  FileText,
  UserCheck,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { 
  HeadhunterClient, 
  HeadhunterJob, 
  HeadhunterCommission, 
  HeadhunterExpense, 
  HeadhunterInterview, 
  HeadhunterEvent,
  HeadhunterLead,
  HeadhunterCandidate,
  HeadhunterFinanceItem
} from '../types';

interface HeadhunterDashboardProps {
  clients: HeadhunterClient[];
  jobs: HeadhunterJob[];
  commissions: HeadhunterCommission[];
  expenses: HeadhunterExpense[];
  interviews: HeadhunterInterview[];
  events: HeadhunterEvent[];
  leads?: HeadhunterLead[];
  candidates?: HeadhunterCandidate[];
  financial?: HeadhunterFinanceItem[];
  onNavigateTab: (tab: any) => void;
  onOpenAiModal: (type: string, data?: any) => void;
}

export const HeadhunterDashboard: React.FC<HeadhunterDashboardProps> = ({
  clients = [],
  jobs = [],
  commissions = [],
  expenses = [],
  interviews = [],
  events = [],
  leads = [],
  candidates = [],
  financial = [],
  onNavigateTab,
  onOpenAiModal
}) => {
  // Metric Calculations - Pure real data from Firebase
  const clientesAtivos = clients.filter(c => c.status === 'Ativo').length;
  const leadsEmNegociacao = leads.filter(l => l.etapa === 'Proposta' || l.etapa === 'Negociação' || l.etapa === 'Contato').length;

  const vagasAbertas = jobs.filter(j => j.status === 'Aberta' || j.status === 'Busca ativa' || j.status === 'Em Andamento').length;
  const vagasFechadas = jobs.filter(j => j.status === 'Fechada').length;

  const candidatosEmProcesso = candidates.filter(c => c.etapaPipeline !== 'Contratado' && c.etapaPipeline !== 'Reprovado').length;

  const hojeStr = new Date().toISOString().split('T')[0];
  const entrevistasDoDia = interviews.filter(i => i.dataHora.startsWith(hojeStr) || i.status === 'Agendada');

  const receitaPrevista = jobs.filter(j => j.status !== 'Cancelada' && j.status !== 'Arquivada').reduce((acc, j) => acc + (j.comissaoCalculada || j.valorVaga || 0), 0);
  const receitaRecebida = financial.filter(f => f.tipo === 'Receita' && f.statusFinanceiro === 'Pago').reduce((acc, f) => acc + f.valor, 0);

  const comissaoPrevista = commissions.filter(c => c.situacao === 'Prevista' || c.situacao === 'Liberada').reduce((acc, c) => acc + c.valorComissao, 0);
  const despesasTotais = expenses.reduce((acc, e) => acc + e.valor, 0);
  const lucroLiquido = receitaRecebida - despesasTotais;

  const slaMedio = jobs.length ? Math.round(jobs.reduce((acc, j) => acc + (j.slaDias || 0), 0) / jobs.length) : 0;

  // Additional sections
  const vagasProximasSLA = jobs.filter(j => (j.slaDias || 0) <= 45 && j.status !== 'Fechada');
  const contasAReceber = financial.filter(f => f.tipo === 'Receita' && f.statusFinanceiro === 'Pendente');
  const comissoesPendentes = commissions.filter(c => c.situacao === 'Prevista');

  // Dynamic Ranking calculation from real data
  const rankingHeadhunters = (() => {
    const map = new Map<string, { nome: string; vagasFechadas: number; faturamento: number; comissao: number; totalVagas: number }>();
    
    jobs.forEach(j => {
      const nome = j.consultorResponsavel || j.criadoPor || 'Consultor';
      const existing = map.get(nome) || { nome, vagasFechadas: 0, faturamento: 0, comissao: 0, totalVagas: 0 };
      existing.totalVagas += 1;
      if (j.status === 'Fechada') {
        existing.vagasFechadas += 1;
        existing.faturamento += (j.valorVaga || j.comissaoCalculada || 0);
      }
      map.set(nome, existing);
    });

    commissions.forEach(c => {
      const nome = c.consultorNome || c.beneficiarioNome || 'Consultor';
      const existing = map.get(nome) || { nome, vagasFechadas: 0, faturamento: 0, comissao: 0, totalVagas: 0 };
      existing.comissao += (c.valorComissao || 0);
      map.set(nome, existing);
    });

    return Array.from(map.values())
      .map(item => ({
        ...item,
        taxaSucesso: item.totalVagas > 0 ? `${Math.round((item.vagasFechadas / item.totalVagas) * 100)}%` : '0%'
      }))
      .sort((a, b) => b.faturamento - a.faturamento);
  })();

  return (
    <div className="space-y-6">
      {/* Clean Native Page Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Visão Geral do Headhunter
            </h2>
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-200">
              {vagasAbertas} vagas ativas
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Acompanhe a lucratividade da operação, pipeline de candidatos executivos e faturamento de honorários em tempo real.
          </p>
        </div>
      </div>

      {/* 12 Clickable KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* 1. Clientes Ativos */}
        <div 
          onClick={() => onNavigateTab('clientes')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Clientes Ativos</span>
            <Building2 className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <p className="text-2xl font-black text-slate-900">{clientesAtivos}</p>
          <span className="text-[10px] text-indigo-600 font-bold">Ver Clientes →</span>
        </div>

        {/* 2. Leads em Negociação */}
        <div 
          onClick={() => onNavigateTab('crm')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Leads Negociação</span>
            <TrendingUp className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <p className="text-2xl font-black text-indigo-600">{leadsEmNegociacao}</p>
          <span className="text-[10px] text-indigo-600 font-bold">Acessar CRM →</span>
        </div>

        {/* 3. Vagas Abertas */}
        <div 
          onClick={() => onNavigateTab('vagas')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Vagas Abertas</span>
            <Briefcase className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <p className="text-2xl font-black text-slate-900">{vagasAbertas}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Gerenciar Vagas →</span>
        </div>

        {/* 4. Vagas Fechadas */}
        <div 
          onClick={() => onNavigateTab('vagas')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Vagas Fechadas</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{vagasFechadas}</p>
          <span className="text-[10px] text-slate-500 font-medium">Concluídas</span>
        </div>

        {/* 5. Candidatos em Processo */}
        <div 
          onClick={() => onNavigateTab('pipeline')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Em Processo</span>
            <Users className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <p className="text-2xl font-black text-indigo-600">{candidatosEmProcesso}</p>
          <span className="text-[10px] text-indigo-600 font-bold">Ver Pipeline →</span>
        </div>

        {/* 6. Entrevistas do Dia */}
        <div 
          onClick={() => onNavigateTab('entrevistas')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Entrevistas Hoje</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{entrevistasDoDia.length}</p>
          <span className="text-[10px] text-indigo-600 font-bold">Ver Agenda →</span>
        </div>

        {/* 7. Receita Prevista */}
        <div 
          onClick={() => onNavigateTab('financeiro')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Receita Prevista</span>
            <DollarSign className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <p className="text-lg font-black text-slate-900">R$ {(receitaPrevista / 1000).toFixed(0)}k</p>
          <span className="text-[10px] text-slate-500 font-medium">Honorários</span>
        </div>

        {/* 8. Receita Recebida */}
        <div 
          onClick={() => onNavigateTab('financeiro')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Receita Recebida</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-black text-emerald-700">R$ {(receitaRecebida / 1000).toFixed(0)}k</p>
          <span className="text-[10px] text-emerald-600 font-bold">Faturado</span>
        </div>

        {/* 9. Comissão Prevista */}
        <div 
          onClick={() => onNavigateTab('comissoes')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Comissão Prevista</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-black text-amber-600">R$ {(comissaoPrevista / 1000).toFixed(0)}k</p>
          <span className="text-[10px] text-amber-600 font-bold">Headhunters</span>
        </div>

        {/* 10. Despesas */}
        <div 
          onClick={() => onNavigateTab('despesas')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Despesas Totais</span>
            <Receipt className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-lg font-black text-rose-600">R$ {despesasTotais.toLocaleString('pt-BR')}</p>
          <span className="text-[10px] text-rose-500 font-medium">Operacional</span>
        </div>

        {/* 11. Lucro Líquido */}
        <div 
          onClick={() => onNavigateTab('financeiro')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Lucro Líquido</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-black text-slate-900">R$ {(lucroLiquido / 1000).toFixed(0)}k</p>
          <span className="text-[10px] text-emerald-600 font-bold">Margem ~85%</span>
        </div>

        {/* 12. SLA Médio */}
        <div 
          onClick={() => onNavigateTab('vagas')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">SLA Médio</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-indigo-600">{slaMedio}d</p>
          <span className="text-[10px] text-slate-500 font-medium">Prazo de Fechamento</span>
        </div>
      </div>

      {/* Main Secondary Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ranking dos Headhunters */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Ranking & Performance dos Headhunters</h3>
            </div>
            <button
              onClick={() => onNavigateTab('relatorios')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              Ver Relatório Completo →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="p-3">Consultor / Headhunter</th>
                  <th className="p-3 text-center">Vagas Fechadas</th>
                  <th className="p-3 text-right">Faturamento Gerado</th>
                  <th className="p-3 text-right">Comissão Devida</th>
                  <th className="p-3 text-center">Taxa de Sucesso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {rankingHeadhunters.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">
                      Nenhum consultor registrado ou com faturamento gerado.
                    </td>
                  </tr>
                ) : (
                  rankingHeadhunters.map((hh, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-black text-[11px] flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <span>{hh.nome}</span>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-700">{hh.vagasFechadas} vagas</td>
                      <td className="p-3 text-right font-black text-slate-900">
                        R$ {hh.faturamento.toLocaleString('pt-BR')}
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600">
                        R$ {hh.comissao.toLocaleString('pt-BR')}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px]">
                          {hh.taxaSucesso}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Entrevistas do Dia & Agenda */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Entrevistas & Agenda do Dia</h3>
            </div>
            <span className="text-xs font-bold text-slate-500">{new Date().toLocaleDateString('pt-BR')}</span>
          </div>

          {entrevistasDoDia.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Nenhuma entrevista agendada para hoje.</p>
          ) : (
            <div className="space-y-3">
              {entrevistasDoDia.slice(0, 3).map(int => (
                <div key={int.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">{int.candidatoNome}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                      {new Date(int.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {int.vagaTitulo} • <strong className="text-slate-800">{int.clienteNome}</strong>
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Modalidade: {int.modalidade}</span>
                    <button
                      onClick={() => onNavigateTab('entrevistas')}
                      className="text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                      Acessar Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('agenda')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-slate-600" />
              <span>Ver Agenda Completa</span>
            </button>
          </div>
        </div>
      </div>

      {/* SLA, Contas e Comissões Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vagas Próximas do SLA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Vagas Próximas do SLA</h4>
            </div>
            <button onClick={() => onNavigateTab('vagas')} className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer">Ver Vagas →</button>
          </div>

          <div className="space-y-2">
            {vagasProximasSLA.slice(0, 3).map(j => (
              <div key={j.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{j.cargo}</p>
                  <p className="text-[10px] text-slate-500">{j.clienteNome}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  SLA: {j.slaDias} dias
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contas a Receber */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Contas a Receber</h4>
            </div>
            <button onClick={() => onNavigateTab('financeiro')} className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer">Financeiro →</button>
          </div>

          <div className="space-y-2">
            {contasAReceber.slice(0, 3).map(f => (
              <div key={f.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{f.descricao || f.clienteNome}</p>
                  <p className="text-[10px] text-slate-500">Vencimento: {f.dataVencimento}</p>
                </div>
                <span className="font-extrabold text-emerald-700">
                  R$ {f.valor.toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
            {contasAReceber.length === 0 && (
              <p className="text-xs text-slate-400 py-2 text-center">Nenhum recebimento pendente.</p>
            )}
          </div>
        </div>

        {/* Comissões Pendentes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Comissões Pendentes</h4>
            </div>
            <button onClick={() => onNavigateTab('comissoes')} className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer">Comissões →</button>
          </div>

          <div className="space-y-2">
            {comissoesPendentes.slice(0, 3).map(c => (
              <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{c.consultorNome}</p>
                  <p className="text-[10px] text-slate-500">{c.vagaTitulo}</p>
                </div>
                <span className="font-extrabold text-indigo-600">
                  R$ {c.valorComissao.toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

