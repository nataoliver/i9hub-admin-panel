import React from 'react';
import {
  Plus,
  Zap,
  Calendar,
  CreditCard,
  RefreshCw,
  TrendingUp,
  Award
} from 'lucide-react';
import { FilterPeriod } from '../types';

interface HeaderProps {
  title: string;
  subtitle: string;
  period: string;
  onPeriodChange: (p: string) => void;
  onOpenNewLicenseModal: () => void;
  onOpenWebhookModal: () => void;
  onSimulateOpportunity: () => void;
  onSimulateConversion: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  period,
  onPeriodChange,
  onOpenNewLicenseModal,
  onOpenWebhookModal,
  onSimulateOpportunity,
  onSimulateConversion,
  onRefresh,
  isRefreshing = false
}) => {
  const periods: { key: string; label: string }[] = [
    { key: 'today', label: 'Hoje' },
    { key: '7d', label: 'Últimos 7 dias' },
    { key: '30d', label: 'Últimos 30 dias' },
    { key: 'this_month', label: 'Este mês' },
    { key: 'all', label: 'Todo o período' }
  ];

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sticky top-0 z-20 shadow-xs">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {title}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Period Selector */}
        <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
          <Calendar className="w-4 h-4 text-slate-500 ml-2 mr-1 shrink-0" />
          <select
            value={period}
            onChange={e => onPeriodChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 py-1 px-2 pr-6 outline-hidden cursor-pointer"
          >
            {periods.map(p => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          title="Recarregar dados"
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        {/* Live Simulation Quick Trigger */}
        <div className="hidden lg:flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-lg p-1">
          <button
            onClick={onSimulateOpportunity}
            title="Simula a criação de 1 nova oportunidade na extensão i9Hub"
            className="text-xs font-medium px-2.5 py-1 text-indigo-700 hover:bg-indigo-100 rounded transition flex items-center gap-1"
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            + Oportunidade
          </button>
          <span className="text-indigo-200">|</span>
          <button
            onClick={onSimulateConversion}
            title="Simula 1 cliente fechando compra (conversão no funil)"
            className="text-xs font-medium px-2.5 py-1 text-emerald-700 hover:bg-emerald-100 rounded transition flex items-center gap-1"
          >
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            + Conversão (R$)
          </button>
        </div>

        {/* Webhook Payment Simulator */}
        <button
          onClick={onOpenWebhookModal}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition flex items-center gap-2"
        >
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>Simular Gateway PIX</span>
        </button>

        {/* New License Button */}
        <button
          onClick={onOpenNewLicenseModal}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/25 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Gerar Nova Licença</span>
        </button>
      </div>
    </header>
  );
};
