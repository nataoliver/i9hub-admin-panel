export type PlanType = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';

export type LicenseStatus = 'active' | 'pending' | 'expired' | 'revoked';

export type BillingCycle = 'monthly' | 'quarterly' | 'annual' | 'lifetime';

export type PaymentMethod = 'pix' | 'credit_card' | 'boleto';

export type GatewayProvider = 'mercadopago' | 'asaas' | 'stripe';

export interface DeviceBinding {
  deviceId: string;
  deviceName: string;
  extVersion: string;
  activatedAt: string;
  lastSeen: string;
  ip?: string;
}

export interface License {
  id: string; // e.g. "lic_101"
  key: string; // e.g. "I9HUB-PRO-8492-7A1C"
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  plan: PlanType;
  status: LicenseStatus;
  devices: DeviceBinding[];
  maxDevices: number;
  entitlements: string[];
  limits: {
    maxDailyLeads?: number;
    maxDailyMessages?: number;
    maxCampaigns?: number;
  };
  signedToken?: string;
  price: number;
  billingCycle: BillingCycle;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  createdAt: string;
  expiresAt: string;
  notes?: string;
  assignedRepId?: string;
}

export interface Subscription {
  id: string;
  licenseId: string;
  customerName: string;
  customerEmail: string;
  plan: PlanType;
  amount: number;
  billingCycle: BillingCycle;
  status: 'active' | 'pending' | 'past_due' | 'cancelled';
  paymentMethod: PaymentMethod;
  gateway: GatewayProvider;
  nextBillingDate: string;
  createdAt: string;
  lastPaymentDate?: string;
  pixQrCode?: string;
  pixCopiaECola?: string;
}

export interface WebhookLog {
  id: string;
  gateway: GatewayProvider;
  event: string;
  payload: any;
  status: 'processed' | 'failed' | 'ignored';
  receivedAt: string;
  resultMessage: string;
  licenseIdAffected?: string;
}

export interface TelemetryEvent {
  id: string;
  event: string;
  featureId?: string;
  timestamp: string;
  extVersion: string;
  plan?: string;
  deviceId?: string;
  profile?: {
    industry?: string;
    role?: string;
    companySize?: string;
  };
  metadata?: Record<string, any>;
}

export interface SalesRep {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  leadsCaptured: number;
  opportunitiesCreated: number;
  proposalsSent: number;
  dealsWon: number; // Clientes Convertidos
  dealsLost: number;
  conversionRate: number; // %
  revenueGenerated: number; // R$
  avgResponseTimeMin: number;
  complianceScore: number; // 0-100 WhatsApp Safe Score
  lastActive: string;
  online: boolean;
  activeDeviceId?: string;
}

export interface FunnelStage {
  id: string;
  label: string;
  count: number;
  conversionRateFromPrev: number;
  dropOffRate: number;
  avgTimeInStageHours: number;
  valueBrl: number;
}

export interface QualityMetrics {
  overallComplianceScore: number; // 0-100
  antiBanRiskLevel: 'low' | 'moderate' | 'high' | 'critical';
  avgDelayBetweenMessagesSec: number;
  spintaxAdoptionRate: number; // %
  optOutComplianceRate: number; // %
  aiResolutionRate: number; // %
  aiHandoffToHumanRate: number; // %
  awaitingRepliesCount: number;
  avgResponseTimeMin: number;
  campaignDeliveryRate: number; // %
  alerts: QualityAlert[];
}

export interface QualityAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  affectedEntity: string;
  timestamp: string;
  actionRequired?: string;
}

export interface ExtensionConfigPayload {
  notifications: Array<{
    id: string;
    title: string;
    text: string;
    buttonLabel: string;
    url: string;
    startsAt: string;
    endsAt: string;
    targetPlans: string[];
    targetIndustries: string[];
  }>;
  footerAd: {
    id: string;
    active: boolean;
    title: string;
    text: string;
    imageUrl: string;
    buttonLabel: string;
    url: string;
    targetPlans: string[];
    targetIndustries: string[];
  };
}

export interface FilterPeriod {
  key: 'today' | 'yesterday' | '7d' | '30d' | 'this_month' | 'quarter' | 'all';
  label: string;
}
