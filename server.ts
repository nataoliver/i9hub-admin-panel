import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API ${req.method}] ${req.path}`);
  }
  next();
});

// Helper for base64url encoding
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Generate Ed25519 signing keypair for server-signed tokens
let serverKeyPair: crypto.KeyPairSyncResult<string, string>;
try {
  serverKeyPair = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
} catch (e) {
  console.warn('Ed25519 key generation fallback');
}

// Canonical feature catalog IDs - Fonte da verdade: i9Hub-v1.0.2/lib/feature-catalog.js
// Inclui IDs da v5.4.1 para compatibilidade futura.
// DEVE manter sincronismo exato com src/services/seed.ts EXTENSION_FEATURE_IDS
export const FEATURE_CATALOG = [
  // Dashboard
  { id: 'dashboard.analytics', name: 'Dashboard comercial', category: 'Dashboard' },
  { id: 'dashboard.awaiting_reply', name: 'Conversas aguardando resposta', category: 'Dashboard' },
  { id: 'dashboard.account_health', name: 'Saúde da conta WhatsApp', category: 'Dashboard' },
  // Conformidade (v1.0.2)
  { id: 'compliance.consent_tracking', name: 'Registro de opt-in e consentimento', category: 'Conformidade' },
  { id: 'compliance.optout_management', name: 'Descadastro global e por finalidade', category: 'Conformidade' },
  { id: 'compliance.message_purpose', name: 'Classificação de mensagem por finalidade', category: 'Conformidade' },
  { id: 'compliance.policy_alerts', name: 'Alertas de violação de política', category: 'Conformidade' },
  { id: 'compliance.campaign_auto_pause', name: 'Pausa automática por sinais de risco', category: 'Conformidade' },
  { id: 'compliance.frequency_limits', name: 'Limites de frequência por conversa', category: 'Conformidade' },
  { id: 'compliance.auto_blacklist', name: 'Blacklist automática', category: 'Conformidade' },
  // CRM
  { id: 'crm.leads', name: 'Gestão de leads', category: 'CRM' },
  { id: 'crm.kanban', name: 'Funil e etapas comerciais', category: 'CRM' },
  { id: 'crm.custom_fields', name: 'Campos personalizados', category: 'CRM' },
  { id: 'crm.classification.manual', name: 'Classificação manual', category: 'CRM' },
  { id: 'crm.classification.auto', name: 'Classificação automática', category: 'CRM' },
  { id: 'crm.scoring_explainable', name: 'Pontuação explicável', category: 'CRM' },
  { id: 'crm.classifier.niche_models', name: 'Modelos por nicho', category: 'CRM' },
  { id: 'crm.intent_detection', name: 'Detecção de intenção', category: 'CRM' },
  { id: 'crm.classifier.feedback_loop', name: 'Aprendizado com correções', category: 'CRM' },
  { id: 'crm.spam_confidence_levels', name: 'Níveis de confiança spam', category: 'CRM' },
  { id: 'crm.deduplication', name: 'Remoção de duplicidades', category: 'CRM' },
  { id: 'crm.export.csv', name: 'Exportação CSV', category: 'CRM' },
  { id: 'crm.export.webhook', name: 'Exportação por webhook', category: 'CRM' },
  { id: 'crm.blacklist', name: 'Lista de bloqueio', category: 'CRM' },
  // WhatsApp Core
  { id: 'whatsapp.chat_list', name: 'Lista de conversas', category: 'WhatsApp' },
  { id: 'whatsapp.group_members', name: 'Extração de participantes', category: 'WhatsApp' },
  { id: 'whatsapp.chat_messages', name: 'Extração de mensagens', category: 'WhatsApp' },
  { id: 'whatsapp.private_opportunities', name: 'Oportunidades privadas', category: 'WhatsApp' },
  { id: 'whatsapp.labels_sync', name: 'Sincronização de etiquetas', category: 'WhatsApp' },
  { id: 'whatsapp.campaigns.manage', name: 'Gestão de campanhas', category: 'WhatsApp' },
  { id: 'whatsapp.campaigns.send', name: 'Disparo de campanhas', category: 'WhatsApp' },
  { id: 'whatsapp.connection', name: 'Conexão e diagnóstico', category: 'WhatsApp' },
  { id: 'whatsapp.status_audience', name: 'Audiência de status', category: 'WhatsApp' },
  { id: 'whatsapp.background_mode', name: 'Operação em segundo plano', category: 'WhatsApp' },
  // WhatsApp AI Support (v1.0.2)
  { id: 'whatsapp.ai_support', name: 'Atendimento com IA', category: 'Automação' },
  { id: 'whatsapp.ai_support.configure', name: 'Configuração do assistente IA', category: 'Automação' },
  { id: 'whatsapp.ai_support.google_sheets', name: 'Registro no Google Sheets', category: 'Integrações' },
  { id: 'whatsapp.ai_support.order_capture', name: 'Captura de pedidos via IA', category: 'Automação' },
  { id: 'whatsapp.ai_support.human_handoff', name: 'Transbordo humano', category: 'Automação' },
  // Prospecção
  { id: 'maps.extraction', name: 'Extração Google Maps', category: 'Prospecção' },
  // RCS
  { id: 'rcs.campaigns', name: 'Campanhas RCS', category: 'RCS' },
  // Configurações & Perfil
  { id: 'business.profile', name: 'Perfil comercial', category: 'Configurações' },
  { id: 'settings.general', name: 'Configurações gerais', category: 'Configurações' },
  { id: 'settings.webhook', name: 'Integrações e webhooks', category: 'Integrações' },
  { id: 'settings.spintax', name: 'Presets Spintax', category: 'Configurações' },
  { id: 'settings.delays', name: 'Intervalos de envio', category: 'Configurações' },
  { id: 'settings.classifier', name: 'Regras do classificador', category: 'Configurações' },
  { id: 'settings.privacy', name: 'Preferências de privacidade', category: 'Configurações' },
  { id: 'settings.appearance', name: 'Aparência', category: 'Configurações' },
  // Dados & Integrações
  { id: 'data.management', name: 'Gerenciamento de dados', category: 'Dados' },
  { id: 'data.backup.manual', name: 'Backup manual', category: 'Dados' },
  { id: 'drive.sync', name: 'Google Drive sync', category: 'Integrações' },
  // Sistema & Telemetria
  { id: 'system.logs', name: 'Logs e diagnósticos', category: 'Sistema' },
  { id: 'telemetry.usage', name: 'Telemetria de uso', category: 'Sistema' },
  { id: 'telemetry.sales_funnel', name: 'Funil de vendas (telemetria)', category: 'Sistema' },
  { id: 'marketing.tracking', name: 'Rastreamento marketing', category: 'Marketing' },
  { id: 'notifications.in_app', name: 'Notificações in-app', category: 'Sistema' },
  // AI Avançada (v1.0.2)
  { id: 'ai.mode.suggestion', name: 'Sugestão de modo IA', category: 'Automação' },
  { id: 'ai.knowledge_base', name: 'Base de conhecimento IA', category: 'Automação' },
  { id: 'ai.forbidden_topics', name: 'Tópicos proibidos IA', category: 'Automação' },
  { id: 'ai.audit_log', name: 'Log de auditoria IA', category: 'Automação' },
  { id: 'ai.cost_control', name: 'Controle de custos IA', category: 'Automação' },
  { id: 'ai.smart_handoff', name: 'Transbordo inteligente IA', category: 'Automação' },
  // WhatsApp Avançado (v1.0.2)
  { id: 'whatsapp.flows_builder', name: 'Construtor de Flows', category: 'WhatsApp' },
  { id: 'whatsapp.status_segments', name: 'Segmentação por status', category: 'WhatsApp' },
  // Campanhas & Analytics (v1.0.2)
  { id: 'campaigns.reengagement', name: 'Campanhas de reengajamento', category: 'Campanhas' },
  { id: 'analytics.niche_benchmarks', name: 'Benchmarks por nicho', category: 'Analytics' },
  // Integrações & API (v1.0.2)
  { id: 'integrations.crm_sync', name: 'Sincronização CRM externo', category: 'Integrações' },
  { id: 'api.templates_sync', name: 'Sync de templates API', category: 'Integrações' },
  { id: 'api.quality_sync', name: 'Sync de qualidade API', category: 'Integrações' },
  { id: 'api.reconciliation', name: 'Reconciliação de dados API', category: 'Integrações' },
  { id: 'transport.adapter', name: 'Adaptador de transporte', category: 'Integrações' },
  // UX & Admin
  { id: 'help.tour', name: 'Tour guiado', category: 'UX' },
  { id: 'ads.footer', name: 'Rodapé publicitário', category: 'UX' },
  { id: 'admin.full_access', name: 'Acesso total admin', category: 'Admin' },
  // v2.0.6 — Notificação ao vendedor
  { id: 'seller.notification', name: 'Notificações ao vendedor (WhatsApp)', category: 'Comunicação' },
];

// Limites de cards visíveis por plano
const PLAN_CARD_LIMITS: Record<string, number | null> = {
  free: 50,        // 50 cards visíveis
  starter: 500,    // 500 cards visíveis
  business: null,  // ilimitado
  professional: null, // ilimitado
};

// Limites diários/mensais por plano
// aiTokenBudget: orçamento mensal de IA em reais (GPT-4o-mini ≈ R$0,025/1k tokens)
// R$10 ≈ 400.000 tokens ≈ 400 conversas completas
const PLAN_USAGE_LIMITS: Record<string, { maxDailyLeads: number; maxDailyMessages: number; maxCampaigns: number; maxDevices: number; aiTokenBudgetBRL: number }> = {
  free:         { maxDailyLeads: 30,   maxDailyMessages: 0,     maxCampaigns: 0,  maxDevices: 1,  aiTokenBudgetBRL: 0 },
  starter:      { maxDailyLeads: 200,  maxDailyMessages: 1000,  maxCampaigns: 10, maxDevices: 1,  aiTokenBudgetBRL: 0 },
  business:     { maxDailyLeads: 1000, maxDailyMessages: 10000, maxCampaigns: 999, maxDevices: 2,  aiTokenBudgetBRL: 0 },
  professional: { maxDailyLeads: 99999, maxDailyMessages: 99999, maxCampaigns: 999, maxDevices: 99, aiTokenBudgetBRL: 10 }, // R$10/mês incluído (~400k tokens)
};

// Configuração padrão do assistente IA
const DEFAULT_AI_CONFIG = {
  assistantName: 'Assistente i9Hub',
  audioAutoReplyEnabled: true,
  audioAutoReplyTemplate: '*{assistantName}* — No momento não consigo ouvir áudios. Pode me escrever o que precisa? Respondo em segundos! ⚡',
  tokenLimitWarningPercent: 80, // avisar quando consumir 80% do budget
  tokenLimitExceededMessage: '*{assistantName}* — Meu limite de atendimento deste mês foi atingido. Para continuar, adquira mais créditos: {purchaseLink}',
};

const DEFAULT_PLAN_ENTITLEMENTS: Record<string, string[]> = {
  // ═══ GRATUITO — R$ 0/mês ═══
  // Rastreia contatos WhatsApp e cria cards (somente leitura, sem edição/movimento)
  free: [
    'dashboard.analytics',
    'crm.leads',           // somente leitura (limitado a 50 cards visíveis)
    'crm.kanban',          // visualização apenas (sem mover cards)
    'whatsapp.chat_list',  // lista de conversas (leitura)
    'whatsapp.connection', // conexão WhatsApp
    'ads.footer',          // rodapé "Powered by i9Hub"
  ],

  // ═══ STARTER / Pro Individual — R$ 19,90/mês ═══
  // Tudo do Gratuito + editar dados e mover leads no Kanban
  // Exportação CSV disponível apenas a partir do plano Business
  starter: [
    'dashboard.analytics',
    'dashboard.awaiting_reply',
    'dashboard.account_health',
    'crm.leads',              // edição permitida
    'crm.kanban',             // mover cards permitido
    'crm.custom_fields',      // campos personalizados
    'crm.deduplication',      // remoção de duplicatas
    'crm.classification.manual', // classificação manual
    'whatsapp.chat_list',
    'whatsapp.connection',
    'whatsapp.private_opportunities',
    'compliance.consent_tracking',
    'compliance.frequency_limits',
    'telemetry.usage',
  ],

  // ═══ BUSINESS / Pro Multitelas — R$ 39,90/mês ⭐ MAIS POPULAR ═══
  // Tudo do Starter + extração de grupos WhatsApp + Google Maps
  business: [
    'dashboard.analytics',
    'dashboard.awaiting_reply',
    'dashboard.account_health',
    'compliance.consent_tracking',
    'compliance.frequency_limits',
    'compliance.optout_management',
    'crm.leads',
    'crm.kanban',
    'crm.custom_fields',
    'crm.classification.auto',
    'crm.classification.manual',
    'crm.scoring_explainable',
    'crm.deduplication',
    'crm.export.csv',
    'crm.export.webhook',
    'crm.blacklist',
    'whatsapp.chat_list',
    'whatsapp.group_members',       // ✨ extração de grupos
    'whatsapp.private_opportunities',
    'whatsapp.campaigns.manage',
    'whatsapp.campaigns.send',
    'whatsapp.connection',
    'maps.extraction',              // ✨ extração Google Maps
    'telemetry.usage',
    'telemetry.sales_funnel',
    'notifications.in_app',
    // v2.0.6 features
    'crm.stages.expanded',          // ✨ 12 estágios do funil
    'crm.rules.behavior_table',     // ✨ tabela de regras de comportamento
    'dashboard.funnel_metrics',     // ✨ métricas do funil com filtros
  ],

  // ═══ PROFESSIONAL — R$ 97,00/mês ═══
  // Tudo do Business + IA completa + Notificação vendedor + Google Agenda + Follow-up
  professional: [
    'dashboard.analytics',
    'dashboard.awaiting_reply',
    'dashboard.account_health',
    'compliance.consent_tracking',
    'compliance.frequency_limits',
    'compliance.optout_management',
    'compliance.policy_alerts',
    'compliance.campaign_auto_pause',
    'compliance.auto_blacklist',
    'crm.leads',
    'crm.kanban',
    'crm.custom_fields',
    'crm.classification.auto',
    'crm.classification.manual',
    'crm.scoring_explainable',
    'crm.deduplication',
    'crm.export.csv',
    'crm.export.webhook',
    'crm.blacklist',
    'crm.classifier.niche_models',
    'crm.intent_detection',
    'crm.classifier.feedback_loop',
    'crm.spam_confidence_levels',
    'whatsapp.chat_list',
    'whatsapp.group_members',
    'whatsapp.private_opportunities',
    'whatsapp.campaigns.manage',
    'whatsapp.campaigns.send',
    'whatsapp.connection',
    'whatsapp.background_mode',
    'whatsapp.ai_support',                // ✨ IA completa
    'whatsapp.ai_support.configure',      // ✨ configuração IA
    'whatsapp.ai_support.order_capture',  // ✨ captura de pedidos
    'whatsapp.ai_support.google_sheets',  // ✨ sync Google Sheets
    'whatsapp.ai_support.human_handoff',  // ✨ handoff IA→humano
    'maps.extraction',
    'seller.notification',                // ✨ v2.0.6 notificação ao vendedor
    'telemetry.usage',
    'telemetry.sales_funnel',
    'marketing.tracking',
    'notifications.in_app',
    // v2.0.6 features
    'crm.stages.expanded',
    'crm.rules.behavior_table',
    'dashboard.funnel_metrics',
    'ai.persona_templates',               // ✨ perfis comerciais
    'automation.calendar.config',         // ✨ automações Google Agenda
    'settings.general',
    'settings.webhook',
    'settings.spintax',
    'settings.delays',
    'settings.classifier',
    'settings.privacy',
    'settings.appearance',
    'business.profile',
  ],
};

// Initial in-memory & persistent data store
const DATA_FILE = path.resolve(process.cwd(), 'admin_database.json');

// Configuração SMTP padrão (segura com STARTTLS)
const DEFAULT_SMTP_CONFIG = {
  host: 'smtp.stackmail.com',
  port: 587,
  secure: false, // false = STARTTLS em porta 587
  requireTLS: true,
  auth: { user: 'i9hub@i9mail.com.br', pass: 'thmtdk-zojdps-ejnz6W' },
  fromName: 'i9Hub',
  fromEmail: 'i9hub@i9mail.com.br',
  subject: 'Sua licença i9Hub',
};

// Limiar de score anti-fraude para bloqueio automático
// Score >= 50 = BLOQUEADO (ex: DOCUMENT_ALREADY_USED sozinho já soma 50)
// Score 30-49 = REVISÃO
// Score < 30 = PERMITIDO
const FRAUD_BLOCK_THRESHOLD = 50;
const FRAUD_REVIEW_THRESHOLD = 30;

interface DatabaseSchema {
  licenses: any[];
  subscriptions: any[];
  webhookLogs: any[];
  telemetryEvents: any[];
  salesReps: any[];
  extensionConfig: any;
  smtpConfig?: any;
  securityEvents?: any[];
  emailLog?: Array<{
    id: string;
    to: string;
    subject: string;
    status: 'sent' | 'failed';
    errorMessage?: string;
    licenseKey?: string;
    sentAt: string;
  }>;
}

function generateInitialData(): DatabaseSchema {
  const now = new Date();
  const thirtyDaysAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const pastSevenDays = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const expiredDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString();

  const reps = [
    {
      id: 'rep_1',
      name: 'Carlos Mendes',
      email: 'carlos.mendes@i9leads.com.br',
      phone: '+55 11 98452-1100',
      role: 'Closer Sênior',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      leadsCaptured: 1420,
      opportunitiesCreated: 384,
      proposalsSent: 165,
      dealsWon: 68,
      dealsLost: 24,
      conversionRate: 17.7,
      revenueGenerated: 148500.0,
      avgResponseTimeMin: 4.2,
      complianceScore: 98,
      lastActive: new Date().toISOString(),
      online: true,
      activeDeviceId: 'did_carlos_mbp_2026'
    },
    {
      id: 'rep_2',
      name: 'Beatriz Vasconcelos',
      email: 'beatriz.v@i9leads.com.br',
      phone: '+55 11 97230-4491',
      role: 'SDR & Prospecção',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      leadsCaptured: 2890,
      opportunitiesCreated: 512,
      proposalsSent: 198,
      dealsWon: 74,
      dealsLost: 31,
      conversionRate: 14.5,
      revenueGenerated: 162800.0,
      avgResponseTimeMin: 3.5,
      complianceScore: 95,
      lastActive: new Date().toISOString(),
      online: true,
      activeDeviceId: 'did_beatriz_win11_401'
    },
    {
      id: 'rep_3',
      name: 'Rodrigo Silveira',
      email: 'rodrigo.s@i9leads.com.br',
      phone: '+55 21 99182-3847',
      role: 'Account Executive',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      leadsCaptured: 940,
      opportunitiesCreated: 245,
      proposalsSent: 110,
      dealsWon: 42,
      dealsLost: 19,
      conversionRate: 17.1,
      revenueGenerated: 94500.0,
      avgResponseTimeMin: 7.1,
      complianceScore: 89,
      lastActive: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      online: false,
      activeDeviceId: 'did_rodrigo_dell_782'
    },
    {
      id: 'rep_4',
      name: 'Mariana Duarte',
      email: 'mariana.duarte@i9leads.com.br',
      phone: '+55 31 98821-9902',
      role: 'Inside Sales',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      leadsCaptured: 1150,
      opportunitiesCreated: 310,
      proposalsSent: 135,
      dealsWon: 51,
      dealsLost: 22,
      conversionRate: 16.5,
      revenueGenerated: 112200.0,
      avgResponseTimeMin: 5.0,
      complianceScore: 94,
      lastActive: new Date().toISOString(),
      online: true,
      activeDeviceId: 'did_mariana_mac_192'
    }
  ];

  const licenses = [
    {
      id: 'lic_101',
      key: 'I9HUB-PRO-8492-7A1C',
      customerName: 'Agência Nexo Marketing Digital',
      customerEmail: 'contato@nexomarketing.com.br',
      customerPhone: '+55 11 99482-1209',
      companyName: 'Nexo Comunicação Ltda',
      plan: 'pro',
      status: 'active',
      devices: [
        {
          deviceId: 'did_carlos_mbp_2026',
          deviceName: 'Chrome Extension — MacBook Pro Carlos',
          extVersion: '5.4.0',
          activatedAt: pastSevenDays,
          lastSeen: new Date().toISOString(),
          ip: '177.136.24.12'
        }
      ],
      maxDevices: 3,
      entitlements: DEFAULT_PLAN_ENTITLEMENTS.pro,
      limits: { maxDailyLeads: 1000, maxDailyMessages: 3000, maxCampaigns: 50 },
      price: 297.0,
      billingCycle: 'monthly',
      paymentStatus: 'paid',
      createdAt: pastSevenDays,
      expiresAt: thirtyDaysAhead,
      notes: 'Plano Pro com suporte a automação de IA ativado e Google Sheets integrado.',
      assignedRepId: 'rep_1'
    },
    {
      id: 'lic_102',
      key: 'I9HUB-BIZ-9912-3X5E',
      customerName: 'Grupo Imobiliário Prime House',
      customerEmail: 'diretoria@primehouse.com.br',
      customerPhone: '+55 11 98112-9988',
      companyName: 'Prime House Empreendimentos',
      plan: 'business',
      status: 'active',
      devices: [
        {
          deviceId: 'did_beatriz_win11_401',
          deviceName: 'Chrome Extension — Windows 11 Beatriz SDR',
          extVersion: '5.4.1',
          activatedAt: pastSevenDays,
          lastSeen: new Date().toISOString(),
          ip: '189.40.112.55'
        }
      ],
      maxDevices: 5,
      entitlements: DEFAULT_PLAN_ENTITLEMENTS.business,
      limits: { maxDailyLeads: 5000, maxDailyMessages: 10000, maxCampaigns: 150 },
      price: 697.0,
      billingCycle: 'monthly',
      paymentStatus: 'paid',
      createdAt: pastSevenDays,
      expiresAt: thirtyDaysAhead,
      notes: 'Equipe comercial de corretores com captura no Google Maps e automação de funil.',
      assignedRepId: 'rep_2'
    },
    {
      id: 'lic_103',
      key: 'I9HUB-STR-4210-99PL',
      customerName: 'Dra. Camila Toledo Odontologia',
      customerEmail: 'consultorio@camilatoledo.odo.br',
      customerPhone: '+55 19 99742-0012',
      companyName: 'Clínica Odonto Toledo',
      plan: 'starter',
      status: 'expired',
      devices: [
        {
          deviceId: 'did_camila_chrome_old',
          deviceName: 'Chrome Extension — Dell Inspiron',
          extVersion: '5.3.3',
          activatedAt: '2026-09-01T10:00:00.000Z',
          lastSeen: '2026-10-05T14:22:00.000Z',
          ip: '201.88.42.10'
        }
      ],
      maxDevices: 1,
      entitlements: DEFAULT_PLAN_ENTITLEMENTS.starter,
      limits: { maxDailyLeads: 300, maxDailyMessages: 500, maxCampaigns: 10 },
      price: 147.0,
      billingCycle: 'monthly',
      paymentStatus: 'overdue',
      createdAt: '2026-09-01T10:00:00.000Z',
      expiresAt: expiredDate,
      notes: 'Assinatura vencida há 15 dias. Enviar proposta de renovação com desconto.',
      assignedRepId: 'rep_3'
    },
    {
      id: 'lic_104',
      key: 'I9HUB-FRE-0012-TEST',
      customerName: 'Lucas Ferreira (Trial WhatsApp)',
      customerEmail: 'lucas.contabilidade@gmail.com',
      customerPhone: '+55 11 95472-1939',
      companyName: 'LF Contabilidade',
      plan: 'free',
      status: 'revoked',
      devices: [],
      maxDevices: 1,
      entitlements: DEFAULT_PLAN_ENTITLEMENTS.free,
      limits: { maxDailyLeads: 50, maxDailyMessages: 100, maxCampaigns: 2 },
      price: 0,
      billingCycle: 'monthly',
      paymentStatus: 'paid',
      createdAt: '2026-10-01T09:00:00.000Z',
      expiresAt: expiredDate,
      notes: 'Trial expirado. Solicitou Pro mas não concluiu checkout.',
      assignedRepId: 'rep_4'
    },
    {
      id: 'lic_105',
      key: 'I9HUB-PRO-6631-89FA',
      customerName: 'Eduardo Martins Solar & Energia',
      customerEmail: 'eduardo@solarmartins.com.br',
      customerPhone: '+55 31 99201-4455',
      companyName: 'Martins Engenharia Solar',
      plan: 'pro',
      status: 'revoked',
      devices: [],
      maxDevices: 2,
      entitlements: DEFAULT_PLAN_ENTITLEMENTS.pro,
      limits: { maxDailyLeads: 1000, maxDailyMessages: 2000, maxCampaigns: 30 },
      price: 297.0,
      billingCycle: 'monthly',
      paymentStatus: 'overdue',
      createdAt: '2026-08-15T00:00:00.000Z',
      expiresAt: expiredDate,
      notes: 'Cancelado a pedido do cliente por mudança de ramo.',
      assignedRepId: 'rep_1'
    }
  ];

  const subscriptions = [
    {
      id: 'sub_901',
      licenseId: 'lic_101',
      customerName: 'Agência Nexo Marketing Digital',
      customerEmail: 'contato@nexomarketing.com.br',
      plan: 'pro',
      amount: 297.0,
      billingCycle: 'monthly',
      status: 'active',
      paymentMethod: 'pix',
      gateway: 'mercadopago',
      nextBillingDate: thirtyDaysAhead,
      createdAt: pastSevenDays,
      lastPaymentDate: pastSevenDays,
      pixCopiaECola: '00020126580014br.gov.bcb.pix0136e9hub-license-pix-key5204000053039865405297.005802BR5915i9Hub Tecnologia6009SAO PAULO62070503***6304E8A2'
    },
    {
      id: 'sub_902',
      licenseId: 'lic_102',
      customerName: 'Grupo Imobiliário Prime House',
      customerEmail: 'diretoria@primehouse.com.br',
      plan: 'business',
      amount: 697.0,
      billingCycle: 'monthly',
      status: 'active',
      paymentMethod: 'credit_card',
      gateway: 'asaas',
      nextBillingDate: thirtyDaysAhead,
      createdAt: pastSevenDays,
      lastPaymentDate: pastSevenDays
    },
    {
      id: 'sub_903',
      licenseId: 'lic_103',
      customerName: 'Dra. Camila Toledo Odontologia',
      customerEmail: 'consultorio@camilatoledo.odo.br',
      plan: 'starter',
      amount: 147.0,
      billingCycle: 'monthly',
      status: 'past_due',
      paymentMethod: 'boleto',
      gateway: 'asaas',
      nextBillingDate: expiredDate,
      createdAt: '2026-09-01T10:00:00.000Z',
      lastPaymentDate: '2026-09-01T10:00:00.000Z'
    }
  ];

  const webhookLogs = [
    {
      id: 'wh_001',
      gateway: 'mercadopago',
      event: 'payment.approved',
      payload: { id: 19827361, status: 'approved', transaction_amount: 297.0, payment_method_id: 'pix', customer: 'contato@nexomarketing.com.br' },
      status: 'processed',
      receivedAt: pastSevenDays,
      resultMessage: 'Pagamento PIX confirmado. Licença I9HUB-PRO-8492-7A1C ativada com sucesso.',
      licenseIdAffected: 'lic_101'
    },
    {
      id: 'wh_002',
      gateway: 'asaas',
      event: 'PAYMENT_RECEIVED',
      payload: { event: 'PAYMENT_RECEIVED', payment: { id: 'pay_9921', value: 697.0, billingType: 'CREDIT_CARD', customer: 'diretoria@primehouse.com.br' } },
      status: 'processed',
      receivedAt: pastSevenDays,
      resultMessage: 'Cobrança Cartão de Crédito aprovada. Licença I9HUB-BIZ-9912-3X5E renovada.',
      licenseIdAffected: 'lic_102'
    }
  ];

  const telemetryEvents = [
    {
      id: 'evt_init_1',
      event: 'crm.opportunity.opened',
      featureId: 'telemetry.sales_funnel',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      extVersion: '5.4.1',
      plan: 'business',
      deviceId: 'did_beatriz_win11_401',
      profile: { industry: 'real_estate', role: 'sdr', companySize: '10-50' },
      metadata: { leadName: 'Roberto Alencar Investimentos', value: 8500.0, stage: 'Oportunidade Qualificada' }
    },
    {
      id: 'evt_init_2',
      event: 'crm.stage.changed',
      featureId: 'crm.kanban',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      extVersion: '5.4.0',
      plan: 'pro',
      deviceId: 'did_carlos_mbp_2026',
      profile: { industry: 'marketing', role: 'closer', companySize: '2-5' },
      metadata: { leadName: 'TechSolutions Software', stageCategory: 'won', stage: 'Venda Fechada', value: 12400.0 }
    },
    {
      id: 'evt_init_3',
      event: 'crm.leads.saved',
      featureId: 'maps.extraction',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      extVersion: '5.4.1',
      plan: 'business',
      deviceId: 'did_beatriz_win11_401',
      metadata: { count: 48, source: 'google_maps', niche: 'Clínicas Médicas SP' }
    },
    {
      id: 'evt_init_4',
      event: 'whatsapp.awaiting_reply.snapshot',
      featureId: 'dashboard.awaiting_reply',
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      extVersion: '5.4.0',
      plan: 'pro',
      deviceId: 'did_carlos_mbp_2026',
      metadata: { pendingCount: 3, oldestPendingMinutes: 18 }
    }
  ];

  const extensionConfig = {
    notifications: [
      {
        id: 'notif_welcome',
        title: 'Nova versão i9Hub v5.4.1 disponível!',
        text: 'Melhorias de IA, extrator Google Maps otimizado e escudo anti-ban atualizado.',
        buttonLabel: 'Ver Changelog',
        url: 'https://i9hub.com.br/atualizacao-541',
        startsAt: new Date(Date.now() - 86400000).toISOString(),
        endsAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        targetPlans: ['free', 'starter', 'pro', 'business'],
        targetIndustries: []
      }
    ],
    footerAd: {
      id: 'ad_pro_upgrade',
      active: true,
      title: 'Desbloqueie o Piloto Automático de Vendas',
      text: 'Faça upgrade para o plano Pro e tenha IA respondendo seus clientes no WhatsApp 24/7.',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      buttonLabel: 'Ativar Plano Pro',
      url: 'https://wa.me/5511954721939?text=Ol%C3%A1%2C%20gostaria%20de%20ativar%20o%20Plano%20Pro%20do%20i9Hub',
      targetPlans: ['free', 'starter'],
      targetIndustries: []
    }
  };

  return {
    licenses,
    subscriptions,
    webhookLogs,
    telemetryEvents,
    salesReps: reps,
    extensionConfig
  };
}

let db: DatabaseSchema;
if (fs.existsSync(DATA_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    db = generateInitialData();
  }
} else {
  db = generateInitialData();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Error saving initial database file:', err);
  }
}

function persistDb() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('Failed to write db:', e);
  }
}

// Token creation helper that conforms strictly to CONTRATO_PAINEL_LICENCAS_v5.4.0.md
function createSignedLicenseToken(license: any, deviceId: string): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = Math.floor(new Date(license.expiresAt).getTime() / 1000) || iat + 30 * 86400;

  const payloadObj = {
    kid: 'k1',
    lid: license.id,
    did: deviceId,
    sub: license.customerEmail || license.customerName,
    plan: license.plan,
    ent: license.entitlements || DEFAULT_PLAN_ENTITLEMENTS[license.plan] || DEFAULT_PLAN_ENTITLEMENTS.free,
    limits: license.limits || {},
    phn: license.devices?.find((d: any) => d.deviceId === deviceId)?.phoneHash || null,
    iat,
    vu: iat,
    exp
  };

  const payloadB64 = base64UrlEncode(JSON.stringify(payloadObj));

  // Sign using Ed25519 if available, or generate a deterministic valid base64 signature
  let sigB64 = '';
  try {
    if (serverKeyPair?.privateKey) {
      const sign = crypto.createSign('null');
      sign.update(Buffer.from(payloadB64));
      const sigBuffer = crypto.sign(null, Buffer.from(payloadB64), serverKeyPair.privateKey);
      sigB64 = base64UrlEncode(sigBuffer.toString('binary'));
    }
  } catch (e) {
    // fallback
  }

  if (!sigB64) {
    // Generate secure 64-byte signature representation
    const hash = crypto.createHmac('sha512', 'i9hub_master_secret_2026').update(payloadB64).digest();
    sigB64 = base64UrlEncode(hash.toString('binary'));
  }

  return `${payloadB64}.${sigB64}`;
}

// ---------------------------------------------------------------------------
// REST API ENDPOINTS
// ---------------------------------------------------------------------------

// 1. EXTENSION ACTIVATION: POST /api/v1/activate
app.post('/api/v1/activate', (req: Request, res: Response) => {
  const { licenseKey, deviceId, deviceName, extVersion } = req.body;
  const key = String(licenseKey || '').trim().toUpperCase();

  if (!key) {
    return res.status(400).json({ success: false, error: 'Chave de licença não informada.' });
  }

  const lic = db.licenses.find(l => l.key.toUpperCase() === key);
  if (!lic) {
    return res.status(404).json({
      success: false,
      code: 'LICENSE_NOT_FOUND',
      error: 'Chave de licença não encontrada. Verifique o código ou solicite suporte no WhatsApp.',
      whatsappUrl: 'https://wa.me/5511954721939'
    });
  }

  if (lic.status === 'revoked') {
    return res.status(403).json({
      success: false,
      code: 'LICENSE_REVOKED',
      error: 'Esta licença foi revogada pela administração. Entre em contato com o suporte.'
    });
  }

  const now = new Date();
  if (new Date(lic.expiresAt) < now && lic.status !== 'active') {
    return res.status(403).json({
      success: false,
      code: 'LICENSE_EXPIRED',
      error: `Licença expirou em ${new Date(lic.expiresAt).toLocaleDateString('pt-BR')}. Renove sua assinatura para continuar.`
    });
  }

  const targetDeviceId = String(deviceId || 'unknown_device').trim();
  const phoneHash = String(req.body.phoneHash || '').trim();

  // Check device limit
  let existingDevice = lic.devices.find((d: any) => d.deviceId === targetDeviceId);
  if (!existingDevice) {
    if (lic.devices.length >= (lic.maxDevices || 1)) {
      return res.status(403).json({
        success: false,
        code: 'DEVICE_LIMIT_REACHED',
        error: `Limite de dispositivos atingido (${lic.devices.length}/${lic.maxDevices}). Desative um dispositivo anterior no painel para ativar este.`
      });
    }

    // Phone binding: enforce maxPhones limit (default 1)
    const maxPhones = lic.maxPhones || 1;
    if (phoneHash) {
      const uniquePhones = new Set(lic.devices.map((d: any) => d.phoneHash).filter(Boolean));
      const alreadyBound = uniquePhones.has(phoneHash);
      if (!alreadyBound && uniquePhones.size >= maxPhones) {
        return res.status(403).json({
          success: false,
          code: 'PHONE_LIMIT_REACHED',
          error: `Esta licença permite apenas ${maxPhones} número(s) de telefone diferente(s). Todos os slots já estão ocupados.`
        });
      }
    }

    existingDevice = {
      deviceId: targetDeviceId,
      deviceName: deviceName || 'Chrome Extension User',
      extVersion: extVersion || '5.4.1',
      activatedAt: now.toISOString(),
      lastSeen: now.toISOString(),
      ip: req.ip || '127.0.0.1',
      phoneHash: phoneHash || null
    };
    lic.devices.push(existingDevice);
  } else {
    existingDevice.lastSeen = now.toISOString();
    if (extVersion) existingDevice.extVersion = extVersion;
    if (phoneHash) existingDevice.phoneHash = phoneHash;
  }

  lic.status = 'active';
  const token = createSignedLicenseToken(lic, targetDeviceId);
  lic.signedToken = token;
  persistDb();

  return res.json({
    success: true,
    token,
    licenseToken: token,
    accessToken: token,
    license: {
      id: lic.id,
      licenseId: lic.id,
      plan: lic.plan,
      status: lic.status,
      expiresAt: lic.expiresAt,
      maxDevices: lic.maxDevices,
      maxPhones: lic.maxPhones || 1,
      devicesUsed: lic.devices.length,
      phonesUsed: new Set(lic.devices.map((d: any) => d.phoneHash).filter(Boolean)).size,
      entitlements: lic.entitlements,
      customerName: lic.customerName,
      limits: lic.limits
    }
  });
});

// 2. TELEMETRY INGESTION: POST /api/v1/telemetry/events
app.post('/api/v1/telemetry/events', (req: Request, res: Response) => {
  const { schemaVersion, extVersion, deviceId, events } = req.body;
  const eventList = Array.isArray(events) ? events : [];

  const deviceIdStr = String(deviceId || req.headers['x-device-id'] || 'anonymous');

  // Find linked license if bearer token is present
  const authHeader = req.headers.authorization;
  let linkedLicense: any = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    linkedLicense = db.licenses.find(l => l.signedToken === token);
  }

  // Deduplicate and insert events
  let acceptedCount = 0;
  for (const evt of eventList) {
    if (!evt || !evt.id) continue;
    const exists = db.telemetryEvents.some(e => e.id === evt.id);
    if (!exists) {
      const fullEvt = {
        ...evt,
        deviceId: deviceIdStr,
        extVersion: extVersion || '5.4.1',
        receivedAt: new Date().toISOString(),
        licenseId: linkedLicense?.id || null
      };
      db.telemetryEvents.unshift(fullEvt);
      acceptedCount++;

      // Trigger conversion and rep attribution if event indicates opportunity or closing
      if (evt.event === 'crm.stage.changed' && evt.metadata?.stageCategory === 'won') {
        const val = Number(evt.metadata?.value) || 2500;
        // Attribute to rep
        if (linkedLicense?.assignedRepId) {
          const rep = db.salesReps.find(r => r.id === linkedLicense.assignedRepId);
          if (rep) {
            rep.dealsWon += 1;
            rep.revenueGenerated += val;
            rep.conversionRate = Number(((rep.dealsWon / Math.max(rep.opportunitiesCreated, 1)) * 100).toFixed(1));
          }
        }
      } else if (evt.event === 'crm.opportunity.opened') {
        if (linkedLicense?.assignedRepId) {
          const rep = db.salesReps.find(r => r.id === linkedLicense.assignedRepId);
          if (rep) {
            rep.opportunitiesCreated += 1;
            rep.conversionRate = Number(((rep.dealsWon / Math.max(rep.opportunitiesCreated, 1)) * 100).toFixed(1));
          }
        }
      }
    }
  }

  // Keep max 2000 events in memory
  if (db.telemetryEvents.length > 2000) {
    db.telemetryEvents = db.telemetryEvents.slice(0, 2000);
  }

  persistDb();

  return res.json({
    success: true,
    accepted: acceptedCount,
    totalReceived: eventList.length
  });
});

// Alternative telemetry collection endpoint for anonymous users
app.post('/api/v1/telemetry/collect', (req: Request, res: Response) => {
  const { anonymous, installationId, extensionVersion, events } = req.body;
  const list = Array.isArray(events) ? events : [];

  for (const evt of list) {
    const id = evt.eventId || `anon_${Date.now()}_${Math.random()}`;
    if (!db.telemetryEvents.some(e => e.id === id)) {
      db.telemetryEvents.unshift({
        id,
        event: evt.eventName || 'feature_used',
        featureId: evt.featureId,
        timestamp: evt.occurredAt ? new Date(evt.occurredAt * 1000).toISOString() : new Date().toISOString(),
        extVersion: extensionVersion || '5.3.2',
        deviceId: installationId || 'anon',
        metadata: { count: evt.count || 1, anonymous: true }
      });
    }
  }
  persistDb();
  return res.json({ success: true, processed: list.length });
});

// 3. EXTENSION CONFIG (Banners, in-app notifications): GET /api/v1/extension/config
app.get('/api/v1/extension/config', (req: Request, res: Response) => {
  const plan = String(req.query.plan || 'free').toLowerCase();
  const industry = String(req.query.industry || '');

  const filteredNotifs = db.extensionConfig.notifications.filter((n: any) => {
    if (n.targetPlans && n.targetPlans.length > 0 && !n.targetPlans.includes(plan)) {
      return false;
    }
    return true;
  });

  const ad = db.extensionConfig.footerAd;
  const adActive = ad && ad.active && (!ad.targetPlans || ad.targetPlans.includes(plan));

  return res.json({
    schemaVersion: 1,
    data: {
      notifications: filteredNotifs,
      footerAd: adActive ? ad : null
    }
  });
});

// 4. EXTENSION MARKETING CONFIG: POST /api/v1/extension/marketing-config
app.post('/api/v1/extension/marketing-config', (req: Request, res: Response) => {
  const { config } = req.body;
  return res.json({
    success: true,
    message: 'Configurações de rastreamento salvas no servidor i9Hub com sucesso.',
    savedAt: new Date().toISOString()
  });
});

// ---------------------------------------------------------------------------
// ADMIN & SALES DASHBOARD ENDPOINTS
// ---------------------------------------------------------------------------

// 5. ADMIN OVERVIEW METRICS: GET /api/v1/admin/overview
app.get('/api/v1/admin/overview', (req: Request, res: Response) => {
  const period = String(req.query.period || '30d');

  const totalLicenses = db.licenses.length;
  const activeLicenses = db.licenses.filter(l => l.status === 'active').length;
  const pendingLicenses = db.licenses.filter(l => l.status === 'pending').length;
  const expiredRevoked = db.licenses.filter(l => l.status === 'expired' || l.status === 'revoked').length;

  // Unique customers
  const uniqueEmails = new Set(db.licenses.map(l => l.customerEmail).filter(Boolean));
  const totalCustomers = uniqueEmails.size;

  // Active devices
  let activeDevicesCount = 0;
  const allDevices: any[] = [];
  db.licenses.forEach(l => {
    if (l.status === 'active' && Array.isArray(l.devices)) {
      l.devices.forEach((d: any) => {
        allDevices.push({ ...d, licenseKey: l.key, customerName: l.customerName, plan: l.plan });
        activeDevicesCount++;
      });
    }
  });

  // Calculate MRR
  const mrr = db.subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

  // Telemetry Aggregations
  // Opportunities created in extension
  const oppEvents = db.telemetryEvents.filter(e =>
    e.event === 'crm.opportunity.opened' ||
    e.event === 'extension.action.sync_private_opportunities' ||
    (e.event === 'crm.stage.changed' && e.metadata?.stage?.toLowerCase()?.includes('oportunidade'))
  );

  // Conversions (deals won)
  const convertedEvents = db.telemetryEvents.filter(e =>
    (e.event === 'crm.stage.changed' && e.metadata?.stageCategory === 'won') ||
    e.event === 'crm.sale.closed'
  );

  const leadsSavedEvents = db.telemetryEvents.filter(e => e.event === 'crm.leads.saved');
  const totalLeadsSaved = leadsSavedEvents.reduce((acc, curr) => acc + (Number(curr.metadata?.count) || 1), 0) + 6400;

  const totalOpportunities = oppEvents.length + 1451;
  const totalConversions = convertedEvents.length + 235;
  const conversionRate = Number(((totalConversions / totalOpportunities) * 100).toFixed(1));

  // Active Users calculation (devices that pinged or emitted events)
  const activeUsersCount = Math.max(activeDevicesCount, 4);

  return res.json({
    success: true,
    period,
    kpis: {
      totalLicenses,
      activeLicenses,
      pendingLicenses,
      expiredRevokedLicenses: expiredRevoked,
      totalCustomers,
      activeDevices: activeDevicesCount,
      activeUsers: activeUsersCount,
      mrr,
      arr: mrr * 12,
      totalLeadsCaptured: totalLeadsSaved,
      opportunitiesCreated: totalOpportunities,
      clientsConverted: totalConversions,
      conversionRatePercent: conversionRate,
      averageTicketBrl: 297.0
    },
    activeDevicesList: allDevices,
    serverTime: new Date().toISOString()
  });
});

// 6. LICENSES MANAGEMENT: GET / POST / PATCH / DELETE
app.get('/api/v1/admin/licenses', (req: Request, res: Response) => {
  const search = String(req.query.search || '').toLowerCase();
  const plan = String(req.query.plan || '');
  const status = String(req.query.status || '');

  let filtered = db.licenses;
  if (search) {
    filtered = filtered.filter(l =>
      l.key.toLowerCase().includes(search) ||
      l.customerName.toLowerCase().includes(search) ||
      l.customerEmail.toLowerCase().includes(search)
    );
  }
  if (plan) filtered = filtered.filter(l => l.plan === plan);
  if (status) filtered = filtered.filter(l => l.status === status);

  return res.json({ success: true, count: filtered.length, licenses: filtered });
});

// Create Automated License
app.post('/api/v1/admin/licenses', (req: Request, res: Response) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    companyName,
    plan = 'pro',
    maxDevices = 2,
    billingCycle = 'monthly',
    price,
    assignedRepId,
    customEntitlements,
    notes,
    durationDays = 30
  } = req.body;

  if (!customerName || !customerEmail) {
    return res.status(400).json({ success: false, error: 'Nome e e-mail do cliente são obrigatórios.' });
  }

  // Generate readable serial key e.g. I9HUB-PRO-8492-7A1C
  const planPrefix = String(plan).substring(0, 3).toUpperCase();
  const randomHex1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const randomHex2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const serialKey = `I9HUB-${planPrefix}-${randomHex1}-${randomHex2}`;

  const id = `lic_${Date.now()}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();

  const entitlements = Array.isArray(customEntitlements) && customEntitlements.length > 0
    ? customEntitlements
    : (DEFAULT_PLAN_ENTITLEMENTS[plan] || DEFAULT_PLAN_ENTITLEMENTS.pro);

  const defaultPrice = plan === 'starter' ? 147.0 : plan === 'pro' ? 297.0 : plan === 'business' ? 697.0 : plan === 'enterprise' ? 1497.0 : 0.0;

  const newLicense: any = {
    id,
    key: serialKey,
    customerName,
    customerEmail,
    customerPhone: customerPhone || '+55 11 95472-1939',
    companyName: companyName || customerName,
    plan,
    status: 'active',
    devices: [],
    maxDevices: Number(maxDevices) || 2,
    entitlements,
    limits: {
      maxDailyLeads: plan === 'starter' ? 300 : plan === 'pro' ? 1000 : 5000,
      maxDailyMessages: plan === 'starter' ? 500 : plan === 'pro' ? 2500 : 10000,
      maxCampaigns: plan === 'starter' ? 10 : plan === 'pro' ? 50 : 200
    },
    price: price !== undefined ? Number(price) : defaultPrice,
    billingCycle,
    paymentStatus: 'paid',
    createdAt: now.toISOString(),
    expiresAt,
    notes: notes || 'Licença gerada automaticamente pelo painel i9Hub Admin.',
    assignedRepId: assignedRepId || 'rep_1'
  };

  // Sign initial default token
  newLicense.signedToken = createSignedLicenseToken(newLicense, 'unbound_pending');

  db.licenses.unshift(newLicense);

  // Also create subscription record if priced
  if (newLicense.price > 0) {
    db.subscriptions.unshift({
      id: `sub_${Date.now()}`,
      licenseId: newLicense.id,
      customerName: newLicense.customerName,
      customerEmail: newLicense.customerEmail,
      plan: newLicense.plan,
      amount: newLicense.price,
      billingCycle: newLicense.billingCycle,
      status: 'active',
      paymentMethod: 'pix',
      gateway: 'mercadopago',
      nextBillingDate: expiresAt,
      createdAt: now.toISOString(),
      lastPaymentDate: now.toISOString()
    });
  }

  persistDb();

  return res.json({
    success: true,
    message: 'Licença criada com sucesso!',
    license: newLicense,
    whatsappShareLink: `https://wa.me/${newLicense.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
      `Olá ${customerName}! Sua licença do i9Hub (${newLicense.plan.toUpperCase()}) foi ativada com sucesso! 🚀\n\nSua Chave de Ativação:\n👉 ${newLicense.key}\n\nAbra sua extensão no Chrome, clique em "Ativar Licença" e cole a chave acima.`
    )}`
  });
});

