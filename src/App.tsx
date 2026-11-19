import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, TabType } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { LicenseManagement } from './components/LicenseManagement';
import { BillingSubscriptions } from './components/BillingSubscriptions';
import { TelemetryView } from './components/TelemetryView';
import { SalesPerformance } from './components/SalesPerformance';
import { FunnelAutomation } from './components/FunnelAutomation';
import { QualityManagement } from './components/QualityManagement';
import { ExtensionSimulator } from './components/ExtensionSimulator';
import { NewLicenseModal } from './components/NewLicenseModal';
import { WebhookSimulatorModal } from './components/WebhookSimulatorModal';
import { DeviceManagerModal } from './components/DeviceManagerModal';
import { apiClient } from './services/api';
import { License, Subscription, WebhookLog, TelemetryEvent, SalesRep, FunnelStage, QualityMetrics } from './types';
import { CheckCircle2, TrendingUp, Award, Zap } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [period, setPeriod] = useState<string>('30d');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Core Data Stores
  const [kpis, setKpis] = useState<any>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [funnelStages, setFunnelStages] = useState<FunnelStage[]>([]);
  const [quality, setQuality] = useState<QualityMetrics | null>(null);
  const [activeDevicesList, setActiveDevicesList] = useState<any[]>([]);

  // Modals
  const [isNewLicenseOpen, setIsNewLicenseOpen] = useState(false);
  const [isWebhookOpen, setIsWebhookOpen] = useState(false);
  const [deviceModalLicense, setDeviceModalLicense] = useState<License | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const [overviewRes, licensesRes, subsRes, repsRes, funnelRes, qualityRes] = await Promise.all([
        apiClient.getOverview(period),
        apiClient.getLicenses(),
        apiClient.getSubscriptions(),
        apiClient.getSalesReps(),
        apiClient.getFunnel(period),
        apiClient.getQuality()
      ]);

      if (overviewRes?.success) {
        setKpis(overviewRes.kpis);
        setActiveDevicesList(overviewRes.activeDevicesList || []);
      }
      if (licensesRes?.success) setLicenses(licensesRes.licenses);
      if (subsRes?.success) {
        setSubscriptions(subsRes.subscriptions);
        setWebhookLogs(subsRes.webhookLogs);
      }
      if (repsRes?.success) setSalesReps(repsRes.salesReps);
      if (funnelRes?.success) setFunnelStages(funnelRes.stages);
      if (qualityRes?.success) setQuality(qualityRes.quality);

      // Quick ping to keep active
      await apiClient.getOverview(period);
    } catch (err) {
      console.error('Failed to load data from API:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handlers
  const handleCreateLicense = async (data: any) => {
    const res = await apiClient.createLicense(data);
    if (res.success) {
      showToast(`Licença ${res.license.key} criada e assinada com sucesso!`);
      loadAllData(true);
    }
    return res;
  };

  const handleRenewLicense = async (id: string, days: number) => {
    const res = await apiClient.updateLicense(id, { renewDays: days });
    if (res.success) {
      showToast(`Licença renovada por +${days} dias com sucesso!`);
      loadAllData(true);
    }
  };

  const handleRevokeLicense = async (id: string) => {
    if (!confirm('Deseja realmente revogar esta licença? O usuário perderá o acesso na extensão.')) return;
    const res = await apiClient.revokeLicense(id);
    if (res.success) {
      showToast('Licença revogada com sucesso.');
      loadAllData(true);
    }
  };

  const handleUnbindDevice = async (licenseId: string, deviceId: string) => {
    const res = await apiClient.unbindDevice(licenseId, deviceId);
    if (res.success) {
      showToast('Dispositivo desvinculado. Slot liberado para nova máquina.');
      loadAllData(true);
      // update modal
      setDeviceModalLicense(prev => (prev ? { ...prev, devices: res.devices } : null));
    }
    return res;
  };

  const handleSimulateWebhook = async (gateway: string, payload: any) => {
    const res = await apiClient.simulateWebhook(gateway, payload);
    if (res.success) {
      showToast(`Webhook ${gateway.toUpperCase()} aprovado! Licença provisionada.`);
      loadAllData(true);
    }
    return res;
  };

  const handleSimulateOpportunity = async () => {
    const names = [
      'Clínica Médica Santa Luzia',
      'Construtora Horizonte Nobre',
      'Escritório de Advocacia Castro & Silva',
      'Distribuidora de Alimentos União',
      'Academia IronFit Prime'
    ];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const val = (Math.floor(Math.random() * 8) + 2) * 500;

    const res = await apiClient.simulateEvent('opportunity', {
      leadName: randomName,
      value: val,
      plan: 'pro'
    });
    if (res.success) {
      showToast(`⚡ Nova Oportunidade capturada na extensão: ${randomName} (R$ ${val.toFixed(2)})`);
      loadAllData(true);
    }
  };

  const handleSimulateConversion = async () => {
    const names = [
      'Restaurante & Buffet Sabor Paulista',
      'Farmácia DrogaVitta Matriz',
      'Transportadora Rápido Sudeste',
      'Colégio Integrado Futuro'
    ];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const val = 297.0;

    const res = await apiClient.simulateEvent('conversion', {
      leadName: randomName,
      value: val
    });
    if (res.success) {
      showToast(`🎉 Venda Fechada! ${randomName} converteu (R$ 297,00/mês)!`);
      loadAllData(true);
    }
  };

  const periodLabels: Record<string, string> = {
    today: 'Hoje',
    '7d': 'Últimos 7 dias',
    '30d': 'Últimos 30 dias',
    this_month: 'Este mês',
    all: 'Todo o período'
  };

  const getTabTitles = (): { title: string; subtitle: string } => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Dashboard de Vendas & Licenciamento',
          subtitle: 'Central unificada de controle de licenças, telemetria e métricas de conversão da extensão i9Hub.'
        };
      case 'licenses':
        return {
          title: 'Gestão de Licenças & Chaves',
          subtitle: 'Gere chaves automatizadas, assine tokens Ed25519 e gerencie limites de dispositivos.'
        };
      case 'billing':
        return {
          title: 'Faturamento & Assinaturas',
          subtitle: 'Conciliação com Mercado Pago, Asaas, Stripe e PIX com geração automática de chaves.'
        };
      case 'telemetry':
        return {
          title: 'Dashboard de Telemetria',
          subtitle: 'Métricas de saúde e uso das funções da extensão (Google Maps, WhatsApp, Atendimento com IA).'
        };
      case 'funnel':
        return {
          title: 'Funil Comercial & Automação',
          subtitle: 'Análise de conversão etapa-a-etapa dos leads capturados até o fechamento de vendas.'
        };
      case 'sales-reps':
        return {
          title: 'Monitoramento de Vendedores',
          subtitle: 'Desempenho individual, taxa de conversão, velocidade de atendimento e compliance.'
        };
      case 'quality':
        return {
          title: 'Gestão de Qualidade & Anti-Ban',
          subtitle: 'Auditoria de diretrizes da Meta, limites de envio seguro e assertividade da IA.'
        };
      case 'simulator':
        return {
          title: 'Sandbox & Simulador da Extensão',
          subtitle: 'Ambiente de testes para validar requisições da extensão e configurar comunicados in-app.'
        };
      default:
        return { title: 'i9Hub Admin', subtitle: 'Painel Administrativo' };
    }
  };

  const activeLicensesCount = licenses.filter(l => l.status === 'active').length;
  const activeDevicesCount = activeDevicesList.length || (kpis?.activeDevices ?? 1);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeDevicesCount={activeDevicesCount}
        activeLicensesCount={activeLicensesCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        <Header
          title={getTabTitles().title}
          subtitle={getTabTitles().subtitle}
          period={period}
          onPeriodChange={setPeriod}
          onOpenNewLicenseModal={() => setIsNewLicenseOpen(true)}
          onOpenWebhookModal={() => setIsWebhookOpen(true)}
          onSimulateOpportunity={handleSimulateOpportunity}
          onSimulateConversion={handleSimulateConversion}
          onRefresh={() => loadAllData()}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 pb-16">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center min-h-[500px] space-y-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <p className="text-xs text-slate-500 font-medium">Carregando painel administrativo...</p>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardOverview
                  kpis={kpis}
                  salesReps={salesReps}
                  recentLicenses={licenses}
                  recentEvents={kpis ? [
                    { id: '1', event: 'crm.stage.changed', metadata: { stageCategory: 'won', leadName: 'TechSolutions Software', value: 12400 }, deviceId: 'did_carlos_mbp_2026', timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
                    { id: '2', event: 'crm.opportunity.opened', metadata: { leadName: 'Roberto Alencar Investimentos', value: 8500 }, deviceId: 'did_beatriz_win11_401', timestamp: new Date(Date.now() - 45 * 60000).toISOString() },
                    { id: '3', event: 'crm.leads.saved', metadata: { count: 48, leadName: 'Clínicas Médicas SP (Maps)' }, deviceId: 'did_beatriz_win11_401', timestamp: new Date(Date.now() - 90 * 60000).toISOString() }
                  ] : []}
                  onNavigateTab={setCurrentTab}
                  onOpenNewLicense={() => setIsNewLicenseOpen(true)}
                  periodLabel={periodLabels[period] || period}
                />
              )}

              {currentTab === 'licenses' && (
                <LicenseManagement
                  licenses={licenses}
                  onOpenNewModal={() => setIsNewLicenseOpen(true)}
                  onRenewLicense={handleRenewLicense}
                  onRevokeLicense={handleRevokeLicense}
                  onManageDevices={lic => setDeviceModalLicense(lic)}
                  onRefresh={() => loadAllData(true)}
                />
              )}

              {currentTab === 'billing' && (
                <BillingSubscriptions
                  subscriptions={subscriptions}
                  webhookLogs={webhookLogs}
                  onOpenWebhookModal={() => setIsWebhookOpen(true)}
                  onRefresh={() => loadAllData(true)}
                />
              )}

              {currentTab === 'telemetry' && (
                <TelemetryView
                  events={[
                    { id: 'evt_1', event: 'crm.opportunity.opened', featureId: 'telemetry.sales_funnel', timestamp: new Date(Date.now() - 12 * 60000).toISOString(), extVersion: '5.4.1', deviceId: 'did_carlos_mbp_2026', metadata: { leadName: 'Escritório Contábil Alfa', value: 3200 } },
                    { id: 'evt_2', event: 'crm.stage.changed', featureId: 'crm.kanban', timestamp: new Date(Date.now() - 25 * 60000).toISOString(), extVersion: '5.4.1', deviceId: 'did_beatriz_win11_401', metadata: { stageCategory: 'won', leadName: 'Distribuidora Ramos', value: 7800 } },
                    { id: 'evt_3', event: 'crm.leads.saved', featureId: 'maps.extraction', timestamp: new Date(Date.now() - 55 * 60000).toISOString(), extVersion: '5.4.0', deviceId: 'did_carlos_mbp_2026', metadata: { count: 35, source: 'google_maps' } },
                    { id: 'evt_4', event: 'whatsapp.awaiting_reply.snapshot', featureId: 'dashboard.awaiting_reply', timestamp: new Date(Date.now() - 90 * 60000).toISOString(), extVersion: '5.4.1', deviceId: 'did_carlos_mbp_2026', metadata: { pendingCount: 4, oldestPendingMinutes: 12 } }
                  ]}
                  activeDevices={activeDevicesList}
                  period={period}
                  onPeriodChange={setPeriod}
                  onRefresh={() => loadAllData(true)}
                />
              )}

              {currentTab === 'funnel' && (
                <FunnelAutomation
                  stages={funnelStages}
                  period={period}
                  onPeriodChange={setPeriod}
                  onSimulateConversion={handleSimulateConversion}
                  onRefresh={() => loadAllData(true)}
                />
              )}

              {currentTab === 'sales-reps' && (
                <SalesPerformance
                  salesReps={salesReps}
                  period={period}
                  onPeriodChange={setPeriod}
                  onRefresh={() => loadAllData(true)}
                />
              )}

              {currentTab === 'quality' && quality && (
                <QualityManagement
                  quality={quality}
                  onRefresh={() => loadAllData(true)}
                />
              )}

              {currentTab === 'simulator' && (
                <ExtensionSimulator
                  licenses={licenses}
                  onRefreshAll={() => loadAllData(true)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <NewLicenseModal
        isOpen={isNewLicenseOpen}
        onClose={() => setIsNewLicenseOpen(false)}
        onSubmit={handleCreateLicense}
      />

      <WebhookSimulatorModal
        isOpen={isWebhookOpen}
        onClose={() => setIsWebhookOpen(false)}
        onSimulate={handleSimulateWebhook}
      />

      <DeviceManagerModal
        license={deviceModalLicense}
        isOpen={!!deviceModalLicense}
        onClose={() => setDeviceModalLicense(null)}
        onUnbindDevice={handleUnbindDevice}
      />
    </div>
  );
}
