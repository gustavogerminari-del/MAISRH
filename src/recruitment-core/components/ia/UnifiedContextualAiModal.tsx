import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  FileText, 
  UserCheck, 
  DollarSign, 
  Send, 
  Copy, 
  Check, 
  TrendingUp, 
  Building2, 
  Briefcase 
} from 'lucide-react';
import { OrigemProcesso } from '../../types/recruitment';

interface UnifiedContextualAiModalProps {
  origemProcesso: OrigemProcesso;
  initialActionType?: string;
  initialData?: any;
  onClose: () => void;
}

export const UnifiedContextualAiModal: React.FC<UnifiedContextualAiModalProps> = ({
  origemProcesso,
  initialActionType = 'descricaoVaga',
  initialData,
  onClose
}) => {
  const isHeadhunter = origemProcesso === 'headhunter';

  const [activeAction, setActiveAction] = useState<string>(initialActionType);
  const [promptInput, setPromptInput] = useState<string>(initialData?.jobTitle || initialData?.candidateName || '');
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      let result = '';
      switch (activeAction) {
        case 'descricaoVaga':
          result = `**DESCRIÇÃO PROFISSIONAL DA VAGA: ${promptInput || 'Executive Position'}**\n\n` +
            `**Objetivo da Posição:** Liderar e otimizar processos estratégicos na organização.\n\n` +
            `**Principais Responsabilidades:**\n` +
            `- Liderança de equipes multidisciplinares e gestão por indicadores de desempenho (KPIs).\n` +
            `- Planejamento e execução de estratégias corporativas alinhadas aos objetivos da empresa.\n` +
            `- Interface direta com stakeholders, diretoria e clientes de grande porte.\n\n` +
            `**Requisitos Ocultos & Perfil Desejado:**\n` +
            `- Formação superior concluída com pós-graduação ou MBA desejável.\n` +
            `- Experiência sólida na área de atuação.\n` +
            `- Excelente capacidade analítica, visão sistêmica e comunicação interpessoal.`;
          break;

        case 'analisarCurriculo':
          result = `**ANÁLISE E TRIAGEM TÉCNICA DE CURRÍCULO COM IA**\n\n` +
            `**Candidato:** ${promptInput || 'Candidato sob Análise'}\n` +
            `**Score de Aderência:** 92% (Compatibilidade Alta)\n\n` +
            `**Pontos Fortes Identificados:**\n` +
            `- Extensa trajetória com crescimento acelerado na carreira.\n` +
            `- Domínio comprovado de ferramentas, metodologias e gestão de projetos complexos.\n` +
            `- Estabilidade comprovada em experiências anteriores.\n\n` +
            `**Pontos de Atenção / Aprofundar na Entrevista:**\n` +
            `- Verificar disponibilidade para início e pretensão salarial definitiva.\n` +
            `- Validar fluência em idiomas caso exigido pela posição.`;
          break;

        case 'roteiroEntrevista':
          result = `**ROTEIRO DE ENTREVISTA ESTRUTURADA E BEHAVIORAL**\n\n` +
            `**Para a Vaga:** ${promptInput || 'Posição Chave'}\n\n` +
            `**Perguntas Comportamentais Recomendadas:**\n` +
            `1. *Descreva uma situação em que você teve que liderar uma mudança crítica sob forte pressão.*\n` +
            `2. *Como você lida com divergências de expectativas entre a liderança executiva e a equipe operacional?*\n` +
            `3. *Compartilhe um caso real onde uma decisão tomada gerou impacto financeiro direto para o negócio.*`;
          break;

        case 'abordagemExecutiva':
          result = `**MENSAGEM DE ABORDAGEM EXECUTIVA (HEADHUNTER HUNTING)**\n\n` +
            `Olá, ${promptInput || 'Prezado(a)'}.\n\n` +
            `Acompanho com entusiasmo sua trajetória profissional e fiquei muito impressionado(a) com suas conquistas recentes.\n\n` +
            `Atualmente, estou conduzindo um processo de Executive Search para uma posição estratégica em um grande player do setor. Acredito que seu perfil possui um alinhamento excepcional com o escopo de atuação e cultura dessa organização.\n\n` +
            `Você teria 10 minutos nesta semana para uma conversa confidencial sobre esta oportunidade?\n\n` +
            `Atenciosamente,\n` +
            `*Headhunter Senior - MAIS RH*`;
          break;

        case 'apresentacaoCliente':
          result = `**RELATÓRIO DE APRESENTAÇÃO DE CANDIDATO AO CLIENTE**\n\n` +
            `**Candidato Apresentado:** ${promptInput || 'Candidato Recomendado'}\n` +
            `**Status da Triagem:** Recomendado para Entrevista com Diretoria\n\n` +
            `**Parecer do Headhunter:**\n` +
            `Profissional com sólida maturidade corporativa, excelente dicção e histórico consistente em grandes contas. Demonstrou forte aderência aos valores do cliente e prontidão imediata para assumir o desafio.\n\n` +
            `**Resumo de Remuneração e Pretensão:** Pretensão Salarial de acordo com o orçamento da vaga.`;
          break;

        case 'analisarRentabilidade':
          result = `**ANÁLISE DE RENTABILIDADE E MARGEM DE COMISSÃO DA VAGA**\n\n` +
            `**Vaga / Projeto:** ${promptInput || 'Search Executivo'}\n` +
            `**Honorário Bruto Estimado:** R$ 25.000,00\n` +
            `**Comissão Alocada (20%):** R$ 5.000,00\n` +
            `**Margem Operacional Líquida:** 80%\n\n` +
            `**Conclusão da IA:** Operação altamente rentável com excelente retorno sobre o tempo investido do consultor (SLA projetado de 15 dias).`;
          break;

        default:
          result = `**ANÁLISE DE IA GERADA PARA:** ${promptInput}\n\nRecomendações e orientações estratégicas geradas com sucesso com base nas melhores práticas do mercado de Recrutamento & Headhunter.`;
          break;
      }

      setGeneratedText(result);
      setLoading(false);
    }, 700);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Assistente de IA Recrutamento & Headhunter
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">
                {isHeadhunter ? 'Ações Corporativas & Comerciais' : 'Ações de Recrutamento Interno'}
              </span>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons Switcher */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveAction('descricaoVaga')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeAction === 'descricaoVaga' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Descrição de Vaga
          </button>

          <button
            onClick={() => setActiveAction('analisarCurriculo')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeAction === 'analisarCurriculo' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Analisar Currículo
          </button>

          <button
            onClick={() => setActiveAction('roteiroEntrevista')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeAction === 'roteiroEntrevista' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Roteiro de Entrevista
          </button>

          {isHeadhunter && (
            <>
              <button
                onClick={() => setActiveAction('abordagemExecutiva')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeAction === 'abordagemExecutiva' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Abordagem Headhunter
              </button>

              <button
                onClick={() => setActiveAction('apresentacaoCliente')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeAction === 'apresentacaoCliente' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Apresentação ao Cliente
              </button>

              <button
                onClick={() => setActiveAction('analisarRentabilidade')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeAction === 'analisarRentabilidade' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rentabilidade & Fee
              </button>
            </>
          )}
        </div>

        {/* Input & Action Trigger */}
        <div className="space-y-2 text-xs">
          <label className="block font-bold text-slate-700">Parâmetro de Pesquisa / Nome / Cargo</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={promptInput}
              onChange={e => setPromptInput(e.target.value)}
              placeholder="Digite o título da vaga, nome do candidato ou empresa..."
              className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{loading ? 'Gerando...' : 'Gerar com IA'}</span>
            </button>
          </div>
        </div>

        {/* Output Text Area */}
        {generatedText && (
          <div className="space-y-2 text-xs pt-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">Resultado IA Gerado</span>
              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {generatedText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
