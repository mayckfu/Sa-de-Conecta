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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
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
