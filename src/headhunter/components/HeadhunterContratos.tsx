import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Building2,
  Calendar
} from 'lucide-react';
import { HeadhunterContract, HeadhunterClient } from '../types';

interface HeadhunterContratosProps {
  contracts: HeadhunterContract[];
  clients: HeadhunterClient[];
  onAddContract: (contract: HeadhunterContract) => void;
  onOpenAiModal: (type: string, data?: any) => void;
}

export const HeadhunterContratos: React.FC<HeadhunterContratosProps> = ({
  contracts,
  clients,
  onAddContract,
  onOpenAiModal
}) => {
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Gestão Contratual & Documentos Jurídicos</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Armazenamento de contratos mãe, aditivos comerciais, tabelas de honorários, NDAs e termos de confidencialidade.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAiModal('alertarContratosVencendo')}
            className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Alertar Contratos Vencendo IA</span>
          </button>

          <button
            onClick={() => onOpenAiModal('criarContrato')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Gerar Minuta de Contrato com IA</span>
          </button>
        </div>
      </div>

      {/* CONTRACTS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-800">Contratos Corporativos Vigentes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-50">
                <th className="p-3">Título do Documento & Tipo</th>
                <th className="p-3">Cliente Corporativo</th>
                <th className="p-3">Condições negociadas</th>
                <th className="p-3 text-center">Vigência</th>
                <th className="p-3 text-center">Assinatura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {contracts.map(ctr => (
                <tr key={ctr.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <strong className="text-slate-900 block">{ctr.tituloContrato}</strong>
                    <span className="text-slate-400 text-[11px]">{ctr.tipo}</span>
                  </td>
                  <td className="p-3 font-bold text-slate-800">{ctr.clienteNome}</td>
                  <td className="p-3 font-medium text-slate-700">{ctr.valorOuPercentual}</td>
                  <td className="p-3 text-center font-medium text-slate-600">{ctr.dataInicio} até {ctr.dataVencimento}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full ${
                      ctr.assinado ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ctr.assinado ? 'Assinado' : 'Pendente Assinatura'}
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