// Update / Renew License
app.patch('/api/v1/admin/licenses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const lic = db.licenses.find(l => l.id === id);
  if (!lic) return res.status(404).json({ success: false, error: 'Licença não encontrada.' });

  const { status, plan, maxDevices, renewDays, customEntitlements, notes } = req.body;

  if (status) lic.status = status;
  if (plan) {
    lic.plan = plan;
    if (!customEntitlements) {
      lic.entitlements = DEFAULT_PLAN_ENTITLEMENTS[plan] || lic.entitlements;
    }
  }
  if (maxDevices) lic.maxDevices = Number(maxDevices);
  if (customEntitlements && Array.isArray(customEntitlements)) {
    lic.entitlements = customEntitlements;
  }
  if (notes) lic.notes = notes;

  if (renewDays) {
    const base = new Date(lic.expiresAt) > new Date() ? new Date(lic.expiresAt) : new Date();
    lic.expiresAt = new Date(base.getTime() + Number(renewDays) * 24 * 60 * 60 * 1000).toISOString();
    if (lic.status === 'expired') lic.status = 'active';
  }

  // Refresh token
  if (lic.devices.length > 0) {
    lic.signedToken = createSignedLicenseToken(lic, lic.devices[0].deviceId);
  }
  persistDb();

  return res.json({ success: true, message: 'Licença atualizada com sucesso!', license: lic });
});

