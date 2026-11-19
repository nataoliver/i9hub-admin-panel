import React, { useState } from 'react';
import { X, Zap, RefreshCw, CheckCircle2, DollarSign, Radio } from 'lucide-react';

interface WebhookSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulate: (gateway: string, payload: any) => Promise<any>;
}

export const WebhookSimulatorModal: React.FC<WebhookSimulatorModalProps> = ({
  isOpen,
  onClose,
  onSimulate
}) => {
  if (!isOpen) return null;

  const [gateway, setGateway] = useState('mercadopago');
  const [eventType, setEventType] = useState('payment.approved');
  const [customerName, setCustomerName] = useState('Juliana Paes Cosméticos');
  const [customerEmail, setCustomerEmail] = useState('juliana@paescosmeticos.com.br');
  const [amount, setAmount] = useState('297.00');
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);
    try {
      let mockPayload: any = {};
      if (gateway === 'mercadopago') {
        mockPayload = {
          action: eventType,
          id: Math.floor(Math.random() * 9000000) + 1000000,
          status: 'approved',
          transaction_amount: Number(amount),
          payment_method_id: paymentMethod,
          customer: {
            name: customerName,
            email: customerEmail,
            phone: '+55 11 99123-4567'
          }
        };
      } else if (gateway === 'asaas') {
        mockPayload = {
          event: 'PAYMENT_RECEIVED',
          payment: {
            id: `pay_${Date.now()}`,
            value: Number(amount),
            billingType: paymentMethod === 'pix' ? 'PIX' : 'CREDIT_CARD',
            customer: customerEmail,
            customerName
          }
        };
      } else {
        mockPayload = {
          type: 'charge.succeeded',
          data: {
            amount: Number(amount) * 100,
            customer_email: customerEmail,
            customer_name: customerName
          }
        };
      }

      const res = await onSimulate(gateway, mockPayload);
      setResult(res);
    } catch (err: any) {
      alert(err.message || 'Erro ao simular webhook');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-900">
              Simular Webhook de Pagamento (Faturamento Automático)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {result ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Webhook Processado com Sucesso!
              </div>
              <p className="text-slate-700">{result.message}</p>
              {result.licenseKey && (
                <div className="mt-2 pt-2 border-t border-emerald-200">
                  <span className="text-[11px] text-slate-500 block">Chave gerada automaticamente:</span>
                  <code className="font-mono font-bold text-sm text-blue-700 bg-white px-2 py-1 rounded border border-emerald-300">
                    {result.licenseKey}
                  </code>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Gateway de Pagamento:
              </label>
              <select
                value={gateway}
                onChange={e => setGateway(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 font-semibold"
              >
                <option value="mercadopago">Mercado Pago (PIX Instantâneo & Cartão)</option>
                <option value="asaas">Asaas (Boletos & Split)</option>
                <option value="stripe">Stripe (Cartão Internacional)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nome do Comprador:
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  E-mail do Comprador:
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Valor Pago (R$):
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Método de Pagamento:
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-white"
                >
                  <option value="pix">PIX Instantâneo</option>
                  <option value="credit_card">Cartão de Crédito</option>
                  <option value="boleto">Boleto Bancário</option>
                </select>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
              💡 <strong>Comportamento Automatizado:</strong> Ao receber a aprovação, o painel
              provisiona a chave de ativação, assina os entitlements correspondentes e agenda a
              próxima renovação no CRM.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                Simular Pagamento Aprovado
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
