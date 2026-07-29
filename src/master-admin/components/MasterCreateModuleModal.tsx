import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Sliders, 
  Sparkles, 
  Bot, 
  Check, 
  Layers, 
  Code, 
  Clock, 
  Users, 
  ShieldCheck, 
  Award, 
  Zap, 
  BarChart3, 
  FileText,
  Briefcase,
  Crown,
  Search,
  Globe,
  Building2,
  UserPlus,
  Gift,
  Calculator,
  Calendar,
  UserX,
  ShieldAlert,
  UserCheck,
  Target,
  CreditCard,
  Settings,
  LayoutDashboard,
  Link as LinkIcon,
  CalendarDays
} from 'lucide-react';
import { PlatformModule, ModuleCategory, ModuleStatus } from '../types/master';

interface MasterCreateModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (moduleData: PlatformModule) => void;
  initialModule?: PlatformModule | null;
}

const CATEGORY_OPTIONS: ModuleCategory[] = [
  'Recrutamento',
  'Headhunter',
  'Departamento Pessoal',
  'Financeiro',
  'Portal',
  'IA',
  'Relatórios',
  'Ferramentas',
  'Integrações',
  'Segurança',
  'DP',
  'Ponto',
  'Folha',
  'Benefícios',
  'Gestão'
];

const STATUS_OPTIONS: ModuleStatus[] = [
  'Ativo',
  'Beta',
  'Em Desenvolvimento',
  'Desativado',
  'Inativo'
];

const MODULE_TYPES = ['Core', 'Opcional', 'Beta', 'Integração', 'Addon'] as const;

const PLAN_OPTIONS = ['Básico', 'Intermediário', 'Completo / Enterprise', 'Todos'] as const;

