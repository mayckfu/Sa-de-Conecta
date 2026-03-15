import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  PlusCircle, 
  Files, 
  LogOut,
  Hospital,
  ChevronRight,
  Shield
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar: React.FC = () => {
  const { profile, signOut } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Gestão', path: '/gestao' },
    { icon: Calendar, label: 'Agenda de Eventos', path: '/gestao/eventos' },
    { icon: PlusCircle, label: 'Novo Evento', path: '/gestao/novo-evento', roles: ['admin', 'cadastrador'] },
    { 
      icon: Files, 
      label: 'Relatórios', 
      path: '/gestao/ideias',
      subItems: [
        { label: 'Visão Geral', path: '/gestao/ideias' },
        { label: 'Demandas', path: '/gestao/ideias#demandas' },
        { label: 'Público Alvo', path: '/gestao/ideias#publico' },
      ]
    },
    { icon: Shield, label: 'Usuários', path: '/gestao/usuarios', roles: ['admin'] },
  ];

  const filteredItems = menuItems.filter(item => 
    !item.roles || (profile && item.roles.includes(profile.role))
  );

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 z-50 flex flex-col glass-sidebar">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-white/40">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-glow-purple">
          <Hospital className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-sm text-arc-dark leading-tight tracking-tight">Saúde</h1>
          <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-[0.15em]">Gestão de Eventos</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item, idx) => {
          const hasSubItems = 'subItems' in item;
          
          return (
            <div key={item.path} className="space-y-1">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                    "animate-in",
                    isActive
                      ? "bg-white/80 shadow-glass-sm text-violet-600 border border-white/60"
                      : "text-slate-500 hover:bg-white/50 hover:text-slate-800"
                  )
                }
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {({ isActive }) => (
                  <>
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-br from-violet-500 to-indigo-500 shadow-glow-purple"
                        : "bg-white/60 group-hover:bg-white/90"
                    )}>
                      <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                    </div>
                    <span className={cn(
                      "font-medium text-sm flex-1 tracking-tight",
                      isActive ? "font-semibold text-arc-dark" : ""
                    )}>
                      {item.label}
                    </span>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-violet-400" />
                    )}
                  </>
                )}
              </NavLink>

              {/* Sub-menu rendering */}
              {hasSubItems && (
                <div className="pl-12 space-y-1 mt-1 animate-in slide-in-from-top-2 duration-300">
                  {item.subItems?.map((sub) => (
                    <NavLink
                      key={sub.path}
                      to={sub.path}
                      className={({ isActive }) => cn(
                        "block px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                        isActive 
                          ? "text-violet-600 bg-violet-50/50" 
                          : "text-slate-400 hover:text-slate-600 hover:bg-white/30"
                      )}
                    >
                      {sub.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/40">
        <button 
          onClick={() => signOut()}
          className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-white/50 rounded-xl transition-all duration-200 text-slate-400 hover:text-red-400 group"
        >
          <div className="w-7 h-7 rounded-lg bg-white/60 group-hover:bg-red-50 flex items-center justify-center transition-all duration-200">
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
          </div>
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
};
