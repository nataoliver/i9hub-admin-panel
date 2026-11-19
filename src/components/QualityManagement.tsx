import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Bot,
  Zap,
  RotateCcw,
  Sliders,
  Sparkles,
  MessageSquare,
  Flame,
  Info
} from 'lucide-react';
import { QualityMetrics } from '../types';

interface QualityManagementProps {
  quality: QualityMetrics;
  onRefresh: () => void;
}

export const QualityManagement: React.FC<QualityManagementProps> = ({
  quality,
  onRefresh
}) => {
  if (!quality) return null;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Central de Gestão de Qualidade & Escudo Anti-Ban
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitoramento de conformidade com as diretrizes da Meta, saúde das contas de WhatsApp e qualidade do atendimento com IA.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Score de Saúde: {quality.overallComplianceScore}/100
          </span>
        </div>
      </div>

      {/* 4 Health Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Risco Anti-Ban</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">Baixo (Seguro)</div>
          <div className="text-xs text-slate-500 mt-1">
            Intervalo médio: <strong className="text-slate-800">{quality.avgDelayBetweenMessagesSec}s</strong> por envio
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Adoção de Spintax</span>
            <Sparkles className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">{quality.spintaxAdoptionRate}%</div>
          <div className="text-xs text-slate-500 mt-1">Variação de texto ativa nas campanhas</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Resolução pela IA</span>
            <Bot className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 mt-2">{quality.aiResolutionRate}%</div>
          <div className="text-xs text-slate-500 mt-1">
            Handoff humano: <strong className="text-slate-800">{quality.aiHandoffToHumanRate}%</strong>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Fila Aguardando Resposta</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">
            {quality.awaitingRepliesCount} conversas
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Tempo médio de fila: <strong className="text-slate-800">{quality.avgResponseTimeMin} min</strong>
          </div>
        </div>
      </div>

      {/* Active Quality & Security Alerts */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Alertas de Qualidade e Segurança em Aberto
        </h3>

        <div className="space-y-3">
          {quality.alerts.map(alt => (
            <div
              key={alt.id}
              className={`p-4 rounded-xl border text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                alt.severity === 'critical'
                  ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                  : alt.severity === 'warning'
                  ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5">
                  {alt.severity === 'critical' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  ) : alt.severity === 'warning' ? (
                    <Clock className="w-4 h-4 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </span>
                <div>
                  <div className="font-bold text-sm">{alt.title}</div>
                  <p className="mt-0.5 opacity-90">{alt.description}</p>
                  <div className="text-[11px] opacity-75 mt-1">
                    Entidade: {alt.affectedEntity} • {new Date(alt.timestamp).toLocaleTimeString('pt-BR')}
                  </div>
                </div>
              </div>

              {alt.actionRequired && (
                <button
                  onClick={() => alert(`Ação disparada: ${alt.actionRequired}`)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-semibold text-slate-800 hover:bg-slate-50 self-start md:self-auto shrink-0 shadow-xs"
                >
                  {alt.actionRequired}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Meta Guidelines Compliance Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900">
          Matriz de Conformidade Técnica da Extensão (Meta WhatsApp Policies)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Delays Aleatórios & Spintax Dinâmico
            </div>
            <p className="text-slate-600 leading-relaxed">
              O service worker da extensão impõe intervalo mínimo de 6s a 25s entre mensagens com jitter aleatório, evitando padrões de robô.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Blacklist & Respeito a Descadastros (Opt-Out)
            </div>
            <p className="text-slate-600 leading-relaxed">
              Palavras como "sair", "pare", "não quero" removem o lead automaticamente de novas campanhas e registram no log de consentimento.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Isolamento de Sessão & Dispositivo (DID)
            </div>
            <p className="text-slate-600 leading-relaxed">
              Cada token é assinado exclusivamente para o UUID da máquina do vendedor, impedindo compartilhamento indevido ou ataques de repetição.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Supervisão Humana com Smart Handoff
            </div>
            <p className="text-slate-600 leading-relaxed">
              A inteligência artificial atua com modo sugestão ou automação supervisionada, repassando o cliente para a fila humana a qualquer momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
