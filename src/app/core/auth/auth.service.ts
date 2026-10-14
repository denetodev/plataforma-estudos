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
