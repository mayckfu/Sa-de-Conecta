import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Building2, 
  UserCircle,
  Coffee,
  CheckCircle2,
  FileText,
  AlertCircle,
  Tag,
  Monitor,
  Mic2,
  Volume2,
  Flag,
  Warehouse,
  Layout
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { cn } from '../utils/cn';
import { useAuth } from '../hooks/useAuth';
import { useEventos } from '../hooks/useEventos';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { refreshEvents } = useEventos();
  const [evento, setEvento] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleUpdateStatus = async (novoStatus: string) => {
    if (!id || !evento) return;
    setIsUpdating(true);
    
    const { error } = await supabase
      .from('eventos')
      .update({ situacao: novoStatus })
      .eq('id', id);

    if (!error) {
      // Gravar log da alteração de status
      await supabase.from('logs_eventos').insert([{
        evento_id: id,
        acao: 'atualizacao_status',
        detalhes: `Status alterado para ${novoStatus}`
      }]);
      
      const novoLog = {
        id: crypto.randomUUID(),
        evento_id: id,
        acao: 'atualizacao_status',
        detalhes: `Status alterado para ${novoStatus}`,
        created_at: new Date().toISOString()
      };

      setEvento({ ...evento, situacao: novoStatus, logs_eventos: [...(evento.logs_eventos || []), novoLog] });
      await refreshEvents();
    } else {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar o evento.');
    }
    setIsUpdating(false);
  };

  React.useEffect(() => {
    const fetchEvento = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from('eventos')
        .select(`
          *,
          logistica (*),
          materiais (*),
          documentos (*),
          logs_eventos (*)
        `)
        .eq('id', id)
        .single();

      if (data) {
        // Normalizar: Supabase retorna objeto (não array) quando há UNIQUE constraint em evento_id
        const normalized = {
          ...data,
          logistica: data.logistica
            ? Array.isArray(data.logistica) ? data.logistica : [data.logistica]
            : [],
          materiais: data.materiais
            ? Array.isArray(data.materiais) ? data.materiais : [data.materiais]
            : [],
        };
        setEvento(normalized);
      }
      setLoading(false);
      if (error) console.error('Error fetching event details:', error);
    };

    fetchEvento();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] gap-5">
        <div className="w-16 h-16 glass-card rounded-2xl flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-slate-300" />
        </div>
        <h2 className="font-display text-2xl font-bold text-arc-dark">Evento não encontrado</h2>
        <button
          onClick={() => navigate('/gestao/eventos')}
          className="px-6 py-2.5 bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-glow-purple hover:-translate-y-0.5 transition-all duration-200"
        >
          Voltar para agenda
        </button>
      </div>
    );
  }

  const infoItems = [
    { icon: MapPin, label: 'Localização', value: evento.local, col: 1 },
    { icon: Users, label: 'Participantes', value: `${evento.participantes_previstos || '--'} pessoas previstas`, col: 1 },
    { icon: UserCircle, label: 'Responsável', value: evento.responsavel || 'Não informado', col: 1 },
    { icon: Calendar, label: 'Data do Evento', value: evento.data ? evento.data.split('-').reverse().join('/') : '---', col: 2 },
    { icon: Clock, label: 'Horário', value: `${evento.hora_inicio || '--'} - ${evento.hora_fim || '--'}`, col: 2 },
    { icon: Building2, label: 'Unidade Responsável', value: evento.unidade_responsavel || 'Não informado', col: 2 },
  ];

  return (
    <div className="space-y-7 animate-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 hover:bg-white/70 rounded-xl border border-white/60 transition-all duration-200 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-3xl font-bold text-arc-dark leading-tight">{evento.nome}</h2>
              <span className={cn(
                "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                evento.situacao === 'confirmado' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                evento.situacao === 'cancelado' ? "bg-red-50 text-red-600 border border-red-100" :
                "bg-violet-50 text-violet-700 border border-violet-100"
              )}>
                {evento.situacao}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-bold mt-0.5">{evento.tipo}</p>
          </div>
        </div>
        {profile?.role !== 'visitante' && (
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => navigate(`/gestao/editar-evento/${id}`)}
              className="px-5 py-2.5 glass-card rounded-xl text-sm font-medium text-slate-600 hover:bg-white/80 transition-all duration-200"
            >
              Editar Registro
            </button>
            <button
              onClick={() => handleUpdateStatus('confirmado')}
              disabled={isUpdating || evento.situacao === 'confirmado'}
              className="px-5 py-2.5 bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-glow-purple hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:-translate-y-0"
            >
              {isUpdating && evento.situacao !== 'confirmado' ? '...' : 'Confirmar Presenças'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Main Info Card */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(col => (
                <div key={col} className="space-y-5">
                  {infoItems.filter(i => i.col === col).map(item => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm shadow-violet-200">
                        <item.icon className="w-4.5 h-4.5 text-white" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{item.label}</p>
                        <p className="text-sm font-bold text-arc-dark leading-tight">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {(evento.observacoes || evento.comentario) && (
              <div className="px-6 pb-6 border-t border-white/50 pt-5 mt-1">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Observações Técnicas</h4>
                </div>
                {evento.observacoes && <p className="text-sm text-slate-500 leading-relaxed italic">"{evento.observacoes}"</p>}
                {evento.comentario && (
                  <div className="mt-4 p-4 bg-red-50/80 border border-red-100 rounded-xl flex gap-3">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-500 italic">"{evento.comentario}"</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Logistics + Materials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="glass-card p-6 rounded-2xl space-y-5">
              <h3 className="font-display font-bold text-base text-arc-dark flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-glow-amber">
                  <Coffee className="w-4 h-4 text-white" />
                </div>
                Logística
              </h3>
              {evento.logistica && evento.logistica.length > 0 && evento.logistica[0].tem_coffee_break ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Café', status: evento.logistica[0].cafe, detail: evento.logistica[0].detalhes?.cafe },
                      { label: 'Água', status: evento.logistica[0].agua, detail: evento.logistica[0].detalhes?.agua },
                      { label: 'Suco', status: evento.logistica[0].suco, detail: evento.logistica[0].detalhes?.suco },
                      { label: 'Bolo', status: evento.logistica[0].bolo, detail: evento.logistica[0].detalhes?.bolo },
                      { label: 'Salgados', status: evento.logistica[0].salgados, detail: evento.logistica[0].detalhes?.salgados },
                      { label: 'Frutas', status: evento.logistica[0].frutas, detail: evento.logistica[0].detalhes?.frutas },
                      { label: 'Biscoitos', status: evento.logistica[0].biscoitos, detail: evento.logistica[0].detalhes?.biscoitos },
                    ].filter(i => i.status).map(item => (
                      <div key={item.label} className="col-span-1 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {item.label}
                        </div>
                        {item.detail && (
                          <p className="text-[10px] text-slate-500 ml-5 italic leading-tight">{item.detail}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="glass-dark p-4 rounded-xl">
                    <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Total Previsto</p>
                    <p className="font-display text-2xl font-bold text-white mt-0.5">{evento.participantes_previstos || 0} Pessoas</p>
                  </div>
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center opacity-50">
                  <Coffee className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400 italic font-medium">Sem solicitações de coffee break.</p>
                </div>
              )}
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-4">
              <h3 className="font-display font-semibold text-sm text-arc-dark flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-glow-indigo">
                  <Layout className="w-3.5 h-3.5 text-white" />
                </div>
                Materiais
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: 'Projetor', status: evento.materiais?.[0]?.projetor, icon: Monitor, key: 'projetor' },
                  { label: 'Microfone', status: evento.materiais?.[0]?.microfone, icon: Mic2, key: 'microfone' },
                  { label: 'Som', status: evento.materiais?.[0]?.caixa_som, icon: Volume2, key: 'caixa_som' },
                  { label: 'Banner', status: evento.materiais?.[0]?.banner, icon: Flag, key: 'banner' },
                  { label: 'Tenda', status: evento.materiais?.[0]?.tenda, icon: Warehouse, key: 'tenda' },
                  { label: 'Mesas', status: evento.materiais?.[0]?.mesas, icon: Layout, key: 'mesas' },
                  { label: 'Cadeiras', status: evento.materiais?.[0]?.cadeiras, icon: Warehouse, key: 'cadeiras' },
                ].map(item => (
                  <div key={item.label} className={cn(
                    "flex flex-col gap-1.5 py-2.5 px-3.5 rounded-xl border transition-all duration-200",
                    item.status
                      ? "bg-white/60 border-white/80 text-slate-600 shadow-glass-sm"
                      : "border-transparent text-slate-300 opacity-50"
                  )}>
                    <div className="flex items-center gap-3">
                      <item.icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs font-bold">{item.label}</span>
                      {item.status && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto" />}
                    </div>
                    {item.status && evento.materiais?.[0]?.detalhes?.[item.key] && (
                      <p className="text-[10px] text-slate-500 ml-6.5 italic border-l border-violet-100 pl-2 leading-tight">
                        {evento.materiais[0].detalhes[item.key]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Documents */}
          <div className="glass-dark p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 blur-2xl rounded-full -mr-8 -mt-8 pointer-events-none" />
            <h3 className="font-display font-semibold text-sm text-white/90 flex items-center gap-2 mb-5 relative">
              <FileText className="w-4 h-4 text-violet-400" /> Documentação
            </h3>
            {evento.documentos && evento.documentos.length > 0 ? (
              <div className="space-y-3 relative">
                {evento.documentos.map((doc: any) => (
                  <div key={doc.id} className="p-4 bg-white/[0.06] border border-white/[0.08] rounded-xl hover:bg-white/[0.1] hover:border-violet-400/20 transition-all duration-200 cursor-pointer group/doc">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">{doc.tipo}</span>
                      <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-semibold rounded-full border border-emerald-500/20 uppercase tracking-wider">
                        {doc.status}
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-white/90 group-hover/doc:text-violet-300 transition-colors">Nº {doc.numero}</p>
                    <p className="text-[10px] text-white/30 mt-1">Destino: {doc.destino}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center space-y-3 relative">
                <div className="w-10 h-10 bg-white/[0.06] rounded-xl flex items-center justify-center mx-auto border border-white/[0.08]">
                  <FileText className="w-5 h-5 text-white/30" />
                </div>
                <p className="text-white/30 text-xs font-medium">Nenhum documento vinculado.</p>
                {profile?.role !== 'visitante' && (
                  <button className="px-5 py-2 bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-glow-purple hover:-translate-y-0.5 transition-all duration-200">
                    + Vincular
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-5 rounded-2xl space-y-4">
            <h3 className="font-display font-semibold text-sm text-arc-dark">Ações Rápidas</h3>
            <div className="space-y-2.5">
              <button className="w-full py-3 bg-white/60 hover:bg-white/90 text-slate-600 text-xs font-semibold rounded-xl transition-all duration-200 border border-white/80">
                Gerar Relatório (PDF)
              </button>
              <button className="w-full py-3 bg-white/60 hover:bg-white/90 text-slate-600 text-xs font-semibold rounded-xl transition-all duration-200 border border-white/80">
                Enviar Convites
              </button>
              {profile?.role !== 'visitante' && (
                <button
                  onClick={() => handleUpdateStatus('cancelado')}
                  disabled={isUpdating || evento.situacao === 'cancelado'}
                  className="w-full py-3 bg-red-50/80 hover:bg-red-50 text-red-500 text-xs font-semibold rounded-xl transition-all duration-200 border border-red-100/60 disabled:opacity-50"
                >
                  {isUpdating && evento.situacao !== 'cancelado' ? '...' : 'Cancelar Evento'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Event History / Logs */}
      <div className="glass-card rounded-2xl p-6 mt-6 space-y-5">
        <h3 className="font-display font-semibold text-lg text-arc-dark flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center shadow-sm">
            <Clock className="w-4 h-4 text-white" />
          </div>
          Histórico de Logs do Evento
        </h3>
        
        <div className="space-y-6 pl-2 border-l-2 border-slate-200 mt-4 ml-2">
          {/* Sempre mostra a criação baseado no created_at principal */}
          <div className="relative pl-6">
            <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold text-slate-700">Evento Registrado</span>
              <span className="text-[11px] text-slate-500 font-medium">
                Criado na plataforma em {new Date(evento.created_at || new Date()).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
          
          {evento.logs_eventos && evento.logs_eventos.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((log: any) => (
            <div key={log.id} className="relative pl-6 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className={cn(
                "absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4",
                log.acao === 'atualizacao_status' && log.detalhes.includes('Cancelado') ? 'bg-red-500 ring-red-50' :
                log.acao === 'atualizacao_status' && log.detalhes.includes('Confirmado') ? 'bg-indigo-500 ring-indigo-50' :
                'bg-violet-500 ring-violet-50'
              )} />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-slate-700">
                  {log.acao === 'atualizacao_status' ? 'Status Atualizado' : 
                   log.acao === 'edicao' ? 'Evento Editado' : 'Ação Registrada'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">{log.detalhes}</span>
                <span className="text-[9px] text-slate-400 mt-0.5">{new Date(log.created_at).toLocaleString('pt-BR')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
