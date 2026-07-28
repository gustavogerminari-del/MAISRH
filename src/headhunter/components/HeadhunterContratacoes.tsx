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
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Histórico de Contratações & Placements</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {hirings.length} contratações
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Registro consolidado de contratações finalizadas, receita gerada por honorários e comissões alocadas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl text-xs font-bold text-emerald-900">
            Faturamento Total: <span className="text-emerald-700 font-black text-sm">R$ {totalReceitaGerada.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Total de Placements</span>
          <p className="text-2xl font-black text-slate-900">{hirings.length}</p>
          <span className="text-[10px] text-slate-400 font-medium">Executivos admitidos</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Receita de Fee</span>
          <p className="text-2xl font-black text-emerald-600">R$ {(totalReceitaGerada / 1000).toFixed(0)}k</p>
          <span className="text-[10px] text-emerald-600 font-bold">Honorários confirmados</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Comissões Geradas</span>
          <p className="text-2xl font-black text-indigo-600">R$ {(totalComissaoGerada / 1000).toFixed(0)}k</p>
          <span className="text-[10px] text-indigo-600 font-bold">Pago a consultores</span>
        </div>
      </div>

      {/* HIRINGS CARDS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hirings.map(h => (
          <div key={h.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-base font-black text-slate-900">{h.candidatoNome}</h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Admitido para: <strong className="text-slate-800">{h.vagaTitulo}</strong> na <strong className="text-slate-800">{h.clienteNome}</strong>
                  </p>
                </div>

                <span className="px-2.5 py-1 text-xs font-extrabold rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                  Admitido {h.dataContratacao}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl text-xs border border-slate-100">
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
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
              <span className="text-slate-500 font-bold">Consultor: {h.consultorNome}</span>
              <button
                onClick={() => onOpenAiModal('mensagemCandidato', { candidateName: h.candidatoNome, jobTitle: h.vagaTitulo })}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
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
