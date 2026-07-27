import React, { useState } from 'react';
import { 
  LogOut, 
  Calculator, 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Download, 
  Plus, 
  User, 
  X,
  FileCheck,
  ShieldAlert
} from 'lucide-react';
import { CalculoRescisorio, ColaboradorCompleto, TipoRescisao } from '../types/dp';

interface CalculoRescisaoProps {
  rescisoes: CalculoRescisorio[];
  colaboradores: ColaboradorCompleto[];
  onSalvarRescisao: (rescisao: CalculoRescisorio) => void;
  companyId: string;
}

export const CalculoRescisao: React.FC<CalculoRescisaoProps> = ({
  rescisoes,
  colaboradores,
  onSalvarRescisao,
  companyId
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRescisao, setSelectedRescisao] = useState<CalculoRescisorio | null>(rescisoes[0] || null);

  // Form State for new simulation
  const [selectedColabId, setSelectedColabId] = useState(colaboradores[0]?.id || '');
  const [tipoRescisao, setTipoRescisao] = useState<TipoRescisao>('Demissão sem Justa Causa (Iniciativa do Empregador)');
  const [dataDesligamento, setDataDesligamento] = useState(new Date().toISOString().split('T')[0]);
  const [avisoPrevioOption, setAvisoPrevioOption] = useState<'Indenizado' | 'Trabalhado' | 'Dispensado'>('Indenizado');

  const colabTarget = colaboradores.find(c => c.id === selectedColabId) || colaboradores[0];

  // Perform realtime calculations for selected employee
  const calcularRescisaoInstantanea = (): CalculoRescisorio => {
    const salario = colabTarget?.profissionais.salarioBase || 5000;
    const dataAdm = new Date(colabTarget?.profissionais.dataAdmissao || '2023-01-01');
    const dataDesl = new Date(dataDesligamento);

    // Calculate years of service
    const diffYears = Math.floor((dataDesl.getTime() - dataAdm.getTime()) / (1000 * 3600 * 24 * 365));
    const diasAviso = Math.min(90, 30 + (diffYears * 3)); // Lei do Aviso Prévio Proporcional

    // Saldo Salario
    const diaDoMesDesligamento = dataDesl.getDate();
    const valorSaldo = (salario / 30) * diaDoMesDesligamento;

    // Aviso Previo Indenizado
    const valorAviso = avisoPrevioOption === 'Indenizado' ? (salario / 30) * diasAviso : 0;

    // 13º Proporcional (Months worked in current year)
    const mesAtual = dataDesl.getMonth() + 1;
    const valor13 = (salario / 12) * mesAtual;

    // Férias Proporcionais
    const valorFeriasProp = (salario / 12) * mesAtual;
    const umTercoFerias = (valorFeriasProp + salario) / 3;

    // Proventos & Descontos
    const totalProventos = valorSaldo + valorAviso + valor13 + valorFeriasProp + umTercoFerias;
    const descInss = Math.min(908.85, totalProventos * 0.11);
    const descIrrf = Math.max(0, (totalProventos - descInss) * 0.15 - 381.44);
    const totalDescontos = descInss + descIrrf;

    const saldoFgtsEstimado = salario * 8 * 12; // Estimativa simples
    const multaPercentual = tipoRescisao.includes('sem Justa Causa') ? 40 : tipoRescisao.includes('Acordo') ? 20 : 0;
    const valorMulta = (saldoFgtsEstimado * multaPercentual) / 100;

    return {
      companyId,
      colaboradorId: colabTarget?.id || 'colab-001',
      colaboradorNome: colabTarget?.nomeCompleto || 'Colaborador',
      cargo: colabTarget?.profissionais.cargo || 'Cargo',
      salarioBase: salario,
      dataAdmissao: colabTarget?.profissionais.dataAdmissao || '2023-01-01',
      dataDesligamento,
      tipoRescisao,
      avisoPrevio: avisoPrevioOption,
      diasAvisoPrevio: diasAviso,
      saldoSalarioDias: diaDoMesDesligamento,
      valorSaldoSalario: valorSaldo,
      valorAvisoPrevioIndenizado: valorAviso,
      meses13Proporcional: mesAtual,
      valor13Proporcional: valor13,
      mesesFeriasProporcionais: mesAtual,
      valorFeriasProporcionais: valorFeriasProp,
      valorFeriasVencidas: 0,
      valorUmTercoFerias: umTercoFerias,
      descontoInss: descInss,
      descontoIrrf: descIrrf,
      descontoFaltasAtrasos: 0,
      descontoAvisoPrevioNaoCumprido: 0,
      totalProventos,
      totalDescontos,
      valorLiquidoRescisao: totalProventos - totalDescontos,
      saldoFgtsEstimado,
      multaFgtsPercentual: multaPercentual,
      valorMultaFgts: valorMulta,
      status: 'Simulação'
    };
  };

  const simulaçãoAtual = calcularRescisaoInstantanea();

  const handleSalvarSimulacao = () => {
    const comId: CalculoRescisorio = {
      ...simulaçãoAtual,
      id: `resc-${Date.now()}`,
      status: 'Aprovado RH'
    };
    onSalvarRescisao(comId);
    setSelectedRescisao(comId);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <LogOut className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-[#1E293B]">Cálculo Rescisório & Desligamentos (TRCT)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulação de verbas rescisórias, aviso prévio proporcional, multa FGTS e homologação eSocial.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Simular Nova Rescisão</span>
        </button>
      </div>

      {/* Main Content Split: List vs Detailed TRCT Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saved Rescisions List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
          <h3 className="font-bold text-[#1E293B] text-sm border-b border-slate-100 pb-2">Rescisões Homologadas / Em Análise</h3>

          {rescisoes.map(r => (
            <div
              key={r.id || r.colaboradorId}
              onClick={() => setSelectedRescisao(r)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedRescisao?.id === r.id ? 'border-[#2563EB] bg-blue-50/40 shadow-xs' : 'border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-[#1E293B] text-xs">{r.colaboradorNome}</h4>
                  <p className="text-[11px] text-slate-500">{r.cargo}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {r.status}
                </span>
              </div>

              <div className="mt-2 text-[11px] flex items-center justify-between font-mono">
                <span className="text-slate-500">Valor Líquido:</span>
                <span className="font-bold text-[#1E293B]">
                  {r.valorLiquidoRescisao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Detailed TRCT Viewer */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          {selectedRescisao ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                    Demonstrativo TRCT
                  </span>
                  <h3 className="text-base font-bold text-[#1E293B] mt-1">{selectedRescisao.colaboradorNome}</h3>
                  <p className="text-xs text-slate-500">{selectedRescisao.tipoRescisao}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer text-xs font-bold flex items-center gap-1"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir TRCT</span>
                  </button>
                </div>
              </div>

              {/* Proventos vs Descontos Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Proventos */}
                <div className="bg-emerald-50/50 rounded-xl border border-emerald-200/80 p-4 space-y-2">
                  <h4 className="font-bold text-emerald-800 border-b border-emerald-200 pb-1">➕ Proventos Rescisórios</h4>
                  
                  <div className="flex justify-between py-0.5">
                    <span>Saldo de Salário ({selectedRescisao.saldoSalarioDias} dias):</span>
                    <span className="font-mono font-bold">{selectedRescisao.valorSaldoSalario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>

                  <div className="flex justify-between py-0.5">
                    <span>Aviso Prévio Indenizado ({selectedRescisao.diasAvisoPrevio}d):</span>
                    <span className="font-mono font-bold">{selectedRescisao.valorAvisoPrevioIndenizado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>

                  <div className="flex justify-between py-0.5">
                    <span>13º Salário Proporcional ({selectedRescisao.meses13Proporcional}/12):</span>
                    <span className="font-mono font-bold">{selectedRescisao.valor13Proporcional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>

                  <div className="flex justify-between py-0.5">
                    <span>Férias Proporcionais + 1/3:</span>
                    <span className="font-mono font-bold">{(selectedRescisao.valorFeriasProporcionais + selectedRescisao.valorUmTercoFerias).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>

                  <div className="flex justify-between border-t border-emerald-300 pt-2 font-bold text-emerald-900">
                    <span>Total Proventos:</span>
                    <span className="font-mono text-sm">{selectedRescisao.totalProventos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                </div>

                {/* Descontos */}
                <div className="bg-rose-50/50 rounded-xl border border-rose-200/80 p-4 space-y-2">
                  <h4 className="font-bold text-rose-800 border-b border-rose-200 pb-1">➖ Descontos Legais</h4>

                  <div className="flex justify-between py-0.5">
                    <span>Desconto INSS Rescisão:</span>
                    <span className="font-mono font-bold">{selectedRescisao.descontoInss.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>

                  <div className="flex justify-between py-0.5">
                    <span>Desconto IRRF Rescisão:</span>
                    <span className="font-mono font-bold">{selectedRescisao.descontoIrrf.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>

                  <div className="flex justify-between border-t border-rose-300 pt-2 font-bold text-rose-900">
                    <span>Total Descontos:</span>
                    <span className="font-mono text-sm">{selectedRescisao.totalDescontos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                </div>
              </div>

              {/* Total Final Rescisão & FGTS */}
              <div className="bg-[#1E293B] text-white p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Valor Líquido a Pagar ao Colaborador</span>
                  <div className="text-3xl font-black font-mono text-emerald-400 mt-0.5">
                    {selectedRescisao.valorLiquidoRescisao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>

                <div className="text-right border-t md:border-t-0 md:border-l border-slate-700 pt-3 md:pt-0 md:pl-6">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Multa Rescisória FGTS ({selectedRescisao.multaFgtsPercentual}%)</span>
                  <span className="text-lg font-mono font-bold text-amber-300">
                    {selectedRescisao.valorMultaFgts.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Nenhuma rescisão selecionada.
            </div>
          )}
        </div>
      </div>

      {/* Modal New Rescision Simulator */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-[#1E293B] text-sm">Simulador de Rescisão de Contrato CLT</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Selecionar Colaborador</label>
                <select
                  value={selectedColabId}
                  onChange={(e) => setSelectedColabId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                >
                  {colaboradores.map(c => (
                    <option key={c.id} value={c.id}>{c.nomeCompleto} - {c.profissionais.cargo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo de Rescisão</label>
                <select
                  value={tipoRescisao}
                  onChange={(e) => setTipoRescisao(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                >
                  <option value="Demissão sem Justa Causa (Iniciativa do Empregador)">Demissão sem Justa Causa (Empregador)</option>
                  <option value="Pedido de Demissão (Iniciativa do Empregado)">Pedido de Demissão (Empregado)</option>
                  <option value="Demissão com Justa Causa">Demissão com Justa Causa</option>
                  <option value="Acordo Mútuo (Art. 484-A CLT)">Acordo Mútuo (Art. 484-A CLT)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Data de Desligamento</label>
                  <input
                    type="date"
                    value={dataDesligamento}
                    onChange={(e) => setDataDesligamento(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Aviso Prévio</label>
                  <select
                    value={avisoPrevioOption}
                    onChange={(e) => setAvisoPrevioOption(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="Indenizado">Indenizado</option>
                    <option value="Trabalhado">Trabalhado</option>
                    <option value="Dispensado">Dispensado</option>
                  </select>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Resultado Estimado da Rescisão</span>
                <p>Valor Líquido: <strong className="text-emerald-400 font-mono text-base">{simulaçãoAtual.valorLiquidoRescisao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></p>
                <p className="text-[11px] text-slate-300">Aviso prévio: {simulaçãoAtual.diasAvisoPrevio} dias • Multa FGTS ({simulaçãoAtual.multaFgtsPercentual}%): {simulaçãoAtual.valorMultaFgts.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSalvarSimulacao}
                  className="px-4 py-1.5 bg-[#2563EB] text-white font-bold rounded-xl cursor-pointer"
                >
                  Confirmar Rescisão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
