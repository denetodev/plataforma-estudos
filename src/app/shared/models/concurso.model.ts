export const NIVEIS_CONCURSO = ['Fundamental', 'Médio', 'Técnico', 'Superior'] as const;
export type NivelConcurso = (typeof NIVEIS_CONCURSO)[number];

export interface Concurso {
  id: string;
  user_id: string;
  nome: string;
  orgao: string | null;
  cargo: string | null;
  nivel: string | null;
  /** Data no formato ISO `YYYY-MM-DD`; null enquanto não divulgada. */
  data_prova: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

/** Campos editáveis de um concurso (criação e edição). */
export type ConcursoDados = Pick<
  Concurso,
  'nome' | 'orgao' | 'cargo' | 'nivel' | 'data_prova' | 'ativo'
>;

export interface ConcursoResumo extends Concurso {
  total_blocos: number;
  total_itens: number;
  itens_concluidos: number;
  /** 0–100 */
  percentual: number;
}
