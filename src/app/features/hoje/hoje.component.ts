import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';

import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { Item, TIPOS_ITEM } from '../../shared/models/item.model';
import { MinutosParaTempoPipe } from '../../shared/pipes/minutos-para-tempo.pipe';
import { PlanoService } from '../plano/plano.service';
import { GrupoHoje, HojeService } from './hoje.service';

@Component({
  selector: 'app-hoje',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    EmptyStateComponent,
    ProgressBarComponent,
    MinutosParaTempoPipe,
  ],
  templateUrl: './hoje.component.html',
  styleUrl: './hoje.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HojeComponent {
  private readonly hojeService = inject(HojeService);
  private readonly planoService = inject(PlanoService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly hoje = new Date();
  protected readonly grupos = signal<GrupoHoje[]>([]);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  private readonly todosItens = computed(() =>
    this.grupos().flatMap((g) => g.blocos.flatMap((b) => b.itens)),
  );
  protected readonly total = computed(() => this.todosItens().length);
  protected readonly concluidos = computed(() => this.todosItens().filter((i) => i.concluido).length);
  protected readonly percentual = computed(() =>
    this.total() > 0 ? Math.round((this.concluidos() / this.total()) * 100) : 0,
  );
  protected readonly minutosRestantes = computed(() =>
    this.todosItens()
      .filter((i) => !i.concluido)
      .reduce((s, i) => s + (i.duracao_min ?? 0), 0),
  );

  constructor() {
    void this.carregar();
  }

  protected async carregar(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      this.grupos.set(await this.hojeService.carregar());
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Erro inesperado ao carregar o dia.');
    } finally {
      this.carregando.set(false);
    }
  }

  protected tipo(valor: Item['tipo']) {
    return TIPOS_ITEM.find((t) => t.valor === valor) ?? null;
  }

  protected async alternarItem(item: Item, concluido: boolean): Promise<void> {
    this.definirConcluido(item.id, concluido);
    try {
      await this.planoService.marcarItem(item.id, concluido);
    } catch (e) {
      this.definirConcluido(item.id, !concluido);
      this.snackBar.open(e instanceof Error ? e.message : 'Não foi possível salvar o progresso.', 'Fechar', {
        duration: 6000,
      });
    }
  }

  private definirConcluido(itemId: string, concluido: boolean): void {
    this.grupos.update((grupos) =>
      grupos.map((g) => ({
        ...g,
        blocos: g.blocos.map((b) => ({
          ...b,
          itens: b.itens.map((i) => (i.id === itemId ? { ...i, concluido } : i)),
        })),
      })),
    );
  }
}
