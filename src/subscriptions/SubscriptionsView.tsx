import React, { useState } from 'react';
import { 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Lock, 
  Unlock, 
  DollarSign, 
  PlusCircle, 
  ShieldCheck, 
  Sparkles, 
  Sliders, 
  Zap,
  Calendar,
  FileText
} from 'lucide-react';
import { ClientSubscription, BillingInvoice, PlanTier, ModuleAccessConfig } from './types';
import { MOCK_INVOICES } from './mockData';
import { getSubscriptions, addSubscription, saveSubscriptionsToStorage } from './subscriptionsStore';
import { saveTenant } from '../master-admin/masterTenantsStore';

export const SubscriptionsView: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<ClientSubscription[]>(() => getSubscriptions());
  const [invoices, setInvoices] = useState<BillingInvoice[]>(MOCK_INVOICES);
  const [selectedSubForEdit, setSelectedSubForEdit] = useState<ClientSubscription | null>(null);

  // New Subscription Modal
  const [showNewSubModal, setShowNewSubModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCnpj, setNewCnpj] = useState('');
  const [newPlanTier, setNewPlanTier] = useState<PlanTier>('Professional');
  const [newMrrValue, setNewMrrValue] = useState(1200);

  // Calculate MRR & ARR
  const totalMRR = subscriptions.reduce((acc, s) => acc + s.mrrValue, 0);
  const totalARR = totalMRR * 12;
  const expiringSoonSubs = subscriptions.filter(s => {
    const exp = new Date(s.contractExpiration);
    const now = new Date();
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 35 && diffDays >= 0;
  });

  // Toggle Module Permission
  const handleToggleModule = (subId: string, moduleKey: keyof ModuleAccessConfig) => {
    const nextSubs = subscriptions.map(s => {
      if (s.id === subId) {
        return {
          ...s,
          modulesEnabled: {
            ...s.modulesEnabled,
            [moduleKey]: !s.modulesEnabled[moduleKey]
          }
        };
      }
      return s;
    });
    saveSubscriptionsToStorage(nextSubs);
    setSubscriptions(nextSubs);
  };

  const handleCreateSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName) return;

    const newSub: ClientSubscription = {
      id: `sub-${Date.now()}`,
      companyName: newCompanyName,
      cnpj: newCnpj || '00.000.000/0001-00',
      planTier: newPlanTier,
      mrrValue: newMrrValue,
      billingCycle: 'Mensal',
      contractStart: new Date().toISOString().split('T')[0],
      contractExpiration: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
      paymentStatus: 'Em Dia / Ativo',
      modulesEnabled: {
        vagas: true,
        bancoTalentos: true,
        entrevistas: true,
        equipeInterna: true,
        consultoriaRH: newPlanTier === 'Enterprise' || newPlanTier === 'Custom Consultoria',
        feriasBeneficios: true,
        documentosAssinatura: true,
        auditoriaLogs: newPlanTier === 'Enterprise'
      },
      userLimit: newPlanTier === 'Enterprise' ? 50 : 10,
      activeUsersCount: 1,
      lastPaymentDate: new Date().toISOString().split('T')[0],
      nextRenewalDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]
    };

    const updatedSubs = addSubscription(newSub);
    setSubscriptions(updatedSubs);

    // Sync with Master Admin Tenant store
    saveTenant({
      id: `t-${Date.now()}`,
      code: newCompanyName.substring(0, 5).toUpperCase().replace(/\s/g, ''),
      companyName: newCompanyName,
      tradeName: newCompanyName,
      cnpj: newCnpj || '00.000.000/0001-00',
      ownerName: 'Administrador ' + newCompanyName,
      ownerEmail: `contato@${newCompanyName.toLowerCase().replace(/\s/g, '')}.com.br`,
      ownerPhone: '(11) 99999-9999',
      status: 'Ativo',
      maxUsers: newSub.userLimit,
      maxActiveJobs: 20,
      modules: {
        vagas: true,
        bancoTalentos: true,
        entrevistas: true,
        equipeInterna: true,
        consultorRH: newSub.modulesEnabled.consultoriaRH,
        feriasBeneficios: true,
        documentosAssinatura: true,
        auditoriaLogs: newSub.modulesEnabled.auditoriaLogs,
        relatoriosAvancados: true,
        siteVagasPersonalizado: true
      },
      branding: {
        primaryColor: '#2563EB',
        companyDisplayName: newCompanyName
      },
      metrics: {
        activeUsersCount: 1,
        totalJobsCreated: 0,
        totalTalentsStored: 0,
        totalDocumentsSigned: 0,
        storageUsedMB: 10,
        lastLoginAt: 'Hoje'
      },
      contract: {
        id: `ctr-${Date.now()}`,
        contractNumber: `CTR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        planName: newPlanTier as any,
        monthlyFee: newMrrValue,
        billingCycle: 'Mensal',
        startDate: newSub.contractStart,
        expirationDate: newSub.contractExpiration,
        paymentMethod: 'Pix',
        autoRenew: true
      },
      createdAt: new Date().toISOString().split('T')[0],
      notes: 'Cadastrada através do painel de Assinaturas & Módulos'
    });

    setShowNewSubModal(false);
    setNewCompanyName('');
    setNewCnpj('');
  };

  return (
    <div className="space-y-6">
      {/* SaaS Revenue Metrics Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              Painel de Assinaturas & Faturamento SaaS MAIS RH
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Gestão de Contratos de Clientes & Módulos</h2>
            <p className="text-xs text-indigo-200 mt-0.5">
              Liberação e bloqueio dinâmico de recursos por cliente, controle de renovações de planos e receita recorrente.
            </p>
          </div>

          <button
            onClick={() => setShowNewSubModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start sm:self-center"
          >
            <PlusCircle className="w-4 h-4" />
            Ativar Nova Empresa Cliente
          </button>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-xs border border-white/10">
            <span className="text-xs text-indigo-200 font-semibold">MRR (Receita Mensal Recorrente)</span>
            <p className="text-2xl font-extrabold text-white mt-1">
              R$ {totalMRR.toLocaleString('pt-BR')} <span className="text-xs text-indigo-300 font-normal">/mês</span>
            </p>
          </div>

          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-xs border border-white/10">
            <span className="text-xs text-indigo-200 font-semibold">ARR (Projeção Anual Recorrente)</span>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">
              R$ {totalARR.toLocaleString('pt-BR')} <span className="text-xs text-emerald-300 font-normal">/ano</span>
            </p>
          </div>

          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-xs border border-white/10">
            <span className="text-xs text-indigo-200 font-semibold">Contratos Ativos</span>
            <p className="text-2xl font-extrabold text-white mt-1">
              {subscriptions.length} <span className="text-xs text-indigo-300 font-normal">empresas parceiras</span>
            </p>
          </div>
        </div>
      </div>

      {/* Renewal Warning Banner */}
      {expiringSoonSubs.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">Alerta de Renovação Contratual para o Proprietário</h4>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Existem <strong>{expiringSoonSubs.length} contratos de clientes</strong> vencendo nos próximos 30 dias. Entre em contato para renovação de licença.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Cards & Module Permissions */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Empresas Assinantes & Ativação de Módulos</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4 hover:border-indigo-300 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Plano {sub.planTier}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      sub.paymentStatus === 'Em Dia / Ativo' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {sub.paymentStatus}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mt-2">{sub.companyName}</h4>
                  <p className="text-xs text-slate-500">CNPJ: {sub.cnpj}</p>
                </div>

                <div className="text-right">
                  <span className="text-xl font-extrabold text-slate-900 block">
                    R$ {sub.mrrValue.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Faturamento {sub.billingCycle}</span>
                </div>
              </div>

              {/* Users & Expiration */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Licenças de Usuário</span>
                  <span className="font-semibold text-slate-800">{sub.activeUsersCount} / {sub.userLimit} ativas</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Vencimento do Contrato</span>
                  <span className="font-bold text-indigo-700">{sub.contractExpiration}</span>
                </div>
              </div>

              {/* Module Lock/Unlock Matrix */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  Módulos Habilitados no Contrato:
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleToggleModule(sub.id, 'vagas')}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      sub.modulesEnabled.vagas ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>Vagas & Recrutamento</span>
                    {sub.modulesEnabled.vagas ? <Unlock className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-slate-400" />}
                  </button>

                  <button
                    onClick={() => handleToggleModule(sub.id, 'bancoTalentos')}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      sub.modulesEnabled.bancoTalentos ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>Banco de Talentos</span>
                    {sub.modulesEnabled.bancoTalentos ? <Unlock className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-slate-400" />}
                  </button>

                  <button
                    onClick={() => handleToggleModule(sub.id, 'consultoriaRH')}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      sub.modulesEnabled.consultoriaRH ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>Consultor de RH</span>
                    {sub.modulesEnabled.consultoriaRH ? <Unlock className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-slate-400" />}
                  </button>

                  <button
                    onClick={() => handleToggleModule(sub.id, 'feriasBeneficios')}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      sub.modulesEnabled.feriasBeneficios ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>Férias & Benefícios</span>
                    {sub.modulesEnabled.feriasBeneficios ? <Unlock className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-slate-400" />}
                  </button>

                  <button
                    onClick={() => handleToggleModule(sub.id, 'documentosAssinatura')}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      sub.modulesEnabled.documentosAssinatura ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>Assinatura Digital</span>
                    {sub.modulesEnabled.documentosAssinatura ? <Unlock className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-slate-400" />}
                  </button>

                  <button
                    onClick={() => handleToggleModule(sub.id, 'auditoriaLogs')}
                    className={`p-2 rounded-lg border text-left flex items-center justify-between transition-all ${
                      sub.modulesEnabled.auditoriaLogs ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>Auditoria & Logs</span>
                    {sub.modulesEnabled.auditoriaLogs ? <Unlock className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-slate-400" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: NOVA EMPRESA CLIENTE */}
      {showNewSubModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Cadastrar Nova Empresa Assinante</h3>

            <form onSubmit={handleCreateSub} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Razão Social / Empresa *</label>
                <input
                  type="text"
                  required
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="Ex: TechCorp Inovações"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CNPJ *</label>
                <input
                  type="text"
                  required
                  value={newCnpj}
                  onChange={(e) => setNewCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Plano Contratado *</label>
                  <select
                    value={newPlanTier}
                    onChange={(e) => setNewPlanTier(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Custom Consultoria">Custom Consultoria</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Valor Mensal (R$) *</label>
                  <input
                    type="number"
                    required
                    value={newMrrValue}
                    onChange={(e) => setNewMrrValue(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewSubModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
                >
                  Ativar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
