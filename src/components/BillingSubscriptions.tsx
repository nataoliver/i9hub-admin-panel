import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Zap,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { Subscription, WebhookLog } from '../types';

interface BillingSubscriptionsProps {
  subscriptions: Subscription[];
  webhookLogs: WebhookLog[];
  onOpenWebhookModal: () => void;
  onRefresh: () => void;
}

export const BillingSubscriptions: React.FC<BillingSubscriptionsProps> = ({
  subscriptions,
  webhookLogs,
  onOpenWebhookModal,
  onRefresh
}) => {
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);

  const totalMrr = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  const activeSubs = subscriptions.filter(s => s.status === 'active').length;
  const overdueSubs = subscriptions.filter(s => s.status === 'past_due').length;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLogId(id);
    setTimeout(() => setCopiedLogId(null), 2000);
  };

  const formatBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top billing banner & action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            Central de Faturamento & Pagamentos Integrados
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestão unificada de assinaturas com conciliação automática via Webhook (Mercado Pago, Asaas, Stripe e PIX).
          </p>
        </div>

        <button
          onClick={onOpenWebhookModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <Zap className="w-4 h-4 text-amber-300" />
          Simular Webhook de Pagamento
        </button>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>MRR Atual</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{formatBrl(totalMrr)}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">+16.4%</span> vs mês anterior
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>ARR Projetado</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">{formatBrl(totalMrr * 12)}</div>
          <div className="text-xs text-slate-500 mt-1">Estimativa anualizada</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Assinaturas Ativas</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{activeSubs} clientes</div>
          <div className="text-xs text-slate-500 mt-1">Taxa de Churn: 1.2%</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Inadimplência</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-2">{overdueSubs} pendentes</div>
          <div className="text-xs text-slate-500 mt-1">Régua de cobrança automática ativa</div>
        </div>
      </div>

      {/* Payment Gateways Status */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Status dos Gateways de Pagamento & Webhook Listeners
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">Mercado Pago</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                Ativo (200 OK)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">PIX com QR Code instantâneo e Cartão.</p>
            <code className="text-[10px] bg-white p-1.5 rounded border border-slate-200 text-slate-600 font-mono truncate">
              /api/v1/billing/webhook?gateway=mercadopago
            </code>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">Asaas</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                Ativo (200 OK)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">Boletos com split e cobrança recorrente.</p>
            <code className="text-[10px] bg-white p-1.5 rounded border border-slate-200 text-slate-600 font-mono truncate">
              /api/v1/billing/webhook?gateway=asaas
            </code>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">Stripe</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                Homologado
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">Assinaturas internacionais e USD.</p>
            <code className="text-[10px] bg-white p-1.5 rounded border border-slate-200 text-slate-600 font-mono truncate">
              /api/v1/billing/webhook?gateway=stripe
            </code>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">PIX Automático</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
                Liberação em 1s
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">Gera a chave e libera a extensão na hora.</p>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              ✓ Sem intervenção manual
            </span>
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Assinaturas Recorrentes dos Clientes</h3>
          <button onClick={onRefresh} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Plano</th>
                <th className="py-3 px-4">Valor</th>
                <th className="py-3 px-4">Forma de Pagamento</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Próxima Cobrança</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subscriptions.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{sub.customerName}</div>
                    <div className="text-[11px] text-slate-500">{sub.customerEmail}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold uppercase text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {sub.plan}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {formatBrl(sub.amount)} / mês
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize font-medium text-slate-700">
                      {sub.paymentMethod === 'pix'
                        ? '⚡ PIX Instantâneo'
                        : sub.paymentMethod === 'credit_card'
                        ? '💳 Cartão de Crédito'
                        : '📄 Boleto'}
                    </span>
                    <span className="text-[10px] text-slate-400 block uppercase">
                      via {sub.gateway}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        sub.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.status === 'past_due'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sub.status === 'active'
                        ? 'Ativa'
                        : sub.status === 'past_due'
                        ? 'Atrasada'
                        : 'Pendente'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {new Date(sub.nextBillingDate).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Webhooks Processing Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-500" />
              Log de Webhooks Recebidos dos Gateways
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Eventos de pagamentos que dispararam a geração ou renovação de licenças
            </p>
          </div>
          <span className="text-xs text-slate-500">{webhookLogs.length} eventos registrados</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {webhookLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              Nenhum evento de webhook recebido ainda. Use o botão acima para simular.
            </div>
          ) : (
            webhookLogs.map(log => (
              <div
                key={log.id}
                className="p-4 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 uppercase">{log.gateway}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {log.event}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ {log.status}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs">{log.resultMessage}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-slate-400">
                    {new Date(log.receivedAt).toLocaleString('pt-BR')}
                  </span>
                  <button
                    onClick={() => setSelectedLog(log)}
                    className="px-2.5 py-1 text-[11px] font-medium border border-slate-200 rounded-lg text-slate-700 hover:bg-white transition"
                  >
                    Ver Payload
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Webhook JSON Payload Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="font-bold text-sm text-slate-900">
                Payload JSON do Webhook ({selectedLog.gateway.toUpperCase()})
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>
            <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-80">
              {JSON.stringify(selectedLog.payload, null, 2)}
            </pre>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
