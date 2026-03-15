import React from 'react';
import { 
  Users, 
  CalendarCheck, 
  Coffee, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  ArrowUpRight,
  MapPin,
  Sparkles,
  Monitor,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { format, differenceInMinutes, startOfMonth, endOfMonth, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../utils/cn';
import { Link } from 'react-router-dom';
import type { Evento } from '../types/database';
import { useEventos } from '../hooks/useEventos';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = React.useState([
    { label: 'Total de Eventos', value: 0, icon: CalendarCheck, gradient: 'from-violet-400 to-purple-500', glow: 'shadow-glow-purple', bg: 'bg-violet-50', accent: 'text-violet-600' },
    { label: 'Eventos Confirmados', value: 0, icon: CheckCircle2, gradient: 'from-emerald-400 to-teal-500', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.25)]', bg: 'bg-emerald-50', accent: 'text-emerald-600' },
    { label: 'Participantes Previstos', value: 0, icon: Users, gradient: 'from-blue-400 to-indigo-500', glow: 'shadow-glow-indigo', bg: 'bg-blue-50', accent: 'text-blue-600' },
    { label: 'Com Coffee Break', value: 0, icon: Coffee, gradient: 'from-amber-400 to-orange-500', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.25)]', bg: 'bg-amber-50', accent: 'text-amber-600' },
  ]);
  const { filteredEvents } = useEventos();
  const [recentEvents, setRecentEvents] = React.useState<Evento[]>([]);
  const [upcomingLogistics, setUpcomingLogistics] = React.useState<Evento | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  
  const handlePrevMonth = () => setSelectedDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setSelectedDate(prev => addMonths(prev, 1));
  const handleResetMonth = () => setSelectedDate(new Date());

  const getTimeUntil = (data: string, horaInfo: string) => {
    if (!data || !horaInfo) return '';
    // Corrigir fuso horário garantindo interpretação local
    const [ano, mes, dia] = data.split('-');
    const [hora, min] = horaInfo.split(':');
    const evDate = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(min));
    
    const diffMins = differenceInMinutes(evDate, new Date());
    
    if (diffMins <= 0 && diffMins > -120) return 'Em andamento'; // Considerando o evento em andamento por 2h
    if (diffMins <= -120) return 'Finalizado'; 

    if (diffMins < 60) return `em ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `em ${diffHours}h`;
    return `em ${Math.floor(diffHours/24)} dias`;
  };

  React.useEffect(() => {
    // Filtrar localmente os eventos armazenados no Context com base no mês selecionado
    const startObj = startOfMonth(selectedDate);
    const endObj = endOfMonth(selectedDate);

    const eventosNorm = filteredEvents.filter((e: Evento) => {
      if (!e.data) return false;
      const [ano, mes, dia] = e.data.split('-');
      const evDate = new Date(Number(ano), Number(mes) - 1, Number(dia));
      return evDate >= startObj && evDate <= endObj;
    });

    setRecentEvents(eventosNorm.slice(0, 4));
        
        const total = eventosNorm.length;
        const confirmados = eventosNorm.filter((e: Evento) => e.situacao === 'confirmado').length;
        const participantes = eventosNorm.reduce((acc: number, e: Evento) => acc + (e.participantes_previstos || 0), 0);
        const coffee = eventosNorm.filter((e: Evento) => e.logistica?.[0]?.tem_coffee_break).length;

        setStats(prev => [
          { ...prev[0], value: total },
          { ...prev[1], value: confirmados },
          { ...prev[2], value: participantes },
          { ...prev[3], value: coffee },
        ]);

        // Encontrar o evento mais próximo que vai acontecer (ou que está acontecendo agora, margem de 2h)
        const now = new Date();
        now.setHours(now.getHours() - 2); // Eventos que começaram há no máximo 2 horas ainda aparecem

        const futuros = eventosNorm.filter((e: any) => {
          if (!e.data || !e.hora_inicio || e.situacao === 'cancelado') return false;
          
          const [ano, mes, dia] = e.data.split('-');
          const [hora, min] = e.hora_inicio.split(':');
          const evDate = new Date(Number(ano), Number(mes) - 1, Number(dia), Number(hora), Number(min));
          
          return evDate > now;
        }).sort((a: Evento, b: Evento) => {
          const [aAno, aMes, aDia] = a.data.split('-');
          const [aHora, aMin] = a.hora_inicio.split(':');
          const dateA = new Date(Number(aAno), Number(aMes) - 1, Number(aDia), Number(aHora), Number(aMin));

          const [bAno, bMes, bDia] = b.data.split('-');
          const [bHora, bMin] = b.hora_inicio.split(':');
          const dateB = new Date(Number(bAno), Number(bMes) - 1, Number(bDia), Number(bHora), Number(bMin));
          
          return dateA.getTime() - dateB.getTime();
        });

        // Encontrar o evento mais próximo que tenha alguma solicitação de logística ou material
        const proximoComLogistica = futuros.find((e: Evento) => 
          e.logistica?.[0]?.tem_coffee_break || 
          Object.values(e.materiais?.[0] || {}).some((val: any) => val === true && typeof val === 'boolean')
        );

        setUpcomingLogistics(proximoComLogistica || futuros[0] || null);
  }, [selectedDate, filteredEvents]);

  return (
    <div className="space-y-8 animate-in">
      {/* Page Header with Sophisticated Inline Month Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Secretaria Municipal de Saúde</p>
          </div>
          <h2 className="font-display text-4xl font-bold text-arc-dark tracking-tight">Painel de Gestão</h2>
          
          <div className="flex items-center flex-wrap gap-2 mt-2">
            {/* Inline Sleek Month Selector */}
            <div className="flex items-center bg-white/40 hover:bg-white/60 border border-white/60 rounded-xl backdrop-blur-md shadow-glass-sm transition-all duration-300 p-0.5">
              <button 
                onClick={handlePrevMonth}
                className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-white rounded-lg transition-all"
                title="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 capitalize px-2 min-w-[120px] text-center tracking-wide">
                {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
              </span>

              <button 
                onClick={handleNextMonth}
                className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-white rounded-lg transition-all"
                title="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Restored Phrase */}
            <span className="text-slate-300 mx-1 hidden sm:inline">•</span>
            <p className="text-sm font-medium text-slate-500">
              Controle de agendamentos e solicitações
            </p>

            {/* Back to Today Button */}
            {!isSameMonth(selectedDate, new Date()) && (
              <button 
                onClick={handleResetMonth}
                className="ml-2 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-glow-purple shadow-sm animate-fade-in"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Mês Atual
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div
            key={stat.label}
            className="glass-card rounded-2xl p-6 hover:-translate-y-1 transition-all duration-200 group cursor-default"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="flex justify-between items-start mb-5">
              <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg", stat.gradient, stat.glow)}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                <TrendingUp className="w-3 h-3" />
                +12%
              </span>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="font-display text-3xl font-extrabold text-arc-dark tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/50 flex justify-between items-center">
            <h3 className="font-display font-semibold text-base text-arc-dark">Próximos Eventos</h3>
            <Link
              to="/gestao/eventos"
              className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-xl transition-all duration-200"
            >
              Ver todos <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-black/[0.04]">
            {recentEvents.map((evento) => (
              <Link
                to={`/gestao/eventos/${evento.id}`}
                key={evento.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-white/50 transition-all duration-200 group"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-11 h-11 bg-white/90 rounded-xl flex flex-col items-center justify-center border border-white/80 shadow-glass-sm group-hover:shadow-glass transition-all duration-200 shrink-0">
                    <span className="text-[9px] uppercase font-extrabold text-slate-500 leading-none">
                      {evento.data ? format(new Date(evento.data), 'MMM', { locale: ptBR }).toUpperCase() : '---'}
                    </span>
                    <span className="text-base font-extrabold text-arc-dark leading-tight">
                      {evento.data ? evento.data.split('-')[2] : '--'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-arc-dark group-hover:text-violet-600 transition-colors duration-200 leading-tight">{evento.nome}</h4>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-violet-500/70" /> {evento.local?.substring(0, 32)}... • {evento.hora_inicio}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide",
                    evento.situacao === 'confirmado' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                    evento.situacao === 'cancelado' ? "bg-red-50 text-red-600 border border-red-100" :
                    "bg-violet-50 text-violet-700 border border-violet-100"
                  )}>
                    {evento.situacao}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Logistics Card - Dark Glass */}
          <div className="glass-dark rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 blur-2xl rounded-full -mr-8 -mt-8 pointer-events-none" />
            <h3 className="font-display font-semibold text-sm text-white/90 mb-5">Próxima Logística</h3>
            
            {!upcomingLogistics ? (
              <div className="py-6 flex flex-col items-center justify-center text-center">
                <Coffee className="w-8 h-8 text-white/20 mb-2" />
                <p className="text-sm font-medium text-white/60">Nenhum evento futuro</p>
                <p className="text-xs text-white/30">Agende novos eventos para ver a logística</p>
              </div>
            ) : (
              <div className="space-y-5 relative">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5 border border-orange-500/30">
                    <Clock className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <p className="text-xs font-semibold text-white/90">{upcomingLogistics.hora_inicio}</p>
                       <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 text-[9px] font-bold tracking-widest uppercase border border-orange-500/30">
                         {getTimeUntil(upcomingLogistics.data, upcomingLogistics.hora_inicio)}
                       </span>
                    </div>
                    <p className="text-sm font-bold text-white/90 mt-1 leading-tight">{upcomingLogistics.nome}</p>
                    <p className="text-[11px] text-white/50 font-medium flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {upcomingLogistics.local}
                    </p>
                  </div>
                </div>

                <div className="h-px bg-white/[0.07]" />

                <div className="grid grid-cols-2 gap-3">
                   {/* Card Coffee */}
                    <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 flex flex-col items-center justify-center text-center">
                       <Coffee className="w-4 h-4 text-amber-400 mb-1" />
                       <p className="text-[10px] text-white/80 font-bold">
                         {upcomingLogistics.logistica && upcomingLogistics.logistica.length > 0 && upcomingLogistics.logistica[0].tem_coffee_break ? 'Coffee Break' : 'Sem Coffee'}
                       </p>
                       <p className="text-[9px] text-white/40 font-medium">
                         {upcomingLogistics.participantes_previstos || 0} pessoas
                       </p>
                    </div>
                   
                   {/* Card Materiais */}
                   <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3 flex flex-col items-center justify-center text-center">
                      <Monitor className="w-4 h-4 text-emerald-400 mb-1" />
                      <p className="text-[10px] text-white/80 font-bold">Equipamentos</p>
                      <p className="text-[9px] text-white/40 font-medium line-clamp-2">
                         {(() => {
                            const mat = upcomingLogistics.materiais && upcomingLogistics.materiais.length > 0 ? upcomingLogistics.materiais[0] : null;
                            if (!mat) return 'Não solicitados';
                            const active = [];
                            if (mat.projetor) active.push('Projetor');
                            if (mat.microfone) active.push('Microfone');
                            if (mat.caixa_som) active.push('Caixa Som');
                            if (mat.banner) active.push('Banner');
                            if (mat.tenda) active.push('Tenda');
                            if (mat.mesas) active.push('Mesas');
                            if (mat.cadeiras) active.push('Cadeiras');
                            return active.length > 0 ? active.join(', ') : 'Apenas local';
                         })()}
                      </p>
                   </div>
                </div>

                {(upcomingLogistics.logistica?.[0]?.observacoes || upcomingLogistics.materiais?.[0]?.detalhes) && (
                  <div className="rounded-xl bg-white/[0.06] border border-white/[0.08] p-4 mt-2 border-l-2 border-l-violet-500">
                    <p className="text-[9px] font-semibold text-white/30 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-violet-400" /> Observações Logísticas
                    </p>
                    <p className="text-[11px] text-white/70 italic leading-relaxed font-medium">
                      "{upcomingLogistics.logistica?.[0]?.observacoes || upcomingLogistics.materiais?.[0]?.detalhes}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Weekly Balance */}
          <div className="glass-card rounded-2xl p-5 flex items-center gap-4 group hover:bg-white/75 transition-all duration-200 cursor-pointer">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_0_16px_rgba(251,191,36,0.3)] shrink-0 group-hover:scale-105 transition-transform duration-200">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Balanço Semanal</p>
              <p className="text-sm font-bold text-arc-dark">Metas Atingidas 🔥</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
