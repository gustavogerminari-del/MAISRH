import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { HeadhunterClient } from '../types';

interface HeadhunterClientesProps {
  clients: HeadhunterClient[];
  onAddClient: (client: HeadhunterClient) => void;
  onOpenAiModal: (type: string, data?: any) => void;
}

export const HeadhunterClientes: React.FC<HeadhunterClientesProps> = ({
  clients,
  onAddClient,
  onOpenAiModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedClient, setSelectedClient] = useState<HeadhunterClient | null>(clients[0] || null);

  // New Client Modal
  const [showModal, setShowModal] = useState(false);
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [segmento, setSegmento] = useState('Tecnologia & SaaS');
  const [porte, setPorte] = useState('Grande');
  const [qtdFuncionarios, setQtdFuncionarios] = useState(100);
  const [responsavel, setResponsavel] = useState('');
  const [cargoResponsavel, setCargoResponsavel] = useState('Diretor de RH');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [site, setSite] = useState('');
  const [endereco, setEndereco] = useState('');
  const [valorPadraoVaga, setValorPadraoVaga] = useState(15000);
  const [comissaoPercent, setComissaoPercent] = useState(20);
  const [formaCobranca, setFormaCobranca] = useState('Exclusividade 100% no Sucesso');
  const [prazoPagamentoDias, setPrazoPagamentoDias] = useState(30);

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.cnpj.includes(searchTerm);
    const matchesStatus = selectedStatus === 'Todos' || c.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: HeadhunterClient = {
      id: `cli-${Date.now()}`,
      empresaId: 'emp-001',
      criadoPor: 'Headhunter Logado',
      criadoEm: new Date().toISOString().split('T')[0],
      status: 'Ativo',
      razaoSocial,
      nomeFantasia,
      cnpj,
      segmento,
      porte,
      qtdFuncionarios,
      responsavel,
      cargoResponsavel,
      telefone,
      whatsapp,
      email,
      site,
      endereco,
      valorPadraoVaga,
      comissaoNegociadaPercent: comissaoPercent,
      formaCobranca,
      prazoPagamentoDias,
      contratoAtivo: true,
      historico: [{ data: new Date().toISOString().split('T')[0], descricao: 'Cliente cadastrado no sistema.', autor: 'Headhunter' }],
      reunioesCount: 1,
      pendenciasCount: 0,
      vagasCount: 0
    };

    onAddClient(newClient);
    setShowModal(false);
    setSelectedClient(newClient);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Carteira de Clientes Headhunter</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão cadastral, condições comerciais negociadas, acordos contratuais e histórico de relacionamento.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAiModal('clientesLucrativos')}
            className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analisar Clientes Mais Lucrativos IA</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cliente Corporativo</span>
          </button>
        </div>
      </div>

      {/* Main split view: List vs Detailed Spec */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Clients List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por razão social, nome fantasia, CNPJ..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">Filtrar:</span>
              {['Todos', 'Ativo', 'Inativo'].map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedStatus === st
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredClients.map(cli => (
              <div
                key={cli.id}
                onClick={() => setSelectedClient(cli)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedClient?.id === cli.id
                    ? 'bg-indigo-50/50 border-indigo-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{cli.nomeFantasia}</h4>
                    <p className="text-[11px] text-slate-500 font-medium">{cli.razaoSocial}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                    cli.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {cli.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-medium">Segmento:</span>
                    <p className="font-bold text-slate-700">{cli.segmento}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Comissão Vaga:</span>
                    <p className="font-bold text-indigo-600">{cli.comissaoNegociadaPercent}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Detailed Client File */}
        <div className="lg:col-span-7">
          {selectedClient ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-black text-slate-900">{selectedClient.nomeFantasia}</h3>
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                      selectedClient.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {selectedClient.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{selectedClient.razaoSocial} • CNPJ: {selectedClient.cnpj}</p>
                </div>

                <button
                  onClick={() => onOpenAiModal('mensagemCliente', { clientName: selectedClient.nomeFantasia, contact: selectedClient.responsavel })}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Gerar Mensagem IA</span>
                </button>
              </div>

              {/* DADOS CADASTRAIS */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Dados Cadastrais & Porte</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium block">Segmento</span>
                    <strong className="text-slate-800">{selectedClient.segmento}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Porte da Empresa</span>
                    <strong className="text-slate-800">{selectedClient.porte}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Funcionários</span>
                    <strong className="text-slate-800">{selectedClient.qtdFuncionarios} colaboradores</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Responsável Principal</span>
                    <strong className="text-slate-800">{selectedClient.responsavel} ({selectedClient.cargoResponsavel})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">Contato / WhatsApp</span>
                    <strong className="text-slate-800">{selectedClient.whatsapp || selectedClient.telefone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block">E-mail Corporativo</span>
                    <strong className="text-slate-800">{selectedClient.email}</strong>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-slate-400 font-medium block">Endereço Completo</span>
                    <strong className="text-slate-800">{selectedClient.endereco}</strong>
                  </div>
                </div>
              </div>

              {/* CONDIÇÕES COMERCIAIS */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Condições Comerciais & Faturamento</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 text-xs">
                  <div>
                    <span className="text-indigo-600 font-medium block">Valor Padrão Vaga</span>
                    <strong className="text-slate-900 text-sm">R$ {selectedClient.valorPadraoVaga.toLocaleString('pt-BR')}</strong>
                  </div>
                  <div>
                    <span className="text-indigo-600 font-medium block">Comissão Acordada</span>
                    <strong className="text-indigo-700 text-sm">{selectedClient.comissaoNegociadaPercent}%</strong>
                  </div>
                  <div>
                    <span className="text-indigo-600 font-medium block">Forma de Cobrança</span>
                    <strong className="text-slate-900">{selectedClient.formaCobranca}</strong>
                  </div>
                  <div>
                    <span className="text-indigo-600 font-medium block">Prazo de Pagamento</span>
                    <strong className="text-slate-900">{selectedClient.prazoPagamentoDias} dias</strong>
                  </div>
                </div>
              </div>

              {/* RELACIONAMENTOS & HISTÓRICO */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Histórico de Interações</h4>
                  <span className="text-xs text-slate-500 font-semibold">{selectedClient.vagasCount} Vagas Abertas</span>
                </div>

                <div className="space-y-2">
                  {selectedClient.historico.map((h, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                        <span>{h.data}</span>
                        <span>{h.autor}</span>
                      </div>
                      <p className="text-slate-800 font-medium">{h.descricao}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
              Selecione um cliente para visualizar os detalhes.
            </div>
          )}
        </div>
      </div>

      {/* New Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Cadastrar Novo Cliente Corporativo</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Razão Social</label>
                  <input required type="text" value={razaoSocial} onChange={e => setRazaoSocial(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome Fantasia</label>
                  <input required type="text" value={nomeFantasia} onChange={e => setNomeFantasia(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CNPJ</label>
                  <input required type="text" placeholder="00.000.000/0001-00" value={cnpj} onChange={e => setCnpj(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Segmento</label>
                  <input required type="text" value={segmento} onChange={e => setSegmento(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Responsável / Cargo</label>
                  <input required type="text" value={responsavel} onChange={e => setResponsavel(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp / Telefone</label>
                  <input required type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">E-mail Corporativo</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valor Padrão por Vaga (R$)</label>
                  <input required type="number" value={valorPadraoVaga} onChange={e => setValorPadraoVaga(Number(e.target.value))} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Comissão Negociada (%)</label>
                  <input required type="number" value={comissaoPercent} onChange={e => setComissaoPercent(Number(e.target.value))} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prazo Pagamento (Dias)</label>
                  <input required type="number" value={prazoPagamentoDias} onChange={e => setPrazoPagamentoDias(Number(e.target.value))} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Endereço Completo</label>
                <input required type="text" value={endereco} onChange={e => setEndereco(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl cursor-pointer hover:bg-indigo-700">Salvar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