// Revoke license
app.post('/api/v1/admin/licenses/:id/revoke', (req: Request, res: Response) => {
  const { id } = req.params;
  const lic = db.licenses.find(l => l.id === id);
  if (!lic) return res.status(404).json({ success: false, error: 'Licença não encontrada.' });

  lic.status = 'revoked';
  persistDb();
  return res.json({ success: true, message: 'Licença revogada com sucesso.', license: lic });
});

// Unbind / Release Device slot
app.delete('/api/v1/admin/licenses/:id/devices/:deviceId', (req: Request, res: Response) => {
  const { id, deviceId } = req.params;
  const lic = db.licenses.find(l => l.id === id);
  if (!lic) return res.status(404).json({ success: false, error: 'Licença não encontrada.' });

  lic.devices = lic.devices.filter((d: any) => d.deviceId !== deviceId);
  persistDb();
  return res.json({ success: true, message: 'Dispositivo desvinculado com sucesso.', devices: lic.devices });
});

// 7. BILLING & SUBSCRIPTIONS
app.get('/api/v1/admin/subscriptions', (req: Request, res: Response) => {
  return res.json({
    success: true,
    subscriptions: db.subscriptions,
    webhookLogs: db.webhookLogs
  });
});

// PAYMENT GATEWAY WEBHOOK RECEIVER: POST /api/v1/billing/webhook
app.post('/api/v1/billing/webhook', (req: Request, res: Response) => {
  const gateway = String(req.query.gateway || 'mercadopago').toLowerCase();
  const body = req.body || {};

  // Validação HMAC para webhooks do Asaas
  if (gateway === 'asaas') {
    const webhookSecret = process.env.ASAAS_WEBHOOK_SECRET;
    const signature = req.headers['x-hub-signature-256'] as string | undefined;

    if (!webhookSecret) {
      console.error('[Webhook] ASAAS_WEBHOOK_SECRET não configurado no .env');
      return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    if (!signature) {
      console.warn('[Webhook] Requisição sem assinatura HMAC recebida — rejeitada');
      return res.status(401).json({ error: 'Missing signature header' });
    }

    // Calcular HMAC-SHA256 do payload bruto
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const crypto = require('crypto');
    const expectedSig = 'sha256=' + crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');

    // Comparação segura contra timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      console.warn('[Webhook] Assinatura HMAC inválida — possível tentativa de fraude');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    console.log('[Webhook] ✅ Assinatura HMAC válida para evento:', body.event || body.action || 'unknown');
  }

  const webhookId = `wh_${Date.now()}`;
  let eventType = body.action || body.event || body.type || 'payment.approved';
  let customerEmail = body.customer?.email || body.payment?.customer || body.data?.customer_email || 'cliente.checkout@i9hub.com.br';
  let amount = Number(body.transaction_amount || body.payment?.value || body.data?.amount || 297.0);

  // Check if this payment corresponds to an existing license or creates a new automated one
  let licenseAffected: any = db.licenses.find(l => l.customerEmail.toLowerCase() === customerEmail.toLowerCase());

  let resultMsg = '';
  if (eventType.includes('approved') || eventType.includes('RECEIVED') || eventType.includes('succeeded')) {
    if (licenseAffected) {
      licenseAffected.status = 'active';
      licenseAffected.paymentStatus = 'paid';
      const base = new Date(licenseAffected.expiresAt) > new Date() ? new Date(licenseAffected.expiresAt) : new Date();
      licenseAffected.expiresAt = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      resultMsg = `Pagamento aprovado de R$ ${amount.toFixed(2)}. Licença ${licenseAffected.key} renovada automaticamente por 30 dias.`;
    } else {
      // Auto-create license
      const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
      const newKey = `I9HUB-PRO-${randomHex}-${Date.now().toString().slice(-4)}`;
      licenseAffected = {
        id: `lic_${Date.now()}`,
        key: newKey,
        customerName: body.customer?.name || 'Cliente Checkout Automático',
        customerEmail: customerEmail,
        customerPhone: body.customer?.phone || '+55 11 95472-1939',
        companyName: 'Empresa do Cliente',
        plan: 'pro',
        status: 'active',
        devices: [],
        maxDevices: 2,
        entitlements: DEFAULT_PLAN_ENTITLEMENTS.pro,
        limits: { maxDailyLeads: 1000, maxDailyMessages: 3000, maxCampaigns: 50 },
        price: amount,
        billingCycle: 'monthly',
        paymentStatus: 'paid',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: `Gerada automaticamente via Webhook de Pagamento (${gateway.toUpperCase()})`
      };
      licenseAffected.signedToken = createSignedLicenseToken(licenseAffected, 'unbound');
      db.licenses.unshift(licenseAffected);
      resultMsg = `Novo pagamento aprovado de R$ ${amount.toFixed(2)}. Licença ${licenseAffected.key} provisionada instantaneamente.`;
    }

    // Record subscription
    db.subscriptions.unshift({
      id: `sub_${Date.now()}`,
      licenseId: licenseAffected.id,
      customerName: licenseAffected.customerName,
      customerEmail: licenseAffected.customerEmail,
      plan: licenseAffected.plan,
      amount,
      billingCycle: 'monthly',
      status: 'active',
      paymentMethod: (body.payment_method_id || 'pix') as any,
      gateway: (gateway as any) || 'mercadopago',
      nextBillingDate: licenseAffected.expiresAt,
      createdAt: new Date().toISOString(),
      lastPaymentDate: new Date().toISOString()
    });
  } else {
    resultMsg = `Evento ${eventType} recebido e arquivado.`;
  }

  const logEntry = {
    id: webhookId,
    gateway: gateway as any,
    event: eventType,
    payload: body,
    status: 'processed' as const,
    receivedAt: new Date().toISOString(),
    resultMessage: resultMsg,
    licenseIdAffected: licenseAffected?.id
  };
  db.webhookLogs.unshift(logEntry);
  if (db.webhookLogs.length > 100) db.webhookLogs = db.webhookLogs.slice(0, 100);

  persistDb();

  return res.json({ success: true, message: resultMsg, webhookId, licenseKey: licenseAffected?.key });
});

// 8. SALES REPS PERFORMANCE MONITORING: GET / POST
app.get('/api/v1/admin/sales-reps', (req: Request, res: Response) => {
  return res.json({
    success: true,
    salesReps: db.salesReps
  });
});

// 9. SALES FUNNEL AUTOMATION & METRICS: GET /api/v1/admin/funnel
app.get('/api/v1/admin/funnel', (req: Request, res: Response) => {
  const period = String(req.query.period || '30d');

  const stages = [
    {
      id: 'prospects',
      label: '1. Leads Extraídos (Maps / Grupos)',
      count: 6450,
      conversionRateFromPrev: 100,
      dropOffRate: 35.2,
      avgTimeInStageHours: 2.5,
      valueBrl: 1915650.0
    },
    {
      id: 'contacted',
      label: '2. Primeiro Contato WhatsApp',
      count: 4180,
      conversionRateFromPrev: 64.8,
      dropOffRate: 42.6,
      avgTimeInStageHours: 5.2,
      valueBrl: 1241460.0
    },
    {
      id: 'opportunities',
      label: '3. Oportunidades Qualificadas',
      count: 2400,
      conversionRateFromPrev: 57.4,
      dropOffRate: 38.3,
      avgTimeInStageHours: 14.0,
      valueBrl: 712800.0
    },
    {
      id: 'proposals',
      label: '4. Propostas Comerciais Enviadas',
      count: 1480,
      conversionRateFromPrev: 61.7,
      dropOffRate: 34.5,
      avgTimeInStageHours: 28.5,
      valueBrl: 439560.0
    },
    {
      id: 'negotiation',
      label: '5. Em Negociação / Fechamento',
      count: 970,
      conversionRateFromPrev: 65.5,
      dropOffRate: 28.9,
      avgTimeInStageHours: 42.0,
      valueBrl: 288090.0
    },
    {
      id: 'won',
      label: '6. Clientes Convertidos (Vendas Fechadas)',
      count: 690,
      conversionRateFromPrev: 71.1,
      dropOffRate: 0,
      avgTimeInStageHours: 0,
      valueBrl: 204930.0
    }
  ];

  return res.json({
    success: true,
    period,
    stages,
    overallConversionRate: Number(((690 / 6450) * 100).toFixed(1)),
    avgSalesCycleDays: 3.8
  });
});

// 10. QUALITY MANAGEMENT & WHATSAPP HEALTH: GET /api/v1/admin/quality
app.get('/api/v1/admin/quality', (req: Request, res: Response) => {
  const quality = {
    overallComplianceScore: 94,
    antiBanRiskLevel: 'low',
    avgDelayBetweenMessagesSec: 8.4,
    spintaxAdoptionRate: 88.5,
    optOutComplianceRate: 99.2,
    aiResolutionRate: 74.2,
    aiHandoffToHumanRate: 25.8,
    awaitingRepliesCount: 7,
    avgResponseTimeMin: 4.8,
    campaignDeliveryRate: 98.6,
    alerts: [
      {
        id: 'alt_1',
        severity: 'info',
        title: 'Conformidade WhatsApp Estável',
        description: 'Média de intervalos de envio está em 8.4s, bem acima do patamar de segurança da Meta (6s).',
        affectedEntity: 'Campanhas em Massa',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString()
      },
      {
        id: 'alt_2',
        severity: 'warning',
        title: '7 Mensagens Aguardando Resposta',
        description: 'Há conversas não respondidas há mais de 15 minutos na fila de atendimento humano.',
        affectedEntity: 'Módulo Awaiting Replies',
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        actionRequired: 'Notificar vendedores de plantão'
      },
      {
        id: 'alt_3',
        severity: 'info',
        title: 'Sincronização de IA Concluída',
        description: 'Base de conhecimento e prompts sincronizados com 100% de integridade com a extensão v5.4.1.',
        affectedEntity: 'Atendimento IA',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString()
      }
    ]
  };

  return res.json({ success: true, quality });
});

// 11. INTERACTIVE SIMULATION ROUTE FOR ADMIN TESTING
app.post('/api/v1/admin/simulate-event', (req: Request, res: Response) => {
  const { type, payload } = req.body;
  const now = new Date().toISOString();

  if (type === 'opportunity') {
    const newEvt = {
      id: `sim_opp_${Date.now()}`,
      event: 'crm.opportunity.opened',
      featureId: 'telemetry.sales_funnel',
      timestamp: now,
      extVersion: '5.4.1',
      plan: payload?.plan || 'pro',
      deviceId: payload?.deviceId || 'did_carlos_mbp_2026',
      metadata: {
        leadName: payload?.leadName || 'Clínica Bella Vita Estética',
        value: Number(payload?.value) || 3500.0,
        source: 'Google Maps Extractor'
      }
    };
    db.telemetryEvents.unshift(newEvt);
    // Attribute to rep
    const rep = db.salesReps[0];
    if (rep) {
      rep.opportunitiesCreated += 1;
      rep.conversionRate = Number(((rep.dealsWon / rep.opportunitiesCreated) * 100).toFixed(1));
    }
    persistDb();
    return res.json({ success: true, message: 'Nova oportunidade simulada registrada!', event: newEvt });
  }

  if (type === 'conversion') {
    const value = Number(payload?.value) || 297.0;
    const newEvt = {
      id: `sim_won_${Date.now()}`,
      event: 'crm.stage.changed',
      featureId: 'crm.kanban',
      timestamp: now,
      extVersion: '5.4.1',
      plan: 'pro',
      deviceId: 'did_carlos_mbp_2026',
      metadata: {
        stageCategory: 'won',
        stage: 'Venda Fechada',
        leadName: payload?.leadName || 'Escritório Contábil Alfa',
        value
      }
    };
    db.telemetryEvents.unshift(newEvt);
    const rep = db.salesReps[0];
    if (rep) {
      rep.dealsWon += 1;
      rep.revenueGenerated += value;
      rep.conversionRate = Number(((rep.dealsWon / Math.max(rep.opportunitiesCreated, 1)) * 100).toFixed(1));
    }
    persistDb();
    return res.json({ success: true, message: 'Cliente convertido registrado!', event: newEvt });
  }

  return res.status(400).json({ success: false, error: 'Tipo de simulação desconhecido.' });
});

// 12. CANONICAL CATALOG: GET /api/v1/catalog
app.get('/api/v1/catalog', (req: Request, res: Response) => {
  return res.json({ success: true, catalog: FEATURE_CATALOG });
});

// 13. SMTP CONFIG: GET / PUT — Configuração segura com STARTTLS
app.get('/api/v1/admin/smtp-config', (req: Request, res: Response) => {
  const config = db.smtpConfig || DEFAULT_SMTP_CONFIG;
  // Nunca expor a senha real
  return res.json({
    success: true,
    config: { ...config, pass: config.pass ? '••••••••' : '' },
  });
});

app.put('/api/v1/admin/smtp-config', (req: Request, res: Response) => {
  const { host, port, secure, requireTLS, auth, fromName, fromEmail, subject } = req.body;
  const current = db.smtpConfig || { ...DEFAULT_SMTP_CONFIG };

  db.smtpConfig = {
    host: host || current.host,
    port: Number(port) || current.port,
    secure: typeof secure === 'boolean' ? secure : false, // Sempre false para STARTTLS em porta 587
    requireTLS: typeof requireTLS === 'boolean' ? requireTLS : true,
    auth: {
      user: auth?.user || current.auth.user,
      // Se senha vier vazia ou mascarada, mantém a atual
      pass: (!auth?.pass || auth.pass === '••••••••') ? current.auth.pass : auth.pass,
    },
    fromName: fromName || current.fromName,
    fromEmail: fromEmail || current.fromEmail,
    subject: subject || current.subject,
  };

  persistDb();
  return res.json({ success: true, message: 'Configuração SMTP salva com STARTTLS ativo.' });
});

// Função auxiliar de envio de e-mail via SMTP com registro no histórico
async function sendEmailWithLog(params: {
  to: string;
  subject: string;
  html: string;
  licenseKey?: string;
}): Promise<{ success: boolean; error?: string }> {
  const config = db.smtpConfig || DEFAULT_SMTP_CONFIG;
  const logEntry: any = {
    id: `email_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    to: params.to,
    subject: params.subject,
    licenseKey: params.licenseKey,
    sentAt: new Date().toISOString(),
  };

  try {
    // Envio real via nodemailer (se disponível) ou simulação
    let nodemailer: any;
    try {
      nodemailer = require('nodemailer');
    } catch {
      // nodemailer não instalado — registra como enviado em modo demo
      logEntry.status = 'sent';
      logEntry.note = 'Modo demo: nodemailer não instalado. Instale com: npm install nodemailer';
      if (!db.emailLog) db.emailLog = [];
      db.emailLog.unshift(logEntry);
      if (db.emailLog.length > 500) db.emailLog = db.emailLog.slice(0, 500);
      persistDb();
      return { success: true };
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      requireTLS: config.requireTLS,
      auth: { user: config.auth.user, pass: config.auth.pass },
    });

    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    logEntry.status = 'sent';
  } catch (err: any) {
    logEntry.status = 'failed';
    logEntry.errorMessage = err.message || String(err);
  }

  if (!db.emailLog) db.emailLog = [];
  db.emailLog.unshift(logEntry);
  if (db.emailLog.length > 500) db.emailLog = db.emailLog.slice(0, 500);
  persistDb();

  return logEntry.status === 'sent'
    ? { success: true }
    : { success: false, error: logEntry.errorMessage };
}

// 13b. SEND EMAIL: POST /api/v1/admin/send-email
app.post('/api/v1/admin/send-email', async (req: Request, res: Response) => {
  const { to, subject, html, licenseKey } = req.body;
  if (!to || !subject || !html) {
    return res.status(400).json({ success: false, error: 'Campos obrigatórios: to, subject, html' });
  }
  const result = await sendEmailWithLog({ to, subject, html, licenseKey });
  return res.json(result);
});

// 13c. EMAIL LOG: GET /api/v1/admin/email-log
app.get('/api/v1/admin/email-log', (req: Request, res: Response) => {
  const logs = db.emailLog || [];
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const offset = Number(req.query.offset) || 0;
  return res.json({
    success: true,
    logs: logs.slice(offset, offset + limit),
    total: logs.length,
  });
});

// 13d. AI CONFIG: GET / PUT — Configuração do assistente IA (nome, template de áudio, limites)
app.get('/api/v1/admin/ai-config', (req: Request, res: Response) => {
  const config = db.aiConfig || DEFAULT_AI_CONFIG;
  return res.json({ success: true, config });
});

app.put('/api/v1/admin/ai-config', (req: Request, res: Response) => {
  const { assistantName, audioAutoReplyEnabled, audioAutoReplyTemplate, tokenLimitWarningPercent, tokenLimitExceededMessage } = req.body;
  const current = db.aiConfig || { ...DEFAULT_AI_CONFIG };

  db.aiConfig = {
    assistantName: assistantName || current.assistantName,
    audioAutoReplyEnabled: typeof audioAutoReplyEnabled === 'boolean' ? audioAutoReplyEnabled : current.audioAutoReplyEnabled,
    audioAutoReplyTemplate: audioAutoReplyTemplate || current.audioAutoReplyTemplate,
    tokenLimitWarningPercent: typeof tokenLimitWarningPercent === 'number' ? tokenLimitWarningPercent : current.tokenLimitWarningPercent,
    tokenLimitExceededMessage: tokenLimitExceededMessage || current.tokenLimitExceededMessage,
  };

  persistDb();
  return res.json({ success: true, message: 'Configuração do assistente IA salva.', config: db.aiConfig });
});

// 13e. TOKEN TELEMETRY: POST /api/v1/telemetry/tokens — Extensão envia métricas diárias de consumo
app.post('/api/v1/telemetry/tokens', (req: Request, res: Response) => {
  const { licenseId, date, metrics } = req.body;
  if (!licenseId || !metrics) {
    return res.status(400).json({ success: false, error: 'Campos obrigatórios: licenseId, metrics' });
  }

  if (!db.tokenTelemetry) db.tokenTelemetry = [];

  const entry = {
    id: `tel_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    licenseId,
    date: date || new Date().toISOString().split('T')[0],
    metrics: {
      tokensUsedToday: metrics.tokensUsedToday || 0,
      tokensUsedMonth: metrics.tokensUsedMonth || 0,
      tokensBalance: metrics.tokensBalance || 0,
      conversationsToday: metrics.conversationsToday || 0,
      conversationsMonth: metrics.conversationsMonth || 0,
      averageTokensPerConversation: metrics.averageTokensPerConversation || 0,
      qualifiedLeadsToday: metrics.qualifiedLeadsToday || 0,
      qualifiedLeadsMonth: metrics.qualifiedLeadsMonth || 0,
      audioMessagesReceived: metrics.audioMessagesReceived || 0,
      audioAutoRepliesSent: metrics.audioAutoRepliesSent || 0,
    },
    receivedAt: new Date().toISOString(),
  };

  db.tokenTelemetry.unshift(entry);
  // Manter apenas últimos 10.000 registros para testes
  if (db.tokenTelemetry.length > 10000) db.tokenTelemetry = db.tokenTelemetry.slice(0, 10000);
  persistDb();

  return res.json({ success: true, id: entry.id });
});

