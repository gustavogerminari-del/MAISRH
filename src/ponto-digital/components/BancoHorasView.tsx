import React from 'react';
import { Scale, TrendingUp, TrendingDown, Clock, ShieldCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BancoHorasDoc } from '../types/ponto';
import { formatarMinutosEmHoras } from '../services/pontoService';

interface BancoHorasViewProps {
  bancoHoras: BancoHorasDoc[];
}

export const BancoHorasView: React.FC<BancoHorasViewProps> = ({ bancoHoras }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900">Banco de Horas & Compensações</h2>
        <p className="text-xs text-slate-500">Gestão centralizada de saldos acumulados de horas extras e débitos por colaborador</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bancoHoras.map(bh => {
          const isPositivo = bh.saldoMinutos >= 0;
          return (
            <div key={bh.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{bh.funcionarioNome}</h3>
                  <p className="text-[11px] text-slate-400">Última atualização: {bh.ultimaAtualizacao}</p>
                </div>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                  isPositivo ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  <Scale className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900 text-white p-4 rounded-xl text-center space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Saldo Geral de Banco</p>
                <p className={`text-2xl font-black font-mono ${isPositivo ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatarMinutosEmHoras(bh.saldoMinutos)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100/80">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-0.5">Crédito (+HE)</span>
                  <span className="font-bold text-emerald-900 font-mono">{formatarMinutosEmHoras(bh.creditoMinutos)}</span>
                </div>
                <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100/80">
                  <span className="text-[10px] font-bold text-rose-800 uppercase block mb-0.5">Débito (-Atraso)</span>
                  <span className="font-bold text-rose-900 font-mono">{formatarMinutosEmHoras(bh.debitoMinutos)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
