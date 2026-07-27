import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  Calculator, 
  Gift, 
  Umbrella, 
  LogOut, 
  FileText, 
  BarChart2, 
  Settings, 
  DollarSign, 
  Building2, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../auth';

// Import Types and Seeds
import { 
  ColaboradorCompleto, 
  ItemBeneficio, 
  RegistroFeriasColaborador, 
  CalculoRescisorio, 
  ConfiguracoesTrabalhistas 
} from './types/dp';
import { 
  INITIAL_COLABORADORES, 
  INITIAL_BENEFICIOS, 
  INITIAL_FERIAS, 
  INITIAL_RESCISOES, 
  DEFAULT_CONFIG_TRABALHISTA 
} from './data/dpMockData';

// Import Submenu Components
import { CadastroColaboradores } from './components/CadastroColaboradores';
import { PortalColaboradorPonto } from './components/PortalColaboradorPonto';
import { PontoDigitalView } from '../ponto-digital/PontoDigitalView';
import { PayrollView } from '../payroll/PayrollView';
import { GestaoBeneficios } from './components/GestaoBeneficios';
import { GestaoFerias } from './components/GestaoFerias';
import { CalculoRescisao } from './components/CalculoRescisao';
import { DocumentsSignatureView } from '../documents-signature/DocumentsSignatureView';
import { RelatoriosDpView } from './components/RelatoriosDpView';
import { ConfiguracoesTrabalhistasView } from './components/ConfiguracoesTrabalhistas';

export type DPSubTab = 
  | 'colaboradores' 
  | 'ponto-digital' 
  | 'folha-pagamento' 
  | 'beneficios' 
  | 'ferias' 
  | 'rescisao' 
  | 'documentos' 
  | 'relatorios-dp' 
  | 'configuracoes-trabalhistas';

interface DepartamentoPessoalViewProps {
  initialSubTab?: DPSubTab;
}

