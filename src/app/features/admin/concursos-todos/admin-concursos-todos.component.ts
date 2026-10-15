import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { isoParaData } from '../../../shared/utils/data';
import { AdminService, ConcursoComDono } from '../admin.service';

@Component({
  selector: 'app-admin-concursos-todos',
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule, EmptyStateComponent],
  templateUrl: './admin-concursos-todos.component.html',
  styleUrl: './admin-concursos-todos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminConcursosTodosComponent {
  private readonly adminService = inject(AdminService);

  protected readonly concursos = signal<ConcursoComDono[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);
  protected readonly busca = signal('');

  protected readonly filtrados = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    if (!termo) return this.concursos();
    return this.concursos().filter((c) =>
      [c.nome, c.orgao, c.cargo, c.dono].some((campo) => campo?.toLowerCase().includes(termo)),
    );
  });

  protected readonly paraData = isoParaData;

  constructor() {
    void this.carregar();
  }

  protected async carregar(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      this.concursos.set(await this.adminService.listarConcursos());
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Erro inesperado ao carregar os concursos.');
    } finally {
      this.carregando.set(false);
    }
  }

  protected subtitulo(concurso: ConcursoComDono): string {
    return [concurso.orgao, concurso.cargo].filter(Boolean).join(' · ') || 'Sem órgão/cargo';
  }

  protected buscar(evento: Event): void {
    this.busca.set((evento.target as HTMLInputElement).value);
  }
}
