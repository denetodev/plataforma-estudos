import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';

import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { Concurso } from '../../../shared/models/concurso.model';
import { Item, TIPOS_ITEM } from '../../../shared/models/item.model';
import { DiaSemanaPipe } from '../../../shared/pipes/dia-semana.pipe';
import { MinutosParaTempoPipe } from '../../../shared/pipes/minutos-para-tempo.pipe';
import { ConcursosService } from '../../concursos/concursos.service';
import { PlanoService } from '../../plano/plano.service';
import { Cronograma, CronogramaService, SemanaAgenda } from '../cronograma.service';

@Component({
  selector: 'app-cronograma-semanal',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule,
    EmptyStateComponent,
    ProgressBarComponent,
    DiaSemanaPipe,
    MinutosParaTempoPipe,
  ],
  templateUrl: './cronograma-semanal.component.html',
  styleUrl: './cronograma-semanal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CronogramaSemanalComponent implements OnInit {
  /** `:id` da rota — concurso. */
  readonly id = input.required<string>();

  private readonly concursosService = inject(ConcursosService);
  private readonly cronogramaService = inject(CronogramaService);
  private readonly planoService = inject(PlanoService);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly concurso = signal<Concurso | null>(null);
  protected readonly cronograma = signal<Cronograma | null>(null);
  protected readonly indice = signal(0);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  protected readonly semanas = computed(() => this.cronograma()?.semanas ?? []);
  protected readonly semana = computed<SemanaAgenda | null>(() => this.semanas()[this.indice()] ?? null);
  protected readonly indiceHoje = computed(() => this.encontrarSemanaAtual(this.semanas()));

  protected readonly totais = computed(() => {
    const itens = (this.semana()?.dias ?? []).flatMap((d) => d.itens);
    const concluidos = itens.filter((i) => i.concluido).length;
    return {
      total: itens.length,
      concluidos,
      percentual: itens.length > 0 ? Math.round((concluidos / itens.length) * 100) : 0,
    };
  });

  ngOnInit(): void {
    void this.carregar();
  }

  protected async carregar(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const [concurso, cronograma] = await Promise.all([
        this.concursosService.obter(this.id()),
        this.cronogramaService.carregar(this.id()),
      ]);
      this.concurso.set(concurso);
      this.cronograma.set(cronograma);
      this.indice.set(Math.max(0, this.encontrarSemanaAtual(cronograma.semanas)));
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Erro inesperado ao carregar o cronograma.');
    } finally {
      this.carregando.set(false);
    }
  }

  protected anterior(): void {
    this.indice.update((i) => Math.max(0, i - 1));
  }

  protected proxima(): void {
    this.indice.update((i) => Math.min(this.semanas().length - 1, i + 1));
  }

  protected irParaHoje(): void {
    this.indice.set(Math.max(0, this.indiceHoje()));
  }

  protected ehHoje(data: Date | null): boolean {
    return !!data && data.toDateString() === new Date().toDateString();
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
    this.cronograma.update((c) =>
      c && {
        ...c,
        semanas: c.semanas.map((s) => ({
          ...s,
          dias: s.dias.map((d) => ({
            ...d,
            itens: d.itens.map((i) => (i.id === itemId ? { ...i, concluido } : i)),
          })),
        })),
      },
    );
  }

  /** Semana que contém hoje; senão a próxima a começar; senão a última. -1 se não houver semanas. */
  private encontrarSemanaAtual(semanas: SemanaAgenda[]): number {
    if (semanas.length === 0) return -1;
    const hoje = new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const atual = semanas.findIndex((s) => s.inicio <= inicioHoje && inicioHoje <= s.fim);
    if (atual >= 0) return atual;
    const proxima = semanas.findIndex((s) => s.inicio > inicioHoje);
    return proxima >= 0 ? proxima : semanas.length - 1;
  }
}
