export const CORES_BLOCO = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#3b82f6',
] as const;

export interface Bloco {
  id: string;
  concurso_id: string;
  ordem: number;
  titulo: string;
  cor: string | null;
  /** ISO `YYYY-MM-DD` */
  data_inicio: string | null;
  data_fim: string | null;
  created_at: string;
}

export type BlocoDados = Pick<Bloco, 'titulo' | 'cor' | 'data_inicio' | 'data_fim'>;

export interface BlocoResumo extends Bloco {
  total_itens: number;
  itens_concluidos: number;
  /** 0–100 */
  percentual: number;
}
