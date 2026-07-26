import React from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Award, 
  Download, 
  Filter, 
  Users, 
  PieChart, 
  ArrowUpRight
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const channelData = [
    { channel: 'LinkedIn Recruiter', candidates: 112, hires: 8, efficiency: '7.1%' },
    { channel: 'Indicação Interna', candidates: 28, hires: 6, efficiency: '21.4%' },
    { channel: 'Site Carreiras MAIS RH', candidates: 65, hires: 4, efficiency: '6.1%' },
    { channel: 'Gupy / Plat. Externa', candidates: 84, hires: 3, efficiency: '3.5%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-extrabold text-slate-900">Relatórios & Analytics R&S</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Indicadores chave de inteligência e performance do processo seletivo.
            </p>
          </div>

          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer">
            <Download className="w-4 h-4" />
            Exportar Relatório PDF / CSV
          </button>
        </div>
      </div>

      {/* SLA Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Tempo de Fechamento (SLA)</span>
          <p className="text-3xl font-black text-slate-900 mt-2">18.4 dias</p>
          <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> -3.2 dias vs trimestre anterior
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Custo por Contratação</span>
          <p className="text-3xl font-black text-slate-900 mt-2">R$ 2.450</p>
          <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> -12% com indicações internas
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Taxa de Aceite de Proposta</span>
          <p className="text-3xl font-black text-slate-900 mt-2">91.3%</p>
          <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Altíssima atratividade da marca
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase">NPS dos Candidatos</span>
          <p className="text-3xl font-black text-slate-900 mt-2">88 / 100</p>
          <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> Zona de Excelência
          </p>
        </div>
      </div>

      {/* Channel Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Performance por Canal de Atração</h3>
          <p className="text-xs text-slate-500">Avaliação de volume e eficiência de conversão por fonte</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Canal / Fonte</th>
                <th className="p-3">Candidatos</th>
                <th className="p-3">Contratações</th>
                <th className="p-3">Taxa de Conversão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {channelData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{row.channel}</td>
                  <td className="p-3 text-slate-600 font-medium">{row.candidates}</td>
                  <td className="p-3 font-bold text-indigo-700">{row.hires}</td>
                  <td className="p-3">
                    <span className="bg-emerald-50 text-emerald-700 font-extrabold px-2.5 py-1 rounded-md border border-emerald-200">
                      {row.efficiency}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
