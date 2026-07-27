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
  HelpCircle
} from 'lucide-react';
import { PlatformModule } from '../types/master';

interface MasterCreateModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (moduleData: PlatformModule) => void;
  initialModule?: PlatformModule | null;
}

const CATEGORY_OPTIONS: PlatformModule['category'][] = [
  'Recrutamento',
  'DP',
  'Ponto',
  'Folha',
  'Benefícios',
  'Gestão'
];

const STATUS_OPTIONS: PlatformModule['status'][] = [
  'Ativo',
  'Beta',
  'Em Desenvolvimento',
  'Inativo'
];

const ICON_PRESETS = [
  { name: 'Bot', icon: Bot, label: 'IA / Bot' },
  { name: 'Sparkles', icon: Sparkles, label: 'Inteligência' },
  { name: 'Sliders', icon: Sliders, label: 'Configurações' },
  { name: 'Clock', icon: Clock, label: 'Ponto / Tempo' },
  { name: 'Users', icon: Users, label: 'Pessoas / Equipes' },
  { name: 'ShieldCheck', icon: ShieldCheck, label: 'Segurança' },
  { name: 'Award', icon: Award, label: 'Desempenho' },
  { name: 'Zap', icon: Zap, label: 'Automação' },
  { name: 'BarChart3', icon: BarChart3, label: 'Analytics' },
  { name: 'FileText', icon: FileText, label: 'Documentos' },
  { name: 'Briefcase', icon: Briefcase, label: 'Vagas' },
];

export const MasterCreateModuleModal: React.FC<MasterCreateModuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialModule
}) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [category, setCategory] = useState<PlatformModule['category']>('Recrutamento');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<PlatformModule['status']>('Ativo');
  const [isCore, setIsCore] = useState(false);
  const [iconName, setIconName] = useState('Bot');
  const [activeTenantsCount, setActiveTenantsCount] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialModule) {
      setName(initialModule.name);
      setKey(initialModule.key);
      setCategory(initialModule.category);
      setDescription(initialModule.description);
      setStatus(initialModule.status);
      setIsCore(initialModule.isCore);
      setIconName(initialModule.iconName || 'Bot');
      setActiveTenantsCount(initialModule.activeTenantsCount || 1);
    } else {
      setName('');
      setKey('');
      setCategory('Recrutamento');
      setDescription('');
      setStatus('Ativo');
      setIsCore(false);
      setIconName('Bot');
      setActiveTenantsCount(1);
    }
    setError('');
  }, [initialModule, isOpen]);

  if (!isOpen) return null;

  // Auto generate key from name if creating new
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!initialModule) {
      const generatedKey = val
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, ' ')
        .trim()
        .split(' ')
        .map((word, idx) => idx === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
      setKey(generatedKey || 'novoModulo');
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
      key: key.trim(),
      name: name.trim(),
      category,
      description: description.trim() || 'Módulo funcional adicionado à plataforma MAIS RH.',
      status,
      isCore,
      activeTenantsCount: Number(activeTenantsCount) || 1,
      iconName
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
                Gerenciador da Plataforma
              </span>
              <h3 className="text-lg font-black text-white mt-0.5">
                {initialModule ? 'Editar Módulo' : 'Criar Novo Módulo Funcional'}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
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
                placeholder="Ex: MAIS RH IA, Ponto Facial, Clima"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Chave Técnica (Key) <span className="text-amber-400">*</span></span>
                <span className="text-[10px] text-slate-500 font-normal">Identificador único</span>
              </label>
              <div className="relative">
                <Code className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="Ex: maisRhIa, pontoFacial"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Categoria do Módulo</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold focus:outline-none focus:border-amber-500"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1.5">Status de Lançamento</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-semibold focus:outline-none focus:border-amber-500"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block font-bold text-slate-300 mb-2">Ícone Representativo</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ICON_PRESETS.map((item) => {
                const IconComp = item.icon;
                const isSelected = iconName === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIconName(item.name)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                    <span className="text-[10px] font-bold truncate max-w-full">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">Descrição do Módulo</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva as funcionalidades principais e benefícios do módulo..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-medium focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Checkbox Core & Active tenants */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isCore}
                onChange={(e) => setIsCore(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700"
              />
              <div>
                <span className="font-bold text-white block">Módulo Essencial (Core)</span>
                <span className="text-[11px] text-slate-400 block">
                  Se ativado, este módulo será incluído por padrão em todos os planos comerciais.
                </span>
              </div>
            </label>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="font-semibold text-slate-300">Empresas Habilitadas Inicialmente:</span>
              <input
                type="number"
                min={0}
                value={activeTenantsCount}
                onChange={(e) => setActiveTenantsCount(Number(e.target.value))}
                className="w-24 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-white text-center font-bold"
              />
            </div>
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
