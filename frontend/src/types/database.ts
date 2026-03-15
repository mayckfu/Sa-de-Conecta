export type SituacaoEvento = 'planejado' | 'confirmado' | 'cancelado';
export type UserRole = 'admin' | 'cadastrador' | 'visitante';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface Logistica {
  id: string;
  evento_id: string;
  tem_coffee_break: boolean;
  quantidade_pessoas: number;
  cafe: boolean;
  agua: boolean;
  suco: boolean;
  bolo: boolean;
  salgados: boolean;
  frutas: boolean;
  biscoitos: boolean;
  observacoes: string | null;
  detalhes: any; // jsonb
}

export interface Material {
  id: string;
  evento_id: string;
  projetor: boolean;
  microfone: boolean;
  caixa_som: boolean;
  banner: boolean;
  tenda: boolean;
  mesas: boolean;
  cadeiras: boolean;
  detalhes: any; // jsonb
}

export interface Documento {
  id: string;
  evento_id: string | null;
  tipo: string | null;
  numero: string | null;
  data_envio: string | null;
  destino: string | null;
  status: string | null;
  file_path: string | null;
  nome: string | null;
  drive_file_id: string | null;
  url: string | null;
  created_at: string;
}

export interface Evento {
  id: string;
  nome: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  local: string | null;
  unidade_responsavel: string | null;
  tipo: string | null;
  responsavel: string | null;
  participantes_previstos: number | null;
  situacao: SituacaoEvento;
  observacoes: string | null;
  comentario: string | null;
  motivo_cancelamento: string | null;
  created_at: string;
  
  // Relações que o Supabase retorna no JOIN
  logistica?: Logistica[];
  materiais?: Material[];
  documentos?: Documento[];
}

export interface LogEvento {
  id: string;
  evento_id: string;
  acao: string;
  detalhes: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  nome: string | null;
  role: UserRole;
  status: UserStatus;
  is_admin: boolean;
  updated_at: string | null;
}
