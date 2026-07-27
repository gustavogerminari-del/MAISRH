import React from 'react';
import { Clock, Calendar, ShieldCheck, Scale, FileText } from 'lucide-react';
import { RegistroPontoDoc } from '../types/ponto';
import { useAuth } from '../../auth';

interface AreaFuncionariomeuPontoProps {
  registros: RegistroPontoDoc[];
  onAbrirRegistroPonto: () => void;
}

export const AreaFuncionariomeuPonto: React.FC<AreaFuncionariomeuPontoProps> = ({
  registros,
  onAbrirRegistroPonto,
}) => {
  const { user } = useAuth();
  const myRegistros = registros.filter(r => r.funcionarioId === user?.id || true);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Meu Ponto - Visão do Colaborador</h2>
          <p className="text-xs text-slate-500">Acompanhe seu histórico de registros diários, horas extras e espelho pessoal</p>
        </div>

        <button
          onClick={onAbrirRegistroPonto}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Clock className="w-4 h-4" /> Bater Ponto Agora
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Seus Últimos Registros de Ponto</h3>
        </div>

        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-100/70 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3">Data</th>
              <th className="p-3">Entrada</th>
              <th className="p-3">Início Pausa</th>
              <th className="p-3">Fim Pausa</th>
              <th className="p-3">Saída</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
            {myRegistros.slice(0, 10).map(r => (
              <tr key={r.id} className="hover:bg-slate-50/50">
                <td className="p-3 font-sans font-bold text-slate-800">{r.data}</td>
                <td className="p-3 font-bold text-slate-900">{r.horaEntrada || '--:--'}</td>
                <td className="p-3 text-slate-600">{r.inicioIntervalo || '--:--'}</td>
                <td className="p-3 text-slate-600">{r.retornoIntervalo || '--:--'}</td>
                <td className="p-3 font-bold text-slate-900">{r.horaSaida || '--:--'}</td>
                <td className="p-3 font-sans">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
