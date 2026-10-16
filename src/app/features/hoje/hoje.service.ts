import { Injectable, inject } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { DiaSemana } from '../../shared/models/dia.model';
import { Item } from '../../shared/models/item.model';
import { dataParaIso } from '../../shared/utils/data';

export interface BlocoDoDia {
  semanaLabel: string;
  diaLabel: string;
  bloco: { id: string; titulo: string; cor: string | null };
  itens: Item[];
}

export interface GrupoHoje {
  concurso: { id: string; nome: string };
  blocos: BlocoDoDia[];
}

interface SemanaBruta {
  id: string;
  label: string;
  blocos: {
    id: string;
    titulo: string;
    cor: string | null;
    concursos: { id: string; nome: string };
  };
  dias: {
    id: string;
    label: string;
    dia_semana: DiaSemana | null;
    itens: (Omit<Item, 'concluido'> & { progresso: { concluido: boolean }[] | null })[];
  }[];
}

/** `Date.getDay()` (0 = domingo) → valor de `dia_semana`. */
const GETDAY_PARA_DIA: DiaSemana[] = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'];

/** O que estudar hoje, somando todos os concursos ativos do usuário. */
@Injectable({ providedIn: 'root' })
export class HojeService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  async carregar(): Promise<GrupoHoje[]> {
    const usuarioId = this.auth.user()?.id;
    if (!usuarioId) throw new Error('Sua sessão expirou. Entre novamente.');

    const hoje = new Date();
    const hojeIso = dataParaIso(hoje)!;
    const diaDeHoje = GETDAY_PARA_DIA[hoje.getDay()];

    const { data, error } = await this.supabase.client
      .from('semanas')
      .select(
        'id, label, blocos!inner(id, titulo, cor, concursos!inner(id, nome)), dias(id, label, dia_semana, ordem, itens(*, progresso(concluido)))',
      )
      .lte('data_inicio', hojeIso)
      .gte('data_fim', hojeIso)
      .eq('blocos.concursos.user_id', usuarioId)
      .eq('blocos.concursos.ativo', true)
      // Só as linhas embutidas de progresso do usuário (sem !inner, não remove itens).
      .eq('dias.itens.progresso.user_id', usuarioId)
      .order('ordem', { referencedTable: 'dias', ascending: true })
      .order('ordem', { referencedTable: 'dias.itens', ascending: true })
      .returns<SemanaBruta[]>();
    if (error) {
      console.error('Erro ao carregar o dia de hoje', error);
      throw new Error('Não foi possível carregar os estudos de hoje.');
    }

    const grupos = new Map<string, GrupoHoje>();
    for (const semana of data ?? []) {
      const { blocos } = semana;
      for (const dia of semana.dias.filter((d) => d.dia_semana === diaDeHoje && d.itens.length > 0)) {
        const grupo = grupos.get(blocos.concursos.id) ?? { concurso: blocos.concursos, blocos: [] };
        grupo.blocos.push({
          semanaLabel: semana.label,
          diaLabel: dia.label,
          bloco: { id: blocos.id, titulo: blocos.titulo, cor: blocos.cor },
          itens: dia.itens.map(({ progresso, ...item }) => ({
            ...item,
            concluido: progresso?.[0]?.concluido ?? false,
          })),
        });
        grupos.set(blocos.concursos.id, grupo);
      }
    }
    return [...grupos.values()];
  }
}
