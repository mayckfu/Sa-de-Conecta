import React from 'react';
import { Bell, Search, User, Hospital, LayoutDashboard, Calendar, PlusCircle, Files, LogOut, Shield, BarChart3 } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';

import { useAuth } from '../../hooks/useAuth';
import { useEventos } from '../../hooks/useEventos';

export const Header: React.FC = () => {
  const { profile, signOut } = useAuth();
  const { searchTerm, setSearchTerm } = useEventos();
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  // Focus input when open
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Gestão', path: '/gestao' },
    { icon: Calendar, label: 'Agendamentos', path: '/gestao/eventos' },
    { icon: PlusCircle, label: 'Novo Evento', path: '/gestao/novo-evento', roles: ['admin', 'cadastrador'] },
    { 
      icon: BarChart3, 
      label: 'Relatórios', 
      path: '/gestao/ideias',
      subItems: [
        { label: 'Visão Geral', path: '/gestao/ideias' },
        { label: 'Demandas', path: '/gestao/ideias#demandas' },
        { label: 'Público Alvo', path: '/gestao/ideias#publico' },
      ]
    },
    { icon: Files, label: 'Documentos', path: '/gestao/documentos' },
  ];

  const filteredItems = menuItems.filter(item => 
    !item.roles || (profile && item.roles.includes(profile.role))
  );

  return (
    <header className="glass-header h-20 flex items-center justify-between px-8 sticky top-0 z-50">
      {/* Left: Logo */}
      <div className="flex items-center gap-3 min-w-[200px]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-glow-purple">
          <Hospital className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-base text-arc-dark leading-tight tracking-tight">Saúde</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em]">Gestão de Eventos</p>
        </div>
      </div>

      {/* Center: Navigation Pills */}
      <nav className="hidden lg:flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-black/5 shadow-inner">
        {filteredItems.map((item) => {
          const hasSubItems = 'subItems' in item;
          
          if (hasSubItems) {
            return (
              <div key={item.path} className="relative group/nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 px-5 py-2 rounded-xl transition-all duration-200 text-sm font-semibold tracking-tight",
                      isActive
                        ? "bg-white shadow-glass-sm text-violet-600 border border-white/60"
                        : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                    )
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>

                {/* Dropdown for Sub-items */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/nav-item:opacity-100 group-hover/nav-item:translate-y-0 group-hover/nav-item:pointer-events-auto transition-all duration-200 z-50">
                  <div className="w-48 bg-white/90 backdrop-blur-xl border border-black/[0.05] rounded-2xl shadow-glass-lg overflow-hidden flex flex-col p-1.5">
                    {item.subItems?.map((sub) => (
                      <NavLink
                        key={sub.path}
                        to={sub.path}
                        className={({ isActive }) => cn(
                          "flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-xl transition-colors",
                          isActive ? "bg-violet-50 text-violet-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        {sub.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-5 py-2 rounded-xl transition-all duration-200 text-sm font-semibold tracking-tight",
                  isActive
                    ? "bg-white shadow-glass-sm text-violet-600 border border-white/60"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Right: Actions & User */}
      <div className="flex items-center justify-end gap-5 min-w-[200px]">
        <div className="flex items-center gap-1.5">
          {/* Global Search */}
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300 border",
            isSearchOpen 
              ? "bg-white border-violet-200 shadow-glass-sm w-64 ring-2 ring-violet-500/10" 
              : "bg-slate-50 border-transparent w-10 overflow-hidden hover:bg-slate-100 lg:w-48 lg:border-slate-100"
          )}>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-1 text-slate-500 hover:text-violet-600 transition-colors shrink-0"
              title="Pesquisar em tudo"
            >
              <Search className="w-4 h-4" />
            </button>
            <input
              ref={inputRef}
              type="text"
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "bg-transparent border-none outline-none text-xs font-semibold text-arc-dark w-full placeholder:text-slate-400 placeholder:font-medium",
                (!isSearchOpen && "lg:block hidden")
              )}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => {
                if (searchTerm === '') {
                   // Add a small delay so we don't snap closed immediately if they clicked the button again
                   setTimeout(() => setIsSearchOpen(false), 200);
                }
              }}
            />
          </div>
          
          <button className="relative p-2.5 text-slate-500 hover:text-slate-800 hover:bg-white/60 rounded-xl transition-all duration-200 group">
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          <div className="h-8 w-px bg-black/5 mx-1"></div>

          {/* User Profile Dropdown */}
          <div className="relative group/menu">
            <div className="flex items-center gap-3 cursor-pointer p-1 pr-2 rounded-2xl border border-transparent hover:bg-white/40 transition-all duration-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-arc-dark leading-tight">{profile?.nome || 'Usuário'}</p>
                <p className="text-[10px] text-slate-500 font-semibold capitalize">
                  {profile ? (
                    profile.role === 'admin' ? '⭐ Administrador' :
                    profile.role === 'cadastrador' ? 'Cadastrador' :
                    'Visitante'
                  ) : '...'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-glow-purple border-2 border-white/80 overflow-hidden">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Dropdown Menu Panel (visible on hover) */}
            <div className="absolute right-0 top-full pt-2 opacity-0 translate-y-2 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:translate-y-0 group-hover/menu:pointer-events-auto transition-all duration-200 z-50">
              <div className="w-56 bg-white/90 backdrop-blur-xl border border-black/[0.05] rounded-2xl shadow-glass-lg overflow-hidden flex flex-col p-1.5">
                {profile?.role === 'admin' && (
                  <>
                    <NavLink 
                      to="/gestao/usuarios" 
                      className={({ isActive }) => cn(
                        "flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-colors",
                        isActive ? "bg-violet-50 text-violet-600" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                       <Shield className="w-4 h-4" /> Gerenciar Usuários
                    </NavLink>
                    <div className="h-px bg-black/[0.04] my-1 mx-2" />
                  </>
                )}
                
                <button 
                  onClick={() => signOut()}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left w-full"
                >
                  <LogOut className="w-4 h-4" /> Sair do Sistema
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
