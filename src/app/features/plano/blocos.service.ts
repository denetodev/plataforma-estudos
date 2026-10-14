import { Injectable, inject } from '@angular/core';

import { SupabaseService } from '../../core/supabase/supabase.service';
import { Bloco, BlocoDados, BlocoResumo } from '../../shared/models/bloco.model';

interface LinhaProgressoBloco {
  bloco_id: string;
  total_itens: number;
  itens_concluidos: number;
}

@Injectable({ providedIn: 'root' })
export class BlocosService {
  private readonly supabase = inject(SupabaseService);

  /** Blocos do concurso, em ordem, com o progresso de cada um. */
  async listar(concursoId: string): Promise<BlocoResumo[]> {
    const { data, error } = await this.supabase.client
      .from('blocos')
      .select('*')
      .eq('concurso_id', concursoId)
      .order('ordem', { ascending: true })
      .returns<Bloco[]>();
    if (error) throw this.erro('Não foi possível carregar os blocos.', error);

    const blocos = data ?? [];
    if (blocos.length === 0) return [];

    // A view só traz blocos que já têm itens; os demais ficam com 0%.
    const { data: linhas, error: erroProgresso } = await this.supabase.client
      .from('view_progresso_blocos')
      .select('bloco_id, total_itens, itens_concluidos')
      .eq('concurso_id', concursoId)
      .returns<LinhaProgressoBloco[]>();
    if (erroProgresso) throw this.erro('Não foi possível carregar o progresso.', erroProgresso);

    const porBloco = new Map((linhas ?? []).map((l) => [l.bloco_id, l]));
    return blocos.map((bloco) => {
      const total = Number(porBloco.get(bloco.id)?.total_itens ?? 0);
      const concluidos = Number(porBloco.get(bloco.id)?.itens_concluidos ?? 0);
      return {
        ...bloco,
        total_itens: total,
        itens_concluidos: concluidos,
        percentual: total > 0 ? Math.round((concluidos / total) * 100) : 0,
      };
    });
  }

  async obter(id: string): Promise<Bloco> {
    const { data, error } = await this.supabase.client
      .from('blocos')
      .select('*')
      .eq('id', id)
      .maybeSingle<Bloco>();
    if (error) throw this.erro('Não foi possível carregar o bloco.', error);
    if (!data) throw new Error('Bloco não encontrado.');
    return data;
  }

  async criar(concursoId: string, dados: BlocoDados): Promise<Bloco> {
    const { data: ultimo, error: erroOrdem } = await this.supabase.client
      .from('blocos')
      .select('ordem')
      .eq('concurso_id', concursoId)
      .order('ordem', { ascending: false })
      .limit(1)
      .maybeSingle<{ ordem: number }>();
    if (erroOrdem) throw this.erro('Não foi possível criar o bloco.', erroOrdem);

    const { data, error } = await this.supabase.client
      .from('blocos')
      .insert({ ...dados, concurso_id: concursoId, ordem: (ultimo?.ordem ?? 0) + 1 })
      .select()
      .single<Bloco>();
    if (error) throw this.erro('Não foi possível criar o bloco.', error);
    return data;
  }

  async atualizar(id: string, dados: BlocoDados): Promise<Bloco> {
    const { data, error } = await this.supabase.client
      .from('blocos')
      .update(dados)
      .eq('id', id)
      .select()
      .single<Bloco>();
    if (error) throw this.erro('Não foi possível salvar o bloco.', error);
    return data;
  }

  async excluir(id: string): Promise<void> {
    const { error } = await this.supabase.client.from('blocos').delete().eq('id', id);
    if (error) throw this.erro('Não foi possível excluir o bloco.', error);
  }

  private erro(mensagem: string, causa: unknown): Error {
    console.error(mensagem, causa);
    return new Error(mensagem);
  }
}