export const DepartamentoPessoalView: React.FC<DepartamentoPessoalViewProps> = ({
  initialSubTab = 'colaboradores'
}) => {
  const { user } = useAuth();
  const companyId = user?.companyId || user?.empresaId || user?.tenantId || 'emp-001';

  const [activeSubTab, setActiveSubTab] = useState<DPSubTab>(initialSubTab);

  // Sync state with prop if changed
  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Persistent DP State
  const [colaboradores, setColaboradores] = useState<ColaboradorCompleto[]>(() => {
    const saved = localStorage.getItem(`MAIS_RH_COLABORADORES_${companyId}`);
    return saved ? JSON.parse(saved) : INITIAL_COLABORADORES;
  });

  const [beneficios, setBeneficios] = useState<ItemBeneficio[]>(() => {
    const saved = localStorage.getItem(`MAIS_RH_BENEFICIOS_${companyId}`);
    return saved ? JSON.parse(saved) : INITIAL_BENEFICIOS;
  });

  const [feriasList, setFeriasList] = useState<RegistroFeriasColaborador[]>(() => {
    const saved = localStorage.getItem(`MAIS_RH_FERIAS_${companyId}`);
    return saved ? JSON.parse(saved) : INITIAL_FERIAS;
  });

  const [rescisoes, setRescisoes] = useState<CalculoRescisorio[]>(() => {
    const saved = localStorage.getItem(`MAIS_RH_RESCISOES_${companyId}`);
    return saved ? JSON.parse(saved) : INITIAL_RESCISOES;
  });

  const [configTrabalhista, setConfigTrabalhista] = useState<ConfiguracoesTrabalhistas>(() => {
    const saved = localStorage.getItem(`MAIS_RH_CONFIG_TRABALHISTA_${companyId}`);
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG_TRABALHISTA;
  });

  // Save changes to localStorage for multiempresa persistence
  const handleSalvarColaborador = (colab: ColaboradorCompleto) => {
    const updated = colaboradores.some(c => c.id === colab.id)
      ? colaboradores.map(c => c.id === colab.id ? colab : c)
      : [colab, ...colaboradores];
    setColaboradores(updated);
    localStorage.setItem(`MAIS_RH_COLABORADORES_${companyId}`, JSON.stringify(updated));
  };

  const handleSalvarBeneficio = (ben: ItemBeneficio) => {
    const updated = beneficios.some(b => b.id === ben.id)
      ? beneficios.map(b => b.id === ben.id ? ben : b)
      : [ben, ...beneficios];
    setBeneficios(updated);
    localStorage.setItem(`MAIS_RH_BENEFICIOS_${companyId}`, JSON.stringify(updated));
  };

  const handleSalvarFerias = (f: RegistroFeriasColaborador) => {
    const updated = feriasList.some(item => item.id === f.id)
      ? feriasList.map(item => item.id === f.id ? f : item)
      : [f, ...feriasList];
    setFeriasList(updated);
    localStorage.setItem(`MAIS_RH_FERIAS_${companyId}`, JSON.stringify(updated));
  };

  const handleSalvarRescisao = (r: CalculoRescisorio) => {
    const updated = rescisoes.some(item => item.id === r.id)
      ? rescisoes.map(item => item.id === r.id ? r : item)
      : [r, ...rescisoes];
    setRescisoes(updated);
    localStorage.setItem(`MAIS_RH_RESCISOES_${companyId}`, JSON.stringify(updated));
  };

  const handleSalvarConfig = (cfg: ConfiguracoesTrabalhistas) => {
    setConfigTrabalhista(cfg);
    localStorage.setItem(`MAIS_RH_CONFIG_TRABALHISTA_${companyId}`, JSON.stringify(cfg));
  };

  const subMenuItems = [
    { id: 'colaboradores', label: 'Colaboradores', icon: Users },
    { id: 'ponto-digital', label: 'Ponto Digital', icon: Clock },
    { id: 'folha-pagamento', label: 'Folha de Pagamento', icon: Calculator },
    { id: 'beneficios', label: 'Benefícios', icon: Gift },
    { id: 'ferias', label: 'Férias', icon: Umbrella },
    { id: 'rescisao', label: 'Rescisão', icon: LogOut },
    { id: 'documentos', label: 'Documentos & Assinaturas', icon: FileText },
    { id: 'relatorios-dp', label: 'Relatórios DP', icon: BarChart2 },
    { id: 'configuracoes-trabalhistas', label: 'Configurações Trabalhistas', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Submenu Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {subMenuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id as DPSubTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#1E293B] hover:bg-slate-100/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View Display */}
      <div>
        {activeSubTab === 'colaboradores' && (
          <CadastroColaboradores
            colaboradores={colaboradores}
            onSalvarColaborador={handleSalvarColaborador}
            companyId={companyId}
          />
        )}

        {activeSubTab === 'ponto-digital' && (
          <PontoDigitalView />
        )}

        {activeSubTab === 'folha-pagamento' && (
          <PayrollView />
        )}

        {activeSubTab === 'beneficios' && (
          <GestaoBeneficios
            beneficios={beneficios}
            colaboradores={colaboradores}
            onSalvarBeneficio={handleSalvarBeneficio}
            companyId={companyId}
          />
        )}

        {activeSubTab === 'ferias' && (
          <GestaoFerias
            feriasList={feriasList}
            colaboradores={colaboradores}
            onSalvarFerias={handleSalvarFerias}
            companyId={companyId}
          />
        )}

        {activeSubTab === 'rescisao' && (
          <CalculoRescisao
            rescisoes={rescisoes}
            colaboradores={colaboradores}
            onSalvarRescisao={handleSalvarRescisao}
            companyId={companyId}
          />
        )}

        {activeSubTab === 'documentos' && (
          <DocumentsSignatureView />
        )}

        {activeSubTab === 'relatorios-dp' && (
          <RelatoriosDpView
            colaboradores={colaboradores}
            beneficios={beneficios}
            ferias={feriasList}
            rescisoes={rescisoes}
          />
        )}

        {activeSubTab === 'configuracoes-trabalhistas' && (
          <ConfiguracoesTrabalhistasView
            config={configTrabalhista}
            onSalvarConfig={handleSalvarConfig}
          />
        )}
      </div>
    </div>
  );
};
