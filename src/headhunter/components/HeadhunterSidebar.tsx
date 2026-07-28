import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  TrendingUp, 
  FileText, 
  Briefcase, 
  Users, 
  List, 
  Video, 
  UserCheck, 
  Calendar, 
  Award, 
  DollarSign, 
  Receipt, 
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { HeadhunterSubTab } from '../HeadhunterView';

export interface HeadhunterNavItem {
  id: HeadhunterSubTab;
  label: string;
  icon: React.FC<{ className?: string }>;
}

export interface HeadhunterNavGroup {
  id: string;
  title: string;
  items: HeadhunterNavItem[];
}

export const HEADHUNTER_NAV_GROUPS: HeadhunterNavGroup[] = [
  {
    id: 'comercial',
    title: 'GRUPO COMERCIAL',
    items: [
      { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
      { id: 'clientes', label: 'Clientes', icon: Building2 },
      { id: 'crm', label: 'CRM Comercial', icon: TrendingUp },
      { id: 'contratos', label: 'Contratos', icon: FileText },
    ],
  },
  {
    id: 'recrutamento',
    title: 'GRUPO RECRUTAMENTO',
    items: [
      { id: 'vagas', label: 'Vagas', icon: Briefcase },
      { id: 'candidatos', label: 'Banco de Talentos', icon: Users },
      { id: 'pipeline', label: 'Processos Seletivos', icon: List },
      { id: 'entrevistas', label: 'Entrevistas', icon: Video },
      { id: 'contratacoes', label: 'Contratações', icon: UserCheck },
      { id: 'agenda', label: 'Agenda', icon: Calendar },
    ],
  },
  {
    id: 'financeiro',
    title: 'GRUPO FINANCEIRO',
    items: [
      { id: 'comissoes', label: 'Comissões', icon: Award },
      { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
      { id: 'despesas', label: 'Despesas', icon: Receipt },
      { id: 'relatorios', label: 'Relatórios', icon: BarChart2 },
    ],
  },
];

const COLLAPSED_STORAGE_KEY = 'headhunterSidebarCollapsed';

interface HeadhunterSidebarProps {
  activeTab: HeadhunterSubTab;
  onSelectTab: (tab: HeadhunterSubTab) => void;
}

export const HeadhunterSidebar: React.FC<HeadhunterSidebarProps> = ({
  activeTab,
  onSelectTab
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem(COLLAPSED_STORAGE_KEY);
    return saved === 'true';
  });

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(COLLAPSED_STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  // Find active item details for mobile header display
  const allItems = HEADHUNTER_NAV_GROUPS.flatMap(g => g.items);
  const activeItem = allItems.find(i => i.id === activeTab) || allItems[0];
  const ActiveIcon = activeItem.icon;

  return (
    <>
      {/* ========================================================================= */}
      {/* MOBILE HEADER & DRAWER TOGGLE (< lg) */}
      {/* ========================================================================= */}
      <div className="lg:hidden w-full bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <ActiveIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
              Headhunter
            </span>
            <span className="text-xs font-extrabold text-slate-800 truncate block">
              {activeItem.label}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-4 h-4" />
          <span>Menu Headhunter</span>
        </button>
      </div>

      {/* MOBILE DRAWER OVERLAY */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-slate-900 block leading-tight">Headhunter</span>
                  <span className="text-[10px] text-slate-400 font-medium">Navegação Interna</span>
                </div>
              </div>
              <button 
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 flex-1">
              {HEADHUNTER_NAV_GROUPS.map(group => (
                <div key={group.id} className="space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 block">
                    {group.title}
                  </span>
                  {group.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectTab(item.id);
                          setIsMobileDrawerOpen(false);
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 text-left transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR (>= lg) */}
      {/* ========================================================================= */}
      <aside 
        className={`hidden lg:flex flex-col bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs shrink-0 transition-all duration-300 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto ${
          isCollapsed ? 'w-16' : 'w-60'
        }`}
      >
        {/* Header with Collapse Button */}
        <div className={`flex items-center border-b border-slate-100 pb-2 mb-2 ${isCollapsed ? 'justify-center' : 'justify-between px-1'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 font-extrabold text-xs">
                HH
              </div>
              <span className="text-xs font-extrabold text-slate-800 tracking-tight truncate">
                Headhunter
              </span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expandir menu" : "Recolher menu"}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Grouped Navigation */}
        <div className="space-y-4 flex-1">
          {HEADHUNTER_NAV_GROUPS.map((group, groupIdx) => (
            <div key={group.id} className="space-y-1">
              {!isCollapsed ? (
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 pt-1 pb-1">
                  {group.title}
                </div>
              ) : (
                groupIdx > 0 && <div className="border-t border-slate-100 my-2" />
              )}

              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full rounded-xl text-xs font-semibold transition-all flex items-center cursor-pointer ${
                      isCollapsed 
                        ? 'justify-center p-2.5' 
                        : 'px-3 py-2.5 gap-3 text-left'
                    } ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};
