import { z } from 'zod';

export const eventoSchema = z.object({
  nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  data: z.string().min(1, 'A data é obrigatória'),
  hora: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Hora inicial inválida (HH:MM)'),
  horaFim: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Hora final inválida (HH:MM)'),
  local: z.string().min(3, 'O local deve ter no mínimo 3 caracteres'),
  unidade: z.string().min(2, 'A unidade responsável é obrigatória'),
  tipo: z.string().default('reunião'),
  responsavel: z.string().min(3, 'O nome do responsável é obrigatório'),
  participantes: z.coerce.number().min(1, 'Deve haver ao menos 1 participante previsto'),
  situacao: z.enum(['planejado', 'confirmado', 'cancelado']).default('planejado'),
  
  // Logística
  temCoffee: z.boolean().default(false),
  coffee: z.object({
    cafe: z.boolean(),
    agua: z.boolean(),
    suco: z.boolean(),
    bolo: z.boolean(),
    salgados: z.boolean(),
    frutas: z.boolean(),
    biscoitos: z.boolean(),
    obs: z.string().optional()
  }).default({
    cafe: false, agua: false, suco: false, bolo: false,
    salgados: false, frutas: false, biscoitos: false, obs: ''
  }),
  detalhesCoffee: z.record(z.string(), z.string()).default({}),

  // Materiais
  materiais: z.object({
    projetor: z.boolean().default(false),
    microfone: z.boolean().default(false),
    caixa_som: z.boolean().default(false),
    banner: z.boolean().default(false),
    tenda: z.boolean().default(false),
    mesas: z.boolean().default(false),
    cadeiras: z.boolean().default(false),
    notebook: z.boolean().default(false),
    logistica: z.boolean().default(false),
    cafe: z.boolean().default(false),
    descartaveis_gerais: z.boolean().default(false),
  }).default({
    projetor: false, microfone: false, caixa_som: false,
    banner: false, tenda: false, mesas: false, cadeiras: false,
    notebook: false, logistica: false, cafe: false, descartaveis_gerais: false
  }),
  detalhesMateriais: z.record(z.string(), z.string()).default({})
});

export type EventoFormData = z.infer<typeof eventoSchema>;
