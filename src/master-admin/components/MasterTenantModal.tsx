import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  ShieldCheck, 
  CreditCard, 
  Palette, 
  Sliders, 
  Check, 
  Sparkles,
  Lock,
  Unlock,
  AlertCircle,
  MapPin,
  UserCheck,
  Key,
  Mail,
  Loader2,
  CheckCircle2,
  Search,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { ClientTenant, MasterPlanPreset, TenantModulePermissions } from '../types/master';
import { PLAN_PRESETS } from '../constants/planPresets';
import { 
  fetchModulosFirestore, 
  fetchPlansFirestore,
  fetchCompanyReleasedModules, 
  saveCompanyReleasedModules, 
  SystemModule,
  INITIAL_SYSTEM_MODULES
} from '../../services/ModuleCatalogService';
import { PLATFORM_MODULE_CATEGORIES } from '../../services/PermissionService';

interface MasterTenantModalProps {
  tenant?: ClientTenant | null;
  onClose: () => void;
  onSave: (tenantData: Partial<ClientTenant>) => void;
  onDelete?: (tenantId: string) => void;
}

export const MasterTenantModal: React.FC<MasterTenantModalProps> = ({
  tenant,
  onClose,
  onSave,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'plano' | 'modulos' | 'branding' | 'contrato'>('geral');

  // Form State - Dados Principais
  const [companyName, setCompanyName] = useState(tenant?.companyName || '');
  const [tradeName, setTradeName] = useState(tenant?.tradeName || '');
  const [cnpj, setCnpj] = useState(tenant?.cnpj || '');
  const [ownerName, setOwnerName] = useState(tenant?.ownerName || '');
  const [ownerEmail, setOwnerEmail] = useState(tenant?.ownerEmail || '');
  const [ownerPhone, setOwnerPhone] = useState(tenant?.ownerPhone || '');
  const [status, setStatus] = useState(tenant?.status || 'Ativo');

  // Form State - Novos Campos de Endereço
  const [cep, setCep] = useState(tenant?.address?.cep || '');
  const [street, setStreet] = useState(tenant?.address?.street || '');
  const [number, setNumber] = useState(tenant?.address?.number || '');
  const [complement, setComplement] = useState(tenant?.address?.complement || '');
  const [neighborhood, setNeighborhood] = useState(tenant?.address?.neighborhood || '');
  const [cityUf, setCityUf] = useState(tenant?.address?.cityUf || '');
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepSuccessMsg, setCepSuccessMsg] = useState('');

  // Form State - Novos Campos de Acesso do Administrador
  const [adminEmail, setAdminEmail] = useState(tenant?.adminCredentials?.adminEmail || tenant?.ownerEmail || '');
  const [initialPassword, setInitialPassword] = useState(tenant?.adminCredentials?.initialPassword || '');
  const [confirmPassword, setConfirmPassword] = useState(tenant?.adminCredentials?.initialPassword || '');
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(tenant?.adminCredentials?.sendWelcomeEmail ?? true);

  // Validation State
  const [validationError, setValidationError] = useState('');

  // Plan & Limits
  const [selectedPlan, setSelectedPlan] = useState<MasterPlanPreset>(tenant?.contract.planName || 'Intermediário');
  const [monthlyFee, setMonthlyFee] = useState<number>(tenant?.contract.monthlyFee || 1290);
  const [maxUsers, setMaxUsers] = useState<number>(tenant?.maxUsers || 15);
  const [maxActiveJobs, setMaxActiveJobs] = useState<number>(tenant?.maxActiveJobs || 20);

  // Modules Catalog & Async State
  const [catalogModules, setCatalogModules] = useState<SystemModule[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState<boolean>(false);
  const [modulesError, setModulesError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Modules Selection
  const [modules, setModules] = useState<TenantModulePermissions>(
    tenant?.modules || {
      vagas: true,
      headhunter: true,
      bancoTalentos: true,
      entrevistas: true,
      equipeInterna: true,
      consultorRH: false,
      feriasBeneficios: true,
      documentosAssinatura: true,
      auditoriaLogs: false,
      relatoriosAvancados: true,
      siteVagasPersonalizado: true
    }
  );

  // Load dynamic catalog from Firestore 'modulos' and company released modules
  const loadCatalogAndCompanyModules = async () => {
    setIsLoadingModules(true);
    setModulesError(null);
    try {
      // 1. Consultar a coleção 'modulos' no Firestore
      const catalog = await fetchModulosFirestore();
      setCatalogModules(catalog);

      // 2. Consultar os módulos liberados para a empresa
      let released: Record<string, boolean> = {};
      if (tenant?.id) {
        released = await fetchCompanyReleasedModules(tenant.id);
      } else if (tenant?.modules) {
        released = tenant.modules as Record<string, boolean>;
      }

      setModules(prev => {
        const next = { ...prev } as Record<string, boolean>;
        catalog.forEach(mod => {
          if (released[mod.key] !== undefined) {
            next[mod.key] = released[mod.key];
          } else if (next[mod.key] === undefined) {
            // Módulo novo no catálogo aparece bloqueado por padrão para empresas antigas
            next[mod.key] = false;
          }
        });
        return next as unknown as TenantModulePermissions;
      });
    } catch (err: any) {
      console.warn('⚠️ [Aviso ao carregar módulos do catálogo/empresa]:', err);
      // Fallback para o catálogo inicial do sistema para garantir edição sem travamento
      setCatalogModules(INITIAL_SYSTEM_MODULES);
      setModulesError(null);
    } finally {
      setIsLoadingModules(false);
    }
  };

  useEffect(() => {
    loadCatalogAndCompanyModules();
  }, [tenant?.id]);

  // Branding
  const [primaryColor, setPrimaryColor] = useState(tenant?.branding.primaryColor || '#4F46E5');
  const [companyDisplayName, setCompanyDisplayName] = useState(tenant?.branding.companyDisplayName || '');
  const [customDomain, setCustomDomain] = useState(tenant?.branding.customDomain || '');

  // Contract Details
  const [billingCycle, setBillingCycle] = useState<'Mensal' | 'Trimestral' | 'Anual'>(tenant?.contract.billingCycle || 'Mensal');
  const [paymentMethod, setPaymentMethod] = useState<'Boleto Bancário' | 'Cartão de Crédito' | 'Pix' | 'Faturamento Direct'>(tenant?.contract.paymentMethod || 'Pix');
  const [expirationDate, setExpirationDate] = useState(tenant?.contract.expirationDate || '2027-01-01');
  const [notes, setNotes] = useState(tenant?.notes || '');

  // CEP Auto-fill Logic via ViaCEP
  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawVal = e.target.value.replace(/\D/g, '');
    if (rawVal.length > 8) rawVal = rawVal.substring(0, 8);

    let formatted = rawVal;
    if (rawVal.length > 5) {
      formatted = `${rawVal.substring(0, 5)}-${rawVal.substring(5)}`;
    }
    setCep(formatted);
    setCepSuccessMsg('');
    setValidationError('');

    if (rawVal.length === 8) {
      setIsLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${rawVal}/json/`);
        const data = await response.json();
        if (!data.erro) {
          if (data.logradouro) setStreet(data.logradouro);
          if (data.bairro) setNeighborhood(data.bairro);
          if (data.localidade && data.uf) setCityUf(`${data.localidade} / ${data.uf}`);
          setCepSuccessMsg('Endereço localizado e preenchido automaticamente!');
        } else {
          setCepSuccessMsg('CEP não localizado. Por favor, preencha o endereço manualmente.');
        }
      } catch (err) {
        console.error('Erro ao consultar ViaCEP:', err);
        setCepSuccessMsg('Não foi possível buscar o CEP automaticamente. Preencha manualmente.');
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  const handleOwnerEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOwnerEmail(val);
    if (!adminEmail || adminEmail === ownerEmail) {
      setAdminEmail(val);
    }
  };

  // Apply Plan Preset Button
  const handleApplyPreset = async (presetName: MasterPlanPreset) => {
    const preset = PLAN_PRESETS.find(p => p.id === presetName);
    if (preset) {
      setSelectedPlan(preset.id);
      setMonthlyFee(preset.suggestedPriceMonthly);
      setMaxUsers(preset.maxUsers);
      setMaxActiveJobs(preset.maxActiveJobs);

      try {
        const remotePlans = await fetchPlansFirestore();
        const foundPlan = remotePlans.find(p => p.id.toLowerCase() === preset.id.toLowerCase());
        if (foundPlan && Array.isArray(foundPlan.modulos)) {
          const planModulesMap: Record<string, boolean> = {};
          catalogModules.forEach(m => {
            planModulesMap[m.key] = foundPlan.modulos.includes(m.key);
          });
          setModules(planModulesMap as unknown as TenantModulePermissions);
          return;
        }
      } catch (err) {
        console.warn('Erro ao carregar do Firestore a lista de módulos do plano, aplicando preset local:', err);
      }

      setModules({ ...preset.modules });
    }
  };

  const handleToggleModule = (modKey: keyof TenantModulePermissions) => {
    setModules(prev => ({
      ...prev,
      [modKey]: !prev[modKey]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSaveError(null);

    // Mandatory Field Validations
    if (!companyName.trim()) {
      setValidationError('Razão Social é obrigatória.');
      setActiveTab('geral');
      return;
    }
    if (!cnpj.trim()) {
      setValidationError('CNPJ é obrigatório.');
      setActiveTab('geral');
      return;
    }
    if (!ownerName.trim()) {
      setValidationError('Nome do Gestor é obrigatório.');
      setActiveTab('geral');
      return;
    }
    if (!ownerEmail.trim()) {
      setValidationError('E-mail Principal do Gestor é obrigatório.');
      setActiveTab('geral');
      return;
    }

    // Address Mandatory Validation
    if (!cep.trim() || !street.trim() || !number.trim() || !neighborhood.trim() || !cityUf.trim()) {
      setValidationError('Por favor, preencha todos os campos obrigatórios de endereço (CEP, Logradouro, Número, Bairro, Cidade / UF).');
      setActiveTab('geral');
      return;
    }

    // Admin Credentials Validation
    if (!adminEmail.trim()) {
      setValidationError('E-mail de Acesso do Administrador é obrigatório.');
      setActiveTab('geral');
      return;
    }

    if (!tenant) {
      // New Tenant
      if (!initialPassword) {
        setValidationError('Informe a Senha Inicial para o usuário Administrador.');
        setActiveTab('geral');
        return;
      }
      if (initialPassword !== confirmPassword) {
        setValidationError('A Senha Inicial e a Confirmação de Senha não coincidem.');
        setActiveTab('geral');
        return;
      }
    } else {
      // Existing Tenant Edit - if password typed, check match
      if (initialPassword && initialPassword !== confirmPassword) {
        setValidationError('A Senha Inicial e a Confirmação de Senha não coincidem.');
        setActiveTab('geral');
        return;
      }
    }

    const tenantId = tenant?.id || `t-${Date.now()}`;
    setIsSaving(true);

    try {
      // 1. Salvar os módulos liberados da empresa em 'empresa_modulos/{empresaId}' no Firestore
      try {
        await saveCompanyReleasedModules(tenantId, modules as Record<string, boolean>);
      } catch (modErr) {
        console.warn('Aviso ao sincronizar módulos da empresa no Firestore:', modErr);
      }

      // 2. Chamar handler de salvamento no app
      await onSave({
        id: tenantId,
        code: tenant?.code || companyName.substring(0, 5).toUpperCase().replace(/\s/g, ''),
        companyName,
        tradeName: tradeName || companyName,
        cnpj,
        ownerName,
        ownerEmail,
        ownerPhone,
        address: {
          cep,
          street,
          number,
          complement,
          neighborhood,
          cityUf
        },
        adminCredentials: {
          adminEmail,
          initialPassword: initialPassword || tenant?.adminCredentials?.initialPassword || '••••••••',
          sendWelcomeEmail,
          createdAt: new Date().toISOString()
        },
        status,
        maxUsers,
        maxActiveJobs,
        modules,
        branding: {
          primaryColor,
          companyDisplayName: companyDisplayName || tradeName || companyName,
          customDomain
        },
        metrics: tenant?.metrics || {
          activeUsersCount: 1,
          totalJobsCreated: 0,
          totalTalentsStored: 0,
          totalDocumentsSigned: 0,
          storageUsedMB: 10,
          lastLoginAt: 'Nunca'
        },
        contract: {
          id: tenant?.contract.id || `ctr-${Date.now()}`,
          contractNumber: tenant?.contract.contractNumber || `CTR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          planName: selectedPlan,
          monthlyFee,
          billingCycle,
          startDate: tenant?.contract.startDate || new Date().toISOString().split('T')[0],
          expirationDate,
          paymentMethod,
          autoRenew: true
        },
        createdAt: tenant?.createdAt || new Date().toISOString().split('T')[0],
        notes
      });

      // Fechar modal
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar empresa:', err);
      setSaveError(err?.message || 'Erro ao salvar dados da empresa.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                Acesso Master Exclusivo
              </span>
            </div>
            <h3 className="text-xl font-bold mt-1">
              {tenant ? `Editar Cliente: ${tenant.companyName}` : 'Cadastrar Nova Empresa Cliente'}
            </h3>
            <p className="text-xs text-indigo-200">
              Configure permissões, plano comercial, limites de licença e personalização visual.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'geral' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Dados da Empresa
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plano')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'plano' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Plano & Limites
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('modulos')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'modulos' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Módulos Liberados
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('branding')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'branding' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            Personalização (White-Label)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contrato')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'contrato' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Contrato & Faturamento
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{validationError}</span>
          </div>
        )}

        {/* Save Error Banner */}
        {saveError && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{saveError}</span>
          </div>
        )}

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {/* TAB 1: GERAL (DADOS DA EMPRESA) */}
          {activeTab === 'geral' && (
            <div className="space-y-6">
              
              {/* SECTION A: INFORMAÇÕES DA EMPRESA */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Building2 className="w-4 h-4 text-indigo-600" /> Informações Principais da Empresa
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Razão Social *</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ex: Grupo Alpha Logística S/A"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nome Fantasia</label>
                    <input
                      type="text"
                      value={tradeName}
                      onChange={(e) => setTradeName(e.target.value)}
                      placeholder="Ex: Alpha Logística"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">CNPJ *</label>
                    <input
                      type="text"
                      required
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Status da Licença *</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-indigo-900"
                    >
                      <option value="Ativo">Ativo (Acesso Total)</option>
                      <option value="Aguardando Pagamento">Aguardando Pagamento</option>
                      <option value="Suspenso">Suspenso (Bloqueado)</option>
                      <option value="Cancelado">Cancelado</option>
                      <option value="Em Teste (Trial)">Em Teste (Trial)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION B: CONTATO PRINCIPAL DO GESTOR */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <UserCheck className="w-4 h-4 text-indigo-600" /> Contato Principal do Gestor / Responsável
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Gestor *</label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Carlos Eduardo Santos"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail Principal *</label>
                    <input
                      type="email"
                      required
                      value={ownerEmail}
                      onChange={handleOwnerEmailChange}
                      placeholder="carlos@empresa.com.br"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      value={ownerPhone}
                      onChange={(e) => setOwnerPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION C: NOVOS CAMPOS DE ENDEREÇO */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600" /> Endereço da Empresa
                  </h4>
                  <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                    Preenchimento automático por CEP
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-700 mb-1">CEP *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={cep}
                        onChange={handleCepChange}
                        placeholder="00000-000"
                        className="w-full text-xs px-3 py-2 pr-8 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                      />
                      <div className="absolute right-2.5 top-2.5 text-slate-400">
                        {isLoadingCep ? (
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        ) : (
                          <Search className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Logradouro *</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Ex: Av. Paulista, Rua das Flores"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Número *</label>
                    <input
                      type="text"
                      required
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="1500"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Complemento</label>
                    <input
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      placeholder="Sala 402, Bloco B"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bairro *</label>
                    <input
                      type="text"
                      required
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Bela Vista"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cidade / UF *</label>
                    <input
                      type="text"
                      required
                      value={cityUf}
                      onChange={(e) => setCityUf(e.target.value)}
                      placeholder="São Paulo / SP"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {cepSuccessMsg && (
                  <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {cepSuccessMsg}
                  </p>
                )}
              </div>

              {/* SECTION D: NOVOS CAMPOS DE ACESSO DO ADMINISTRADOR */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-indigo-600" /> Acesso e Credenciais do Administrador
                  </h4>
                  <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Criação Automática de Conta
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">E-mail de Acesso (Login) *</label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@empresa.com.br"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Senha Inicial *</label>
                    <input
                      type="password"
                      required={!tenant}
                      value={initialPassword}
                      onChange={(e) => setInitialPassword(e.target.value)}
                      placeholder={tenant ? '•••••••• (Manter atual)' : 'Digite a senha inicial'}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Confirmar Senha *</label>
                    <input
                      type="password"
                      required={!tenant}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={tenant ? '••••••••' : 'Repita a senha inicial'}
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Checkbox option: Enviar credenciais por e-mail */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={sendWelcomeEmail}
                      onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    Enviar credenciais e instruções de acesso por e-mail ao salvar
                  </label>
                </div>

                {/* Rule Info Callout */}
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-indigo-900 text-xs flex items-start gap-2.5 mt-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Vincular Usuário Administrador Automaticamente</p>
                    <p className="text-[11px] text-indigo-700 mt-0.5">
                      Ao salvar, o sistema criará e vinculará automaticamente o usuário com perfil <strong className="font-bold">Administrador</strong> para a empresa <strong className="font-bold">{companyName || 'Cliente'}</strong> com todas as permissões liberadas.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PLANO & LIMITES */}
          {activeTab === 'plano' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100">
                <span className="text-xs font-bold text-indigo-900 block mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Modelos Prontos de Configuração (Preset Master com 1 clique):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PLAN_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedPlan === preset.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <span className="text-xs font-extrabold block">{preset.name}</span>
                      <span className={`text-[10px] block mt-0.5 ${selectedPlan === preset.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                        R$ {preset.suggestedPriceMonthly}/mês • {preset.maxUsers} usu. • {preset.maxActiveJobs} vagas
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valor Mensal (MRR em R$) *</label>
                  <input
                    type="number"
                    required
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-extrabold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Limite Max. de Usuários *</label>
                  <input
                    type="number"
                    required
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Limite Max. de Vagas Ativas *</label>
                  <input
                    type="number"
                    required
                    value={maxActiveJobs}
                    onChange={(e) => setMaxActiveJobs(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MÓDULOS LIBERADOS */}
          {activeTab === 'modulos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-500">
                  Ative ou desative individualmente os módulos do catálogo para esta empresa. O bloqueio é imediato no acesso do cliente.
                </p>
                <button
                  type="button"
                  onClick={loadCatalogAndCompanyModules}
                  disabled={isLoadingModules}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                  title="Recarregar catálogo"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingModules ? 'animate-spin' : ''}`} />
                  <span>Atualizar</span>
                </button>
              </div>

              {/* Estado: Carregando */}
              {isLoadingModules && (
                <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  <p className="text-xs font-semibold text-slate-700">Carregando módulos do catálogo no Firestore...</p>
                </div>
              )}

              {/* Estado: Erro */}
              {modulesError && !isLoadingModules && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{modulesError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={loadCatalogAndCompanyModules}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {/* Estado: Lista Vazia */}
              {!isLoadingModules && !modulesError && catalogModules.length === 0 && (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-700">Nenhum módulo encontrado no catálogo oficial.</p>
                  <button
                    type="button"
                    onClick={loadCatalogAndCompanyModules}
                    className="mt-2 text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {/* Lista Organizada por Categoria dos Módulos da Plataforma */}
              {!isLoadingModules && !modulesError && (
                <div className="space-y-6">
                  {Object.entries(PLATFORM_MODULE_CATEGORIES).map(([catKey, catData]) => (
                    <div key={catKey} className="space-y-2.5">
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
                        <span className="text-[11px] font-black uppercase tracking-wider text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                          {catData.title}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {catData.modules.map((mod) => {
                          const isEnabled = !!modules[mod.key as keyof TenantModulePermissions];
                          return (
                            <div
                              key={mod.key}
                              onClick={() => handleToggleModule(mod.key as keyof TenantModulePermissions)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2.5 select-none ${
                                isEnabled
                                  ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-2xs hover:border-emerald-400'
                                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                              }`}
                            >
                              <div>
                                <span className="text-xs font-bold text-slate-900 block">{mod.name}</span>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{mod.description}</p>
                              </div>

                              <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${isEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                {isEnabled ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BRANDING WHITE-LABEL */}
          {activeTab === 'branding' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900">Personalização Visual e Identidade da Marca</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nome para Exibição no Menu/Portal</label>
                    <input
                      type="text"
                      value={companyDisplayName}
                      onChange={(e) => setCompanyDisplayName(e.target.value)}
                      placeholder="Ex: Alpha Logística RH"
                      className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cor Primária do Layout</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-9 h-9 p-0 border-0 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Domínio Personalizado para o Site de Vagas</label>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="carreiras.suaempresa.com.br"
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CONTRATO & FATURAMENTO */}
          {activeTab === 'contrato' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ciclo de Faturamento</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Mensal">Mensal</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Forma de Pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Pix">Pix Instantâneo</option>
                    <option value="Boleto Bancário">Boleto Bancário</option>
                    <option value="Cartão de Crédito">Cartão de Crédito Recorrente</option>
                    <option value="Faturamento Direct">Faturamento Direct Faturado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data de Vencimento do Contrato</label>
                  <input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-indigo-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Observações Privadas Master / Anotações Comerciais</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informações contratuais internas, negociações ou particularidades do cliente..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Modal Actions */}
          {saveError && (
            <div className="mb-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div>
              {tenant?.id && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(tenant.id);
                    onClose();
                  }}
                  disabled={isSaving}
                  className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Excluir Empresa Cadastrada"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Excluir Empresa</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Salvando no Firestore...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{tenant ? 'Salvar Alterações do Cliente' : 'Cadastrar Empresa Cliente'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
