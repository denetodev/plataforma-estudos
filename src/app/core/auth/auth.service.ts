import { Injectable, computed, inject, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';

import { Perfil } from '../../shared/models/perfil.model';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService);

  readonly user = signal<User | null>(null);
  readonly perfil = signal<Perfil | null>(null);
  readonly loading = signal(true);

  readonly autenticado = computed(() => this.user() !== null);
  readonly isAdmin = computed(() => this.perfil()?.role === 'admin');

  private perfilEmCarga: Promise<void> | null = null;
  private resolverPronto!: () => void;
  private readonly pronto = new Promise<void>((resolve) => (this.resolverPronto = resolve));

  constructor() {
    this.supabase.auth.onAuthStateChange((evento, sessao) => {
      this.user.set(sessao?.user ?? null);

      // Não fazer chamadas ao Supabase dentro do callback (trava o lock interno do auth-js).
      setTimeout(async () => {
        if (!sessao) {
          this.perfil.set(null);
        } else if (evento === 'INITIAL_SESSION' || evento === 'SIGNED_IN') {
          await this.carregarPerfil();
        }
        if (evento === 'INITIAL_SESSION') {
          this.loading.set(false);
          this.resolverPronto();
        }
      }, 0);
    });
  }

  /** Resolve quando a sessão inicial (e o perfil) já foram restaurados. */
  aguardarPronto(): Promise<void> {
    return this.pronto;
  }

  /** Retorna `null` em caso de sucesso ou a mensagem de erro em português. */
  async login(email: string, senha: string): Promise<string | null> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      return this.traduzirErro(error.message);
    }
    await this.carregarPerfil();
    return null;
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    this.user.set(null);
    this.perfil.set(null);
  }

  /** Atualiza o nome do usuário logado. Retorna `null` em sucesso ou a mensagem de erro. */
  async atualizarNome(nome: string): Promise<string | null> {
    const id = this.user()?.id;
    if (!id) return 'Sua sessão expirou. Entre novamente.';

    const { error } = await this.supabase.client
      .from('perfis')
      .update({ nome, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      console.error('Erro ao atualizar o nome', error);
      return 'Não foi possível salvar o nome.';
    }
    this.perfil.update((p) => (p ? { ...p, nome } : p));
    return null;
  }

  /** Troca a senha do usuário logado (também usada no fluxo de recuperação). */
  async alterarSenha(novaSenha: string): Promise<string | null> {
    const { error } = await this.supabase.auth.updateUser({ password: novaSenha });
    if (!error) return null;

    const m = error.message.toLowerCase();
    if (m.includes('different') || m.includes('same')) return 'A nova senha deve ser diferente da atual.';
    if (m.includes('at least') || m.includes('weak') || m.includes('short')) {
      return 'Senha muito fraca. Use pelo menos 8 caracteres.';
    }
    return this.erroGenerico(error.message, 'Não foi possível alterar a senha. Tente novamente.');
  }

  /** Envia o e-mail de recuperação. O link volta para /redefinir-senha. */
  async enviarRecuperacaoSenha(email: string): Promise<string | null> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    if (!error) return null;

    const m = error.message.toLowerCase();
    if (m.includes('rate limit') || m.includes('too many') || m.includes('seconds')) {
      return 'Muitas tentativas. Aguarde alguns instantes e tente novamente.';
    }
    return this.erroGenerico(error.message, 'Não foi possível enviar o e-mail. Tente novamente.');
  }

  carregarPerfil(): Promise<void> {
    this.perfilEmCarga ??= this.buscarPerfil().finally(() => (this.perfilEmCarga = null));
    return this.perfilEmCarga;
  }

  private async buscarPerfil(): Promise<void> {
    const { data } = await this.supabase.auth.getUser();
    const usuario = data.user;
    if (!usuario) {
      this.perfil.set(null);
      return;
    }
    const { data: perfil, error } = await this.supabase.client
      .from('perfis')
      .select('*')
      .eq('id', usuario.id)
      .maybeSingle<Perfil>();

    if (error) {
      console.error('Erro ao carregar perfil', error);
    }
    this.perfil.set(perfil ?? null);
  }

  private erroGenerico(mensagem: string, padrao: string): string {
    const m = mensagem.toLowerCase();
    return m.includes('failed to fetch') || m.includes('network')
      ? 'Não foi possível conectar ao servidor. Verifique sua conexão.'
      : padrao;
  }

  private traduzirErro(mensagem: string): string {
    const m = mensagem.toLowerCase();
    if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
    if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
    if (m.includes('rate limit') || m.includes('too many')) {
      return 'Muitas tentativas. Aguarde alguns instantes e tente novamente.';
    }
    if (m.includes('failed to fetch') || m.includes('network')) {
      return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
    }
    return 'Não foi possível entrar. Tente novamente.';
  }
}
