import { Item } from './item.model';

export const DIAS_SEMANA = [
  { valor: 'seg', rotulo: 'Segunda' },
  { valor: 'ter', rotulo: 'Terça' },
  { valor: 'qua', rotulo: 'Quarta' },
  { valor: 'qui', rotulo: 'Quinta' },
  { valor: 'sex', rotulo: 'Sexta' },
  { valor: 'sab', rotulo: 'Sábado' },
  { valor: 'dom', rotulo: 'Domingo' },
] as const;

export type DiaSemana = (typeof DIAS_SEMANA)[number]['valor'];

export interface Dia {
  id: string;
  semana_id: string;
  ordem: number;
  label: string;
  dia_semana: DiaSemana | null;
  created_at: string;
}

export type DiaDados = Pick<Dia, 'label' | 'dia_semana'>;

export interface DiaComItens extends Dia {
  itens: Item[];
}
