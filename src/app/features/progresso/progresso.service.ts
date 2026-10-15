import { Injectable, inject } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { dataParaIso } from '../../shared/utils/data';

export interface ResumoBloco {
  id: string;
  titulo: string;
  cor: string | null;
  total: number;
  concluidos: number;
  minutosTotal: number;
  minutosConcluidos: number;
  /** 0–100 */
  percentual: number;
}

export interface EstudoDoDia {
  data: Date;
  quantidade: number;
}

export interface DashboardProgresso {
  blocos: ResumoBloco[];
  total: number;
  concluidos: number;
  minutosTotal: number;
  minutosConcluidos: number;
  percentual: number;
  /** Itens concluídos por dia nos últimos 14 dias (do mais antigo ao de hoje). */
  ultimosDias: EstudoDoDia[];
  /** Quantos dias distintos tiveram ao menos um item concluído. */
  diasComEstudo: number;
}

interface BlocoBruto {
  id: string;
  titulo: string;
  cor: string | null;
  semanas: {
    dias: {
      itens: {
        duracao_min: number | null;
        progresso: { concluido: boolean; concluido_em: string | null }[] | null;
      }[];
    }[];
  }[];
}

const DIAS_GRAFICO = 14;

@Injectable({ providedIn: 'root' })
export class ProgressoService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  async carregar(concursoId: string): Promise<DashboardProgresso> {
    const usuarioId = this.auth.user()?.id;
    if (!usuarioId) throw new Error('Sua sessão expirou. Entre novamente.');

    const { data, error } = await this.supabase.client
      .from('blocos')
      .select('id, titulo, cor, semanas(dias(itens(duracao_min, progresso(concluido, concluido_em))))')
      .eq('concurso_id', concursoId)
      // Filtra só as linhas embutidas de progresso do usuário (sem !inner).
      .eq('semanas.dias.itens.progresso.user_id', usuarioId)
      .order('ordem', { ascending: true })
      .returns<BlocoBruto[]>();
    if (error) {
      console.error('Erro ao carregar progresso', error);
      throw new Error('Não foi possível carregar o progresso.');
    }
    return this.agregar(data ?? []);
  }

  private agregar(brutos: BlocoBruto[]): DashboardProgresso {
    const porDia = new Map<string, number>();

    const blocos = brutos.map<ResumoBloco>((bloco) => {
      let total = 0;
      let concluidos = 0;
      let minutosTotal = 0;
      let minutosConcluidos = 0;

      for (const semana of bloco.semanas) {
        for (const dia of semana.dias) {
          for (const item of dia.itens) {
            const minutos = item.duracao_min ?? 0;
            const progresso = item.progresso?.[0];
            total++;
            minutosTotal += minutos;
            if (progresso?.concluido) {
              concluidos++;
              minutosConcluidos += minutos;
              if (progresso.concluido_em) {
                const chave = dataParaIso(new Date(progresso.concluido_em));
                if (chave) porDia.set(chave, (porDia.get(chave) ?? 0) + 1);
              }
            }
          }
        }
      }

      return {
        id: bloco.id,
        titulo: bloco.titulo,
        cor: bloco.cor,
        total,
        concluidos,
        minutosTotal,
        minutosConcluidos,
        percentual: total > 0 ? Math.round((concluidos / total) * 100) : 0,
      };
    });

    const soma = (campo: keyof Pick<ResumoBloco, 'total' | 'concluidos' | 'minutosTotal' | 'minutosConcluidos'>) =>
      blocos.reduce((s, b) => s + b[campo], 0);
    const total = soma('total');
    const concluidos = soma('concluidos');

    return {
      blocos,
      total,
      concluidos,
      minutosTotal: soma('minutosTotal'),
      minutosConcluidos: soma('minutosConcluidos'),
      percentual: total > 0 ? Math.round((concluidos / total) * 100) : 0,
      ultimosDias: this.ultimosDias(porDia),
      diasComEstudo: porDia.size,
    };
  }

  private ultimosDias(porDia: Map<string, number>): EstudoDoDia[] {
    const hoje = new Date();
    return Array.from({ length: DIAS_GRAFICO }, (_, i) => {
      const data = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - (DIAS_GRAFICO - 1 - i));
      return { data, quantidade: porDia.get(dataParaIso(data) ?? '') ?? 0 };
    });
  }
}
