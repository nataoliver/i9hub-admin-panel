import { License, Subscription, SalesRep, FunnelStage, QualityMetrics, FilterPeriod } from '../types';

export const apiClient = {
  async getOverview(period = '30d') {
    const res = await fetch(`/api/v1/admin/overview?period=${period}`);
    return res.json();
  },

  async getLicenses(params?: { search?: string; plan?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.plan) query.set('plan', params.plan);
    if (params?.status) query.set('status', params.status);
    const res = await fetch(`/api/v1/admin/licenses?${query.toString()}`);
    return res.json();
  },

  async createLicense(data: Partial<License> & { durationDays?: number; customEntitlements?: string[] }) {
    const res = await fetch('/api/v1/admin/licenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateLicense(id: string, data: any) {
    const res = await fetch(`/api/v1/admin/licenses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async revokeLicense(id: string) {
    const res = await fetch(`/api/v1/admin/licenses/${id}/revoke`, {
      method: 'POST'
    });
    return res.json();
  },

  async unbindDevice(licenseId: string, deviceId: string) {
    const res = await fetch(`/api/v1/admin/licenses/${licenseId}/devices/${deviceId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async getSubscriptions() {
    const res = await fetch('/api/v1/admin/subscriptions');
    return res.json();
  },

  async simulateWebhook(gateway: string, payload: any) {
    const res = await fetch(`/api/v1/billing/webhook?gateway=${gateway}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async getSalesReps() {
    const res = await fetch('/api/v1/admin/sales-reps');
    return res.json();
  },

  async getFunnel(period = '30d') {
    const res = await fetch(`/api/v1/admin/funnel?period=${period}`);
    return res.json();
  },

  async getQuality() {
    const res = await fetch('/api/v1/admin/quality');
    return res.json();
  },

  async getCatalog() {
    const res = await fetch('/api/v1/catalog');
    return res.json();
  },

  async simulateEvent(type: 'opportunity' | 'conversion', payload?: any) {
    const res = await fetch('/api/v1/admin/simulate-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload })
    });
    return res.json();
  },

  // Test what the extension does when activating
  async activateAsExtension(licenseKey: string, deviceId = 'test_device_web', extVersion = '5.4.1') {
    const res = await fetch('/api/v1/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        licenseKey,
        deviceId,
        deviceName: 'Simulador i9Hub Extension',
        extVersion
      })
    });
    return res.json();
  },

  // Test what the extension sends in batch telemetry
  async sendTelemetryBatch(events: any[], deviceId = 'test_device_web') {
    const res = await fetch('/api/v1/telemetry/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Device-Id': deviceId },
      body: JSON.stringify({
        schemaVersion: 1,
        extVersion: '5.4.1',
        deviceId,
        events
      })
    });
    return res.json();
  }
};
