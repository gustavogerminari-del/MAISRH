import React, { useState } from 'react';
import { X, Database, Download, RefreshCw, CheckCircle2, Shield, HardDrive, FileArchive } from 'lucide-react';
import { ClientTenant, BackupRecord } from '../types/master';

interface MasterBackupModalProps {
  tenants: ClientTenant[];
  backups: BackupRecord[];
  onClose: () => void;
  onCreateBackup: (tenantId: string) => void;
  onRestoreBackup: (backupId: string) => void;
}

export const MasterBackupModal: React.FC<MasterBackupModalProps> = ({
  tenants,
  backups,
  onClose,
  onCreateBackup,
  onRestoreBackup
}) => {
  const [selectedTenantId, setSelectedTenantId] = useState<string>(tenants[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const handleTriggerBackup = () => {
    if (!selectedTenantId) return;
    setIsProcessing(true);
    setActionSuccessMsg(null);

    setTimeout(() => {
      onCreateBackup(selectedTenantId);
      setIsProcessing(false);
      setActionSuccessMsg('Backup instantâneo gerado e verificado com sucesso!');
    }, 1200);
  };

  const handleTriggerRestore = (backupId: string, companyName: string) => {
    if (!confirm(`Atenção: Deseja restaurar os dados da empresa "${companyName}" para este ponto de restauração? Esta operação substituirá o estado atual.`)) {
      return;
    }
    setIsProcessing(true);
    setActionSuccessMsg(null);

    setTimeout(() => {
      onRestoreBackup(backupId);
      setIsProcessing(false);
      setActionSuccessMsg(`Dados da empresa "${companyName}" restaurados perfeitamente!`);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Gerenciador de Backups & Restauração Master</h3>
              <p className="text-xs text-indigo-200">Crie snapshots de dados de qualquer cliente ou restaure estados anteriores.</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {actionSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {actionSuccessMsg}
            </div>
          )}

          {/* Trigger New Backup Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-indigo-600" />
              Gerar Novo Backup On-Demand (Snapshot Geral)
            </h4>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.companyName} ({t.cnpj})
                  </option>
                ))}
              </select>

              <button
                onClick={handleTriggerBackup}
                disabled={isProcessing}
                className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                {isProcessing ? 'Processando...' : 'Criar Backup Agora'}
              </button>
            </div>
          </div>

          {/* Existing Backups List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <FileArchive className="w-4 h-4 text-indigo-600" />
              Histórico de Backups Disponíveis no Servidor Master:
            </h4>

            {backups.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-4 text-center bg-slate-50 rounded-xl">
                Nenhum backup disponível no momento.
              </p>
            ) : (
              <div className="space-y-2">
                {backups.map((bak) => (
                  <div
                    key={bak.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-4 hover:border-indigo-200 transition-all text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{bak.tenantName}</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                          {bak.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Data: {bak.createdAt} • Tamanho: {(bak.fileSizeBytes / (1024*1024)).toFixed(1)} MB • Checksum: {bak.checksum.substring(0, 10)}...
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTriggerRestore(bak.id, bak.tenantName)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-800 text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Restaurar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
