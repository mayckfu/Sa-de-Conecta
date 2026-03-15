export interface Logistica {
  temCoffeeBreak: boolean;
  quantidadePessoas?: number;
  cafe?: boolean;
  agua?: boolean;
  suco?: boolean;
  bolo?: boolean;
  salgados?: boolean;
  frutas?: boolean;
  biscoitos?: boolean;
  observacoes?: string;
}

export interface Materiais {
  projetor: boolean;
  microfone: boolean;
  caixaSom: boolean;
  banner: boolean;
  tenda: boolean;
  mesas: boolean;
  cadeiras: boolean;
}

export interface Documento {
  id: string;
  tipo: 'CI' | 'Ofício' | 'Memorando' | 'Relatório';
  numero: string;
  dataEnvio: string;
  destino: string;
  status: 'pendente' | 'enviado';
}

export interface Evento {
  id: string;
  nome: string;
  data: string;
  horaInicio: string;
  horaFim: string; // New
  local: string;
  unidadeResponsavel: string;
  tipo: 'reunião' | 'campanha' | 'capacitação' | 'ação de saúde' | 'outro';
  responsavel: string;
  participantesPrevistos: number;
  situacao: 'planejado' | 'confirmado' | 'realizado' | 'cancelado';
  observacoes: string;
  comentario?: string; // New for UI callouts
  logistica: Logistica;
  materiais: Materiais;
  documentos: Documento[];
}

export const MOCK_EVENTOS: Evento[] = [];
