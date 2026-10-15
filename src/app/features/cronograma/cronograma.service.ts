import { Injectable, inject } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { Dia, DiaSemana } from '../../shared/models/dia.model';
import { Item } from '../../shared/models/item.model';
import { Semana } from '../../shared/models/semana.model';
import { isoParaData } from '../../shared/utils/data';

export interface DiaAgenda extends Dia {
  /** Data real do dia, derivada do período da semana e do `dia_semana`; null se não der para inferir. */
  data: Date | null;
  itens: Item[];
}

export interface SemanaAgenda extends Semana {
  inicio: Date;
  fim: Date;
  bloco: { titulo: string; cor: string | null };
  dias: DiaAgenda[];
}

export interface Cronograma {
  /** Semanas com período definido, em ordem cronológica. */
  semanas: SemanaAgenda[];
  /** Semanas do concurso sem período definido (ficam fora do calendário). */
  semPeriodo: number;
}

interface SemanaBruta extends Semana {
  blocos: { titulo: string; cor: string | null };
  dias: (Dia & { itens: (Omit<Item, 'concluido'> & { progresso: { concluido: boolean }[] | null })[] })[];
}

/** `Date.getDay()` (0 = domingo) para cada valor de `dia_semana`. */
const DIA_PARA_GETDAY: Record<DiaSemana, number> = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6 };

@Injectable({ providedIn: 'root' })
export class CronogramaService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  async carregar(concursoId: string): Promise<Cronograma> {
    const usuarioId = this.auth.user()?.id;
    if (!usuarioId) throw new Error('Sua sessão expirou. Entre novamente.');

    const { data, error } = await this.supabase.client
      .from('semanas')
      .select('*, blocos!inner(titulo, cor, concurso_id), dias(*, itens(*, progresso(concluido)))')
      .eq('blocos.concurso_id', concursoId)
      // Só as linhas embutidas de progresso do usuário (sem !inner, não remove itens).
      .eq('dias.itens.progresso.user_id', usuarioId)
      .order('ordem', { ascending: true })
      .order('ordem', { referencedTable: 'dias', ascending: true })
      .order('ordem', { referencedTable: 'dias.itens', ascending: true })
      .returns<SemanaBruta[]>();
    if (error) {
      console.error('Erro ao carregar cronograma', error);
      throw new Error('Não foi possível carregar o cronograma.');
    }

    const brutas = data ?? [];
    const semanas = brutas
      .filter((s) => s.data_inicio && s.data_fim)
      .map<SemanaAgenda>((s) => {
        const inicio = isoParaData(s.data_inicio)!;
        const fim = isoParaData(s.data_fim)!;
        const { blocos, dias, ...semana } = s;
        return {
          ...semana,
          inicio,
          fim,
          bloco: { titulo: blocos.titulo, cor: blocos.cor },
          dias: dias.map((dia) => ({
            ...dia,
            data: this.dataDoDia(dia.dia_semana, inicio, fim),
            itens: dia.itens.map(({ progresso, ...item }) => ({
              ...item,
              concluido: progresso?.[0]?.concluido ?? false,
            })),
          })),
        };
      })
      .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());

    return { semanas, semPeriodo: brutas.length - semanas.length };
  }

  /** Primeiro dia do período cujo dia da semana bate com `dia_semana`. */
  private dataDoDia(diaSemana: DiaSemana | null, inicio: Date, fim: Date): Date | null {
    if (!diaSemana) return null;
    const alvo = DIA_PARA_GETDAY[diaSemana];
    for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === alvo) return new Date(d);
    }
    return null;
  }
}
