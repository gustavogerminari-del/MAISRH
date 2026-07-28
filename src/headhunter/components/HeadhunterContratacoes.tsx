import React from 'react';
import { 
  UserCheck, 
  DollarSign, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  Briefcase, 
  Building2, 
  TrendingUp 
} from 'lucide-react';
import { HeadhunterHiring } from '../types';

interface HeadhunterContratacoesProps {
  hirings: HeadhunterHiring[];
  onOpenAiModal: (type: string, data?: any) => void;
}

export const HeadhunterContratacoes: React.FC<HeadhunterContratacoesProps> = ({
  hirings,
  onOpenAiModal
}) => {
  const totalReceitaGerada = hirings.reduce((acc, h) => acc + h.receitaGerada, 0);
  const totalComissaoGerada = hirings.reduce((acc, h) => acc + h.comissaoGerada, 0);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Histórico de Contratações Executivas Fechadas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro automático de contratações, faturamento e comissões integradas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-900">
            Faturamento Fechado: <span className="text-emerald-700 font-black">R$ {totalReceitaGerada.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* HIRINGS CARDS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hirings.map(h => (
          <div key={h.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-base font-black text-slate-900">{h.candidatoNome}</h3>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Admitido para: <strong className="text-slate-800">{h.vagaTitulo}</strong> na <strong className="text-slate-800">{h.clienteNome}</strong>
                </p>
              </div>

              <span className="px-2.5 py-1 text-xs font-extrabold rounded-full bg-emerald-100 text-emerald-800">
                Admitido {h.dataContratacao}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Remuneração Final</span>
                <strong className="text-slate-800">R$ {h.salarioFinal.toLocaleString('pt-BR')}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Faturamento Vaga</span>
                <strong className="text-slate-900 font-black">R$ {h.receitaGerada.toLocaleString('pt-BR')}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Comissão Devida</span>
                <strong className="text-emerald-600 font-bold">R$ {h.comissaoGerada.toLocaleString('pt-BR')}</strong>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 font-medium">Headhunter: {h.consultorNome}</span>
              <button
                onClick={() => onOpenAiModal('mensagemCandidato', { candidateName: h.candidatoNome, jobTitle: h.vagaTitulo })}
                className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Mensagem Boas-Vindas IA</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
