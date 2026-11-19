import React, { useState } from 'react';
import {
  X,
  KeyRound,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Smartphone,
  Calendar,
  DollarSign,
  ShieldCheck
} from 'lucide-react';
import { PlanType, BillingCycle } from '../types';
import { FEATURE_CATALOG } from '../../server';

interface NewLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
}

export const NewLicenseModal: React.FC<NewLicenseModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  if (!isOpen) return null;

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+55 11 9');
  const [companyName, setCompanyName] = useState('');
  const [plan, setPlan] = useState<PlanType>('pro');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [maxDevices, setMaxDevices] = useState(2);
  const [durationDays, setDurationDays] = useState(30);
  const [price, setPrice] = useState('297.00');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const handlePlanChange = (newPlan: PlanType) => {
    setPlan(newPlan);
    if (newPlan === 'free') {
      setPrice('0.00');
      setMaxDevices(1);
      setDurationDays(7);
    } else if (newPlan === 'starter') {
      setPrice('147.00');
      setMaxDevices(1);
      setDurationDays(30);
    } else if (newPlan === 'pro') {
      setPrice('297.00');
      setMaxDevices(2);
      setDurationDays(30);
    } else if (newPlan === 'business') {
      setPrice('697.00');
      setMaxDevices(5);
      setDurationDays(30);
    } else if (newPlan === 'enterprise') {
      setPrice('1497.00');
      setMaxDevices(10);
      setDurationDays(365);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await onSubmit({
        customerName,
        customerEmail,
        customerPhone,
        companyName: companyName || customerName,
        plan,
        billingCycle,
        maxDevices: Number(maxDevices),
        durationDays: Number(durationDays),
        price: Number(price),
        notes
      });
      if (res.success) {
        setCreatedResult(res);
      } else {
        alert(res.error || 'Erro ao gerar licença');
      }
    } catch (err: any) {
      alert(err.message || 'Erro inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900">
              {createdResult ? 'Licença Criada com Sucesso!' : 'Gerar Nova Licença Automática'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdResult ? (
          <div className="space-y-5 text-xs">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-center">
              <span className="text-emerald-700 font-bold text-sm block">
                Chave de Ativação Pronta para Uso
              </span>
              <div className="flex items-center justify-center gap-2">
                <code className="text-lg font-mono font-black text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 shadow-xs select-all">
                  {createdResult.license.key}
                </code>
                <button
                  onClick={() => handleCopy(createdResult.license.key)}
                  className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
                  title="Copiar Chave"
                >
                  {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-slate-600 text-xs">
                Válida para <strong>{createdResult.license.customerName}</strong> até{' '}
                {new Date(createdResult.license.expiresAt).toLocaleDateString('pt-BR')}.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-800 block">Enviar Diretamente ao Cliente:</span>
              <a
                href={createdResult.whatsappShareLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/20 text-xs"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir WhatsApp com Chave e Mensagem Pronta
              </a>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs"
              >
                Concluir e Fechar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nome do Cliente / Responsável *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  E-mail do Cliente *
                </label>
                <input
                  type="email"
                  required
                  placeholder="joao@empresa.com.br"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  WhatsApp com DDD *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+55 11 98765-4321"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Empresa / Razão Social
                </label>
                <input
                  type="text"
                  placeholder="Silva Consultoria Ltda"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Plan selection */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Plano i9Hub:</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {(['free', 'starter', 'pro', 'business', 'enterprise'] as PlanType[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePlanChange(p)}
                    className={`py-2 px-1 text-center rounded-lg font-bold uppercase text-[10px] border transition ${
                      plan === p
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Valor (R$):</label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dispositivos:</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={maxDevices}
                  onChange={e => setMaxDevices(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Validade (Dias):</label>
                <input
                  type="number"
                  min="1"
                  max="3650"
                  value={durationDays}
                  onChange={e => setDurationDays(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Observações internas:
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Cliente fechado via campanha de Google Maps. Vendedor responsável: Carlos Mendes."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow-md shadow-blue-500/25 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isSubmitting ? 'Gerando...' : 'Emitir Chave e Assinar Token'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
