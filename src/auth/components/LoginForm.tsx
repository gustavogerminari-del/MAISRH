import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, ArrowRight, UserCheck, ArrowLeft, Globe, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEMO_USERS } from '../constants/permissions';
import { RoleProfile } from '../types/auth';
import { UserRoleBadge } from './UserRoleBadge';
import { Button, Input } from '../../shared';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LoginFormProps {
  onBackToJobs?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onBackToJobs }) => {
  const { login, switchDemoProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Erro ao autenticar no sistema.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemoUser = (role: RoleProfile) => {
    switchDemoProfile(role);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Banner Left */}
        <div className="bg-indigo-600 text-white p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-2xl border border-white/20">
              M
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">MAIS RH</h2>
              <p className="text-xs text-indigo-100 mt-1 font-medium">
                Plataforma Corporativa Integrada de Gestão de Pessoas & Seleção
              </p>
            </div>
          </div>

          <div className="space-y-3 bg-indigo-700/50 p-4 rounded-2xl border border-indigo-400/30 text-xs">
            <div className="flex items-center gap-2 font-bold text-indigo-100">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Controle de Acesso por Perfil Ativo</span>
            </div>
            <p className="text-[11px] text-indigo-200 leading-relaxed">
              O sistema restringe telas e ações de acordo com o nível de autorização (Administrador, Gestor, Recrutador e Analista).
            </p>
          </div>

          <p className="text-[10px] text-indigo-200">
            © 2026 Grupo MAIS RH Brasil. Todos os direitos reservados.
          </p>
        </div>

        {/* Login Form Right */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            {onBackToJobs && (
              <button
                type="button"
                onClick={onBackToJobs}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors mb-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <Globe className="w-3.5 h-3.5" />
                Voltar ao Site de Vagas
              </button>
            )}
            <h3 className="text-xl font-extrabold text-slate-900">Acessar Conta</h3>
            <p className="text-xs text-slate-500">
              Digite suas credenciais corporativas ou selecione um perfil de teste.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Quick Instant Test Access Banner */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-md inline-block mb-0.5">
                Modo Tester Habilitado
              </span>
              <p className="text-xs font-bold text-slate-800 truncate">Entrar direto sem digitar login e senha</p>
            </div>
            <button
              type="button"
              onClick={() => handleSelectDemoUser('Administrador')}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Entrar sem Login
            </button>
          </div>

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <Input
              type="email"
              label="E-mail Corporativo"
              placeholder="seu.email@maisrh.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              type="password"
              label="Senha de Acesso"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsForgotOpen(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Esqueceu a senha?
              </button>
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Entrar no Sistema
            </Button>
          </form>

          {/* Quick Demo Role Selector */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <p className="text-[11px] font-black text-indigo-700 uppercase tracking-wider flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" /> Acesso para Testers (Sem Login e Senha):
            </p>

            {/* Exclusive Master Profile Option */}
            <button
              type="button"
              onClick={() => handleSelectDemoUser('Super Administrador')}
              className="w-full p-2.5 bg-gradient-to-r from-amber-500/15 via-amber-100/80 to-amber-500/15 hover:from-amber-500/25 hover:to-amber-500/25 border-2 border-amber-400/90 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between shadow-xs group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
                  <Crown className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black text-amber-950 truncate">Super Administrador</span>
                    <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-black uppercase tracking-wider">
                      Acesso Master • 1 Clique
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-800 font-semibold truncate">
                    Perfil exclusivo com controle irrestrito do sistema
                  </p>
                </div>
              </div>
              <UserRoleBadge role="Super Administrador" size="sm" />
            </button>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectDemoUser(u.role)}
                  className="p-2 bg-slate-50 hover:bg-indigo-50/80 hover:border-indigo-300 border border-slate-200 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-900 truncate">{u.name}</span>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded shrink-0">Entrar</span>
                  </div>
                  <div className="mt-1">
                    <UserRoleBadge role={u.role} size="sm" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ForgotPasswordModal isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} />
    </div>
  );
};
