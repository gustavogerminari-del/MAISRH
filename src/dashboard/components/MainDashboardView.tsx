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
  CheckCircle2,
  Sparkles,
  UserCheck
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#1E293B] tracking-tight">
              Dashboard Corporativo
            </h2>
            <span className="bg-blue-50 text-[#2563EB] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200">
              SaaS MAIS RH
            </span>
          </div>
          <p className="text-xs text-[#64748B] font-medium">
            Bem-vindo(a), <strong className="text-[#1E293B]">{user?.name}</strong>. Visão geral e limpa dos indicadores de RH.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            className="border-[#E5E7EB] text-[#1E293B] hover:bg-[#F8FAFC]"
          >
            Atualizar Dados
          </Button>

          {onNavigateToReports && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onNavigateToReports}
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5" />}
              className="bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
            >
              Relatórios
            </Button>
          )}
        </div>
      </div>

      {/* Official 5 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Vagas Abertas */}
        <MetricCard
          title="Vagas Abertas"
          value={metrics.totalOpenJobs}
          subtitle="Processos ativos"
          icon={<Briefcase className="w-5 h-5 text-[#2563EB]" />}
          accentColor="blue"
          trend={{ value: '+2 esta semana', isPositive: true }}
          onClick={onNavigateToJobs}
        />

        {/* 2. Candidatos */}
        <MetricCard
          title="Candidatos"
          value={metrics.activeProcesses}
          subtitle="Cadastrados no funil"
          icon={<Users className="w-5 h-5 text-[#2563EB]" />}
          accentColor="blue"
          trend={{ value: 'Em análise', neutral: true }}
          onClick={onNavigateToTalentBank}
        />

        {/* 3. Entrevistas */}
        <MetricCard
          title="Entrevistas"
          value={metrics.scheduledInterviews}
          subtitle="Agendadas na semana"
          icon={<Calendar className="w-5 h-5 text-[#2563EB]" />}
          accentColor="blue"
          trend={{ value: '3 hoje', isPositive: true }}
          onClick={onNavigateToInterviews}
        />

        {/* 4. Contratações */}
        <MetricCard
          title="Contratações"
          value={14}
          subtitle="Finalizadas este mês"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          accentColor="emerald"
          trend={{ value: '100% da meta', isPositive: true }}
        />

        {/* 5. Indicadores IA (Gold Premium #B8963E) */}
        <Card
          className="p-4 flex flex-col justify-between space-y-3 bg-white border border-[#E5E7EB] hover:border-[#B8963E]/40 transition-all cursor-pointer group shadow-2xs"
          onClick={onNavigateToReports}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-black text-[#B8963E] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Indicadores IA
              </p>
              <h4 className="text-2xl font-black text-[#1E293B] mt-1 leading-none">
                94.8%
              </h4>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#B8963E]/10 border border-[#B8963E]/30 text-[#B8963E] flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E5E7EB]">
            <span className="text-[#64748B] text-[11px]">Aderência Preditiva</span>
            <span className="bg-[#B8963E]/10 text-[#B8963E] text-[10px] font-bold px-1.5 py-0.2 rounded">
              Alta Precisão
            </span>
          </div>
        </Card>
      </div>

      {/* Secondary Performance SLA Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 bg-white border border-[#E5E7EB] flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wider font-extrabold text-[#64748B]">
              SLA Médio de Fechamento de Vagas
            </p>
            <h4 className="text-2xl font-black text-[#1E293B]">{metrics.slaAvgDays} Dias</h4>
            <p className="text-xs text-[#64748B]">Meta corporativa: abaixo de 20 dias</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-5 bg-white border border-[#E5E7EB] flex items-center justify-between shadow-2xs">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wider font-extrabold text-[#64748B]">
              Taxa de Aceite de Proposta
            </p>
            <h4 className="text-2xl font-black text-[#1E293B]">{metrics.offerAcceptanceRate}%</h4>
            <p className="text-xs text-[#64748B]">Efetividade na contratação de talentos</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Main Content Layout: Breakdown & Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DepartmentBreakdownCard departments={departments} />
          <ResponsibleBreakdownCard responsibles={responsibles} />
        </div>

        <div className="space-y-6">
          <PendingAlertsCard
            alerts={alerts}
            onResolveAlert={handleResolveAlert}
            canManageAlerts={canEditBudget || canManageUsers}
          />
          <FunnelOverviewCard steps={funnelSteps} />
        </div>
      </div>
    </div>
  );
};

