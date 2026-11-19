import React, { useState } from 'react';
import {
  Users2,
  TrendingUp,
  Award,
  DollarSign,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  Target,
  BarChart3,
  Flame,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { SalesRep } from '../types';

interface SalesPerformanceProps {
  salesReps: SalesRep[];
  period: string;
  onPeriodChange: (p: string) => void;
  onRefresh: () => void;
}

export const SalesPerformance: React.FC<SalesPerformanceProps> = ({
  salesReps,
  period,
  onPeriodChange,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRep, setSelectedRep] = useState<SalesRep | null>(null);

  const filteredReps = salesReps.filter(
    r =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatBrl = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const totalRevenue = salesReps.reduce((sum, r) => sum + r.revenueGenerated, 0);
  const totalWon = salesReps.reduce((sum, r) => sum + r.dealsWon, 0);
  const totalOpps = salesReps.reduce((sum, r) => sum + r.opportunitiesCreated, 0);
  const avgTeamConversion = Number(((totalWon / Math.max(totalOpps, 1)) * 100).toFixed(1));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users2 className="w-5 h-5 text-blue-600" />
            Monitoramento de Desempenho Individual dos Vendedores
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Métricas individuais de prospecção na extensão, oportunidades geradas, taxas de fechamento e conformidade WhatsApp.
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
        </div>
      </div>

      {/* Team Aggregates Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Faturamento da Equipe</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{formatBrl(totalRevenue)}</div>
          <div className="text-xs text-emerald-600 mt-1 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> 100% via extensão i9Hub
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Oportunidades Geradas</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 mt-2">{totalOpps.toLocaleString('pt-BR')}</div>
          <div className="text-xs text-slate-500 mt-1">Média de {Math.round(totalOpps / salesReps.length)} por vendedor</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Clientes Convertidos</span>
            <Award className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">{totalWon} vendas</div>
          <div className="text-xs text-slate-500 mt-1">Taxa de Conversão: <strong>{avgTeamConversion}%</strong></div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Tempo Médio Resposta</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">4.9 min</div>
          <div className="text-xs text-emerald-600 mt-1 font-semibold">Dentro do SLA de 5 min</div>
        </div>
      </div>

      {/* Suggested Sales Management Tools Banner */}
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-slate-50 rounded-2xl p-6 border border-indigo-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
            <Sparkles className="w-4 h-4" />
          </span>
          <h3 className="font-bold text-slate-900 text-sm">
            Ferramentas Sugeridas de Gestão e Monitoramento de Vendas i9Hub
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-white rounded-xl border border-indigo-100/80 shadow-xs space-y-1">
            <div className="font-bold text-indigo-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" /> Roleta Comercial (Round-Robin)
            </div>
            <p className="text-slate-600 leading-relaxed">
              Distribuição automática e balanceada de novos leads extraídos para cada vendedor com base em capacidade diária.
            </p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-indigo-100/80 shadow-xs space-y-1">
            <div className="font-bold text-indigo-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" /> Alerta de SLA de 1ª Resposta
            </div>
            <p className="text-slate-600 leading-relaxed">
              Disparo de aviso sonoro e push no WhatsApp quando um lead fica mais de 5 minutos aguardando primeiro atendimento.
            </p>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-indigo-100/80 shadow-xs space-y-1">
            <div className="font-bold text-indigo-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Escudo Anti-Ban Individual
            </div>
            <p className="text-slate-600 leading-relaxed">
              Bloqueia envios em velocidade perigosa na extensão do vendedor para garantir conformidade contínua com a Meta.
            </p>
          </div>
        </div>
      </div>

      {/* Sellers Leaderboard & Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              Ranking de Vendedores (Leaderboard de Fechamentos)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dados atualizados pelas mudanças de etapa no Kanban da extensão
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filtrar vendedor..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
              <tr>
                <th className="py-3 px-4">Posição / Vendedor</th>
                <th className="py-3 px-4">Leads Capturados</th>
                <th className="py-3 px-4">Oportunidades</th>
                <th className="py-3 px-4">Propostas Enviadas</th>
                <th className="py-3 px-4">Clientes Fechados</th>
                <th className="py-3 px-4">Taxa Conversão</th>
                <th className="py-3 px-4">Faturamento</th>
                <th className="py-3 px-4">Tempo Resposta</th>
                <th className="py-3 px-4">Anti-Ban Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReps.map((rep, idx) => (
                <tr
                  key={rep.id}
                  onClick={() => setSelectedRep(rep)}
                  className="hover:bg-slate-50/80 transition cursor-pointer"
                >
                  {/* Avatar & Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-700 border border-amber-300'
                            : idx === 1
                            ? 'bg-slate-200 text-slate-700'
                            : idx === 2
                            ? 'bg-amber-700/10 text-amber-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <div className="relative">
                        <img
                          src={rep.avatar}
                          alt={rep.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        {rep.online && (
                          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white"></span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{rep.name}</div>
                        <div className="text-[11px] text-slate-500">{rep.role}</div>
                      </div>
                    </div>
                  </td>

                  {/* Leads */}
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {rep.leadsCaptured.toLocaleString('pt-BR')}
                  </td>

                  {/* Oportunidades */}
                  <td className="py-3.5 px-4 font-semibold text-indigo-700">
                    {rep.opportunitiesCreated}
                  </td>

                  {/* Propostas */}
                  <td className="py-3.5 px-4 text-slate-700">{rep.proposalsSent}</td>

                  {/* Fechados */}
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-emerald-700 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                      {rep.dealsWon} fechados
                    </span>
                  </td>

                  {/* Taxa Conversão */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{rep.conversionRate}%</span>
                      <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(rep.conversionRate * 4, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Faturamento */}
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    {formatBrl(rep.revenueGenerated)}
                  </td>

                  {/* Tempo de Resposta */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`font-medium ${
                        rep.avgResponseTimeMin <= 5 ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {rep.avgResponseTimeMin} min
                    </span>
                  </td>

                  {/* Compliance Score */}
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                      {rep.complianceScore}/100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rep Detail Modal */}
      {selectedRep && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedRep.avatar}
                  alt={selectedRep.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{selectedRep.name}</h3>
                  <p className="text-xs text-slate-500">
                    {selectedRep.role} • {selectedRep.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRep(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Total de Vendas Fechadas</span>
                <span className="text-lg font-black text-emerald-700">{selectedRep.dealsWon} clientes</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Faturamento Individual</span>
                <span className="text-lg font-black text-slate-900">{formatBrl(selectedRep.revenueGenerated)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Oportunidades Abertas</span>
                <span className="text-lg font-black text-indigo-700">{selectedRep.opportunitiesCreated}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-500 block">Taxa de Conversão</span>
                <span className="text-lg font-black text-blue-700">{selectedRep.conversionRate}%</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-700 space-y-1">
              <div className="font-semibold text-blue-900">Dispositivo Ativo Vinculado:</div>
              <code className="font-mono text-[11px] block text-slate-600 truncate">
                {selectedRep.activeDeviceId || 'did_user_active_device'}
              </code>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedRep(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
