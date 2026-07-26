import React from 'react';
import { UserCheck, Shield, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoleProfile } from '../types/auth';
import { DEMO_USERS } from '../constants/permissions';
import { UserRoleBadge } from './UserRoleBadge';

export const ProfileSwitchSelector: React.FC = () => {
  const { user, switchDemoProfile, logout } = useAuth();

  if (!user) return null;

  const isMasterActive = user.role === 'Super Administrador';

  return (
    <div className="bg-slate-900 text-slate-100 px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs border-b border-slate-800">
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-indigo-400" />
        <span className="font-bold text-slate-200">Sessão Ativa:</span>
        <span className="text-slate-300 font-semibold">{user.name}</span>
        <UserRoleBadge role={user.role} size="sm" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
          <UserCheck className="w-3.5 h-3.5" /> Mudar perfil:
        </span>

        {/* Master Option in Switcher Bar */}
        <button
          onClick={() => switchDemoProfile('Super Administrador')}
          className={`px-2 py-1 rounded-md text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 ${
            isMasterActive
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-amber-950/80 text-amber-300 border border-amber-800/80 hover:bg-amber-900 hover:text-amber-100'
          }`}
        >
          <Crown className="w-3 h-3" />
          <span>Master</span>
        </button>

        {DEMO_USERS.map((u) => {
          const isCurrent = user.role === u.role;
          return (
            <button
              key={u.id}
              onClick={() => switchDemoProfile(u.role)}
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {u.role.split(' ')[0]}
            </button>
          );
        })}

        <button
          onClick={logout}
          className="ml-2 text-[11px] font-bold text-rose-400 hover:text-rose-300 cursor-pointer underline"
        >
          Sair
        </button>
      </div>
    </div>
  );
};
