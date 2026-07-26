import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Bell, 
  Plus, 
  UserPlus, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  ChevronDown,
  Crown
} from 'lucide-react';
import { useAuth } from '../auth';

interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  openNewCandidateModal: () => void;
  openScheduleInterviewModal: () => void;
  openNewJobModal: () => void;
  onOpenMasterPanel?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchTerm,
  setSearchTerm,
  openNewCandidateModal,
  openScheduleInterviewModal,
  openNewJobModal,
  onOpenMasterPanel,
}) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const notifications = [
    { id: '1', title: 'Novo candidato em "Dev React Senior"', time: 'Há 12 minutos', unread: true },
    { id: '2', title: 'Entrevista com Juliana Paes confirmada', time: 'Há 45 minutos', unread: true },
    { id: '3', title: 'Proposta aceita por Rodrigo Santoro', time: 'Há 2 horas', unread: false },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-8 py-3 flex items-center justify-between shadow-2xs">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white p-2 rounded-xl font-bold flex items-center justify-center shadow-xs">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              MAIS<span className="text-indigo-600">RH</span>
            </h1>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-indigo-200/80 uppercase">
              Recrutamento Pro
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium hidden sm:block">
            Gestão Inteligente de Vagas & Talentos
          </p>
        </div>
      </div>

      {/* Center Search Input */}
      <div className="hidden md:flex items-center relative w-80 lg:w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar candidato, vaga ou competência..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-50 text-slate-800 text-sm pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 text-xs text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Right Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Menu Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-2 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer border border-indigo-200"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ação Rápida</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {showQuickActions && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 space-y-1">
              <button
                onClick={() => { setShowQuickActions(false); openNewJobModal(); }}
                className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2.5 transition-colors font-medium"
              >
                <Plus className="w-4 h-4 text-indigo-600" />
                Nova Vaga
              </button>
              <button
                onClick={() => { setShowQuickActions(false); openNewCandidateModal(); }}
                className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2.5 transition-colors font-medium"
              >
                <UserPlus className="w-4 h-4 text-emerald-600" />
                Cadastrar Candidato
              </button>
              <button
                onClick={() => { setShowQuickActions(false); openScheduleInterviewModal(); }}
                className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2.5 transition-colors font-medium"
              >
                <Calendar className="w-4 h-4 text-amber-600" />
                Agendar Entrevista
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-indigo-600 rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Notificações Recentes</span>
                <span className="text-[10px] text-indigo-600 bg-indigo-50 font-bold px-2 py-0.5 rounded-full">2 novas</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors">
                    <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Super Admin Exclusive Painel Master Button */}
        {user?.role === 'Super Administrador' && onOpenMasterPanel && (
          <button
            onClick={onOpenMasterPanel}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer border border-amber-400"
          >
            <Crown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Painel Master</span>
          </button>
        )}

        <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-1">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shadow-xs"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-black text-xs flex items-center justify-center shadow-xs border border-indigo-200">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RH'}
            </div>
          )}
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-none">{user?.name || 'Luciana Mello'}</p>
            <p className="text-[10px] font-medium text-slate-500 mt-1">{user?.role || 'Gestor de Seleção'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
