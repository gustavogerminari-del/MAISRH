import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  FileText, 
  Receipt, 
  CreditCard, 
  PieChart, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { HeadhunterFinanceItem } from '../types';

interface HeadhunterFinanceiroProps {
  financial: HeadhunterFinanceItem[];
  onAddFinanceItem: (item: HeadhunterFinanceItem) => void;
  onOpenAiModal: (type: string, data?: any) => void;
}

export const HeadhunterFinanceiro: React.FC<HeadhunterFinanceiroProps> = ({
  financial,
  onAddFinanceItem,
  onOpenAiModal
}) => {
  const [activeTab, setActiveTab] = useState<'Fluxo' | 'Receber' | 'Pagar'>('Fluxo');

  const totalReceitas = financial.filter(f => f.tipo === 'Receita').reduce((acc, f) => acc + f.valor, 0);
  const totalDespesas = financial.filter(f => f.tipo === 'Despesa').reduce((acc, f) => acc + f.valor, 0);
  const lucroOperacional = totalReceitas - totalDespesas;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Módulo Financeiro & Fluxo de Caixa Executivo</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Contas a receber de clientes corporativos, contas a pagar, faturamento por PIX/Boleto e conciliação bancária.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAiModal('calcularLucro')}
            className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Análise de Lucratividade IA</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Receitas Totais</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">R$ {totalReceitas.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Despesas Totais</span>
          <p className="text-2xl font-black text-rose-600 mt-1">R$ {totalDespesas.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Lucro Líquido do Período</span>
          <p className="text-2xl font-black text-slate-900 mt-1">R$ {lucroOperacional.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-800">Lançamentos Financeiros</span>
          <div className="flex items-center gap-2">
            {['Fluxo', 'Receber', 'Pagar'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-50">
                <th className="p-3">Descrição & Centro de Custo</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Forma Pagamento</th>
                <th className="p-3 text-right">Valor</th>
                <th className="p-3 text-center">Vencimento</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {financial
                .filter(f => activeTab === 'Fluxo' || (activeTab === 'Receber' && f.tipo === 'Receita') || (activeTab === 'Pagar' && f.tipo === 'Despesa'))
                .map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <strong className="text-slate-900 block">{item.descricao}</strong>
                      <span className="text-slate-400 text-[11px]">{item.centroCusto}</span>
                    </td>
                    <td className="p-3 font-bold">
                      <span className={item.tipo === 'Receita' ? 'text-emerald-600' : 'text-rose-600'}>
                        {item.tipo}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-600">{item.formaPagamento}</td>
                    <td className="p-3 text-right font-black text-slate-900">R$ {item.valor.toLocaleString('pt-BR')}</td>
                    <td className="p-3 text-center font-medium text-slate-600">{item.dataVencimento}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                        item.statusFinanceiro === 'Pago' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.statusFinanceiro}
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
