import React, { useState } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Download, 
  DollarSign, 
  Users, 
  Clock, 
  Umbrella, 
  LogOut, 
  FileText, 
  PieChart, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { ColaboradorCompleto, ItemBeneficio, RegistroFeriasColaborador, CalculoRescisorio } from '../types/dp';

interface RelatoriosDpViewProps {
  colaboradores: ColaboradorCompleto[];
  beneficios: ItemBeneficio[];
  ferias: RegistroFeriasColaborador[];
  rescisoes: CalculoRescisorio[];
}

export const RelatoriosDpView: React.FC<RelatoriosDpViewProps> = ({
  colaboradores,
  beneficios,
  ferias,
  rescisoes
}) => {
  const [selectedReport, setSelectedReport] = useState<'custos' | 'ponto' | 'ferias' | 'turnover'>('custos');

  // Calculations
  const folhaSalariosBruta = colaboradores.reduce((acc, c) => acc + c.profissionais.salarioBase, 0);
  const custosBeneficiosTotal = beneficios.reduce((acc, b) => acc + (b.custoEmpresaEstimado * colaboradores.length), 0);
  const encargosTrabalhistasEstimados = folhaSalariosBruta * 0.35; // 35% de encargos patronais (INSS patronal + FGTS + Riscos)
  const custoTotalDP = folhaSalariosBruta + custosBeneficiosTotal + encargosTrabalhistasEstimados;

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Colaborador,Cargo,Departamento,Salario,Status\n"
      + colaboradores.map(e => `"${e.nomeCompleto}","${e.profissionais.cargo}","${e.profissionais.departamento}",${e.profissionais.salarioBase},"${e.profissionais.status}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Relatorio_DP_MAIS_RH_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-[#2563EB]">
              <BarChart2 className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-[#1E293B]">Relatórios Inteligentes do Departamento Pessoal</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Métricas estratégicas de folha, encargos sociais, custo de colaboradores, absenteísmo e turnover.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Relatório CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Custo Total Mensal DP</span>
          <div className="text-2xl font-black text-[#1E293B] mt-1">
            {custoTotalDP.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Salários + Benefícios + Encargos Patronais</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Folha Bruta de Salários</span>
          <div className="text-2xl font-black text-blue-600 mt-1">
            {folhaSalariosBruta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{colaboradores.length} Colaboradores CLT Ativos</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Custo de Benefícios</span>
          <div className="text-2xl font-black text-purple-600 mt-1">
            {custosBeneficiosTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">VT, VR, Saúde, Seguros e Odonto</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Encargos Patronais (35%)</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {encargosTrabalhistasEstimados.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">INSS Patronal, FGTS (8%), RAT, Terceiros</p>
        </div>
      </div>

      {/* Report Selector & Details */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setSelectedReport('custos')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              selectedReport === 'custos' ? 'bg-[#2563EB] text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Custos por Departamento
          </button>
          <button
            onClick={() => setSelectedReport('ferias')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              selectedReport === 'ferias' ? 'bg-[#2563EB] text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Mapa de Férias e Vencimentos
          </button>
          <button
            onClick={() => setSelectedReport('turnover')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              selectedReport === 'turnover' ? 'bg-[#2563EB] text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Rescisões e TurnOver
          </button>
        </div>

        {selectedReport === 'custos' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-[#1E293B] text-sm">Detalhamento de Custos da Folha por Colaborador</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="p-3">Colaborador</th>
                    <th className="p-3">Cargo</th>
                    <th className="p-3">Departamento</th>
                    <th className="p-3">Salário Base</th>
                    <th className="p-3">Encargos Est. (35%)</th>
                    <th className="p-3">Custo Total Pessoal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {colaboradores.map(c => {
                    const sal = c.profissionais.salarioBase;
                    const enc = sal * 0.35;
                    const total = sal + enc;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3 font-sans font-bold text-[#1E293B]">{c.nomeCompleto}</td>
                        <td className="p-3 font-sans text-slate-600">{c.profissionais.cargo}</td>
                        <td className="p-3 font-sans text-slate-500">{c.profissionais.departamento}</td>
                        <td className="p-3 font-bold">{sal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td className="p-3 text-slate-600">{enc.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                        <td className="p-3 font-bold text-emerald-700">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedReport === 'ferias' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-[#1E293B] text-sm">Escala e Previsão Financeira de Férias</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ferias.map(f => (
                <div key={f.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex justify-between font-bold text-[#1E293B]">
                    <span>{f.colaboradorNome}</span>
                    <span className="text-[#2563EB]">{f.diasSaldo} Dias Saldo</span>
                  </div>
                  <p className="text-slate-500">{f.cargo} • {f.departamento}</p>
                  <p className="font-mono text-emerald-700 font-bold">
                    Previsão 1/3: {(f.valorUmTercoConstitucional || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedReport === 'turnover' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-[#1E293B] text-sm">Histórico de Rescisões e Impacto Financeiro</h3>
            {rescisoes.map(r => (
              <div key={r.id || r.colaboradorId} className="p-4 rounded-xl border border-slate-200 bg-rose-50/30 space-y-2">
                <div className="flex justify-between font-bold text-[#1E293B]">
                  <span>{r.colaboradorNome}</span>
                  <span className="text-rose-700">{r.tipoRescisao}</span>
                </div>
                <p className="text-slate-500">Data de Desligamento: {r.dataDesligamento} • Aviso: {r.avisoPrevio}</p>
                <p className="font-mono font-bold text-[#1E293B]">
                  Valor Rescisório Pago: {r.valorLiquidoRescisao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