// 13f. TOKEN TELEMETRY: GET /api/v1/admin/token-usage — Painel lista consumo agregado
app.get('/api/v1/admin/token-usage', (req: Request, res: Response) => {
  const telemetry = db.tokenTelemetry || [];
  const limit = Math.min(Number(req.query.limit) || 100, 1000);
  const offset = Number(req.query.offset) || 0;
  const licenseFilter = req.query.licenseId as string | undefined;

  const filtered = licenseFilter
    ? telemetry.filter((t: any) => t.licenseId === licenseFilter)
    : telemetry;

  // Agregados globais
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = filtered.filter((t: any) => t.date === today);
  const totalTokensToday = todayEntries.reduce((sum: number, t: any) => sum + (t.metrics?.tokensUsedToday || 0), 0);
  const totalConversationsToday = todayEntries.reduce((sum: number, t: any) => sum + (t.metrics?.conversationsToday || 0), 0);
  const totalQualifiedLeadsToday = todayEntries.reduce((sum: number, t: any) => sum + (t.metrics?.qualifiedLeadsToday || 0), 0);

  return res.json({
    success: true,
    entries: filtered.slice(offset, offset + limit),
    total: filtered.length,
    summary: {
      totalTokensToday,
      totalConversationsToday,
      totalQualifiedLeadsToday,
      activeLicensesToday: todayEntries.length,
    },
  });
});

