import React, { useState } from 'react';
import { X, Send, Megaphone, BellRing, Users, AlertTriangle } from 'lucide-react';
import { SystemAnnouncement, ClientTenant } from '../types/master';

interface MasterAnnouncementsModalProps {
  tenants: ClientTenant[];
  onClose: () => void;
  onSend: (announcement: SystemAnnouncement) => void;
}

export const MasterAnnouncementsModal: React.FC<MasterAnnouncementsModalProps> = ({
  tenants,
  onClose,
  onSend
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<'TODOS' | 'APENAS_ATIVOS' | 'EM_RISCO_RENOVACAO' | 'ESPECIFICO'>('TODOS');
  const [priority, setPriority] = useState<'BAIXA' | 'NORMAL' | 'ALTA' | 'CRITICA'>('NORMAL');
  const [selectedTenantIds, setSelectedTenantIds] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    const newAnnouncement: SystemAnnouncement = {
      id: `anc-${Date.now()}`,
      title,
      message,
      targetAudience,
      targetTenantIds: targetAudience === 'ESPECIFICO' ? selectedTenantIds : undefined,
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      senderName: 'Super Administrador Master MAIS RH',
      priority
    };

    onSend(newAnnouncement);
  };

  const handleToggleTenantSelect = (id: string) => {
    if (selectedTenantIds.includes(id)) {
      setSelectedTenantIds(selectedTenantIds.filter(t => t !== id));
    } else {
      setSelectedTenantIds([...selectedTenantIds, id]);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Enviar Comunicado Geral ou Específico</h3>
              <p className="text-xs text-indigo-200">Notifique os gestores de clientes no topo da tela do sistema.</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Título do Comunicado *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Atualização de Segurança e Novas Funcionalidades"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mensagem para os Clientes *</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escreva a mensagem clara e objetiva..."
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Público-Alvo</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="TODOS">Todos os Clientes</option>
                <option value="APENAS_ATIVOS">Apenas Empresas Ativas</option>
                <option value="EM_RISCO_RENOVACAO">Empresas em Risco/Renovação</option>
                <option value="ESPECIFICO">Empresas Selecionadas</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prioridade do Alerta</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="BAIXA">Baixa (Informativo)</option>
                <option value="NORMAL">Normal</option>
                <option value="ALTA">Alta (Aviso)</option>
                <option value="CRITICA">Crítica (Urgente)</option>
              </select>
            </div>
          </div>

          {targetAudience === 'ESPECIFICO' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 max-h-36 overflow-y-auto">
              <span className="text-[11px] font-bold text-slate-700 block">Selecione as Empresas Recebedoras:</span>
              {tenants.map(t => (
                <label key={t.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTenantIds.includes(t.id)}
                    onChange={() => handleToggleTenantSelect(t.id)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{t.companyName} ({t.code})</span>
                </label>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Disparar Comunicado
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
