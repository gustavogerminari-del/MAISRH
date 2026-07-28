import React from 'react';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Sparkles, 
  AlertCircle, 
  ArrowUpRight, 
  PieChart, 
  Receipt, 
  FileText,
  UserCheck
} from 'lucide-react';
import { 
  HeadhunterClient, 
  HeadhunterJob, 
  HeadhunterCommission, 
  HeadhunterExpense, 
  HeadhunterInterview, 
  HeadhunterEvent 
} from '../types';

interface HeadhunterDashboardProps {
  clients: HeadhunterClient[];
  jobs: HeadhunterJob[];
  commissions: HeadhunterCommission[];
  expenses: HeadhunterExpense[];
  interviews: HeadhunterInterview[];
  events: HeadhunterEvent[];
  onNavigateTab: (tab: any) => void;
  onOpenAiModal: (type: string) => void;
}

export const HeadhunterDashboard: React.FC<HeadhunterDashboardProps> = ({
  clients,
  jobs,
  commissions,
  expenses,
  interviews,
  events,
  onNavigateTab,
  onOpenAiModal
}) => {
  // Metric Calculations
  const clientesAtivos = clients.filter(c => c.status === 'Ativo').length;
  const clientesInativos = clients.filter(c => c.status === 'Inativo').length;
  const leadsCount = 5; // From CRM mock
  const propostasEnviadas = 3;

  const vagasAbertas = jobs.filter(j => j.status === 'Aberta').length;
  const vagasEmAndamento = jobs.filter(j => j.status === 'Em Andamento').length;
  const vagasFechadas = jobs.filter(j => j.status === 'Fechada').length;
  const vagasCanceladas = jobs.filter(j => j.status === 'Cancelada').length;

  const receitaPrevista = jobs.filter(j => j.status !== 'Cancelada').reduce((acc, j) => acc + j.comissaoCalculada, 0);
  const receitaRecebida = commissions.filter(c => c.situacao === 'Recebida').reduce((acc, c) => acc + c.valorComissao, 0);
  
  const comissaoPrevista = commissions.filter(c => c.situacao === 'Prevista' || c.situacao === 'Liberada').reduce((acc, c) => acc + c.valorComissao, 0);
  const comissaoPaga = commissions.filter(c => c.situacao === 'Recebida').reduce((acc, c) => acc + c.valorComissao, 0);

  const despesasTotais = expenses.reduce((acc, e) => acc + e.valor, 0);
  const lucroLiquido = receitaRecebida - despesasTotais;

  const slaMedio = Math.round(jobs.reduce((acc, j) => acc + j.slaDias, 0) / (jobs.length || 1));
  const tempoMedioFechar = 34; // dias médios

  const entrevistasDoDia = interviews.filter(i => i.status === 'Agendada');

  // Ranking dos Headhunters
  const rankingHeadhunters = [
    { nome: 'Carlos Headhunter', vagasFechadas: 8, faturamento: 180000, comissao: 36000, taxaSucesso: '92%' },
    { nome: 'Mariana Souza', vagasFechadas: 5, faturamento: 120000, comissao: 24000, taxaSucesso: '88%' },
    { nome: 'Ana Clara Recrutadora', vagasFechadas: 3, faturamento: 65000, comissao: 13000, taxaSucesso: '82%' }
  ];

  return (
    <div className="space-y-6">
      {/* Executive Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold border border-indigo-400/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Executive Search & Headhunting Intelligence
          </div>
          <h2 className="text-2xl font-black tracking-tight">Painel Executivo do Headhunter</h2>
          <p className="text-xs text-slate-300 mt-1">
            Visão consolidada do pipeline comercial, lucratividade por vaga, ranking de consultores e indicadores de SLA.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAiModal('resumoExecutivo')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Gerar Resumo Executivo IA</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Clientes Ativos</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{clientesAtivos}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">+{clientesInativos} inativos</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Vagas em Andamento</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{vagasEmAndamento}</p>
          <span className="text-[10px] text-slate-500 font-medium mt-1 inline-block">{vagasAbertas} abertas</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Vagas Fechadas</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{vagasFechadas}</p>
          <span className="text-[10px] text-slate-500 font-medium mt-1 inline-block">{vagasCanceladas} canceladas</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Receita Prevista</span>
          <p className="text-lg font-black text-slate-900 mt-1">R$ {(receitaPrevista / 1000).toFixed(0)}k</p>
          <span className="text-[10px] text-indigo-600 font-semibold mt-1 inline-block">Comissão total</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Receita Recebida</span>
          <p className="text-lg font-black text-emerald-700 mt-1">R$ {(receitaRecebida / 1000).toFixed(0)}k</p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">Liquidada</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Despesas Totais</span>
          <p className="text-lg font-black text-rose-600 mt-1">R$ {despesasTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <span className="text-[10px] text-rose-500 font-medium mt-1 inline-block">Operacional</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Lucro Líquido</span>
          <p className="text-lg font-black text-slate-900 mt-1">R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">Margem ~85%</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">SLA Médio Vaga</span>
          <p className="text-2xl font-black text-indigo-600 mt-1">{tempoMedioFechar}d</p>
          <span className="text-[10px] text-slate-500 font-medium mt-1 inline-block">Meta: {slaMedio}d</span>
        </div>
      </div>

      {/* Main Section Grid */}
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
                {rankingHeadhunters.map((hh, idx) => (
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
                ))}
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
              {entrevistasDoDia.map(int => (
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
    </div>
  );
};
