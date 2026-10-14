import { DiaComItens } from './dia.model';

export interface Semana {
  id: string;
  bloco_id: string;
  ordem: number;
  label: string;
  created_at: string;
}

export type SemanaDados = Pick<Semana, 'label'>;

export interface SemanaCompleta extends Semana {
  dias: DiaComItens[];
}
