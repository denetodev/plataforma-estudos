import { DiaComItens } from './dia.model';

export interface Semana {
  id: string;
  bloco_id: string;
  ordem: number;
  label: string;
  /** ISO `YYYY-MM-DD` */
  data_inicio: string | null;
  data_fim: string | null;
  created_at: string;
}

export type SemanaDados = Pick<Semana, 'label' | 'data_inicio' | 'data_fim'>;

export interface SemanaCompleta extends Semana {
  dias: DiaComItens[];
}