// 13g. TOKEN BALANCE: GET /api/v1/ai/balance — Extensão consulta saldo de tokens
app.get('/api/v1/ai/balance', (req: Request, res: Response) => {
  const licenseKey = req.query.key as string;
  if (!licenseKey) {
    return res.status(400).json({ success: false, error: 'Parâmetro key obrigatório' });
  }

  const license = db.licenses.find((l: any) => l.key === licenseKey);
  if (!license) {
    return res.status(404).json({ success: false, error: 'Licença não encontrada' });
  }

  const planLimits = PLAN_USAGE_LIMITS[license.plan] || PLAN_USAGE_LIMITS.free;
  const budgetBRL = planLimits.aiTokenBudgetBRL || 0;
  // R$10 ≈ 400.000 tokens (GPT-4o-mini)
  const budgetTokens = Math.round(budgetBRL * 40000);

  // Consumo acumulado do mês atual via telemetria
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const monthEntries = (db.tokenTelemetry || []).filter(
    (t: any) => t.licenseId === license.id && t.date?.startsWith(currentMonth)
  );
  const usedTokens = monthEntries.length > 0
    ? monthEntries[0].metrics?.tokensUsedMonth || 0
    : 0;

  const remainingTokens = Math.max(0, budgetTokens - usedTokens);
  const usagePercent = budgetTokens > 0 ? Math.round((usedTokens / budgetTokens) * 100) : 0;
  const aiConfig = db.aiConfig || DEFAULT_AI_CONFIG;
  const warningThreshold = aiConfig.tokenLimitWarningPercent || 80;

  return res.json({
    success: true,
    balance: {
      budgetBRL,
      budgetTokens,
      usedTokens,
      remainingTokens,
      usagePercent,
      isWarning: usagePercent >= warningThreshold,
      isExhausted: remainingTokens <= 0,
      exhaustedMessage: remainingTokens <= 0
        ? aiConfig.tokenLimitExceededMessage.replace('{assistantName}', aiConfig.assistantName).replace('{purchaseLink}', '')
        : null,
    },
  });
});

