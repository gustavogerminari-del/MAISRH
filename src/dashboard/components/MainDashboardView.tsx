import React, { useState } from 'react';
import {
  Briefcase,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  RefreshCw,
  Plus,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../../auth';
import { MetricCard } from './MetricCard';
import { PendingAlertsCard } from './PendingAlertsCard';
import { DepartmentBreakdownCard } from './DepartmentBreakdownCard';
import { ResponsibleBreakdownCard } from './ResponsibleBreakdownCard';
import { FunnelOverviewCard } from './FunnelOverviewCard';
import {
  INITIAL_DASHBOARD_METRICS,
  INITIAL_DEPARTMENTS_SUMMARY,
  INITIAL_RESPONSIBLE_SUMMARY,
  INITIAL_PROCESS_ALERTS,
  INITIAL_FUNNEL_STEPS,
} from '../data/mockDashboardData';
import { ProcessAlert } from '../types/dashboard';
import { Button, Card } from '../../shared';
import { formatDateBR, formatCountPlural } from '../../core';

export interface MainDashboardViewProps {
  onNavigateToJobs?: () => void;
  onNavigateToTalentBank?: () => void;
  onNavigateToInterviews?: () => void;
  onNavigateToReports?: () => void;
}

export const MainDashboardView: React.FC<MainDashboardViewProps> = ({
  onNavigateToJobs,
  onNavigateToTalentBank,
  onNavigateToInterviews,
  onNavigateToReports,
}) => {
  const { user, hasActionAccess } = useAuth();

  const [metrics] = useState(INITIAL_DASHBOARD_METRICS);
  const [departments] = useState(INITIAL_DEPARTMENTS_SUMMARY);
  const [responsibles] = useState(INITIAL_RESPONSIBLE_SUMMARY);
  const [alerts, setAlerts] = useState<ProcessAlert[]>(INITIAL_PROCESS_ALERTS);
  const [funnelSteps] = useState(INITIAL_FUNNEL_STEPS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const canManageUsers = hasActionAccess('manage_users');
  const canEditBudget = hasActionAccess('edit_budget');

  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Painel Geral de Recrutamento & Seleção
            </h2>
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-indigo-200">
              Corporativo
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Bem-vindo(a), <strong className="text-slate-800">{user?.name}</strong>. Acompanhe os indicadores operacionais e estratégicos em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
          >
            Atualizar Dados
          </Button>

          {onNavigateToReports && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onNavigateToReports}
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
            >
              Relatórios
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Vagas Abertas"
          value={metrics.totalOpenJobs}
          subtitle="Processos seletivos ativos"
          icon={<Briefcase className="w-5 h-5" />}
          accentColor="indigo"
          trend={{ value: '+2 esta semana', isPositive: true }}
          onClick={onNavigateToJobs}
        />

        <MetricCard
          title="Candidatos Ativos"
          value={metrics.activeProcesses}
          subtitle="Em triagem ou entrevistas"
          icon={<Users className="w-5 h-5" />}
          accentColor="purple"
          trend={{ value: 'Em progresso', neutral: true }}
          onClick={onNavigateToTalentBank}
        />

        <MetricCard
          title="Entrevistas Agendadas"
          value={metrics.scheduledInterviews}
          subtitle="Para esta semana"
          icon={<Calendar className="w-5 h-5" />}
          accentColor="emerald"
          trend={{ value: '3 hoje', isPositive: true }}
          onClick={onNavigateToInterviews}
        />

        <MetricCard
          title="Banco de Talentos"
          value={metrics.talentBankCandidates}
          subtitle="Profissionais mapeados"
          icon={<Award className="w-5 h-5" />}
          accentColor="amber"
          trend={{ value: 'Acervo qualificado', neutral: true }}
          onClick={onNavigateToTalentBank}
        />
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wider font-extrabold text-indigo-300">
              SLA Médio de Fechamento
            </p>
            <h4 className="text-2xl font-black">{metrics.slaAvgDays} Dias</h4>
            <p className="text-[11px] text-slate-300">Meta corporativa: abaixo de 20 dias</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
            <Clock className="w-6 h-6 text-indigo-300" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-emerald-900 to-slate-900 text-white flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-300">
              Taxa de Aceite de Proposta
            </p>
            <h4 className="text-2xl font-black">{metrics.offerAcceptanceRate}%</h4>
            <p className="text-[11px] text-slate-300">Efetividade na fase final do funil</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
            <TrendingUp className="w-6 h-6 text-emerald-300" />
          </div>
        </Card>
      </div>

      {/* Main Content Layout: Alerts & Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Department Breakdown */}
          <DepartmentBreakdownCard departments={departments} />

          {/* Responsible Performance */}
          <ResponsibleBreakdownCard responsibles={responsibles} />
        </div>

        <div className="space-y-6">
          {/* Pending Alerts */}
          <PendingAlertsCard
            alerts={alerts}
            onResolveAlert={handleResolveAlert}
            canManageAlerts={canEditBudget || canManageUsers}
          />

          {/* Funnel Overview */}
          <FunnelOverviewCard steps={funnelSteps} />
        </div>
      </div>
    </div>
  );
};
