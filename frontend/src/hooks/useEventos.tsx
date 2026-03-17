import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import type { Evento } from '../types/database';

interface EventosContextType {
  events: Evento[];
  filteredEvents: Evento[];
  loading: boolean;
  error: string | null;
  refreshEvents: () => Promise<void>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const EventosContext = createContext<EventosContextType | undefined>(undefined);

export const EventosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('eventos')
        .select(`
          *,
          logistica (*),
          materiais (*),
          documentos (*)
        `)
        .order('data', { ascending: false });
      
      if (error) throw error;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eventosNorm = (data as any[] || []).map(e => ({
        ...e,
        logistica: e.logistica ? (Array.isArray(e.logistica) ? e.logistica : [e.logistica]) : [],
        materiais: e.materiais ? (Array.isArray(e.materiais) ? e.materiais : [e.materiais]) : [],
      }));
      setEvents(eventosNorm as Evento[]);
    } catch (err: unknown) {
      console.error('[EventosContext] Erro ao buscar eventos:', err);
      // @ts-expect-error - err is unknown
      setError(err?.message || 'Falha ao buscar eventos');
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredEvents = React.useMemo(() => {
    if (!searchTerm.trim()) return events;
    
    const term = searchTerm.toLowerCase();
    return events.filter(e => {
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
  }, [events, searchTerm]);

  useEffect(() => {
    fetchEvents();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'eventos',
        },
        () => {
          console.log('[Realtime] Mudança detectada em eventos, atualizando...');
          fetchEvents();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'logistica' },
        () => fetchEvents()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'materiais' },
        () => fetchEvents()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'documentos' },
        () => fetchEvents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEvents]);

  return (
    <EventosContext.Provider value={{ 
      events, 
      filteredEvents,
      loading, 
      error, 
      refreshEvents: fetchEvents,
      searchTerm,
      setSearchTerm
    }}>
      {children}
    </EventosContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useEventos = () => {
  const context = useContext(EventosContext);
  if (context === undefined) {
    throw new Error('useEventos deve ser usado dentro de um EventosProvider');
  }
  return context;
};
