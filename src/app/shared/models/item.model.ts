export const TIPOS_ITEM = [
  { valor: 'leitura', rotulo: 'Leitura', icone: 'menu_book' },
  { valor: 'revisao', rotulo: 'Revisão', icone: 'replay' },
  { valor: 'questoes', rotulo: 'Questões', icone: 'quiz' },
  { valor: 'lei', rotulo: 'Lei seca', icone: 'gavel' },
  { valor: 'video', rotulo: 'Videoaula', icone: 'smart_display' },
  { valor: 'redacao', rotulo: 'Redação', icone: 'edit_note' },
  { valor: 'exercicio', rotulo: 'Exercício', icone: 'fitness_center' },
] as const;

export type TipoItem = (typeof TIPOS_ITEM)[number]['valor'];

export interface Item {
  id: string;
  dia_id: string;
  ordem: number;
  descricao: string;
  tipo: TipoItem | null;
  duracao_min: number | null;
  fonte: string | null;
  paginas: string | null;
  tags: string[] | null;
  created_at: string;
  /** Progresso do usuário logado (preenchido ao carregar o plano). */
  concluido?: boolean;
}

export type ItemDados = Pick<Item, 'descricao' | 'tipo' | 'duracao_min' | 'fonte' | 'paginas' | 'tags'>;