const ICON_PRESETS = [
  { name: 'Briefcase', icon: Briefcase, label: 'Vagas (R&S)' },
  { name: 'Crown', icon: Crown, label: 'Headhunter' },
  { name: 'Search', icon: Search, label: 'Talentos' },
  { name: 'Sparkles', icon: Sparkles, label: 'IA Gemini' },
  { name: 'Globe', icon: Globe, label: 'Portal Vagas' },
  { name: 'Building2', icon: Building2, label: 'DP Geral' },
  { name: 'Users', icon: Users, label: 'Colaboradores' },
  { name: 'UserPlus', icon: UserPlus, label: 'Admissão' },
  { name: 'Gift', icon: Gift, label: 'Benefícios' },
  { name: 'Clock', icon: Clock, label: 'Ponto' },
  { name: 'Calculator', icon: Calculator, label: 'Folha' },
  { name: 'Calendar', icon: Calendar, label: 'Férias' },
  { name: 'UserX', icon: UserX, label: 'Rescisão' },
  { name: 'FileText', icon: FileText, label: 'Documentos' },
  { name: 'ShieldCheck', icon: ShieldCheck, label: 'SST' },
  { name: 'UserCheck', icon: UserCheck, label: 'Portal Func.' },
  { name: 'Target', icon: Target, label: 'Desempenho' },
  { name: 'CreditCard', icon: CreditCard, label: 'Financeiro' },
  { name: 'BarChart3', icon: BarChart3, label: 'Analytics' },
  { name: 'Settings', icon: Settings, label: 'Configurações' },
  { name: 'LayoutDashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { name: 'LinkIcon', icon: LinkIcon, label: 'Integrações' },
  { name: 'CalendarDays', icon: CalendarDays, label: 'Agenda' },
  { name: 'ShieldAlert', icon: ShieldAlert, label: 'Auditoria' },
];

export const MasterCreateModuleModal: React.FC<MasterCreateModuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialModule
}) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<ModuleCategory>('Recrutamento');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ModuleStatus>('Ativo');
  const [version, setVersion] = useState('v1.0.0');
  const [moduleType, setModuleType] = useState<PlatformModule['moduleType']>('Opcional');
  const [isCore, setIsCore] = useState(false);
  const [isBeta, setIsBeta] = useState(false);
  const [iconName, setIconName] = useState('Briefcase');
  const [route, setRoute] = useState('vagas');
  const [requiredPlan, setRequiredPlan] = useState('Básico');
  const [activeTenantsCount, setActiveTenantsCount] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialModule) {
      setName(initialModule.name);
      setKey(initialModule.key);
      setSlug(initialModule.slug || initialModule.key);
      setCategory(initialModule.category);
      setDescription(initialModule.description);
      setStatus(initialModule.status);
      setVersion(initialModule.version || 'v1.0.0');
      setModuleType(initialModule.moduleType || (initialModule.isCore ? 'Core' : 'Opcional'));
      setIsCore(initialModule.isCore);
      setIsBeta(initialModule.isBeta || initialModule.status === 'Beta');
      setIconName(initialModule.iconName || 'Briefcase');
      setRoute(initialModule.route || 'vagas');
      setRequiredPlan(initialModule.requiredPlan || 'Básico');
      setActiveTenantsCount(initialModule.activeTenantsCount || 1);
    } else {
      setName('');
      setKey('');
      setSlug('');
      setCategory('Recrutamento');
      setDescription('');
      setStatus('Ativo');
      setVersion('v1.0.0');
      setModuleType('Opcional');
      setIsCore(false);
      setIsBeta(false);
      setIconName('Briefcase');
      setRoute('vagas');
      setRequiredPlan('Básico');
      setActiveTenantsCount(1);
    }
    setError('');
  }, [initialModule, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!initialModule) {
      const generatedKey = val
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '-')
        .toLowerCase()
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setKey(generatedKey || 'novo-modulo');
      setSlug(generatedKey || 'novo-modulo');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do módulo é obrigatório.');
      return;
    }
    if (!key.trim()) {
      setError('A chave técnica (key) é obrigatória.');
      return;
    }

    const savedModule: PlatformModule = {
      id: initialModule?.id || `mod-${Date.now()}`,
      key: key.trim().toLowerCase(),
      slug: (slug.trim() || key.trim()).toLowerCase(),
      name: name.trim(),
      category,
      description: description.trim() || 'Módulo funcional ativo na plataforma MAIS RH.',
      status,
      version: version.trim() || 'v1.0.0',
      moduleType,
      isCore: isCore || moduleType === 'Core',
      isBeta: isBeta || status === 'Beta',
      isVisible: true,
      isInstalled: true,
      allowActivation: !isCore,
      allowDeactivation: !isCore,
      requiredModules: initialModule?.requiredModules || [],
      requiredPlan,
      totalCompaniesUsing: Number(activeTenantsCount) || 1,
      activeTenantsCount: Number(activeTenantsCount) || 1,
      displayOrder: initialModule?.displayOrder || 99,
      iconName,
      route: route.trim() || 'vagas',
      createdAt: initialModule?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      createdBy: initialModule?.createdBy || 'Master Admin'
    };

    onSave(savedModule);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl text-white shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Assistente de Módulos MAIS RH
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">
                {initialModule ? `Editar Módulo: ${initialModule.name}` : 'Criar Novo Módulo Funcional'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl font-bold">
              {error}
            </div>
          )}

          {/* Grid Name and Key */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Nome do Módulo <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="Ex: Headhunter Executivo, SST, Ponto Digital"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Chave Técnica / Slug <span className="text-amber-400">*</span></span>
                <span className="text-[10px] text-slate-500 font-normal">Identificador único</span>
              </label>
              <div className="relative">
                <Code className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value);
                    setSlug(e.target.value);
                  }}
                  placeholder="Ex: headhunter, ponto-digital"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Category, Status, Version & Route */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold focus:outline-none focus:border-amber-500"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setStatus(val);
                  if (val === 'Beta') setIsBeta(true);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold focus:outline-none focus:border-amber-500"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Versão</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.0.0"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Rota da Página</label>
              <input
                type="text"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                placeholder="vagas, headhunter..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-amber-300 font-mono font-semibold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Module Type & Plan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Tipo do Módulo</label>
              <select
                value={moduleType}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setModuleType(val);
                  if (val === 'Core') setIsCore(true);
                  if (val === 'Beta') setIsBeta(true);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold focus:outline-none focus:border-amber-500"
              >
                {MODULE_TYPES.map((mt) => (
                  <option key={mt} value={mt}>{mt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Plano Mínimo Requerido</label>
              <select
                value={requiredPlan}
                onChange={(e) => setRequiredPlan(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold focus:outline-none focus:border-amber-500"
              >
                {PLAN_OPTIONS.map((pl) => (
                  <option key={pl} value={pl}>{pl}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block font-bold text-slate-300 mb-2">Ícone Representativo</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-950/50 rounded-xl border border-slate-800/80">
              {ICON_PRESETS.map((item) => {
                const IconComp = item.icon;
                const isSelected = iconName === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIconName(item.name)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                    <span className="text-[9px] font-bold truncate max-w-full">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">Descrição do Módulo</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva as funcionalidades e objetivos operacionais deste módulo..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-medium focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Checkboxes Core & Beta */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isCore}
                onChange={(e) => {
                  setIsCore(e.target.checked);
                  if (e.target.checked) setModuleType('Core');
                }}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700"
              />
              <div>
                <span className="font-bold text-white block">Módulo Obrigatório (CORE)</span>
                <span className="text-[10px] text-slate-400 block">Não poderá ser desativado globalmente.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isBeta}
                onChange={(e) => setIsBeta(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700"
              />
              <div>
                <span className="font-bold text-white block">Selo BETA</span>
                <span className="text-[10px] text-slate-400 block">Sinaliza funcionalidade em teste.</span>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{initialModule ? 'Salvar Alterações' : 'Criar Módulo'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

