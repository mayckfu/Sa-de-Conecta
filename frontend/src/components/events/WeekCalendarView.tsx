import React from 'react';
import { format, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import type { Evento } from '../../types/database';

interface WeekCalendarViewProps {
  weekDays: Date[];
  getEventsForDay: (date: Date) => Evento[];
}

export const WeekCalendarView: React.FC<WeekCalendarViewProps> = ({ 
  weekDays, 
  getEventsForDay 
}) => {
  return (
    <div className="grid grid-cols-7 h-full">
      {weekDays.map(date => {
        const events = getEventsForDay(date);
        return (
          <div key={date.toString()} className={cn(
            "p-4 border-r border-black/[0.04] flex flex-col gap-3",
            isToday(date) && "bg-violet-50/30"
          )}>
            <div className="text-center pb-3 border-b border-black/[0.05]">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{format(date, 'iii', { locale: ptBR })}</p>
                <p className={cn("text-2xl font-bold mt-0.5", isToday(date) ? "text-violet-600" : "text-arc-dark")}>{format(date, 'dd')}</p>
            </div>
            <div className="space-y-2">
              {events.map(e => (
                <Link to={`/gestao/eventos/${e.id}`} key={e.id} className="block group p-2.5 rounded-xl bg-white/60 border border-white/70 hover:bg-white hover:shadow-glass-sm transition-all duration-200 relative overflow-hidden">
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-1 rounded-full",
                      e.situacao === 'confirmado' ? "bg-emerald-400 shadow-glow-emerald" : 
                      e.situacao === 'cancelado' ? "bg-red-400 shadow-glow-red" : 
                      "bg-violet-400 shadow-glow-violet"
                    )} />
                    <p className="text-[9px] font-semibold text-slate-400 mb-0.5">{e.hora_inicio}</p>
                    <h4 className="text-[10px] font-semibold text-arc-dark group-hover:text-violet-600 transition-colors leading-tight line-clamp-2">{e.nome}</h4>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
