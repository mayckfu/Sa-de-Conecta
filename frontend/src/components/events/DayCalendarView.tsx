import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Users, ArrowRight, CalendarDays } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { Evento } from '../../types/database';

interface DayCalendarViewProps {
  currentDate: Date;
  eventsForDay: Evento[];
}

export const DayCalendarView: React.FC<DayCalendarViewProps> = ({ 
  currentDate, 
  eventsForDay 
}) => {
  const navigate = useNavigate();

  return (
    <div className="p-8 flex flex-col items-center max-w-3xl mx-auto">
      <div className="text-center mb-8 space-y-1">
        <p className="text-xs font-semibold text-violet-500 uppercase tracking-widest">Visão Diária</p>
        <h3 className="font-display text-4xl font-bold text-arc-dark">{format(currentDate, "dd 'de' MMMM", { locale: ptBR })}</h3>
        <p className="text-slate-400 text-sm capitalize">{format(currentDate, 'iiii', { locale: ptBR })}</p>
      </div>
      
      <div className="w-full space-y-4">
        {eventsForDay.length > 0 ? (
          eventsForDay.map(e => (
            <Link to={`/gestao/eventos/${e.id}`} key={e.id} className="flex gap-6 group p-6 glass-card rounded-2xl hover:shadow-glass-lg transition-all duration-200">
                <div className="w-24 flex flex-col justify-center items-center gap-1 border-r border-black/[0.06] pr-6 shrink-0">
                  <span className="text-base font-bold text-arc-dark">{e.hora_inicio}</span>
                  <span className="text-[9px] font-medium text-slate-400 uppercase">Início</span>
                  <div className="w-px h-5 bg-black/10 my-0.5"></div>
                  <span className="text-sm font-medium text-slate-400">{e.hora_fim}</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wide",
                        e.situacao === 'confirmado' ? "bg-emerald-50 text-emerald-600" :
                        e.situacao === 'cancelado' ? "bg-red-50 text-red-500" :
                        "bg-violet-50 text-violet-600"
                      )}>{e.situacao}</span>
                      <div className="flex -space-x-1.5">
                        {[1,2,3].map(i => (
                          <img key={i} src={`https://i.pravatar.cc/100?img=${i+20}`} className="w-6 h-6 rounded-full border-2 border-white" alt="user" />
                        ))}
                      </div>
                  </div>
                  <h5 className="font-display text-xl font-bold text-arc-dark group-hover:text-violet-600 transition-colors">{e.nome}</h5>
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-1.5 text-sm text-slate-400 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-violet-400" /> {e.local}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-400 font-medium">
                      <Users className="w-3.5 h-3.5 text-violet-400" /> {e.participantes_previstos} previstos
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-1 transition-all duration-200" />
                </div>
            </Link>
          ))
        ) : (
          <div className="py-16 text-center space-y-3 glass-card rounded-2xl w-full">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-400 text-sm font-medium">Nenhum evento para este dia</p>
            <button onClick={() => navigate('/gestao/novo-evento')} className="text-sm font-semibold text-violet-600 hover:underline">+ Criar novo agora</button>
          </div>
        )}
      </div>
    </div>
  );
};
