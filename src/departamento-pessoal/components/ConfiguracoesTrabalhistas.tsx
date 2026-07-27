import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Sliders, 
  Save, 
  Clock, 
  Percent, 
  DollarSign, 
  CheckCircle2, 
  Building2, 
  FileText 
} from 'lucide-react';
import { ConfiguracoesTrabalhistas } from '../types/dp';

interface ConfiguracoesTrabalhistasProps {
  config: ConfiguracoesTrabalhistas;
  onSalvarConfig: (cfg: ConfiguracoesTrabalhistas) => void;
}

export const ConfiguracoesTrabalhistasView: React.FC<ConfiguracoesTrabalhistasProps> = ({
  config,
  onSalvarConfig
}) => {
  const [formData, setFormData] = useState<ConfiguracoesTrabalhistas>({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvarConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Settings className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-[#1E293B]">Parâmetros & Configurações Trabalhistas CLT</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Definição de regras legais de tolerância de ponto, tabelas eSocial, adicionais noturnos e alíquotas.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1.5 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Configurações Salvas com Sucesso!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Parameters */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <h3 className="font-bold text-[#1E293B] text-sm border-b border-slate-100 pb-2">1. Tolerâncias de Ponto & Adicionais</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tolerância Diária de Ponto (Minutos)</label>
              <input
                type="number"
                value={formData.toleranciaPontoMinutos}
                onChange={(e) => setFormData({ ...formData, toleranciaPontoMinutos: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Art. 58 § 1º CLT (Padrão 10 minutos diários)</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Hora Extra Dia Útil (%)</label>
              <input
                type="number"
                value={formData.adicionalHorasExtrasSemanaPercent}
                onChange={(e) => setFormData({ ...formData, adicionalHorasExtrasSemanaPercent: parseFloat(e.target.value) || 50 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Mínimo Constitucional 50%</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Hora Extra Domingos/Feriados (%)</label>
              <input
                type="number"
                value={formData.adicionalHorasExtrasDomingoFeriadoPercent}
                onChange={(e) => setFormData({ ...formData, adicionalHorasExtrasDomingoFeriadoPercent: parseFloat(e.target.value) || 100 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Convenção Coletiva (100%)</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Adicional Noturno (%)</label>
              <input
                type="number"
                value={formData.adicionalNoturnoPercent}
                onChange={(e) => setFormData({ ...formData, adicionalNoturnoPercent: parseFloat(e.target.value) || 20 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Trabalho Urbano CLT (20%)</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Início Horário Noturno</label>
              <input
                type="time"
                value={formData.horarioNoturnoInicio}
                onChange={(e) => setFormData({ ...formData, horarioNoturnoInicio: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Fim Horário Noturno</label>
              <input
                type="time"
                value={formData.horarioNoturnoFim}
                onChange={(e) => setFormData({ ...formData, horarioNoturnoFim: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>

        {/* Progressive INSS & IRRF Tables */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <h3 className="font-bold text-[#1E293B] text-sm border-b border-slate-100 pb-2">2. Tabelas Progressivas de INSS & IRRF (Ano Vigente 2026)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* INSS */}
            <div className="space-y-2">
              <h4 className="font-bold text-[#2563EB]">Tabela Progressiva INSS</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold">
                    <th className="p-2">Faixa de Salário</th>
                    <th className="p-2">Alíquota</th>
                    <th className="p-2">Dedução</th>
                  </tr>
                  {formData.tabelaInss.map((f, i) => (
                    <tr key={i} className="border-b border-slate-100 font-mono">
                      <td className="p-2">Até R$ {f.ate.toFixed(2)}</td>
                      <td className="p-2 font-bold">{f.aliquota}%</td>
                      <td className="p-2">R$ {f.deducao.toFixed(2)}</td>
                    </tr>
                  ))}
                </table>
              </div>
            </div>

            {/* IRRF */}
            <div className="space-y-2">
              <h4 className="font-bold text-emerald-700">Tabela Progressiva IRRF</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold">
                    <th className="p-2">Base de Cálculo</th>
                    <th className="p-2">Alíquota</th>
                    <th className="p-2">Dedução</th>
                  </tr>
                  {formData.tabelaIrrf.map((f, i) => (
                    <tr key={i} className="border-b border-slate-100 font-mono">
                      <td className="p-2">Até R$ {f.ate.toFixed(2)}</td>
                      <td className="p-2 font-bold">{f.aliquota}%</td>
                      <td className="p-2">R$ {f.deducao.toFixed(2)}</td>
                    </tr>
                  ))}
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Parâmetros Trabalhistas</span>
          </button>
        </div>
      </form>
    </div>
  );
};
