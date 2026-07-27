import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  FileEdit, 
  Scale, 
  UserCheck, 
  BarChart2, 
  Settings, 
  Send 
} from 'lucide-react';
import { useAuth } from '../auth';
import { SubMenuPonto, RegistroPontoDoc, EscalaTrabalhoDoc, AjustePontoDoc, BancoHorasDoc, FuncionarioPontoInfo, ConfiguracoesPonto } from './types/ponto';
import { 
  fetchRegistrosPonto, 
  fetchEscalasPonto, 
  salvarEscalaPonto, 
  fetchAjustesPonto, 
  salvarAjustePonto, 
  fetchBancoHoras, 
  fetchFuncionariosPonto, 
  salvarFuncionarioPonto, 
  fetchConfiguracoesPonto, 
  salvarConfiguracoesPonto 
} from './services/pontoService';

import { DashboardPonto } from './components/DashboardPonto';
import { AreaFuncionariomeuPonto } from './components/AreaFuncionariomeuPonto';
import { FuncionariosPonto } from './components/FuncionariosPonto';
import { EscalasPonto } from './components/EscalasPonto';
import { EspelhoPontoView } from './components/EspelhoPontoView';
import { AjustesPontoView } from './components/AjustesPontoView';
import { BancoHorasView } from './components/BancoHorasView';
import { AreaGestorPonto } from './components/AreaGestorPonto';
import { RelatoriosPontoView } from './components/RelatoriosPontoView';
import { ConfiguracoesPontoView } from './components/ConfiguracoesPontoView';
import { IntegracaoFolhaView } from './components/IntegracaoFolhaView';
import { RegistroPontoModal } from './components/RegistroPontoModal';

export const PontoDigitalView: React.FC = () => {
  const { user } = useAuth();
  const [activeSubMenu, setActiveSubMenu] = useState<SubMenuPonto>('dashboard');
  const [showRegistroModal, setShowRegistroModal] = useState(false);

  const empresaId = user?.companyId || user?.empresaId || user?.tenantId || 'emp-001';

  // State loaded from Firestore / Local Storage
  const [registros, setRegistros] = useState<RegistroPontoDoc[]>([]);
  const [escalas, setEscalas] = useState<EscalaTrabalhoDoc[]>([]);
  const [ajustes, setAjustes] = useState<AjustePontoDoc[]>([]);
  const [bancoHoras, setBancoHoras] = useState<BancoHorasDoc[]>([]);
  const [funcionarios, setFuncionarios] = useState<FuncionarioPontoInfo[]>([]);
  const [config, setConfig] = useState<ConfiguracoesPonto | null>(null);

  const loadData = async () => {
    const regs = await fetchRegistrosPonto(empresaId);
    setRegistros(regs);

    const escs = await fetchEscalasPonto(empresaId);
    setEscalas(escs);

    const ajs = await fetchAjustesPonto(empresaId);
    setAjustes(ajs);

    const bh = await fetchBancoHoras(empresaId);
    setBancoHoras(bh);

    const funcs = await fetchFuncionariosPonto(empresaId);
    setFuncionarios(funcs);

    const cfg = await fetchConfiguracoesPonto(empresaId);
    setConfig(cfg);
  };

  useEffect(() => {
    loadData();
  }, [empresaId]);

  const handleSalvarEscala = async (escala: EscalaTrabalhoDoc) => {
    await salvarEscalaPonto(escala);
    loadData();
  };

  const handleSalvarAjuste = async (ajuste: AjustePontoDoc) => {
    await salvarAjustePonto(ajuste);
    loadData();
  };

  const handleSalvarFuncionario = async (func: FuncionarioPontoInfo) => {
    await salvarFuncionarioPonto(func);
    loadData();
  };

  const handleSalvarConfig = async (cfg: ConfiguracoesPonto) => {
    await salvarConfiguracoesPonto(cfg);
    setConfig(cfg);
  };

  const subMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meu-ponto', label: 'Meu Ponto', icon: Clock },
    { id: 'funcionarios', label: 'Funcionários', icon: Users },
    { id: 'escalas', label: 'Escalas', icon: Calendar },
    { id: 'espelho', label: 'Espelho de Ponto', icon: FileText },
    { id: 'ajustes', label: 'Ajustes de Ponto', icon: FileEdit },
    { id: 'banco-horas', label: 'Banco de Horas', icon: Scale },
    { id: 'gestor', label: 'Painel do Gestor', icon: UserCheck },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart2 },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
    { id: 'integracao-folha', label: 'Integração Folha', icon: Send },
  ];

  return (
    <div className="space-y-6">
      {/* Submenu Header Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {subMenuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSubMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubMenu(item.id as SubMenuPonto)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View Router */}
      <div>
        {activeSubMenu === 'dashboard' && (
          <DashboardPonto
            registros={registros}
            funcionarios={funcionarios}
            onNavigateSubmenu={(sub) => setActiveSubMenu(sub)}
            onAbrirRegistroPonto={() => setShowRegistroModal(true)}
          />
        )}

        {activeSubMenu === 'meu-ponto' && (
          <AreaFuncionariomeuPonto
            registros={registros}
            onAbrirRegistroPonto={() => setShowRegistroModal(true)}
          />
        )}

        {activeSubMenu === 'funcionarios' && (
          <FuncionariosPonto
            funcionarios={funcionarios}
            escalas={escalas}
            onSalvarFuncionario={handleSalvarFuncionario}
          />
        )}

        {activeSubMenu === 'escalas' && (
          <EscalasPonto
            escalas={escalas}
            onSalvarEscala={handleSalvarEscala}
          />
        )}

        {activeSubMenu === 'espelho' && (
          <EspelhoPontoView
            registros={registros}
            funcionarios={funcionarios}
          />
        )}

        {activeSubMenu === 'ajustes' && (
          <AjustesPontoView
            ajustes={ajustes}
            funcionarios={funcionarios}
            onSalvarAjuste={handleSalvarAjuste}
            isManagerOrMaster={user?.role === 'Super Administrador' || user?.role === 'Administrador' || user?.tipoUsuario === 'MASTER' || user?.tipoUsuario === 'EMPRESA'}
          />
        )}

        {activeSubMenu === 'banco-horas' && (
          <BancoHorasView
            bancoHoras={bancoHoras}
          />
        )}

        {activeSubMenu === 'gestor' && (
          <AreaGestorPonto
            funcionarios={funcionarios}
            registros={registros}
          />
        )}

        {activeSubMenu === 'relatorios' && (
          <RelatoriosPontoView />
        )}

        {activeSubMenu === 'configuracoes' && config && (
          <ConfiguracoesPontoView
            config={config}
            onSalvarConfig={handleSalvarConfig}
          />
        )}

        {activeSubMenu === 'integracao-folha' && (
          <IntegracaoFolhaView />
        )}
      </div>

      {/* Punch Clock Modal */}
      <RegistroPontoModal
        isOpen={showRegistroModal}
        onClose={() => setShowRegistroModal(false)}
        onPontoRegistrado={loadData}
      />
    </div>
  );
};
