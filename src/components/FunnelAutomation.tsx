import React, { useState } from 'react';
import {
  GitFork,
  ArrowRight,
  TrendingUp,
  Clock,
  DollarSign,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Sparkles,
  Play,
  RotateCcw,
  Sliders,
  Filter
} from 'lucide-react';
import { FunnelStage } from '../types';

interface FunnelAutomationProps {
  stages: FunnelStage[];
  period: string;
  onPeriodChange: (p: string) => void;
  onSimulateConversion: () => void;
  onRefresh: () => void;
}

export const FunnelAutomation: React.FC<FunnelAutomationProps> = ({
  stages,
  period,
  onPeriodChange,
  onSimulateConversion,
  onRefresh
}) => {
  const [activeAutomationRule, setActiveAutomationRule] = useState<string | null>(null);

  const formatBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const automations = [
    {
      id: 'rule_1',
      name: 'Auto-Boas-Vindas & Follow-up de Prospecção',
      trigger: 'Lead extraído via Google Maps ou Grupo WhatsApp',
      action: 'Adiciona tag no WhatsApp e envia mensagem inicial com delay anti-ban (8s a 15s)',
      status: 'active',
      executions: 4180
    },
    {
      id: 'rule_2',
      name: 'Alerta de Oportunidade Parada no Kanban',
      trigger: 'Lead na etapa "Oportunidade" sem interação há > 24 horas',
      action: 'Notifica o vendedor responsável no WhatsApp com link direto da conversa',
      status: 'active',
      executions: 840
    },
    {
      id: 'rule_3',
      name: 'Ativação Instantânea de Licença Pós-Venda',
      trigger: 'Lead movido para "Ganho / Venda Fechada" no CRM',
      action: 'Gera chave de licença no backend e envia mensagem com link de ativação',
      status: 'active',
      executions: 235
    },
    {
      id: 'rule_4',
      name: 'Handoff Inteligente de IA para Vendedor Humano',
      trigger: 'Cliente demonstra alta intenção de compra ou pede falar com atendente',
      action: 'Pausa a IA imediatamente, remove o bot da conversa e toca aviso sonoro no painel',
      status: 'active',
      executions: 612
    }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GitFork className="w-5 h-5 text-indigo-600" />
            Central de Vendas: Funil & Automações em Tempo Real
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visualização ponta a ponta do funil comercial alimentado pelas ações da extensão i9Hub e automações inteligentes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={e => onPeriodChange(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white shadow-xs focus:outline-hidden cursor-pointer"
          >
            <option value="today">Hoje</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="this_month">Este mês</option>
          </select>

          <button
            onClick={onSimulateConversion}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            Simular Avanço de Etapa
          </button>
        </div>
      </div>

      {/* Visual Conversion Funnel */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Funil Comercial de Conversão da Extensão</h3>
            <p className="text-xs text-slate-500">
              Taxa de avanço e perda entre cada etapa do ciclo comercial
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500">Taxa Global de Fechamento:</span>
            <div className="text-lg font-black text-emerald-600">10.7% dos leads capturados</div>
          </div>
        </div>

        {/* Funnel Pipeline Steps */}
        <div className="space-y-4">
          {stages.map((stage, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === stages.length - 1;
            const percentageOfTotal = Math.max(Math.round((stage.count / (stages[0]?.count || 1)) * 100), 5);

            return (
              <div
                key={stage.id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-200 transition space-y-2.5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{stage.label}</span>
                  </div>

                  <div className="flex items-center gap-5 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Volume</span>
                      <span className="font-black text-slate-900 text-sm">
                        {stage.count.toLocaleString('pt-BR')} leads
                      </span>
                    </div>

                    {!isFirst && (
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Conversão da Etapa</span>
                        <span className="font-bold text-emerald-600">
                          {stage.conversionRateFromPrev}%
                        </span>
                      </div>
                    )}

                    {!isLast && (
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Perda (Drop-off)</span>
                        <span className="font-bold text-rose-600">
                          {stage.dropOffRate}%
                        </span>
                      </div>
                    )}

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pipeline (R$)</span>
                      <span className="font-bold text-slate-800">
                        {formatBrl(stage.valueBrl)}
                      </span>
                    </div>

                    {stage.avgTimeInStageHours > 0 && (
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tempo Médio</span>
                        <span className="font-medium text-slate-600">
                          {stage.avgTimeInStageHours}h
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-700 ${
                      isLast
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : isFirst
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                        : 'bg-gradient-to-r from-indigo-500 to-blue-500'
                    }`}
                    style={{ width: `${percentageOfTotal}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Funnel Automation Rules */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Automações do Funil em Tempo Real
            </h3>
            <p className="text-xs text-slate-500">
              Gatilhos automáticos conectados à extensão do WhatsApp e geração de licenças
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
            4 Automações Ativas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automations.map(auto => (
            <div
              key={auto.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{auto.name}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Ativo
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <div>
                  <strong className="text-slate-800 font-medium">Gatilho:</strong> {auto.trigger}
                </div>
                <div>
                  <strong className="text-slate-800 font-medium">Ação:</strong> {auto.action}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Disparada {auto.executions.toLocaleString('pt-BR')} vezes</span>
                <button
                  onClick={() => alert(`Automação "${auto.name}" está em execução contínua com a extensão.`)}
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Configurar Regra
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
