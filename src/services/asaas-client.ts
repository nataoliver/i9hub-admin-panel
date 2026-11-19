/**
 * Cliente HTTP para integração com Asaas (pagamentos recorrentes).
 * Portado e adaptado de Extensão/Arquivo/src/services/asaas-client.ts
 * para uso no painel administrativo _design.
 *
 * Configuração via variáveis de ambiente:
 *   ASAAS_API_KEY  — chave de acesso da API Asaas
 *   ASAAS_ENV      — "sandbox" (padrão) ou "production"
 */

const ASAAS_URLS: Record<string, string> = {
  sandbox: 'https://sandbox.asaas.com/api/v3',
  production: 'https://www.asaas.com/api/v3',
};

function getApiKey(): string {
  const key = process.env.ASAAS_API_KEY;
  if (!key) throw new Error('ASAAS_API_KEY não configurada no .env');
  return key;
}

function getBaseUrl(): string {
  const env = (process.env.ASAAS_ENV || 'sandbox').toLowerCase();
  return ASAAS_URLS[env] || ASAAS_URLS.sandbox;
}

async function asaasFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const base = getBaseUrl();
  const apiKey = getApiKey();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'i9RCS-License-Panel/2.0',
      access_token: apiKey,
      ...init.headers,
    },
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Asaas ${res.status}: ${txt || res.statusText}`);
  }
  return res;
}

// ─── Tipos ──────────────────────────────────────────────

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj?: string;
  phone?: string;
  mobilePhone?: string;
}

export interface AsaasPaymentLink {
  id: string;
  url: string;
}

export interface AsaasSubscription {
  id: string;
  customer: string;
  value: number;
  nextDueDate: string;
  cycle: string;
  status: string;
}

// ─── Conexão ────────────────────────────────────────────

/** Testa conexão com Asaas (GET /account). Retorna true se OK. */
export async function pingAsaas(): Promise<boolean> {
  try {
    await asaasFetch('/account');
    return true;
  } catch {
    return false;
  }
}

// ─── Links de Pagamento ─────────────────────────────────

/**
 * Cria link de pagamento reutilizável para um plano.
 * Para planos pagos recorrentes, use chargeType='RECURRENT' + cycle='MONTHLY'.
 * Para planos gratuitos/parceria, use chargeType='DETACHED'.
 */
export async function createPlanPaymentLink(params: {
  name: string;
  description: string;
  valueCents: number;
  billingType?: 'UNDEFINED' | 'PIX' | 'BOLETO' | 'CREDIT_CARD';
  chargeType?: 'DETACHED' | 'RECURRENT' | 'INSTALLMENT';
  cycle?: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
}): Promise<AsaasPaymentLink> {
  const body: Record<string, unknown> = {
    name: params.name,
    description: params.description || `Assinatura ${params.name}`,
    value: params.valueCents / 100,
    billingType: params.billingType || 'UNDEFINED',
    chargeType: params.chargeType || 'DETACHED',
  };

  if (params.chargeType === 'RECURRENT' && params.cycle) {
    body.subscriptionCycle = params.cycle;
  }

  const res = await asaasFetch('/paymentLinks', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as Record<string, string>;
  const url =
    data.url ||
    data.paymentLinkUrl ||
    data.invoiceUrl ||
    `https://www.asaas.com/c/${data.id}`;
  return { id: data.id, url };
}

// ─── Clientes ───────────────────────────────────────────

/** Busca cliente no Asaas por ID. Retorna null se não encontrado. */
export async function getCustomer(asaasCustomerId: string): Promise<AsaasCustomer | null> {
  try {
    const res = await asaasFetch(`/customers/${asaasCustomerId}`);
    return (await res.json()) as AsaasCustomer;
  } catch {
    return null;
  }
}

// ─── Assinaturas ────────────────────────────────────────

/** Busca detalhes de uma assinatura recorrente pelo ID. */
export async function getSubscription(subscriptionId: string): Promise<AsaasSubscription | null> {
  try {
    const res = await asaasFetch(`/subscriptions/${subscriptionId}`);
    return (await res.json()) as AsaasSubscription;
  } catch {
    return null;
  }
}

/** Lista pagamentos de uma assinatura. */
export async function listSubscriptionPayments(
  subscriptionId: string,
): Promise<Array<{ id: string; value: number; status: string; confirmedDate?: string }>> {
  try {
    const res = await asaasFetch(`/subscriptions/${subscriptionId}/payments`);
    const data = (await res.json()) as { data?: Array<Record<string, unknown>> };
    return (data.data || []) as Array<{ id: string; value: number; status: string; confirmedDate?: string }>;
  } catch {
    return [];
  }
}

// ─── Webhooks ───────────────────────────────────────────

/** Registra URL de webhook no Asaas para receber eventos de cobrança. */
export async function createWebhook(url: string, event: string): Promise<{ id: string }> {
  const res = await asaasFetch('/webhooks', {
    method: 'POST',
    body: JSON.stringify({ url, event }),
  });
  return (await res.json()) as { id: string };
}