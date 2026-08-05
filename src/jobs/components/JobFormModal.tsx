import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Briefcase, ShieldAlert, CheckCircle2, Sparkles, Wand2, Building2, DollarSign, Clock, FileText } from 'lucide-react';
import { Job, JobStatus, JobType, JobLocationType } from '../types/job';
import {
  JOB_STATUS_OPTIONS,
  JOB_TYPE_OPTIONS,
  JOB_LOCATION_OPTIONS,
  CORPORATE_DEPARTMENTS,
  CORPORATE_RECRUITERS,
} from '../constants/jobOptions';
import { useAuth } from '../../auth';
import { Button, Input, Select } from '../../shared';
import { JobGeneratorModal } from '../../ai/components/JobGeneratorModal';
import { JobService } from '../../services/JobService';
import { checkHeadhunterVisibility, sanitizeCommercialFields } from '../utils/headhunterAccess';

export interface HeadhunterClientOption {
  id: string;
  nomeFantasia: string;
  razaoSocial?: string;
  name?: string;
}

export interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveJob?: (jobData: any, existingId?: string) => void | Promise<void>;
  initialJob?: any | null;
  openedFromModule?: 'recrutamento' | 'headhunter';
  clients?: HeadhunterClientOption[];
}

export const JobFormModal: React.FC<JobFormModalProps> = ({
  isOpen,
  onClose,
  onSaveJob,
  initialJob,
  openedFromModule = 'recrutamento',
  clients = [],
}) => {
  const { user, activeModules, userPermissions, hasActionAccess } = useAuth();
  const { mostrarFiltroHeadhunter } = checkHeadhunterVisibility(user, activeModules, userPermissions);

  const canCreate = hasActionAccess('create_job');
  const canEdit = hasActionAccess('edit_job');
  const canEditBudget = hasActionAccess('edit_budget');

  const isEditing = !!initialJob;

  // Primary Fields
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState(CORPORATE_DEPARTMENTS[0]);
  const [location, setLocation] = useState('São Paulo - SP');
  const [locationType, setLocationType] = useState<JobLocationType>('Híbrido');
  const [type, setType] = useState<JobType>('CLT');
  const [origemProcesso, setOrigemProcesso] = useState<'vaga_interna' | 'recrutamento_cliente' | 'headhunter'>('vaga_interna');

  // Commercial / Headhunter Fields
  const [clienteId, setClienteId] = useState('');
  const [clienteNome, setClienteNome] = useState('');
  const [regraCobranca, setRegraCobranca] = useState('15% do salário bruto anual');
  const [feePercentual, setFeePercentual] = useState<number>(15);
  const [valorNegociado, setValorNegociado] = useState<number>(15000);
  const [vencimentoPrazo, setVencimentoPrazo] = useState('30 dias após contratação');
  const [responsavelComercial, setResponsavelComercial] = useState('Consultor Sênior HR');
  const [situacaoPagamento, setSituacaoPagamento] = useState('Aguardando Contratação');
  const [observacoesComerciais, setObservacoesComerciais] = useState('');

  // Operational Fields
  const [status, setStatus] = useState<JobStatus | 'ativa' | 'Aberta'>('Aberta');
  const [salaryRange, setSalaryRange] = useState('R$ 8.000 - R$ 12.000');
  const [openings, setOpenings] = useState<number>(1);
  const [deadline, setDeadline] = useState('2026-12-31');
  const [description, setDescription] = useState('');
  const [recruiterName, setRecruiterName] = useState(CORPORATE_RECRUITERS[0].name);
  const [managerName, setManagerName] = useState('Diretoria Executiva');
  const [centerCostCode, setCenterCostCode] = useState('CC-RH-101');
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirementText, setNewRequirementText] = useState('');

  // Interface State
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setError('');
    setSuccessToast('');

    // Default origin depending on module
    let defaultOrig: 'vaga_interna' | 'recrutamento_cliente' | 'headhunter' = 
      (openedFromModule === 'headhunter' && mostrarFiltroHeadhunter) ? 'headhunter' : 'vaga_interna';

    if (initialJob) {
      setTitle(initialJob.title || initialJob.titulo || '');
      setDepartment(initialJob.department || 'Tecnologia & Engenharia');
      setLocation(initialJob.location || `${initialJob.cidade || 'São Paulo'} - ${initialJob.estado || 'SP'}`);
      setLocationType(initialJob.locationType || initialJob.modalidade || 'Híbrido');
      setType(initialJob.type || initialJob.tipoContrato || 'CLT');

      const rawOrig = (initialJob.origemProcesso || initialJob.origem || initialJob.moduloOrigem || '').toString().toLowerCase();
      if ((rawOrig.includes('headhunter') || initialJob.isHeadhunter || initialJob.projetoHeadhunter) && mostrarFiltroHeadhunter) {
        setOrigemProcesso('headhunter');
      } else if (rawOrig.includes('cliente') || initialJob.clienteNome) {
        setOrigemProcesso('recrutamento_cliente');
      } else {
        setOrigemProcesso('vaga_interna');
      }

      setClienteId(initialJob.clienteId || '');
      setClienteNome(initialJob.clienteNome || initialJob.cliente || '');
      setRegraCobranca(initialJob.regraCobranca || '15% do salário bruto anual');
      setFeePercentual(Number(initialJob.feePercentual || initialJob.percentualComissao || 15));
      setValorNegociado(Number(initialJob.valorNegociado || initialJob.valorCobrado || 15000));
      setVencimentoPrazo(initialJob.vencimentoPrazo || initialJob.prazoGarantia || '30 dias após contratação');
      setResponsavelComercial(initialJob.responsavelComercial || initialJob.consultorResponsavel || 'Consultor Sênior HR');
      setSituacaoPagamento(initialJob.situacaoPagamento || 'Aguardando Contratação');
      setObservacoesComerciais(initialJob.observacoesComerciais || '');

      setStatus(initialJob.status || 'Aberta');
      setSalaryRange(initialJob.salaryRange || initialJob.salario || 'R$ 8.000 - R$ 12.000');
      setOpenings(initialJob.openings || initialJob.quantidadeVagas || 1);
      setDeadline(initialJob.deadline || initialJob.prazoSla || '2026-12-31');
      setDescription(initialJob.description || initialJob.descricao || '');
      setRecruiterName(initialJob.recruiterName || initialJob.recrutadorResponsavel || CORPORATE_RECRUITERS[0].name);
      setManagerName(initialJob.managerName || initialJob.gestorSolicitante || 'Diretoria Executiva');
      setCenterCostCode(initialJob.budget?.centerCostCode || initialJob.centroCusto || 'CC-RH-101');
      setRequirements(initialJob.requirements || initialJob.requisitos || [
        'Experiência prévia comprovada na função',
        'Boa comunicação interpessoal'
      ]);
    } else {
      setTitle('');
      setDepartment(CORPORATE_DEPARTMENTS[0]);
      setLocation('São Paulo - SP');
      setLocationType('Híbrido');
      setType('CLT');
      setOrigemProcesso(defaultOrig);
      setClienteId('');
      setClienteNome('');
      setRegraCobranca('15% do salário bruto anual');
      setFeePercentual(15);
      setValorNegociado(15000);
      setVencimentoPrazo('30 dias após contratação');
      setResponsavelComercial('Consultor Sênior HR');
      setSituacaoPagamento('Aguardando Contratação');
      setObservacoesComerciais('');

      setStatus('Aberta');
      setSalaryRange('R$ 8.000 - R$ 12.000');
      setOpenings(1);
      setDeadline('2026-12-31');
      setDescription('');
      setRecruiterName(CORPORATE_RECRUITERS[0].name);
      setManagerName('Diretoria Executiva');
      setCenterCostCode('CC-RH-101');
      setRequirements([
        'Experiência prévia comprovada na função',
        'Boa comunicação interpessoal',
      ]);
    }
  }, [initialJob, isOpen, openedFromModule]);

  if (!isOpen) return null;

  const isAllowed = isEditing ? canEdit : canCreate;
  const showCommercialFields = origemProcesso === 'recrutamento_cliente' || origemProcesso === 'headhunter';

  const handleAddRequirement = () => {
    if (!newRequirementText.trim()) return;
    setRequirements((prev) => [...prev, newRequirementText.trim()]);
    setNewRequirementText('');
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return; // Prevent double submit

    if (!title.trim() || !description.trim()) {
      setError('Por favor, preencha o cargo/título e a descrição detalhada da vaga.');
      return;
    }

    if (requirements.length === 0) {
      setError('Adicione ao menos um requisito obrigatório para a vaga.');
      return;
    }

    if (showCommercialFields && !clienteNome.trim()) {
      setError('Informe o cliente contratante para vagas de Headhunter ou Atendimento a Cliente.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const empresaId = user?.empresaId || user?.companyId || user?.tenantId;
      if (!empresaId) {
        throw new Error("Não foi possível identificar a empresa do usuário autenticado.");
      }
      const nomeEmpresa = user?.companyName || user?.tenantName || 'MAIS RH Brasil';
      const nowIsoDate = new Date().toISOString().split('T')[0];
      const parts = location.split('-');
      const cidade = parts[0]?.trim() || location;
      const estado = parts[1]?.trim() || 'SP';

      const isHead = origemProcesso === 'headhunter';
      const isClient = origemProcesso === 'recrutamento_cliente';

      const jobId = initialJob?.id || `vaga-${Date.now()}`;

      const payload: Record<string, any> = {
        id: jobId,
        empresaId,
        companyId: empresaId,
        nomeEmpresa,
        companyName: nomeEmpresa,
        
        // Single Unified Origin Structure
        origem: origemProcesso,
        origemProcesso,
        tipoProcesso: isHead ? 'busca_ativa' : isClient ? 'cliente' : 'interno',
        projetoHeadhunter: isHead,
        isHeadhunter: isHead,
        criadaPorModulo: openedFromModule,
        
        // Commercial Information
        clienteId: showCommercialFields ? (clienteId || `cli-${Date.now()}`) : null,
        clienteNome: showCommercialFields ? clienteNome.trim() : null,
        regraCobranca: showCommercialFields ? regraCobranca : null,
        feePercentual: showCommercialFields ? Number(feePercentual) || 15 : null,
        valorNegociado: showCommercialFields ? Number(valorNegociado) || 0 : null,
        valorCobrado: showCommercialFields ? Number(valorNegociado) || 0 : null,
        vencimentoPrazo: showCommercialFields ? vencimentoPrazo : null,
        responsavelComercial: showCommercialFields ? responsavelComercial : null,
        consultorResponsavel: showCommercialFields ? responsavelComercial : null,
        situacaoPagamento: showCommercialFields ? situacaoPagamento : null,
        observacoesComerciais: showCommercialFields ? observacoesComerciais : null,

        // Position & Operational Details
        titulo: title.trim(),
        title: title.trim(),
        descricao: description.trim(),
        description: description.trim(),
        requisitos: requirements,
        requirements,
        cidade,
        estado,
        location,
        locationType,
        salario: salaryRange,
        salaryRange,
        tipoContrato: type,
        type,
        quantidadeVagas: Number(openings) || 1,
        openings: Number(openings) || 1,
        applicantsCount: initialJob?.applicantsCount || initialJob?.candidatosCount || 0,
        
        department,
        recruiterName,
        recrutadorResponsavel: recruiterName,
        managerName,
        gestorSolicitante: managerName,
        centroCusto: centerCostCode,
        deadline,
        prazoSla: deadline,
        status: status,
        publicada: true,
        
        dataCriacao: initialJob?.dataCriacao || initialJob?.createdAt || nowIsoDate,
        createdAt: initialJob?.createdAt || initialJob?.dataCriacao || nowIsoDate,
        updatedAt: new Date().toISOString(),
        
        budget: {
          approvedSalaryRange: salaryRange,
          centerCostCode,
          isApproved: true,
        },
      };

      const sanitizedPayload = sanitizeCommercialFields(payload, mostrarFiltroHeadhunter);

      // Save to official Firestore Service
      if (isEditing) {
        await JobService.update(jobId, sanitizedPayload);
      } else {
        await JobService.create(sanitizedPayload);
      }

      if (onSaveJob) {
        await onSaveJob(
          sanitizedPayload,
          isEditing ? jobId : undefined
        );
      }

      const msg = openedFromModule === 'headhunter'
        ? 'Vaga criada com sucesso e vinculada ao Recrutamento.'
        : 'Vaga criada com sucesso.';

      setSuccessToast(msg);

      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 900);

    } catch (err: any) {
      console.error('Erro ao salvar vaga:', err);
      setError(`Erro ao salvar vaga: ${err?.message || String(err)}`);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 max-h-[92vh] overflow-y-auto border border-slate-200">
        
        {/* Header Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {isEditing ? 'Editar Registro de Vaga' : 'Cadastrar Nova Vaga Corporativa'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Formulário oficial unificado para Recrutamento Interno, Atendimento a Clientes e Executive Search.
            </p>
          </div>
        </div>

        {successToast && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {!isAllowed ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-3">
            <ShieldAlert className="w-8 h-8 text-rose-600 mx-auto" />
            <h4 className="text-base font-extrabold text-slate-900">Permissão Insuficiente</h4>
            <p className="text-xs text-slate-600">
              Seu perfil atual não autoriza a {isEditing ? 'edição' : 'criação'} de vagas no sistema.
            </p>
            <Button variant="outline" size="sm" onClick={onClose}>
              Voltar
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 🤖 Banner Gerador com MAIS RH IA */}
            <div className="p-4 bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white rounded-2xl flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-amber-300">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Criar Vaga com MAIS RH IA</h4>
                  <p className="text-[11px] text-emerald-200">Preencha cargo, descrição detalhada e requisitos automaticamente com Inteligência Artificial.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Gerar com IA</span>
              </button>
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold">
                {error}
              </div>
            )}

            {/* Title / Cargo */}
            <Input
              label="Cargo / Título da Vaga *"
              placeholder="Ex: Diretor de Tecnologia / Gerente Comercial / Desenvolvedor Full Stack"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Row 1: Origem, Departamento, Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Origem da Vaga *"
                value={origemProcesso}
                onChange={(e) => setOrigemProcesso(e.target.value as any)}
                options={[
                  { value: 'vaga_interna', label: 'Vaga Interna (Processo Próprio)' },
                  { value: 'recrutamento_cliente', label: 'Recrutamento para Cliente' },
                  ...(mostrarFiltroHeadhunter ? [{ value: 'headhunter', label: 'Headhunter / Busca Ativa' }] : []),
                ]}
              />

              <Select
                label="Departamento"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                options={CORPORATE_DEPARTMENTS.map((d) => ({ value: d, label: d }))}
              />

              <Select
                label="Status da Vaga"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                options={[
                  { value: 'Aberta', label: 'Aberta' },
                  { value: 'Em andamento', label: 'Em andamento' },
                  { value: 'Concluída', label: 'Concluída' },
                  { value: 'Suspensa', label: 'Suspensa' },
                  { value: 'Cancelada', label: 'Cancelada' },
                  { value: 'Arquivada', label: 'Arquivada' },
                ]}
              />
            </div>

            {/* BLOCO: DADOS COMERCIAIS (Apenas se cliente ou headhunter) */}
            {showCommercialFields && (
              <div className="p-4.5 bg-indigo-50/80 border border-indigo-200/80 rounded-2xl space-y-3.5 shadow-2xs">
                <div className="flex items-center gap-2 border-b border-indigo-200 pb-2">
                  <Building2 className="w-4 h-4 text-indigo-700" />
                  <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                    Dados Comerciais & Faturamento ({origemProcesso === 'headhunter' ? 'Headhunter / Executive Search' : 'Recrutamento para Cliente'})
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Cliente Contratante */}
                  <div>
                    <label className="block text-xs font-bold text-indigo-950 mb-1">Cliente Contratante *</label>
                    {clients.length > 0 ? (
                      <select
                        value={clienteId}
                        onChange={(e) => {
                          setClienteId(e.target.value);
                          const c = clients.find(x => x.id === e.target.value);
                          if (c) setClienteNome(c.nomeFantasia || c.name || '');
                        }}
                        className="w-full p-2.5 bg-white border border-indigo-200 text-indigo-950 font-bold text-xs rounded-xl focus:border-indigo-600 outline-none"
                      >
                        <option value="">Selecione um cliente cadastrado...</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.nomeFantasia || c.name}</option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        placeholder="Ex: Banco Itaú S.A. / TechCorp Brasil"
                        value={clienteNome}
                        onChange={(e) => setClienteNome(e.target.value)}
                        required
                      />
                    )}
                  </div>

                  <Input
                    label="Consultor Comercial Responsável"
                    placeholder="Ex: Carlos Headhunter"
                    value={responsavelComercial}
                    onChange={(e) => setResponsavelComercial(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Honorário Negociado (R$)"
                    type="number"
                    placeholder="15000"
                    value={valorNegociado}
                    onChange={(e) => setValorNegociado(Number(e.target.value))}
                  />

                  <Input
                    label="Percentual de Comissão (%)"
                    type="number"
                    placeholder="15"
                    value={feePercentual}
                    onChange={(e) => setFeePercentual(Number(e.target.value))}
                  />

                  <Input
                    label="Prazo de Garantia / SLA"
                    placeholder="Ex: 30 dias após contratação"
                    value={vencimentoPrazo}
                    onChange={(e) => setVencimentoPrazo(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Regra de Cobrança / Contrato"
                    placeholder="Ex: 15% do salário bruto anual no sucesso"
                    value={regraCobranca}
                    onChange={(e) => setRegraCobranca(e.target.value)}
                  />

                  <Select
                    label="Situação do Pagamento"
                    value={situacaoPagamento}
                    onChange={(e) => setSituacaoPagamento(e.target.value)}
                    options={[
                      { value: 'Aguardando Contratação', label: 'Aguardando Contratação' },
                      { value: 'Pendente Faturamento', label: 'Pendente Faturamento' },
                      { value: 'Faturado', label: 'Faturado' },
                      { value: 'Pago', label: 'Pago' },
                      { value: 'Inadimplente', label: 'Inadimplente' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-950 mb-1">Observações Comerciais & Cláusulas</label>
                  <input
                    type="text"
                    placeholder="Observações do contrato, parcelamento ou condições comerciais..."
                    value={observacoesComerciais}
                    onChange={(e) => setObservacoesComerciais(e.target.value)}
                    className="w-full bg-white border border-indigo-200 text-slate-800 text-xs rounded-xl p-2.5 outline-none font-medium"
                  />
                </div>
              </div>
            )}

            {/* Row 2: Localização, Modalidade, Tipo Contrato */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Localização (Cidade - UF)"
                placeholder="Ex: São Paulo - SP"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              <Select
                label="Modalidade de Trabalho"
                value={locationType}
                onChange={(e) => setLocationType(e.target.value as JobLocationType)}
                options={JOB_LOCATION_OPTIONS.map((l) => ({ value: l, label: l }))}
              />

              <Select
                label="Tipo de Contrato"
                value={type}
                onChange={(e) => setType(e.target.value as JobType)}
                options={JOB_TYPE_OPTIONS.map((t) => ({ value: t, label: t }))}
              />
            </div>

            {/* Row 3: Faixa Salarial, Centro Custo, N° Vagas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Faixa Salarial"
                placeholder="Ex: R$ 8.000 - R$ 12.000"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                disabled={!canEditBudget}
              />

              <Input
                label="Centro de Custo"
                placeholder="Ex: CC-RH-101"
                value={centerCostCode}
                onChange={(e) => setCenterCostCode(e.target.value)}
                disabled={!canEditBudget}
              />

              <Input
                type="number"
                label="Número de Vagas"
                value={openings}
                onChange={(e) => setOpenings(Number(e.target.value))}
                min={1}
                required
              />
            </div>

            {/* Row 4: Recrutador, Gestor, Prazo SLA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Recrutador Responsável"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                options={CORPORATE_RECRUITERS.map((r) => ({ value: r.name, label: `${r.name} (${r.role})` }))}
              />

              <Input
                label="Gestor Solicitante"
                placeholder="Ex: Diretoria Executiva"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
              />

              <Input
                type="date"
                label="Data Limite / Prazo SLA *"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>

            {/* Descrição Detalhada */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Descrição Detalhada das Atividades *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-3 outline-none focus:border-indigo-500 font-medium"
                placeholder="Descreva as responsabilidades, principais entregas e desafios da posição..."
                required
              />
            </div>

            {/* Requisitos */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">Requisitos Obrigatórios da Vaga</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Mínimo 3 anos de experiência em liderança técnica"
                  value={newRequirementText}
                  onChange={(e) => setNewRequirementText(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={handleAddRequirement} leftIcon={<Plus className="w-4 h-4" />}>
                  Adicionar
                </Button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {requirements.map((req, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800"
                  >
                    <span>• {req}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={isSaving}>
                {isSaving ? 'Salvando Vaga...' : isEditing ? 'Salvar Alterações' : 'Cadastrar Vaga'}
              </Button>
            </div>
          </form>
        )}

        <JobGeneratorModal
          isOpen={showAiModal}
          onClose={() => setShowAiModal(false)}
          onApplyGeneratedJob={(aiJob) => {
            setTitle(aiJob.title || title);
            setDescription(aiJob.summary || description);
            if (aiJob.requirements && aiJob.requirements.length > 0) {
              setRequirements(aiJob.requirements);
            }
          }}
        />
      </div>
    </div>
  );
};
