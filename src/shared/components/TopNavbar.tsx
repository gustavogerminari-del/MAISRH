import React from 'react';
import { SearchBar } from './SearchBar';
import { Button } from './Button';
import { Bell, Plus } from 'lucide-react';

export interface ActionButtonConfig {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface TopNavbarProps {
  systemTitle?: string;
  systemSubtitle?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  primaryAction?: ActionButtonConfig;
  secondaryActions?: ActionButtonConfig[];
  userAvatar?: string;
  userName?: string;
  userRole?: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  systemTitle = 'MAIS RH',
  systemSubtitle = 'Plataforma Corporativa',
  searchValue,
  onSearchChange,
  primaryAction,
  secondaryActions = [],
  userAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  userName = 'Luciana Mello',
  userRole = 'Administradora RH',
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3 shadow-2xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        {/* Brand logo & title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
            M
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 leading-tight">{systemTitle}</h1>
            <p className="text-[11px] text-slate-500 font-medium">{systemSubtitle}</p>
          </div>
        </div>

        {/* Global Search */}
        {onSearchChange !== undefined && (
          <div className="flex-1 max-w-md mx-2">
            <SearchBar value={searchValue || ''} onChange={onSearchChange} placeholder="Buscar registros no sistema..." />
          </div>
        )}

        {/* Action Buttons & User Profile */}
        <div className="flex items-center justify-end gap-2 sm:gap-3">
          {secondaryActions.map((act, i) => (
            <Button key={i} variant={act.variant || 'outline'} size="sm" onClick={act.onClick} leftIcon={act.icon}>
              {act.label}
            </Button>
          ))}

          {primaryAction && (
            <Button variant="primary" size="sm" onClick={primaryAction.onClick} leftIcon={primaryAction.icon || <Plus className="w-4 h-4" />}>
              {primaryAction.label}
            </Button>
          )}

          <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1" />

          {/* User badge */}
          <div className="flex items-center gap-2.5 pl-1">
            <img src={userAvatar} alt={userName} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-extrabold text-slate-900 leading-none">{userName}</p>
              <p className="text-[10px] text-indigo-700 font-bold mt-0.5">{userRole}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
