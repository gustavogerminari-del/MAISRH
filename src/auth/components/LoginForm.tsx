import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, ArrowRight, ArrowLeft, Globe, Crown, Building2, UserCheck, Briefcase, User, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
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
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  const testAccounts = [
    {
      label: 'Super Admin (Master)',
      email: 'master@maisrh.com.br',
      password: 'senha123',
      role: 'Controle Global SaaS',
      icon: Crown,
      color: 'bg-amber-500/10 text-amber-800 border-amber-300 hover:bg-amber-500/20'
    },
    {
      label: 'Admin Empresa Teste',
      email: 'empresa.teste@maisrh.com.br',
      password: 'senha123',
      role: 'Empresa Teste RL Tech',
      icon: Building2,
      color: 'bg-blue-500/10 text-blue-800 border-blue-300 hover:bg-blue-500/20'
    },
    {
      label: 'Recrutador Senior (RH)',
      email: 'recrutador.teste@maisrh.com.br',
      password: 'senha123',
      role: 'Recrutamento & Seleção',
      icon: UserCheck,
      color: 'bg-emerald-500/10 text-emerald-800 border-emerald-300 hover:bg-emerald-500/20'
    },
    {
      label: 'Headhunter / Consultor',
      email: 'headhunter.teste@maisrh.com.br',
      password: 'senha123',
      role: 'Módulo Headhunter',
      icon: Briefcase,
      color: 'bg-indigo-500/10 text-indigo-800 border-indigo-300 hover:bg-indigo-500/20'
    },
    {
      label: 'Candidato Teste',
      email: 'candidato.teste@gmail.com',
      password: 'senha123',
      role: 'Portal do Candidato',
      icon: User,
      color: 'bg-slate-500/10 text-slate-800 border-slate-300 hover:bg-slate-500/20'
    }
  ];

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
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

  const handleQuickLogin = async (accEmail: string, accPass: string) => {
    setEmail(accEmail);
    setPassword(accPass);
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await login(accEmail, accPass);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Erro ao realizar acesso de teste.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedTestData = async () => {
    setIsSeeding(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/seed-test-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();

      if (data.success) {
        setSuccessMsg('Empresa de teste, vagas e 5 credenciais criadas com sucesso no Firestore!');
      } else {
        setErrorMsg(data.error || 'Erro ao gerar dados de teste.');
      }
    } catch (err) {
      setErrorMsg('Erro de conexão ao gerar ambiente de teste.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-0 bg-white rounded-2xl border border-[#D5DEE8] shadow-lg overflow-hidden">
        {/* Banner Left */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#123657] to-[#082747] text-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center font-black text-2xl border border-white/20 tracking-wider text-white shadow-inner">
              RL
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">RL Connect</h2>
              <p className="text-sm text-white/90 mt-1 font-medium">
                R Lourenço Recrutamento e Seleção
              </p>
            </div>
          </div>

          <div className="space-y-3 bg-[#082747]/80 p-4 rounded-xl border border-white/15 text-xs">
            <div className="flex items-center gap-2 font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-[#20D9A0]" />
              <span>Ambiente de Testes Autenticado</span>
            </div>
            <p className="text-[11px] text-white/80 leading-relaxed">
              Utilize os botões de 1-clique no painel ao lado para testar diferentes perfis de acesso, recrutamento, headhunter e candidato.
            </p>
            <button
              type="button"
              onClick={handleSeedTestData}
              disabled={isSeeding}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 bg-[#20D9A0] hover:bg-[#1bc48f] text-[#082747] font-bold py-2 px-3 rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSeeding ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Gerando Empresa e Dados...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Criar / Restaurar Empresa de Teste</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-white/70">
            © 2026 RL Connect / R Lourenço Recrutamento e Seleção. Todos os direitos reservados.
          </p>
        </div>

        {/* Login Form Right */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
          <div className="space-y-2">
            {onBackToJobs && (
              <button
                type="button"
                onClick={onBackToJobs}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#123657] hover:text-[#082747] bg-[#EAF2F8] hover:bg-[#DCEAF4] px-3 py-1.5 rounded-lg transition-colors mb-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <Globe className="w-3.5 h-3.5" />
                Voltar ao Site de Vagas
              </button>
            )}
            <h3 className="text-xl font-extrabold text-[#0F172A]">Acessar sua conta</h3>
            <p className="text-xs text-[#475569]">
              Digite suas credenciais de e-mail e senha ou clique em uma das contas de teste abaixo.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#FFF1F2] border border-[#FCA5A5] text-[#DC2626] text-xs rounded-xl font-semibold">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Access Test Accounts */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Acessos Rápidos de Teste (1-Clique)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Senha: senha123</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {testAccounts.map((acc) => {
                const IconComponent = acc.icon;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleQuickLogin(acc.email, acc.password)}
                    disabled={isLoading}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all text-xs font-medium cursor-pointer ${acc.color} disabled:opacity-50`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate">{acc.label}</div>
                      <div className="text-[10px] opacity-75 truncate">{acc.email}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleCustomLogin} className="space-y-4">
            <Input
              type="email"
              label="E-mail de Acesso"
              placeholder="gustavo.germinari@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-[#475569]" />}
              required
            />

            <Input
              type="password"
              label="Senha de Acesso"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-[#475569]" />}
              required
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsForgotOpen(true)}
                className="text-xs font-bold text-[#123657] hover:text-[#082747] cursor-pointer"
              >
                Esqueceu a senha?
              </button>
            </div>

            <Button type="submit" variant="primary" className="w-full bg-[#123657] hover:bg-[#082747]" isLoading={isLoading} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Entrar no Sistema
            </Button>
          </form>

          <div className="pt-3 border-t border-[#D5DEE8] text-center">
            <p className="text-[11px] text-[#475569] font-medium">
              Acesso seguro criptografado via Firebase Auth
            </p>
          </div>
        </div>
      </div>

      <ForgotPasswordModal isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} />
    </div>
  );
};
