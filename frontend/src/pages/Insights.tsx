import React, { useMemo, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  MapPin, 
  TrendingUp, 
  CalendarCheck,
  Zap,
  Coffee,
  Package,
  UserCheck,
  LayoutDashboard,
  PieChart as PieChartIcon,
  Clock,
  FilterX
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { isWithinInterval, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { useEventos } from '../hooks/useEventos';
import { cn } from '../utils/cn';
import { DateRangePicker } from '../components/insights/DateRangePicker';
import type { DateRange } from '../components/insights/DateRangePicker';

export const Insights: React.FC = () => {
  const { events, loading, searchTerm } = useEventos();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('geral');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
    label: 'Este Mês'
  });

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash === 'demandas' || hash === 'publico') {
      setActiveTab(hash);
    } else {
      setActiveTab('geral');
    }
  }, [location]);

  const filteredEvents = useMemo(() => {
    let result = events;
    
    // Filtro de Data
    if (dateRange.label !== 'Tudo') {
      result = result.filter(e => {
        const eventDate = parseISO(e.data);
        return isWithinInterval(eventDate, { start: dateRange.from, end: dateRange.to });
      });
    }

    // Filtro de Busca Global
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(e => {
        const searchString = [
          e.nome,
          e.local,
          e.unidade_responsavel,
          e.situacao,
          e.tipo,
          e.responsavel,
          e.observacoes,
          e.comentario,
          ...(e.logistica?.map(l => l.observacoes) || []),
          ...(e.documentos?.map(d => d.nome) || [])
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchString.includes(term);
      });
    }

    return result;
  }, [events, dateRange, searchTerm]);

  const stats = useMemo(() => {
    if (!filteredEvents.length) return null;

    const total = filteredEvents.length;
    const confirmados = filteredEvents.filter(e => e.situacao === 'confirmado').length;
    const cancelados = filteredEvents.filter(e => e.situacao === 'cancelado').length;
    const taxaConfirmacao = ((confirmados / total) * 100).toFixed(1);

    // Dados para Pie Chart (Situação)
    const situacaoData = [
      { name: 'Confirmados', value: confirmados, color: '#10b981' },
      { name: 'Cancelados', value: cancelados, color: '#ef4444' },
      { name: 'Planejados', value: total - confirmados - cancelados, color: '#8b5cf6' }
    ];

    // Ranking de Solicitantes
    const solicitantesMap: Record<string, number> = {};
    filteredEvents.forEach(e => {
      const resp = e.responsavel || 'Não Identificado';
      solicitantesMap[resp] = (solicitantesMap[resp] || 0) + 1;
    });

    const topSolicitantes = Object.entries(solicitantesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    // Locais mais demandados
    const locaisMap: Record<string, number> = {};
    filteredEvents.forEach(e => {
      const local = e.local || 'Não Definido';
      locaisMap[local] = (locaisMap[local] || 0) + 1;
    });

    const topLocais = Object.entries(locaisMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Demanda por Unidade
    const unidadesMap: Record<string, number> = {};
    filteredEvents.forEach(e => {
      const unidade = e.unidade_responsavel || 'Geral';
      unidadesMap[unidade] = (unidadesMap[unidade] || 0) + 1;
    });

    const topUnidades = Object.entries(unidadesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    // Motivos de Cancelamento
    const motivosMap: Record<string, number> = {};
    filteredEvents.filter(e => e.situacao === 'cancelado').forEach(e => {
      const motivo = e.motivo_cancelamento || 'Não especificado';
      motivosMap[motivo] = (motivosMap[motivo] || 0) + 1;
    });

    const motivosData = Object.entries(motivosMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    // Heatmap: Demanda por Hora (hora_inicio)
    const horasMap: Record<string, number> = {};
    filteredEvents.forEach(e => {
      if (e.hora_inicio) {
        const hora = e.hora_inicio.split(':')[0];
        horasMap[hora] = (horasMap[hora] || 0) + 1;
      }
    });

    const heatmapData = Object.entries(horasMap)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([hora, total]) => ({ hora: `${hora}h`, total }));

    // Logística
    const coffeeTotal = filteredEvents.filter(e => e.logistica?.[0]?.tem_coffee_break).length;
    const materiaisTotal = filteredEvents.filter(e => e.materiais && e.materiais.length > 0).length;
    const publicoTotal = filteredEvents.reduce((acc, e) => acc + (e.participantes_previstos || 0), 0);

    return {
      total,
      confirmados,
      cancelados,
      taxaConfirmacao,
      situacaoData,
      topSolicitantes,
      topLocais,
      topUnidades,
      motivosData,
      heatmapData,
      coffeeTotal,
      materiaisTotal,
      publicoTotal
    };
  }, [filteredEvents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'geral', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'demandas', label: 'Análise de Demandas', icon: TrendingUp },
    { id: 'publico', label: 'Público & Logística', icon: Users },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-600 text-[10px] font-black uppercase tracking-wider">Beta Analytics</span>
          </div>
          <h2 className="text-3xl font-bold text-arc-dark tracking-tight">Ideias & Insights</h2>
          <p className="text-slate-500 font-medium">Dashboard inteligente para monitoramento de agendamentos.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker range={dateRange} onChange={setDateRange} />
          
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-black/5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => navigate(`#${tab.id}`)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300",
                  activeTab === tab.id
                    ? "bg-white shadow-glass-sm text-violet-600 ring-1 ring-black/5"
                    : "text-slate-400 hover:text-slate-600 hover:bg-white/40"
                )}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {!stats ? (
        <div className="glass-card p-20 rounded-[2rem] text-center flex flex-col items-center justify-center gap-4 border-dashed border-2">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center">
                <FilterX className="w-8 h-8 text-slate-300" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-800">Nenhum evento encontrado</h3>
                <p className="text-slate-500 text-sm">Tente ajustar o filtro de período para ver mais dados.</p>
            </div>
        </div>
      ) : (
        <>
          {activeTab === 'geral' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total de Eventos', value: stats.total, icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-50' },
                  { label: 'Eventos Confirmados', value: stats.confirmados, icon: CalendarCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { label: 'Taxa de Sucesso', value: `${stats.taxaConfirmacao}%`, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                  { label: 'Cancelamentos', value: stats.cancelados, icon: Users, color: 'text-red-500', bg: 'bg-red-50' },
                ].map((stat, i) => (
                  <div key={i} className="glass-card p-6 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02]">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
                      <stat.icon className={cn("w-6 h-6", stat.color)} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                      <h4 className="text-2xl font-black text-arc-dark">{stat.value}</h4>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Distribuição por Situação (Pie Chart) */}
                <div className="glass-card rounded-2xl p-6 flex flex-col h-[400px]">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <PieChartIcon className="w-4 h-4 text-violet-500" /> Distribuição de Status
                    </h3>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.situacaoData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.situacaoData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center flex-wrap gap-4 mt-4">
                        {stats.situacaoData.map(item => (
                            <div key={item.name} className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Solicitantes Chart */}
                <div className="glass-card lg:col-span-2 rounded-2xl p-6 flex flex-col h-[400px]">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-violet-500" /> Top Solicitantes do Período
                    </h3>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.topSolicitantes} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
              </div>

              {/* Heatmap: Pico de Horário */}
              <div className="glass-card rounded-[2rem] p-8">
                  <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-amber-500" />
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-800">Mapa de Calor: Ocupação por Horário</h3>
                              <p className="text-xs text-slate-400 font-medium tracking-tight">Identifique os períodos de maior pico de solicitações.</p>
                          </div>
                      </div>
                  </div>
                  <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats.heatmapData}>
                              <defs>
                                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <XAxis dataKey="hora" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                              <Area type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'demandas' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Locais Populares */}
                <div className="glass-card rounded-2xl overflow-hidden flex flex-col">
                  <div className="px-6 py-5 border-b border-black/[0.03] bg-white/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                      </div>
                      <h3 className="font-bold text-slate-800">Locais em Demanda</h3>
                    </div>
                  </div>
                  <div className="p-6 flex-1">
                    <div className="space-y-5">
                      {stats.topLocais.map(([local, count]) => (
                        <div key={local} className="space-y-2">
                          <div className="flex justify-between items-center px-1">
                            <span className="text-sm font-bold text-slate-700 truncate pr-4">{local}</span>
                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">{count} eventos</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500" 
                              style={{ width: `${(count / (stats.topLocais[0][1] || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Motivos de Cancelamento */}
                <div className="glass-card rounded-2xl overflow-hidden flex flex-col">
                  <div className="px-6 py-5 border-b border-black/[0.03] bg-white/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        <FilterX className="w-4 h-4 text-red-600" />
                      </div>
                      <h3 className="font-bold text-slate-800">Causas de Cancelamento</h3>
                    </div>
                  </div>
                  <div className="p-6 flex-1 bg-red-50/10">
                    <div className="space-y-4">
                      {stats.motivosData.length > 0 ? (
                        stats.motivosData.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white border border-red-100/50 shadow-sm transition-all hover:bg-red-50/50">
                                <span className="text-sm font-bold text-slate-600">{item.name}</span>
                                <span className="text-xs font-black text-white bg-red-500 px-3 py-1 rounded-full shadow-lg shadow-red-500/20">{item.value}</span>
                            </div>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 italic">
                            Sem dados de cancelamento neste período.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Demanda por Unidade (Bar Chart Recharts) */}
              <div className="glass-card rounded-[2rem] p-8">
                  <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" /> Volume de Solicitações por Unidade
                  </h3>
                  <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.topUnidades}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} axisLine={false} tickLine={false} />
                              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={40} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'publico' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Público Total Card */}
                <div className="glass-card p-8 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xl shadow-violet-500/20 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <Users className="w-10 h-10 mb-4 opacity-80" />
                    <h4 className="text-[40px] font-black leading-none mb-1">{stats.publicoTotal.toLocaleString()}</h4>
                    <p className="text-violet-100 font-bold uppercase tracking-wider text-xs">Participantes Totais</p>
                    <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-300" />
                        <span className="text-xs font-medium text-violet-100">Estimativa baseada em agendamentos</span>
                    </div>
                </div>

                {/* Coffee Breakdown */}
                <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center group hover:border-amber-200 transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4 border border-amber-100 group-hover:scale-110 transition-transform">
                        <Coffee className="w-8 h-8 text-amber-500" />
                    </div>
                    <h5 className="text-3xl font-black text-arc-dark">{stats.coffeeTotal}</h5>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Coffee Breaks</p>
                    <div className="w-full mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400" style={{ width: `${(stats.coffeeTotal / (stats.total || 1)) * 100}%` }} />
                    </div>
                </div>

                {/* Material Breakdown */}
                <div className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center text-center group hover:border-violet-200 transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mb-4 border border-violet-100 group-hover:scale-110 transition-transform">
                        <Package className="w-8 h-8 text-violet-500" />
                    </div>
                    <h5 className="text-3xl font-black text-arc-dark">{stats.materiaisTotal}</h5>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Equipamentos</p>
                    <div className="w-full mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-400" style={{ width: `${(stats.materiaisTotal / (stats.total || 1)) * 100}%` }} />
                    </div>
                </div>
              </div>

              {/* Planning Card */}
              <div className="glass-card p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-10 bg-gradient-to-br from-white/80 to-slate-50/50">
                  <div className="w-32 h-32 rounded-3xl bg-violet-600 shadow-glow-purple flex items-center justify-center flex-shrink-0 animate-pulse-subtle">
                      <PieChartIcon className="w-16 h-16 text-white" />
                  </div>
                  <div className="space-y-4">
                      <h4 className="text-2xl font-black text-arc-dark tracking-tight">Planejamento Estratégico & Logístico</h4>
                      <p className="text-slate-500 text-sm leading-relaxed max-w-2xl font-medium">
                          Com base no volume atual, sua unidade atende uma média de <strong>{Math.round(stats.publicoTotal / (stats.total || 1))} pessoas</strong> por evento. 
                          A demanda por alimentação (Coffee Break) está presente em <strong>{Math.round(stats.coffeeTotal / (stats.total || 1) * 100)}%</strong> das solicitações, 
                          o que exige um controle rigoroso de suprimentos e parcerias com fornecedores.
                      </p>
                      <div className="flex flex-wrap gap-4 pt-2">
                        <div className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            Picos de demanda: {stats.heatmapData.sort((a,b) => b.total - a.total)[0]?.hora || '--'}
                        </div>
                        <div className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                            Local favorito: {stats.topLocais[0]?.[0] || '--'}
                        </div>
                      </div>
                  </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
