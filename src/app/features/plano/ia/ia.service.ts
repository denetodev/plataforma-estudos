import { Injectable, inject } from '@angular/core';

import { SupabaseService } from '../../../core/supabase/supabase.service';
import { DiaSemana } from '../../../shared/models/dia.model';
import { TipoItem } from '../../../shared/models/item.model';
import { FUNCAO_GERAR_PLANO } from '../../../shared/config/recursos';
import { mensagemDaFuncao } from '../../../shared/utils/funcoes';

export interface PedidoPlano {
  pedido: string;
  material: string;
  semanas: number;
  horasPorDia: number;
  diasEstudo: DiaSemana[];
}

export interface ItemGerado {
  descricao: string;
  materia: string | null;
  tipo: TipoItem | null;
  duracao_min: number | null;
  fonte: string | null;
  paginas: string | null;
  tags: string[] | null;
}

export interface DiaGerado {
  label: string;
  dia_semana: DiaSemana | null;
  itens: ItemGerado[];
}

export interface SemanaGerada {
  label: string;
  dias: DiaGerado[];
}

export interface PlanoGerado {
  semanas: SemanaGerada[];
}

export interface ResultadoIa {
  plano: PlanoGerado;
  /** Planos que ainda podem ser gerados nas próximas 24h; `null` = sem limite (admin). */
  restantes: number | null;
}

/** Geração de planos com IA pela Edge Function `gerar-plano` (a chave da IA fica só no servidor). */
@Injectable({ providedIn: 'root' })
export class IaService {
  private readonly supabase = inject(SupabaseService);

  async gerarPlano(pedido: PedidoPlano): Promise<ResultadoIa> {
    const { data, error } = await this.supabase.client.functions.invoke<ResultadoIa>(FUNCAO_GERAR_PLANO, {
      body: pedido,
    });
    if (error) throw new Error(await mensagemDaFuncao(error, FUNCAO_GERAR_PLANO));
    if (!data?.plano?.semanas?.length) throw new Error('A IA não retornou um plano. Tente novamente.');
    return data;
  }
}
