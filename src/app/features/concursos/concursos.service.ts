import { Injectable, inject } from '@angular/core';

import { AuthService } from '../../core/auth/auth.service';
import { SupabaseService } from '../../core/supabase/supabase.service';
import { Concurso, ConcursoDados, ConcursoResumo } from '../../shared/models/concurso.model';

interface LinhaProgressoBloco {
  concurso_id: string;
  total_itens: number;
  itens_concluidos: number;
}

@Injectable({ providedIn: 'root' })
export class ConcursosService {
  private readonly supabase = inject(SupabaseService);
  private readonly auth = inject(AuthService);

  /** Concursos do usuário logado (inclusive para admin) com progresso agregado. */
  async listar(): Promise<ConcursoResumo[]> {
    const { data, error } = await this.supabase.client
      .from('concursos')
      .select('*')
      .eq('user_id', this.usuarioId())
      .order('created_at', { ascending: false })
      .returns<Concurso[]>();
    if (error) throw this.erro('Não foi possível carregar os concursos.', error);

    const concursos = data ?? [];
    if (concursos.length === 0) return [];

    const { data: linhas, error: erroProgresso } = await this.supabase.client
      .from('view_progresso_blocos')
      .select('concurso_id, total_itens, itens_concluidos')
      .in(
        'concurso_id',
        concursos.map((c) => c.id),
      )
      .returns<LinhaProgressoBloco[]>();
    if (erroProgresso) throw this.erro('Não foi possível carregar o progresso.', erroProgresso);

    return concursos.map((c) => this.comResumo(c, (linhas ?? []).filter((l) => l.concurso_id === c.id)));
  }

  async obter(id: string): Promise<Concurso> {
    const { data, error } = await this.supabase.client
      .from('concursos')
      .select('*')
      .eq('id', id)
      .maybeSingle<Concurso>();
    if (error) throw this.erro('Não foi possível carregar o concurso.', error);
    if (!data) throw new Error('Concurso não encontrado.');
    return data;
  }

  async criar(dados: ConcursoDados): Promise<Concurso> {
    const { data, error } = await this.supabase.client
      .from('concursos')
      .insert({ ...dados, user_id: this.usuarioId() })
      .select()
      .single<Concurso>();
    if (error) throw this.erro('Não foi possível criar o concurso.', error);
    return data;
  }

  async atualizar(id: string, dados: ConcursoDados): Promise<Concurso> {
    const { data, error } = await this.supabase.client
      .from('concursos')
      .update({ ...dados, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single<Concurso>();
    if (error) throw this.erro('Não foi possível salvar o concurso.', error);
    return data;
  }

  async excluir(id: string): Promise<void> {
    const { error } = await this.supabase.client.from('concursos').delete().eq('id', id);
    if (error) throw this.erro('Não foi possível excluir o concurso.', error);
  }

  private comResumo(concurso: Concurso, linhas: LinhaProgressoBloco[]): ConcursoResumo {
    const total = linhas.reduce((soma, l) => soma + Number(l.total_itens), 0);
    const concluidos = linhas.reduce((soma, l) => soma + Number(l.itens_concluidos), 0);
    return {
      ...concurso,
      total_blocos: linhas.length,
      total_itens: total,
      itens_concluidos: concluidos,
      percentual: total > 0 ? Math.round((concluidos / total) * 100) : 0,
    };
  }

  private usuarioId(): string {
    const id = this.auth.user()?.id;
    if (!id) throw new Error('Sua sessão expirou. Entre novamente.');
    return id;
  }

  private erro(mensagem: string, causa: unknown): Error {
    console.error(mensagem, causa);
    return new Error(mensagem);
  }
}
