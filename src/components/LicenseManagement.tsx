import React, { useState } from 'react';
import {
  KeyRound,
  Plus,
  Search,
  Filter,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  RefreshCw,
  Ban,
  ShieldCheck,
  QrCode,
  Sparkles,
  ChevronDown,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { License, PlanType, LicenseStatus } from '../types';

interface LicenseManagementProps {
  licenses: License[];
  onOpenNewModal: () => void;
  onRenewLicense: (id: string, days: number) => void;
  onRevokeLicense: (id: string) => void;
  onManageDevices: (license: License) => void;
  onRefresh: () => void;
}

export const LicenseManagement: React.FC<LicenseManagementProps> = ({
  licenses,
  onOpenNewModal,
  onRenewLicense,
  onRevokeLicense,
  onManageDevices,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedLicenseForDetails, setSelectedLicenseForDetails] = useState<License | null>(null);

  const filtered = licenses.filter(lic => {
    const matchesSearch =
      lic.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lic.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lic.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlan = selectedPlan === 'all' || lic.plan === selectedPlan;
    const matchesStatus = selectedStatus === 'all' || lic.status === selectedStatus;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getPlanBadge = (plan: PlanType) => {
    switch (plan) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'business':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'pro':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'starter':
        return 'bg-teal-100 text-teal-700 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: LicenseStatus) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'expired':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'revoked':
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getStatusLabel = (status: LicenseStatus) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'pending':
        return 'Pendente';
      case 'expired':
        return 'Expirada';
      case 'revoked':
        return 'Revogada';
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-600" />
            Gestão Automatizada de Chaves & Licenças
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Geração com assinatura Ed25519, controle de assinaturas, vínculo de dispositivos e liberação granular de entitlements.
          </p>
        </div>

        <button
          onClick={onOpenNewModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          Gerar Nova Chave Automática
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por chave, cliente, e-mail..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Plan filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Plano:</span>
            <select
              value={selectedPlan}
              onChange={e => setSelectedPlan(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Todos os Planos</option>
              <option value="free">Gratuito (Free)</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro (Com IA)</option>
              <option value="business">Business</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativas</option>
              <option value="pending">Pendentes</option>
              <option value="expired">Expiradas</option>
              <option value="revoked">Revogadas</option>
            </select>
          </div>

          <button
            onClick={onRefresh}
            title="Atualizar lista"
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Licenses Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Chave de Ativação</th>
                <th className="py-3 px-4">Cliente / Empresa</th>
                <th className="py-3 px-4">Plano</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Dispositivos</th>
                <th className="py-3 px-4">Expiração</th>
                <th className="py-3 px-4 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Nenhuma licença encontrada com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filtered.map(lic => {
                  const devicesCount = lic.devices?.length || 0;
                  const isExpiringSoon =
                    new Date(lic.expiresAt).getTime() - Date.now() < 3 * 86400 * 1000 &&
                    lic.status === 'active';

                  return (
                    <tr
                      key={lic.id}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                      onClick={() => setSelectedLicenseForDetails(lic)}
                    >
                      {/* Chave com botão copiar */}
                      <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-xs bg-slate-100 px-2 py-1 rounded text-blue-700 border border-slate-200 select-all">
                            {lic.key}
                          </code>
                          <button
                            onClick={() => handleCopy(lic.key, lic.id)}
                            title="Copiar chave"
                            className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition"
                          >
                            {copiedKey === lic.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Cliente */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{lic.customerName}</div>
                        <div className="text-[11px] text-slate-500">{lic.customerEmail}</div>
                      </td>

                      {/* Plano */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getPlanBadge(
                            lic.plan
                          )}`}
                        >
                          {lic.plan}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                            lic.status
                          )}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              lic.status === 'active'
                                ? 'bg-emerald-500'
                                : lic.status === 'pending'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          ></span>
                          {getStatusLabel(lic.status)}
                        </span>
                      </td>

                      {/* Dispositivos */}
                      <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => onManageDevices(lic)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition text-slate-700 font-medium"
                          title="Clique para gerenciar UUIDs autorizados"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {devicesCount}/{lic.maxDevices || 1}
                          </span>
                        </button>
                      </td>

                      {/* Expiração */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-slate-800">
                            {new Date(lic.expiresAt).toLocaleDateString('pt-BR')}
                          </span>
                          {isExpiringSoon && (
                            <span
                              title="Expira em menos de 3 dias!"
                              className="text-amber-600 animate-pulse"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {lic.billingCycle === 'monthly' ? 'Mensal' : 'Trimestral/Anual'}
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Send on WhatsApp */}
                          <a
                            href={`https://wa.me/${lic.customerPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Olá ${lic.customerName}! Segue sua chave de ativação do i9Hub (${lic.plan.toUpperCase()}):\n\n👉 *${lic.key}*\n\nBasta colar no painel da extensão para liberar seus recursos!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Enviar chave no WhatsApp do cliente"
                            className="p-1.5 rounded-lg border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* Renew 30 days */}
                          <button
                            onClick={() => onRenewLicense(lic.id, 30)}
                            title="Renovar por +30 dias"
                            className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-[11px] font-medium text-slate-700 transition"
                          >
                            +30d
                          </button>

                          {/* Revoke */}
                          {lic.status === 'active' ? (
                            <button
                              onClick={() => onRevokeLicense(lic.id)}
                              title="Revogar licença"
                              className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => onRenewLicense(lic.id, 30)}
                              title="Reativar licença"
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium transition"
                            >
                              Reativar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected License Detail Drawer / Modal Preview */}
      {selectedLicenseForDetails && (
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-blue-100 text-blue-700 font-mono font-bold text-sm">
                {selectedLicenseForDetails.key}
              </span>
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  {selectedLicenseForDetails.customerName}
                </h4>
                <p className="text-xs text-slate-500">
                  {selectedLicenseForDetails.customerEmail} • {selectedLicenseForDetails.customerPhone}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedLicenseForDetails(null)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Fechar Detalhes ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-semibold block mb-1">Limites Configurados</span>
              <ul className="space-y-1 text-slate-700">
                <li>Leads diários: <strong>{selectedLicenseForDetails.limits?.maxDailyLeads || 1000}</strong></li>
                <li>Mensagens/dia: <strong>{selectedLicenseForDetails.limits?.maxDailyMessages || 3000}</strong></li>
                <li>Dispositivos: <strong>{selectedLicenseForDetails.maxDevices}</strong></li>
              </ul>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-semibold block mb-1">Assinatura & Faturamento</span>
              <ul className="space-y-1 text-slate-700">
                <li>Valor: <strong>R$ {selectedLicenseForDetails.price?.toFixed(2)}</strong></li>
                <li>Status Pagamento: <strong className="text-emerald-600">{selectedLicenseForDetails.paymentStatus?.toUpperCase()}</strong></li>
                <li>Criada em: {new Date(selectedLicenseForDetails.createdAt).toLocaleDateString('pt-BR')}</li>
              </ul>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-semibold block mb-1">Dispositivos Autorizados</span>
              {selectedLicenseForDetails.devices?.length === 0 ? (
                <span className="text-slate-400">Nenhum dispositivo ativado ainda.</span>
              ) : (
                <ul className="space-y-1 text-slate-700">
                  {selectedLicenseForDetails.devices?.map((d, i) => (
                    <li key={i} className="truncate">
                      📱 {d.deviceName} ({d.extVersion})
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-700 block mb-2">
              Entitlements Liberados para Esta Licença ({selectedLicenseForDetails.entitlements?.length || 0}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedLicenseForDetails.entitlements?.map(ent => (
                <span
                  key={ent}
                  className="px-2 py-0.5 text-[10px] font-mono rounded bg-white border border-slate-200 text-slate-700"
                >
                  {ent}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
