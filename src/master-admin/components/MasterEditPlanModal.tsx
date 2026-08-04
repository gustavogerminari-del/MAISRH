import React, { useState } from 'react';
import { X, Check, Sliders, DollarSign, Users, Briefcase, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import { SaaSPlan, TenantModulePermissions } from '../types/master';

interface MasterEditPlanModalProps {
  plan: SaaSPlan;
  onClose: () => void;
  onSave: (updatedPlan: SaaSPlan) => void;
}

const ALL_MODULES_LIST: { key: keyof TenantModulePermissions; label: string }[] = [
  { key: 'recrutamento', label: 'Módulo de Recrutamento & Seleção (Vagas)' },
  { key: 'bancoTalentos', label: 'Banco de Talentos' },
  { key: 'entrevistas', label: 'Gestão de Entrevistas & Feedbacks' },
  { key: 'equipeInterna', label: 'Equipe Interna & Permissões' },
  { key: 'consultorRH', label: 'Consultor e Parceiros RH' },
  { key: 'feriasBeneficios', label: 'Férias & Benefícios' },
  { key: 'documentosAssinatura', label: 'Documentos Eletrônicos & Assinatura' },
  { key: 'auditoriaLogs', label: 'Auditoria & Logs de Segurança' },
  { key: 'relatoriosAvancados', label: 'Relatórios & Analytics Avançados' },
  { key: 'siteVagasPersonalizado', label: 'Site de Vagas Personalizado' },
];

export const MasterEditPlanModal: React.FC<MasterEditPlanModalProps> = ({
  plan,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(plan.name);
  const [description, setDescription] = useState(plan.description);
  const [monthlyPrice, setMonthlyPrice] = useState(plan.monthlyPrice);
  const [annualDiscountPercent, setAnnualDiscountPercent] = useState(plan.annualDiscountPercent);
  const [maxUsers, setMaxUsers] = useState(plan.maxUsers);
  const [maxActiveJobs, setMaxActiveJobs] = useState(plan.maxActiveJobs);
  const [maxEmployees, setMaxEmployees] = useState(plan.maxEmployees);
  const [status, setStatus] = useState(plan.status);
  const [includedModules, setIncludedModules] = useState<Set<keyof TenantModulePermissions>>(
    new Set(plan.includedModules)
  );

  const toggleModule = (moduleKey: keyof TenantModulePermissions) => {
    const next = new Set(includedModules);
    if (next.has(moduleKey)) {
      next.delete(moduleKey);
    } else {
      next.add(moduleKey);
    }
    setIncludedModules(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...plan,
      name,
      description,
      monthlyPrice: Number(monthlyPrice) || 0,
      annualDiscountPercent: Number(annualDiscountPercent) || 0,
      maxUsers: Number(maxUsers) || 0,
      maxActiveJobs: Number(maxActiveJobs) || 0,
      maxEmployees: Number(maxEmployees) || 0,
      status,
      includedModules: Array.from(includedModules),
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl text-white shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Acesso Master • Gestão SaaS
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">
                Editar Parâmetros do Plano: <span className="text-amber-300">{plan.name}</span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* SECTION 1: INFORMAÇÕES BÁSICAS */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <FileText className="w-4 h-4" /> Informações Gerais do Plano
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nome do Plano *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value as any)}
                  placeholder="Ex: Básico, Intermediário, Enterprise"
                  className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-white outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Status do Plano *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-amber-300 outline-none font-bold"
                >
                  <option value="Ativo">Ativo (Comercializável)</option>
                  <option value="Rascunho">Rascunho (Interno)</option>
                  <option value="Arquivado">Arquivado (Descontinuado)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Descrição / Proposta de Valor</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Ideal para empresas em crescimento..."
                className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-white outline-none resize-none"
              />
            </div>
          </div>

          {/* SECTION 2: PREÇO E COBRANÇA */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <DollarSign className="w-4 h-4" /> Precificação e Descontos
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Preço Mensal Padrão (R$) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-500">R$</span>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    required
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-emerald-400 font-extrabold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Desconto no Plano Anual (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={annualDiscountPercent}
                    onChange={(e) => setAnnualDiscountPercent(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-amber-300 font-extrabold outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-500">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: LIMITES TÉCNICOS E LICENÇAS */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Users className="w-4 h-4" /> Limites operacionais de Recursos
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Limite de Usuários *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={maxUsers}
                  onChange={(e) => setMaxUsers(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-white font-bold outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Contas ativas de usuários</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Limite Vagas Ativas *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={maxActiveJobs}
                  onChange={(e) => setMaxActiveJobs(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-white font-bold outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Vagas abertas simultâneas</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Limite DP / Colaboradores *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={maxEmployees}
                  onChange={(e) => setMaxEmployees(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-amber-500 text-white font-bold outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Colaboradores registrados</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: MÓDULOS INCLUÍDOS */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4" /> Módulos Habilitados no Plano
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ALL_MODULES_LIST.map((m) => {
                const isChecked = includedModules.has(m.key);
                return (
                  <label
                    key={m.key}
                    onClick={() => toggleModule(m.key)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-semibold">{m.label}</span>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                        isChecked ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Salvar Parâmetros do Plano
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
