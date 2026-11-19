import React, { useState } from 'react';
import {
  Cpu,
  KeyRound,
  Activity,
  Send,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Terminal,
  Smartphone,
  Radio,
  Sliders
} from 'lucide-react';
import { apiClient } from '../services/api';
import { License } from '../types';

interface ExtensionSimulatorProps {
  licenses: License[];
  onRefreshAll: () => void;
}

export const ExtensionSimulator: React.FC<ExtensionSimulatorProps> = ({
  licenses,
  onRefreshAll
}) => {
  const [selectedLicenseKey, setSelectedLicenseKey] = useState(licenses[0]?.key || '');
  const [deviceIdInput, setDeviceIdInput] = useState('did_chrome_sim_2026');
  const [activationResult, setActivationResult] = useState<any>(null);
  const [isLoadingActivation, setIsLoadingActivation] = useState(false);

  // Telemetry batch test state
  const [telemetryEventType, setTelemetryEventType] = useState('crm.opportunity.opened');
  const [leadNameInput, setLeadNameInput] = useState('Consultoria Tributária Silva & Associados');
  const [leadValueInput, setLeadValueInput] = useState('4500');
  const [telemetryResult, setTelemetryResult] = useState<any>(null);
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(false);

  // In-app ad / notification config preview
  const [footerAdTitle, setFooterAdTitle] = useState('Desbloqueie o Piloto Automático de Vendas');
  const [footerAdText, setFooterAdText] = useState('Faça upgrade para o plano Pro e tenha IA respondendo seus clientes no WhatsApp 24/7.');
  const [adSavedToast, setAdSavedToast] = useState(false);

  const handleTestActivation = async () => {
    setIsLoadingActivation(true);
    setActivationResult(null);
    try {
      const res = await apiClient.activateAsExtension(selectedLicenseKey, deviceIdInput, '5.4.1');
      setActivationResult(res);
      onRefreshAll();
    } catch (err: any) {
      setActivationResult({ success: false, error: err.message });
    } finally {
      setIsLoadingActivation(false);
    }
  };

  const handleSendTelemetry = async () => {
    setIsLoadingTelemetry(true);
    setTelemetryResult(null);
    try {
      const mockEvent = {
        id: `evt_sim_${Date.now()}`,
        event: telemetryEventType,
        featureId: telemetryEventType.includes('opportunity')
          ? 'telemetry.sales_funnel'
          : telemetryEventType.includes('won')
          ? 'crm.kanban'
          : 'maps.extraction',
        timestamp: new Date().toISOString(),
        extVersion: '5.4.1',
        metadata: {
          leadName: leadNameInput,
          value: Number(leadValueInput) || 2500,
          stageCategory: telemetryEventType.includes('won') ? 'won' : 'open',
          count: 1
        }
      };

      const res = await apiClient.sendTelemetryBatch([mockEvent], deviceIdInput);
      setTelemetryResult(res);
      onRefreshAll();
    } catch (err: any) {
      setTelemetryResult({ success: false, error: err.message });
    } finally {
      setIsLoadingTelemetry(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            Sandbox & Simulador de Integração da Extensão
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Teste ponta a ponta as requisições que a extensão Chrome i9Hub envia para o backend em tempo real.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Test 1: POST /api/v1/activate */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Teste de Ativação de Licença (Handshake da Extensão)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Simula exatamente o que acontece quando o usuário cola a chave na extensão e clica em "Ativar Licença".
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Selecione uma chave de licença:
              </label>
              <select
                value={selectedLicenseKey}
                onChange={e => setSelectedLicenseKey(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 font-mono text-xs bg-slate-50 text-slate-800"
              >
                {licenses.map(l => (
                  <option key={l.id} value={l.key}>
                    {l.key} — {l.customerName} ({l.plan.toUpperCase()} - {l.status})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                UUID do Dispositivo (DeviceId):
              </label>
              <input
                type="text"
                value={deviceIdInput}
                onChange={e => setDeviceIdInput(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 font-mono text-xs bg-white text-slate-800"
              />
            </div>

            <button
              onClick={handleTestActivation}
              disabled={isLoadingActivation || !selectedLicenseKey}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 shadow-xs"
            >
              {isLoadingActivation ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Disparar POST /api/v1/activate
            </button>
          </div>

          {activationResult && (
            <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold">
                {activationResult.success ? (
                  <span className="text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Sucesso (HTTP 200) — Licença Ativada
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Erro na Validação
                  </span>
                )}
              </div>

              <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-[11px] font-mono overflow-x-auto max-h-52">
                {JSON.stringify(activationResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Test 2: POST /api/v1/telemetry/events */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Simulador de Evento de Telemetria da Extensão
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Injeta eventos reais de prospecção, oportunidade ou conversão para testar a atualização do funil em tempo real.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Tipo do Evento da Extensão:
              </label>
              <select
                value={telemetryEventType}
                onChange={e => setTelemetryEventType(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-slate-50 text-slate-800"
              >
                <option value="crm.opportunity.opened">
                  crm.opportunity.opened (Nova Oportunidade Aberta)
                </option>
                <option value="crm.stage.changed">
                  crm.stage.changed (Venda Fechada / Ganho)
                </option>
                <option value="crm.leads.saved">
                  crm.leads.saved (Leads Extraídos do Google Maps)
                </option>
                <option value="whatsapp.awaiting_reply.snapshot">
                  whatsapp.awaiting_reply.snapshot (Pendências de Resposta)
                </option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Nome do Lead / Empresa:
              </label>
              <input
                type="text"
                value={leadNameInput}
                onChange={e => setLeadNameInput(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Valor Comercial Estimado (R$):
              </label>
              <input
                type="number"
                value={leadValueInput}
                onChange={e => setLeadValueInput(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs bg-white text-slate-800"
              />
            </div>

            <button
              onClick={handleSendTelemetry}
              disabled={isLoadingTelemetry}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 shadow-xs"
            >
              {isLoadingTelemetry ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Enviar Evento via Telemetria
            </button>
          </div>

          {telemetryResult && (
            <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /> Ingestão Concluída (HTTP 200)
              </div>
              <pre className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-[11px] font-mono overflow-x-auto max-h-52">
                {JSON.stringify(telemetryResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Extension In-App Communication & Footer Ad Config */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-600" />
              Comunicados e Anúncio de Rodapé da Extensão (GET /api/v1/extension/config)
            </h3>
            <p className="text-xs text-slate-500">
              Configure comunicados ou ofertas de upgrade para exibir no rodapé da extensão dos clientes
            </p>
          </div>
          {adSavedToast && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              ✓ Configuração Sincronizada!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Título do Banner:</label>
              <input
                type="text"
                value={footerAdTitle}
                onChange={e => setFooterAdTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Texto Promocional:</label>
              <textarea
                value={footerAdText}
                onChange={e => setFooterAdText(e.target.value)}
                rows={3}
                className="w-full border border-slate-200 rounded-lg p-2 text-xs"
              />
            </div>
            <button
              onClick={() => {
                setAdSavedToast(true);
                setTimeout(() => setAdSavedToast(false), 2500);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs"
            >
              Salvar e Publicar na Extensão
            </button>
          </div>

          {/* Live Preview of Extension Footer */}
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold uppercase text-slate-500">
              Preview em Tempo Real (Rodapé da Extensão):
            </span>
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-4 rounded-xl text-white shadow-lg space-y-2">
              <div className="font-bold text-sm text-amber-300">{footerAdTitle}</div>
              <p className="text-slate-300 text-xs leading-relaxed">{footerAdText}</p>
              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-semibold shadow-xs">
                Ativar Agora no WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
