import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, ArrowRight, ArrowLeft, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../../shared';
import { ForgotPasswordModal } from './ForgotPasswordModal';

interface LoginFormProps {
  onBackToJobs?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onBackToJobs }) => {
  const { login } = useAuth();
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

  // Dev helper to create initial accounts on the server and auto-login as MASTER
  const handleDevBootstrapAndLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      // Call server endpoint to sync initial users
      const resp = await fetch('/api/users/sync-initial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || data?.message || 'Falha ao sincronizar contas iniciais');
      }

      // Attempt login with MASTER demo credentials
      const masterEmail = 'gustavo.germinari@gmail.com';
      const masterPassword = 'Gugato94@';
      setEmail(masterEmail);
      setPassword(masterPassword);

      await login(masterEmail, masterPassword);
    } catch (err: any) {
      console.error('Dev bootstrap/login error:', err);
      setErrorMsg(err?.message || String(err));
    } finally {
      setIsLoading(false);
    }
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
              <span>Autenticação Segura Firebase Auth</span>
            </div>
            <p className="text-[11px] text-indigo-200 leading-relaxed">
              Acesso exclusivo via credenciais autenticadas. O perfil MASTER possui controle total sobre a plataforma SaaS.
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
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <Globe className="w-3.5 h-3.5" />
                Voltar ao Site de Vagas
              </button>
            )}
            <h3 className="text-xl font-extrabold text-slate-900">Acessar Conta</h3>
            <p className="text-xs text-slate-500">
              Digite suas credenciais de e-mail e senha para acessar o sistema.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <Input
              type="email"
              label="E-mail de Acesso"
              placeholder="gustavo.germinari@gmail.com"
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

            {/* DEV helper: visible only in development builds */}
            {(import.meta as any).env?.DEV && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDevBootstrapAndLogin}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Criar contas iniciais (DEV) e entrar como MASTER
                </button>
                <p className="text-[11px] text-slate-400 mt-2">Apenas para uso em desenvolvimento local. Não utilize em produção.</p>
              </div>
            )}

          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 font-medium">
              Acesso seguro criptografado via Firebase Auth
            </p>
          </div>
        </div>
      </div>

      <ForgotPasswordModal isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} />
    </div>
  );
};
