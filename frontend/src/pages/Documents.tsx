import React from 'react';
import { 
  FileText, 
  Plus, 
  ArrowUpRight, 
  Send,
  Clock,
  CheckCircle2,
  MoreVertical,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { cn } from '../utils/cn';
import { useEventos } from '../hooks/useEventos';
import type { Documento } from '../types/database';

interface DocumentoComEvento extends Documento {
  eventos?: { nome: string } | null;
}

export const Documents: React.FC = () => {
  const { searchTerm } = useEventos();
  const [docs, setDocs] = React.useState<DocumentoComEvento[]>([]);
  const [stats, setStats] = React.useState([
    { label: 'Total Enviado', value: '0', icon: FileText, gradient: 'from-violet-400 to-indigo-500', glow: 'shadow-glow-purple' },
    { label: 'Pendentes', value: '0', icon: Clock, gradient: 'from-amber-400 to-orange-500', glow: 'shadow-[0_0_16px_rgba(251,191,36,0.25)]' },
    { label: 'Concluídos', value: '0', icon: CheckCircle2, gradient: 'from-emerald-400 to-teal-500', glow: 'shadow-[0_0_16px_rgba(52,211,153,0.25)]' },
  ]);

  const fetchDocs = React.useCallback(async () => {
    const { data, error } = await supabase
      .from('documentos')
      .select(`
        *,
        eventos (nome)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setDocs(data);
      const total = data.length;
      const pendentes = data.filter(d => d.status === 'pendente').length;
      const concluidos = data.filter(d => d.status === 'concluido' || d.status === 'enviado').length;

      setStats(prev => [
        { ...prev[0], value: total.toString() },
        { ...prev[1], value: pendentes.toString().padStart(2, '0') },
        { ...prev[2], value: concluidos.toString() },
      ]);
    }
    if (error) console.error('Error fetching docs:', error);
  }, []);

  React.useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const filteredDocs = React.useMemo(() => {
    if (!searchTerm.trim()) return docs;
    const term = searchTerm.toLowerCase();
    
    return docs.filter(doc => {
      const searchString = [
        doc.tipo,
        doc.numero,
        doc.id,
        doc.status,
        doc.destino,
        doc.eventos?.nome
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchString.includes(term);
    });
  }, [docs, searchTerm]);
  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-violet-500" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Documentos</p>
          </div>
          <h2 className="font-display text-4xl font-bold text-arc-dark tracking-tight">Gestão de Documentos</h2>
          <p className="text-sm font-medium text-slate-500 mt-0.5">Acompanhe o trâmite de CIs, Ofícios e Memorandos vinculados aos eventos.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-glow-purple hover:-translate-y-0.5 transition-all duration-200 group">
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" /> Registrar Documento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="glass-card p-5 rounded-2xl flex items-center gap-4 hover:-translate-y-0.5 transition-all duration-200 group">
            <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg", stat.gradient, stat.glow)}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="font-display text-3xl font-extrabold text-arc-dark leading-tight">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/50 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <h3 className="font-display font-semibold text-sm text-arc-dark">Últimos Documentos
              {searchTerm && (
                <span className="text-[10px] font-bold text-violet-500 bg-violet-50 px-2.5 py-1 rounded-lg animate-fade-in">
                  Filtrado: "{searchTerm}"
                </span>
              )}
              </h3>
           </div>
           <button
             onClick={() => fetchDocs()}
             className="p-2 text-slate-400 hover:bg-white/60 hover:text-slate-600 rounded-xl transition-all duration-200"
             title="Recarregar"
           >
              <RotateCcw className="w-4 h-4" />
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/[0.06] text-[11px] uppercase font-extrabold text-slate-600 tracking-widest bg-white/40">
                <th className="px-6 py-4">Documento</th>
                <th className="px-6 py-4">Data Registro</th>
                <th className="px-6 py-4">Evento Vinculado</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {filteredDocs.length > 0 ? filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-white/40 transition-colors duration-200 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center text-[9px] font-bold text-violet-600 border border-violet-100/60 shrink-0 group-hover:from-violet-200 group-hover:to-indigo-200 transition-all duration-200">
                        {doc.tipo || 'DOC'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-arc-dark">Nº {doc.numero || 'S/N'}</p>
                        <p className="text-[10px] text-slate-500 font-bold mt-0.5 uppercase">Destino: {doc.destino || '---'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString('pt-BR') : '---'}
                  </td>
                  <td className="px-6 py-4">
                    <Link to={doc.evento_id ? `/gestao/eventos/${doc.evento_id}` : '#'} className="flex items-center gap-1.5 text-xs text-arc-dark font-medium cursor-pointer group/link hover:text-violet-600 transition-colors duration-200">
                      {doc.eventos?.nome || 'Sem Evento'}
                      <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover/link:text-violet-500 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all duration-200" />
                    </Link>
                  </td>
                  <td className={cn(
                    "px-6 py-4 text-xs font-bold"
                  )}>
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg uppercase tracking-wide border shadow-sm",
                      (doc.status === 'enviado' || doc.status === 'concluido')
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : doc.status === 'pendente'
                        ? "bg-amber-50 border-amber-100 text-amber-700"
                        : "bg-violet-50 border-violet-100 text-violet-700"
                    )}>
                      {(doc.status === 'enviado' || doc.status === 'concluido') ? <CheckCircle2 className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                      {doc.status || 'pendente'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button className="p-1.5 text-slate-300 hover:text-slate-500 hover:bg-white/70 rounded-lg transition-all duration-200">
                       <MoreVertical className="w-4 h-4" />
                     </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <FileText className="w-8 h-8" />
                      <p className="text-sm font-bold">Nenhum documento encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
