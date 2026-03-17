import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogIn, 
  Mail, 
  Lock, 
  ShieldCheck, 
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Calendar,
  CheckCircle,
  Users,
  BarChart3,
  Settings,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../utils/cn';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Auth-driven navigation: wait for useAuth to confirm the user is set
  // before navigating. This prevents the race condition where navigate fires
  // before onAuthStateChange has updated the auth context.
  useEffect(() => {
    if (user) navigate('/gestao', { replace: true });
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome: ''
  });

  const [stats, setStats] = useState({
    planned: 0,
    confirmed: 0,
    participants: 0
  });

  // Pre-fill email if remembered
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Fetch real-time statistics for the current month
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const { data, error } = await supabase
          .from('eventos')
          .select('situacao, participantes')
          .gte('data', startOfMonth)
          .lte('data', endOfMonth);

        if (error) throw error;

        if (data) {
          const planned = data.length;
          const confirmed = data.filter(e => e.situacao === 'confirmado').length;
          const participants = data.reduce((acc, curr) => acc + (curr.participantes || 0), 0);
          
          setStats({ planned, confirmed, participants });
        }
      } catch (err) {
        console.error('Error fetching login stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (signInError) throw signInError;

        if (rememberMe) {
          localStorage.setItem('remembered_email', formData.email);
        } else {
          localStorage.removeItem('remembered_email');
        }
        // Navigation is handled by the useEffect above that watches user
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              nome: formData.nome,
              is_admin: false,
            },
          },
        });
        if (signUpError) throw signUpError;
        alert('Cadastro realizado com sucesso! Verifique seu e-mail (se houver confirmação ativa) ou faça login.');
        setIsLogin(true);
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Ocorreu um erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="flex h-screen flex-col lg:flex-row bg-slate-50 font-sans tracking-tight overflow-hidden relative">
      
      {/* Background Blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[120px] rounded-full animate-blob" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full animate-blob animation-delay-2000" />
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-sky-400/10 blur-[120px] rounded-full animate-blob animation-delay-4000" />
      </div>

      {/* Left Side: Login Form (50%) */}
      <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2 bg-white/40 backdrop-blur-[4px] z-10 relative border-r border-slate-200/50 overflow-y-auto">
        <div className="w-full max-w-sm space-y-6 animate-in fade-in slide-in-from-left-4 duration-700 bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
          
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white mb-6 shadow-xl shadow-indigo-600/20">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              {isLogin ? 'Bem-vindo' : 'Comece agora'}
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              {isLogin ? 'Painel de Gestão de Saúde' : 'Crie sua conta administrativa'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 animate-shake">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-[10px] font-bold text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-4">
              {!isLogin && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest pl-1" htmlFor="nome">Nome completo</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                      <LogIn className="w-4 h-4" />
                    </span>
                    <input 
                      className="block w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 focus:bg-white text-sm font-semibold outline-none" 
                      id="nome" 
                      placeholder="Ex: João da Silva" 
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest pl-1" htmlFor="email">Email corporativo</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input 
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-11 pr-4 text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 focus:bg-white text-sm font-semibold outline-none" 
                    id="email" 
                    placeholder="nome@saude.gov.br" 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest pl-1" htmlFor="password">Senha de acesso</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input 
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-11 pr-11 text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 focus:bg-white text-sm font-semibold outline-none" 
                    id="password" 
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button 
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-indigo-600 transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div 
                  onClick={() => setRememberMe(!rememberMe)}
                  className={cn(
                    "w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-200",
                    rememberMe 
                      ? "bg-indigo-600 border-indigo-600 shadow-sm" 
                      : "bg-white border-slate-300 group-hover:border-slate-400"
                  )}
                >
                  {rememberMe && <ShieldCheck className="w-3 h-3 text-white" />}
                </div>
                <span className="text-[11px] font-black text-slate-400 group-hover:text-slate-600 transition-colors select-none">LEMBRAR ACESSO</span>
              </label>
              {isLogin && (
                <button type="button" className="text-[11px] font-black text-indigo-600 hover:text-indigo-700 transition-all">ESQUECEU?</button>
              )}
            </div>

            <button 
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-700 to-indigo-500 py-4 text-sm font-black text-white shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 mt-2" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Entrar no Sistema' : 'Finalizar Cadastro'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-6 text-center space-y-6">
            <div className="flex items-center gap-2 justify-center text-[12px] font-semibold text-slate-500">
              {isLogin ? 'Não possui uma conta?' : 'Já possui conta?'}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="font-black text-indigo-600 hover:text-indigo-700 transition-all"
              >
                {isLogin ? 'Crie agora' : 'Faça login'}
              </button>
            </div>
            
            <div className="pt-6 border-t border-slate-100">
              <p className="text-[9px] uppercase tracking-[0.25em] text-slate-400 font-black">Secretaria Municipal de Saúde</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: PREMIUM VISUALS (50%) */}
      <div className="relative hidden w-full items-center justify-center overflow-hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 h-full">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/20 blur-[100px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-300/30 blur-[80px] rounded-full animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 w-full max-w-4xl px-12 h-full flex flex-col justify-center py-10 scale-90">
          <div className="mb-10 space-y-4 animate-in fade-in slide-in-from-right-8 duration-1000">
            <h2 className="text-5xl font-black leading-[1.05] tracking-tight text-white">
              Gestão Inteligente de <br/>
              <span className="text-white/70">Eventos da Saúde</span>
            </h2>
            <p className="max-w-xl text-lg font-medium leading-relaxed text-white/90">
              Painel analítico para mutirões e campanhas públicas com controle em tempo real.
            </p>
          </div>

          {/* Glassmorphic Grid */}
          <div className="grid grid-cols-3 gap-5 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] flex flex-col gap-4 hover:bg-white/15 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className={cn("transition-opacity duration-300", statsLoading ? "opacity-30" : "opacity-100")}>
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/60">Eventos Planejados</p>
                <h3 className="text-3xl font-black text-white">{formatNumber(stats.planned)}</h3>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] flex flex-col gap-4 hover:bg-white/15 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className={cn("transition-opacity duration-300", statsLoading ? "opacity-30" : "opacity-100")}>
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/60">Confirmados</p>
                <h3 className="text-3xl font-black text-white">{formatNumber(stats.confirmed)}</h3>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] flex flex-col gap-4 hover:bg-white/15 transition-all">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className={cn("transition-opacity duration-300", statsLoading ? "opacity-30" : "opacity-100")}>
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/60">Participantes</p>
                <h3 className="text-3xl font-black text-white">{formatNumber(stats.participants)}</h3>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 col-span-2 p-7 rounded-[2rem] flex items-center gap-8 hover:bg-white/15 transition-all">
              <div className="h-20 w-20 shrink-0 rounded-[2rem] bg-indigo-500 flex items-center justify-center">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <div>
                <h4 className="text-2xl font-black tracking-tight text-white">Agenda Integrada</h4>
                <p className="text-white/70 font-medium text-sm leading-relaxed">Sincronização entre as unidades da Secretaria municipal.</p>
              </div>
            </div>

            {/* Current Month Calendar */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2rem] flex flex-col justify-center gap-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                  {new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
                </span>
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-white/40 animate-pulse"></div>
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {[...Array(14)].map((_, i) => (
                  <div key={i} className={cn(
                    "h-3.5 rounded-md transition-all duration-500",
                    i === new Date().getDate() % 14 ? "bg-white/70" : i % 3 === 0 ? "bg-white/30" : "bg-white/10"
                  )} />
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2.25rem] flex flex-col gap-4 hover:bg-white/15 transition-all">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-white leading-tight">Relatórios em tempo real</h4>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2.25rem] flex flex-col gap-4 hover:bg-white/15 transition-all">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <Settings className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-white leading-tight">Controle de Eventos</h4>
            </div>

            {/* Gestores Ativos */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-[2.25rem] flex flex-col justify-center items-center text-center gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-indigo-400 bg-white/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white/40" />
                  </div>
                ))}
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-400 bg-white/30 text-xs font-black text-white">
                  +12
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Gestores Ativos</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
