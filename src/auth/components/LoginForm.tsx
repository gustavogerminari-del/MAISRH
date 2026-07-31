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

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-2xl border border-[#D5DEE8] shadow-lg overflow-hidden">
        {/* Banner Left */}
        <div className="bg-gradient-to-br from-[#123657] to-[#082747] text-white p-8 flex flex-col justify-between space-y-6">
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

          <div className="space-y-3 bg-[#082747]/70 p-4 rounded-xl border border-white/15 text-xs">
            <div className="flex items-center gap-2 font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-[#20D9A0]" />
              <span>Autenticação Segura Firebase Auth</span>
            </div>
            <p className="text-[11px] text-white/80 leading-relaxed">
              Acesso exclusivo via credenciais autenticadas. O perfil MASTER possui controle total sobre a plataforma SaaS.
            </p>
          </div>

          <p className="text-[11px] text-white/70">
            © 2026 RL Connect / R Lourenço Recrutamento e Seleção. Todos os direitos reservados.
          </p>
        </div>

        {/* Login Form Right */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
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
              Digite suas credenciais de e-mail e senha para acessar o sistema.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-[#FFF1F2] border border-[#FCA5A5] text-[#DC2626] text-xs rounded-xl font-semibold">
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

          <div className="pt-4 border-t border-[#D5DEE8] text-center">
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
