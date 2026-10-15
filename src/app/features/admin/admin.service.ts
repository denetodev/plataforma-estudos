import { Injectable, inject } from '@angular/core';

import { SupabaseService } from '../../core/supabase/supabase.service';
import { Concurso } from '../../shared/models/concurso.model';
import { Perfil, PerfilRole } from '../../shared/models/perfil.model';

export interface UsuarioResumo extends Perfil {
  total_concursos: number;
}

export interface ConcursoComDono extends Concurso {
  dono: string;
}

/** Consultas da área admin. A visibilidade total vem do RLS (policies `admin_*`). */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly supabase = inject(SupabaseService);

  async listarUsuarios(): Promise<UsuarioResumo[]> {
    const [perfis, concursos] = await Promise.all([
      this.supabase.client.from('perfis').select('*').order('created_at', { ascending: true }).returns<Perfil[]>(),
      this.supabase.client.from('concursos').select('user_id').returns<{ user_id: string }[]>(),
    ]);
    if (perfis.error) throw this.erro('Não foi possível carregar os usuários.', perfis.error);
    if (concursos.error) throw this.erro('Não foi possível carregar os usuários.', concursos.error);

    const contagem = new Map<string, number>();
    for (const { user_id } of concursos.data ?? []) {
      contagem.set(user_id, (contagem.get(user_id) ?? 0) + 1);
    }
    return (perfis.data ?? []).map((p) => ({ ...p, total_concursos: contagem.get(p.id) ?? 0 }));
  }

  async alterarRole(usuarioId: string, role: PerfilRole): Promise<void> {
    const { error } = await this.supabase.client
      .from('perfis')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', usuarioId);
    if (error) throw this.erro('Não foi possível alterar o papel do usuário.', error);
  }

  async listarConcursos(): Promise<ConcursoComDono[]> {
    const { data, error } = await this.supabase.client
      .from('concursos')
      .select('*, perfis(nome)')
      .order('created_at', { ascending: false })
      .returns<(Concurso & { perfis: { nome: string } | null })[]>();
    if (error) throw this.erro('Não foi possível carregar os concursos.', error);

    return (data ?? []).map(({ perfis, ...concurso }) => ({ ...concurso, dono: perfis?.nome ?? '—' }));
  }

  private erro(mensagem: string, causa: unknown): Error {
    console.error(mensagem, causa);
    return new Error(mensagem);
  }
}
