import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Briefcase, ShieldAlert, CheckCircle2, Sparkles, Wand2 } from 'lucide-react';
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
import { normalizeCompanyModules } from '../../utils/companyModules';

export interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveJob: (jobData: Omit<Job, 'id' | 'applicantsCount' | 'createdAt'>, existingId?: string) => void;
  initialJob?: Job | null;
}

export const JobFormModal: React.FC<JobFormModalProps> = ({
  isOpen,
  onClose,
  onSaveJob,
  initialJob,
}) => {
  const { user, activeModules, hasActionAccess } = useAuth();
  const capabilities = normalizeCompanyModules(activeModules);
  const hasHeadhunter = capabilities.hasHeadhunter;
  const hasDP = capabilities.hasDP;
  const hasBothModules = hasHeadhunter && hasDP;

  const canCreate = hasActionAccess('create_job');
  const canEdit = hasActionAccess('edit_job');
  const canEditBudget = hasActionAccess('edit_budget');

  const isEditing = !!initialJob;

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState(CORPORATE_DEPARTMENTS[0]);
  const [location, setLocation] = useState('São Paulo - SP');
  const [locationType, setLocationType] = useState<JobLocationType>('Híbrido');
  const [type, setType] = useState<JobType>('CLT');
  const [origemProcesso, setOrigemProcesso] = useState<'recrutamento_interno' | 'headhunter'>('recrutamento_interno');
  
  // Headhunter Client Fields State
  const [clienteNome, setClienteNome] = useState('');
  const [regraCobranca, setRegraCobranca] = useState('15% do salário bruto anual');
  const [feePercentual, setFeePercentual] = useState<number>(15);
  const [vencimentoPrazo, setVencimentoPrazo] = useState('30 dias após contratação');
  const [responsavelComercial, setResponsavelComercial] = useState('Carlos Headhunter');

  const [status, setStatus] = useState<JobStatus | 'ativa'>('ativa');
  const [salaryRange, setSalaryRange] = useState('R$ 8.000 - R$ 12.000');
  const [openings, setOpenings] = useState<number>(1);
  const [deadline, setDeadline] = useState('2026-08-30');
  const [description, setDescription] = useState('');
  const [recruiterName, setRecruiterName] = useState(CORPORATE_RECRUITERS[0].name);
  const [managerName, setManagerName] = useState('Luciana Mello');
  const [centerCostCode, setCenterCostCode] = useState('CC-RH-101');
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newRequirementText, setNewRequirementText] = useState('');
  const [error, setError] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    // Determine default origin based on company modules
    let defaultOrig: 'recrutamento_interno' | 'headhunter' = 'recrutamento_interno';
    if (hasHeadhunter && !hasDP) {
      defaultOrig = 'headhunter';
    } else if (!hasHeadhunter && hasDP) {
      defaultOrig = 'recrutamento_interno';
    }

    if (initialJob) {
      setTitle(initialJob.title || initialJob.titulo || '');
      setDepartment(initialJob.department || 'Tecnologia & Engenharia');
      setLocation(initialJob.location || `${initialJob.cidade || 'São Paulo'} - ${initialJob.estado || 'SP'}`);
      setLocationType(initialJob.locationType || 'Híbrido');
      setType(initialJob.type || initialJob.tipoContrato || 'CLT');
      
      const orig = (initialJob as any).origemProcesso || (initialJob as any).moduloOrigem || ((initialJob as any).isHeadhunter ? 'headhunter' : defaultOrig);
      const isHead = String(orig).toLowerCase().includes('headhunter') || (initialJob as any).isHeadhunter === true;
      setOrigemProcesso(isHead ? 'headhunter' : 'recrutamento_interno');
      
      setClienteNome((initialJob as any).clienteNome || (initialJob as any).cliente || '');
      setRegraCobranca((initialJob as any).regraCobranca || '15% do salário bruto anual');
      setFeePercentual(Number((initialJob as any).feePercentual || (initialJob as any).percentual || 15));
      setVencimentoPrazo((initialJob as any).vencimentoPrazo || '30 dias após contratação');
      setResponsavelComercial((initialJob as any).responsavelComercial || 'Carlos Headhunter');

      setStatus(initialJob.status || 'ativa');
      setSalaryRange(initialJob.salaryRange || initialJob.salario || 'R$ 8.000 - R$ 12.000');
      setOpenings(initialJob.openings || initialJob.quantidadeVagas || 1);
      setDeadline(initialJob.deadline || '2026-08-30');
      setDescription(initialJob.description || initialJob.descricao || '');
      setRecruiterName(initialJob.recruiterName || CORPORATE_RECRUITERS[0].name);
      setManagerName(initialJob.managerName || 'Luciana Mello');
      setCenterCostCode(initialJob.budget?.centerCostCode || 'CC-RH-101');
      setRequirements(initialJob.requirements || initialJob.requisitos || []);
    } else {
      setTitle('');
      setDepartment(CORPORATE_DEPARTMENTS[0]);
      setLocation('São Paulo - SP');
      setLocationType('Híbrido');
      setType('CLT');
      setOrigemProcesso(defaultOrig);
      setClienteNome('');
      setRegraCobranca('15% do salário bruto anual');
      setFeePercentual(15);
      setVencimentoPrazo('30 dias após contratação');
      setResponsavelComercial('Carlos Headhunter');
      setStatus('ativa');
      setSalaryRange('R$ 8.000 - R$ 12.000');
      setOpenings(1);
      setDeadline('2026-08-30');
      setDescription('');
      setRecruiterName(CORPORATE_RECRUITERS[0].name);
      setManagerName('Luciana Mello');
      setCenterCostCode('CC-RH-101');
      setRequirements([
        'Experiência prévia comprovada na função',
        'Boa comunicação interpessoal',
      ]);
    }
    setError('');
  }, [initialJob, isOpen, hasHeadhunter, hasDP]);

  if (!isOpen) return null;

  // Check general permission
  const isAllowed = isEditing ? canEdit : canCreate;

  const handleAddRequirement = () => {
    if (!newRequirementText.trim()) return;
    setRequirements((prev) => [...prev, newRequirementText.trim()]);
    setNewRequirementText('');
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Por favor, preencha o título e a descrição da vaga.');
      return;
    }

    if (requirements.length === 0) {
      setError('Adicione ao menos um requisito obrigatório para a vaga.');
      return;
    }

    // Determine effective origin based on company capabilities
    let effectiveOrigem = origemProcesso;
    if (hasHeadhunter && !hasDP) {
      effectiveOrigem = 'headhunter';
    } else if (!hasHeadhunter && hasDP) {
      effectiveOrigem = 'recrutamento_interno';
    } else if (hasBothModules && !origemProcesso) {
      setError('A empresa possui os módulos RH e Headhunter. Escolha obrigatoriamente a origem da vaga.');
      return;
    }

    if (effectiveOrigem === 'headhunter' && !clienteNome.trim()) {
      setError('Para vagas do Headhunter, informe obrigatoriamente o nome do cliente.');
      return;
    }

    const isHead = effectiveOrigem === 'headhunter';
    const empresaId = user?.companyId || user?.tenantId || user?.id || 'emp-001';
    const nomeEmpresa = user?.companyName || user?.tenantName || 'MAIS RH Brasil';
    const parts = location.split('-');
    const cidade = parts[0]?.trim() || location;
    const estado = parts[1]?.trim() || 'SP';
    const nowIsoDate = new Date().toISOString().split('T')[0];

    onSaveJob(
      {
        empresaId,
        nomeEmpresa,
        origemProcesso: isHead ? 'HEADHUNTER' : 'RH_INTERNO',
        moduloOrigem: isHead ? 'headhunter' : 'RH',
        origem: isHead ? 'HEADHUNTER' : 'RH_INTERNO',
        isHeadhunter: isHead,
        destinoContratacao: isHead ? 'FINANCEIRO_HEADHUNTER' : 'DP',
        destino: isHead ? 'Financeiro' : 'DP',
        clienteNome: isHead ? clienteNome.trim() : null,
        clienteId: isHead ? `cli-${Date.now()}` : null,
        regraCobranca: isHead ? regraCobranca : null,
        feePercentual: isHead ? Number(feePercentual) || 15 : null,
        vencimentoPrazo: isHead ? vencimentoPrazo : null,
        responsavelComercial: isHead ? responsavelComercial : null,
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
        beneficios: ['Vale Refeição R$ 1.000/mês', 'Plano de Saúde', 'Seguro de Vida', 'Auxílio Home Office'],
        benefits: ['Vale Refeição R$ 1.000/mês', 'Plano de Saúde', 'Seguro de Vida', 'Auxílio Home Office'],
        quantidadeVagas: Number(openings) || 1,
        openings: Number(openings) || 1,
        dataCriacao: nowIsoDate,
        createdAt: nowIsoDate,
        deadline,
        status: status === 'Arquivada' || status === 'Fechada' ? status : 'ativa',
        publicada: true,
        department,
        recruiterName,
        managerName,
        tipoProcesso: isHead ? 'headhunter' : 'interno',
        budget: {
          approvedSalaryRange: salaryRange,
          centerCostCode,
          isApproved: true,
        },
        isArchived: status === 'Arquivada',
      },
      initialJob?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-extrabold text-slate-900">
            {isEditing ? 'Editar Registro de Vaga' : 'Cadastrar Nova Vaga Corporativa'}
          </h2>
        </div>

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
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 🤖 Banner Gerador com MAIS RH IA */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                  <Wand2 className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Criar Vaga com MAIS RH IA</h4>
                  <p className="text-[11px] text-emerald-200">Preencha título, descrição e requisitos automaticamente com IA.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(true)}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gerar com IA</span>
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
                {error}
              </div>
            )}

            <Input
              label="Cargo / Título da Vaga"
              placeholder="Ex: Desenvolvedor(a) Frontend Senior"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {hasBothModules ? (
                <Select
                  label="Origem da Vaga (Obrigatório)*"
                  value={origemProcesso}
                  onChange={(e) => setOrigemProcesso(e.target.value as any)}
                  options={[
                    { value: 'recrutamento_interno', label: 'Vaga Interna (Encaminhar para DP)' },
                    { value: 'headhunter', label: 'Vaga de Cliente (Encaminhar para Financeiro)' },
                  ]}
                />
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Origem da Vaga (Módulo)</label>
                  <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                    {hasHeadhunter ? 'Headhunter (Destino: Financeiro)' : 'RH Interno (Destino: Admissão DP)'}
                  </div>
                </div>
              )}

              <Select
                label="Departamento"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                options={CORPORATE_DEPARTMENTS.map((d) => ({ value: d, label: d }))}
              />

              <Select
                label="Status da Vaga"
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                options={JOB_STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
              />
            </div>

            {/* Campos Específicos para Headhunter */}
            {origemProcesso === 'headhunter' && (
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">
                    Dados do Cliente & Faturamento (Headhunter)
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Nome do Cliente (Contratante)*"
                    placeholder="Ex: Banco Itaú / TechCorp S.A."
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    required
                  />

                  <Input
                    label="Responsável Comercial"
                    placeholder="Ex: Carlos Headhunter"
                    value={responsavelComercial}
                    onChange={(e) => setResponsavelComercial(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    type="number"
                    label="Honorários (%)"
                    placeholder="15"
                    value={feePercentual}
                    onChange={(e) => setFeePercentual(Number(e.target.value))}
                  />

                  <Input
                    label="Regra de Cobrança"
                    placeholder="Ex: 15% do salário bruto anual"
                    value={regraCobranca}
                    onChange={(e) => setRegraCobranca(e.target.value)}
                  />

                  <Input
                    label="Prazo de Vencimento"
                    placeholder="Ex: 30 dias após contratação"
                    value={vencimentoPrazo}
                    onChange={(e) => setVencimentoPrazo(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Localização"
                placeholder="Ex: São Paulo - SP"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              <Select
                label="Modalidade"
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                label="Recrutador Responsável"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                options={CORPORATE_RECRUITERS.map((r) => ({ value: r.name, label: `${r.name} (${r.role})` }))}
              />

              <Input
                label="Gestor Solicitante"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
              />

              <Input
                type="date"
                label="Data Limite (Prazo SLA)"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Descrição Detalhada das Atividades</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-3 outline-none focus:border-indigo-500 font-medium"
                placeholder="Descreva as responsabilidades, principais entregas e desafios da posição..."
                required
              />
            </div>

            {/* Requirements Manager */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">Requisitos da Vaga</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Mínimo 3 anos de experiência em React"
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
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800"
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

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {isEditing ? 'Salvar Alterações' : 'Cadastrar Vaga'}
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