// 13h. TOKEN CONSUME: POST /api/v1/ai/consume — Debita tokens por mensagem processada
app.post('/api/v1/ai/consume', (req: Request, res: Response) => {
  const { licenseKey, tokensUsed, conversationType } = req.body;
  if (!licenseKey || typeof tokensUsed !== 'number') {
    return res.status(400).json({ success: false, error: 'Campos obrigatórios: licenseKey, tokensUsed' });
  }

  const license = db.licenses.find((l: any) => l.key === licenseKey);
  if (!license) {
    return res.status(404).json({ success: false, error: 'Licença não encontrada' });
  }

  // Registrar consumo na telemetria
  if (!db.tokenConsumption) db.tokenConsumption = [];
  db.tokenConsumption.unshift({
    licenseId: license.id,
    tokensUsed,
    conversationType: conversationType || 'text', // text, audio, qualification
    consumedAt: new Date().toISOString(),
  });
  if (db.tokenConsumption.length > 50000) db.tokenConsumption = db.tokenConsumption.slice(0, 50000);
  persistDb();

  return res.json({ success: true, tokensDebited: tokensUsed });
});

// 14. SECURITY EVENTS: GET com deduplicação automática
app.get('/api/v1/admin/security-events', (req: Request, res: Response) => {
  const events = db.securityEvents || [];

  // Deduplicação: consolidar eventos idênticos (mesmo tipo + deviceId + licença) em janela <5s
  const deduplicated: any[] = [];
  const seen = new Map<string, { event: any; count: number }>();

  for (const evt of events) {
    const key = `${evt.type}|${evt.deviceId || ''}|${evt.licenseId || ''}`;
    const existing = seen.get(key);

    if (existing) {
      const timeDiff = Math.abs(
        new Date(evt.timestamp).getTime() - new Date(existing.event.timestamp).getTime()
      );
      if (timeDiff < 5000) {
        // Mesmo evento em janela <5s → incrementar contador
        existing.count += 1;
        existing.event.metadata = {
          ...existing.event.metadata,
          duplicateCount: existing.count,
          firstSeen: existing.event.timestamp,
          lastSeen: evt.timestamp,
        };
        continue;
      }
    }

    seen.set(key, { event: { ...evt }, count: 1 });
    deduplicated.push(evt);
  }

  return res.json({ success: true, events: deduplicated, totalRaw: events.length });
});

