import React from 'react';
import {
  LayoutDashboard,
  KeyRound,
  CreditCard,
  Activity,
  GitFork,
  Users2,
  ShieldCheck,
  Cpu,
  LogOut,
  ExternalLink,
  Sparkles,
  Radio
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'licenses'
  | 'billing'
  | 'telemetry'
  | 'funnel'
  | 'sales-reps'
  | 'quality'
  | 'simulator';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  activeDevicesCount: number;
  activeLicensesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeDevicesCount,
  activeLicensesCount
}) => {
  const menuItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string | number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      id: 'licenses',
      label: 'Gestão de Licenças',
      icon: <KeyRound className="w-5 h-5" />,
      badge: activeLicensesCount,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
    },
    {
      id: 'billing',
      label: 'Faturamento & Assinaturas',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      id: 'telemetry',
      label: 'Telemetria da Extensão',
      icon: <Activity className="w-5 h-5" />,
      badge: `${activeDevicesCount} online`,
      badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    },
    {
      id: 'funnel',
      label: 'Funil & Conversão',
      icon: <GitFork className="w-5 h-5" />
    },
    {
      id: 'sales-reps',
      label: 'Desempenho Vendedores',
      icon: <Users2 className="w-5 h-5" />
    },
    {
      id: 'quality',
      label: 'Qualidade & Anti-Ban',
      icon: <ShieldCheck className="w-5 h-5" />,
      badge: '94%',
      badgeColor: 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
    },
    {
      id: 'simulator',
      label: 'Simulador da Extensão',
      icon: <Cpu className="w-5 h-5" />
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-lg tracking-tight">i9Hub Admin</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                  v1.0.2
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Extensão Conectada
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {menuItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & User */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/60">
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 mb-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1 font-medium text-slate-300">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> API Gateway
            </span>
            <span className="text-emerald-400 font-semibold">200 OK</span>
          </div>
          <div className="text-[11px] text-slate-400 flex justify-between">
            <span>Telemetria Realtime</span>
            <span className="text-slate-300 font-mono">v5.4.1</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              NA
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-200 truncate">novancora@gmail.com</div>
              <div className="text-[11px] text-slate-400">Super Administrador</div>
            </div>
          </div>
          <button
            title="Sair do painel"
            onClick={() => alert('Sessão administrativa mantida.')}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
