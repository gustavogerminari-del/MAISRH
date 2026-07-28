import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Copy, X } from 'lucide-react';
import { aiService } from '../../ai/services/aiService';

interface HeadhunterAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: string;
  initialData?: any;
  onConfirmSave?: (content: string) => void;
}

export const HeadhunterAiModal: React.FC<HeadhunterAiModalProps> = ({
  isOpen,
  onClose,
  actionType,
  initialData,
  onConfirmSave
}) => {
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getTitle = () => {
    switch (actionType) {
      case 'gerarDescricaoVaga': return 'Criação / Aprimoramento de Descrição de Vaga Executiva';
      case 'encontrarCandidatosIdeais': return 'Busca Inteligente de Candidatos Ideais';
      case 'parecerTecnico': return 'Emissão de Parecer Técnico do Headhunter';
      case 'feedbackEntrevista': return 'Geração de Feedback Estruturado para Entrevista';
      case 'propostaComercial': return 'Geração de Proposta Comercial de Executive Search';
      case 'criarContrato': return 'Geração de Minuta Contratual Corporativa';
      case 'calcularComissão': return 'Cálculo de Comissões & Regras de Reparte';
      case 'calcularLucro': return 'Análise de Lucratividade por Vaga & Cliente';
      case 'clientesLucrativos': return 'Mapeamento de Clientes Mais Lucrativos';
      case 'alertarContratosVencendo': return 'Auditoria de Contratos Próximos do Vencimento';
      case 'alertarVagasParadas': return 'Auditoria de Vagas Paradas e Gargalos de SLA';
      case 'resumoExecutivo': return 'Resumo Executivo do Desempenho do Headhunter';
      case 'mensagemCliente': return 'Redação de Mensagem Personalizada para Cliente';
      case 'mensagemCandidato': return 'Redação de Mensagem Personalizada para Candidato';
      default: return 'Assistente de Inteligência Artificial para Headhunters';
    }
  };

  const handleExecuteAi = async () => {
    setLoading(true);
    setResultText('');
    try {
      let promptText = '';
      switch (actionType) {
        case 'gerarDescricaoVaga':
          promptText = `Crie uma descrição de vaga executiva completa para o mercado corporativo, incluindo escopo estratégico, perfil desejado, principais KPIs e benefícios de atração. Vaga: ${initialData?.jobTitle || 'Diretor de Tecnologia'}.`;
          break;
        case 'parecerTecnico':
          promptText = `Gere um parecer técnico sênior de avaliação executiva para o candidato ${initialData?.candidateName || 'Eduardo'}, que disputa o cargo de ${initialData?.jobTitle || 'Head of Growth'}. Avalie maturidade, liderança e encaixe estratégico.`;
          break;
        case 'feedbackEntrevista':
          promptText = `Crie um feedback construtivo e profissional pós-entrevista para o candidato ${initialData?.candidateName || 'Candidato'}, ressaltando pontos fortes e direcionamento de carreira.`;
          break;
        case 'propostaComercial':
          promptText = `Elabore uma proposta comercial formal de prestação de serviços de Executive Search para a empresa ${initialData?.company || 'Empresa Cliente'}, detalhando cláusulas de honorários, garantia de substituição de 90 dias e SLA de apresentação de shortlist.`;
          break;
        case 'resumoExecutivo':
          promptText = `Elabore um resumo executivo de desempenho do módulo de Headhunter do MAIS RH, destacando taxa de conversão de vagas, faturamento de honorários, tempo médio de fechamento e recomendações táticas.`;
          break;
        default:
          promptText = `Gere uma análise tática e detalhada para a ação executiva de Headhunting: ${getTitle()}.`;
          break;
      }

      const res = await aiService.reports.generateExecutiveSummary({
        period: 'Ano Vigente',
        metrics: { prompt: promptText, title: getTitle(), initialData }
      });

      setResultText(res.result || 'Análise executiva concluída com sucesso.');
    } catch (err) {
      setResultText('Ocorreu um erro ao gerar a análise. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{getTitle()}</h3>
              <p className="text-[11px] text-slate-500 font-medium">Motor de Inteligência Artificial do MAIS RH Headhunter</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!resultText && !loading && (
          <div className="p-8 text-center space-y-4 bg-slate-50 rounded-2xl border border-slate-100">
            <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-xs text-slate-600 max-w-md mx-auto font-medium">
              Clique abaixo para processar esta solicitação utilizando a Inteligência Artificial especializada em Executive Search do MAIS RH.
            </p>
            <button
              onClick={handleExecuteAi}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Processar com IA</span>
            </button>
          </div>
        )}

        {loading && (
          <div className="p-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-extrabold text-slate-700">A Inteligência Artificial do Headhunter está gerando o documento...</p>
          </div>
        )}

        {resultText && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-h-80 overflow-y-auto text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-line">
              {resultText}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Fechar
                </button>
                {onConfirmSave && (
                  <button
                    onClick={() => {
                      onConfirmSave(resultText);
                      onClose();
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar e Salvar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
