import React from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import type { Evento } from '../../types/database';

interface MonthCalendarViewProps {
  monthDays: Date[];
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  getEventsForDay: (date: Date) => Evento[];
}

export const MonthCalendarView: React.FC<MonthCalendarViewProps> = ({ 
  monthDays, 
  currentDate, 
  onDateSelect, 
  getEventsForDay 
}) => {
  return (
    <div className="grid grid-cols-7 h-full">
      {monthDays.map((date) => {
        const events = getEventsForDay(date);
        const isCurrentMonth = isSameMonth(date, currentDate);
        return (
          <div 
            key={date.toString()} 
            onClick={() => onDateSelect(date)}
            className={cn(
              "p-3 border-r border-b border-black/[0.04] relative group transition-all duration-200 min-h-[110px] cursor-pointer",
              !isCurrentMonth ? "opacity-30" : "hover:bg-white/50",
              isToday(date) && "bg-violet-50/40"
            )}
          >
            <span className={cn(
              "text-sm font-bold transition-colors block mb-1.5",
              isToday(date) 
                ? "w-7 h-7 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-[11px] font-extrabold shadow-glow-purple"
                : isCurrentMonth ? "text-slate-700" : "text-slate-400"
            )}>
              {format(date, 'dd')}
            </span>
            
            <div className="space-y-1">
              {events.slice(0, 2).map((e) => (
                <Link 
                  to={`/gestao/eventos/${e.id}`} 
                  key={e.id} 
                  onClick={(ev) => ev.stopPropagation()}
                  className={cn(
                    "px-2 py-1 rounded-md text-[9px] font-semibold truncate block transition-all hover:scale-[1.02] active:scale-95",
                    e.situacao === 'confirmado' ? "bg-emerald-100 text-emerald-700" :
                    e.situacao === 'cancelado' ? "bg-red-50 text-red-400 line-through opacity-60" :
                    "bg-violet-100 text-violet-700"
                  )}
                >
                    {e.nome}
                </Link>
              ))}
              {events.length > 2 && (
                <div className="text-[9px] font-semibold text-slate-400 pl-1">
                  +{events.length - 2} mais
                </div>
              )}
            </div>

            {events.length > 0 && isCurrentMonth && (
              <div className="absolute top-3 right-2.5 w-2.5 h-2.5 bg-violet-400 rounded-full shadow-glow-violet animate-heartbeat"></div>
            )}
          </div>
        );
      })}
    </div>
  );
};
