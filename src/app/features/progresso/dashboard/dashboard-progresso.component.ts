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
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ProgressBarComponent } from '../../../shared/components/progress-bar/progress-bar.component';
import { Concurso } from '../../../shared/models/concurso.model';
import { MinutosParaTempoPipe } from '../../../shared/pipes/minutos-para-tempo.pipe';
import { ConcursosService } from '../../concursos/concursos.service';
import { DashboardProgresso, ProgressoService } from '../progresso.service';

/** Raio do donut (viewBox 120×120) e sua circunferência. */
const RAIO = 52;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO;

@Component({
  selector: 'app-dashboard-progresso',
  imports: [
    DatePipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    EmptyStateComponent,
    ProgressBarComponent,
    MinutosParaTempoPipe,
  ],
  templateUrl: './dashboard-progresso.component.html',
  styleUrl: './dashboard-progresso.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardProgressoComponent implements OnInit {
  /** `:id` da rota — concurso. */
  readonly id = input.required<string>();

  private readonly concursosService = inject(ConcursosService);
  private readonly progressoService = inject(ProgressoService);

  protected readonly raio = RAIO;
  protected readonly circunferencia = CIRCUNFERENCIA;

  protected readonly concurso = signal<Concurso | null>(null);
  protected readonly dados = signal<DashboardProgresso | null>(null);
  protected readonly carregando = signal(true);
  protected readonly erro = signal<string | null>(null);

  protected readonly desvioDonut = computed(
    () => CIRCUNFERENCIA * (1 - (this.dados()?.percentual ?? 0) / 100),
  );

  protected readonly maxDia = computed(() =>
    Math.max(1, ...(this.dados()?.ultimosDias.map((d) => d.quantidade) ?? [0])),
  );

  protected readonly itensNos14Dias = computed(() =>
    (this.dados()?.ultimosDias ?? []).reduce((s, d) => s + d.quantidade, 0),
  );

  ngOnInit(): void {
    void this.carregar();
  }

  protected async carregar(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);
    try {
      const [concurso, dados] = await Promise.all([
        this.concursosService.obter(this.id()),
        this.progressoService.carregar(this.id()),
      ]);
      this.concurso.set(concurso);
      this.dados.set(dados);
    } catch (e) {
      this.erro.set(e instanceof Error ? e.message : 'Erro inesperado ao carregar o progresso.');
    } finally {
      this.carregando.set(false);
    }
  }

  protected altura(quantidade: number): number {
    return (quantidade / this.maxDia()) * 100;
  }

  protected ehHoje(data: Date): boolean {
    return data.toDateString() === new Date().toDateString();
  }
}