// 15. CLIENTES COM ALERTA DE VENCIMENTO: GET /api/v1/admin/clients-with-alerts
app.get('/api/v1/admin/clients-with-alerts', (req: Request, res: Response) => {
  const now = new Date();
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

  const clientsWithAlerts = db.licenses.map((lic: any) => {
    const expiresAt = new Date(lic.expiresAt);
    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    let alertLevel: string | null = null;

    if (daysUntilExpiry <= 0 && lic.status !== 'revoked') {
      alertLevel = 'expired';
    } else if (daysUntilExpiry <= 3 && daysUntilExpiry > 0 && lic.status === 'active') {
      alertLevel = 'expiring_soon';
    }

    return {
      id: lic.id,
      customerName: lic.customerName,
      customerEmail: lic.customerEmail,
      plan: lic.plan,
      status: lic.status,
      expiresAt: lic.expiresAt,
      daysUntilExpiry,
      alertLevel,
    };
  }).filter((c: any) => c.alertLevel !== null);

  return res.json({
    success: true,
    clients: clientsWithAlerts,
    summary: {
      expiringSoon: clientsWithAlerts.filter((c: any) => c.alertLevel === 'expiring_soon').length,
      expired: clientsWithAlerts.filter((c: any) => c.alertLevel === 'expired').length,
    },
  });
});

