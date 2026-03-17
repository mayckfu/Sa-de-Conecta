import React, { useState, useMemo, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CalendarDays, 
  Clock, 
  MapPin, 
  ArrowRight
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addDays, 
  subDays,
  addWeeks,
  subWeeks,
  startOfToday
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { cn } from '../utils/cn';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import { MonthCalendarView } from '../components/events/MonthCalendarView';
import { WeekCalendarView } from '../components/events/WeekCalendarView';
import { DayCalendarView } from '../components/events/DayCalendarView';
import { useEventos } from '../hooks/useEventos';
import type { Evento } from '../types/database';

type ViewMode = 'Mês' | 'Semana' | 'Dia';

export const Events: React.FC = () => {
  const { profile } = useAuth();
  const { filteredEvents } = useEventos();
  const [currentDate, setCurrentDate] = useState(startOfToday());
  const [viewMode, setViewMode] = useState<ViewMode>('Mês');

  const diasSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  // Dynamic Month Grid Logic
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({
      start: startDate,
      end: endDate,
    });
  }, [currentDate]);

  // Week Grid Logic
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(weekStart);
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  const handlePrev = () => {
    if (viewMode === 'Mês') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'Semana') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'Mês') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'Semana') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const getEventsForDay = useCallback((date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredEvents.filter(e => e.data === dateStr);
  }, [filteredEvents]);

  const todayEvents = useMemo(() => getEventsForDay(currentDate), [getEventsForDay, currentDate]);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-4 h-4 text-violet-500" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Agenda</p>
          </div>
          <h2 className="font-display text-4xl font-bold text-arc-dark tracking-tight">Agenda de Eventos</h2>
          <p className="text-sm font-medium text-slate-500 mt-0.5">Gerencie consultas, mutirões e eventos em tempo real.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="glass-card p-1 rounded-xl flex">
            {(['Mês', 'Semana', 'Dia'] as ViewMode[]).map(view => (
              <button 
                key={view} 
                onClick={() => setViewMode(view)}
                className={cn(
                  "px-5 py-2 text-xs font-semibold rounded-lg transition-all duration-200",
                  viewMode === view 
                    ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-glow-purple" 
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/60 font-bold"
                )}
              >
                {view}
              </button>
            ))}
          </div>
          {profile?.role !== 'visitante' && (
            <Link to="/gestao/novo-evento" className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-glow-purple hover:-translate-y-0.5 transition-all duration-200 active:scale-95">
              <Plus className="w-4 h-4" /> Novo Evento
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main Calendar View (70%) */}
        <div className="flex-1 glass-card rounded-2xl overflow-hidden flex flex-col min-h-[680px] transition-all duration-200">
          <div className="px-6 py-4 border-b border-white/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="space-y-0.5">
                <h3 className="font-display text-2xl font-bold text-arc-dark capitalize">
                  {format(currentDate, viewMode === 'Mês' ? 'MMMM yyyy' : 'MMMM', { locale: ptBR })}
                </h3>
                {viewMode !== 'Mês' && (
                  <p className="text-xs text-slate-500 font-bold">
                    {viewMode === 'Semana' ? `Semana de ${format(weekDays[0], 'dd')} a ${format(weekDays[6], 'dd')}` : format(currentDate, 'iiii, dd', { locale: ptBR })}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handlePrev}
                  className="p-1.5 hover:bg-white/70 rounded-lg border border-white/60 transition-all duration-200 active:scale-90"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                </button>
                <button 
                  onClick={() => setCurrentDate(startOfToday())}
                  className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 hover:text-violet-600 transition-colors duration-200"
                >
                  Hoje
                </button>
                <button 
                  onClick={handleNext}
                  className="p-1.5 hover:bg-white/70 rounded-lg border border-white/60 transition-all duration-200 active:scale-90"
                >
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm font-bold text-slate-600 tracking-wide">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-glow-emerald animate-heartbeat-fast" />
                Confirmado
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-violet-400 shadow-glow-violet animate-heartbeat" />
                Planejado
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-red-600 shadow-glow-red animate-heartbeat-slow" />
                Cancelado
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 border-b border-black/[0.05] bg-white/30">
            {diasSemana.map(dia => (
              <div key={dia} className="py-3 text-center text-[10px] font-extrabold text-slate-500 tracking-wider uppercase">
                {dia}
              </div>
            ))}
          </div>

          <div className="flex-1 relative bg-white/20">
            {viewMode === 'Mês' && (
              <MonthCalendarView 
                monthDays={monthDays}
                currentDate={currentDate}
                onDateSelect={(date) => {
                  setCurrentDate(date);
                  setViewMode('Dia');
                }}
                getEventsForDay={getEventsForDay}
              />
            )}

            {viewMode === 'Semana' && (
              <WeekCalendarView 
                weekDays={weekDays}
                getEventsForDay={getEventsForDay}
              />
            )}

            {viewMode === 'Dia' && (
              <DayCalendarView 
                currentDate={currentDate}
                eventsForDay={getEventsForDay(currentDate)}
              />
            )}
          </div>
        </div>

        {/* Dynamic Sidebar (30%) */}
        <div className="w-full xl:w-[380px] shrink-0 space-y-5">
          <div className="glass-dark rounded-2xl p-6 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 blur-2xl rounded-full -mr-8 -mt-8 pointer-events-none" />
            
            <div className="relative mb-6">
              <h3 className="font-display font-semibold text-base text-white/90">Eventos Selecionados</h3>
              <p className="text-white/40 text-xs font-medium mt-0.5 capitalize">
                {format(currentDate, "eeee, dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>

            <div className="space-y-5 relative">
              {todayEvents.length > 0 ? (
                todayEvents.sort((a,b) => a.hora_inicio.localeCompare(b.hora_inicio)).map((e) => (
                  <Link to={`/gestao/eventos/${e.id}`} key={e.id} className="relative pl-5 group/item block">
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-0.5 rounded-full",
                      e.situacao === 'confirmado' ? "bg-emerald-400" :
                      e.situacao === 'cancelado' ? "bg-red-400" :
                      "bg-violet-400"
                    )} />
                    
                    <div className="flex justify-between items-start mb-1.5">
                      <span className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider",
                        e.situacao === 'confirmado' ? "text-emerald-400" :
                        e.situacao === 'cancelado' ? "text-red-400" :
                        "text-violet-400"
                      )}>
                        {e.situacao}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-white/30" />
                        <span className="text-[10px] font-medium text-white/40 tabular-nums">
                          {e.hora_inicio}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-semibold text-sm text-white/90 group-hover/item:text-violet-300 transition-colors leading-snug">
                      {e.nome}
                    </h4>

                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-[11px] text-white/40 font-medium">
                        <MapPin className="w-3 h-3" />
                        {e.local}
                      </div>
                    </div>

                    {e.comentario && (
                      <div className="mt-3 p-3 bg-red-500/10 rounded-xl border border-red-500/15">
                        <p className="text-[10px] text-red-300/70 italic leading-relaxed">
                          "{e.comentario}"
                        </p>
                      </div>
                    )}
                  </Link>
                ))
              ) : (
                <div className="py-10 text-center space-y-3">
                   <div className="w-12 h-12 bg-white/[0.06] rounded-2xl flex items-center justify-center mx-auto border border-white/[0.08]">
                      <CalendarDays className="w-6 h-6 text-white/30" />
                   </div>
                   <p className="text-white/30 text-xs font-medium">Sem eventos para esta data</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setViewMode('Mês')}
              className="mt-8 flex items-center justify-center gap-2 w-full py-3 text-white/40 hover:text-white/70 text-[10px] font-semibold uppercase tracking-wider hover:bg-white/[0.06] rounded-xl transition-all duration-200 border border-white/[0.06]"
            >
              Exibir Visão Mensal
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Metrics */}
          {(() => {
            const mesAtual = currentDate;
            const eventosMes = filteredEvents.filter(e => {
              if (!e.data) return false;
              const [ano, mes] = e.data.split('-');
              return Number(ano) === mesAtual.getFullYear() && Number(mes) === mesAtual.getMonth() + 1;
            });
            const totalEventos = eventosMes.length;
            const confirmados = eventosMes.filter(e => e.situacao === 'confirmado').length;
            const participantes = eventosMes.reduce((acc: number, e: Evento) => acc + (e.participantes_previstos || 0), 0);
            const cancelados = eventosMes.filter(e => e.situacao === 'cancelado').length;

            return (
              <div className="glass-card rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-500">Resumo do Mês</h4>
                  <span className="text-[9px] font-bold text-violet-500 bg-violet-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                    {format(mesAtual, 'MMMM', { locale: ptBR })}
                  </span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-3.5 bg-white/60 rounded-xl border border-white/70 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">Total de Eventos</span>
                    <span className="text-sm font-bold text-arc-dark">{totalEventos}</span>
                  </div>
                  <div className="p-3.5 bg-white/60 rounded-xl border border-white/70 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">Confirmados</span>
                    <span className="text-sm font-bold text-emerald-600">{confirmados}</span>
                  </div>
                  <div className="p-3.5 bg-white/60 rounded-xl border border-white/70 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">Participantes Previstos</span>
                    <span className="text-sm font-bold text-blue-600">{participantes}</span>
                  </div>
                  {cancelados > 0 && (
                    <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-100/70 flex items-center justify-between">
                      <span className="text-xs font-medium text-red-400">Cancelados</span>
                      <span className="text-sm font-bold text-red-500">{cancelados}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
};
