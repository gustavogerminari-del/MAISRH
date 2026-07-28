import React, { useState } from 'react';
import { 
  UserCheck, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  Percent, 
  ShieldCheck, 
  Building2, 
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { HeadhunterClient, HeadhunterReceita, HeadhunterCommission, HeadhunterGarantia } from '../types';
import { UnifiedCandidate, UnifiedJob } from '../../recruitment-core/types/recruitment';

interface HeadhunterFinalizarVagaModalProps {
  job: UnifiedJob;
  candidate: UnifiedCandidate;
  clients: HeadhunterClient[];
  onConfirm: (data: {
    dataContratacao: string;
    salarioFinal: number;
    valorCobrado: number;
    formaPagamento: 'PIX' | 'Boleto' | 'Transferência' | 'Cartão' | 'Nota Fiscal';
    vencimentoDias: number;
    numParcelas: number;
    possuiComissao: boolean;
    beneficiarioComissao: string;
    tipoComissao: 'Percentual' | 'Valor Fixo';
    valorOuPercentualComissao: number;
    prazoGarantiaDias: number;
    observacoes: string;
  }) => void;
  onClose: () => void;
}

export const HeadhunterFinalizarVagaModal: React.FC<HeadhunterFinalizarVagaModalProps> = ({
  job,
  candidate,
  clients,
  onConfirm,
  onClose,
}) => {
  const [dataContratacao, setDataContratacao] = useState(() => new Date().toISOString().split('T')[0]);
  const [salarioFinal, setSalarioFinal] = useState(job.salarioValor || 15000);
  const [valorCobrado, setValorCobrado] = useState(job.valorCobrado || job.valorNegociado || job.valorVaga || 20000);
  const [formaPagamento, setFormaPagamento] = useState<'PIX' | 'Boleto' | 'Transferência' | 'Cartão' | 'Nota Fiscal'>('Boleto');
  const [vencimentoDias, setVencimentoDias] = useState(30);
  const [numParcelas, setNumParcelas] = useState(1);
  const [possuiComissao, setPossuiComissao] = useState(true);
  const [beneficiarioComissao, setBeneficiarioComissao] = useState(job.consultorResponsavel || 'Carlos Headhunter');
  const [tipoComissao, setTipoComissao] = useState<'Percentual' | 'Valor Fixo'>('Percentual');
  const [valorOuPercentualComissao, setValorOuPercentualComissao] = useState(10);
  const [prazoGarantiaDias, setPrazoGarantiaDias] = useState(job.garantiaDias || job.prazoGarantia || 90);
  const [observacoes, setObservacoes] = useState('');

  const computedComissaoValor = poseeComissaoCalculated(valorCobrado, possuiComissao, tipoComissao, valorOuPercentualComissao);

  function poseeComissaoCalculated(base: number, possui: boolean, tipo: string, val: number) {
    if (!possui) return 0;
    if (tipo === 'Percentual') return (base * val) / 100;
    return val;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      dataContratacao,
      salarioFinal: Number(salarioFinal),
      valorCobrado: Number(valorCobrado),
      formaPagamento,
      vencimentoDias: Number(vencimentoDias),
      numParcelas: Number(numParcelas),
      possuiComissao,
      beneficiarioComissao,
      tipoComissao,
      valorOuPercentualComissao: Number(valorOuPercentualComissao),
      prazoGarantiaDias: Number(prazoGarantiaDias),
      observacoes,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Finalização da Vaga Headhunter</span>
            <h3 className="text-lg font-extrabold text-slate-900">Registrar Contratação e Faturamento</h3>
            <p className="text-xs text-slate-500">Confirme os dados da contratação para gerar automaticamente a receita, comissão e garantia do cliente.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
        </div>

        {/* Info Header Box */}
        <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-indigo-900 font-extrabold block text-sm">{job.titulo || job.cargo || 'Vaga Headhunter'}</span>
            <span className="text-indigo-700 font-medium">Cliente: {job.clienteNome || 'Cliente Corporativo'}</span>
          </div>

          <div className="bg-white px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-900 font-bold text-right shrink-0">
            <span className="text-[10px] text-slate-400 block font-normal">Candidato Contratado</span>
            <span>{candidate.nome || candidate.name}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Data da Contratação *</label>
              <input
                type="date"
                value={dataContratacao}
                onChange={e => setDataContratacao(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Salário Final do Candidato (R$) *</label>
              <input
                type="number"
                value={salarioFinal}
                onChange={e => setSalarioFinal(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Valor Cobrado / Honorário (R$) *</label>
              <input
                type="number"
                value={valorCobrado}
                onChange={e => setValorCobrado(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Forma de Pagamento *</label>
              <select
                value={formaPagamento}
                onChange={e => setFormaPagamento(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Boleto">Boleto Bancário</option>
                <option value="PIX">PIX</option>
                <option value="Transferência">Transferência Bancária</option>
                <option value="Nota Fiscal">Faturamento por NF</option>
                <option value="Cartão">Cartão de Crédito</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Prazo de Vencimento (Dias)</label>
              <input
                type="number"
                value={vencimentoDias}
                onChange={e => setVencimentoDias(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Parcelas de Faturamento</label>
              <input
                type="number"
                min="1"
                max="12"
                value={numParcelas}
                onChange={e => setNumParcelas(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* COMMISSION SECTION */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 flex items-center gap-2">
                <Percent className="w-4 h-4 text-indigo-600" />
                <span>Configurar Comissão do Headhunter / Recrutador</span>
              </span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={possuiComissao}
                  onChange={e => setPossuiComissao(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="font-bold text-slate-700">Possui Comissão</span>
              </label>
            </div>

            {possuiComissao && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Beneficiário *</label>
                  <input
                    type="text"
                    value={beneficiarioComissao}
                    onChange={e => setBeneficiarioComissao(e.target.value)}
                    required={possuiComissao}
                    className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tipo de Comissão</label>
                  <select
                    value={tipoComissao}
                    onChange={e => setTipoComissao(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Percentual">Percentual (%)</option>
                    <option value="Valor Fixo">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {tipoComissao === 'Percentual' ? 'Percentual (%)' : 'Valor Fixo (R$)'}
                  </label>
                  <input
                    type="number"
                    value={valorOuPercentualComissao}
                    onChange={e => setValorOuPercentualComissao(Number(e.target.value))}
                    required={possuiComissao}
                    className="w-full px-3 py-2 border border-slate-300 bg-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            )}

            {possuiComissao && (
              <div className="text-[11px] font-bold text-indigo-900 bg-indigo-100/60 p-2 rounded-lg text-right">
                Comissão Estimada: <span className="text-indigo-700 font-black">R$ {computedComissaoValor.toLocaleString('pt-BR')}</span>
              </div>
            )}
          </div>

          {/* WARRANTY SECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Prazo de Garantia (Dias) *</label>
              <input
                type="number"
                value={prazoGarantiaDias}
                onChange={e => setPrazoGarantiaDias(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Observações da Contratação</label>
              <input
                type="text"
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                placeholder="Ex: Contratação com início previsto para próxima semana..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Confirmar Contratação e Gerar Lançamentos</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
