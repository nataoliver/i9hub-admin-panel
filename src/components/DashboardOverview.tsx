import React from 'react';
import {
  CreditCard,
  Activity,
  Clock,
  AlertTriangle,
  Users,
  Smartphone,
  TrendingUp,
  Award,
  DollarSign,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Sparkles,
  Bot,
  ShieldCheck,
  ChevronRight,
  Radio,
  ExternalLink
} from 'lucide-react';
import { SalesRep, License } from '../types';

interface DashboardOverviewProps {
  kpis: any;
  salesReps: SalesRep[];
  recentLicenses: License[];
  recentEvents: any[];
  onNavigateTab: (tab: any) => void;
  onOpenNewLicense: () => void;
  periodLabel: string;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  kpis,
  salesReps,
  recentLicenses,
  recentEvents,
  onNavigateTab,
  onOpenNewLicense,
  periodLabel
}) => {
  if (!kpis) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Cards matching the layout of the user's uploaded Image 1
  const coreCards = [
    {
      title: 'Licenças Totais',
      value: kpis.totalLicenses ?? 5,
      icon: <CreditCard className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-50',
      change: '+1 esta semana',
      action: () => onNavigateTab('licenses')
    },
    {
      title: 'Ativas',
      value: kpis.activeLicenses ?? 2,
      icon: <Activity className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50',
      change: '100% adimplentes',
      action: () => onNavigateTab('licenses')
    },
    {
      title: 'Pendentes',
      value: kpis.pendingLicenses ?? 0,
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-50',
      change: 'Aguardando pagamento',
      action: () => onNavigateTab('licenses')
    },
    {
      title: 'Expiradas/Revogadas',
      value: kpis.expiredRevokedLicenses ?? 3,
      icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
      iconBg: 'bg-rose-50',
      change: 'Prontas para reativação',
      action: () => onNavigateTab('licenses')
    },
    {
      title: 'Clientes',
      value: kpis.totalCustomers ?? 3,
      icon: <Users className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-50',
      change: 'Empresas cadastradas',
      action: () => onNavigateTab('licenses')
    },
    {
      title: 'Dispositivos Ativos',
      value: kpis.activeDevices ?? 1,
      icon: <Smartphone className="w-5 h-5 text-indigo-600" />,
      iconBg: 'bg-indigo-50',
      change: 'Extensões conectadas',
      action: () => onNavigateTab('telemetry')
    }
  ];

  const formatBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome & Live Status Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-700/50">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Central de Vendas & Telemetria em Tempo Real
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Painel Executivo i9Hub — Gestão de Licenças e Funil
          </h2>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
            Monitoramento unificado de assinaturas automáticas, telemetria das funções da extensão
            (Google Maps, WhatsApp, IA), volume de oportunidades e taxa de fechamento de cada vendedor.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('simulator')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Sandbox da Extensão
          </button>
          <button
            onClick={onOpenNewLicense}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
          >
            + Gerar Licença
          </button>
        </div>
      </div>

      {/* CORE 6 METRIC CARDS (Exact Match to User's Original UI + Enhanced) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Visão Geral de Licenciamento
          </h3>
          <span className="text-xs text-slate-500 font-medium">Período: {periodLabel}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coreCards.map((card, idx) => (
            <div
              key={idx}
              onClick={card.action}
              className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition cursor-pointer group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">{card.title}</span>
                <div className={`p-2.5 rounded-xl ${card.iconBg} transition group-hover:scale-105`}>
                  {card.icon}
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {card.value}
                </span>
                <span className="text-xs font-medium text-slate-500 group-hover:text-blue-600 transition flex items-center gap-0.5">
                  {card.change}
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SALES INTELLIGENCE & CONVERSION KPI SECTION */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Métricas de Conversão da Extensão i9Hub
          </h3>
          <button
            onClick={() => onNavigateTab('funnel')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Ver Detalhes do Funil <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Oportunidades Criadas na Extensão */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">Oportunidades Criadas</span>
              <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">
              {kpis.opportunitiesCreated?.toLocaleString('pt-BR') || '1.451'}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +18.4%
              </span>{' '}
              vs mês anterior
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
              <span>Google Maps: 58%</span>
              <span>Grupos WhatsApp: 42%</span>
            </div>
          </div>

          {/* Clientes Convertidos */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">Clientes Convertidos</span>
              <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Award className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">
              {kpis.clientsConverted?.toLocaleString('pt-BR') || '235'}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +12.1%
              </span>{' '}
              vendas fechadas
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
              <span>Taxa de Conversão:</span>
              <span className="font-semibold text-emerald-600">{kpis.conversionRatePercent || 16.2}%</span>
            </div>
          </div>

          {/* Faturamento / MRR */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">Receita Recorrente (MRR)</span>
              <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-blue-700">
              {formatBrl(kpis.mrr || 994.0)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +15.8%
              </span>{' '}
              ARR: {formatBrl((kpis.mrr || 994.0) * 12)}
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
              <span>Ticket Médio:</span>
              <span className="font-semibold text-slate-800">R$ 297,00</span>
            </div>
          </div>

          {/* Usuários Ativos / Telemetria */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500">Usuários Ativos (DAU)</span>
              <span className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Activity className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 text-2xl font-black text-purple-700">
              {kpis.activeUsers || 4} Vendedores
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              {kpis.activeDevices || 2} dispositivos em operação
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
              <span>Versão predominante:</span>
              <span className="font-semibold text-slate-800">i9Leads v5.4.1</span>
            </div>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN SECTION: SALES REPS LEADERBOARD & REAL-TIME TELEMETRY STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Reps Ranking */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Desempenho dos Vendedores
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Oportunidades criadas na extensão vs. Clientes convertidos
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('sales-reps')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-3">
              {salesReps.slice(0, 4).map((rep, idx) => (
                <div
                  key={rep.id}
                  className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={rep.avatar}
                        alt={rep.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      {rep.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">{rep.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{rep.role}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">
                          {rep.dealsWon} fechados ({rep.conversionRate}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">
                      {formatBrl(rep.revenueGenerated)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {rep.opportunitiesCreated} oportunidades
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>SLA médio de resposta no WhatsApp: <strong className="text-slate-800">4.4 min</strong></span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Anti-Ban Score 96/100
            </span>
          </div>
        </div>

        {/* Live Extension Telemetry Stream */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Feed de Telemetria da Extensão
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Eventos operacionais ingeridos via API (<code className="text-blue-600">POST /api/v1/telemetry/events</code>)
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Em Tempo Real
              </span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {recentEvents.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Nenhum evento recente de telemetria recebido ainda.
                </div>
              ) : (
                recentEvents.slice(0, 5).map((evt, idx) => {
                  const isWon = evt.metadata?.stageCategory === 'won' || evt.event?.includes('won');
                  const isOpp = evt.event === 'crm.opportunity.opened';
                  const isLeads = evt.event === 'crm.leads.saved';

                  return (
                    <div
                      key={evt.id || idx}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-xs flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`mt-0.5 p-1 rounded-md shrink-0 ${
                            isWon
                              ? 'bg-emerald-100 text-emerald-700'
                              : isOpp
                              ? 'bg-indigo-100 text-indigo-700'
                              : isLeads
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isWon ? (
                            <Award className="w-3.5 h-3.5" />
                          ) : isOpp ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : (
                            <Activity className="w-3.5 h-3.5" />
                          )}
                        </span>
                        <div>
                          <div className="font-semibold text-slate-800">
                            {evt.metadata?.leadName
                              ? `${evt.metadata.leadName}`
                              : evt.event}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {isWon && <span className="text-emerald-700 font-semibold">Venda Fechada • </span>}
                            {isOpp && <span className="text-indigo-700 font-semibold">Nova Oportunidade • </span>}
                            {isLeads && <span>{evt.metadata?.count || 1} leads extraídos • </span>}
                            <span>Dispositivo: {evt.deviceId?.slice(0, 16)}...</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {evt.metadata?.value && (
                          <div className="font-bold text-slate-900">
                            {formatBrl(evt.metadata.value)}
                          </div>
                        )}
                        <span className="text-[10px] text-slate-400">
                          {new Date(evt.timestamp || Date.now()).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Taxa de deduplicação ativa: <strong className="text-slate-800">100%</strong>
            </span>
            <button
              onClick={() => onNavigateTab('telemetry')}
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Abrir Dashboard de Telemetria →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
