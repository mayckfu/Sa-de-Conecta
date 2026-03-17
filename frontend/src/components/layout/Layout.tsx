import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Outlet, Navigate } from 'react-router-dom';
import { ShieldAlert, Clock, LogOut } from 'lucide-react';
import { Header } from './Header';
import { EventosProvider } from '../../hooks/useEventos';
import { ToastProvider } from '../../hooks/useToast';
import { ToastContainer } from '../ui/Toast';

export const Layout: React.FC = () => {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/30 gap-6">
        {/* Logo / Brand */}
        <div className="relative flex items-center justify-center">
          {/* Outer pulse ring */}
          <div className="absolute w-20 h-20 rounded-2xl bg-indigo-500/10 animate-ping" />
          {/* Inner icon */}
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
        </div>

        {/* Spinner + text */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <span className="text-sm font-bold text-slate-500 tracking-wide">Verificando sessão...</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-[0.2em]">
            Saúde Conecta
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (profile?.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full glass-card rounded-[2rem] p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto shadow-glow-amber">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-arc-dark">Acesso Pendente</h2>
            <p className="text-sm text-slate-500 font-medium">
              Sua conta foi criada com sucesso, mas ainda precisa ser aprovada por um administrador.
            </p>
          </div>
          <div className="pt-4">
            <button 
              onClick={() => signOut()}
              className="flex items-center gap-2 mx-auto text-sm font-bold text-slate-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sair do Sistema
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (profile?.status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full glass-card rounded-[2rem] p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto shadow-glow-red">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-arc-dark">Acesso Negado</h2>
            <p className="text-sm text-slate-500 font-medium">
              Infelizmente sua solicitação de acesso foi recusada. Entre em contato com o suporte se acreditar que isso é um erro.
            </p>
          </div>
          <div className="pt-4">
            <button 
              onClick={() => signOut()}
              className="flex items-center gap-2 mx-auto text-sm font-bold text-slate-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Voltar ao Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent font-sans">
      <ToastProvider>
        <EventosProvider>
          <Header />
          <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8 animate-in fade-in duration-500">
            <Outlet />
          </main>
          <ToastContainer />
        </EventosProvider>
      </ToastProvider>
      <footer className="py-8 text-center text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
        © 2026 <span className="text-violet-500">Saúde</span> • Gestão de Eventos
      </footer>
    </div>
  );
};