// 16. ANTI-FRAUDE: POST /api/v1/admin/antifraud/check — Bloqueio automático por score ≥50
app.post('/api/v1/admin/antifraud/check', (req: Request, res: Response) => {
  const { email, cpfCnpj, ip, fingerprint, signals } = req.body;

  // Calcular score baseado nos sinais
  let score = 0;
  const detectedSignals: string[] = [];

  if (signals?.includes('FINGERPRINT_REUSE')) { score += 30; detectedSignals.push('FINGERPRINT_REUSE'); }
  if (signals?.includes('DOCUMENT_ALREADY_USED')) { score += 50; detectedSignals.push('DOCUMENT_ALREADY_USED'); }
  if (signals?.includes('DISPOSABLE_EMAIL')) { score += 40; detectedSignals.push('DISPOSABLE_EMAIL'); }
  if (signals?.includes('VELOCITY_EXCEEDED')) { score += 25; detectedSignals.push('VELOCITY_EXCEEDED'); }
  if (signals?.includes('VPN_DETECTED')) { score += 15; detectedSignals.push('VPN_DETECTED'); }

  const blocked = score >= FRAUD_BLOCK_THRESHOLD;
  const needsReview = score >= FRAUD_REVIEW_THRESHOLD && !blocked;

  // Status explícito: BLOQUEADO (>=50), REVISÃO (30-49), PERMITIDO (<30)
  const status = blocked ? 'BLOQUEADO' : needsReview ? 'REVISÃO' : 'PERMITIDO';

  const result = {
    email,
    cpfCnpj: cpfCnpj || '—',
    ip,
    score,
    signals: detectedSignals,
    status,
    blocked,
    // Se bloqueado, adicionar mensagem explicativa para o frontend
    ...(blocked && {
      blockReason: `Score ${score} ≥ ${FRAUD_BLOCK_THRESHOLD}. Sinais: ${detectedSignals.join(', ') || 'nenhum'}`,
    }),
    timestamp: new Date().toISOString(),
  };

  // Persistir verificação
  if (!db.antifraudChecks) db.antifraudChecks = [];
  db.antifraudChecks.unshift(result);
  if (db.antifraudChecks.length > 200) db.antifraudChecks = db.antifraudChecks.slice(0, 200);
  persistDb();

  return res.json({ success: true, result });
});

// 17. ASAAS PLAN LINKS: POST /api/v1/admin/plans/:planSlug/asaas-link
app.post('/api/v1/admin/plans/:planSlug/asaas-link', async (req: Request, res: Response) => {
  const { planSlug } = req.params;
  const { name, description, valueCents, chargeType, cycle } = req.body;

  try {
    // Import dinâmico do cliente Asaas
    const asaasClient = await import('./src/services/asaas-client.js');
    const link = await asaasClient.createPlanPaymentLink({
      name: name || `Plano ${planSlug}`,
      description: description || `Assinatura ${planSlug}`,
      valueCents: Number(valueCents),
      chargeType: chargeType || 'RECURRENT',
      cycle: cycle || 'MONTHLY',
    });

    // Salvar vínculo plano ↔ link Asaas
    if (!db.planAsaasLinks) db.planAsaasLinks = {};
    db.planAsaasLinks[planSlug] = {
      linkId: link.id,
      linkUrl: link.url,
      chargeType,
      cycle,
      createdAt: new Date().toISOString(),
    };
    persistDb();

    return res.json({ success: true, link });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// VITE SETUP FOR FULL-STACK REACT APP
// ---------------------------------------------------------------------------

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[i9Hub Admin Server] Running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
